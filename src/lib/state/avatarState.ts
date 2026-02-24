import { writable, derived, get, type Readable } from 'svelte/store';

export type AvatarState = 'IDLE' | 'THINKING' | 'BUBBLE_REPLY' | 'VOICE_PREP' | 'SPEAKING' | 'COOLDOWN';
export type ReplyMode = 'auto' | 'voice' | 'bubble';
export type Emotion = 'neutral' | 'happy' | 'excited' | 'confused' | 'sad';
export type Gesture = 'none' | 'nod' | 'wave' | 'bounce';

export type AvatarEvent =
  | {
      type: 'reply';
      mode: 'voice' | 'bubble';
      text: string;
      emotion?: Emotion;
      gesture?: Gesture;
      duration_ms?: number;
      priority?: number;
    }
  | { type: 'set_emotion'; emotion: Emotion }
  | { type: 'set_mode'; value: ReplyMode }
  | { type: 'interrupt' }
  | { type: 'clear_queue' };

export interface UiSnapshot {
  state: AvatarState;
  mode: ReplyMode;
  subtitle: string;
  bubble: string;
  emotion: Emotion;
  gesture: Gesture;
  isThinking: boolean;
  queue: AvatarEvent[];
}

const state = writable<AvatarState>('IDLE');
const mode = writable<ReplyMode>('auto');
const subtitle = writable('');
const bubble = writable('');
const emotion = writable<Emotion>('neutral');
const gesture = writable<Gesture>('none');
const isThinking = writable(false);
const queue = writable<AvatarEvent[]>([]);
const active = writable<AvatarEvent | null>(null);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let loopStarted = false;
let cancelToken = 0;

function chooseReplyMode(evt: Extract<AvatarEvent, { type: 'reply' }>): 'voice' | 'bubble' {
  const current = get(mode);
  if (current === 'auto') {
    return evt.priority && evt.priority >= 2 ? 'voice' : evt.text.length > 64 ? 'voice' : 'bubble';
  }
  return current;
}

function estimateSpeechMs(text: string) {
  return Math.max(1200, Math.min(9000, text.length * 60));
}

export const ui: Readable<UiSnapshot> = derived(
  [state, mode, subtitle, bubble, emotion, gesture, isThinking, queue],
  ([$state, $mode, $subtitle, $bubble, $emotion, $gesture, $isThinking, $queue]) => ({
    state: $state,
    mode: $mode,
    subtitle: $subtitle,
    bubble: $bubble,
    emotion: $emotion,
    gesture: $gesture,
    isThinking: $isThinking,
    queue: $queue
  })
);

export function enqueue(evt: AvatarEvent) {
  if (evt.type === 'interrupt') {
    interrupt();
    return;
  }

  if (evt.type === 'clear_queue') {
    queue.set([]);
    return;
  }

  if (evt.type === 'set_mode') {
    mode.set(evt.value);
    return;
  }

  if (evt.type === 'set_emotion') {
    emotion.set(evt.emotion);
    return;
  }

  queue.update((items) => {
    const next = [...items, evt];
    return next.sort((a, b) => (b.type === 'reply' ? b.priority ?? 0 : 0) - (a.type === 'reply' ? a.priority ?? 0 : 0));
  });
  startLoop();
}

export function interrupt() {
  cancelToken += 1;
  active.set(null);
  subtitle.set('');
  bubble.set('');
  isThinking.set(false);
  state.set('IDLE');
}

function startLoop() {
  if (loopStarted) return;
  loopStarted = true;

  (async () => {
    while (true) {
      if (get(active)) {
        await sleep(50);
        continue;
      }

      const next = get(queue)[0];
      if (!next) {
        await sleep(120);
        continue;
      }
      queue.update((items) => items.slice(1));
      active.set(next);
      const token = ++cancelToken;
      await processEvent(next, token);
      if (token === cancelToken) {
        active.set(null);
      }
    }
  })();
}

async function processEvent(evt: AvatarEvent, token: number) {
  if (evt.type !== 'reply') return;

  state.set('THINKING');
  isThinking.set(true);
  await sleep(500);
  if (token !== cancelToken) return;

  const chosenMode = chooseReplyMode(evt);
  emotion.set(evt.emotion ?? 'neutral');
  gesture.set(evt.gesture ?? 'none');
  isThinking.set(false);

  if (chosenMode === 'bubble') {
    state.set('BUBBLE_REPLY');
    subtitle.set('');
    bubble.set(evt.text);
    await sleep(evt.duration_ms ?? Math.max(1800, Math.min(5500, evt.text.length * 45)));
    if (token !== cancelToken) return;
    bubble.set('');
  } else {
    state.set('VOICE_PREP');
    bubble.set('');
    await sleep(280);
    if (token !== cancelToken) return;

    state.set('SPEAKING');
    subtitle.set(evt.text);
    await sleep(estimateSpeechMs(evt.text));
    if (token !== cancelToken) return;
    subtitle.set('');
  }

  state.set('COOLDOWN');
  await sleep(300);
  if (token !== cancelToken) return;

  gesture.set('none');
  state.set('IDLE');
}

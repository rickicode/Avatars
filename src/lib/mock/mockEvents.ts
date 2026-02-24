import type { AvatarEvent } from '../state/avatarState';

const samples: AvatarEvent[] = [
  { type: 'reply', mode: 'bubble', text: 'Wkwk iya bener juga 😄', emotion: 'happy', gesture: 'nod', duration_ms: 2800, priority: 1 },
  { type: 'reply', mode: 'voice', text: 'Halo semuanya, makasih udah datang! Hari ini kita siap seru-seruan bareng ya!', emotion: 'excited', gesture: 'wave', priority: 2 },
  { type: 'reply', mode: 'voice', text: 'Ini contoh subtitle panjang yang otomatis wrap supaya tetap nyaman dibaca meskipun kalimatnya cukup panjang banget untuk satu baris.', emotion: 'neutral', gesture: 'nod', priority: 2 }
];

export function generateRapidQueue(): AvatarEvent[] {
  return [
    samples[0],
    { type: 'reply', mode: 'bubble', text: 'Aku baca chat dulu ya~', emotion: 'happy', gesture: 'bounce', priority: 1 },
    samples[1],
    { type: 'reply', mode: 'bubble', text: 'Sabar bentar, aku mikir dulu 🤔', emotion: 'confused', gesture: 'nod', priority: 1 }
  ];
}

export function scriptedDemoSequence(): AvatarEvent[] {
  return [
    { type: 'set_mode', value: 'auto' },
    ...generateRapidQueue(),
    samples[2]
  ];
}

export { samples };

<script lang="ts">
  import type { AvatarEvent, ReplyMode } from '../state/avatarState';
  export let onSend: (evt: AvatarEvent) => void;
  export let onBurst: () => void;
  export let onSequence: () => void;
  export let onInterrupt: () => void;
  export let onClearQueue: () => void;
  export let mode: ReplyMode = 'auto';
</script>

<div class="panel">
  <div class="row">
    <button on:click={() => onSend({ type: 'reply', mode: 'bubble', text: 'Haii~ aku seneng kamu di sini!', emotion: 'happy', gesture: 'nod', duration_ms: 2600, priority: 1 })}>Bubble happy</button>
    <button on:click={() => onSend({ type: 'reply', mode: 'voice', text: 'Halo semuanya! Seneng banget ketemu kalian lagi.', emotion: 'excited', gesture: 'wave', priority: 2 })}>Voice excited</button>
  </div>
  <div class="row">
    <button on:click={onBurst}>Rapid queue</button>
    <button on:click={onInterrupt}>Interrupt</button>
    <button on:click={onClearQueue}>Clear Queue</button>
  </div>
  <div class="row">
    <button on:click={() => onSend({ type: 'set_mode', value: 'auto' })} class:active={mode === 'auto'}>AUTO</button>
    <button on:click={() => onSend({ type: 'set_mode', value: 'bubble' })} class:active={mode === 'bubble'}>BUBBLE</button>
    <button on:click={() => onSend({ type: 'set_mode', value: 'voice' })} class:active={mode === 'voice'}>VOICE</button>
    <button on:click={onSequence}>Demo sequence</button>
  </div>
</div>

<style>
  .panel {
    position: absolute;
    left: 1rem;
    bottom: 1rem;
    z-index: 20;
    background: #fffffff5;
    border: 1px solid #d9d9ff;
    border-radius: 16px;
    padding: 0.7rem;
    display: grid;
    gap: 0.45rem;
    width: min(560px, calc(100vw - 2rem));
  }
  .row { display: flex; flex-wrap: wrap; gap: .4rem; }
  .active { background: #8d75d9; color: white; }
</style>

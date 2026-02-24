<script lang="ts">
  import { onMount } from 'svelte';
  import { AvatarEngine } from '../lib/avatar/AvatarEngine';
  import { enqueue, ui } from '../lib/state/avatarState';
  import { WSClient } from '../lib/ws/wsClient';
  import { appConfig } from '../lib/config/env';
  import SubtitleBar from '../lib/components/SubtitleBar.svelte';
  import ChatBubble from '../lib/components/ChatBubble.svelte';
  import StatusBadge from '../lib/components/StatusBadge.svelte';
  import DebugPanel from '../lib/components/DebugPanel.svelte';
  import { generateRapidQueue, scriptedDemoSequence } from '../lib/mock/mockEvents';

  let mountEl: HTMLDivElement;
  let engine: AvatarEngine;
  let wsStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  let showDebug = true;
  const themes = appConfig.themes;
  let selectedThemeId =
    themes.find((theme) => theme.id === appConfig.defaultThemeId)?.id ?? themes[0]?.id ?? 'studio-pastel';

  $: activeTheme = themes.find((theme) => theme.id === selectedThemeId) ?? themes[0];

  const ws = new WSClient();

  onMount(() => {
    engine = new AvatarEngine(mountEl, appConfig.modelUrl);
    ws.onEvent = (evt) => enqueue(evt);
    ws.onStatus = (status) => (wsStatus = status);
    ws.connect();

    const unsub = ui.subscribe(($ui) => {
      engine?.updateFromState({ state: $ui.state, emotion: $ui.emotion, gesture: $ui.gesture });
    });

    return () => {
      ws.disconnect();
      unsub();
      engine.dispose();
    };
  });

  function sendBurst() {
    generateRapidQueue().forEach(enqueue);
  }

  function demoSequence() {
    scriptedDemoSequence().forEach(enqueue);
  }
</script>

<div class="page" style={`--app-bg:${activeTheme.css};`}>
  <div class="canvas" bind:this={mountEl}></div>

  <div class="badge-row">
    <StatusBadge label="STATE" value={$ui.state} />
    <StatusBadge label="MODE" value={$ui.mode.toUpperCase()} />
    <StatusBadge label="WS" value={wsStatus.toUpperCase()} />
    <button on:click={() => (showDebug = !showDebug)}>{showDebug ? 'Hide' : 'Show'} debug</button>
    <select bind:value={selectedThemeId}>
      {#each themes as theme}
        <option value={theme.id}>{theme.name}</option>
      {/each}
    </select>
  </div>

  <ChatBubble text={$ui.bubble} thinking={$ui.isThinking && !$ui.subtitle} />
  <SubtitleBar text={$ui.subtitle} />

  {#if showDebug}
    <DebugPanel
      mode={$ui.mode}
      onSend={enqueue}
      onBurst={sendBurst}
      onSequence={demoSequence}
      onInterrupt={() => enqueue({ type: 'interrupt' })}
      onClearQueue={() => enqueue({ type: 'clear_queue' })}
    />
  {/if}

  <aside class="queue">
    <h4>Queue ({$ui.queue.length})</h4>
    {#if !$ui.queue.length}
      <p>Empty.</p>
    {:else}
      {#each $ui.queue as item, i}
        <p>{i + 1}. {item.type === 'reply' ? `${item.mode}: ${item.text.slice(0, 44)}` : item.type}</p>
      {/each}
    {/if}
  </aside>
</div>

<style>
  .page {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: var(--app-bg);
    transition: background 280ms ease;
  }
  .canvas {
    position: absolute;
    inset: 0;
  }
  .badge-row {
    position: absolute;
    top: 1rem;
    left: 1rem;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: .45rem;
    z-index: 10;
  }
  .queue {
    position: absolute;
    right: 1rem;
    bottom: 1rem;
    z-index: 10;
    width: 270px;
    max-height: 220px;
    overflow: auto;
    border-radius: 14px;
    border: 1px solid #dadcff;
    background: #ffffffda;
    padding: .7rem .8rem;
    font-size: .85rem;
  }
  .queue h4 { margin: 0 0 .35rem 0; }
  .queue p { margin: .28rem 0; }

  select {
    border: 1px solid #d8d7ff;
    border-radius: 999px;
    padding: .42rem .75rem;
    background: #ffffffd9;
    color: #433f77;
  }
</style>

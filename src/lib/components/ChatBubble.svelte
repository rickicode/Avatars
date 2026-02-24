<script lang="ts">
  export let text = '';
  export let thinking = false;
</script>

{#if text || thinking}
  <div class="bubble">
    {#if thinking}
      <span class="dots"><i></i><i></i><i></i></span>
    {:else}
      {text}
    {/if}
  </div>
{/if}

<style>
  .bubble {
    position: absolute;
    right: 8%;
    top: 19%;
    max-width: 330px;
    background: #ffffffee;
    border: 1px solid #e0dcff;
    border-radius: 18px;
    padding: 0.8rem 0.95rem;
    line-height: 1.4;
    box-shadow: 0 12px 28px #8f81d22e;
    animation: pop 0.25s ease;
  }
  .dots i {
    width: 8px;
    height: 8px;
    margin-right: 6px;
    border-radius: 50%;
    display: inline-block;
    background: #9f8bdc;
    animation: b 1.1s infinite;
  }
  .dots i:nth-child(2) { animation-delay: 0.2s; }
  .dots i:nth-child(3) { animation-delay: 0.35s; }
  @keyframes b { 0%, 100% { transform: translateY(0); opacity: .4; } 50% { transform: translateY(-4px); opacity: 1; } }
  @keyframes pop { from { opacity: 0; transform: scale(.92); } to { opacity: 1; transform: scale(1); } }
</style>

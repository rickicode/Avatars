<script lang="ts">
  export let text = '';
</script>

{#if text}
  <div class="subtitle">{text}</div>
{/if}

<style>
  .subtitle {
    position: absolute;
    left: 50%;
    bottom: 1rem;
    transform: translateX(-50%);
    width: min(920px, calc(100vw - 2rem));
    background: #ffffffdb;
    border: 1px solid #d7dbff;
    border-radius: 14px;
    padding: 0.75rem 1rem;
    text-align: center;
    font-weight: 550;
    box-shadow: 0 12px 30px #9b8ce138;
    animation: rise 0.2s ease;
  }
  @keyframes rise { from { opacity: 0; transform: translate(-50%, 10px); } to { opacity: 1; transform: translate(-50%, 0); } }
</style>

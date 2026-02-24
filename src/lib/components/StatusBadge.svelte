<script lang="ts">
  export let label = '';
  export let value = '';
</script>

<div class="badge"><strong>{label}</strong> {value}</div>

<style>
  .badge {
    display: inline-flex;
    gap: .4rem;
    border-radius: 999px;
    padding: .35rem .7rem;
    background: #ffffffd9;
    border: 1px solid #d8d7ff;
    font-size: 0.8rem;
  }
</style>

<script lang="ts">
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";

  export let message = ''
  export let time: number = 4000

  let display = true

  onMount(() => setTimeout(() => display = false, time))
</script>

{#if display}
  <article in:fly={{x: -300}} out:fly={{x: -300}}>
    {message}
  </article>
{/if}


<style>
  article {
    position: absolute;
    left: 50px;
    top: 80px;
  }
</style>
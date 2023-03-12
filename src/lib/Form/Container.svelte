<script lang="ts">
  import NewGame from './Containers/NewGame.svelte'
  import LoadGame from './Containers/LoadGame.svelte'

  import { activeForm } from './stores'

  export let isFormValid: boolean

  let isNewGameFormValid: boolean
  let isLoadGameFormValid: boolean

  $: isFormValid =
    (isNewGameFormValid && $activeForm === 'newgame') ||
    (isLoadGameFormValid && $activeForm === 'loadgame')
</script>

<div class="form-overflow-container">
  {#if $activeForm === 'newgame'}
    <NewGame bind:isNewGameFormValid />
  {:else if $activeForm === 'loadgame'}
    <LoadGame bind:isLoadGameFormValid />
  {/if}
</div>

<style>
  .form-overflow-container {
    position: relative;
    overflow: hidden;
    margin-left: auto;
    margin-right: auto;
    width: 500px;
    height: min-content;
    display: grid;
  }
</style>

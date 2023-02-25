<script lang="ts">
  import { flip } from "svelte/animate"
  import { crossfade } from "svelte/transition"
  import { STATE } from "../../stores"
  import { pendingGameToLoad } from "./stores"

  export let isFormValid: boolean = false

  const [send, receive] = crossfade({})

  function handleClick(e) {
    if (isFormValid) {
      STATE.set($pendingGameToLoad ? 'loadgame' : 'newgame')
    }
  }

</script>
{#each [1] as i (i)}
  <div in:receive="{{key: 1}}"
       out:send="{{key: 1}}" 
       animate:flip 
       class="c_begin-game-btn">
    <button on:click={handleClick} 
            class="begin-game-btn {isFormValid ? '' : 'disabled'}"
            disabled="{isFormValid ? false : true}">Start!</button>
  </div>
{/each}

<style>
  .begin-game-btn, .c_begin-game-btn {
    display: grid;
    border-radius: 7px;
  }

  .begin-game-btn {
    margin-top: 10px;
  }

  .begin-game-btn.disabled {
    background: rgb(192, 192, 192);
    cursor: default;
    border: 1px solid white;
  }
</style>
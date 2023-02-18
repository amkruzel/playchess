<script lang="ts">
  import { STATE } from "../../stores"
  import { pendingGameToLoad } from "./stores";

  export let isFormValid: boolean = false

  function handleClick(e) {
    if (isFormValid) {
      STATE.set($pendingGameToLoad ? 'loadgame' : 'newgame')
    }
  }

</script>

<div class="c_begin-game-btn">
  <button on:click={handleClick} class="begin-game-btn {isFormValid ? '' : 'disabled'}">Start!</button>
</div>

<style>
  .begin-game-btn, .c_begin-game-btn {
    display: grid;
    border-radius: 7px;
  }

  .begin-game-btn.disabled {
    background: rgb(192, 192, 192);
    text-decoration: line-through;
    cursor: default;
  }
</style>
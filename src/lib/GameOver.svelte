<script lang="ts">
  import { fly } from "svelte/transition"
  import { CURRENT_GAME, IS_CHECKMATE, STATE } from "../stores";

  const hasPlayerWon = $CURRENT_GAME.playerViewColor === $CURRENT_GAME.winner

  function handleClick(e) {
    STATE.set('form')
    IS_CHECKMATE.set(false)

    const btn = document.querySelector(`[data-name="${e.target.dataset.btnName}game"]`) as Maybe<HTMLButtonElement>
    btn?.click()
  }

</script>

<dialog open>
  <article in:fly="{{y: -900, delay: 100, duration: 250}}" out:fly="{{y: -900}}">
    <h3>Game over!</h3>
    <p>
      {hasPlayerWon ? 'You have won!' : 'You have lost.'} 
      <br /><br /> 
      You can begin a new game or load an existing game with the buttons below.
    </p>
    <footer>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div role="button" class="outline" on:click={handleClick} data-btn-name="new">New Game</div>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div role="button" class="outline "on:click={handleClick} data-btn-name="load">Load Game</div>
    </footer>
  </article>
</dialog>
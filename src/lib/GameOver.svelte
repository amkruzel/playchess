<script lang="ts">
  import { fly } from 'svelte/transition'
  import { CURRENT_GAME, SHOW_GAMEOVER_MODAL, STATE } from '../stores'

  import type { Maybe } from '../scripts/chess'

  export let gameOverModalShouldBeVisible: boolean

  const hasPlayerWon =
    $CURRENT_GAME.info.playerColor === $CURRENT_GAME.info.winner

  function handleClick(e) {
    STATE.set('form')
    SHOW_GAMEOVER_MODAL.set(false)

    const btn = document.querySelector(
      `[data-name="${e.target.dataset.btnName}game"]`
    ) as Maybe<HTMLButtonElement>
    btn?.click()
  }

  function checkToCloseModal(e) {
    const t = e.target
    if (!t.dataset.modal || t.classList.includes('close'))
      gameOverModalShouldBeVisible = !gameOverModalShouldBeVisible
  }
</script>

<dialog on:click|preventDefault={checkToCloseModal} open>
  <article
    in:fly={{ y: -900, delay: 100, duration: 250 }}
    out:fly={{ y: -900 }}
    data-modal="modal"
  >
    <a href="#" aria-label="Close" class="close" />
    <h3>Game over!</h3>
    <p>
      {hasPlayerWon ? 'You have won! 🎉' : 'You have lost. 😔'}
    </p>
    <footer>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        role="button"
        class="outline"
        on:click={handleClick}
        data-btn-name="new"
      >
        New Game
      </div>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        role="button"
        class="outline "
        on:click={handleClick}
        data-btn-name="load"
      >
        Load Game
      </div>
    </footer>
  </article>
</dialog>

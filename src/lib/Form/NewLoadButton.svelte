<script lang="ts">
  import { activeForm } from "./stores"

  function handleClick(e) {
    const btn = e.target
  
    if (btn === null || !(btn instanceof HTMLButtonElement)) return
    if (btn.tagName !== 'BUTTON') return
    
    const btnName = btn.dataset.name as Maybe<'newgame' | 'loadgame'>

    activeForm.update(currentForm => {
      if (currentForm === null) {
        // first load forms
      } else {
        // hide current form
      }
      return btnName
    })
/*
    if (!ACTIVE_FORM) {
      const form: Maybe<HTMLFormElement> = document.querySelector(`[data-name="${btnName}form"`)
      if (form === null) return elementNotFoundError('Form', `[data-name="${btnName}form"`)

      activateBtn(btn)
      activateForm(form)
    } else {
      toggleButtons()
      toggleForms()
    }

    evaluateForm()*/
  }

</script>

<div class="new-load-game-toggle">
  <button on:click={handleClick} class="{$activeForm === 'newgame' ? 'active' : ''}" data-name="newgame" data-active="false">
    New Game
  </button>
  <button on:click={handleClick} class="{$activeForm === 'loadgame' ? 'active' : ''}" data-name="loadgame" data-active="false">
    Load Game
  </button>
</div>

<style>
  .new-load-game-toggle {
    display: grid;
    border-radius: 7px;
    grid-auto-flow: column;
    border: 2px solid var(--blue-background);
  }

  .new-load-game-toggle button {
    background: none;
    color: var(--blue-background);
  }

  .new-load-game-toggle button.active {
    background: linear-gradient(#1979ff, var(--blue-background));
    color: var(--white-color)
  }

  .new-load-game-toggle button:hover {
    filter: brightness(1.2);
    text-decoration: underline;
  }
</style>
<script lang="ts">
  import { slide, fly } from 'svelte/transition'
  import { onDestroy } from 'svelte'

  import {
    activeForm,
    opponent,
    color,
    localOrOnline,
    whitePlayerName,
    blackPlayerName,
  } from '../stores'

  import { currentUser } from '../../../pocketbase'

  export let isNewGameFormValid: boolean = false

  let currentUserHasFriends: boolean = false

  currentUser.subscribe(user => {
    currentUserHasFriends = user?.friends.length > 0
  })

  function clearAllFields() {
    localOrOnline.set(null)
    whitePlayerName.set(null)
    blackPlayerName.set(null)
    color.set(null)
    opponent.set(null)
  }

  const isNameFieldValid = (name: any): boolean => {
    if (!name || typeof name !== 'string') return false
    return name.length >= 4 && name.length <= 20
  }

  const evalForm = () => {
    let status = false

    if ($activeForm !== 'newgame') status = false

    if ($opponent === 'computer' && color) status = true

    if (
      $opponent === 'player' &&
      isNameFieldValid($whitePlayerName) &&
      isNameFieldValid($blackPlayerName)
    )
      status = true

    isNewGameFormValid = status
  }

  onDestroy(() => clearAllFields())
</script>

{#if $activeForm === 'newgame'}
  <form
    in:fly|local={{ x: -200 }}
    out:fly|local={{ x: -200 }}
    class="new-game-form"
    data-name="newgameform"
  >
    <fieldset class="form-item radio" data-form-item="opponent">
      <legend>
        Do you want to play against a computer or another player?
      </legend>
      <div>
        <input
          bind:group={$opponent}
          on:input={evalForm}
          type="radio"
          name="player-or-computer"
          value="player"
          id="player"
          data-has-event-listener="true"
        />
        <label for="player">Another Player</label>
      </div>
      <div>
        <input
          bind:group={$opponent}
          on:input={evalForm}
          type="radio"
          name="player-or-computer"
          value="computer"
          id="computer"
          data-has-event-listener="true"
        />
        <label for="computer">Computer</label>
      </div>
    </fieldset>

    {#if $opponent === 'player'}
      <fieldset in:slide out:slide>
        <legend> Enter the name of each player: </legend>
        <div>
          <label for="white-name">White: </label>
          <input
            bind:value={$whitePlayerName}
            on:input={evalForm}
            aria-invalid={!isNameFieldValid($whitePlayerName)}
            type="text"
            name="player-color-names-white"
            id="white-name"
            minlength="4"
            maxlength="20"
            required
          />
        </div>
        <div>
          <label for="black-name">Black: </label>
          <input
            bind:value={$blackPlayerName}
            on:input={evalForm}
            aria-invalid={!isNameFieldValid($blackPlayerName)}
            type="text"
            name="player-color-names-black"
            id="black-name"
            minlength="4"
            maxlength="20"
            required
          />
        </div>
      </fieldset>
    {/if}

    {#if $opponent === 'computer'}
      <fieldset in:slide out:slide class="form-item radio">
        <legend> What color do you want to be? </legend>
        <div>
          <input
            bind:group={$color}
            on:change={evalForm}
            type="radio"
            name="color"
            value="white"
            id="white"
          />
          <label for="white" id="white">White</label>
        </div>
        <div>
          <input
            bind:group={$color}
            on:change={evalForm}
            type="radio"
            name="color"
            value="black"
            id="black"
          />
          <label for="black" id="black">Black</label>
        </div>
        <div>
          <input
            bind:group={$color}
            on:change={evalForm}
            type="radio"
            name="color"
            value="random"
            id="random"
          />
          <label for="random" id="random">Random</label>
        </div>
      </fieldset>
    {/if}
  </form>
{/if}

<style>
  form {
    grid-column: 1/2;
    grid-row: 1/2;
  }
</style>

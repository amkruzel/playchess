<script lang="ts">
  import { slide, fly } from "svelte/transition"
  import { onDestroy, onMount } from "svelte"

  import { activeForm
         , opponent
         , color
         , localOrOnline
         , whitePlayerName
         , blackPlayerName } from "../stores"

  import { currentUser } from "../../../pocketbase";

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

  const evalForm = () => {
    let status = false

    if ($activeForm !== 'newgame') status = false

    const isNameFieldValid = (name: string | undefined): boolean => {
      if (!name) return false
      return name.length >= 4 && name.length <= 20
    }

    if ($opponent === 'computer' && color) status = true

    if (
      $opponent === 'player' && 
      isNameFieldValid($whitePlayerName) &&
      isNameFieldValid($blackPlayerName) &&
      $localOrOnline
    ) status = true 

    isNewGameFormValid = status
  }

  onDestroy(() => clearAllFields())
</script>

<form in:fly="{{x: -200}}" out:fly="{{x: -200}}" class="new-game-form" data-name="newgameform">
  <fieldset class="form-item radio" data-form-item="opponent">
    <legend>
      Do you want to play against a computer or another player?
    </legend>
    <div>
      <input bind:group={$opponent} on:input={evalForm} type="radio" name="player-or-computer" value="player" id="player" data-has-event-listener="true">
      <label for="player">Another Player</label>
    </div>
    <div>
      <input bind:group={$opponent} on:input={evalForm} type="radio" name="player-or-computer" value="computer" id="computer" data-has-event-listener="true">
      <label for="computer">Computer</label>
    </div>
  </fieldset>

  {#if $opponent === 'player'}
    <fieldset in:slide out:slide class="form-item radio" >
      <legend>
        Do you want to play online or locally?
      </legend>
      <div>
        <input bind:group={$localOrOnline} on:change={evalForm} type="radio" name="online-or-local" value="online" data-online-required="true" id="online" disabled="{currentUserHasFriends ? false : true }">
        <label for="online" id="online">Online</label>
      </div>
      <div>
        <input bind:group={$localOrOnline} on:change={evalForm} type="radio" name="online-or-local" value="local" id="local">
        <label for="local" id="local">Local</label>
      </div>
    </fieldset>
  {/if}

  {#if $localOrOnline === 'online'} 
    <fieldset in:slide out:slide>
      <legend>
        Enter the name of each player:
      </legend>
      <div>
        <label for="white-name">White: </label>
        <input bind:value={$whitePlayerName} on:change={evalForm} type="text" name="player-color-names-white" id="white-name" minlength="4" maxlength="20" required>
      </div>
      <div>
        <label for="black-name">Black: </label>
        <input bind:value={$blackPlayerName} on:change={evalForm} type="text" name="player-color-names-black" id="black-name" minlength="4" maxlength="20" required>
      </div>
    </fieldset>
  {/if}

  {#if $opponent === 'computer'}

    <fieldset in:slide out:slide class="form-item radio">
      <legend>
        What color do you want to be?
      </legend>
      <div>
        <input bind:group={$color} on:change={evalForm} type="radio" name="color" value="white" id="white">
        <label for="white" id="white">White</label>
      </div>
      <div>
        <input bind:group={$color} on:change={evalForm} type="radio" name="color" value="black" id="black">
        <label for="black" id="black">Black</label>
      </div>
      <div>
        <input bind:group={$color} on:change={evalForm} type="radio" name="color" value="random" id="random">
        <label for="random" id="random">Random</label>
      </div>
    </fieldset>

  {/if}

</form>

<style>
  form {
    grid-column: 1/2;
    grid-row: 1/2;
  }
</style>
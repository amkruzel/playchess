<script lang="ts">
  import { slide, fly } from 'svelte/transition'
  import { onDestroy, onMount } from 'svelte'

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
    color.set(null)
  }

  const evalForm = () => {
    isNewGameFormValid = $activeForm === 'newgame' && !!$color
  }

  onMount(() => evalForm())

  onDestroy(() => clearAllFields())
</script>

{#if $activeForm === 'newgame'}
  <form
    in:fly={{ x: -200 }}
    out:fly={{ x: -200 }}
    class="new-game-form"
    data-name="newgameform"
  >
    <fieldset in:slide out:slide|local class="form-item radio">
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
  </form>
{/if}

<style>
  form {
    grid-column: 1/2;
    grid-row: 1/2;
  }
</style>

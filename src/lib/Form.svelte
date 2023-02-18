<script lang="ts">
  import { slide } from "svelte/transition"

  import NewLoadButton from "./Form/NewLoadButton.svelte"
  import BeginButton from "./Form/BeginButton.svelte"
  import FormsContainer from "./Form/Container.svelte";
  
  let isFormValid: boolean
</script>


<div out:slide class="empty-page-form-container">
  <NewLoadButton />
  
  <FormsContainer bind:isFormValid />

  <BeginButton {isFormValid} />
  
</div>
  <!--
  <div class="form-overflow-container" style="height: 363px;">
    <form class="new-game-form" data-name="newgameform" style="transform: translateX(-110%);">
      <fieldset class="form-item radio" data-form-item="opponent">
        <legend>
          Do you want to play against a computer or another player?
        </legend>
        <div>
          <input type="radio" name="player-or-computer" value="player" id="player" required="" data-has-event-listener="true">
          <label for="player">Another Player</label>
        </div>
        <div>
          <input type="radio" name="player-or-computer" value="computer" id="computer" required="" data-has-event-listener="true">
          <label for="computer">Computer</label>
        </div>
      </fieldset>
    </form>
    
    <form class="load-game-form" data-name="loadgameform" style="transform: translateX(0%);">
      <fieldset class="form-item radio">
        <legend>
          Do you want to play against a computer or another player?
        </legend>
        <div>
          <input type="radio" name="player-or-computer" value="player" required="" data-has-event-listener="true">
          <label for="player">Another Player</label>
        </div>
        <div>
          <input type="radio" name="player-or-computer" value="computer" required="" data-has-event-listener="true">
          <label for="computer">Computer</label>
        </div>
      </fieldset>
      <fieldset class="form-item radio" disabled="">
        <legend>
          Do you want to play online or locally?
        </legend>
        <div>
          <input type="radio" name="online-or-local" value="online" data-online-required="true" required="" data-has-event-listener="true">
          <label for="online">Online</label>
        </div>
        <div>
          <input type="radio" name="online-or-local" value="local" required="" data-has-event-listener="true">
          <label for="local">Local</label>
        </div>
      </fieldset>
      <fieldset class="form-item radio">
        <legend>
          What color do you want to be?
        </legend>
        <div>
          <input type="radio" name="color" value="white" required="" data-has-event-listener="true">
          <label for="white">White</label>
        </div>
        <div>
          <input type="radio" name="color" value="black" required="" data-has-event-listener="true">
          <label for="black">Black</label>
        </div>
        <div>
          <input type="radio" name="color" value="Random" required="" data-has-event-listener="true">
          <label for="Random">Random</label>
        </div>
      </fieldset>
    </form>
  </div>

  <div class="c_begin-game-btn">
    <button class="begin-game-btn disabled">Start!</button>
  </div>
</div>
-->


<style>
  .empty-page-form-container {
    display: grid;
    gap: 20px;
    padding: 30px;
    margin: 80px;

    transition: all 500ms;
  }

  .empty-page-form-container > div {
    display: grid;
    border-radius: 7px;
  }

  .new-game-form, 
  .load-game-form {
    display: grid;
    gap: 20px;
  }

  

  .empty-page-form-container form {
    position: absolute;
    transition: all 500ms ease;
  }

  #player-color-names div {
    display: grid;
    grid-auto-flow: column;
    grid-template-columns: 60px 200px;
    padding-top: 10px;
  }

  input:valid {
    background-color: palegreen;
  }

  input:invalid {
    background-color: lightpink;
  }

  [data-online-required="true"][disabled=true]:hover {

  }
</style>
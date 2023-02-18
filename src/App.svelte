<script lang="ts">
  import Header from './lib/Header.svelte'
  import Form from './lib/Form.svelte'
  import ChessBoard from './lib/ChessBoard.svelte'

  import { opponent
         , color
         , localOrOnline
         , whitePlayerName
         , blackPlayerName 
         , pendingGameToLoad } from "./lib/Form/stores"

  import { CURRENT_GAME, STATE, HAS_LOCAL_SAVED_GAMES } from './stores'

  import { copyGame, newGame } from './scripts/game'
  import GameInfo from './lib/GameInfo.svelte';

  let currentContent = 'form'

  STATE.subscribe(value => {
    if (value === 'loadgame') {
      CURRENT_GAME.set(copyGame($pendingGameToLoad))
    }

    if (value === 'newgame') {
      CURRENT_GAME.set(newGame($localOrOnline, $opponent, $whitePlayerName, $blackPlayerName, $color))
    }
    
    currentContent = value
  })
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Play Chess</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css?family=Roboto" rel="stylesheet" type="text/css">
</svelte:head>

<Header />

<div class="content-container">
  {#if currentContent === 'form'}
    <Form />
  {/if}

  {#if currentContent.endsWith('game')}
    <GameInfo />
    <ChessBoard game={$CURRENT_GAME} />
  {/if}

</div>

<style>
  .content-container {
    display: grid;
    grid-auto-flow: column;
    justify-items: start;
    justify-content: start;
  }
</style>
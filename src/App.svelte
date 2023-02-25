<script lang="ts">
  import '@picocss/pico'

  import { fade } from 'svelte/transition'

  import Header from './lib/Header.svelte'
  import Form from './lib/Form.svelte'
  import ChessBoard from './lib/ChessBoard.svelte'

  import { opponent
         , color
         , localOrOnline
         , whitePlayerName
         , blackPlayerName 
         , pendingGameToLoad } from "./lib/Form/stores"

  import { CURRENT_GAME, STATE, HAS_LOCAL_SAVED_GAMES, COLOR_SCHEME, SHOW_SIGN_IN_MODAL, SIGN_OUT_USER, SHOW_NON_DISRUPTIVE_POPUP, IS_CHECKMATE } from './stores'

  import { clearLoginFromLocalStorage, currentUser, login, pb } from './pocketbase'

  import { copyGame, newGame } from './scripts/game'
  import GameInfo from './lib/GameInfo.svelte'
  import { detectColorScheme } from './common'
  import CapturedPieces from './lib/CapturedPieces.svelte'
  import Login from './lib/Login.svelte';
  import { onMount } from 'svelte';
  import NonDisruptivePopup from './lib/NonDisruptivePopup.svelte';
  import GameOver from './lib/GameOver.svelte';

  export const html = document.querySelector('html')

  let loginModalShouldBeVisible: boolean
  let gameOverModalShouldBeVisible: boolean
  let nonDisruptivePopupMessages: string[] = []

  function signOut() {
    pb.authStore.clear()
    clearLoginFromLocalStorage()
  }

  detectColorScheme()
  COLOR_SCHEME.subscribe(color => {
    if (html) html.dataset.theme = color
  })

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

  function handleAuthClick() {    
    if (!$currentUser) {
      loginModalShouldBeVisible = true
    } else { signOut() }
  }

  onMount(() => {
    if (localStorage.getItem('loginInfo')) {
      const loginInfo = JSON.parse(localStorage.getItem('loginInfo'))

      if (loginInfo['username'] && loginInfo['password']) {
        const username = loginInfo['username']
        const password = loginInfo['password']

        login(username, password)
      }
    }
  })

  SHOW_SIGN_IN_MODAL.subscribe(val => {   
    if (val) handleAuthClick()
    SHOW_SIGN_IN_MODAL.set(false)
  })

  IS_CHECKMATE.subscribe(val => {
    gameOverModalShouldBeVisible = val
  })

  SIGN_OUT_USER.subscribe(val => {
    if (val) signOut()
    SIGN_OUT_USER.set(false)
  })

  SHOW_NON_DISRUPTIVE_POPUP.subscribe(str => {
    if (typeof str === 'string') nonDisruptivePopupMessages = [...nonDisruptivePopupMessages, str]
    SHOW_NON_DISRUPTIVE_POPUP.set(null)
  })
</script>

<svelte:head>
  <meta charset="utf-8" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Play Chess</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>♟</text></svg>">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true">
  <link href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;0,900;1,500;1,600;1,700;1,800;1,900&display=swap" rel="stylesheet">
  <title>Play Chess</title>
</svelte:head>

<Header />

{#if loginModalShouldBeVisible} <Login bind:loginModalShouldBeVisible /> {/if}
{#if gameOverModalShouldBeVisible} <GameOver /> {/if}

<div class="content-container">
  {#if currentContent === 'form'}
    <div in:fade out:fade>
      <Form />
    </div>
    
  {/if}

  {#if currentContent.endsWith('game')}
    <div class="main container" in:fade out:fade>
      <ChessBoard game={$CURRENT_GAME} />
      <GameInfo />
      <CapturedPieces />
    </div>
    
  {/if}

  {#each nonDisruptivePopupMessages as msg}
    <NonDisruptivePopup message={msg} />
  {/each}

</div>

<style>
  /* Indigo Light scheme (Default) */
  /* Can be forced with data-theme="light" */
  [data-theme="light"],
  :root:not([data-theme="dark"]) {
    --primary: #3949ab;
    --primary-hover: #303f9f;
    --primary-focus: rgba(57, 73, 171, 0.125);
    --primary-inverse: #FFF;
  }

  /* Indigo Dark scheme (Auto) */
  /* Automatically enabled if user has Dark mode enabled */
  @media only screen and (prefers-color-scheme: dark) {
    :root:not([data-theme]) {
      --primary: #3949ab;
      --primary-hover: #3f51b5;
      --primary-focus: rgba(57, 73, 171, 0.25);
      --primary-inverse: #FFF;
    }
  }

  /* Indigo Dark scheme (Forced) */
  /* Enabled if forced with data-theme="dark" */
  [data-theme="dark"],
  :root:not([data-theme="light"]) {
    --primary: #3949ab;
    --primary-hover: #3f51b5;
    --primary-focus: rgba(57, 73, 171, 0.25);
    --primary-inverse: #FFF;
  }

  /* Indigo (Common styles) */
  :root {
    --form-element-active-border-color: var(--primary);
    --form-element-focus-color: var(--primary-focus);
    --switch-color: var(--primary-inverse);
    --switch-checked-background-color: var(--primary);
  }
  .close {
    float: right;
  }

  .content-container {
    display: grid;
    justify-items: stretch;
  }

  .content-container > div {
    grid-column: 1/2;
    grid-row: 1/2;
    justify-self: stretch;
    display: flex;
    gap: 10px;
    flex-flow: row wrap;
    justify-content: center;
  }

</style>
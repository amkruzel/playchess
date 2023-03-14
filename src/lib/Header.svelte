<script lang="ts">
  import {
    STATE,
    HAS_LOCAL_SAVED_GAMES,
    CURRENT_GAME,
    COLOR_SCHEME,
    SHOW_NON_DISRUPTIVE_POPUP,
  } from '../stores'
  import { currentUser, pb } from '../pocketbase'

  import { setColorScheme } from '../common'
  import AboutModal from './AboutModal.svelte'
  import SettingsIcon from './Settings/SettingsIcon.svelte'

  import type { Maybe, Game } from '../scripts/chess'
  import GameInfo from './GameInfo.svelte'

  let isAboutModalOpen: boolean = false

  function clickFormButton(formName: string) {
    const btn = document.querySelector(
      `[data-name="${formName}game"]`
    ) as Maybe<HTMLButtonElement>
    btn?.click()
  }

  async function tryToSaveGame(): Promise<[number | null, string]> {
    if ($CURRENT_GAME?.info.move === 1)
      return [-2, 'The game was not saved because no moves had been made.']
    saveGameToLocalStorage()
    return await saveGameToDB()
  }

  /**
   * first string is a possible error message. null if there were no errors
   */
  function saveGameToLocalStorage() {
    if (!$CURRENT_GAME) return

    // A list of the games saved in localStorage
    const gamesList: Game[] = $HAS_LOCAL_SAVED_GAMES
      ? JSON.parse(localStorage.getItem('savedGames') as string)
      : []

    // A list to hold the new list of games to go in localStorage, starting with the current game
    let newGamesList: Game[] = [$CURRENT_GAME]

    // A list of the game IDs (so that we don't store duplicate games)
    let gameIDs: number[] = [$CURRENT_GAME.info.clientID]
    gamesList.forEach(game => {
      // The game must not be the current game and must also not have already
      // been saved (this should not be possible anyway)
      if (
        game.info.clientID !== $CURRENT_GAME.info.clientID &&
        !gameIDs.find(el => el === game.info.clientID)
      ) {
        newGamesList.push(game)
        gameIDs.push(game.info.clientID)
      }
    })
    localStorage.setItem('savedGames', JSON.stringify(newGamesList))
    localStorage.setItem('hasSavedGames', 'true')
    HAS_LOCAL_SAVED_GAMES.set(true)
  }

  /**
   * If this is being called to save a new multiplayer game,
   * $CURRENT_GAME must be initialized first
   *
   */
  async function saveGameToDB(): Promise<[number | null, string]> {
    if (!$currentUser) return [-1, 'No user logged in.']
    if (!$CURRENT_GAME) return [-1, 'No current game.']

    let returnMessage = 'Your game has been saved to your account.'
    let returnCode: null | number = null // null if it was successful, number for any error

    const currentGameString = JSON.stringify($CURRENT_GAME)
    const gameDB =
      $CURRENT_GAME.info.type === 'computer'
        ? 'singleplayerGames'
        : 'multiplayerGames'

    // Here we are searching for an existing record for this game. If one exists, we update it
    // in the try block. If one doesn't exist, we create it in the catch block.
    try {
      const gameRecord = await pb
        .collection(gameDB)
        .getFirstListItem(`gameID=${$CURRENT_GAME.info.clientID}`)
      await pb
        .collection(gameDB)
        .update(gameRecord.id, { game: currentGameString })
    } catch (err) {
      if (err.status === 404) {
        // this means the game doesn't exist and we need to create it

        let newGameObj
        const gameInfo = $CURRENT_GAME.info

        if (gameDB === 'multiplayerGames') {
          // for creating a new multiplayer game
          newGameObj = {
            game: currentGameString,
            gameID: gameInfo.clientID,
            white: gameInfo.white,
            black: gameInfo.black,
          }
        } else {
          // for creating a new singleplayer game
          newGameObj = {
            game: currentGameString,
            gameID: gameInfo.clientID,
            player: $currentUser.id,
            color: gameInfo.playerColor,
          }
        }

        try {
          await pb.collection(gameDB).create(newGameObj)
        } catch (err) {
          ;[returnCode, returnMessage] = [err.status, err.message]
        }
      } else {
        ;[returnCode, returnMessage] = [err.status, err.message]
      }
    }
    return [returnCode, returnMessage]
  }

  async function handleMenuClick(e) {
    const target = e.target as Maybe<HTMLDivElement>
    if (target === null) return
    if (target.classList.contains('menu-container')) return

    if (target.classList.contains('about')) isAboutModalOpen = !isAboutModalOpen

    if ($STATE === 'form') {
      if (target.classList.contains('new-game')) clickFormButton('new')

      if (target.classList.contains('load-game')) clickFormButton('load')
    }

    if (typeof $STATE === 'string' && $STATE.endsWith('game')) {
      if (
        target.classList.contains('load-game') ||
        target.classList.contains('new-game')
      ) {
        const [errCode, msg] = await tryToSaveGame()

        // User is not logged in
        if (errCode === -1) {
          SHOW_NON_DISRUPTIVE_POPUP.set('Game saved locally')
        }

        // New game - do not save
        if (errCode === -2) SHOW_NON_DISRUPTIVE_POPUP.set(msg)
        // Game successfully saved to PB
        else if (errCode === null) {
          SHOW_NON_DISRUPTIVE_POPUP.set(
            'Previous game has been saved to user account'
          )
        }

        // There was a 4## error
        else if (errCode.toString().startsWith('4')) {
          SHOW_NON_DISRUPTIVE_POPUP.set(`
            The previous game has been saved locally but was unable to be 
            saved to your account. Error ${errCode} - ${msg}.`)
        }

        // Any other errors
        else {
          SHOW_NON_DISRUPTIVE_POPUP.set(`
            The previous game has been saved locally but was unable to be 
            saved to your account. An error has been logged for an 
            administrator to follow-up.`)
        }

        STATE.set('form')
        clickFormButton(target.dataset.name ?? '')
      }

      if (target.classList.contains('save-game')) {
        const [saveCode, saveMessage] = await tryToSaveGame()

        // -1 is the error code if a user isn't signed in
        if (saveCode !== null && saveCode !== -1) alert(saveMessage)
        else alert('Game has been saved locally.')
      }
    }
  }

  function handleColorSchemeClick() {
    setColorScheme()
  }

  /*
  function handleSignInClick(e) {
    const target = e.target as HTMLDivElement  
    if (isUIOpen) {
      if (target.className !== 'sign-in-caption') return
      closeSignInUI()
    } else {
      if (signedIn) return
      ui.start('#firebaseui-auth-container', uiConfig)
      addWindowListener()
      isUIOpen = true
    }
  }

  let h, w

  const addWindowListener = () => {
    const signInUILocation = signInContainer.getBoundingClientRect()
    const minX = signInUILocation.x
    const minY = signInUILocation.y
    const maxX = minX + w
    const maxY = minY + h

    window.addEventListener('click', e => {
      const [x, y] = [e.clientX, e.clientY]
      if ((x < minX || x > maxX) || (y < minY || y > maxY)) closeSignInUI()
    })
  }

  const closeSignInUI = () => {
    ui.reset()
    isUIOpen = false
  }*/
</script>

<header class="container-fluid header">
  <h2>Play Chess</h2>

  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div on:click={handleMenuClick} class="menu-container">
    <div class="new-game" data-name="new">New Game</div>
    <div class="load-game" data-name="load">Load Game</div>
    <div class="save-game">Save Game</div>
    <div class="about">About</div>
    {#if isAboutModalOpen}
      <AboutModal bind:isAboutModalOpen />
    {/if}
  </div>
  <div class="settings-icon-container">
    <SettingsIcon on:click />
  </div>
  <!--
  <button on:click={handleColorSchemeClick} class="outline secondary colorscheme">
    <small>Switch to {$COLOR_SCHEME === 'light' ? 'dark' : 'light'} mode</small>
  </button> 
-->
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!--
    {#if !$currentUser}
      <div role="button"
        on:click
        class="c_sign-in-dropdown">
        <div class="sign-in-caption">{$currentUser ? 'Sign Out' : 'Sign in'}</div>
      </div>
    {:else}
      <details>
        <summary role="button">Signed in as {$currentUser.username}</summary>
        <p on:click>Sign out</p>
      </details>
    {/if}
  -->
</header>

<style>
  .header {
    height: 70px;
    display: grid;
    grid-auto-flow: column;
    justify-content: stretch;
  }

  h2 {
    margin-bottom: 0;
  }

  button,
  .c_sign-in-dropdown {
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .colorscheme {
    --spacing: 0 !important;
  }

  .menu-container {
    display: grid;
    gap: 40px;
    grid-auto-flow: column;
    justify-self: start;
    align-self: end;
    justify-items: stretch;
    justify-content: end;
    align-items: end;
    padding-right: 70px;
  }

  .menu-container > div {
    color: var(--primary);
    font-size: 18px;
    text-align: center;
    padding: 15px 8px 0px;
    padding-bottom: 15px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    max-width: 200px;
    min-width: 100px;
  }

  .menu-container > div:hover {
    color: var(--primary-hover);
    border-bottom: 3px solid var(--primary-inverse);
    padding-bottom: 12px;
    cursor: pointer;
  }

  .c_sign-in-dropdown {
    margin-left: 30px;
    margin-right: 30px;
    justify-self: end;
  }

  .c_sign-in-dropdown:hover {
    cursor: pointer;
    scale: 1.05;
    transition: scale 100ms;
  }

  .settings-icon-container {
    justify-self: end;
  }
</style>

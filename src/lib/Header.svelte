<script lang="ts">
  import { STATE, HAS_LOCAL_SAVED_GAMES, CURRENT_GAME } from '../stores'

  import firebase from 'firebase/compat/app'
  import 'firebase/compat/auth'
  
  import * as firebaseui from 'firebaseui'
  import 'firebaseui/dist/firebaseui.css'

  import { firebaseConfig } from '../firebase'

  firebase.initializeApp(firebaseConfig)

  // Initialize the FirebaseUI Widget using Firebase.
  const ui = new firebaseui.auth.AuthUI(firebase.auth());

  const uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function() {
        return false;
      },
      uiShown: function() {
        // Hide the loader.
        document.getElementById('loader')!.style.display = 'none';
      }
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: 'popup',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.FacebookAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
      firebase.auth.PhoneAuthProvider.PROVIDER_ID
    ],
  };

  let isUIOpen = false
  let signedIn = false

  let signInContainer

  function handleMenuClick(e) {
    const target = e.target as Maybe<HTMLDivElement>
    if (target === null) return
    if (target.classList.contains('menu-container')) return

    if ($STATE === 'form') {
      if (target.classList.contains('new-game')) {
        const btn = document.querySelector('[data-name="newgame"]') as Maybe<HTMLButtonElement>
        btn?.click()
      }

      if (target.classList.contains('load-game')) {
        const btn = document.querySelector('[data-name="loadgame"]') as Maybe<HTMLButtonElement>
        btn?.click()
      }
    }

    if ($STATE.endsWith('game')) {
      if (target.classList.contains('save-game')) {
        const gamesList: Game[] = $HAS_LOCAL_SAVED_GAMES ? JSON.parse(localStorage.getItem('savedGames')) : []
        gamesList.push($CURRENT_GAME)
        localStorage.setItem('savedGames', JSON.stringify(gamesList))
        localStorage.setItem('hasSavedGames', 'true')
        HAS_LOCAL_SAVED_GAMES.set(true)

        alert('game has been saved')
      }
    }
  }

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
  }
</script>


<header>
  <div class="main-header">    
    <div class="title">Play Chess</div>
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div on:click={handleMenuClick} class="menu-container">
    <div class="new-game">New Game</div>
    <div class="load-game">Load Game</div>
    <div class="save-game">Save Game</div>
    <div class="about">About</div>
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div on:click={handleSignInClick} 
       bind:offsetWidth={w} 
       bind:offsetHeight={h}
       bind:this={signInContainer}
       class="c_sign-in-dropdown">
    <div class="sign-in-caption">Sign In</div>
    <div id="firebaseui-auth-container"></div>
    <div id="loader"></div>
  </div>
</header>

<style>
  .title {
    font-size: 40px;
    padding: 20px 60px;
  }

  .title:hover {
    cursor: default;
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
    font-size: 18px;
    text-align: center;
    padding: 15px 8px 0px;
    padding-bottom: 15px;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    max-width: 200px;
    min-width: 100px;
  }

  .menu-container div:hover {
    border-bottom: 3px solid var(--white-color);
    padding-bottom: 12px;
    cursor: pointer;  
  }

  .active-btn {
    border-bottom: 3px solid var(--white-color);
    padding-bottom: 12px !important;
  }

  .c_sign-in-dropdown {
    position: absolute;
    text-align: center;
    font-size: 20px;
    width: 294px;
    top: 30px;
    right: 30px;
    padding: 10px 20px;
    border-radius: 5px;
    background-color: #0003;

  }

  .c_sign-in-dropdown:hover {
    cursor: pointer;
    scale: 1.05;
    transition: scale 200ms;
  }

  .firebaseui-container {
    transition: all 200ms;
  }
</style>
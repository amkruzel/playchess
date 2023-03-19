<script lang="ts">
  import { setColorScheme } from '../../common'
  import { currentUser } from '../../pocketbase'
  import { SHOW_SIGN_IN_MODAL, SIGN_OUT_USER, CURRENT_GAME } from '../../stores'
  import { currentMenu } from './stores'

  export let text: string = ''

  function handleClick() {
    if ($currentMenu === null || $currentMenu === 'default') {
      if (text.endsWith('Sign In')) {
        SHOW_SIGN_IN_MODAL.set(true)
      }

      if (text === $currentUser?.username) currentMenu.set('profile')

      if (text.endsWith('mode')) handleColorSchemeClick()

      if (text === 'Debug') console.log($CURRENT_GAME)
    }

    if ($currentMenu === 'profile') {
      if (text === '') currentMenu.set('default')
      if (text === 'Sign Out') {
        SIGN_OUT_USER.set(true)
        currentMenu.set('default')
      }
    }
  }

  function handleColorSchemeClick() {
    setColorScheme()
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:click={handleClick}>
  <slot name="leftIcon" />

  <p>{text}</p>

  <slot name="rightIcon" />
</div>

<style>
  div {
    height: 40px;
    display: flex;
    align-items: center;
    transition: background 200ms;
    padding: 10px;
    border-radius: 5px;
  }

  p {
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    max-width: 220px;
    margin-bottom: 0;
  }

  div:hover {
    cursor: pointer;
    background-image: linear-gradient(rgb(0 0 0/10%) 0 0);
  }
</style>

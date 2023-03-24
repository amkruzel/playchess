<script lang="ts">
  import { currentUser, login, pb } from '../pocketbase'

  import { fly } from 'svelte/transition'
  import { SHOW_NON_DISRUPTIVE_POPUP } from '../stores'

  export let loginModalShouldBeVisible: boolean

  let username: string
  let password: string
  let saveToLocal: boolean
  let loadingSignUp: boolean = false
  let loadingLogin: boolean = false

  function checkToCloseModal(e) {
    const t = e.target
    if (!t.dataset.modal || t.classList.includes('close'))
      loginModalShouldBeVisible = !loginModalShouldBeVisible
  }

  async function loginHandler() {
    if (!loadingSignUp) loadingLogin = true
    login(username, password, saveToLocal)
    loadingLogin = false
    loginModalShouldBeVisible = false
  }

  async function signUp() {
    loadingSignUp = true
    try {
      const data = {
        username,
        password,
        passwordConfirm: password,
      }
      await pb.collection('users').create(data)
      await loginHandler()
    } catch (err) {
      SHOW_NON_DISRUPTIVE_POPUP.set(
        'There was an issue trying to sign in - please try again later.'
      )
    }
    loadingSignUp = false
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<dialog on:click|preventDefault={checkToCloseModal} open>
  <article
    in:fly={{ y: -900, delay: 100, duration: 250 }}
    out:fly={{ y: -900 }}
    data-modal="modal"
  >
    <!-- svelte-ignore a11y-invalid-attribute -->
    <!-- svelte-ignore a11y-missing-content -->
    <a href="#" aria-label="Close" class="close" />
    <form on:submit|preventDefault>
      <label for="username"
        >Username
        <small>(3 - 150 characters)</small>
        <input
          placeholder="Username"
          type="text"
          minlength="3"
          maxlength="150"
          title="3 - 150 characters"
          aria-invalid={!username ||
            username.length < 3 ||
            username.length > 150}
          bind:value={username}
        />
      </label>
      <label for="password"
        >Password
        <small>(8 - 72 characters)</small>
        <input
          placeholder="Password"
          type="password"
          minlength="8"
          maxlength="72"
          aria-invalid={!password ||
            password.length < 8 ||
            password.length > 72}
          title="8 - 72 characters"
          bind:value={password}
        />
      </label>
      <fieldset>
        <label for="staysignedin">
          <input
            type="checkbox"
            id="staysignedin"
            name="staysignedin"
            bind:checked={saveToLocal}
          />
          Stay signed in?
        </label>
      </fieldset>
    </form>
    <footer>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        role="button"
        class="secondary"
        on:click={signUp}
        aria-busy={loadingSignUp}
      >
        Sign Up
      </div>
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div role="button" on:click={loginHandler} aria-busy={loadingLogin}>
        Login
      </div>
    </footer>
  </article>
</dialog>

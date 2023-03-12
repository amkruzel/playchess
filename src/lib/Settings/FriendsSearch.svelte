<script lang="ts">
  import { pb, currentUser, updateUser } from '../../pocketbase'

  let username: string
  let loading: boolean = false

  async function searchForUser() {
    loading = true

    try {
      if (!$currentUser) return

      const user = await pb
        .collection('users')
        .getFirstListItem(`username="${username}"`)

      if (user) {
        const currentFriends = $currentUser.friends as string[]

        // do not add someone if they're already a friend
        if (currentFriends.includes(user.id)) {
          return
        }

        const newUserData = { friends: currentFriends.push(user.id) }
        const loggedInUserUpdate = await updateUser(
          $currentUser.id,
          newUserData
        )
      }
    } catch (error) {
      alert('User not found')
      console.log(error)
    }

    loading = false
  }
</script>

<form>
  <label for="friend">
    <input
      bind:value={username}
      type="search"
      id="friend"
      name="friend"
      placeholder="Search for friends"
    />
  </label>
  <button on:click|preventDefault={searchForUser} aria-busy={loading}>
    {#if !loading}
      Search
    {/if}
  </button>
</form>

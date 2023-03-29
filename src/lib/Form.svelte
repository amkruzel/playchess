<script lang="ts">
  import NewLoadButton from './Form/NewLoadButton.svelte'
  import BeginButton from './Form/BeginButton.svelte'
  import Container from './Form/Container.svelte'

  let isFormValid: boolean
</script>

<article class="empty-page-form-container">
  <NewLoadButton />

  <Container bind:isFormValid />

  <BeginButton {isFormValid} />
</article>

<style>
  .empty-page-form-container {
    display: grid;
    padding: 30px;
    margin: 80px;
    justify-self: center;
  }
</style>

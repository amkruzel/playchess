<script lang="ts">
  export let isAboutModalOpen

  function showHideModal() {
    isAboutModalOpen = !isAboutModalOpen
  }

  function drag(node) {
    let moving = false
    let left = 600
    let top = 100

    node.style.position = 'absolute'
    node.style.top = `${top}px`
    node.style.left = `${left}px`
    node.style.cursor = 'move'
    node.style.userSelect = 'none'

    node.addEventListener('mousedown', () => {
      moving = true
    })

    window.addEventListener('mousemove', e => {
      if (moving) {
        left += e.movementX
        top += e.movementY
        node.style.top = `${top}px`
        node.style.left = `${left}px`
      }
    })

    window.addEventListener('mouseup', () => {
      moving = false
    })
  }
</script>

<article use:drag class="about-modal">
  <header class="modal-header">
    About
    <!-- svelte-ignore a11y-missing-content -->
    <a
      on:click|preventDefault={showHideModal}
      href="#"
      aria-label="Close"
      class="close"
    />
  </header>
  <p>
    This is a small web application where you can play chess.
    <br /> <br />
    For more information, check out the
    <a
      href="https://github.com/amkruzel/playchess"
      target="_blank"
      rel="noopener noreferrer"
    >
      github repo</a
    >.
  </p>
</article>

<style>
  .about-modal {
    position: absolute;
    top: 300px;
    max-width: 400px;
    max-height: 400px;
    z-index: 999;
  }

  .about-modal:hover {
    cursor: grab;
  }

  .modal-header {
    display: block;
    font-weight: bold;
  }

  .modal-header a {
    display: block;
    width: 1rem;
    height: 1rem;
    margin-top: calc(var(--block-spacing-vertical) * -0.5);
    margin-left: auto;
    background-image: var(--icon-close);
    background-position: center;
    background-size: auto 1rem;
    background-repeat: no-repeat;
    opacity: 0.5;
    transition: opacity var(--transition);
  }
</style>

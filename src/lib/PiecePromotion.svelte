<script lang="ts">
  import { fly } from 'svelte/transition'
  import {
    Piece,
    type color,
    type location,
    type promotionName,
  } from '../scripts/chess'
  import { SHOW_PROMOTION_MODAL, selectedPromotionPiece } from '../stores'
  import ChessPiece from './ChessBoard/ChessPiece.svelte'

  export let color: color
  export let location: location

  function handleClick(e) {
    const buttonElement: HTMLButtonElement =
      e.target.tagName === 'BUTTON' ? e.parentElement : e.target
    const promotionPieceName = buttonElement.dataset.promotionName

    if (promotionPieceName)
      $selectedPromotionPiece = promotionPieceName as promotionName

    SHOW_PROMOTION_MODAL.set(false)
  }
</script>

<dialog open>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <article
    in:fly={{ y: -900, delay: 100, duration: 250 }}
    out:fly={{ y: -900 }}
    on:click={handleClick}
  >
    <h3>Choose a piece to promote to:</h3>
    <div class="grid">
      <button class="outline" data-promotion-name="rook">
        <ChessPiece piece={new Piece('rook', color, location)} />
      </button>
      <button class="outline" data-promotion-name="knight">
        <ChessPiece piece={new Piece('knight', color, location)} />
      </button>
      <button class="outline" data-promotion-name="bishop">
        <ChessPiece piece={new Piece('bishop', color, location)} />
      </button>
      <button class="outline" data-promotion-name="queen">
        <ChessPiece piece={new Piece('queen', color, location)} />
      </button>
    </div>
  </article>
</dialog>

<style>
  button {
    width: 100px;
  }
</style>

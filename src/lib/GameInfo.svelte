<script lang="ts">
  import { onMount } from "svelte"
  import { capitalize } from "../common";

  import { CURRENT_GAME } from "../stores"
  //import Piece from "./ChessBoard/Piece.svelte";

  $: currentPlayerColor = $CURRENT_GAME.currentPlayerColor
  $: currentPlayerDisplayName = $CURRENT_GAME[`${currentPlayerColor}Player`]

  $: moves = $CURRENT_GAME.previousMoves
  
</script>

<article>
  <div>
    <hgroup class="current-player-container">
      <h2>Current Player:</h2>
      <div class="current-player">
        {currentPlayerDisplayName ?? capitalize(currentPlayerColor)}
      </div>
    </hgroup>

    <hgroup class="turns-list-container">
      <h2>Previous Moves:</h2>
      <div class="moves-container">
        {#each moves as move}
          <div class="move container">
            <b>Move {move.moveNumber}</b>
            <span>{capitalize(move.pieceMoved.color)} {move.pieceMoved.name} {move.from} to {move.to}</span>
            {#if (move.pieceCaptured)} {capitalize(move.pieceCaptured.color)} {move.pieceCaptured.name} captured {/if}
          </div>
        {/each}
      </div>
    </hgroup>
    
  </div>
</article>

<style>
  article {
    min-width: 330px;
    max-height: 660px;
  }

  hgroup {
    padding-left: 10px;
  }

  div {
    padding: 20px;
  }

  .move, .moves-container, .current-player {
    padding: 0;
  }

  .moves-container {
    display: grid;
    gap: 15px;
    overflow-y: auto;
    max-height: 400px;
  }

  .move {
    display: grid;
  }

  .current-player {
    font-size: 24px;
  }

</style>
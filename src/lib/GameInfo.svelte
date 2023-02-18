<script lang="ts">
  import { onMount } from "svelte"

  import { CURRENT_GAME } from "../stores"
  //import Piece from "./ChessBoard/Piece.svelte";

  $: currentPlayerColor = $CURRENT_GAME.currentPlayerColor
  $: currentPlayerDisplayName = $CURRENT_GAME[`${currentPlayerColor}Player`]

  $: moves = $CURRENT_GAME.previousMoves

  const getPiecesOfOneColor = (moves: chessMove[], color: color): Piece[] => {
    return moves.map(m => m.pieceCaptured).filter(p => p.color === color)
  }

  const piecePointValue = (p: Piece) => {
    if (p.name === 'queen') return 9
    if (p.name === 'rook') return 5
    if (p.name === 'bishop') return 3
    if (p.name === 'knight') return 3
    return 1
  }

  // Queen, Rook Bishop, Knight, Pawn
  const sortPiecesInDisplayOrder = (pieces: Piece[]): Piece[] => {
    return pieces.sort((a, b) => {
      const [aPt, bPt] = [piecePointValue(a), piecePointValue(b)]
      if (aPt > bPt) return -1
      if (bPt > aPt) return 1
      if (a.name === b.name) return 0
      return a.name === 'bishop' ? -1 : 1
    })
  }

  let whiteCapturedPieces: Piece[] = []
  let blackCapturedPieces: Piece[] = []
  
  onMount(() => {
    whiteCapturedPieces = sortPiecesInDisplayOrder(getPiecesOfOneColor(moves, 'white'))
    blackCapturedPieces = sortPiecesInDisplayOrder(getPiecesOfOneColor(moves, 'black'))
  })
  
</script>

<div>
  <div class="current-player-container">
    <h2>Current Player:</h2>
    <div class="current-player">
      {currentPlayerDisplayName ?? currentPlayerColor}
    </div>
  </div>

  <div class="turns-list-container">
    <h2>Previous Moves:</h2>
    <div class="moves-container">
      <div class="captured-pieces-container">
        <div class="white">
          {#each whiteCapturedPieces as piece}
            {piece}
          {/each}

          {#each blackCapturedPieces as piece}
            <!--<Piece {piece} />-->
          {/each}
        </div>
      </div>
    </div>
  </div>
  
</div>

<style>
  div {
    padding: 20px;
    max-width: 300px;
  }

  .current-player {
    font-size: 24px;
  }
</style>
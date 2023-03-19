<script lang="ts">
  import { CURRENT_GAME } from '../stores'
  import ChessPiece from './ChessBoard/ChessPiece.svelte'

  import type { Piece, Move, color } from '../scripts/chess'

  $: moves = $CURRENT_GAME.previousMoves

  let whiteCapturedPieces: Piece[] = []
  let blackCapturedPieces: Piece[] = []

  const getPiecesOfOneColor = (moves: Move[], color: color): Piece[] => {
    const capturedPieces = $CURRENT_GAME.capturedPieces
    return capturedPieces.filter(p => p.color === color)
    //const realList = correctColor.map(p => p.copy())
    //return realList
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

  CURRENT_GAME.subscribe(game => {
    moves = game.previousMoves
    whiteCapturedPieces = sortPiecesInDisplayOrder(
      getPiecesOfOneColor(moves, 'white')
    )
    blackCapturedPieces = sortPiecesInDisplayOrder(
      getPiecesOfOneColor(moves, 'black')
    )
  })
</script>

<article>
  <div>
    <hgroup class="captured-pieces-container">
      <h2>Captured Pieces:</h2>
      <div class="captured-pieces-container">
        <div class="white">
          {#each whiteCapturedPieces as piece}
            <ChessPiece {piece} />
          {/each}
          <br />
          {#each blackCapturedPieces as piece}
            <ChessPiece {piece} />
          {/each}
        </div>
      </div>
    </hgroup>
  </div>
</article>

<style>
  article {
    min-width: 330px;
    flex-grow: 1;
  }

  hgroup {
    padding-left: 10px;
  }

  div {
    padding: 20px;
  }
</style>

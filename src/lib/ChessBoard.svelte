<script lang="ts">
  import { Game, delay, makeComputerMove } from '../scripts/chess'

  import type { location, Maybe, Move, promotionName } from '../scripts/chess'
  import { CURRENT_GAME } from '../stores'

  import { mediaFolder } from '../common'

  import Square from './ChessBoard/Square.svelte'

  import audioURL from '../assets/place-piece.wav'

  export let game: Game

  const clickAudio = new Audio(audioURL)

  // board locations, in order from top-left to bottom-right
  // prettier-ignore
  const whiteLocations: location[] = ['a8','b8','c8','d8','e8','f8','g8','h8',
                                      'a7','b7','c7','d7','e7','f7','g7','h7',
                                      'a6','b6','c6','d6','e6','f6','g6','h6',
                                      'a5','b5','c5','d5','e5','f5','g5','h5',
                                      'a4','b4','c4','d4','e4','f4','g4','h4',
                                      'a3','b3','c3','d3','e3','f3','g3','h3',
                                      'a2','b2','c2','d2','e2','f2','g2','h2',
                                      'a1','b1','c1','d1','e1','f1','g1','h1' ]

  $: locationsList =
    game.info.playerColor === 'white'
      ? whiteLocations
      : whiteLocations.reverse()

  let fromLocation: Maybe<location> = null
  let toLocation: Maybe<location> = null
  let possibleLocations: location[] = []
  let possibleMoves: Maybe<{
    moves: [Move, ...Move[]]
    makeMove: (m: Move) => Maybe<{
      move: Move
      promote?: (n: promotionName) => Maybe<Move>
    }>
  }> = null

  const clearLocations = () => {
    fromLocation = null
    toLocation = null
    possibleLocations = []
    possibleMoves = null
  }

  function handleClick(e) {
    const clickTarget = e.target as HTMLElement

    const squareTarget: Maybe<HTMLElement> =
      clickTarget?.tagName !== 'DIV' ? clickTarget?.parentElement : clickTarget

    if (squareTarget === null) return clearLocations()

    if (fromLocation === null) handleFirstClick(squareTarget as HTMLDivElement)
    else if (toLocation === null) {
      if (possibleLocations.length === 0) return
      handleSecondClick(squareTarget as HTMLDivElement)
    }
  }

  const handleFirstClick = (squareTarget: HTMLDivElement) => {
    if (!$CURRENT_GAME) return

    fromLocation = `${squareTarget?.dataset.location}` as location

    const fromPiece = game.pieceAt(fromLocation)
    if (fromPiece === null) return

    possibleMoves = $CURRENT_GAME.validMoves(fromLocation)
    if (!possibleMoves) return

    possibleLocations = possibleMoves.moves.map(el => el.to)
  }

  const handleSecondClick = async (squareTarget: HTMLDivElement) => {
    if (!possibleMoves) return clearLocations()
    toLocation = `${squareTarget?.dataset.location}` as location

    if (!toLocation || !possibleLocations.includes(toLocation))
      return clearLocations()

    // fromLocation must not be null because we check for that right before calling this function
    const chosenMoveObj = possibleMoves.moves.find(m => m.to === toLocation)
    if (!chosenMoveObj) return clearLocations()

    const move = possibleMoves.makeMove(chosenMoveObj)

    if (!move) return clearLocations()

    // if there needs to be a promotion, we need to handle that here
    if (move.promote) {
      // TODO
    }

    game.cleanup()
    updateAfterPieceMove(game)
  }

  const updateAfterPieceMove = (game: Game) => {
    CURRENT_GAME.set(game)
    clickAudio.play()
    clearLocations()
  }

  // This is where the computer move is played, if there is a computer
  $: if (game.isComputerMove) {
    ;(async () => {
      await delay(2000)
      makeComputerMove(game)
      updateAfterPieceMove(game)
    })()
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<article>
  <div on:click={handleClick} class="board-container">
    {#each locationsList as loc}
      <Square
        location={loc}
        validSquare={possibleLocations.includes(loc)}
        {game}
      />
    {/each}
  </div>
</article>

<style>
  article {
    grid-column: span 2;
  }

  .board-container {
    padding: 50px;
    width: 620px;
    justify-content: center;
    align-self: start;
    display: grid;
    grid-template: repeat(8, 65px) / repeat(8, 65px);

    transition: all 500ms;
  }

  [draggable='true'] {
    cursor: grab;
  }

  [draggable='true']:active {
    cursor: grabbing;
  }
</style>

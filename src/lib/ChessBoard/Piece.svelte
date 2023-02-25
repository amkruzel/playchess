<script lang="ts">
  import bishopBlack from '../../assets/bishop-black.svg'
  import bishopWhite from '../../assets/bishop-white.svg'
  import kingBlack from   '../../assets/king-black.svg'
  import kingWhite from   '../../assets/king-white.svg'
  import knightBlack from '../../assets/knight-black.svg'
  import knightWhite from '../../assets/knight-white.svg'
  import pawnBlack from   '../../assets/pawn-black.svg'
  import pawnWhite from   '../../assets/pawn-white.svg'
  import queenBlack from  '../../assets/queen-black.svg'
  import queenWhite from  '../../assets/queen-white.svg'
  import rookBlack from   '../../assets/rook-black.svg'  
  import rookWhite from   '../../assets/rook-white.svg'

  export let piece: Piece = null

  const pieces = {
    'white':  { 'pawn': pawnWhite
              , 'rook': rookWhite
              , 'bishop': bishopWhite
              , 'knight': knightWhite
              , 'queen': queenWhite
              , 'king': kingWhite }
              
  , 'black':  { 'pawn': pawnBlack
              , 'rook': rookBlack
              , 'bishop': bishopBlack
              , 'knight': knightBlack
              , 'queen': queenBlack
              , 'king': kingBlack }
  }

</script>

{#if piece !== null}

  <img 
    src={pieces[piece.color][piece.name]} 
    alt="A {piece.color} {piece.name}"
    class="piece"
    data-color="{piece.color}"
    data-location="{piece.location}" />

{/if}

<script lang="ts">
  import Piece from "./Piece.svelte"

  import { ChessPiece } from "../../scripts/piece"
  import { ChessGame } from "../../scripts/game"
  import { CURRENT_GAME } from "../../stores";
  import { mediaFolder } from "../../common";

  export let location
  export let game
  export let validSquare = false

  const LightSquares = [ 'a2', 'a4', 'a6', 'a8'
                       , 'b1', 'b3', 'b5', 'b7' 
                       , 'c2', 'c4', 'c6', 'c8'
                       , 'd1', 'd3', 'd5', 'd7' 
                       , 'e2', 'e4', 'e6', 'e8'
                       , 'f1', 'f3', 'f5', 'f7' 
                       , 'g2', 'g4', 'g6', 'g8'
                       , 'h1', 'h3', 'h5', 'h7' ]
  
  $: piece = game.getPiece(location)   

</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div data-location="{location}" id="{LightSquares.includes(location) ? 'light' : ''}" class="square">
  {#if validSquare}
    <span></span>
  {/if}
  <Piece {piece} />
</div>

<style>
  span {
    height: 50px;
    width: 50px;
    position: relative;
    border-radius: 100%;
    background-color: rgba(0, 0, 0, 0.26);
    filter: brightness(1.2);
    position: absolute;
  }

  .square {
    display: grid;
    place-items: center;
    background-color: var(--dark-square-color) !important;

  }

  .square#light {
    background-color: var(--light-square-color) !important;
  }

  
</style>
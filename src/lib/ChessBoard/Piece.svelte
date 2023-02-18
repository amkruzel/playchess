<script lang="ts">
  import { mediaFolder } from "../../common";

  export let piece: Piece = null

</script>

{#if piece !== null}

  <img src="{mediaFolder}{piece.name}-{piece.color}.svg"
       alt="A {piece.color} {piece.name}"
       class="piece"
       data-color="{piece.color}"
       data-location="{piece.location}" />

{/if}

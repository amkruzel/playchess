<script lang="ts">
  import { onDestroy } from 'svelte'
  import { slide, fly } from 'svelte/transition'
  import { HAS_LOCAL_SAVED_GAMES, localSavedGames } from '../../../stores'

  import { activeLoadGameID, pendingGameToLoad, activeForm } from '../stores'

  import type { Maybe, serializedGame } from '../../../scripts/chess'

  import { Game } from '../../../scripts/chess'

  export let isLoadGameFormValid: boolean = false

  /**
   *
   * Data structure of local storage:
   *  - all keys and values are strings
   *
   * hasSavedGames: boolean
   *  - if true, there are games saved locally
   *
   * savedGames: JSON stringified array
   *  - an array of games
   *
   *
   */

  const savedGamesString = $HAS_LOCAL_SAVED_GAMES
    ? (localStorage.getItem('savedGames') as string)
    : '[]'
  const savedGamesJSONSerialized: serializedGame[] =
    JSON.parse(savedGamesString)

  const savedGamesJSON: Game[] = savedGamesJSONSerialized.map(g =>
    Game.deserialize(g)
  )

  localSavedGames.set(savedGamesJSON)

  function handleClick(e) {
    const gameTarget: Maybe<HTMLDivElement> = e.target
    if (!gameTarget) return

    const realGameTarget = gameTarget.classList.contains('game')
      ? gameTarget
      : (gameTarget.parentElement as HTMLElement)

    const gameTargetID = realGameTarget.dataset.id
    if (gameTargetID) activeLoadGameID.set(parseInt(gameTargetID))

    isLoadGameFormValid =
      savedGamesJSON.filter(g => g.info.clientID === $activeLoadGameID)
        .length === 1

    $pendingGameToLoad =
      savedGamesJSON.find(g => g.info.clientID === $activeLoadGameID) ?? null
  }

  onDestroy(() => activeLoadGameID.set(null))
</script>

{#if $activeForm === 'loadgame'}
  <div in:fly={{ x: 200 }} out:fly={{ x: 200 }} class="load-container">
    {#if !$HAS_LOCAL_SAVED_GAMES}
      <div>
        <h2>
          There are no games saved locally. Sign in to search for games saved to
          your account.
        </h2>
      </div>
    {:else}
      <div>
        <h2>Choose a game to load:</h2>
        <div class="games-list">
          {#each savedGamesJSON as game}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <div
              on:click={handleClick}
              data-id={game.info.clientID}
              class="game {$activeLoadGameID === game.info.clientID
                ? 'active'
                : ''}"
            >
              <div>
                Started on {game.info.date?.toLocaleDateString()}
              </div>
              <div>Playing as {game.info.playerColor}</div>
              <div>It is {game.info.currentPlayer} player's turn</div>
              <div>Currently on move number {game.info.move}</div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .load-container {
    grid-column: 1/2;
    grid-row: 1/2;
  }

  .games-list {
    display: grid;
    gap: 10px;
    border: 2px double grey;
    border-radius: 10px;
    padding: 10px;
  }

  .game {
    border: 1px dotted black;
    padding: 6px;
    border-radius: 5px;
    cursor: pointer;
  }

  .game:hover {
    border: 2px dotted blueviolet;
  }

  .active,
  .active:hover {
    border: 2px solid blue;
  }
</style>

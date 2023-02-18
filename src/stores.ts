import { writable, type Writable } from "svelte/store"

export const STATE: Writable<Maybe<'form' | 'newgame' | 'loadgame'>> = writable('form')
export const CURRENT_GAME: Writable<Maybe<Game>> = writable(null)
export const HAS_LOCAL_SAVED_GAMES: Writable<boolean> = writable(!!localStorage.getItem('savedGames'))
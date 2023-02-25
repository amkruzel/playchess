import { writable, type Writable } from "svelte/store"

export const STATE: Writable<Maybe<'form' | 'newgame' | 'loadgame'>> = writable('form')
export const CURRENT_GAME: Writable<Maybe<Game>> = writable(null)
export const HAS_LOCAL_SAVED_GAMES: Writable<boolean> = writable(!!localStorage.getItem('savedGames'))
export const COLOR_SCHEME: Writable<Maybe<'light' | 'dark'>> = writable(null)
export const SHOW_SIGN_IN_MODAL: Writable<boolean> = writable(false)
export const SIGN_OUT_USER: Writable<boolean> = writable(false)
export const SHOW_NON_DISRUPTIVE_POPUP: Writable<string | null> = writable(null)
export const IS_CHECKMATE: Writable<boolean> = writable(false)
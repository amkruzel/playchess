import { writable, type Writable } from "svelte/store"

export const activeForm: Writable<Maybe<'newgame' | 'loadgame'>> = writable(null)
export const opponent = writable(null)
export const color = writable(null)
export const localOrOnline = writable(null)
export const whitePlayerName = writable(null)
export const blackPlayerName = writable(null)

export const activeLoadGameID: Writable<Maybe<number>> = writable(null)
export const pendingGameToLoad: Writable<Maybe<Game>> = writable(null)

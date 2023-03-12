import { writable, type Writable } from 'svelte/store'
import type { Maybe, Game, gametype, gamelocation } from '../../scripts/chess'

export const activeForm: Writable<Maybe<'newgame' | 'loadgame'>> =
  writable(null)
export const opponent: Writable<Maybe<gametype>> = writable(null)
export const color: Writable<Maybe<'white' | 'black'>> = writable(null)
export const localOrOnline: Writable<Maybe<gamelocation>> = writable(null)
export const whitePlayerName: Writable<Maybe<string>> = writable(null)
export const blackPlayerName: Writable<Maybe<string>> = writable(null)

export const activeLoadGameID: Writable<Maybe<number>> = writable(null)
export const pendingGameToLoad: Writable<Maybe<Game>> = writable(null)

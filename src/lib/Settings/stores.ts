import { writable, type Writable } from 'svelte/store'

import type { Maybe } from '../../scripts/chess'

export const currentMenu: Writable<Maybe<'default' | 'profile' | 'friends'>> =
  writable(null)

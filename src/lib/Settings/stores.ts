import { writable, type Writable } from "svelte/store";

export const currentMenu: Writable<Maybe<'default' | 'profile' | 'friends'>> = writable(null)
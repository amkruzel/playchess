import PocketBase from 'pocketbase'

import { writable } from 'svelte/store'

export const pb = new PocketBase('https://pocket.playchess.page:443')

export const currentUser = writable(pb.authStore.model)

function saveLoginToLocalStorage(username: string, password: string) {
  const loginInfo = { username: username, password: password }

  localStorage.setItem('loginInfo', JSON.stringify(loginInfo))
}

export function clearLoginFromLocalStorage() {
  localStorage.removeItem('loginInfo')
}

export async function login(
  username: string,
  password: string,
  saveToLocalStorage?: boolean
) {
  if (saveToLocalStorage) saveLoginToLocalStorage(username, password)
  await pb.collection('users').authWithPassword(username, password)
}

export async function updateUser(userID, data) {
  return pb.collection('users').update(userID, data)
}

pb.authStore.onChange(auth => {
  currentUser.set(pb.authStore.model)
})

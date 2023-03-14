import { COLOR_SCHEME } from './stores'

const getDefaultColorScheme = () => {
  return window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const detectColorScheme = () => {
  const colorScheme = localStorage.getItem('colorscheme')

  const csIsString = typeof colorScheme === 'string'
  const csIsInvalidString = colorScheme !== 'light' && colorScheme !== 'dark'

  const realCS = csIsString && csIsInvalidString ? null : colorScheme

  COLOR_SCHEME.set(realCS ?? getDefaultColorScheme())
}

/**
 *
 * @param color - optional; if nothing is passed, the color scheme is swapped
 */
export const setColorScheme = (color?: 'light' | 'dark') => {
  let newColor = color

  if (!newColor) {
    COLOR_SCHEME.update(prev => {
      newColor = prev === 'light' ? 'dark' : 'light'
      return newColor
    })
  } else COLOR_SCHEME.set(newColor)

  localStorage.setItem('colorscheme', newColor as 'light' | 'dark')
}

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1)

export const mediaFolder = './src/assets/'

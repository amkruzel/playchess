/**
 * 
 * model/common
 * 
 */

const HorizontalValues = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']  
const VerticalValues   = ['1', '2', '3', '4', '5', '6' ,'7' ,'8']

const AllLocations = [ 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'
                     , 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8' 
                     , 'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'
                     , 'd1', 'd2', 'd3', 'd4', 'd5', 'd6', 'd7', 'd8' 
                     , 'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'
                     , 'f1', 'f2', 'f3', 'f4', 'f5', 'f6', 'f7', 'f8' 
                     , 'g1', 'g2', 'g3', 'g4', 'g5', 'g6', 'g7', 'g8'
                     , 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'h8' ]

// Type predicates

export const isError = (error: Either<Error, any>): error is Error => {
  return (error as Error)?.message !== undefined
}
export const isAlgLocation = (loc: sqrLocation | string | undefined): loc is location => {
  if (loc === undefined) return false
  return typeof loc === 'string' ? AllLocations.includes(loc) : false
}
export const isCoordLocation = (loc: sqrLocation): loc is coords => !isAlgLocation(loc)

export const isColor = (clr: any): clr is color => clr === 'white' || clr === 'black'

export const parseLocationToAlg    = (loc: sqrLocation): location => isAlgLocation(loc) ? loc : numToAlgebraic(loc)
export const parseLocationToCoords = (loc: sqrLocation): coords => isCoordLocation(loc) ? loc : algebraicToNum(loc)

export const logModelError = (err: Error): void => {
  console.log(`${err.name}: ${err.message}`)
}

/**
 * 
 * @param alg 
 * @returns first two characters from @alg@ in a tuple
 */
export const getCoordsFromAlg = (alg: location): [string, string] => {
  const x = alg.slice(0, 1)
  const y = alg.slice(1)

  return [x, y]
}

/**
 * 
 * @param alg 
 * @returns tuple of the x + y coords - guaranteed to both be between 0 - 7
 */
export const algebraicToNum = (alg: location): coords => {
  let algX = alg.slice(0, 1)
  let algY = alg.slice(1)

  let x = VerticalValues.indexOf(algY)
  let y = HorizontalValues.indexOf(algX)

  return [x, y] as coords
}

export const numToAlgebraic = (ary: coords): location => {
  let [aryX, aryY] = ary

  let y = VerticalValues[aryX]
  let x = HorizontalValues[aryY]

  return `${x}${y}` as location
}

export const flipLocation = (loc: location): location => {
  let l = algebraicToNum(loc)
    for (let i = 0; i < 2; i++) {
      if (l[i] === 0) { 
        l[i] = 7
        continue
      }
      if (l[i] === 1) { 
        l[i] = 6
        continue
      }
      if (l[i] === 2) { 
        l[i] = 5
        continue
      }
      if (l[i] === 3) { 
        l[i] = 4
        continue
      }
      if (l[i] === 4) { 
        l[i] = 3
        continue
      }
      if (l[i] === 5) { 
        l[i] = 2
        continue
      }
      if (l[i] === 6) { 
        l[i] = 1
        continue
      }
      if (l[i] === 7) { 
        l[i] = 0
        continue
      }
    }
  return numToAlgebraic(l)
}

export const chessBoardMap = (board: Board, fn: (p: Piece) => Piece): Board => {
  if (board.length === 0) return []

  const ret = Array.from(Array(8), () => new Array(8))

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const p = board[i][j]
      if (p === undefined || p === null) {
        ret[i][j] = null
        continue
      }
      ret[i][j] = fn(p)
    }
  }
  return ret
}

export const chessBoardMaybeMap = (board: Board, fn: (p: Square) => Square): Board => {
  if (board.length === 0) return []

  const ret = Array.from(Array(8), () => new Array(8))

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const p = board[i][j]
      ret[i][j] = fn(p)
    }
  }
  return ret
}

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms))
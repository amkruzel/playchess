export type Maybe<T> = NonNullable<T> | null

export type color = 'white' | 'black'

export type name = 'pawn' | 'bishop' | 'knight' | 'rook' | 'king' | 'queen'

export type promotionName = 'bishop' | 'knight' | 'rook' | 'queen'

// prettier-ignore
export type location = 'a1' | 'a2' | 'a3' | 'a4' | 'a5' | 'a6' | 'a7' | 'a8'
              | 'b1' | 'b2' | 'b3' | 'b4' | 'b5' | 'b6' | 'b7' | 'b8'
              | 'c1' | 'c2' | 'c3' | 'c4' | 'c5' | 'c6' | 'c7' | 'c8'
              | 'd1' | 'd2' | 'd3' | 'd4' | 'd5' | 'd6' | 'd7' | 'd8'
              | 'e1' | 'e2' | 'e3' | 'e4' | 'e5' | 'e6' | 'e7' | 'e8'
              | 'f1' | 'f2' | 'f3' | 'f4' | 'f5' | 'f6' | 'f7' | 'f8'
              | 'g1' | 'g2' | 'g3' | 'g4' | 'g5' | 'g6' | 'g7' | 'g8'
              | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8'

export type gamestatus = 'active' | 'inactive'

export type gametype = 'player' | 'computer'

export type gamelocation = 'local' | 'online'

// This is used to limit the coords type
export type idxLimit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

export type coords = [idxLimit, idxLimit]

/**
 * A Chess Move
 * @prop {location} from         - The location moved from
 * @prop {location} to           - The location moved to
 * @prop {Piece}    piece        - The piece that was moved (before being moved)
 * @prop {boolean}  bigPawnMove  - True if the piece moved was a pawn and it moved two squares
 * @prop {Piece}    [capture]    - The piece that was captured, if one was (after being captured)
 * @prop {Piece}    [promotion]  - If the piece was promoted, this is the new piece and
 *                                 the @piece@ value is the original piece
 * @prop {object}   [castle]     - If this move was a castle, this object will hold info about the rook
 * @prop {location} castle.from  - The location the rook moved from
 * @prop {location} castle.to    - The location the rook moved to
 * @prop {Piece}    castle.piece - The rook that was moved (after being moved)
 */
export type Move = {
  from: location
  to: location
  piece: Piece
  number?: number
  bigPawnMove?: boolean
  capture?: Piece
  promotion?: boolean
  promotionPiece?: Piece
  castle?: {
    from: location
    to: location
    piece: Piece
  }
}

export type Board = Maybe<Piece>[][]

export type Info = {
  move: number
  clientID: number
  serverID?: string
  currentPlayer: color
  type?: gametype
  location?: gamelocation
  playerColor?: color
  winner?: color
  white?: string
  black?: string
  status: gamestatus
}

/********************
 *                  *
 * Helper functions *
 *                  *
 ********************/

// Each letter represents one of the 2nd dimension arrays in a Board object
const ColumnValues = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']

// Each number represent one of the 1st dimension arrays in a Board object
const RowValues = ['1', '2', '3', '4', '5', '6', '7', '8']

/**
 * Converting to and from algebraic & coords using the column and row values:
 *
 * algNumber corresponds to a row, algLetter corresponds to a column
 *
 * When converting between these, the order of the values must be swapped
 *
 * coordinates (ex. [1, 3]) represent a space on the board (ex. _board[1][3])
 * this would correspond with `ColumnValue[3]RowValue[1]` or 'd2'
 *
 * examples:
 * - 'a3'   -> [2, 0]
 * - [4, 6] -> 'g5'
 *
 */

export const delay = (ms: number) => new Promise(res => setTimeout(res, ms))

/**
 *
 * @param max
 * @param min
 * @returns random number - if min is included, number will be between min (inclusive)
 *          and max (exclusive). if min is not included, number will be between
 *          0 (inclusive) and max (exclusive)
 */
export const random = (max: number, min: number = 0): number => {
  return Math.floor(Math.random() * (max - min)) + min
}

export const movesArrHasAtLeastOneItem = (
  val: unknown
): val is [Move, ...Move[]] => {
  const validateMove = (move: Move): boolean => {
    return move.from && move.to && !!move.piece
  }
  return val instanceof Array && val.length > 0 && val.every(validateMove)
}

export const isGame = (g: Maybe<Game>): g is Game => {
  return g instanceof Game
}

/**
 *
 * @param {Maybe<location>} alg - a location to convert to x and y coords to use on a
 *                                Board object. this could also be null, in which case
 *                                the function will return null
 * @returns {Maybe<coords>} tuple of the row + column coords ([row, column])
 *                          guaranteed to both be between 0 - 7, or null if
 *                          that's what was passed as the param
 */
export const algebraicToNum = (alg: location): coords => {
  const algLetter = alg.slice(0, 1)
  const algNumber = alg.slice(1)

  const row = RowValues.indexOf(algNumber)
  const column = ColumnValues.indexOf(algLetter)

  return [row, column] as coords
}

/**
 * Convert [row, column] location to algebraic
 * @param {coords} ary - [row, column] location
 * @returns {location} a location in algebraic notation
 */
export const numToAlgebraic = ([row, column]: coords): location => {
  const algLetter = ColumnValues[column]
  const algNumber = RowValues[row]

  return `${algLetter}${algNumber}` as location
}

export const filterNullsFromList = <T>(x: Maybe<T>[]): T[] => {
  return x.filter(i => i) as T[]
}

/**
 *
 * @param fen
 * @returns if fen is valid, returns a Game object. If invalid, returns null.
 *          currently this does not completely convert the fen representation,
 *          only the board
 */
export const fenToGame = (fen: string): Game => {
  function stringToRow(str: string, rowNum: idxLimit): Maybe<Piece>[] {
    // prettier-ignore
    type pieceChar = 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
                   | 'P' | 'N' | 'B' | 'R' | 'Q' | 'K'

    type nameAndColor = [name, color]

    function charIsPieceLetter(p: string): p is pieceChar {
      // prettier-ignore
      return [ 'p', 'n', 'b', 'r', 'q', 'k'
             , 'P', 'N', 'B', 'R', 'Q', 'K' ].includes(p)
    }

    function letterToNameAndColor(c: pieceChar): nameAndColor {
      let name: name
      let color: color

      if (c.toLowerCase() === 'p') name = 'pawn'
      else if (c.toLowerCase() === 'n') name = 'knight'
      else if (c.toLowerCase() === 'b') name = 'bishop'
      else if (c.toLowerCase() === 'r') name = 'rook'
      else if (c.toLowerCase() === 'q') name = 'queen'
      else name = 'king'

      color = c === c.toLowerCase() ? 'white' : 'black'

      return [name, color]
    }

    // convert numbers to an equal number of 'x's
    const fixedArrOfChars = str
      .split('')
      .map((c: string): string =>
        charIsPieceLetter(c) ? c : 'x'.repeat(parseInt(c))
      )
      .join('')
      .split('') as (pieceChar | 'x')[]

    const row: Maybe<Piece>[] = fixedArrOfChars.map((char, col: number) => {
      if (char === 'x') return null

      const pieceInfo = letterToNameAndColor(char)
      return new Piece(
        pieceInfo[0],
        pieceInfo[1],
        numToAlgebraic([rowNum as idxLimit, col as idxLimit])
      )
    })

    return row
  }

  const boardInFen = fen.split(' ')[0]

  const maybeBoard: Board = boardInFen
    .split('/')
    .reverse()
    .map((row, idx) => stringToRow(row, idx as idxLimit))

  const g = new Game()

  g.board = maybeBoard

  return g
}

/**
 * If the game is against a computer, and it is the computer's turn, this
 * makes a move for the computer and calls `cleanup()` after.
 * @param {Game} g - game
 * @returns a move object if it was successful, null otherwise
 */
export const makeComputerMove = (g: Game): Maybe<Move> => {
  function randomPromotionPiece(): promotionName {
    const pieces: promotionName[] = ['knight', 'rook', 'bishop', 'queen']
    return pieces[random(4)]
  }

  const info: Info = g.info

  let finalMove: Maybe<Move> = null

  // make sure it is the computer's turn
  if (!g.isComputerMove) return null

  // get all piece locations
  const moves = g.possibleMoves(info.currentPlayer)

  if (g.info.currentPlayer === 'white') console.log(moves)

  if (!moves) return null

  // get the validMoves for one location
  const validMovesForOneLocation = moves[random(moves.length)]

  // select one of the valid moves
  const oneMoveForOneLocation =
    validMovesForOneLocation.moves[
      random(validMovesForOneLocation.moves.length)
    ]

  // make the move
  const afterMoveObj = validMovesForOneLocation.makeMove(oneMoveForOneLocation)

  if (afterMoveObj) {
    finalMove = afterMoveObj.promote
      ? afterMoveObj.promote(randomPromotionPiece())
      : afterMoveObj.move
  }

  g.cleanup()

  return finalMove
}

export class Piece {
  private _name: name
  private _color: color
  private _location: location

  private _previousLocations: location[] = []
  private _hasBeenMoved: boolean = false
  private _isRemoved: boolean = false
  private _numberOfMoves: number = 0

  constructor(name: name, color: color, location: location) {
    this._name = name
    this._color = color
    this._location = location
  }

  /* Pure methods */

  /**
   * Returns a deep copy of the piece the method is called on
   */
  copy() {
    const copiedPiece = new Piece(this.name, this.color, this.location)
    copiedPiece._hasBeenMoved = this._hasBeenMoved

    return copiedPiece
  }

  /**
   * If the move is one of the four return values, that will be returned.
   * We can't check the validity of the move here because we only have info
   * about this piece. If the move is not one of those 4, it will return null.
   * @param to
   * @returns movetype or null
   */
  moveType(
    to: location
  ): Maybe<'bigpawn' | 'promotion' | 'castle' | 'diagpawn'> {
    const [curRow, curCol] = algebraicToNum(this.location) as coords
    const [newRow, newCol] = algebraicToNum(to) as coords

    if (this.name === 'king') {
      if (!this.hasBeenMoved && Math.abs(curCol - newCol) === 2) return 'castle'
    }

    if (this.name === 'pawn') {
      if (Math.abs(curRow - newRow) === 2 && curCol === newCol) return 'bigpawn'
      if (to.slice(1) === '1' || to.slice(1) === '8') return 'promotion'
      if (Math.abs(curRow - newRow) === 1 && Math.abs(curCol - newCol) === 1)
        return 'diagpawn'
    }

    return null
  }

  /* Impure methods */

  remove() {
    this._isRemoved = true
  }

  unremove() {
    this._isRemoved = false
  }

  /**
   * Changes the location of the piece. This sets `_hasBeenMoved`,
   * whereas `set location` does not
   * @param to
   */
  move(to: location) {
    this._previousLocations.push(this.location)
    this._numberOfMoves += 1
    this.location = to
    this._hasBeenMoved = true
  }

  /**
   * Undoes the most recent location change
   */
  unmove() {
    if (this._numberOfMoves === 0) return

    this.location = this._previousLocations.pop() as location
    this._numberOfMoves -= 1

    if (this._numberOfMoves === 0) this._hasBeenMoved = false
  }

  /* Getters */

  get name() {
    return this._name
  }
  get color() {
    return this._color
  }
  get location() {
    return this._location
  }
  get hasBeenMoved() {
    return this._hasBeenMoved
  }
  get isRemoved() {
    return this._isRemoved
  }

  /**
   * Returns a list of the locations that this piece could theoretically move to.
   * Any checks that would require a board or game are not done here
   * so needs to be compared to a list of valid moves for the specific game/board
   */
  get moves(): location[] {
    // Helper function with less type safety
    function unsafeNumToAlg([row, col]: [number, number]): Maybe<location> {
      if (row >= 0 && row <= 7 && col >= 0 && col <= 7) {
        return numToAlgebraic([row as idxLimit, col as idxLimit])
      }
      return null
    }

    const moves: location[] = []
    if (this.isRemoved) return moves

    const [row, column] = algebraicToNum(this._location)

    if (this._name === 'pawn') {
      // It can move one square forward

      // forward is different depending on color
      const oneSqrForward = this._color === 'white' ? row + 1 : row - 1

      // It's okay to assert idxLimit here because when a pawn reaches the last
      // row, it must promote. Therefore, oneSqrForward must be >=0 && <=7
      const oneSqrForwardLoc = numToAlgebraic([
        oneSqrForward as idxLimit,
        column,
      ])

      moves.push(oneSqrForwardLoc)

      // If the pawn hasn't moved, it can move forward two spaces
      if (!this._hasBeenMoved) {
        const twoSqrForward = this._color === 'white' ? row + 2 : row - 2

        // It's okay to assert idxLimit here because if a pawn hasn't moved yet then
        // twoSqrForward will be within the board
        const twoSqrForwardLoc = numToAlgebraic([
          twoSqrForward as idxLimit,
          column,
        ])

        moves.push(twoSqrForwardLoc)
      }

      // Theoretically it could move diagonal one square if it's capturing en passant
      if (this._color === 'white') {
        if (column !== 7)
          moves.push(
            numToAlgebraic([(row + 1) as idxLimit, (column + 1) as idxLimit])
          )
        if (column !== 0)
          moves.push(
            numToAlgebraic([(row + 1) as idxLimit, (column - 1) as idxLimit])
          )
      } else {
        if (column !== 7)
          moves.push(
            numToAlgebraic([(row - 1) as idxLimit, (column + 1) as idxLimit])
          )
        if (column !== 0)
          moves.push(
            numToAlgebraic([(row - 1) as idxLimit, (column - 1) as idxLimit])
          )
      }
    }

    if (this._name === 'rook' || this._name === 'queen') {
      // keep row constant, add all spaces in the column
      // (except the one the piece is currently on)
      for (let i = 0; i < 8; i++) {
        const loc = numToAlgebraic([row, i as idxLimit])
        if (loc !== this._location) moves.push(loc)
      }

      // keep column constant, add all spaces in the row
      // (except the one the piece is currently on)
      for (let i = 0; i < 8; i++) {
        const loc = numToAlgebraic([i as idxLimit, column])
        if (loc !== this._location) moves.push(loc)
      }
    }

    if (this._name === 'bishop' || this._name === 'queen') {
      // each loop will grab all squares in one line

      // diagonal up + right
      for (let i = row, j = column; i < 8 && j < 8; i++, j++) {
        const loc = numToAlgebraic([i, j])
        if (loc !== this._location) moves.push(loc)
      }

      // diagonal up + left
      for (let i = row, j = column; i < 8 && j >= 0; i++, j--) {
        const loc = numToAlgebraic([i, j])
        if (loc !== this._location) moves.push(loc)
      }

      // diagonal down + right
      for (let i = row, j = column; i >= 0 && j < 8; i--, j++) {
        const loc = numToAlgebraic([i, j])
        if (loc !== this._location) moves.push(loc)
      }

      // diagonal down + left
      for (let i = row, j = column; i >= 0 && j >= 0; i--, j--) {
        const loc = numToAlgebraic([i, j])
        if (loc !== this._location) moves.push(loc)
      }
    }

    if (this._name === 'knight') {
      // only 8 possible squares, so checking if top, right, bottom, + left two are valid

      const unsafeLocs: Maybe<location>[] = []

      unsafeLocs.push(unsafeNumToAlg([row + 2, column + 1]))
      unsafeLocs.push(unsafeNumToAlg([row + 2, column - 1]))
      unsafeLocs.push(unsafeNumToAlg([row + 1, column + 2]))
      unsafeLocs.push(unsafeNumToAlg([row + 1, column - 2]))
      unsafeLocs.push(unsafeNumToAlg([row - 2, column + 1]))
      unsafeLocs.push(unsafeNumToAlg([row - 2, column - 1]))
      unsafeLocs.push(unsafeNumToAlg([row - 1, column + 2]))
      unsafeLocs.push(unsafeNumToAlg([row - 1, column - 2]))

      const locs = unsafeLocs.filter(e => !!e)

      // It is okay to assert this because we removed the null values above
      moves.push(...(locs as location[]))
    }

    if (this._name === 'king') {
      const unsafeLocs: Maybe<location>[] = []

      // Add castling moves
      if (!this.hasBeenMoved) {
        unsafeLocs.push(unsafeNumToAlg([row, column - 2]))
        unsafeLocs.push(unsafeNumToAlg([row, column + 2]))
      }

      unsafeLocs.push(unsafeNumToAlg([row + 1, column + 1]))
      unsafeLocs.push(unsafeNumToAlg([row + 1, column]))
      unsafeLocs.push(unsafeNumToAlg([row + 1, column - 1]))
      unsafeLocs.push(unsafeNumToAlg([row, column + 1]))
      unsafeLocs.push(unsafeNumToAlg([row, column - 1]))
      unsafeLocs.push(unsafeNumToAlg([row - 1, column + 1]))
      unsafeLocs.push(unsafeNumToAlg([row - 1, column]))
      unsafeLocs.push(unsafeNumToAlg([row - 1, column - 1]))

      const locs = unsafeLocs.filter(e => !!e)

      // It is okay to assert this because we removed the null values above
      moves.push(...(locs as location[]))
    }

    return moves
  }

  /* Setters */

  set location(loc: location) {
    this._location = loc
  }
}

export class Game {
  // Properties that are not set when an instance of the class is created
  private _onlineOrLocal: gamelocation
  private _playerViewColor: color
  private _type: gametype
  private _winner: color

  // Properties that are set when an instance of the class is created
  private _white: string = 'White'
  private _black: string = 'Black'
  private _board: Board = this.newBoard()
  private _status: gamestatus = 'active'
  private _dateStarted: Date = new Date()
  private _clientID: number = this._dateStarted.valueOf()

  private _currentMoveNumber: number = 1
  private _currentPlayerColor: color = 'white'
  private _previousMoves: Move[] = []
  private _removedPieces: Piece[] = []
  private _needsCleanup: boolean = false
  private _enPassantColor: Maybe<location> = null

  /* "Setters" */

  setOnlineOrLocal(val: gamelocation) {
    this._onlineOrLocal = val
    return this
  }

  setPlayerViewColor(color: color) {
    this._playerViewColor = color
    return this
  }

  /**
   * This is better than having a property for computerColor for several reasons:
   * - Not all games are played against a computer
   * - Ensures type safety - if we were to use a property like 'opponentColor',
   *   the type would be string, whereas the type used in this 'setter' is `color`
   *
   */
  setComputerColor(color: color) {
    if (color === 'white') this._white = 'computer'
    if (color === 'black') this._black = 'computer'

    return this
  }

  setGameType(type: gametype) {
    this._type = type
    return this
  }

  setWhite(name: string) {
    this._white = name
    return this
  }

  setBlack(name: string) {
    this._black = name
    return this
  }

  /********************
   *                  *
   *   Pure methods   *
   *                  *
   ********************/

  /* Public */

  /**
   *
   * @param loc
   * @returns
   */
  pieceAt(loc: location): Maybe<Piece> {
    const [row, col] = algebraicToNum(loc)

    return this._board[row][col]
  }

  /**
   * @callback makeMove
   * @param {Move} move - the move that should be made
   */

  /**
   * Looks for all of the valid moves for the piece at @loc@
   * If @loc@ is empty, returns an empty array
   * @param {location} location - the location we're looking for the valid moves from
   * @returns {Object}
   * @property {Move[]} obj.moves - a list of Moves - these are all possible moves
   *                                from the given location
   * @property {makeMove} [obj.makeMove] - a function that should be called to make a move
   */
  validMoves(location: location): Maybe<{
    moves: [Move, ...Move[]]
    makeMove: (m: Move) => Maybe<{
      move: Move
      promote?: (n: promotionName) => Maybe<Move>
    }>
  }> {
    const moves: Move[] | [Move, ...Move[]] = []
    const piece = this.pieceAt(location)

    if (!piece || piece.isRemoved) return null

    const pieceLocations = piece.moves.filter(
      loc =>
        this._basicValidMoveChecks(piece, loc) &&
        this._isMoveUnobstructed(piece, loc) &&
        this._isValidCastlingMove(piece, loc) &&
        this._isValidPawnMove(piece, loc)
    )

    pieceLocations.forEach(loc => {
      const move = this._getMoveObject(piece, piece.location, loc)
      this._makeMove(move)
      if (!this._isKingCapturable(piece.color)) moves.push(move)
      this._undoMove()
    })

    return movesArrHasAtLeastOneItem(moves)
      ? { moves: moves, makeMove: this._makeMove.bind(this) }
      : null
  }

  /**
   * Returns a list of all possible moves for @color@. i.e. this is
   * the result of calling `validMoves` on all locations, and filtering
   * out the locations with no valid moves.
   * The caller of this method must make sure it is @color@'s turn
   * before calling this
   * @param color
   * @returns If @color@ has any possible moves, returns an array where
   *          each item is the result of calling `validMoves` on one
   *          location. Null values are filtered out.
   *
   *          If @color@ has no possible moves, returns null
   */
  possibleMoves(color: color): Maybe<
    {
      moves: [Move, ...Move[]]
      makeMove: (m: Move) => Maybe<{
        move: Move
        promote?: (n: promotionName) => Maybe<Move>
      }>
    }[]
  > {
    const moves = filterNullsFromList(
      this._pieceLocations(color).map(l => this.validMoves(l))
    )

    return moves.length === 0 ? null : moves
  }

  /**
   * Meant to be called at the end of a turn
   */
  cleanup(): void {
    if (!this.needsCleanup) return

    this.swapPlayers()
    this._currentMoveNumber += 1
    const checkmate = this.isCheckmate(this._currentPlayerColor)
    if (checkmate) {
      this.status = 'inactive'
      this.winner = this._currentPlayerColor === 'white' ? 'black' : 'white'
    }

    this._needsCleanup = false
  }

  /**
   * Returns an array of all the pieces of the specified color
   * @param color the color of pieces we're looking for
   * @returns an array of pieces of the specified color on the current game board
   */
  pieces(color: color) {
    const pieces: Piece[] = []

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const p = this.pieceAt(numToAlgebraic([i as idxLimit, j as idxLimit]))
        if (p?.color === color) pieces.push(p)
      }
    }

    return pieces
  }

  /* Private */

  /**
   * @param color the color of king we're checking
   * @returns boolean. Also returns false if there were any errors
   */
  private _isKingCapturable(color: color): boolean {
    let kingLocation: Maybe<location> = null

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const loc = numToAlgebraic([i as idxLimit, j as idxLimit])
        const p = this.pieceAt(loc)
        if (p?.name === 'king' && p.color === color) {
          kingLocation = p.location
        }
        if (kingLocation) break
      }
      if (kingLocation) break
    }

    if (!kingLocation) return false

    return this._isSquareCapturable(kingLocation, color)
  }

  /**
   * This method does not consider ep capture, castling moves, or basic valid move checks
   * - ep: an ep capture can only ever capture a pawn, and this method is only
   *       used to check if a King can be captured
   * - castle: cannot capture during a castle move
   * - basic: this checks if the correct color is trying to move, if they're trying
   *          to move onto the square they're currently on, and if they're trying to
   *          capture a piece of their own color. These checks don't matter here
   * @param loc
   * @param {color} color - the color we are pretending is on the square
   */
  private _isSquareCapturable(loc: location, color: color): boolean {
    const otherColorPieces = this.pieces(color === 'white' ? 'black' : 'white')

    for (const piece of otherColorPieces) {
      if (piece.moves.includes(loc)) {
        if (this._isMoveUnobstructed(piece, loc)) return true
      }
    }
    return false
  }

  /**
   * If the move is a capture, returns that piece that would be captured.
   * This method assumes that the move is valid.
   *
   * For example, if the move is an ep capture, this method will not check
   * that the piece being captured moved two squares on the most recent move.
   * It would still return the captured pawn if there is one. It is the
   * responsibility of the calling function to verfiy that the ep move is valid.
   */
  private _getMoveCapture(p: Piece, to: location): Maybe<Piece> {
    const from = p.location
    const toPiece = this.pieceAt(to)

    if (p.moveType(to) === 'diagpawn') {
      const [fromRow, fromCol] = algebraicToNum(from)
      const [toRow, toCol] = algebraicToNum(to)

      const enPassantCaptureLocation = numToAlgebraic([fromRow, toCol])

      return this.lastMove.bigPawnMove &&
        this.lastMove.to === enPassantCaptureLocation
        ? this.pieceAt(enPassantCaptureLocation)
        : toPiece
    }
    return toPiece
  }

  /**
   * This method does not check the validity of the move being attempted.
   * It also assumes that the piece is not removed
   * @param p
   * @param to
   */
  private _getMoveObject(p: Piece, from: location, to: location): Move {
    const move: Move = {
      piece: p,
      from,
      to,
      number: this._currentMoveNumber,
    }

    const capture = this._getMoveCapture(p, to)
    const moveType = p.moveType(to)
    const castle =
      moveType === 'castle' ? this._getCastlingRookInfo(p, to) : null

    if (capture) move.capture = capture
    if (castle) move.castle = castle
    if (moveType === 'promotion') move.promotion = true
    if (moveType === 'bigpawn') move.bigPawnMove = true

    return move
  }

  /**
   * You must ensure that the piece param is valid before calling
   * this method.
   *
   * This method checks the following:
   * - the piece being moved is the same color as the current player color
   * - the piece is not attempting to be moved to the location it's already in
   * - if there is a piece in the square we're attempting to move to, it is not
   *   the same color as the piece being moved
   * @param {Piece} p - the piece being moved
   * @param {location} to - the location being moved to
   * @returns {boolean}
   */
  private _basicValidMoveChecks(p: Piece, to: location): boolean {
    if (this._currentPlayerColor !== p.color) return false

    // cannot move to the square the piece is already in
    if (to === p.location) return false

    const toPiece = this.pieceAt(to)
    if (p.color === toPiece?.color) return false

    return true
  }

  /**
   * If the piece being moved is a pawn, this method checks a few things:
   * - if the piece is attempting to be moved diagonally,
   *   it must be capturing another piece, EITHER directly or via
   *   en passant
   * - if the piece is not moving diagonally, it must not be capturing
   *   another piece
   * @param p
   * @param to
   */
  private _isValidPawnMove(p: Piece, to: location): boolean {
    if (p.isRemoved) return false
    if (p.name !== 'pawn') return true

    const [newRow, newCol] = algebraicToNum(to)
    const [curRow, curCol] = algebraicToNum(p.location)

    // if the piece is not moving diagonally
    if (curCol === newCol) return !this.pieceAt(to)

    return (
      !!this.pieceAt(to) ??
      (this.lastMove.bigPawnMove &&
        this.lastMove.from === numToAlgebraic([curRow, newCol]))
    )
  }

  /**
   * If the piece being moved is a rook, bishop, or queen,
   * this will return true if it is not jumping over any
   * pieces.
   *
   * If the piece being moved is not one of those three, it
   * will return true.
   * @param p
   * @param to
   * @returns
   */
  private _isMoveUnobstructed(p: Piece, to: location): boolean {
    if (p.isRemoved) return false

    if (
      p.name === 'knight' ||
      p.name === 'king' ||
      (p.name === 'pawn' && p.moveType(to) !== 'bigpawn')
    )
      return true

    if (p.name === 'bishop') return this._isDiagonalMoveUnobstructed(p, to)
    if (p.name === 'rook' || p.name === 'pawn')
      return this._isHorizontalMoveUnobstructed(p, to)

    // The only piece left is queen
    return (
      this._isDiagonalMoveUnobstructed(p, to) &&
      this._isHorizontalMoveUnobstructed(p, to)
    )
  }

  private _isDiagonalMoveUnobstructed(p: Piece, to: location): boolean {
    // Any other pieces would never move diagonally so they would never
    // have an obstructed diagonal move
    if (p.name !== 'bishop' && p.name !== 'queen') return true

    const [newRow, newCol] = algebraicToNum(to)
    const [curRow, curCol] = algebraicToNum(p.location)

    // if the piece is not moving diagonally, return true
    if (newRow === curRow || newCol === curCol) return true

    // if the piece is only moving one square
    // we do not need to check for anything else
    if (Math.abs(curRow - newRow) === 1) return true

    // this entire if/else block checks to make sure there
    // are no pieces on in-between squares

    if (newRow > curRow) {
      // moving up
      if (newCol > curCol) {
        // moving right
        for (
          let i = curRow + 1, j = curCol + 1;
          i < newRow && j < newCol;
          i++, j++
        ) {
          if (this.pieceAt(numToAlgebraic([i as idxLimit, j as idxLimit])))
            return false
        }
      } else {
        // moving left
        for (
          let i = curRow + 1, j = curCol - 1;
          i < newRow && j > newCol;
          i++, j--
        ) {
          if (this.pieceAt(numToAlgebraic([i as idxLimit, j as idxLimit])))
            return false
        }
      }
    } else {
      // moving down
      if (newCol > curCol) {
        // moving right
        for (
          let i = curRow - 1, j = curCol + 1;
          i > newRow && j < newCol;
          i--, j++
        ) {
          if (this.pieceAt(numToAlgebraic([i as idxLimit, j as idxLimit])))
            return false
        }
      } else {
        // moving left
        for (
          let i = curRow - 1, j = curCol - 1;
          i > newRow && j > newCol;
          i--, j--
        ) {
          if (this.pieceAt(numToAlgebraic([i as idxLimit, j as idxLimit])))
            return false
        }
      }
    }
    return true
  }

  private _isHorizontalMoveUnobstructed(p: Piece, to: location): boolean {
    // Any other pieces would never move horizontally so they
    // would never have an obstructed horizontal move
    if (p.name !== 'rook' && p.name !== 'queen' && p.name !== 'pawn')
      return true

    const [newRow, newCol] = algebraicToNum(to)
    const [curRow, curCol] = algebraicToNum(p.location)

    // if the piece is not moving horizontally, return true for queen - still need to check diag
    if (curRow !== newRow && curCol !== newCol) return p.name !== 'rook'

    // piece is moving horizontally
    if (curRow === newRow) {
      if (Math.abs(curCol - newCol) === 1) return true

      // piece is moving to the left
      if (curCol > newCol) {
        for (let i = newCol + 1; i < curCol; i++) {
          if (this.pieceAt(numToAlgebraic([newRow, i as idxLimit])))
            return false
        }
      }

      // piece is moving to the right
      if (curCol < newCol) {
        for (let i = curCol + 1; i < newCol; i++) {
          if (this.pieceAt(numToAlgebraic([newRow, i as idxLimit])))
            return false
        }
      }
    }

    // piece is moving vertically
    if (curCol === newCol) {
      if (Math.abs(curRow - newRow) === 1) return true

      // piece is moving down
      if (curRow > newRow) {
        for (let i = newRow + 1; i < curRow; i++) {
          if (this.pieceAt(numToAlgebraic([i as idxLimit, newCol])))
            return false
        }
      }

      // piece is moving up
      if (curRow < newRow) {
        for (let i = curRow + 1; i < newRow; i++) {
          if (this.pieceAt(numToAlgebraic([i as idxLimit, newCol])))
            return false
        }
      }
    }
    return true
  }

  /**
   * If the move being attempted is a castle, this will return
   * true if it is valid.
   *
   * If it is not a castle, it will return true.
   * @param p
   * @param to
   * @returns
   */
  private _isValidCastlingMove(p: Piece, to: location): boolean {
    const [newRow, newCol] = algebraicToNum(to) as coords
    const [curRow, curCol] = algebraicToNum(p.location) as coords

    // If not a king, it's not a castle
    if (p.name !== 'king') return true

    // If the row isn't staying the same, it's not a castle
    if (newRow !== curRow) return true

    // If the king isn't moving 2 squares, it's not a castle
    if (Math.abs(curCol - newCol) !== 2) return true

    // not allowed to castle if king is in check
    if (this._isKingCapturable(p.color)) return false

    // Do this before checking if squares are capturable - put it back at the end
    this._board[curRow][curCol] = null

    if (newCol > curCol) {
      // this would be a king-side castle
      const kingsideRook = this.pieceAt(numToAlgebraic([curRow, 7]))

      if (!kingsideRook || kingsideRook.hasBeenMoved) return false

      if (
        // all squares in between must be empty
        this.pieceAt(numToAlgebraic([curRow, (curCol + 1) as idxLimit])) ||
        this.pieceAt(numToAlgebraic([curRow, (curCol + 2) as idxLimit]))
      ) {
        return false
      }

      if (
        this._isSquareCapturable(
          numToAlgebraic([curRow, (curCol + 1) as idxLimit]),
          p.color
        ) ||
        this._isSquareCapturable(
          numToAlgebraic([curRow, (curCol + 2) as idxLimit]),
          p.color
        )
      ) {
        return false
      }
    }

    if (newCol < curCol) {
      // queen-side castle
      const queensideRook = this.pieceAt(numToAlgebraic([curRow, 0]))

      if (!queensideRook || queensideRook.hasBeenMoved) return false

      // TODO -
      if (
        this.pieceAt(numToAlgebraic([curRow, (curCol - 1) as idxLimit])) ||
        this.pieceAt(numToAlgebraic([curRow, (curCol - 2) as idxLimit]))
      ) {
        return false
      }

      if (
        this._isSquareCapturable(
          numToAlgebraic([curRow, (curCol - 1) as idxLimit]),
          p.color
        ) ||
        this._isSquareCapturable(
          numToAlgebraic([curRow, (curCol - 2) as idxLimit]),
          p.color
        )
      ) {
        return false
      }
    }

    this._board[curRow][curCol] = p

    // if we passed all checks then this is a valid move
    return true
  }

  /**
   * Returns true if @color@ is in checkmate.
   * Meant to be called in the `cleanup` method (need to swapplayers first)
   * @param {color} color - the color we're checking if is in checkmate
   */
  private isCheckmate(color: color): boolean {
    if (this._currentPlayerColor !== color) return false

    return this._isKingCapturable(color)
  }

  private _pieceLocations(color: color): location[] {
    return this.pieces(color).map(p => p.location)
  }

  /********************
   *                  *
   *  Impure methods  *
   *                  *
   ********************/

  /* Private */

  /**
   * @callback promote
   * @param {promotionName} n - the name of the piece that we are promoting to
   */

  /**
   * Makes a chess move
   * @param {Move} move - a move object that contains information about the move to be made
   * @returns {Object} obj
   * @property {Move} obj.move - the move that was made
   * @property {promote} [obj.promote] - if the move results in a promotion, this is a
   *                                     function that must be called in order to complete
   *                                     the move
   */
  private _makeMove(
    move: Move
  ): Maybe<{ move: Move; promote?: (n: promotionName) => Maybe<Move> }> {
    const p = move.piece
    const to = move.to
    const capturePiece = move.capture

    if (p.isRemoved) return null

    if (capturePiece) this._removePiece(capturePiece)
    this._movePiece(p, to)

    if (move.castle) {
      this._movePiece(move.castle.piece, move.castle.to)
    }

    this._addMove(move)

    this._needsCleanup = true

    return move.promotion
      ? { move: move, promote: this._promotionPiece.bind(this) }
      : { move: move }
  }

  /**
   * This is used for testing moves so we don't need to undo promotions here
   * @returns
   */
  private _undoMove() {
    if (this._previousMoves.length === 0) return

    const move = this.popLastMove

    if (!move) return

    const { piece, capture, castle } = move

    // move piece to previous square
    this._unmovePiece(piece, move.from)

    // if castle, move rook back and make sure it's marked as not moved
    if (castle) this._unmovePiece(castle.piece, castle.from)

    // add captured piece back to the board
    if (capture) this._unremovePiece(capture)

    this._needsCleanup = false
  }

  private _removePiece(p: Piece) {
    if (p.isRemoved) return

    const [row, col] = algebraicToNum(p.location)

    p.remove()

    this._board[row][col] = null
    this._removedPieces.push(p)
  }

  /**
   * This handles all logic for unremoving a piece
   * @param p
   */
  private _unremovePiece(p: Piece) {
    if (!p.isRemoved) return

    const [row, col] = algebraicToNum(p.location)

    p.unremove() // this changes the isRemoved property to false

    this._removedPieces.pop()

    this._board[row][col] = p
  }

  private _movePiece(p: Piece, to: location) {
    this.__pieceMove(p, to, 'move')
  }

  /**
   * The same as `_movePiece`, but calls piece.unmove()
   * @param p
   * @param to
   */
  private _unmovePiece(p: Piece, to: location) {
    this.__pieceMove(p, to, 'unmove')
  }

  private __pieceMove(p: Piece, to: location, type: 'move' | 'unmove') {
    const [curRow, curCol] = algebraicToNum(p.location)
    const [newRow, newCol] = algebraicToNum(to)

    this._board[curRow][curCol] = null
    this._board[newRow][newCol] = p

    if (type === 'move') p.move(to)
    if (type === 'unmove') p.unmove()
  }

  /**
   * If the move being attempted is an en passant capture, this will
   * return true if it is a valid capture.
   *
   * If it is not an ep capture, it will return true.
   * @param p
   * @param to
   */
  private _isValidEPCapture(p: Piece, to: location): boolean {
    if (p.name !== 'pawn') return true

    const [curRow, curCol] = algebraicToNum(p.location)
    const [newRow, newCol] = algebraicToNum(to)

    if (Math.abs(curCol - newCol) !== 1) return true

    // At this point we know we're attempting an ep capture
    const possibleCapturePiece = this.pieceAt(numToAlgebraic([curRow, newCol]))

    return !!(
      this._currentMoveNumber !== 1 &&
      possibleCapturePiece === this.lastMove?.piece &&
      this.lastMove?.bigPawnMove
    )
  }

  /**
   * Assumes the move is a valid castle and returns the appropriate castling
   * info to be put in a Move object. It is the responsibilty of the calling
   * function to ensure that the move is a valid castle
   * @param p
   * @param to
   */
  private _getCastlingRookInfo(
    p: Piece,
    to: location
  ): { from: location; to: location; piece: Piece } {
    if (p.color === 'white') {
      if (to === 'c1')
        return { from: 'a1', to: 'd1', piece: this.pieceAt('a1') as Piece }
      else return { from: 'h1', to: 'f1', piece: this.pieceAt('h1') as Piece }
    }

    // The piece must be the black king

    if (to === 'c8')
      return { from: 'a8', to: 'd8', piece: this.pieceAt('a8') as Piece }
    else return { from: 'h8', to: 'f8', piece: this.pieceAt('h8') as Piece }
  }

  private _addMove(move: Move) {
    this._previousMoves.push(move)
  }

  /**
   * This method does a few things
   * 1. Creates a new piece for whichever piece name is passed in.
   * 2. Adds this promotion piece to the most recent move.
   * 3. On the `_currentBoard`, replaces the pawn from the last
   *    move with the new piece that was created.
   * @param {promotionName} n - the name of the piece to promote to
   * @returns {Maybe<move>} if successful, returns the move object
   */
  private _promotionPiece(n: promotionName): Maybe<Move> {
    const move = this.popLastMove

    if (!move) return null

    // 1.
    const newPiece = new Piece(n, move.piece.color, move.to)

    // 2.
    move.promotionPiece = newPiece
    this._addMove(move)

    // 3.
    this._replacePiece(move.to, newPiece)

    return this.lastMove
  }

  private _replacePiece(loc: location, p: Piece) {
    const [row, col] = algebraicToNum(loc)
    this._board[row][col] = p
  }

  private swapPlayers() {
    this._currentPlayerColor =
      this._currentPlayerColor === 'white' ? 'black' : 'white'
  }

  private newBoard(): Board {
    let gameBoard = Array.from(Array(8), () => new Array(8))

    gameBoard[0][0] = new Piece('rook', 'white', 'a1')
    gameBoard[0][1] = new Piece('knight', 'white', 'b1')
    gameBoard[0][2] = new Piece('bishop', 'white', 'c1')
    gameBoard[0][3] = new Piece('queen', 'white', 'd1')
    gameBoard[0][4] = new Piece('king', 'white', 'e1')
    gameBoard[0][5] = new Piece('bishop', 'white', 'f1')
    gameBoard[0][6] = new Piece('knight', 'white', 'g1')
    gameBoard[0][7] = new Piece('rook', 'white', 'h1')

    gameBoard[1][0] = new Piece('pawn', 'white', 'a2')
    gameBoard[1][1] = new Piece('pawn', 'white', 'b2')
    gameBoard[1][2] = new Piece('pawn', 'white', 'c2')
    gameBoard[1][3] = new Piece('pawn', 'white', 'd2')
    gameBoard[1][4] = new Piece('pawn', 'white', 'e2')
    gameBoard[1][5] = new Piece('pawn', 'white', 'f2')
    gameBoard[1][6] = new Piece('pawn', 'white', 'g2')
    gameBoard[1][7] = new Piece('pawn', 'white', 'h2')

    gameBoard[6][0] = new Piece('pawn', 'black', 'a7')
    gameBoard[6][1] = new Piece('pawn', 'black', 'b7')
    gameBoard[6][2] = new Piece('pawn', 'black', 'c7')
    gameBoard[6][3] = new Piece('pawn', 'black', 'd7')
    gameBoard[6][4] = new Piece('pawn', 'black', 'e7')
    gameBoard[6][5] = new Piece('pawn', 'black', 'f7')
    gameBoard[6][6] = new Piece('pawn', 'black', 'g7')
    gameBoard[6][7] = new Piece('pawn', 'black', 'h7')

    gameBoard[7][0] = new Piece('rook', 'black', 'a8')
    gameBoard[7][1] = new Piece('knight', 'black', 'b8')
    gameBoard[7][2] = new Piece('bishop', 'black', 'c8')
    gameBoard[7][3] = new Piece('queen', 'black', 'd8')
    gameBoard[7][4] = new Piece('king', 'black', 'e8')
    gameBoard[7][5] = new Piece('bishop', 'black', 'f8')
    gameBoard[7][6] = new Piece('knight', 'black', 'g8')
    gameBoard[7][7] = new Piece('rook', 'black', 'h8')

    // set all empty squares to null
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (!gameBoard[i][j]) gameBoard[i][j] = null
      }
    }

    return gameBoard
  }

  /* Getters */

  get white() {
    return this._white
  }
  get black() {
    return this._black
  }

  /**
   * Before calling this, verify that there actually is a previous move
   */
  get lastMove() {
    return this._previousMoves[this._previousMoves.length - 1]
  }

  get popLastMove() {
    return this._previousMoves.pop()
  }

  get needsCleanup() {
    return this._needsCleanup
  }

  get board() {
    return this._board
  }

  get info(): Info {
    return {
      move: this._currentMoveNumber,
      clientID: this._clientID,
      currentPlayer: this._currentPlayerColor,
      location: this._onlineOrLocal,
      playerColor: this._playerViewColor,
      type: this._type,
      winner: this._winner,
      white: this._white,
      black: this._black,
      status: this._status,
    }
  }

  get isComputerMove() {
    if (this._type !== 'computer') return false

    const curColor = this._currentPlayerColor
    const computerColor = this._white === 'computer' ? 'white' : 'black'

    return curColor === computerColor
  }

  get previousMoves() {
    return this._previousMoves
  }

  /* Setters */

  set board(b: Board) {
    this._board = b
  }

  private set status(st: gamestatus) {
    this._status = st
  }

  private set winner(color: color) {
    this._winner = color
  }
}

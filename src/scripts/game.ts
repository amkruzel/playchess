/**
 * 
 * model/game
 * 
 */

import { copyBoard, newBoard } from "./board"
import { algebraicToNum, delay, isError, logModelError, numToAlgebraic, parseLocationToAlg, parseLocationToCoords } from "./common"
import { ChessPiece, copyPiece, isRook } from "./piece"
import { isPawn } from "./piece"
import { CURRENT_GAME, IS_CHECKMATE } from "../stores"

// Functions for the Game type

const swapPlayersGame = function(): void {
  this.currentPlayerColor = this.currentPlayerColor === 'white' ? 'black' : 'white'
}

const getPieceGame = function(loc: sqrLocation): Square {
  const [x, y] = parseLocationToCoords(loc)
  return this.currentBoard[x][y]
}

const removePieceGame = function(loc: sqrLocation): void {
  const [x, y] = parseLocationToCoords(loc)
  const piece = this.getPiece(loc)
  if (piece === null) return

  this.currentBoard[x][y] = null
  this.removedPieces.push(piece)
}

const newGame = (loc: gameloction, type: gametype, wp: string, bp: string, color: color): Game => {
  return { id: new Date().valueOf()
         , dateStarted: new Date()
         , currentPlayerColor: 'white'
         , playerViewColor: color
         , currentBoard: newBoard()
         , previousBoard: []
         , isEnPassantLegal: false
         , currentMoveNumber: 1
         , enforceAlternatingTurns: true
         , location: loc
         , type: type
         , previousMoves: []
         , removedPieces: []
         , whitePlayer: wp
         , blackPlayer: bp
         , swapPlayers: swapPlayersGame
         , getPiece: getPieceGame 
         , removePiece: removePieceGame }
}

const newGameWithoutAlternatingTurns = (): Game => {
  let g = newGame('local', 'computer', 'asdf', 'asdf', 'white')
  g.enforceAlternatingTurns = false
  return g
} 

const copyGame = (game: Game): Game => {
  return { id: game.id
         , dateStarted: game.dateStarted
         , currentPlayerColor: game.currentPlayerColor
         , playerViewColor: game.playerViewColor
         , currentBoard: copyBoard(game.currentBoard)
         , previousBoard: copyBoard(game.previousBoard)
         , isEnPassantLegal: game.isEnPassantLegal
         , currentMoveNumber: game.currentMoveNumber
         , enforceAlternatingTurns: game.enforceAlternatingTurns
         , location: game.location
         , type: game.type
         , previousMoves: [...game.previousMoves]
         , removedPieces: game.removedPieces
         , whitePlayer: game.whitePlayer
         , blackPlayer: game.blackPlayer
         , winner: game.winner
         , swapPlayers: swapPlayersGame
         , getPiece: getPieceGame 
         , removePiece: removePieceGame }
}

class ChessGame {
  /**
   * 
   * @param game - the game in which the piece is being moved
   * @param from - the sqiare the piece is moving from
   * @param to   - the square the piece is moving to
   */
  static movePiece(game: Game, from: sqrLocation, to: sqrLocation, doCleanup: boolean = true): Maybe<Error> {
    const [oldX, oldY] = parseLocationToCoords(from)
    const [newX, newY] = parseLocationToCoords(to)
    const toAlg = parseLocationToAlg(to)
    const piece = game.getPiece(from)

    const error = { 
      name: "Invalid square"
    , message: "The square you tried to move from does not contain a piece." }

    if (piece === null) {
      return error
    }

    game.previousBoard = copyBoard(game.currentBoard)

    if(!isPawn(piece)) game.isEnPassantLegal = false
    if (isPawn(piece)) {
      const valid = ChessPiece.isTwoSquareMove(piece, toAlg)

      piece.lastMoveWasTwoSquares = valid
      game.isEnPassantLegal = valid
    }

    ChessGame.addPreviousMove(game, piece, toAlg)

    if (ChessGame.isMoveACapture(game, from, to)) {
      game.removePiece(ChessGame.getCapturedPiece(game, from, to).location)
    }

    piece.changeLocation(toAlg)   

    game.swapPlayers()
    game.currentMoveNumber += 1

    game.currentBoard[newX][newY] = copyPiece(piece)
    game.currentBoard[oldX][oldY] = null    

    /*
    // need to check for checkmate
    if (ChessGame.isKingInCheckmate(game, game.currentPlayerColor)) {
      IS_CHECKMATE.set(true)
      game.winner = game.currentPlayerColor === 'white' ? 'black' : 'white'
    }
    */
    game.needsCleanup = doCleanup

    return null
  }

  static kingLocation(board: Board, color: color): Either<location, Error> {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const sqr = board[i][j]
        if (sqr === null) continue
        if (sqr.color === color && sqr.name === 'king') return (numToAlgebraic([i as idxLimit, j as idxLimit]))
      }
    }
    const error = { name: "No King", message: "There is no King of the specified color on the board." }
    return error
  }

  // checks if the piece at @loc@ can be captured by any piece of the other color
  static canBeCaptured(game: Game, loc: sqrLocation): Either<boolean, Error> {
    const board = game.currentBoard

    let canCapture = false

    const locAlg = parseLocationToAlg(loc)
    const piece = game.getPiece(locAlg)

    if (piece === null) return { name: "Invalid location", message: "The location provided does not contain a piece" }

    const otherColor = piece.color === 'white' ? 'black' : 'white'
    const otherColorPieces = ChessGame.pieces(board, otherColor)

    otherColorPieces.forEach(piece => {
      if (ChessPiece.isValidMove(piece, locAlg, game, false)) canCapture = true
    })

    return canCapture
  }

  static pieces(board: Board, color: color): Piece[] {
    let ary: Piece[] = []

    board.forEach(row => {
      row.forEach(sqr => {
        if (sqr?.color === color) ary.push(sqr)
      })
    })
    return ary
  }

  /**
   * 
   * @param board Board
   * @param color if specified, locations with pieces of this color will be included
   * @param empty by default, will include locations that are empty. If this is false, 
   *              empty locations will not be included
   * @returns A list of algebraic locations
   */
  static locations(board: Board, color?: color, empty: boolean = true): location[] {
    let locAry: location[] = []

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        let sqr = board[i][j]
        if (empty && sqr === null) locAry.push(numToAlgebraic([i as idxLimit, j as idxLimit]))
        if (color !== undefined && sqr !== null) {
          if (sqr.color === color) locAry.push(sqr.location)
        }
      }
    }
    return locAry
  }

  static isKingInCheck(game: Game, color: color): Either<boolean, Error> {
    const kingLoc = ChessGame.kingLocation(game.currentBoard, color)
    if (isError(kingLoc)) return kingLoc

    return ChessGame.canBeCaptured(game, kingLoc)
  }

  static isKingInCheckmate(game: Game, color: color): boolean {
    return ChessGame.possibleMoves(game, color).length === 0
  }

  static isLocationEmpty(gameOrBoard: Game | Board, loc: sqrLocation): boolean {
    const [x, y] = parseLocationToCoords(loc)
    const bd = "currentBoard" in gameOrBoard ? gameOrBoard.currentBoard : gameOrBoard

    if (bd[x][y] === undefined) {
      return false
    }
    return bd[x][y] === null
  }

  static isValidMove(game: Game, from: sqrLocation, to: sqrLocation): boolean {
    const sqr = game.getPiece(from)
    if (sqr === null) return false
    const newLoc = parseLocationToAlg(to)
    const ret = ChessPiece.isValidMove(sqr, newLoc, game)
    if (typeof ret !== 'boolean') {
      logModelError(ret) 
      return false
    }
    return ret
  }

  /**
   * This assumes that the move is valid
   * @param game 
   * @param from 
   * @param to 
   * @returns 
   */
  static isMoveACapture (game: Game, from: sqrLocation, to: sqrLocation): boolean {
    const fromPiece = game.getPiece(from)
    const toPiece = game.getPiece(to)
    const algTo = parseLocationToAlg(to)
    if (fromPiece === null) return false
    if (isPawn(fromPiece) && ChessPiece.isEnPassantCapture(game, fromPiece, algTo)) return true
    if (!isPawn(fromPiece)) return game.getPiece(to) !== null
    return toPiece !== null && fromPiece.color !== toPiece.color
  }

  /**
   * Assumes that the move is a valid capture
   * @param game 
   * @param from 
   * @param to 
   */
  static getCapturedPiece (game: Game, from: sqrLocation, to: sqrLocation): Piece {
    const fromPiece = game.getPiece(from) as Piece
    const toPiece = game.getPiece(to)
    const enPassantCapturePiece = ChessPiece.getEnPassantCapturedPiece(game, fromPiece as Pawn, parseLocationToAlg(to))
    
    return toPiece ?? enPassantCapturePiece
  }

  static getMaybeCapturedPiece (game: Game, from: sqrLocation, to: sqrLocation): Maybe<Piece> {
    const fromPiece = game.getPiece(from) as Piece
    const toPiece = game.getPiece(to)
    const enPassantCapturePiece = 
        isPawn(fromPiece) 
      ? ChessPiece.getEnPassantCapturedPiece(game, fromPiece, parseLocationToAlg(to))
      : null

    return toPiece ?? enPassantCapturePiece
  }

  static possibleMoves (game: Game, color: color): possibleMove[] {
    let moves: possibleMove[] = []

    const pieces = ChessGame.pieces(game.currentBoard, color)

    if (pieces.length === 0) return []

    for (let i = 0; i < pieces.length; i++) {
      moves.push(...ChessPiece.possibleMoves(game, pieces[i]))
    }
    return moves
  }

  static oneRandomPossibleMove (game: Game, color: color): Maybe<possibleMove> {
    const moves = ChessGame.possibleMoves(game, color)
    if (moves.length === 0) return null
    const randIndex = Math.floor(Math.random() * (moves.length - 1))
    return moves[randIndex]
  }
  
  /**
   *  
   * @param game 
   * @param p 
   * @param newLoc 
   * @assumption
   *  - move is a valid castling move
   * 
   * returns null if there is an error
   * 
   */
  static getCastlingMoveRook (game: Game, p: King, newLoc: location): Rook | null {
    const [newX, newY] = algebraicToNum(newLoc)
    const [curX, curY] = algebraicToNum(p.location)

    const ret = game.getPiece([newX, (newY > curY) ? 7 : 0])

    if (ret === null || !isRook(ret)) {
      return null
    }
    return ret
  }

  /**
   * 
   * @param game - current game
   *  - piece has been moved and players have been swapped - 
   *    - need to check for check/checkmate
   *    - need to make computer move if it's computer's turn
   */
  static endOfTurnCleanup(game: Game) {
    const color = game.currentPlayerColor
    const move = ChessGame.oneRandomPossibleMove(game, color)    

    // if null, player has no possible moves - other color wins
    if (move === null) {
      game.winner = color === 'white' ? 'black' : 'white'
    }

    // computer move
    if (game.type === 'computer' && color !== game.playerViewColor) { 
      ChessGame.movePiece(game, move.piece.location, move.to)
    }

    game.needsCleanup = false
  }

  static addPreviousMove(game: Game, p: Piece, to: location) {
    const moveNumber = game.currentMoveNumber
    const pieceMoved = copyPiece(p)
    const pieceCaptured = 
        ChessGame.isMoveACapture(game, p.location, to) 
      ? copyPiece(ChessGame.getCapturedPiece(game, p.location, to))
      : null
    
    game.previousMoves.push({ moveNumber, pieceMoved, pieceCaptured, from: p.location, to})
  }
}

export { ChessGame, newGame, copyGame }
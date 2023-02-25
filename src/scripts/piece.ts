/**
 * 
 * model/piece
 * 
 */

import { flipBoardAndPieces } from "./board"
import { algebraicToNum, numToAlgebraic, isError, flipLocation, logModelError } from "./common"

import { ChessGame, copyGame } from "./game"

// Type predicates

export const isPawn = (piece: Piece): piece is Pawn => {
  return (piece as Pawn).name === 'pawn'
}

export const isRook = (piece: Piece): piece is Rook => {
  return (piece as Rook).name === 'rook'
}

export const isKnight = (piece: Piece): piece is Knight => {
  return (piece as Knight).name === 'knight'
}

export const isBishop = (piece: Piece): piece is Bishop => {
  return (piece as Bishop).name === 'bishop'
}

export const isKing = (piece: Piece): piece is King => {
  return (piece as King).name === 'king'
}

export const isQueen = (piece: Piece): piece is Queen => {
  return (piece as Queen).name === 'queen'
}

// Type functions

const changePieceLocation = function(to: location): void {
  this.location = to
  this.hasBeenMoved = true
}

const newPiece = (name: name, color: color, loc: location): Piece => {
  return { color: color
         , name: name
         , location: loc 
         , hasBeenMoved: false 
         , isRemoved: false
         , changeLocation: changePieceLocation
        }
}

const copyPiece = (p: Piece): Piece => {
  return { color: p.color
         , name: p.name
         , location: p.location
         , hasBeenMoved: p.hasBeenMoved
         , isRemoved: p.isRemoved
         , changeLocation: changePieceLocation }
}

/**
 * 
 * used as a namespace to keep functions related to the Piece type
 * 
 */
class ChessPiece {

  static isTwoSquareMove(p: Pawn, newLoc: location): boolean {
    const [newX, a] = algebraicToNum(newLoc)
    const [oldX, b] = algebraicToNum(p.location)  

    return (Math.abs(oldX - newX) == 2)
  }

  static enPassantHelper(p: Pawn, newLoc: location, game: Game) {
    const isBlack = p.color === 'black'
    const isEmpty = ChessGame.isLocationEmpty(game, newLoc)

    const flippedBoard = flipBoardAndPieces(game.currentBoard)

    const [newX, newY] = 
        isBlack
      ? algebraicToNum(flipLocation(newLoc))
      : algebraicToNum(newLoc)

    const [curX, curY] = 
        isBlack 
      ? algebraicToNum(flipLocation(p.location))
      : algebraicToNum(p.location)

    return { 
      isBlack
    , isEmpty
    , flippedBoard
    , newX, newY
    , curX, curY }
  }

  static isEnPassantCapture (game: Game, p: Pawn, to: location): boolean {
    const { isBlack
          , isEmpty
          , flippedBoard
          , newX, newY
          , curX, curY } = ChessPiece.enPassantHelper(p, to, game)
    
    if (newX - curX === 1 && Math.abs(newY - curY) === 1) { // moving one space forward
      const toPiece = game.getPiece([curX, newY])
      if (toPiece === null) return false
      if (isPawn(toPiece) && toPiece.lastMoveWasTwoSquares && toPiece.color !== p.color) {
        return game.isEnPassantLegal && isEmpty
      }
    }    
    return false
  }

  /**
   * 
   * @param game 
   * @param p 
   * @param to 
   * @returns the piece being captured en passant
   * @assumptions
   *  - the move is a valid en passant capture
   */
  static getEnPassantCapturedPiece (game: Game, p: Pawn, to: location): Piece {
    const { isBlack
          , isEmpty
          , flippedBoard
          , newX, newY
          , curX, curY } = ChessPiece.enPassantHelper(p, to, game)

      return isBlack ? 
      flippedBoard[newX - 1][newY] as Piece 
    : game.currentBoard[newX - 1][newY] as Piece
  }

  static isCastlingMove (p: King, newLoc: location): boolean {
    const [newX, newY] = algebraicToNum(newLoc)
    const [curX, curY] = algebraicToNum(p.location)

    const xDiff = Math.abs(curX - newX)
    const yDiff = Math.abs(curY - newY)

    // check if the king is attempting to castle
    return (xDiff === 0 && yDiff == 2)
  }

  /**
   * 
   * @param p      - piece whose location needs to change
   * @param newLoc - the new location
   * @returns      - a new piece with the location + hasBeenMoved properties updated
   */
  static changeLocation (p: Piece, newLoc: location): Piece {
    return { color: p.color
           , name: p.name
           , location: newLoc
           , hasBeenMoved: true
           , isRemoved: p.isRemoved
           , changeLocation: function(to: location) { this.location = to } } 
  }

  static isValidMove(p: Piece, newLoc: location, game: Game, checkForCheck: boolean = true): Either<boolean, Error> {
    if (game.enforceAlternatingTurns) {
      if (game.currentPlayerColor !== p.color) return false
    }

    // cannot move to the square the piece is already in
    if (newLoc === p.location) return false

    // tests on the piece in the square - need to
    // first check if there is even a piece there
    if (!ChessGame.isLocationEmpty(game, newLoc)) {
      if (p.color === game.getPiece(newLoc)?.color) return false
    }

    // Need to do this otherwise we would create an infinite loop
    if (checkForCheck) {

      // cannot move if it would put the player in checkmate
      const gameCopy = copyGame(game)
      if (ChessGame.movePiece(gameCopy, p.location, newLoc, false) !== null) return false
      
      const isCheck = ChessGame.isKingInCheck(gameCopy, p.color)

      if (isError(isCheck)) return isCheck
      if (isCheck) return false
    }
    // Now we need to check all the different piece types
    if (isPawn(p))   return ChessPiece.isValidPawnMove(p, newLoc, game)
    if (isRook(p))   return ChessPiece.isValidRookMove(p, newLoc, game)
    if (isBishop(p)) return ChessPiece.isValidBishopMove(p, newLoc, game)
    if (isKnight(p)) return ChessPiece.isValidKnightMove(p, newLoc)
    if (isKing(p))   return ChessPiece.isValidKingMove(p, newLoc, game)
    if (isQueen(p))  return ChessPiece.isValidQueenMove(p, newLoc, game)

    // If we reach this point something has gone wrong
    const error = { 
      name: "Invalid move",
      message: "The move is invalid because the piece that is trying to be moved in invalid." 
    }
    return error
  }

  static isValidPawnMove(p: Pawn, newLoc: location, game: Game): boolean {
    const { isBlack
          , isEmpty
          , flippedBoard
          , newX, newY
          , curX, curY } = ChessPiece.enPassantHelper(p, newLoc, game)

    /***** if (isBlack)  {
      if (newX >= curX)    return false
      if (curX - newX > 2) return false
    } else { ******/
      if (newX <= curX)    return false // cannot move backwards
      if (newX - curX > 2) return false // cannot move more than 2 spaces forward
    /* } */

    if (curX - newX === 1 && Math.abs(newY - curY) === 1) {
      if (game.getPiece(newLoc) !== null) return true
      return ChessPiece.isEnPassantCapture(game, p, newLoc)
    } 

    if (newX - curX === 1 && newY !== curY) return false

    if (newX - curX === 2) { // moving 2 spaces forward
      if (Math.abs(newY - curY) !== 0) return false
      if (p.hasBeenMoved) return false // only legal if it hasn't moved yet
    }
    return isEmpty
  }

  static isValidRookMove(p: Rook, newLoc: location, game: Game): boolean {
    return ChessPiece.isValidHorizMove(p, newLoc, game)
  }

  static isValidKnightMove(p: Knight, newLoc: location): boolean {
    const [newX, newY] = algebraicToNum(newLoc)
    const [curX, curY] = algebraicToNum(p.location)

    // knight can only move 2 squares in one direciton & 1 square in the other direction
    if (
      (Math.abs(newX - curX) === 2) &&
      (Math.abs(newY - curY) === 1)
    ) { return true }
    
    if (
      (Math.abs(newY - curY) === 2) &&
      (Math.abs(newX - curX) === 1)
     ) { return true }

    return false
  }

  static isValidBishopMove(p: Bishop, newLoc: location, game: Game): boolean {
    return ChessPiece.isValidDiagMove(p, newLoc, game)
  }

  static isValidKingMove(p: King, newLoc: location, game: Game): boolean {
    const [newX, newY] = algebraicToNum(newLoc)
    const [curX, curY] = algebraicToNum(p.location)

    const xDiff = Math.abs(curX - newX)
    const yDiff = Math.abs(curY - newY)

    // check if the king is attempting to castle
    if (xDiff === 0 && yDiff == 2) {
      const x = newX

      if (p.hasBeenMoved) return false // not allowed to castle if the king has already been moved
      const c = ChessGame.canBeCaptured(game, p.location)
      
      if (isError(c)) { // this error will occur if the location of the piece passed to this function does
                        // not have the same piece in the board object
        return false
      }

      if (c) return false // not allowed to castle if the king is in check

      if (newY > curY) { // this would be a king-side castle
        if (game.currentBoard[x][7]?.hasBeenMoved) return false
        
        if ( // all squares in between must be empty
          !ChessGame.isLocationEmpty(game, [x, curY + 1 as idxLimit]) ||
          !ChessGame.isLocationEmpty(game, [x, curY + 2 as idxLimit])
        ) { return false }
        
        // king must not be capturable in the in-between square or the final square
        const gameCopy = copyGame(game)

        ChessGame.movePiece(gameCopy, p.location, [x, curY + 1 as idxLimit])
        if (ChessGame.canBeCaptured(game, [x, curY + 1 as idxLimit])) return false

        ChessGame.movePiece(gameCopy, [x, curY + 1 as idxLimit], [x, curY + 2 as idxLimit])
        if (ChessGame.canBeCaptured(game, [x, curY + 2 as idxLimit])) return false
      }

      if (newY < curY) { // queen-side castle
        const x = newX

        if (game.currentBoard[x][0]?.hasBeenMoved) return false
      
        if (
          !ChessGame.isLocationEmpty(game, [x, curY - 1 as idxLimit]) ||
          !ChessGame.isLocationEmpty(game, [x, curY - 2 as idxLimit]) 
        ) { return false }

        // king must not be capturable in the in-between square or the final square
        const gameCopy = copyGame(game)

        ChessGame.movePiece(gameCopy, p.location, [x, curY - 1 as idxLimit])
        if (ChessGame.canBeCaptured(gameCopy, [x, curY - 1 as idxLimit])) return false

        ChessGame.movePiece(gameCopy, [x, curY - 1 as idxLimit], [x, curY - 2 as idxLimit])
        if (ChessGame.canBeCaptured(gameCopy, [x, curY - 2 as idxLimit])) return false
      }

      // if we passed all checks then this is a valid move
      return true
    }

    if (xDiff > 1 || yDiff > 1) return false

    // the piece can move one square in any direction
    return ( xDiff === 1 || yDiff === 1 )
  }

  static isValidQueenMove(p: Queen, newLoc: location, game: Game): boolean {
    return (
      ChessPiece.isValidHorizMove(p, newLoc, game) ||
      ChessPiece.isValidDiagMove(p, newLoc, game)
    )
  }

  static isValidHorizMove(p: Queen | Rook, newLoc: location, game: Game): boolean {
    const [newX, newY] = algebraicToNum(newLoc)
    const [curX, curY] = algebraicToNum(p.location)

    if (curX !== newX || curY !== newY) return false // false if trying to move diagonally

    // piece is moving horizontally
    if (curX === newX) { 
      if (Math.abs(curY - newY) === 1) return true

      // piece is moving to the left
      if (curY > newY) {
        for (let i = newY + 1; i < curY; i++) {
          if (!ChessGame.isLocationEmpty(game, [newX, i as idxLimit])) return false
        }
      }

      // piece is moving to the right
      if (curY < newY) {
        for (let i = curY + 1; i < newY; i++) {
          if (!ChessGame.isLocationEmpty(game, [newX, i as idxLimit])) return false
        }
      }
    } 

    // piece is moving vertically
    if (curY === newY) { 
      if (Math.abs(curX - newX) === 1) return true

      // piece is moving down
      if (curX > newX) {
        for (let i = newX + 1; i < curX; i++) {
          if (!ChessGame.isLocationEmpty(game, [i as idxLimit, newY])) return false
        }
      }

      // piece is moving up
      if (curX < newX) {
        for (let i = curX + 1; i < newX; i++) {
          if (!ChessGame.isLocationEmpty(game, [i as idxLimit, newY])) return false
        }
      }
    }
    return false
  }

  static isValidDiagMove(p: Queen | Bishop, newLoc: location, game: Game): boolean {
    
    const [newX, newY] = algebraicToNum(newLoc)
    const [curX, curY] = algebraicToNum(p.location)

    // must move the same amount in both directions
    if (Math.abs(curX - newX) !== Math.abs(curY - newY)) return false


    // if the piece is only moving one square and we know it 
    // is moving the same amount horizontally + vertically,
    // we do not need to check for anything else
    if (Math.abs(curX - newX) === 1) return true    

    // this entire if/else block checks to make sure there
    // are no pieces on in-between squares

    if (newX > curX) { // moving up      
      if (newY > curY) { // moving right
        for (
          let i = curX + 1, j = curY + 1; 
          i < newX; 
          i++, j++) {
            if (!ChessGame.isLocationEmpty(game, [i as idxLimit, j as idxLimit])) return false
        }
      } else { // moving left
        for (
          let i = curX + 1, j = curY - 1; 
          i < newX; 
          i++, j--) {
            if (!ChessGame.isLocationEmpty(game, [i as idxLimit, j as idxLimit])) return false
        }
      }
    } else { // moving down
      if (newY > curY) { // moving right
        for (
          let i = curX - 1, j = curY + 1; 
          i > newX; 
          i--, j++) {
            if (!ChessGame.isLocationEmpty(game, [i as idxLimit, j as idxLimit])) return false
        }
      } else { // moving left
        for (
          let i = curX - 1, j = curY - 1; 
          i > newX; 
          i--, j--) {
            if (!ChessGame.isLocationEmpty(game, [i as idxLimit, j as idxLimit])) return false
        }
      }
    }
    return true
  }

  static possibleMoves = (game: Game, p: Piece): possibleMove[] => {
    const otherColor = p.color === 'white' ? 'black' : 'white'
    const otherColorAndEmptyLocations = ChessGame.locations(game.currentBoard, otherColor)

    if (otherColorAndEmptyLocations.length === 0) return []

    let moves: possibleMove[] = []

    for (let i = 0; i < otherColorAndEmptyLocations.length; i++) {
      const loc = otherColorAndEmptyLocations[i]      
      const isValid = ChessPiece.isValidMove(p, loc, game)
      if (isError(isValid)) logModelError(isValid)
      else if (isValid) moves.push( { piece: p, to: loc} )
    }
    return moves
  }
}

export { ChessPiece, newPiece, copyPiece }
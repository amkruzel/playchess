/**
 * 
 * model/board
 * 
 */

import { copyPiece, newPiece } from "./piece"
import { newGame } from "./game"
import { chessBoardMap, chessBoardMaybeMap, flipLocation } from "./common"

const newBoard = (): Board => {
  let gameBoard = Array.from(Array(8), () => new Array(8))

  gameBoard[0][0] = newPiece('rook',   'white', 'a1')
  gameBoard[0][1] = newPiece('knight', 'white', 'b1')
  gameBoard[0][2] = newPiece('bishop', 'white', 'c1')
  gameBoard[0][3] = newPiece('queen',  'white', 'd1')
  gameBoard[0][4] = newPiece('king' ,  'white', 'e1')
  gameBoard[0][5] = newPiece('bishop', 'white', 'f1')
  gameBoard[0][6] = newPiece('knight', 'white', 'g1')
  gameBoard[0][7] = newPiece('rook',   'white', 'h1')

  gameBoard[1][0] = newPiece('pawn', 'white', 'a2')
  gameBoard[1][1] = newPiece('pawn', 'white', 'b2')
  gameBoard[1][2] = newPiece('pawn', 'white', 'c2')
  gameBoard[1][3] = newPiece('pawn', 'white', 'd2')
  gameBoard[1][4] = newPiece('pawn', 'white', 'e2')
  gameBoard[1][5] = newPiece('pawn', 'white', 'f2')
  gameBoard[1][6] = newPiece('pawn', 'white', 'g2')
  gameBoard[1][7] = newPiece('pawn', 'white', 'h2')

  gameBoard[6][0] = newPiece('pawn', 'black', 'a7')
  gameBoard[6][1] = newPiece('pawn', 'black', 'b7')
  gameBoard[6][2] = newPiece('pawn', 'black', 'c7')
  gameBoard[6][3] = newPiece('pawn', 'black', 'd7')
  gameBoard[6][4] = newPiece('pawn', 'black', 'e7')
  gameBoard[6][5] = newPiece('pawn', 'black', 'f7')
  gameBoard[6][6] = newPiece('pawn', 'black', 'g7')
  gameBoard[6][7] = newPiece('pawn', 'black', 'h7')

  gameBoard[7][0] = newPiece('rook',   'black', 'a8')
  gameBoard[7][1] = newPiece('knight', 'black', 'b8')
  gameBoard[7][2] = newPiece('bishop', 'black', 'c8')
  gameBoard[7][3] = newPiece('queen',  'black', 'd8')
  gameBoard[7][4] = newPiece('king',   'black', 'e8')
  gameBoard[7][5] = newPiece('bishop', 'black', 'f8')
  gameBoard[7][6] = newPiece('knight', 'black', 'g8')
  gameBoard[7][7] = newPiece('rook',   'black', 'h8')

  return chessBoardMaybeMap(gameBoard, s => s === undefined ? null : s) 
}

const copyBoard = (board: Board): Board => {  
  return chessBoardMap(board, copyPiece)
}

const flipBoard = (board: Board): Board => {
  let ret = copyBoard(board).reverse()
  for (let i = 0; i < 8; i ++) ret[i].reverse()
  return ret
}

const flipBoardAndPieces = (board: Board): Board => {
  let ret = flipBoard(board)
  const flip = (p: Piece): Piece => {
    const loc = flipLocation(p.location)
    p.changeLocation(loc)
    return p
  }
  return chessBoardMap(ret, flip)
}
 
export { newBoard, copyBoard, flipBoardAndPieces }
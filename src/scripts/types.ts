/**
 * 
 * model/types
 * 
 */

type Maybe<T> = NonNullable<T> | null

type Either<T, K> = T | K

type color = 'white' | 'black'

type name = 'pawn' | 'bishop' | 'knight'
          | 'rook' | 'king'   |'queen'

type location = 'a1'| 'a2'| 'a3'| 'a4'| 'a5'| 'a6'| 'a7'| 'a8'
              | 'b1'| 'b2'| 'b3'| 'b4'| 'b5'| 'b6'| 'b7'| 'b8' 
              | 'c1'| 'c2'| 'c3'| 'c4'| 'c5'| 'c6'| 'c7'| 'c8'
              | 'd1'| 'd2'| 'd3'| 'd4'| 'd5'| 'd6'| 'd7'| 'd8' 
              | 'e1'| 'e2'| 'e3'| 'e4'| 'e5'| 'e6'| 'e7'| 'e8'
              | 'f1'| 'f2'| 'f3'| 'f4'| 'f5'| 'f6'| 'f7'| 'f8' 
              | 'g1'| 'g2'| 'g3'| 'g4'| 'g5'| 'g6'| 'g7'| 'g8'
              | 'h1'| 'h2'| 'h3'| 'h4'| 'h5'| 'h6'| 'h7'| 'h8'

// This is used to limit the coords type              
type idxLimit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7

type coords = [ idxLimit, idxLimit ] 

type sqrLocation = location | coords

type Piece = { color: color
             , name: name
             , location: location
             , hasBeenMoved: boolean
             , isRemoved: boolean
             , changeLocation: (_: location) => void }

type Pawn   = Piece & { name: 'pawn', lastMoveWasTwoSquares?: boolean }  
type Rook   = Piece & { name: 'rook' }  
type Knight = Piece & { name: 'knight' }                  
type Bishop = Piece & { name: 'bishop' }                  
type King   = Piece & { name: 'king' }                  
type Queen  = Piece & { name: 'queen' }                  

type Square = Maybe<Piece>

type Board = Square[][]

type gameloction = 'local'  | 'online'
type gametype    = 'player' | 'computer'

type chessMove = { moveNumber: number
                 , pieceMoved: Piece
                 , pieceCaptured: Maybe<Piece>
                 , from: location
                 , to: location }

type Game = { id: number 
            , dateStarted: Date
            , currentPlayerColor: color
            , playerViewColor: color
            , currentBoard: Board
            , previousBoard: Board
            , isEnPassantLegal: boolean
            , currentMoveNumber: number
            , enforceAlternatingTurns: Maybe<boolean> 
            , location: gameloction
            , type: gametype
            , removedPieces: Piece[] 
            , previousMoves: chessMove[]
            , whitePlayer: string
            , blackPlayer: string
            , winner?: color
            , needsCleanup?: boolean
            , swapPlayers: () => void
            , getPiece: (l: sqrLocation) => Square
            , removePiece: (l: sqrLocation) => void }

type possibleMove = { piece: Piece, to: location }
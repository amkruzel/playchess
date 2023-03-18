import {
  numToAlgebraic,
  algebraicToNum,
  Piece,
  Game,
  makeComputerMove,
  movesArrHasAtLeastOneItem,
  fenToGame,
} from './chess'
import type { location, Move } from './chess'

/* Helper functions for testing */

/**
 *
 * @param returnString if true, this will return a string
 *                     rather than logging to the console
 */
function ascii(g: Game, returnString: boolean = false): string | void {
  const b = g.board

  let ascii: string

  function pieceToChar(p: Piece): string {
    const table = {
      white: {
        pawn: 'p',
        rook: 'r',
        knight: 'k',
        bishop: 'b',
        queen: 'q',
        king: 'i',
      },
      black: {
        pawn: 'P',
        rook: 'R',
        knight: 'K',
        bishop: 'B',
        queen: 'Q',
        king: 'I',
      },
    }

    return table[p.color][p.name]
  }

  ascii = `  a b c d e f g h \n ╒═╤═╤═╤═╤═╤═╤═╤═╕\n`

  for (let row = 7; row >= 0; row--) {
    ascii += `${row + 1}`
    for (let col = 0; col < 8; col++) {
      let sq = b[row][col]
      ascii += `│${!sq ? ' ' : pieceToChar(sq)}`
    }
    ascii += `│${row + 1}\n`
    if (row !== 0) ascii += ' ├─┼─┼─┼─┼─┼─┼─┼─┤\n'
  }

  ascii += ' ╘═╧═╧═╧═╧═╧═╧═╧═╛\n  a b c d e f g h'

  if (returnString) return ascii
  else console.log(ascii)
}

function move(g: Game, from: location, to: location) {
  const [fromRow, fromCol] = algebraicToNum(from)
  const [toRow, toCol] = algebraicToNum(to)

  const board = g.board
  const p = board[fromRow][fromCol]

  board[fromRow][fromCol] = null
  board[toRow][toCol] = p

  if (p) p.move(to)

  g.board = board
}

function fullMove(g: Game, from: location, to: location): void {
  const mv = g.validMoves(from)

  mv?.makeMove(mv.moves[mv.moves.findIndex(m => m.to === to)])

  g.cleanup()
}

function remove(g: Game, loc: location) {
  const [row, col] = algebraicToNum(loc)
  const b = g.board

  b[row][col] = null

  g.board = b
}

/* Functions */

describe('functions', () => {
  test('algebraicToNum', () => {
    const fn = algebraicToNum

    expect(fn('a1')).toStrictEqual([0, 0])
    expect(fn('b4')).toStrictEqual([3, 1])
    expect(fn('f7')).toStrictEqual([6, 5])
  })

  test('numToAlgebraic', () => {
    const fn = numToAlgebraic

    expect(fn([0, 0])).toEqual('a1')
    expect(fn([2, 7])).toEqual('h3')
    expect(fn([4, 2])).toEqual('c5')
  })

  test('makeComputerMove', () => {
    const g = new Game().setComputerColor('white')

    const m = makeComputerMove(g)

    expect(m).not.toBeNull()
    expect(g.info.currentPlayer).toEqual('black')
  })

  test('movesArrHasAtLeastOneItem', () => {
    const move: Move = {
      from: 'a1',
      to: 'a2',
      piece: new Piece('pawn', 'white', 'a1'),
    }

    const emptyArray: Move[] = []
    const arrayWithNoMoves = ['asdf']
    const arrayWithOneMove: [Move, ...Move[]] = [move]
    const arrayWithTwoMoves = [move, move]
    const arrayWithOneMoveAndOneNonMove = [move, 'asdf']

    expect(movesArrHasAtLeastOneItem(emptyArray)).toBeFalsy
    expect(movesArrHasAtLeastOneItem(arrayWithNoMoves)).toBeFalsy
    expect(movesArrHasAtLeastOneItem(arrayWithOneMove)).toBeTruthy
    expect(movesArrHasAtLeastOneItem(arrayWithTwoMoves)).toBeTruthy
    expect(movesArrHasAtLeastOneItem(arrayWithOneMoveAndOneNonMove)).toBeFalsy
  })
})

describe(Piece, () => {
  test('copy()', () => {
    const p = new Piece('rook', 'white', 'a1')

    const pCopy = p.copy()

    expect(p).toStrictEqual(pCopy)

    p.location = 'a3'

    expect(p).not.toStrictEqual(pCopy)
  })

  describe('moveType()', () => {
    test('pawn', () => {
      const p = new Piece('pawn', 'white', 'c2')

      expect(p.moveType('c4')).toEqual('bigpawn')
      expect(p.moveType('d4')).toBeNull

      expect(p.moveType('d8')).toEqual('promotion')

      expect(p.moveType('d3')).toEqual('diagpawn')
      expect(p.moveType('e3')).toBeNull
    })

    test('king', () => {
      const k = new Piece('king', 'white', 'e1')

      expect(k.moveType('g1')).toEqual('castle')
      expect(k.moveType('g8')).toBeNull
      expect(k.moveType('c1')).toEqual('castle')
    })

    test('other pieces', () => {
      const r = new Piece('rook', 'white', 'a1')

      expect(r.moveType('a3')).toBeNull
    })
  })

  describe('moves()', () => {
    test('pawn', () => {
      const p = new Piece('pawn', 'white', 'a2')

      // from default position, can move to three locations
      const expected = ['a3', 'a4', 'b3']
      expect(p.moves).toHaveLength(3)
      expect(p.moves).toEqual(expect.arrayContaining(expected))

      // after moving, it can only move to two squares
      p.move('a3')

      expect(p.moves).toHaveLength(2)
      expect(p.moves).toEqual(expect.arrayContaining(['a4', 'b4']))

      // generally, it has 3 possible moves

      p.move('c3')

      expect(p.moves).toHaveLength(3)
    })

    test('rook', () => {
      const r = new Piece('rook', 'black', 'a8')

      // there are always 14 possible locations

      // prettier-ignore
      const ex = [ 'a7', 'a6', 'a5', 'a4', 'a3', 'a2', 'a1',
                   'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8' ]
      expect(r.moves).toHaveLength(14)
      expect(r.moves).toEqual(expect.arrayContaining(ex))

      r.move('c6')
      expect(r.moves).toHaveLength(14)

      r.move('h2')
      expect(r.moves).toHaveLength(14)
    })

    test('bishop', () => {
      const b = new Piece('bishop', 'black', 'c8')

      // prettier-ignore
      const ex1 = [ 'b7', 'a6', 'd7', 'e6', 'f5', 'g4', 'h3' ]
      expect(b.moves).toHaveLength(7)
      expect(b.moves).toEqual(expect.arrayContaining(ex1))

      b.move('c3')

      // prettier-ignore
      const ex2 = [ 'a1', 'b2', 'd4', 'e5', 'f6', 'g7', 'h8',
                   'b4', 'a5', 'd2', 'e1' ]
      expect(b.moves).toHaveLength(11)
      expect(b.moves).toEqual(expect.arrayContaining(ex2))

      b.move('h4')

      // prettier-ignore
      const ex3 = [ 'g3', 'f2', 'e1', 'g5', 'f6', 'e7', 'd8' ]
      expect(b.moves).toHaveLength(7)
      expect(b.moves).toEqual(expect.arrayContaining(ex3))
    })

    test('knight', () => {
      const k = new Piece('knight', 'white', 'b1')

      //prettier-ignore
      const ex1 = [ 'a3', 'c3', 'd2' ]
      expect(k.moves).toHaveLength(3)
      expect(k.moves).toEqual(expect.arrayContaining(ex1))

      k.move('f7')

      //prettier-ignore
      const ex2 = [ 'h8', 'd8', 'd6', 'e5', 'g5', 'h6' ]
      expect(k.moves).toHaveLength(6)
      expect(k.moves).toEqual(expect.arrayContaining(ex2))

      k.move('d3')

      //prettier-ignore
      const ex3 = [ 'c5', 'e5', 'f4', 'f2', 'e1', 'c1', 'b2', 'b4' ]
      expect(k.moves).toHaveLength(8)
      expect(k.moves).toEqual(expect.arrayContaining(ex3))
    })

    test('king', () => {
      const k = new Piece('king', 'white', 'e1')

      // before moving, the king can castle

      //prettier-ignore
      const ex1 = [ 'd1', 'd2', 'e2', 'f2', 'f1', 'g1', 'c1' ]
      expect(k.moves).toHaveLength(7)
      expect(k.moves).toEqual(expect.arrayContaining(ex1))

      k.move('e2')

      // black kind starts in same column, check castling here too
      const bk = new Piece('king', 'black', 'e8')
      expect(bk.moves).toEqual(expect.arrayContaining(['g8', 'c8']))

      //prettier-ignore
      const ex2 = [ 'd1', 'd2', 'd3', 'f1', 'f2', 'f3', 'e1', 'e3' ]
      expect(k.moves).toHaveLength(8)
      expect(k.moves).toEqual(expect.arrayContaining(ex2))

      k.move('e1')

      // even though the location is the same as the first, king can no longer castle
      expect(k.moves).toHaveLength(5)
      expect(k.moves).not.toEqual(expect.arrayContaining(ex1))

      k.move('h4')

      //prettier-ignore
      const ex3 = [ 'h3', 'h5', 'g3', 'g4', 'g5' ]
      expect(k.moves).toHaveLength(5)
      expect(k.moves).toEqual(expect.arrayContaining(ex3))
    })

    test('queen', () => {
      const q = new Piece('queen', 'black', 'd8')

      expect(q.moves).toHaveLength(21)

      q.move('f7')
      expect(q.moves).toHaveLength(23)

      q.move('d3')
      expect(q.moves).toHaveLength(25)

      q.move('a1')
      expect(q.moves).toHaveLength(21)
    })
  })

  describe('move/unmove', () => {
    const p = new Piece('pawn', 'white', 'd2')

    test('move()', () => {
      p.move('d3')

      expect(p.location).toEqual('d3')
      expect(p.hasBeenMoved).toBeTruthy()
    })

    test('unmove()', () => {
      p.unmove()

      expect(p.location).toEqual('d2')
      expect(p.hasBeenMoved).toBeFalsy()
    })
  })

  describe('remove/unremove', () => {
    const p = new Piece('pawn', 'white', 'd2')

    test('remove()', () => {
      p.remove()

      expect(p.isRemoved).toBeTruthy()
    })

    test('unremove()', () => {
      p.unremove()

      expect(p.isRemoved).toBeFalsy()
    })
  })
})

describe(Game, () => {
  describe('validMoves()', () => {
    // given a Game and a location, need to ensure that
    // `validMoves` always returns the correct moves

    const g = new Game()

    test('an empty square has no moves', () => {
      expect(g.validMoves('d4')).toBeNull()
    })

    test('piece has no valid moves', () => {
      expect(g.validMoves('c1')).toBeNull()

      expect(g.info.currentPlayer).toEqual('white')

      // it is not black's turn so they cannot move
      expect(g.validMoves('c7')).toBeNull()
    })

    test('white pawn has 2 valid moves', () => {
      const x = g.validMoves('b2')

      expect(x).toBeDefined()
      expect(x?.moves).toHaveLength(2)
    })

    test('white knight has 2 valid moves', () => {
      const k = g.pieceAt('g1')
      const x = g.validMoves('g1')

      expect(x).toBeDefined()
      expect(x?.moves).toHaveLength(2)
    })

    test('black has valid moves after white turn', () => {
      const a2 = g.validMoves('a2')
      a2?.makeMove(a2.moves[0])

      g.cleanup()

      const pa7 = g.validMoves('a7')
      const ra8 = g.validMoves('a8')

      expect(pa7?.moves).toHaveLength(2)
      expect(ra8).toBeNull()
    })
  })

  describe('additional tests', () => {
    test('pawn captures', () => {
      const g = new Game()

      const pc2 = g.validMoves('c2')
      if (pc2) pc2.makeMove(pc2.moves[pc2.moves.findIndex(m => m.bigPawnMove)])

      g.cleanup()

      expect(g.info.currentPlayer).toEqual('black')

      const pd7 = g.validMoves('d7')
      const asdf = !!pd7
        ? pd7.makeMove(pd7.moves[pd7.moves.findIndex(m => m.bigPawnMove)])
        : null

      g.cleanup()

      ascii(g)

      expect(g.info.currentPlayer).toEqual('white')

      expect(g.pieceAt('c4')?.moves).toHaveLength(3)

      const pc4 = g.validMoves('c4')

      expect(pc4?.moves).toHaveLength(2)
    })

    test('pawn cannot jump over a piece', () => {
      const fen = 'RNBQKBNR/PPPPPPPP/p7/8/8/8/8/8 a'
      const g = fenToGame(fen)

      expect(g.validMoves('b7')).toBeNull()
    })

    test('promotion', () => {
      const g = new Game()

      remove(g, 'a7')
      remove(g, 'a8')
      move(g, 'a2', 'a7')

      const a7 = g.validMoves('a7')

      const a7move = a7
        ? a7.makeMove(a7.moves[a7?.moves.findIndex(m => m.to === 'a8')])
        : null

      expect(a7move).not.toBeNull()
      expect(a7move?.promote).toBeTruthy()

      const a7promote = a7move?.promote ? a7move.promote('rook') : null

      expect(a7promote).toBeTruthy()

      g.cleanup()

      ascii(g)

      expect(g.info.currentPlayer).toEqual('black')
      expect(g.pieceAt('a8')?.name).toEqual('rook')
    })

    test('knight captures', () => {
      const g = new Game()

      const c2 = g.validMoves('c2')

      c2?.makeMove(c2.moves[c2.moves.findIndex(m => m.to === 'c4')])

      g.cleanup()

      //move(g, 'c2', 'c4')
      fullMove(g, 'd7', 'd5')

      ascii(g)

      const b1 = g.validMoves('b1')

      const b1move = b1?.makeMove(
        b1.moves[b1.moves.findIndex(m => m.to === 'c3')]
      )

      console.log(b1move)

      expect(b1move?.move.capture).toBeFalsy()
    })

    test('play a game', () => {
      const g = new Game().setGameType('computer').setComputerColor('black')

      const d2 = g.validMoves('d2')
      if (d2) {
        const d2moveidx = d2.moves.findIndex(m => m.to === 'd3')
        d2.makeMove(d2.moves[d2moveidx])
      }
      g.cleanup()

      makeComputerMove(g)

      const c1 = g.validMoves('c1')
      if (c1) {
        const c1idx = c1.moves.findIndex(m => m.to === 'g5')
        c1.makeMove(c1.moves[c1idx])
      }
      g.cleanup()

      makeComputerMove(g)

      const g5 = g.validMoves('g5')
      if (g5) {
        const g5idx = g5.moves.findIndex(m => m.to === 'e7')
        expect(g5.moves[g5idx].capture).toBeTruthy()
        g5.makeMove(g5.moves[g5idx])
      }
      g.cleanup()

      makeComputerMove(g)

      //ascii(g)
    })
  })

  describe('pieceAt()', () => {
    test('returns correct piece', () => {
      const g = new Game()

      const f2 = g.pieceAt('f2')
      const d4 = g.pieceAt('d4')
      const c8 = g.pieceAt('c8')
      const h8 = g.pieceAt('h8')

      expect(f2).toBeInstanceOf(Piece)
      expect(f2).toHaveProperty('name', 'pawn')
      expect(f2).toHaveProperty('location', 'f2')

      expect(d4).toBeNull()

      expect(c8).toBeInstanceOf(Piece)
      expect(c8).toHaveProperty('name', 'bishop')
      expect(c8).not.toHaveProperty('location', 'c7')
      expect(c8).toHaveProperty('location', 'c8')

      expect(h8).toBeInstanceOf(Piece)
      expect(h8).toHaveProperty('name', 'rook')
      expect(h8).toHaveProperty('location', 'h8')
    })
  })

  describe('possibleMoves()', () => {
    describe('generic possibleMoves', () => {
      const g = new Game()
      // if it's not black's turn, should be no valid moves

      expect(g.possibleMoves('black')).toBeNull()
      expect(g.possibleMoves('white')).toHaveLength(10)

      remove(g, 'f1')
      remove(g, 'g1')

      expect(g.possibleMoves('white')).toHaveLength(11)

      move(g, 'e2', 'e3')

      expect(g.possibleMoves('white')).toHaveLength(12)

      test('pawn cannot jump', () => {
        const fen = 'RNBQKBNR/PP2PPPP/8/2PP4/2p5/n7/pp1ppppp/r1bqkbnr w'
        const g = fenToGame(fen)

        expect(g.validMoves('a2')).toBeNull()
      })
    })
  })

  describe('cleanup()', () => {
    test('cleanup', () => {
      const g = new Game()
      const h = new Game() // this is the constant

      // does not do anything if it's not the end of a turn
      g.cleanup()
      expect(h).toStrictEqual(g)

      const g2 = g.validMoves('g2')
      const g2Move = g2 ? g2.makeMove(g2.moves[0]) : null

      // should still be white's turn here
      expect(g.info.currentPlayer).toEqual('white')

      if (g2Move) g.cleanup()

      // now it should be black's turn
      expect(g.info.currentPlayer).toEqual('black')
      expect(g.info.move).toEqual(2)

      // make a move for black, and check before/after

      const c7 = g.validMoves('c7')
      const c7move = c7 ? c7.makeMove(c7.moves[0]) : null
      const curMove = g.info.move

      expect(g.info.currentPlayer).toEqual('black')

      if (c7move) g.cleanup()

      expect(g.info.currentPlayer).toEqual('white')
      expect(g.info.move).toEqual(curMove + 1)
    })
  })

  describe('pieces()', () => {
    test('pieces', () => {
      const g = new Game()
      const rooka1 = g.pieceAt('a1') as Piece

      expect(g.pieces('white')).toHaveLength(16)
      expect(g.pieces('black')).toHaveLength(16)

      remove(g, 'a1')
      remove(g, 'a2')

      expect(g.pieces('white')).toHaveLength(14)
      expect(g.pieces('white')).not.toContainEqual(rooka1)

      remove(g, 'b2')

      move(g, 'a2', 'a3')

      expect(g.pieces('black')).toHaveLength(16)
      expect(g.pieces('white')).toHaveLength(13)
    })
  })
})

import { Difficulty, GameState, Move, Piece, PieceType, Position } from './types';
import { getLegalMoves, isInCheck, isCheckmate } from './engine';

// Piece values for evaluation
const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

// Position evaluation tables (simplified)
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5,  5, 10, 25, 25, 10,  5,  5],
  [0,  0,  0, 20, 20,  0,  0,  0],
  [5, -5,-10,  0,  0,-10, -5,  5],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

const BISHOP_TABLE = [
  [-20,-10,-10,-10,-10,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5, 10, 10,  5,  0,-10],
  [-10,  5,  5, 10, 10,  5,  5,-10],
  [-10,  0, 10, 10, 10, 10,  0,-10],
  [-10, 10, 10, 10, 10, 10, 10,-10],
  [-10,  5,  0,  0,  0,  0,  5,-10],
  [-20,-10,-10,-10,-10,-10,-10,-20]
];

const ROOK_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10, 10, 10, 10, 10,  5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [-5,  0,  0,  0,  0,  0,  0, -5],
  [0,  0,  0,  5,  5,  0,  0,  0]
];

const QUEEN_TABLE = [
  [-20,-10,-10, -5, -5,-10,-10,-20],
  [-10,  0,  0,  0,  0,  0,  0,-10],
  [-10,  0,  5,  5,  5,  5,  0,-10],
  [ -5,  0,  5,  5,  5,  5,  0, -5],
  [  0,  0,  5,  5,  5,  5,  0, -5],
  [-10,  5,  5,  5,  5,  5,  0,-10],
  [-10,  0,  5,  0,  0,  0,  0,-10],
  [-20,-10,-10, -5, -5,-10,-10,-20]
];

const KING_TABLE_OPENING = [
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-30,-40,-40,-50,-50,-40,-40,-30],
  [-20,-30,-30,-40,-40,-30,-30,-20],
  [-10,-20,-20,-20,-20,-20,-20,-10],
  [20, 30,  10,  0,  0, 10, 30, 20],
  [20, 30,  10,  0,  0, 10, 30, 20]
];

const KING_TABLE_ENDGAME = [
  [-50,-40,-30,-20,-20,-30,-40,-50],
  [-30,-20,-10,  0,  0,-10,-20,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-30,  0,  0,  0,  0,-30,-30],
  [-50,-30,-30,-30,-30,-30,-30,-50]
];

// Get piece-square value
const getPieceSquareValue = (piece: Piece, pos: Position, isEndgame: boolean): number => {
  let table: number[][] = [];
  
  switch (piece.type) {
    case 'pawn':
      table = PAWN_TABLE;
      break;
    case 'knight':
      table = KNIGHT_TABLE;
      break;
    case 'bishop':
      table = BISHOP_TABLE;
      break;
    case 'rook':
      table = ROOK_TABLE;
      break;
    case 'queen':
      table = QUEEN_TABLE;
      break;
    case 'king':
      table = isEndgame ? KING_TABLE_ENDGAME : KING_TABLE_OPENING;
      break;
    default:
      return 0;
  }

  const row = piece.color === 'white' ? 7 - pos.row : pos.row;
  return table[row][pos.col];
};

// Count material on board
const countMaterial = (board: (Piece | null)[][]): { white: number; black: number } => {
  let white = 0, black = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        const value = PIECE_VALUES[piece.type];
        if (piece.color === 'white') white += value;
        else black += value;
      }
    }
  }
  return { white, black };
};

// Evaluate board position with enhanced tactics
export const evaluateBoard = (gameState: GameState): number => {
  let score = 0;
  const material = countMaterial(gameState.board);
  const isEndgame = material.white + material.black < 1000;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece) {
        const pieceValue = PIECE_VALUES[piece.type];
        const positionValue = getPieceSquareValue(piece, { row, col }, isEndgame);
        const totalValue = pieceValue + positionValue;

        if (piece.color === 'white') {
          score += totalValue;
        } else {
          score -= totalValue;
        }
      }
    }
  }

  return score;
};

// Score moves for move ordering (higher score = better move)
const scoreMoveForOrdering = (move: Move, gameState: GameState): number => {
  let score = 0;

  // Captures are prioritized
  if (move.captured) {
    score += PIECE_VALUES[move.captured.type] * 10;
    // Prefer capturing high-value pieces with low-value pieces
    score -= PIECE_VALUES[move.piece.type];
  }

  // Promotions are valuable
  if (move.piece.type === 'pawn' && (move.to.row === 0 || move.to.row === 7)) {
    score += 900;
  }

  // Moving to center is good
  const distFromCenter = Math.abs(move.to.col - 3.5) + Math.abs(move.to.row - 3.5);
  score += (7 - distFromCenter) * 5;

  // Attacking enemy king is good
  score += 200;

  return score;
};

// Order moves for better alpha-beta pruning
const orderMoves = (moves: Move[], gameState: GameState): Move[] => {
  return [...moves].sort((a, b) => scoreMoveForOrdering(b, gameState) - scoreMoveForOrdering(a, gameState));
};

// Get all possible moves for a color
const getAllPossibleMoves = (gameState: GameState, color: 'white' | 'black'): Move[] => {
  const moves: Move[] = [];

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece?.color === color) {
        const legalMoves = getLegalMoves(
          gameState.board,
          { row, col },
          color,
          gameState.enPassantTarget
        );

        for (const to of legalMoves) {
          moves.push({
            from: { row, col },
            to,
            piece,
            captured: gameState.board[to.row][to.col] || undefined
          });
        }
      }
    }
  }

  return moves;
};

// Apply move to create new game state (without mutating)
const applyMove = (gameState: GameState, move: Move): GameState => {
  const newBoard = gameState.board.map(row => [...row]);
  const piece = { ...move.piece };
  
  newBoard[move.to.row][move.to.col] = piece;
  newBoard[move.from.row][move.from.col] = null;

  return {
    ...gameState,
    board: newBoard,
    currentPlayer: gameState.currentPlayer === 'white' ? 'black' : 'white'
  };
};

// Minimax with alpha-beta pruning and move ordering
const minimax = (
  gameState: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean
): number => {
  if (depth === 0) {
    return evaluateBoard(gameState);
  }

  const color = maximizingPlayer ? 'black' : 'white';
  let moves = getAllPossibleMoves(gameState, color);

  if (moves.length === 0) {
    return evaluateBoard(gameState);
  }

  // Order moves for better pruning
  moves = orderMoves(moves, gameState);

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newState = applyMove(gameState, move);
      const evaluation = minimax(newState, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newState = applyMove(gameState, move);
      const evaluation = minimax(newState, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

// Get best move for AI based on difficulty
export const getAIMove = (gameState: GameState, difficulty: Difficulty): Move | null => {
  const moves = getAllPossibleMoves(gameState, 'black');
  if (moves.length === 0) return null;

  switch (difficulty) {
    case 'beginner':
      // Random moves
      return moves[Math.floor(Math.random() * moves.length)];

    case 'easy':
      // Prefer captures, otherwise random
      const captureMoves = moves.filter(m => m.captured);
      if (captureMoves.length > 0 && Math.random() > 0.3) {
        return captureMoves[Math.floor(Math.random() * captureMoves.length)];
      }
      return moves[Math.floor(Math.random() * moves.length)];

    case 'normal':
      // Minimax depth 2
      return getBestMoveWithMinimax(gameState, moves, 2);

    case 'hard':
      // Minimax depth 3
      return getBestMoveWithMinimax(gameState, moves, 3);

    case 'expert':
      // Minimax depth 4
      return getBestMoveWithMinimax(gameState, moves, 4);

    case 'master':
      // Minimax depth 5
      return getBestMoveWithMinimax(gameState, moves, 5);

    default:
      return moves[Math.floor(Math.random() * moves.length)];
  }
};

const getBestMoveWithMinimax = (
  gameState: GameState,
  moves: Move[],
  depth: number
): Move => {
  // Order moves first for better evaluation
  const orderedMoves = orderMoves(moves, gameState);
  let bestMove = orderedMoves[0];
  let bestValue = -Infinity;

  for (const move of orderedMoves) {
    const newState = applyMove(gameState, move);
    const value = minimax(newState, depth, -Infinity, Infinity, false);
    
    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  return bestMove;
};

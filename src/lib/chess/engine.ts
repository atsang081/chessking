import { Piece, PieceColor, PieceType, Position, Move, GameState } from './types';

// Initialize the chess board with standard starting position
export const initializeBoard = (): (Piece | null)[][] => {
  const board: (Piece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place pawns
  for (let i = 0; i < 8; i++) {
    board[1][i] = { type: 'pawn', color: 'black' };
    board[6][i] = { type: 'pawn', color: 'white' };
  }
  
  // Place other pieces
  const pieceOrder: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let i = 0; i < 8; i++) {
    board[0][i] = { type: pieceOrder[i], color: 'black' };
    board[7][i] = { type: pieceOrder[i], color: 'white' };
  }
  
  return board;
};

// Get piece unicode symbol
export const getPieceSymbol = (piece: Piece): string => {
  const symbols: Record<PieceColor, Record<PieceType, string>> = {
    white: {
      king: '♔',
      queen: '♕',
      rook: '♖',
      bishop: '♗',
      knight: '♘',
      pawn: '♙'
    },
    black: {
      king: '♚',
      queen: '♛',
      rook: '♜',
      bishop: '♝',
      knight: '♞',
      pawn: '♟'
    }
  };
  return symbols[piece.color][piece.type];
};

// Check if position is within board bounds
export const isValidPosition = (pos: Position): boolean => {
  return pos.row >= 0 && pos.row < 8 && pos.col >= 0 && pos.col < 8;
};

// Get all legal moves for a piece
export const getLegalMoves = (
  board: (Piece | null)[][],
  from: Position,
  currentPlayer: PieceColor,
  enPassantTarget: Position | null = null
): Position[] => {
  const piece = board[from.row][from.col];
  if (!piece || piece.color !== currentPlayer) return [];

  let moves: Position[] = [];

  switch (piece.type) {
    case 'pawn':
      moves = getPawnMoves(board, from, piece, enPassantTarget);
      break;
    case 'knight':
      moves = getKnightMoves(board, from, piece);
      break;
    case 'bishop':
      moves = getBishopMoves(board, from, piece);
      break;
    case 'rook':
      moves = getRookMoves(board, from, piece);
      break;
    case 'queen':
      moves = getQueenMoves(board, from, piece);
      break;
    case 'king':
      moves = getKingMoves(board, from, piece);
      break;
  }

  // Filter out moves that would put own king in check
  return moves.filter(to => !wouldBeInCheck(board, from, to, currentPlayer));
};

const getPawnMoves = (
  board: (Piece | null)[][],
  from: Position,
  piece: Piece,
  enPassantTarget: Position | null
): Position[] => {
  const moves: Position[] = [];
  const direction = piece.color === 'white' ? -1 : 1;
  const startRow = piece.color === 'white' ? 6 : 1;

  // Move forward one square
  const oneForward = { row: from.row + direction, col: from.col };
  if (isValidPosition(oneForward) && !board[oneForward.row][oneForward.col]) {
    moves.push(oneForward);

    // Move forward two squares from starting position
    if (from.row === startRow) {
      const twoForward = { row: from.row + 2 * direction, col: from.col };
      if (!board[twoForward.row][twoForward.col]) {
        moves.push(twoForward);
      }
    }
  }

  // Capture diagonally
  for (const colOffset of [-1, 1]) {
    const capturePos = { row: from.row + direction, col: from.col + colOffset };
    if (isValidPosition(capturePos)) {
      const targetPiece = board[capturePos.row][capturePos.col];
      if (targetPiece && targetPiece.color !== piece.color) {
        moves.push(capturePos);
      }
      
      // En passant
      if (enPassantTarget && 
          capturePos.row === enPassantTarget.row && 
          capturePos.col === enPassantTarget.col) {
        moves.push(capturePos);
      }
    }
  }

  return moves;
};

const getKnightMoves = (board: (Piece | null)[][], from: Position, piece: Piece): Position[] => {
  const moves: Position[] = [];
  const offsets = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];

  for (const [rowOffset, colOffset] of offsets) {
    const to = { row: from.row + rowOffset, col: from.col + colOffset };
    if (isValidPosition(to)) {
      const targetPiece = board[to.row][to.col];
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push(to);
      }
    }
  }

  return moves;
};

const getBishopMoves = (board: (Piece | null)[][], from: Position, piece: Piece): Position[] => {
  return getSlidingMoves(board, from, piece, [
    [-1, -1], [-1, 1], [1, -1], [1, 1]
  ]);
};

const getRookMoves = (board: (Piece | null)[][], from: Position, piece: Piece): Position[] => {
  return getSlidingMoves(board, from, piece, [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ]);
};

const getQueenMoves = (board: (Piece | null)[][], from: Position, piece: Piece): Position[] => {
  return getSlidingMoves(board, from, piece, [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ]);
};

const getKingMoves = (board: (Piece | null)[][], from: Position, piece: Piece): Position[] => {
  const moves: Position[] = [];
  const offsets = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], [0, 1],
    [1, -1], [1, 0], [1, 1]
  ];

  for (const [rowOffset, colOffset] of offsets) {
    const to = { row: from.row + rowOffset, col: from.col + colOffset };
    if (isValidPosition(to)) {
      const targetPiece = board[to.row][to.col];
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push(to);
      }
    }
  }

  // Castling (simplified - needs more checks for chess rules)
  if (!piece.hasMoved) {
    // Kingside castling
    const kingsideRook = board[from.row][7];
    if (kingsideRook?.type === 'rook' && !kingsideRook.hasMoved &&
        !board[from.row][5] && !board[from.row][6]) {
      moves.push({ row: from.row, col: 6 });
    }

    // Queenside castling
    const queensideRook = board[from.row][0];
    if (queensideRook?.type === 'rook' && !queensideRook.hasMoved &&
        !board[from.row][1] && !board[from.row][2] && !board[from.row][3]) {
      moves.push({ row: from.row, col: 2 });
    }
  }

  return moves;
};

const getSlidingMoves = (
  board: (Piece | null)[][],
  from: Position,
  piece: Piece,
  directions: number[][]
): Position[] => {
  const moves: Position[] = [];

  for (const [rowDir, colDir] of directions) {
    let row = from.row + rowDir;
    let col = from.col + colDir;

    while (isValidPosition({ row, col })) {
      const targetPiece = board[row][col];
      if (!targetPiece) {
        moves.push({ row, col });
      } else {
        if (targetPiece.color !== piece.color) {
          moves.push({ row, col });
        }
        break;
      }
      row += rowDir;
      col += colDir;
    }
  }

  return moves;
};

// Find king position
export const findKing = (board: (Piece | null)[][], color: PieceColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.type === 'king' && piece.color === color) {
        return { row, col };
      }
    }
  }
  return null;
};

// Check if a position is under attack
export const isPositionUnderAttack = (
  board: (Piece | null)[][],
  position: Position,
  byColor: PieceColor
): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece?.color === byColor) {
        const moves = getLegalMovesWithoutCheckValidation(board, { row, col }, byColor);
        if (moves.some(move => move.row === position.row && move.col === position.col)) {
          return true;
        }
      }
    }
  }
  return false;
};

// Get legal moves without check validation (to avoid infinite recursion)
const getLegalMovesWithoutCheckValidation = (
  board: (Piece | null)[][],
  from: Position,
  currentPlayer: PieceColor
): Position[] => {
  const piece = board[from.row][from.col];
  if (!piece || piece.color !== currentPlayer) return [];

  switch (piece.type) {
    case 'pawn': return getPawnMoves(board, from, piece, null);
    case 'knight': return getKnightMoves(board, from, piece);
    case 'bishop': return getBishopMoves(board, from, piece);
    case 'rook': return getRookMoves(board, from, piece);
    case 'queen': return getQueenMoves(board, from, piece);
    case 'king': {
      const moves: Position[] = [];
      const offsets = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1], [0, 1],
        [1, -1], [1, 0], [1, 1]
      ];
      for (const [rowOffset, colOffset] of offsets) {
        const to = { row: from.row + rowOffset, col: from.col + colOffset };
        if (isValidPosition(to)) {
          const targetPiece = board[to.row][to.col];
          if (!targetPiece || targetPiece.color !== piece.color) {
            moves.push(to);
          }
        }
      }
      return moves;
    }
    default: return [];
  }
};

// Check if a move would result in check
const wouldBeInCheck = (
  board: (Piece | null)[][],
  from: Position,
  to: Position,
  color: PieceColor
): boolean => {
  // Create a copy of the board with the move applied
  const newBoard = board.map(row => [...row]);
  newBoard[to.row][to.col] = newBoard[from.row][from.col];
  newBoard[from.row][from.col] = null;

  const kingPos = findKing(newBoard, color);
  if (!kingPos) return true;

  const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';
  return isPositionUnderAttack(newBoard, kingPos, opponentColor);
};

// Check if current player is in check
export const isInCheck = (board: (Piece | null)[][], color: PieceColor): boolean => {
  const kingPos = findKing(board, color);
  if (!kingPos) return false;

  const opponentColor: PieceColor = color === 'white' ? 'black' : 'white';
  return isPositionUnderAttack(board, kingPos, opponentColor);
};

// Check if current player is in checkmate
export const isCheckmate = (gameState: GameState): boolean => {
  if (!gameState.isCheck) return false;

  // Check if any piece has legal moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece?.color === gameState.currentPlayer) {
        const moves = getLegalMoves(
          gameState.board,
          { row, col },
          gameState.currentPlayer,
          gameState.enPassantTarget
        );
        if (moves.length > 0) return false;
      }
    }
  }
  return true;
};

// Check if game is stalemate
export const isStalemate = (gameState: GameState): boolean => {
  if (gameState.isCheck) return false;

  // Check if any piece has legal moves
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = gameState.board[row][col];
      if (piece?.color === gameState.currentPlayer) {
        const moves = getLegalMoves(
          gameState.board,
          { row, col },
          gameState.currentPlayer,
          gameState.enPassantTarget
        );
        if (moves.length > 0) return false;
      }
    }
  }
  return true;
};

// Check for insufficient material draw
export const hasInsufficientMaterial = (board: (Piece | null)[][]): boolean => {
  const pieces: Piece[] = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.type !== 'king') {
        pieces.push(piece);
      }
    }
  }

  // King vs King
  if (pieces.length === 0) return true;

  // King + Bishop/Knight vs King
  if (pieces.length === 1 && (pieces[0].type === 'bishop' || pieces[0].type === 'knight')) {
    return true;
  }

  // King + Bishop vs King + Bishop (same color squares)
  if (pieces.length === 2 && 
      pieces.every(p => p.type === 'bishop')) {
    return true;
  }

  return false;
};

// Convert move to algebraic notation
export const moveToNotation = (move: Move, board: (Piece | null)[][]): string => {
  const piece = move.piece;
  const fileLetters = 'abcdefgh';
  
  let notation = '';

  // Castling
  if (move.isCastling) {
    return move.to.col > move.from.col ? 'O-O' : 'O-O-O';
  }

  // Piece designation
  if (piece.type !== 'pawn') {
    notation += piece.type.charAt(0).toUpperCase();
  }

  // Capture
  if (move.captured || move.isEnPassant) {
    if (piece.type === 'pawn') {
      notation += fileLetters[move.from.col];
    }
    notation += 'x';
  }

  // Destination square
  notation += fileLetters[move.to.col] + (8 - move.to.row);

  // Promotion
  if (move.isPromotion && move.promotedTo) {
    notation += '=' + move.promotedTo.charAt(0).toUpperCase();
  }

  return notation;
};

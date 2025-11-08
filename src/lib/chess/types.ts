export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type GameMode = 'single' | 'two-player';
export type Difficulty = 'beginner' | 'easy' | 'normal' | 'hard' | 'expert' | 'master';

export interface Piece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  isEnPassant?: boolean;
  isCastling?: boolean;
  isPromotion?: boolean;
  promotedTo?: PieceType;
  notation?: string;
}

export interface GameState {
  board: (Piece | null)[][];
  currentPlayer: PieceColor;
  selectedSquare: Position | null;
  legalMoves: Position[];
  moveHistory: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  isDraw: boolean;
  halfMoveClock: number;
  fullMoveNumber: number;
  enPassantTarget: Position | null;
}

export interface GameConfig {
  mode: GameMode;
  difficulty?: Difficulty;
}

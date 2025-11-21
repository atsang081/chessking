import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, RotateCcw, Lightbulb, Trophy, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { initializeBoard, getLegalMoves, isInCheck, isCheckmate, isStalemate, hasInsufficientMaterial, moveToNotation, getPieceSymbol } from '@/lib/chess/engine';
import { GameState, Position, Move, GameConfig } from '@/lib/chess/types';
import { getAIMove } from '@/lib/chess/ai';
import { Card } from '@/components/ui/card';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';

const Game = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const config = location.state as GameConfig;

  const [gameState, setGameState] = useState<GameState>({
    board: initializeBoard(),
    currentPlayer: 'white',
    selectedSquare: null,
    legalMoves: [],
    moveHistory: [],
    isCheck: false,
    isCheckmate: false,
    isStalemate: false,
    isDraw: false,
    halfMoveClock: 0,
    fullMoveNumber: 1,
    enPassantTarget: null
  });

  const [draggedPiece, setDraggedPiece] = useState<{ pos: Position; element: HTMLElement } | null>(null);
  const [showMoveHistory, setShowMoveHistory] = useState(false);

  // Check game state after each move
  useEffect(() => {
    const isCheck = isInCheck(gameState.board, gameState.currentPlayer);
    const isCheckmateSituation = isCheck && isCheckmate(gameState);
    const isStalemateSituation = isStalemate(gameState);
    const isDrawSituation = gameState.halfMoveClock >= 100 || hasInsufficientMaterial(gameState.board);

    if (isCheckmateSituation || isStalemateSituation || isDrawSituation) {
      setGameState(prev => ({
        ...prev,
        isCheck,
        isCheckmate: isCheckmateSituation,
        isStalemate: isStalemateSituation,
        isDraw: isDrawSituation
      }));

      if (isCheckmateSituation) {
        const winner = gameState.currentPlayer === 'white' ? 'Black' : 'White';
        toast.success(t('game.toast.checkmateWin', { winner }), { duration: 5000 });
      } else if (isStalemateSituation) {
        toast.info(t('game.toast.drawStalemate'), { duration: 5000 });
      } else if (isDrawSituation) {
        toast.info(t('game.toast.draw'), { duration: 5000 });
      }
    } else if (isCheck) {
      setGameState(prev => ({ ...prev, isCheck }));
      toast.warning(t('game.toast.check'));
    } else {
      setGameState(prev => ({ ...prev, isCheck: false }));
    }
  }, [gameState.board, gameState.currentPlayer, gameState.halfMoveClock]);

  // AI move
  useEffect(() => {
    if (config.mode === 'single' && 
        gameState.currentPlayer === 'black' && 
        !gameState.isCheckmate && 
        !gameState.isStalemate && 
        !gameState.isDraw &&
        config.difficulty) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(gameState, config.difficulty!);
        if (aiMove) {
          makeMove(aiMove.from, aiMove.to);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [gameState.currentPlayer, config.mode, config.difficulty]);

  const makeMove = (from: Position, to: Position) => {
    const piece = gameState.board[from.row][from.col];
    if (!piece) return;

    const newBoard = gameState.board.map(row => [...row]);
    const captured = newBoard[to.row][to.col];
    
    // Handle en passant capture
    let isEnPassant = false;
    if (piece.type === 'pawn' && 
        gameState.enPassantTarget &&
        to.row === gameState.enPassantTarget.row &&
        to.col === gameState.enPassantTarget.col) {
      isEnPassant = true;
      const capturedPawnRow = piece.color === 'white' ? to.row + 1 : to.row - 1;
      newBoard[capturedPawnRow][to.col] = null;
    }

    // Handle castling
    let isCastling = false;
    if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
      isCastling = true;
      const rookCol = to.col > from.col ? 7 : 0;
      const newRookCol = to.col > from.col ? 5 : 3;
      const rook = newBoard[from.row][rookCol];
      if (rook) {
        newBoard[from.row][newRookCol] = { ...rook, hasMoved: true };
        newBoard[from.row][rookCol] = null;
      }
    }

    // Move piece
    newBoard[to.row][to.col] = { ...piece, hasMoved: true };
    newBoard[from.row][from.col] = null;

    // Handle pawn promotion
    let isPromotion = false;
    if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
      isPromotion = true;
      newBoard[to.row][to.col] = { ...piece, type: 'queen', hasMoved: true };
    }

    // Set en passant target
    let enPassantTarget = null;
    if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
      enPassantTarget = {
        row: piece.color === 'white' ? from.row - 1 : from.row + 1,
        col: from.col
      };
    }

    const move: Move = {
      from,
      to,
      piece,
      captured: captured || undefined,
      isEnPassant,
      isCastling,
      isPromotion,
      promotedTo: isPromotion ? 'queen' : undefined
    };

    move.notation = moveToNotation(move, gameState.board);

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: prev.currentPlayer === 'white' ? 'black' : 'white',
      selectedSquare: null,
      legalMoves: [],
      moveHistory: [...prev.moveHistory, move],
      halfMoveClock: captured || piece.type === 'pawn' ? 0 : prev.halfMoveClock + 1,
      fullMoveNumber: prev.currentPlayer === 'black' ? prev.fullMoveNumber + 1 : prev.fullMoveNumber,
      enPassantTarget
    }));
  };

  const handleSquareClick = (row: number, col: number) => {
    const piece = gameState.board[row][col];

    // If a square is already selected
    if (gameState.selectedSquare) {
      // Try to make a move
      const isLegalMove = gameState.legalMoves.some(
        move => move.row === row && move.col === col
      );

      if (isLegalMove) {
        makeMove(gameState.selectedSquare, { row, col });
      } else if (piece?.color === gameState.currentPlayer) {
        // Select new piece
        const moves = getLegalMoves(gameState.board, { row, col }, gameState.currentPlayer, gameState.enPassantTarget);
        setGameState(prev => ({
          ...prev,
          selectedSquare: { row, col },
          legalMoves: moves
        }));
      } else {
        // Deselect
        setGameState(prev => ({
          ...prev,
          selectedSquare: null,
          legalMoves: []
        }));
      }
    } else if (piece?.color === gameState.currentPlayer) {
      // Select piece
      const moves = getLegalMoves(gameState.board, { row, col }, gameState.currentPlayer, gameState.enPassantTarget);
      setGameState(prev => ({
        ...prev,
        selectedSquare: { row, col },
        legalMoves: moves
      }));
    }
  };

  const handleDragStart = (e: React.DragEvent, row: number, col: number) => {
    const piece = gameState.board[row][col];
    if (piece?.color !== gameState.currentPlayer) {
      e.preventDefault();
      return;
    }

    const target = e.currentTarget as HTMLElement;
    setDraggedPiece({ pos: { row, col }, element: target });
    
    const moves = getLegalMoves(gameState.board, { row, col }, gameState.currentPlayer, gameState.enPassantTarget);
    setGameState(prev => ({
      ...prev,
      selectedSquare: { row, col },
      legalMoves: moves
    }));

    // Make drag image transparent
    e.dataTransfer.effectAllowed = 'move';
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    
    if (!draggedPiece) return;

    const isLegalMove = gameState.legalMoves.some(
      move => move.row === row && move.col === col
    );

    if (isLegalMove) {
      makeMove(draggedPiece.pos, { row, col });
    }

    setDraggedPiece(null);
  };

  const handleNewGame = () => {
    setGameState({
      board: initializeBoard(),
      currentPlayer: 'white',
      selectedSquare: null,
      legalMoves: [],
      moveHistory: [],
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      halfMoveClock: 0,
      fullMoveNumber: 1,
      enPassantTarget: null
    });
    toast.success(t('game.toast.newGameStarted'));
  };

  const handleUndo = () => {
    if (gameState.moveHistory.length === 0) return;

    const movesToUndo = config.mode === 'single' ? 2 : 1;
    const newHistory = gameState.moveHistory.slice(0, -movesToUndo);
    
    // Rebuild board from history
    const newBoard = initializeBoard();
    let currentPlayer: 'white' | 'black' = 'white';
    
    for (const move of newHistory) {
      const piece = newBoard[move.from.row][move.from.col];
      if (piece) {
        newBoard[move.to.row][move.to.col] = { ...piece, hasMoved: true };
        newBoard[move.from.row][move.from.col] = null;
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
      }
    }

    setGameState({
      board: newBoard,
      currentPlayer,
      selectedSquare: null,
      legalMoves: [],
      moveHistory: newHistory,
      isCheck: false,
      isCheckmate: false,
      isStalemate: false,
      isDraw: false,
      halfMoveClock: 0,
      fullMoveNumber: Math.floor(newHistory.length / 2) + 1,
      enPassantTarget: null
    });

    toast.info(t('game.toast.moveUndone'));
  };

  if (!config) {
    navigate('/');
    return null;
  }

  const isSquareSelected = (row: number, col: number) => {
    return gameState.selectedSquare?.row === row && gameState.selectedSquare?.col === col;
  };

  const isSquareLegalMove = (row: number, col: number) => {
    return gameState.legalMoves.some(move => move.row === row && move.col === col);
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Language Selector - Fixed position top right */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageSelector />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-3 md:mb-6 animate-slide-up">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover-lift h-10 w-10"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Button>
          
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{t('app.title')}</h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 md:mt-1">
              {config.mode === 'single' ? `${t('game.aiMode')}: ${config.difficulty}` : t('game.twoPlayerMode')}
            </p>
          </div>

          <div className="w-10" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-3 md:gap-6">
          {/* Board Section */}
          <div className="flex flex-col items-center animate-bounce-in w-full">
            {/* Status Bar */}
            <Card className="w-full max-w-[600px] p-2 md:p-4 mb-2 md:mb-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center text-xs md:text-base">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${gameState.currentPlayer === 'white' ? 'bg-board-light' : 'bg-board-dark'}`} />
                    <span className="font-semibold">
                      {gameState.currentPlayer === 'white' ? t('game.whiteToMove') : t('game.blackToMove')}
                    </span>
                  </div>
                </div>
                {gameState.isCheck && !gameState.isCheckmate && (
                  <div className="flex justify-center">
                    <span className="text-destructive font-bold animate-pulse text-xs md:text-base">{t('game.check')}</span>
                  </div>
                )}
                {gameState.isCheckmate && (
                  <div className="flex items-center justify-center gap-1 md:gap-2 text-accent">
                    <Trophy className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="font-bold text-xs md:text-base">{t('game.checkmate')}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Chess Board */}
            <div className="w-full max-w-[600px] aspect-square bg-border p-1 md:p-2 rounded-lg md:rounded-2xl shadow-[0_8px_32px_hsl(var(--foreground)/0.1)]">
              <div className="w-full h-full grid grid-cols-8 grid-rows-8 gap-0 rounded-lg md:rounded-xl overflow-hidden">
                {gameState.board.map((row, rowIndex) =>
                  row.map((piece, colIndex) => {
                    const isLight = (rowIndex + colIndex) % 2 === 0;
                    const isSelected = isSquareSelected(rowIndex, colIndex);
                    const isLegalMove = isSquareLegalMove(rowIndex, colIndex);
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`
                          relative flex items-center justify-center cursor-pointer
                          transition-all duration-200 aspect-square
                          ${isLight ? 'bg-board-light' : 'bg-board-dark'}
                          ${isSelected ? 'ring-4 ring-board-selected ring-inset' : ''}
                          ${isLegalMove ? 'ring-4 ring-board-highlight ring-inset' : ''}
                          hover:brightness-95
                        `}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                      >
                        {piece && (
                          <div
                            draggable={piece.color === gameState.currentPlayer && !gameState.isCheckmate && !gameState.isStalemate}
                            onDragStart={(e) => handleDragStart(e, rowIndex, colIndex)}
                            className={`
                              text-4xl md:text-5xl lg:text-6xl select-none
                              ${piece.color === gameState.currentPlayer ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'}
                              transition-transform hover:scale-110
                            `}
                          >
                            {getPieceSymbol(piece)}
                          </div>
                        )}
                        
                        {isLegalMove && !piece && (
                          <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-board-highlight opacity-60" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2 w-full max-w-[600px] mt-2 md:mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={gameState.moveHistory.length === 0}
                className="hover-lift text-xs flex-1"
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                {t('game.undo')}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleNewGame}
                className="hover-lift text-xs flex-1"
              >
                {t('game.newGame')}
              </Button>
            </div>
          </div>

          {/* Move History - Desktop */}
          <Card className="p-3 md:p-4 h-fit max-h-[600px] overflow-y-auto animate-slide-up hidden md:block">
            <h3 className="font-bold text-base md:text-lg mb-2 md:mb-3 flex items-center justify-center gap-1.5 md:gap-2">
              <span className="text-sm md:text-base">📜</span>
              <span>{t('game.moveHistory')}</span>
            </h3>
            {gameState.moveHistory.length === 0 ? (
              <p className="text-xs md:text-sm text-muted-foreground text-center py-6 md:py-8">
                {t('game.noMovesYet')}
              </p>
            ) : (
              <div className="space-y-0.5 md:space-y-1">
                {gameState.moveHistory.map((move, index) => (
                  index % 2 === 0 && (
                    <div key={index} className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm py-0.5 md:py-1">
                      <span className="text-muted-foreground w-6 md:w-8">{Math.floor(index / 2) + 1}.</span>
                      <span className="font-mono flex-1">{move.notation}</span>
                      {gameState.moveHistory[index + 1] && (
                        <span className="font-mono flex-1">{gameState.moveHistory[index + 1].notation}</span>
                      )}
                    </div>
                  )
                ))}
              </div>
            )}
          </Card>

          {/* Move History - Mobile Collapsible */}
          <div className="md:hidden w-full">
            <button
              onClick={() => setShowMoveHistory(!showMoveHistory)}
              className="w-full flex items-center justify-between p-3 bg-card rounded-lg border border-border hover:bg-accent/50 transition-colors mb-4"
            >
              <span className="font-bold text-sm flex items-center gap-2">
                <span>📜</span>
                <span>{t('game.moveHistory')}</span>
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showMoveHistory ? 'rotate-180' : ''
                }`}
              />
            </button>
            {showMoveHistory && (
              <Card className="p-3 max-h-[300px] overflow-y-auto animate-in slide-in-from-top-2 mb-4">
                {gameState.moveHistory.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    {t('game.noMovesYet')}
                  </p>
                ) : (
                  <div className="space-y-1">
                    {gameState.moveHistory.map((move, index) => (
                      index % 2 === 0 && (
                        <div key={index} className="flex items-center gap-2 text-xs py-0.5">
                          <span className="text-muted-foreground w-6">{Math.floor(index / 2) + 1}.</span>
                          <span className="font-mono flex-1">{move.notation}</span>
                          {gameState.moveHistory[index + 1] && (
                            <span className="font-mono flex-1">{gameState.moveHistory[index + 1].notation}</span>
                          )}
                        </div>
                      )
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;

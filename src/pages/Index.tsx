import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Users, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GameMode, Difficulty } from '@/lib/chess/types';
import heroImage from '@/assets/chess-hero.jpg';

const Index = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');

  const difficulties: { value: Difficulty; label: string; description: string; icon: string }[] = [
    { value: 'beginner', label: 'Beginner', description: 'Just starting out', icon: '🌱' },
    { value: 'easy', label: 'Easy', description: 'Learning the ropes', icon: '🎯' },
    { value: 'normal', label: 'Normal', description: 'Ready for a challenge', icon: '⚡' },
    { value: 'hard', label: 'Hard', description: 'Experienced player', icon: '🔥' },
    { value: 'expert', label: 'Expert', description: 'Advanced tactics', icon: '💎' },
    { value: 'master', label: 'Master', description: 'Ultimate challenge', icon: '👑' },
  ];

  const handleStartGame = () => {
    if (!selectedMode) return;
    
    navigate('/game', {
      state: {
        mode: selectedMode,
        difficulty: selectedMode === 'single' ? selectedDifficulty : undefined
      }
    });
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="relative z-10 container mx-auto px-3 py-6 md:py-12 text-center">
          <div className="inline-flex items-center gap-2 mb-2 md:mb-4 animate-bounce-in">
            <Crown className="w-8 h-8 md:w-12 md:h-12 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent animate-slide-up">
            Chess King
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up px-4">
            Master the game of kings! Play against AI or challenge a friend.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-3 pb-6 md:pb-12 max-w-4xl">
        {/* Mode Selection */}
        {!selectedMode ? (
          <div className="space-y-4 md:space-y-6 animate-bounce-in">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-8">
              Choose Your Adventure
            </h2>
            
            <div className="grid md:grid-cols-2 gap-3 md:gap-6">
              <Card 
                className="p-4 md:p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 hover:border-primary group"
                onClick={() => setSelectedMode('single')}
              >
                <div className="text-center space-y-2 md:space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Cpu className="w-7 h-7 md:w-10 md:h-10 text-primary" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold">Single Player</h3>
                  <p className="text-xs md:text-base text-muted-foreground">
                    Challenge our smart AI with 6 difficulty levels
                  </p>
                  <div className="pt-1 md:pt-2">
                    <Button variant="hero" size="sm" className="w-full md:text-base">
                      Play vs AI
                    </Button>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-4 md:p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 hover:border-secondary group"
                onClick={() => setSelectedMode('two-player')}
              >
                <div className="text-center space-y-2 md:space-y-4">
                  <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                    <Users className="w-7 h-7 md:w-10 md:h-10 text-secondary" />
                  </div>
                  <h3 className="text-lg md:text-2xl font-bold">Two Players</h3>
                  <p className="text-xs md:text-base text-muted-foreground">
                    Play locally with a friend on the same device
                  </p>
                  <div className="pt-1 md:pt-2">
                    <Button variant="secondary" size="sm" className="w-full md:text-base">
                      Play Together
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : selectedMode === 'single' ? (
          /* Difficulty Selection */
          <div className="space-y-4 md:space-y-6 animate-bounce-in">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedMode(null)}
                className="text-sm"
              >
                ← Back
              </Button>
              <h2 className="text-xl md:text-2xl font-bold">
                Select Difficulty
              </h2>
              <div className="w-16 md:w-20" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-4">
              {difficulties.map((diff) => (
                <Card
                  key={diff.value}
                  className={`
                    p-3 md:p-6 cursor-pointer transition-all duration-300
                    hover:scale-105 hover:shadow-xl
                    ${selectedDifficulty === diff.value 
                      ? 'border-2 border-primary ring-4 ring-primary/20 bg-primary/5' 
                      : 'border-2 border-transparent hover:border-primary/50'
                    }
                  `}
                  onClick={() => setSelectedDifficulty(diff.value)}
                >
                  <div className="text-center space-y-1 md:space-y-3">
                    <div className="text-2xl md:text-4xl">{diff.icon}</div>
                    <h3 className="text-sm md:text-xl font-bold">{diff.label}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{diff.description}</p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-center pt-3 md:pt-6">
              <Button
                variant="hero"
                size="default"
                onClick={handleStartGame}
                className="min-w-[180px] md:min-w-[240px]"
              >
                Start Game
              </Button>
            </div>
          </div>
        ) : (
          /* Two Player Ready */
          <div className="text-center space-y-4 md:space-y-8 animate-bounce-in py-6 md:py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full bg-secondary/20">
              <Users className="w-8 h-8 md:w-12 md:h-12 text-secondary" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">Ready to Play!</h2>
              <p className="text-sm md:text-lg text-muted-foreground max-w-md mx-auto px-4">
                Get ready for an exciting match! White moves first.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Button
                variant="outline"
                size="default"
                onClick={() => setSelectedMode(null)}
              >
                ← Back
              </Button>
              <Button
                variant="hero"
                size="default"
                onClick={handleStartGame}
                className="min-w-[160px] md:min-w-[200px]"
              >
                Start Game
              </Button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 md:mt-16 grid grid-cols-3 gap-3 md:gap-6 text-center">
          <div className="space-y-1 md:space-y-2 animate-slide-up">
            <div className="text-2xl md:text-4xl">♟️</div>
            <h3 className="font-bold text-xs md:text-base">Official Rules</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              FIDE-compliant chess with all special moves
            </p>
          </div>
          <div className="space-y-1 md:space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-2xl md:text-4xl">🎯</div>
            <h3 className="font-bold text-xs md:text-base">Smart AI</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              6 difficulty levels from beginner to master
            </p>
          </div>
          <div className="space-y-1 md:space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-2xl md:text-4xl">📱</div>
            <h3 className="font-bold text-xs md:text-base">Mobile Ready</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Perfect experience on any device
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

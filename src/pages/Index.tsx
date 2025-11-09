import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Users, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GameMode, Difficulty } from '@/lib/chess/types';
import heroImage from '@/assets/chess-hero.jpg';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSelector } from '@/components/LanguageSelector';

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('normal');

  const difficulties: { value: Difficulty; label: string; description: string; icon: string }[] = [
    { value: 'beginner', label: t('home.difficulty.beginner'), description: t('home.difficulty.beginnerDesc'), icon: '🌱' },
    { value: 'easy', label: t('home.difficulty.easy'), description: t('home.difficulty.easyDesc'), icon: '🎯' },
    { value: 'normal', label: t('home.difficulty.normal'), description: t('home.difficulty.normalDesc'), icon: '⚡' },
    { value: 'hard', label: t('home.difficulty.hard'), description: t('home.difficulty.hardDesc'), icon: '🔥' },
    { value: 'expert', label: t('home.difficulty.expert'), description: t('home.difficulty.expertDesc'), icon: '💎' },
    { value: 'master', label: t('home.difficulty.master'), description: t('home.difficulty.masterDesc'), icon: '👑' },
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
      {/* Language Selector - Fixed position top right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSelector />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <img 
          src={heroImage}
          alt="Cheerful chess pieces on a colorful board"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          fetchPriority="high"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
        
        <div className="relative z-10 container mx-auto px-3 py-6 md:py-12 text-center">
          <div className="inline-flex items-center gap-2 mb-2 md:mb-4 animate-bounce-in">
            <Crown className="w-8 h-8 md:w-12 md:h-12 text-primary" />
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent animate-slide-up">
            {t('app.title')}
          </h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up px-4">
            {t('app.subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-3 pb-6 md:pb-12 max-w-4xl">
        {/* Mode Selection */}
        {!selectedMode ? (
          <div className="space-y-4 md:space-y-6 animate-bounce-in">
            <h2 className="text-xl md:text-2xl font-bold text-center mb-4 md:mb-8">
              {t('home.chooseAdventure')}
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
                  <h3 className="text-lg md:text-2xl font-bold">{t('home.singlePlayer')}</h3>
                  <p className="text-xs md:text-base text-muted-foreground">
                    {t('home.singlePlayerDesc')}
                  </p>
                  <div className="pt-1 md:pt-2">
                    <Button variant="hero" size="sm" className="w-full md:text-base">
                      {t('home.playVsAI')}
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
                  <h3 className="text-lg md:text-2xl font-bold">{t('home.twoPlayers')}</h3>
                  <p className="text-xs md:text-base text-muted-foreground">
                    {t('home.twoPlayersDesc')}
                  </p>
                  <div className="pt-1 md:pt-2">
                    <Button variant="secondary" size="sm" className="w-full md:text-base">
                      {t('home.playTogether')}
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
                ← {t('home.back')}
              </Button>
              <h2 className="text-xl md:text-2xl font-bold">
                {t('home.selectDifficulty')}
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
                {t('home.startGame')}
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
              <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4">{t('home.readyToPlay')}</h2>
              <p className="text-sm md:text-lg text-muted-foreground max-w-md mx-auto px-4">
                {t('home.readyDesc')}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
              <Button
                variant="hero"
                size="default"
                onClick={handleStartGame}
                className="min-w-[160px] md:min-w-[200px]"
              >
                {t('home.startGame')}
              </Button>
              <Button
                variant="outline"
                size="default"
                onClick={() => setSelectedMode(null)}
              >
                ← {t('home.back')}
              </Button>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="mt-8 md:mt-16 grid grid-cols-3 gap-3 md:gap-6 text-center">
          <div className="space-y-1 md:space-y-2 animate-slide-up">
            <div className="text-2xl md:text-4xl">♟️</div>
            <h3 className="font-bold text-xs md:text-base">{t('home.features.officialRules')}</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {t('home.features.officialRulesDesc')}
            </p>
          </div>
          <div className="space-y-1 md:space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="text-2xl md:text-4xl">🎯</div>
            <h3 className="font-bold text-xs md:text-base">{t('home.features.smartAI')}</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {t('home.features.smartAIDesc')}
            </p>
          </div>
          <div className="space-y-1 md:space-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="text-2xl md:text-4xl">📱</div>
            <h3 className="font-bold text-xs md:text-base">{t('home.features.mobileReady')}</h3>
            <p className="text-xs text-muted-foreground hidden sm:block">
              {t('home.features.mobileReadyDesc')}
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 md:mt-16 pt-6 md:pt-8 border-t border-border/50 text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            {t('home.footer.feedback')}: <a href="mailto:cs@bitebite.app" className="hover:text-primary transition-colors">cs@bitebite.app</a>
          </p>
          <p className="text-xs text-muted-foreground">
            {t('home.footer.producedBy')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('home.footer.copyright')}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;

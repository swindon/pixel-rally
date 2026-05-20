import React, { useState } from 'react';
import GameComponent from './components/GameComponent';
import MainMenu from './components/MainMenu';
import { useGameStore } from './store/useGameStore';
import { Coins } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [lastScore, setLastScore] = useState(0);
  const [lastPixels, setLastPixels] = useState(0);
  const [playerName, setPlayerName] = useState('Player');
  const [scoreSubmitted, setScoreSubmitted] = useState(false);
  
  const store = useGameStore();

  const handleGameOver = (score: number, earnedPixels: number) => {
    setLastScore(score);
    setLastPixels(earnedPixels);
    setScoreSubmitted(false);
    setGameState('gameover');
  };

  const submitScore = () => {
    if (!scoreSubmitted && playerName.trim()) {
      store.addScoreToLeaderboard(playerName.trim(), lastScore);
      setScoreSubmitted(true);
    }
  };

  return (
    <div className="app-container">
      {gameState === 'menu' && <MainMenu onStart={() => setGameState('playing')} />}
      
      {gameState === 'playing' && (
        <GameComponent 
          onGameOver={handleGameOver} 
          onQuit={() => setGameState('menu')}
        />
      )}
      
      {gameState === 'gameover' && (
        <div className="game-over-screen">
          <h1 style={{ color: 'var(--neon-pink)', textShadow: '0 0 20px var(--neon-pink)' }}>GAME OVER</h1>
          
          <div style={{ margin: '30px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>
              Score: <span style={{ color: 'var(--neon-cyan)' }}>{lastScore}</span>
            </div>
            {lastScore > store.highScore && (
              <div style={{ color: 'var(--neon-green)', textTransform: 'uppercase', marginBottom: '10px', animation: 'pulse 1s infinite' }}>
                New High Score!
              </div>
            )}
            <div style={{ fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              Earned: <Coins color="var(--neon-yellow)" /> <span style={{ color: 'var(--neon-yellow)' }}>+{lastPixels} Pixels</span>
            </div>
          </div>

          {!scoreSubmitted ? (
            <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                value={playerName} 
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={10}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--neon-cyan)',
                  color: 'white',
                  padding: '10px',
                  fontFamily: 'Orbitron, sans-serif',
                  fontSize: '18px',
                  outline: 'none',
                  borderRadius: '4px'
                }}
                placeholder="Enter Name"
              />
              <button className="neon-button primary" onClick={submitScore}>Submit Score</button>
            </div>
          ) : (
            <div style={{ color: 'var(--neon-green)', marginBottom: '20px', fontSize: '18px' }}>
              Score Submitted!
            </div>
          )}

          <div style={{ display: 'flex', gap: '20px' }}>
            <button className="neon-button primary" onClick={() => setGameState('playing')}>Play Again</button>
            <button className="neon-button" onClick={() => setGameState('menu')}>Main Menu</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

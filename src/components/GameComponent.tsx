import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { MainScene } from '../game/scenes/MainScene';
import { useGameStore, PADDLES, ARENAS, BALLS, TRAILS } from '../store/useGameStore';
import { Pause } from 'lucide-react';

interface GameComponentProps {
  onGameOver: (score: number, earnedPixels: number) => void;
  onQuit: () => void;
}

const GameComponent: React.FC<GameComponentProps> = ({ onGameOver, onQuit }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const store = useGameStore();

  const handlePause = () => {
    gameRef.current?.scene.pause('MainScene');
    setIsPaused(true);
  };

  const handleResume = () => {
    gameRef.current?.scene.resume('MainScene');
    setIsPaused(false);
  };

  useEffect(() => {
    if (gameContainerRef.current && !gameRef.current) {
      const selectedPaddle = PADDLES.find(p => p.id === store.selectedPaddle) || PADDLES[0];
      const selectedArena = ARENAS.find(a => a.id === store.selectedArena) || ARENAS[0];
      const selectedBall = BALLS.find(b => b.id === store.selectedBall) || BALLS[0];
      const selectedTrail = TRAILS.find(t => t.id === store.selectedTrail) || TRAILS[0];

      const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 450,
          height: 800,
        },
        parent: gameContainerRef.current,
        backgroundColor: selectedArena.color,
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { x: 0, y: 0 },
            debug: false,
          },
        },
        scene: {
          create: function (this: Phaser.Scene) {
            // Check if scene already exists to be safe
            if (!this.scene.get('MainScene')) {
              this.scene.add('MainScene', MainScene, true, {
                paddleColor: selectedPaddle.color,
                arenaType: selectedArena.id,
                ballColor: selectedBall.color,
                trailColor: selectedTrail.color
              });
            }
          }
        }
      };

      gameRef.current = new Phaser.Game(config);

      // Handle game over - keep this as a game-level event
      gameRef.current.events.on('gameover', (score: number) => {
        // Calculate rewards: 1 pixel per 10 points
        const earnedPixels = Math.floor(score / 10);
        
        // Update global state
        store.addPixels(earnedPixels);
        store.addXp(score);
        store.setHighScore(score);
        
        onGameOver(score, earnedPixels);
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [onGameOver, store.selectedPaddle, store.selectedArena, store.selectedBall, store.selectedTrail]);

  return (
    <div className="game-wrapper">
      <div id="game-container" ref={gameContainerRef} />
      
      {!isPaused && (
        <button 
          className="neon-button" 
          onClick={handlePause} 
          style={{ 
            position: 'absolute', top: '15px', right: '15px', padding: '8px', zIndex: 10, borderRadius: '50%' 
          }}
        >
          <Pause size={20} />
        </button>
      )}

      {isPaused && (
        <div className="pause-overlay" style={{ 
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 20 
        }}>
          <h2 style={{ color: 'var(--neon-pink)', marginBottom: '40px', fontSize: '36px', textShadow: '0 0 15px var(--neon-pink)' }}>PAUSED</h2>
          <button className="neon-button primary" onClick={handleResume} style={{ marginBottom: '20px', width: '200px' }}>Resume</button>
          <button className="neon-button" onClick={onQuit} style={{ width: '200px' }}>Quit to Menu</button>
        </div>
      )}
    </div>
  );
};

export default GameComponent;

import React, { useState } from 'react';
import { useGameStore, PADDLES, ARENAS, BALLS, TRAILS } from '../store/useGameStore';
import { Trophy, Coins, Zap, ArrowLeft, ShoppingCart, List } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart }) => {
  const [view, setView] = useState<'main' | 'shop' | 'leaderboards'>('main');
  const store = useGameStore();

  const handlePurchasePaddle = (id: string, price: number) => {
    store.unlockPaddle(id, price);
  };

  const handlePurchaseArena = (id: string, price: number) => {
    store.unlockArena(id, price);
  };

  const handlePurchaseBall = (id: string, price: number) => {
    store.unlockBall(id, price);
  };

  const handlePurchaseTrail = (id: string, price: number) => {
    store.unlockTrail(id, price);
  };

  if (view === 'leaderboards') {
    return (
      <div className="shop-screen">
        <h2>Top Players</h2>
        
        <div style={{ width: '100%', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {store.leaderboard.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>No scores yet. Play to set a record!</div>
          ) : (
            <table className="leaderboard-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ color: 'var(--neon-cyan)', borderBottom: '1px solid rgba(0,255,255,0.3)' }}>
                  <th style={{ padding: '10px' }}>Rank</th>
                  <th style={{ padding: '10px' }}>Player</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {store.leaderboard.map((entry, index) => (
                  <tr key={index} style={{ color: index === 0 ? 'var(--neon-yellow)' : 'white' }}>
                    <td style={{ padding: '10px' }}>#{index + 1}</td>
                    <td style={{ padding: '10px' }}>{entry.name}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>{entry.score.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <button className="neon-button" onClick={() => setView('main')} style={{ marginTop: '30px' }}>
          <ArrowLeft size={20} /> Back
        </button>
      </div>
    );
  }

  if (view === 'shop') {
    return (
      <div className="shop-screen">
        <h2>Garage & Shop</h2>
        
        <div className="stats-bar" style={{ marginTop: '20px' }}>
          <div className="stat-item"><Coins size={20} /> {store.pixels} Pixels</div>
        </div>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px' }}>
          <div>
            <h3 style={{ marginBottom: '15px', color: 'var(--neon-pink)' }}>Paddles</h3>
            <div className="shop-grid" style={{ gridTemplateColumns: '1fr' }}>
              {PADDLES.map(p => {
                const isUnlocked = store.unlockedPaddles.includes(p.id);
                const isEquipped = store.selectedPaddle === p.id;
                
                return (
                  <div key={p.id} className={`shop-item ${isUnlocked ? 'unlocked' : ''} ${isEquipped ? 'equipped' : ''}`}>
                    <div className="item-color-preview" style={{ backgroundColor: `#${p.color.toString(16).padStart(6, '0')}` }} />
                    <span style={{ fontSize: '18px' }}>{p.name}</span>
                    {isEquipped ? (
                      <button className="neon-button" disabled style={{ width: '100%' }}>Equipped</button>
                    ) : isUnlocked ? (
                      <button className="neon-button" style={{ width: '100%' }} onClick={() => store.equipPaddle(p.id)}>Equip</button>
                    ) : (
                      <button 
                        className="neon-button" 
                        style={{ width: '100%' }}
                        disabled={store.pixels < p.price}
                        onClick={() => handlePurchasePaddle(p.id, p.price)}
                      >
                        <ShoppingCart size={16} /> {p.price}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div>
            <h3 style={{ marginBottom: '15px', color: 'var(--neon-pink)' }}>Balls</h3>
            <div className="shop-grid" style={{ gridTemplateColumns: '1fr' }}>
              {BALLS.map(b => {
                const isUnlocked = store.unlockedBalls.includes(b.id);
                const isEquipped = store.selectedBall === b.id;
                
                return (
                  <div key={b.id} className={`shop-item ${isUnlocked ? 'unlocked' : ''} ${isEquipped ? 'equipped' : ''}`}>
                    <div className="item-color-preview" style={{ backgroundColor: `#${b.color.toString(16).padStart(6, '0')}`, borderRadius: '50%' }} />
                    <span style={{ fontSize: '18px' }}>{b.name}</span>
                    {isEquipped ? (
                      <button className="neon-button" disabled style={{ width: '100%' }}>Equipped</button>
                    ) : isUnlocked ? (
                      <button className="neon-button" style={{ width: '100%' }} onClick={() => store.equipBall(b.id)}>Equip</button>
                    ) : (
                      <button 
                        className="neon-button" 
                        style={{ width: '100%' }}
                        disabled={store.pixels < b.price}
                        onClick={() => handlePurchaseBall(b.id, b.price)}
                      >
                        <ShoppingCart size={16} /> {b.price}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '15px', color: 'var(--neon-pink)' }}>Trails</h3>
            <div className="shop-grid" style={{ gridTemplateColumns: '1fr' }}>
              {TRAILS.map(t => {
                const isUnlocked = store.unlockedTrails.includes(t.id);
                const isEquipped = store.selectedTrail === t.id;
                
                return (
                  <div key={t.id} className={`shop-item ${isUnlocked ? 'unlocked' : ''} ${isEquipped ? 'equipped' : ''}`}>
                    <div className="item-color-preview" style={{ backgroundColor: `#${t.color.toString(16).padStart(6, '0')}`, borderRadius: '0' }} />
                    <span style={{ fontSize: '18px' }}>{t.name}</span>
                    {isEquipped ? (
                      <button className="neon-button" disabled style={{ width: '100%' }}>Equipped</button>
                    ) : isUnlocked ? (
                      <button className="neon-button" style={{ width: '100%' }} onClick={() => store.equipTrail(t.id)}>Equip</button>
                    ) : (
                      <button 
                        className="neon-button" 
                        style={{ width: '100%' }}
                        disabled={store.pixels < t.price}
                        onClick={() => handlePurchaseTrail(t.id, t.price)}
                      >
                        <ShoppingCart size={16} /> {t.price}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 style={{ marginBottom: '15px', color: 'var(--neon-pink)' }}>Arenas</h3>
            <div className="shop-grid" style={{ gridTemplateColumns: '1fr' }}>
              {ARENAS.map(a => {
                const isUnlocked = store.unlockedArenas.includes(a.id);
                const isEquipped = store.selectedArena === a.id;
                
                return (
                  <div key={a.id} className={`shop-item ${isUnlocked ? 'unlocked' : ''} ${isEquipped ? 'equipped' : ''}`}>
                    <span style={{ fontSize: '18px' }}>{a.name}</span>
                    {isEquipped ? (
                      <button className="neon-button" disabled style={{ width: '100%' }}>Equipped</button>
                    ) : isUnlocked ? (
                      <button className="neon-button" style={{ width: '100%' }} onClick={() => store.equipArena(a.id)}>Equip</button>
                    ) : (
                      <button 
                        className="neon-button" 
                        style={{ width: '100%' }}
                        disabled={store.pixels < a.price}
                        onClick={() => handlePurchaseArena(a.id, a.price)}
                      >
                        <ShoppingCart size={16} /> {a.price}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <button className="neon-button" onClick={() => setView('main')} style={{ marginTop: '20px' }}>
          <ArrowLeft size={20} /> Back
        </button>
      </div>
    );
  }

  return (
    <div className="main-menu">
      <div className="title-container">
        <h1>Pixel Rally</h1>
        <div className="subtitle">Arcade Progression Pong</div>
      </div>

      <div className="stats-bar">
        <div className="stat-item" title="Player Level">
          <Zap size={20} /> Lvl {store.level}
        </div>
        <div className="stat-item" title="High Score">
          <Trophy size={20} /> {store.highScore}
        </div>
        <div className="stat-item" title="Pixels (Currency)">
          <Coins size={20} /> {store.pixels}
        </div>
      </div>

      <div className="menu-buttons">
        <button className="neon-button primary" onClick={onStart}>Play Arcade</button>
        <button className="neon-button" onClick={() => setView('shop')}>Garage / Shop</button>
        <button className="neon-button" onClick={() => setView('leaderboards')}>
          <List size={20} /> Leaderboards
        </button>
      </div>
    </div>
  );
};

export default MainMenu;

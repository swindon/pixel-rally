import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../store/useGameStore';

describe('useGameStore', () => {
  beforeEach(() => {
    useGameStore.getState().resetProgress();
  });

  it('should initialize with default values', () => {
    const state = useGameStore.getState();
    expect(state.pixels).toBe(0);
    expect(state.xp).toBe(0);
    expect(state.level).toBe(1);
    expect(state.highScore).toBe(0);
  });

  it('should add pixels correctly', () => {
    useGameStore.getState().addPixels(150);
    expect(useGameStore.getState().pixels).toBe(150);
  });

  it('should calculate levels correctly based on XP', () => {
    useGameStore.getState().addXp(500);
    expect(useGameStore.getState().level).toBe(1); // 500 XP = level 1

    useGameStore.getState().addXp(600); // Total 1100 XP
    expect(useGameStore.getState().level).toBe(2); // 1100 XP = level 2
  });

  it('should update high score only if new score is higher', () => {
    useGameStore.getState().setHighScore(500);
    expect(useGameStore.getState().highScore).toBe(500);

    useGameStore.getState().setHighScore(400); // Lower score
    expect(useGameStore.getState().highScore).toBe(500); // Keeps 500

    useGameStore.getState().setHighScore(600); // Higher score
    expect(useGameStore.getState().highScore).toBe(600); // Updates to 600
  });

  it('should allow unlocking items if sufficient pixels', () => {
    useGameStore.getState().addPixels(1000);
    
    // Purchase something for 500
    const success = useGameStore.getState().unlockPaddle('neon_pink', 500);
    expect(success).toBe(true);
    expect(useGameStore.getState().pixels).toBe(500);
    expect(useGameStore.getState().unlockedPaddles).toContain('neon_pink');
  });

  it('should prevent unlocking items if insufficient pixels', () => {
    useGameStore.getState().addPixels(100);
    
    // Attempt purchase for 500
    const success = useGameStore.getState().unlockPaddle('neon_pink', 500);
    expect(success).toBe(false);
    expect(useGameStore.getState().pixels).toBe(100); // Unchanged
    expect(useGameStore.getState().unlockedPaddles).not.toContain('neon_pink');
  });

  it('should add score to leaderboard and keep top 10', () => {
    const state = useGameStore.getState();
    expect(state.leaderboard.length).toBe(0);

    state.addScoreToLeaderboard('Player1', 100);
    expect(useGameStore.getState().leaderboard.length).toBe(1);
    expect(useGameStore.getState().leaderboard[0].name).toBe('Player1');
    expect(useGameStore.getState().leaderboard[0].score).toBe(100);

    // Add 10 more to exceed the 10 limit
    for (let i = 0; i < 10; i++) {
      useGameStore.getState().addScoreToLeaderboard(`Player${i+2}`, 50 * i);
    }

    expect(useGameStore.getState().leaderboard.length).toBe(10);
    // Highest score should be 100 (Player1)
    expect(useGameStore.getState().leaderboard[0].score).toBe(450); // The max from loop is 450
  });
});

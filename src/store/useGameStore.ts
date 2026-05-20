import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CosmeticItem {
  id: string;
  name: string;
  price: number;
  color: number; // Hex color for Phaser
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export const PADDLES: CosmeticItem[] = [
  { id: 'standard', name: 'Standard', price: 0, color: 0x00ffff },
  { id: 'neon_pink', name: 'Neon Pink', price: 500, color: 0xff00ff },
  { id: 'toxic_green', name: 'Toxic Green', price: 1000, color: 0x00ff00 },
  { id: 'gold_rush', name: 'Gold Rush', price: 2500, color: 0xffd700 },
];

export const BALLS: CosmeticItem[] = [
  { id: 'standard', name: 'Standard', price: 0, color: 0xffffff },
  { id: 'fire', name: 'Fire', price: 500, color: 0xff4500 },
  { id: 'plasma', name: 'Plasma', price: 1000, color: 0x00ffcc },
  { id: 'void', name: 'Void', price: 2500, color: 0x8a2be2 },
];

export const TRAILS: CosmeticItem[] = [
  { id: 'standard', name: 'Standard', price: 0, color: 0x00ffff },
  { id: 'hot_pink', name: 'Hot Pink', price: 500, color: 0xff1493 },
  { id: 'electric', name: 'Electric', price: 1000, color: 0xffff00 },
  { id: 'ghost', name: 'Ghost', price: 2500, color: 0xffffff },
];

export const ARENAS: CosmeticItem[] = [
  { id: 'classic', name: 'Classic', price: 0, color: 0x111111 },
  { id: 'obstacle', name: 'Obstacle', price: 1000, color: 0x1a0f2e },
  { id: 'gravity', name: 'Gravity', price: 2000, color: 0x2e0f15 },
];

const XP_PER_LEVEL = 1000;

interface GameState {
  pixels: number;
  xp: number;
  level: number;
  highScore: number;
  selectedPaddle: string;
  selectedArena: string;
  selectedBall: string;
  selectedTrail: string;
  unlockedPaddles: string[];
  unlockedArenas: string[];
  unlockedBalls: string[];
  unlockedTrails: string[];
  leaderboard: LeaderboardEntry[];
  
  // Actions
  addPixels: (amount: number) => void;
  addXp: (amount: number) => void;
  setHighScore: (score: number) => void;
  addScoreToLeaderboard: (name: string, score: number) => void;
  unlockPaddle: (id: string, price: number) => boolean;
  unlockArena: (id: string, price: number) => boolean;
  unlockBall: (id: string, price: number) => boolean;
  unlockTrail: (id: string, price: number) => boolean;
  equipPaddle: (id: string) => void;
  equipArena: (id: string) => void;
  equipBall: (id: string) => void;
  equipTrail: (id: string) => void;
  resetProgress: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      pixels: 0,
      xp: 0,
      level: 1,
      highScore: 0,
      selectedPaddle: 'standard',
      selectedArena: 'classic',
      selectedBall: 'standard',
      selectedTrail: 'standard',
      unlockedPaddles: ['standard'],
      unlockedArenas: ['classic'],
      unlockedBalls: ['standard'],
      unlockedTrails: ['standard'],
      leaderboard: [],

      addPixels: (amount) => set((state) => ({ pixels: state.pixels + amount })),
      
      addXp: (amount) => set((state) => {
        const newXp = state.xp + amount;
        const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
        return { xp: newXp, level: newLevel };
      }),

      setHighScore: (score) => set((state) => ({ 
        highScore: Math.max(state.highScore, score) 
      })),

      addScoreToLeaderboard: (name, score) => set((state) => {
        const newEntry: LeaderboardEntry = {
          name,
          score,
          date: new Date().toISOString()
        };
        const newLeaderboard = [...state.leaderboard, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10); // Keep top 10
        return { leaderboard: newLeaderboard };
      }),

      unlockPaddle: (id, price) => {
        const state = get();
        if (state.pixels >= price && !state.unlockedPaddles.includes(id)) {
          set({ 
            pixels: state.pixels - price,
            unlockedPaddles: [...state.unlockedPaddles, id]
          });
          return true;
        }
        return false;
      },

      unlockArena: (id, price) => {
        const state = get();
        if (state.pixels >= price && !state.unlockedArenas.includes(id)) {
          set({ 
            pixels: state.pixels - price,
            unlockedArenas: [...state.unlockedArenas, id]
          });
          return true;
        }
        return false;
      },

      unlockBall: (id, price) => {
        const state = get();
        if (state.pixels >= price && !state.unlockedBalls.includes(id)) {
          set({ 
            pixels: state.pixels - price,
            unlockedBalls: [...state.unlockedBalls, id]
          });
          return true;
        }
        return false;
      },

      unlockTrail: (id, price) => {
        const state = get();
        if (state.pixels >= price && !state.unlockedTrails.includes(id)) {
          set({ 
            pixels: state.pixels - price,
            unlockedTrails: [...state.unlockedTrails, id]
          });
          return true;
        }
        return false;
      },

      equipPaddle: (id) => set({ selectedPaddle: id }),
      equipArena: (id) => set({ selectedArena: id }),
      equipBall: (id) => set({ selectedBall: id }),
      equipTrail: (id) => set({ selectedTrail: id }),

      resetProgress: () => set({
        pixels: 0,
        xp: 0,
        level: 1,
        highScore: 0,
        selectedPaddle: 'standard',
        selectedArena: 'classic',
        selectedBall: 'standard',
        selectedTrail: 'standard',
        unlockedPaddles: ['standard'],
        unlockedArenas: ['classic'],
        unlockedBalls: ['standard'],
        unlockedTrails: ['standard'],
        leaderboard: [],
      })
    }),
    {
      name: 'pixel-rally-storage',
    }
  )
);

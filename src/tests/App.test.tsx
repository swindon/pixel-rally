import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';

// Mock components
vi.mock('../components/MainMenu', () => ({
  default: ({ onStart }: { onStart: () => void }) => (
    <div data-testid="main-menu">
      <button onClick={onStart}>Start Game</button>
    </div>
  )
}));

vi.mock('../components/GameComponent', () => ({
  default: ({ onGameOver }: { onGameOver: (score: number, pixels: number) => void }) => (
    <div data-testid="game-component">
      <button onClick={() => onGameOver(1000, 100)}>Trigger Game Over</button>
    </div>
  )
}));

describe('App', () => {
  it('navigates from menu to game to game over', () => {
    render(<App />);
    
    // Initial state should be menu
    expect(screen.getByTestId('main-menu')).toBeInTheDocument();
    
    // Start game
    fireEvent.click(screen.getByText('Start Game'));
    expect(screen.getByTestId('game-component')).toBeInTheDocument();
    
    // End game
    fireEvent.click(screen.getByText('Trigger Game Over'));
    expect(screen.getByText('GAME OVER')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument(); // Score
    expect(screen.getByText('+100 Pixels')).toBeInTheDocument(); // Pixels
    
    // Play again
    fireEvent.click(screen.getByText('Play Again'));
    expect(screen.getByTestId('game-component')).toBeInTheDocument();
  });
});

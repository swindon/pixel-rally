import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MainMenu from '../components/MainMenu';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Trophy: () => <div data-testid="icon-trophy" />,
  Coins: () => <div data-testid="icon-coins" />,
  Zap: () => <div data-testid="icon-zap" />,
  ArrowLeft: () => <div data-testid="icon-arrow-left" />,
  ShoppingCart: () => <div data-testid="icon-shopping-cart" />,
  List: () => <div data-testid="icon-list" />
}));

describe('MainMenu', () => {
  it('renders correctly', () => {
    const onStart = vi.fn();
    render(<MainMenu onStart={onStart} />);
    
    expect(screen.getByText('Pixel Rally')).toBeInTheDocument();
    expect(screen.getByText('Play Arcade')).toBeInTheDocument();
    expect(screen.getByText('Garage / Shop')).toBeInTheDocument();
  });

  it('navigates to shop and back', () => {
    const onStart = vi.fn();
    render(<MainMenu onStart={onStart} />);
    
    fireEvent.click(screen.getByText('Garage / Shop'));
    expect(screen.getByText('Garage & Shop')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByText('Play Arcade')).toBeInTheDocument();
  });

  it('calls onStart when Play Arcade is clicked', () => {
    const onStart = vi.fn();
    render(<MainMenu onStart={onStart} />);
    
    fireEvent.click(screen.getByText('Play Arcade'));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});

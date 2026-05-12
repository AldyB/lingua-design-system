import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('renders with correct ARIA attributes', () => {
    render(<ProgressBar value={50} label="Study progress" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-label', 'Study progress');
  });

  it('clamps value to 0–100', () => {
    render(<ProgressBar value={150} />);
    const fill = document.querySelector('.lds-progress__fill') as HTMLElement;
    expect(fill.style.width).toBe('100%');
  });

  it('renders with custom max', () => {
    render(<ProgressBar value={3} max={8} label="Cards" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuemax', '8');
    expect(bar).toHaveAttribute('aria-valuenow', '3');
  });
});

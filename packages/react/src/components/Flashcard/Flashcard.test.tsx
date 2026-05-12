import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Flashcard } from './Flashcard';

describe('Flashcard', () => {
  it('shows front face with the word', () => {
    render(<Flashcard front="perro" back="dog" />);
    expect(screen.getByText('perro')).toBeInTheDocument();
  });

  it('has a pronounce button', () => {
    render(<Flashcard front="perro" back="dog" />);
    expect(screen.getByRole('button', { name: 'Pronounce word' })).toBeInTheDocument();
  });

  it('calls onSpeak when audio button is clicked', async () => {
    const onSpeak = vi.fn();
    render(<Flashcard front="perro" back="dog" onSpeak={onSpeak} />);
    await userEvent.click(screen.getByRole('button', { name: 'Pronounce word' }));
    expect(onSpeak).toHaveBeenCalledWith('perro');
  });

  it('renders example sentence when provided', () => {
    render(<Flashcard front="perro" back="dog" exampleFront="El perro es grande." />);
    expect(screen.getByText(/"El perro es grande."/)).toBeInTheDocument();
  });
});

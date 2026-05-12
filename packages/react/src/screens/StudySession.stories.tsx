/**
 * Composite story: Study Session screen
 * Acceptance criteria: rebuild the Study screen using only @lingua/react + @lingua/tokens.
 */
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Flashcard }    from '../components/Flashcard/Flashcard';
import { ProgressBar }  from '../components/ProgressBar/ProgressBar';
import { Button }       from '../components/Button/Button';
import { BottomNav }    from '../components/BottomNav/BottomNav';
import { Sheet }        from '../components/Sheet/Sheet';
import { StreakCounter } from '../components/StreakCounter/StreakCounter';

const CARDS = [
  { front: 'perro',   back: 'dog',    exFront: 'El perro ladra fuerte.',    exBack: 'The dog barks loudly.' },
  { front: 'gato',    back: 'cat',    exFront: 'Mi gato duerme mucho.',     exBack: 'My cat sleeps a lot.' },
  { front: 'casa',    back: 'house',  exFront: 'La casa es muy bonita.',    exBack: 'The house is very pretty.' },
  { front: 'agua',    back: 'water',  exFront: 'Quiero un vaso de agua.',   exBack: 'I want a glass of water.' },
  { front: 'libro',   back: 'book',   exFront: 'Estoy leyendo un libro.',   exBack: 'I am reading a book.' },
];

const NAV_ITEMS = [
  { label: 'Home',     icon: '🏠' },
  { label: 'Study',    icon: '📖', active: true },
  { label: 'Create',   icon: '➕' },
  { label: 'Progress', icon: '📈' },
];

const meta: Meta = { title: 'Screens/Study Session', tags: ['autodocs'] };
export default meta;

export const ActiveSession: StoryObj = {
  render: () => {
    const [index, setIndex]           = useState(0);
    const [known, setKnown]           = useState(0);
    const [unknown, setUnknown]       = useState(0);
    const [complete, setComplete]     = useState(false);
    const [showSheet, setShowSheet]   = useState(false);

    const card = CARDS[index];

    const handleCorrect = () => {
      const next = index + 1;
      setKnown(k => k + 1);
      if (next < CARDS.length) setIndex(next);
      else setComplete(true);
    };
    const handleIncorrect = () => {
      const next = index + 1;
      setUnknown(u => u + 1);
      if (next < CARDS.length) setIndex(next);
      else setComplete(true);
    };

    const reviewed = known + unknown;
    const accuracy = reviewed > 0 ? Math.round((known / reviewed) * 100) : 0;

    return (
      <div style={{
        maxWidth: 512,
        margin: '0 auto',
        minHeight: '100vh',
        background: 'var(--color-background)',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: 80,
      }}>

        {complete ? (
          /* ── Results screen ──────────────────────────────────────── */
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'color-mix(in srgb, var(--color-primary) 10%, transparent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto', fontSize: 36,
              }}>🏆</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-foreground)' }}>¡Excelente!</h2>
              <p style={{ fontSize: 48, fontWeight: 800, color: 'var(--color-primary)' }}>{accuracy}%</p>
              <p style={{ color: 'var(--color-muted-fg)', fontSize: 14 }}>{known} of {CARDS.length} correct</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button variant="outline" style={{ flex: 1 }} onClick={() => { setIndex(0); setKnown(0); setUnknown(0); setComplete(false); }}>
                  ↺ Again
                </Button>
                <Button style={{ flex: 1 }} onClick={() => alert('Navigate to Home')}>Done</Button>
              </div>
              <StreakCounter days={6} />
            </div>
          </div>
        ) : (
          /* ── Active session ──────────────────────────────────────── */
          <>
            {/* Header */}
            <header style={{ padding: '16px 16px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Button variant="ghost" size="icon" onClick={() => setShowSheet(true)} aria-label="Go back">
                  ←
                </Button>
                <span style={{ fontSize: 14, color: 'var(--color-muted-fg)' }}>{index + 1} / {CARDS.length}</span>
              </div>
              <ProgressBar value={index} max={CARDS.length} label="Session progress" />
            </header>

            {/* Card area */}
            <main style={{ flex: 1, padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', fontSize: 12, color: 'var(--color-muted-fg)' }}>
                <span>← Don't know</span>
                <button style={{ fontSize: 12, color: 'var(--color-muted-fg)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                        onClick={() => setShowSheet(true)}>End round</button>
                <span>Know it →</span>
              </div>

              {card && (
                <Flashcard
                  key={index}
                  front={card.front}
                  back={card.back}
                  exampleFront={card.exFront}
                  exampleBack={card.exBack}
                  onCorrect={handleCorrect}
                  onIncorrect={handleIncorrect}
                />
              )}

              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16 }}>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleIncorrect}
                  style={{ borderRadius: 9999, borderColor: 'var(--color-destructive)', color: 'var(--color-destructive)' }}
                >
                  ✗ Don't Know
                </Button>
                <Button
                  size="lg"
                  onClick={handleCorrect}
                  style={{ borderRadius: 9999, background: '#22c55e' }}
                >
                  ✓ Know It
                </Button>
              </div>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-muted-fg)', opacity: 0.6 }}>
                Tap card to flip · Swipe or tap to answer
              </p>
            </main>
          </>
        )}

        {/* End round sheet */}
        <Sheet open={showSheet} onClose={() => setShowSheet(false)} title="End this round?">
          <p style={{ color: 'var(--color-muted-fg)', fontSize: 14, marginBottom: 16 }}>Your progress will be saved.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '16px 12px', textAlign: 'center' }}>
              <p style={{ fontSize: 28, fontWeight: 800 }}>{known}</p>
              <p style={{ fontSize: 13, color: 'var(--color-muted-fg)', marginTop: 4 }}>Known</p>
            </div>
            <div style={{ padding: '16px 12px', textAlign: 'center', borderLeft: '1px solid var(--color-border)' }}>
              <p style={{ fontSize: 28, fontWeight: 800 }}>{unknown}</p>
              <p style={{ fontSize: 13, color: 'var(--color-muted-fg)', marginTop: 4 }}>Still learning</p>
            </div>
          </div>
          <Button variant="destructive" style={{ width: '100%', marginBottom: 8 }} onClick={() => { setComplete(true); setShowSheet(false); }}>End Round</Button>
          <Button variant="outline" style={{ width: '100%' }} onClick={() => setShowSheet(false)}>Continue Studying</Button>
        </Sheet>

        <BottomNav items={NAV_ITEMS} fixed={false} />
      </div>
    );
  },
};

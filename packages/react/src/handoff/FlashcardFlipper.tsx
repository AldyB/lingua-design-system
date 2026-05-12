import { useState, useRef } from 'react';
import { Volume2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FlashcardFlipperProps {
  spanishWord: string;
  englishTranslation: string;
  exampleSentenceEs?: string;
  exampleSentenceEn?: string;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

const SWIPE_THRESHOLD = 80;

export function FlashcardFlipper({
  spanishWord,
  englishTranslation,
  exampleSentenceEs,
  exampleSentenceEn,
  className,
  onSwipeLeft,
  onSwipeRight,
}: FlashcardFlipperProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | null>(null);

  const isDragging    = useRef(false);
  const startX        = useRef(0);
  const currentDragX  = useRef(0);
  const wrapperRef    = useRef<HTMLDivElement>(null);

  const speakSpanish = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    speechSynthesis.speak(utterance);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isAnimatingOut) return;
    isDragging.current    = true;
    startX.current        = e.clientX;
    currentDragX.current  = 0;
    wrapperRef.current?.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || isAnimatingOut) return;
    currentDragX.current = e.clientX - startX.current;
    setDragX(currentDragX.current);
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const dx = currentDragX.current;

    if (Math.abs(dx) < 8) {
      setDragX(0);
      setIsFlipped((f) => !f);
    } else if (dx >= SWIPE_THRESHOLD) {
      setSwipeDir('right');
      setIsAnimatingOut(true);
      setTimeout(() => onSwipeRight?.(), 380);
    } else if (dx <= -SWIPE_THRESHOLD) {
      setSwipeDir('left');
      setIsAnimatingOut(true);
      setTimeout(() => onSwipeLeft?.(), 380);
    } else {
      setDragX(0);
    }
  };

  const rotation        = dragX * 0.06;
  const rightOpacity    = Math.min(Math.max(dragX  / SWIPE_THRESHOLD, 0), 1);
  const leftOpacity     = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1);

  const exitTransform =
    swipeDir === 'right' ? 'translateX(160%) rotate(22deg)'  :
    swipeDir === 'left'  ? 'translateX(-160%) rotate(-22deg)' :
    `translateX(${dragX}px) rotate(${rotation}deg)`;

  const wrapperStyle: React.CSSProperties = {
    transform:  exitTransform,
    transition: isDragging.current ? 'none' : 'transform 0.38s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.38s ease',
    opacity:    isAnimatingOut ? 0 : 1,
    touchAction: 'none',
    userSelect: 'none',
    willChange: 'transform',
  };

  return (
    <div
      ref={wrapperRef}
      className={cn('w-full max-w-sm mx-auto relative', className)}
      style={wrapperStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Know It overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center rounded-2xl"
        style={{
          opacity: rightOpacity,
          background: `rgba(34, 197, 94, ${rightOpacity * 0.12})`,
          border: `2px solid rgba(34, 197, 94, ${rightOpacity * 0.7})`,
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full p-3"
               style={{ background: `rgba(34, 197, 94, ${rightOpacity * 0.9})` }}>
            <Check className="h-8 w-8 text-white" />
          </div>
          <span className="font-bold text-base tracking-widest uppercase"
                style={{ color: `rgba(74, 222, 128, ${rightOpacity})` }}>
            Know it
          </span>
        </div>
      </div>

      {/* Skip overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center rounded-2xl"
        style={{
          opacity: leftOpacity,
          background: `rgba(239, 68, 68, ${leftOpacity * 0.12})`,
          border: `2px solid rgba(239, 68, 68, ${leftOpacity * 0.7})`,
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full p-3"
               style={{ background: `rgba(239, 68, 68, ${leftOpacity * 0.9})` }}>
            <X className="h-8 w-8 text-white" />
          </div>
          <span className="font-bold text-base tracking-widest uppercase"
                style={{ color: `rgba(252, 129, 129, ${leftOpacity})` }}>
            Don't know
          </span>
        </div>
      </div>

      {/* 3-D card */}
      <div className="perspective-1000 w-full">
        <div
          className={cn(
            'relative w-full h-64 transition-transform duration-500 preserve-3d cursor-grab active:cursor-grabbing',
            isFlipped && 'rotate-y-180'
          )}
        >
          {/* Front — Spanish */}
          <div className="absolute inset-0 backface-hidden">
            <div
              className="h-full rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden bg-card border border-border"
              style={{ boxShadow: '0 8px 32px -4px hsl(0 0% 0% / 0.25)' }}
            >
              {/* Subtle corner glow */}
              <div className="absolute top-0 right-0 h-24 w-24 rounded-full opacity-15 pointer-events-none"
                   style={{ background: 'radial-gradient(circle, hsl(256 80% 65%), transparent 70%)', transform: 'translate(30%, -30%)' }} />

              <Button
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 h-8 w-8 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                onClick={(e) => speakSpanish(spanishWord, e)}
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Volume2 className="h-4 w-4" />
              </Button>

              <span className="text-3xl font-serif font-bold text-foreground text-center">
                {spanishWord}
              </span>
              {exampleSentenceEs && (
                <p className="mt-3 text-sm text-muted-foreground text-center italic leading-relaxed">
                  "{exampleSentenceEs}"
                </p>
              )}
              <span className="mt-5 text-xs text-muted-foreground/50 font-medium">
                Tap to reveal
              </span>
            </div>
          </div>

          {/* Back — English */}
          <div className="absolute inset-0 backface-hidden rotate-y-180">
            <div
              className="h-full rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, hsl(258 72% 42%) 0%, hsl(240 68% 32%) 100%)',
                boxShadow: '0 8px 32px -4px hsl(0 0% 0% / 0.5)',
              }}
            >
              {/* Corner glow */}
              <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full opacity-30 pointer-events-none"
                   style={{ background: 'radial-gradient(circle, hsl(216 90% 60%), transparent 70%)', transform: 'translate(-30%, 30%)' }} />

              <span className="text-3xl font-serif font-bold text-white text-center">
                {englishTranslation}
              </span>
              {exampleSentenceEn && (
                <p className="mt-3 text-sm text-white/60 text-center italic leading-relaxed">
                  "{exampleSentenceEn}"
                </p>
              )}
              <span className="mt-5 text-xs text-white/30 font-medium">
                Swipe to answer
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

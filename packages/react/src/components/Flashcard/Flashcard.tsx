import { useState, useRef } from 'react';
import { cn } from '../../lib/utils';

const SWIPE_THRESHOLD = 80;

export interface FlashcardProps {
  front: string;
  back: string;
  exampleFront?: string;
  exampleBack?: string;
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onSpeak?: (text: string) => void;
  className?: string;
}

export function Flashcard({
  front, back, exampleFront, exampleBack, onCorrect, onIncorrect, onSpeak, className,
}: FlashcardProps) {
  const [isFlipped, setIsFlipped]           = useState(false);
  const [dragX, setDragX]                   = useState(0);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [swipeDir, setSwipeDir]             = useState<'left' | 'right' | null>(null);

  const isDragging    = useRef(false);
  const startX        = useRef(0);
  const currentDragX  = useRef(0);
  const wrapperRef    = useRef<HTMLDivElement>(null);

  const speakFront = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSpeak) {
      onSpeak(front);
    } else if (typeof speechSynthesis !== 'undefined') {
      const utt = new SpeechSynthesisUtterance(front);
      utt.lang = 'es-ES';
      speechSynthesis.speak(utt);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isAnimatingOut) return;
    isDragging.current   = true;
    startX.current       = e.clientX;
    currentDragX.current = 0;
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
      setIsFlipped(f => !f);
    } else if (dx >= SWIPE_THRESHOLD) {
      setSwipeDir('right');
      setIsAnimatingOut(true);
      setTimeout(() => onCorrect?.(), 380);
    } else if (dx <= -SWIPE_THRESHOLD) {
      setSwipeDir('left');
      setIsAnimatingOut(true);
      setTimeout(() => onIncorrect?.(), 380);
    } else {
      setDragX(0);
    }
  };

  const rotation     = dragX * 0.06;
  const rightOpacity = Math.min(Math.max(dragX  / SWIPE_THRESHOLD, 0), 1);
  const leftOpacity  = Math.min(Math.max(-dragX / SWIPE_THRESHOLD, 0), 1);

  const exitTransform =
    swipeDir === 'right' ? 'translateX(160%) rotate(22deg)'   :
    swipeDir === 'left'  ? 'translateX(-160%) rotate(-22deg)' :
    `translateX(${dragX}px) rotate(${rotation}deg)`;

  const wrapperStyle: React.CSSProperties = {
    transform:  exitTransform,
    transition: isDragging.current ? 'none' : 'transform 0.38s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.38s ease',
    opacity:    isAnimatingOut ? 0 : 1,
    touchAction: 'none',
  };

  return (
    <div
      ref={wrapperRef}
      className={cn('lds-flashcard', className)}
      style={wrapperStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Know-it overlay */}
      <div
        className="lds-flashcard__overlay lds-flashcard__overlay--know"
        style={{ opacity: rightOpacity }}
        aria-hidden="true"
      >
        <div className="lds-flashcard__overlay-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <span className="lds-flashcard__overlay-label">Know it</span>
      </div>

      {/* Skip overlay */}
      <div
        className="lds-flashcard__overlay lds-flashcard__overlay--skip"
        style={{ opacity: leftOpacity }}
        aria-hidden="true"
      >
        <div className="lds-flashcard__overlay-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </div>
        <span className="lds-flashcard__overlay-label">Don't know</span>
      </div>

      {/* 3-D card */}
      <div className={cn('lds-flashcard__inner', isFlipped && 'lds-flashcard__inner--flipped')}>
        {/* Front */}
        <div className="lds-flashcard__face lds-flashcard__face--front" aria-label={`Front: ${front}`}>
          <div className="lds-flashcard__glow" aria-hidden="true" />
          <button
            className="lds-flashcard__audio"
            onClick={speakFront}
            onPointerDown={e => e.stopPropagation()}
            aria-label="Pronounce word"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
          </button>
          <p className="lds-flashcard__word">{front}</p>
          {exampleFront && <p className="lds-flashcard__example">"{exampleFront}"</p>}
          <span className="lds-flashcard__hint">Tap to reveal</span>
        </div>

        {/* Back */}
        <div className="lds-flashcard__face lds-flashcard__face--back" aria-label={`Back: ${back}`}>
          <div className="lds-flashcard__glow" aria-hidden="true" />
          <p className="lds-flashcard__word">{back}</p>
          {exampleBack && <p className="lds-flashcard__example">"{exampleBack}"</p>}
          <span className="lds-flashcard__hint">Swipe to answer</span>
        </div>
      </div>
    </div>
  );
}

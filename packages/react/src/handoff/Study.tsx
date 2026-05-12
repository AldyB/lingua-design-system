import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, RotateCcw, Trophy, ArrowLeft, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { FlashcardFlipper } from '@/components/FlashcardFlipper';
import { BottomNav } from '@/components/BottomNav';
import { useFlashcards, Flashcard } from '@/hooks/useFlashcards';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

export default function Study() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { flashcards, getDueCards, updateCardReview, loading } = useFlashcards();
  const { updateStreak } = useProfile();
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [known, setKnown] = useState(0);
  const [unknown, setUnknown] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isEarlyEnd, setIsEarlyEnd] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showEndSheet, setShowEndSheet] = useState(false);

  useEffect(() => {
    if (!loading && flashcards.length > 0) {
      const due = getDueCards();
      const shuffled = [...due].sort(() => Math.random() - 0.5).slice(0, 20);
      setStudyCards(shuffled.length > 0 ? shuffled : flashcards.slice(0, 20));
    }
  }, [loading, flashcards]);

  const currentCard = studyCards[currentIndex];
  const progress = studyCards.length > 0 ? (reviewed / studyCards.length) * 100 : 0;

  const handleAnswer = async (wasCorrect: boolean) => {
    if (!currentCard) return;

    await updateCardReview(currentCard.id, wasCorrect);
    const newReviewed = reviewed + 1;
    setReviewed(newReviewed);

    if (wasCorrect) {
      const newKnown = known + 1;
      setKnown(newKnown);

      if (currentIndex < studyCards.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        await updateStreak();
        setIsComplete(true);
        toast({
          title: '¡Muy bien!',
          description: `You knew ${newKnown} of ${studyCards.length} cards`,
        });
      }
    } else {
      const newUnknown = unknown + 1;
      setUnknown(newUnknown);

      if (currentIndex < studyCards.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else {
        await updateStreak();
        setIsComplete(true);
      }
    }
  };

  const handleEndRound = async () => {
    await updateStreak();
    setShowEndSheet(false);
    setIsEarlyEnd(true);
    setIsComplete(true);
  };

  const restartSession = () => {
    const shuffled = [...studyCards].sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setCurrentIndex(0);
    setKnown(0);
    setUnknown(0);
    setReviewed(0);
    setIsComplete(false);
    setIsEarlyEnd(false);
    setHasStarted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="px-4 py-6">
          <div className="max-w-lg mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="px-4 flex flex-col items-center justify-center text-center mt-20">
          <Card className="p-8 max-w-sm">
            <CardContent className="space-y-4">
              <h2 className="text-xl font-bold">No cards yet!</h2>
              <p className="text-muted-foreground">
                Create some flashcards first to start studying.
              </p>
              <Button onClick={() => navigate('/create')}>
                Create Your First Card
              </Button>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  // ── Pre-session screen ──────────────────────────────────────────────────────
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="px-4 py-6">
          <div className="max-w-lg mx-auto">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="px-4 flex flex-col items-center justify-center text-center mt-16">
          <Card className="p-8 max-w-sm w-full">
            <CardContent className="space-y-6">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Trophy className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Ready to Study?</h2>
              <p className="text-muted-foreground">
                You have {studyCards.length} cards to review today.
              </p>

              {/* How-to-play */}
              <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 text-sm text-left">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-card border border-border flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-muted-foreground">1</span>
                  </div>
                  <span className="text-muted-foreground">Tap the card to reveal the English translation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shrink-0">
                    <Check className="h-3.5 w-3.5 text-green-600" />
                  </div>
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">Swipe right</span> or tap ✓ — you know it, next card
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center shrink-0">
                    <X className="h-3.5 w-3.5 text-destructive" />
                  </div>
                  <span className="text-muted-foreground">
                    <span className="font-medium text-foreground">Swipe left</span> — mark as still learning, move on
                  </span>
                </div>
              </div>

              <Button size="lg" onClick={() => setHasStarted(true)} className="w-full">
                Start Session
              </Button>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  // ── Results screen ──────────────────────────────────────────────────────────
  if (isComplete) {
    const accuracy = reviewed > 0 ? Math.round((known / reviewed) * 100) : 0;

    return (
      <div className="min-h-screen bg-background pb-20">
        <main className="px-4 flex flex-col items-center justify-center text-center mt-20">
          <Card className="p-8 max-w-sm w-full">
            <CardContent className="space-y-6">
              <div className={`h-20 w-20 rounded-full flex items-center justify-center mx-auto ${isEarlyEnd ? 'bg-muted' : 'bg-primary/10'}`}>
                {isEarlyEnd
                  ? <BookOpen className="h-10 w-10 text-muted-foreground" />
                  : <Trophy className="h-10 w-10 text-primary" />
                }
              </div>
              <h2 className="text-2xl font-bold">
                {isEarlyEnd ? 'Round ended' : '¡Excelente!'}
              </h2>

              {/* Known / Learning two-column stat */}
              <div className="grid grid-cols-2 divide-x divide-border border border-border rounded-xl overflow-hidden">
                <div className="p-4 text-center">
                  <p className="text-3xl font-bold text-foreground">{known}</p>
                  <p className="text-sm text-muted-foreground mt-1">Known</p>
                </div>
                <div className="p-4 text-center">
                  <p className="text-3xl font-bold text-foreground">{unknown}</p>
                  <p className="text-sm text-muted-foreground mt-1">Still learning</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                {reviewed} of {studyCards.length} reviewed · {accuracy}% accuracy
              </p>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Done
                </Button>
                <Button onClick={restartSession} className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
        <BottomNav />
      </div>
    );
  }

  // ── Active study session ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="px-4 py-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {currentIndex + 1} / {studyCards.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </header>

      {/* Card area */}
      <main className="px-4 py-4 max-w-lg mx-auto">
        {/* Directional swipe hints + End round link */}
        <div className="flex items-center justify-between px-1 mb-4">
          <div className="flex items-center gap-1 text-destructive/50">
            <ChevronLeft className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Don't know</span>
          </div>
          <button
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
            onClick={() => setShowEndSheet(true)}
          >
            End round
          </button>
          <div className="flex items-center gap-1 text-green-500/60">
            <span className="text-xs font-medium">Know it</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Flashcard */}
        {currentCard && (
          <FlashcardFlipper
            key={currentIndex}
            spanishWord={currentCard.spanish_word}
            englishTranslation={currentCard.english_translation}
            exampleSentenceEs={currentCard.example_sentence_es || undefined}
            exampleSentenceEn={currentCard.example_sentence_en || undefined}
            onSwipeLeft={() => handleAnswer(false)}
            onSwipeRight={() => handleAnswer(true)}
          />
        )}

        {/* Answer buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <Button
            size="lg"
            variant="outline"
            className="h-13 px-5 rounded-full border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground gap-2"
            onClick={() => handleAnswer(false)}
          >
            <X className="h-4 w-4" />
            <span className="text-sm font-medium">Don't Know</span>
          </Button>
          <Button
            size="lg"
            className="h-13 px-5 rounded-full bg-green-500 hover:bg-green-600 text-white gap-2"
            onClick={() => handleAnswer(true)}
          >
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Know It</span>
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-4">
          Tap card to flip · Swipe or tap to answer
        </p>
      </main>

      {/* End round confirmation sheet */}
      <Sheet open={showEndSheet} onOpenChange={setShowEndSheet}>
        <SheetContent side="bottom" className="rounded-t-2xl pb-10">
          <SheetHeader className="text-left mb-6">
            <SheetTitle>End this round?</SheetTitle>
            <p className="text-sm text-muted-foreground">Your progress will be saved.</p>
          </SheetHeader>

          {/* Known / Still learning summary */}
          <div className="grid grid-cols-2 divide-x divide-border border border-border rounded-xl overflow-hidden mb-6">
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{known}</p>
              <p className="text-sm text-muted-foreground mt-1">Known</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-3xl font-bold text-foreground">{unknown}</p>
              <p className="text-sm text-muted-foreground mt-1">Still learning</p>
            </div>
          </div>

          <Button
            variant="destructive"
            className="w-full mb-3"
            onClick={handleEndRound}
          >
            End Round
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowEndSheet(false)}
          >
            Continue Studying
          </Button>
        </SheetContent>
      </Sheet>

      <BottomNav />
    </div>
  );
}

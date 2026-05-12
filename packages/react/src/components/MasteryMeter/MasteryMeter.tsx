import { cn } from '../../lib/utils';

export interface MasteryMeterProps {
  mastered: number;
  learning: number;
  newCards: number;
  className?: string;
}

export function MasteryMeter({ mastered, learning, newCards, className }: MasteryMeterProps) {
  const total = mastered + learning + newCards;
  const pct   = total > 0 ? Math.round((mastered / total) * 100) : 0;

  return (
    <div className={cn('lds-mastery', className)} aria-label={`Mastery: ${pct}%`}>
      <div className="lds-mastery__bar-track">
        <div className="lds-mastery__bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="lds-mastery__slots">
        <div className="lds-mastery__slot lds-mastery__slot--mastered">
          <p className="lds-mastery__slot-count">{mastered}</p>
          <p className="lds-mastery__slot-label">Mastered</p>
        </div>
        <div className="lds-mastery__slot lds-mastery__slot--learning">
          <p className="lds-mastery__slot-count">{learning}</p>
          <p className="lds-mastery__slot-label">Learning</p>
        </div>
        <div className="lds-mastery__slot lds-mastery__slot--new">
          <p className="lds-mastery__slot-count">{newCards}</p>
          <p className="lds-mastery__slot-label">New</p>
        </div>
      </div>
    </div>
  );
}

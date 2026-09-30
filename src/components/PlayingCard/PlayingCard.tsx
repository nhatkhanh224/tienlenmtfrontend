import React from 'react';
import { SpadeIcon, ClubIcon, DiamondIcon, HeartIcon, LogoIcon, CrownIcon, ShieldIcon } from './CardIcons';
import './PlayingCard.css';

export type Suit = 'spades' | 'clubs' | 'diamonds' | 'hearts';
export type Rank = '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2';
export type CardState = 'normal' | 'selected' | 'disabled' | 'played';
export type ComboType = 'none' | 'straight' | 'pair' | 'threeOfAKind' | 'fourOfAKind' | 'dragon';

interface PlayingCardProps {
  rank: Rank;
  suit: Suit;
  state?: CardState;
  comboType?: ComboType;
  flipped?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const SuitIconMap: Record<Suit, React.FC<any>> = {
  spades: SpadeIcon,
  clubs: ClubIcon,
  diamonds: DiamondIcon,
  hearts: HeartIcon,
};

const SuitColorMap: Record<Suit, string> = {
  spades: 'var(--color-spades)',
  clubs: 'var(--color-clubs)',
  diamonds: 'var(--color-diamonds)',
  hearts: 'var(--color-hearts)',
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  rank,
  suit,
  state = 'normal',
  comboType = 'none',
  flipped = false,
  onClick,
  className = '',
  style,
}) => {
  const Icon = SuitIconMap[suit];
  const color = SuitColorMap[suit];
  const isRed = suit === 'diamonds' || suit === 'hearts';
  const isHeo = rank === '2';

  // Base classes
  const classes = [
    'playing-card',
    `state-${state}`,
    comboType !== 'none' ? `combo-${comboType}` : '',
    isHeo ? 'card-heo' : '',
    isRed ? 'card-red' : 'card-black',
    flipped ? 'card-flipped' : '',
    className,
  ].filter(Boolean).join(' ');

  if (flipped) {
    return (
      <div className={classes} style={style} onClick={onClick}>
        <div className="card-back">
          <div className="card-back-pattern">
            <LogoIcon size={80} className="card-back-logo" />
          </div>
        </div>
      </div>
    );
  }

  const renderCenter = () => {
    if (rank === 'A') {
      return (
        <div className="center-a">
          <Icon size={120} />
        </div>
      );
    }
    
    if (['J', 'Q', 'K'].includes(rank)) {
      return (
        <div className="center-face">
          {rank === 'J' && <ShieldIcon size={100} className="face-icon" />}
          {rank === 'Q' && <CrownIcon size={100} className="face-icon" />}
          {rank === 'K' && <CrownIcon size={100} className="face-icon king-icon" />}
          <div className="face-rank-bg">{rank}</div>
        </div>
      );
    }

    // Number cards (3-10, and 2)
    return (
      <div className="center-number">
        <span className="center-rank-text">{rank}</span>
        <Icon size={80} className="center-suit-icon" />
      </div>
    );
  };

  return (
    <div className={classes} style={{ color, ...style }} onClick={onClick}>
      <div className="card-front">
        {/* Top Left Corner */}
        <div className="card-corner top-left">
          <span className="corner-rank">{rank}</span>
          <Icon size={20} />
        </div>
        
        {/* Center Content */}
        <div className="card-center">
          {renderCenter()}
        </div>

        {/* Bottom Right Corner */}
        <div className="card-corner bottom-right">
          <span className="corner-rank">{rank}</span>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
};

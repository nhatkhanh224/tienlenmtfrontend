import React from 'react';
import { PlayingCard } from './PlayingCard/PlayingCard';
import type { Rank, Suit } from './PlayingCard/PlayingCard';

interface CardUIProps {
  value: number; // 3-15
  suit: number;  // 0: Bích, 1: Chuồn, 2: Rô, 3: Cơ
  isHidden?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

const mapValueToRank = (value: number): Rank => {
  if (value >= 3 && value <= 10) return value.toString() as Rank;
  if (value === 11) return 'J';
  if (value === 12) return 'Q';
  if (value === 13) return 'K';
  if (value === 14) return 'A';
  if (value === 15) return '2';
  return '3'; // fallback
};

const mapSuitToSuitName = (suit: number): Suit => {
  const suits: Suit[] = ['spades', 'clubs', 'diamonds', 'hearts'];
  return suits[suit] || 'spades';
};

const CardUI: React.FC<CardUIProps> = ({ value, suit, isHidden, isSelected, isDisabled, onClick, style }) => {
  const rank = mapValueToRank(value);
  const suitName = mapSuitToSuitName(suit);

  let cardState: any = 'normal';
  if (isSelected) cardState = 'selected';
  else if (isDisabled) cardState = 'disabled';

  return (
    <PlayingCard
      rank={rank}
      suit={suitName}
      state={cardState}
      flipped={isHidden}
      onClick={isDisabled ? undefined : onClick}
      style={style}
    />
  );
};

export default CardUI;

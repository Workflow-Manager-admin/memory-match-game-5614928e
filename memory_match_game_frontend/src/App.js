import React, { useState, useEffect } from 'react';
import './App.css';

// --- Color constants from provided palette ---
const COLORS = {
  accent: '#F87E7B',
  primary: '#4F8A8B',
  secondary: '#FBD46D',
};

// Utility to generate a shuffled array of card objects (pairs)
function generateShuffledCards(numPairs = 8) {
  // For a playful feel, pick icons or emojis as card values
  const possibleValues = ['🐧', '🐳', '🦄', '🍕', '⭐️', '🌵', '🌈', '🚀', '💎', '🎨', '🎈', '🍉', '🍩', '🐞', '🎲', '🥑'];
  const cardValues = possibleValues.slice(0, numPairs);
  const allCards = [...cardValues, ...cardValues].map((value, idx) => ({
    id: idx,
    value,
    isFlipped: false,
    isMatched: false,
  }));

  // Simple Fisher-Yates shuffle
  for (let i = allCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
  }

  return allCards;
}

// Card component
function Card({ card, onClick, disabled }) {
  return (
    <button
      className="mmg-card"
      style={{
        borderColor: card.isMatched
          ? COLORS.primary
          : card.isFlipped
          ? COLORS.accent
          : COLORS.secondary,
        background: card.isFlipped || card.isMatched
          ? '#fff'
          : COLORS.secondary,
        color: card.isFlipped || card.isMatched
          ? COLORS.primary
          : COLORS.secondary,
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.15s, border 0.15s, color 0.15s',
      }}
      onClick={onClick}
      disabled={disabled || card.isFlipped || card.isMatched}
      aria-label={card.isFlipped || card.isMatched ? card.value : 'Hidden card'}
    >
      <span className="mmg-card-value">
        {card.isFlipped || card.isMatched ? card.value : ''}
      </span>
    </button>
  );
}

// Victory (End) Screen
function VictoryScreen({ moves, onRestart }) {
  return (
    <div className="mmg-victory">
      <div className="mmg-victory-inner">
        <h2>🎉 You Won!</h2>
        <p>
          Moves: <b>{moves}</b>
        </p>
        <button className="mmg-btn" style={{ background: COLORS.primary }} onClick={onRestart}>
          Play Again
        </button>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  const NUM_PAIRS = 8; // total 16 cards
  // State: cards, flipped (indices), moves, matched count, victory
  const [cards, setCards] = useState(() => generateShuffledCards(NUM_PAIRS));
  const [flippedIndices, setFlippedIndices] = useState([]); // [idx1, idx2]
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [victory, setVictory] = useState(false);

  // Resets the game state
  // PUBLIC_INTERFACE
  function startNewGame() {
    setCards(generateShuffledCards(NUM_PAIRS));
    setMoves(0);
    setMatchedCount(0);
    setFlippedIndices([]);
    setVictory(false);
  }

  // Card click logic
  function handleCardClick(idx) {
    if (flippedIndices.length === 2 || victory) return;

    const newFlipped = [...flippedIndices, idx];
    const updatedCards = cards.map((card, cidx) =>
      cidx === idx ? { ...card, isFlipped: true } : card
    );
    setCards(updatedCards);
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
    }
  }

  // Check for match when two cards are flipped
  useEffect(() => {
    if (flippedIndices.length === 2) {
      const [idx1, idx2] = flippedIndices;
      const v1 = cards[idx1].value;
      const v2 = cards[idx2].value;
      if (cards[idx1].isMatched || cards[idx2].isMatched) return;

      if (v1 === v2) {
        // Matched!
        const updated = cards.map((card, i) =>
          i === idx1 || i === idx2
            ? { ...card, isMatched: true }
            : card
        );
        setTimeout(() => {
          setCards(updated);
          setMatchedCount(count => count + 1);
          setFlippedIndices([]);
        }, 500);
      } else {
        // Not matched
        setTimeout(() => {
          setCards(cards =>
            cards.map((card, i) =>
              i === idx1 || i === idx2
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedIndices([]);
        }, 900);
      }
    }
  }, [flippedIndices, cards]);

  // Win condition
  useEffect(() => {
    if (matchedCount === NUM_PAIRS) {
      setVictory(true);
    }
  }, [matchedCount]);

  // Styling overrides for palette (set CSS vars for palette)
  useEffect(() => {
    document.documentElement.style.setProperty('--mmg-accent', COLORS.accent);
    document.documentElement.style.setProperty('--mmg-primary', COLORS.primary);
    document.documentElement.style.setProperty('--mmg-secondary', COLORS.secondary);
  }, []);

  // Layout: header, board, footer
  return (
    <div className="mmg-app">
      <header className="mmg-header">
        <h1>
          <span style={{ color: COLORS.primary }}>Memory</span>{' '}
          <span style={{ color: COLORS.accent }}>Match</span>
        </h1>
      </header>

      <main>
        <section className="mmg-board-container">
          <div
            className="mmg-board"
            style={{
              gridTemplateColumns: `repeat(4, minmax(65px, 1fr))`,
              background: '#fff',
              borderRadius: '18px',
              border: `2px solid ${COLORS.secondary}`,
              boxShadow: '0 6px 28px 0 rgba(80,163,204,0.09)',
            }}
          >
            {cards.map((card, idx) => (
              <Card
                key={card.id}
                card={card}
                onClick={() => handleCardClick(idx)}
                disabled={flippedIndices.length === 2 || card.isMatched || card.isFlipped || victory}
              />
            ))}
          </div>
        </section>
        {victory && <VictoryScreen moves={moves} onRestart={startNewGame} />}
      </main>

      <footer className="mmg-footer">
        <button
          className="mmg-btn"
          style={{ background: COLORS.accent }}
          onClick={startNewGame}
        >
          Reset
        </button>
        <span className="mmg-moves">
          Moves: <b>{moves}</b>
        </span>
      </footer>
    </div>
  );
}

export default App;

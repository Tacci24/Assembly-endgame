import React, { useState, useEffect } from "react";
import clsx from "clsx";
import "./App.css";
import { languages } from "./language";
import { getFarewellText, getRandomWord } from "./farewell";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

function App() {
  //state
  const [currentWord, setCurrentWord] = useState(() => getRandomWord());
  const [guessedLetter, setGuessedLetter] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const { width, height } = useWindowSize();

  //derived state
  const numOfGuessesLeft = languages.length - 1;
  const wrongGuessCount = guessedLetter.filter(
    (letter) => !currentWord.includes(letter)
  ).length;
  const isGameWon = currentWord
    .split("")
    .every((letter) => guessedLetter.includes(letter));
  const isGameLost = wrongGuessCount >= numOfGuessesLeft || timeLeft <= 0;
  const isGameOver = isGameWon || isGameLost;
  const lastGuessedLetter = guessedLetter[guessedLetter.length - 1];
  const isLastGuessIncorrect =
    lastGuessedLetter && !currentWord.includes(lastGuessedLetter);

  //static values
  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  //timer logic
  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
    };
  }, []);

  useEffect(() => {
    if (isGameOver || !isWindowFocused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, isWindowFocused]);

  //functions
  function addGuessedLetter(letter) {
    setGuessedLetter((prevLetters) =>
      prevLetters.includes(letter) ? prevLetters : [...prevLetters, letter]
    );
  }

  function StartNewGame() {
    setCurrentWord(() => getRandomWord());
    setGuessedLetter([]);
    setTimeLeft(60);
  }

  //render logic
  const languageElements = languages.map((lang, index) => {
    const isLanguageLost = index < wrongGuessCount;
    const styles = {
      backgroundColor: lang.backgroundColor,
      color: lang.color,
    };
    const className = clsx("chip", isLanguageLost && "lost");
    return (
      <span key={lang.name} className={className} style={styles}>
        {lang.name}
      </span>
    );
  });

  const letterElements = currentWord.split("").map((letter, index) => {
    const shouldRevealLetter = isGameLost || guessedLetter.includes(letter);
    const letterClassName = clsx(
      isGameLost && !guessedLetter.includes(letter) && "missed-letter"
    );
    return (
      <span key={index} className={letterClassName}>
        {shouldRevealLetter ? letter.toUpperCase() : " "}
      </span>
    );
  });

  const keyboard = alphabet.split("").map((letter) => {
    const isGuessed = guessedLetter.includes(letter);
    const isCorrect = isGuessed && currentWord.includes(letter);
    const isWrong = isGuessed && !currentWord.includes(letter);
    const className = clsx({
      correct: isCorrect,
      wrong: isWrong,
    });

    return (
      <button
        key={letter}
        className={className}
        onClick={() => addGuessedLetter(letter)}
        disabled={isGameOver || isGuessed}
        aria-disabled={isGuessed}
        aria-label={`Letter ${letter}`}
      >
        {letter.toUpperCase()}
      </button>
    );
  });

  const gameStatusClass = clsx("game-status", {
    won: isGameWon,
    lost: isGameLost,
    farewell: !isGameOver && isLastGuessIncorrect,
  });

  function renderGameStatus() {
    if (!isGameOver && isLastGuessIncorrect) {
      return (
        <p className="farewell-message">
          {getFarewellText(languages[wrongGuessCount - 1].name)}
        </p>
      );
    }

    if (isGameWon) {
      return (
        <>
          <h2>You win</h2>
          <p>Well done! 🎉</p>
        </>
      );
    }

    if (isGameLost) {
      return (
        <>
          <h2>Game Over 💀</h2>
          <p>
            {timeLeft <= 0
              ? "Time’s up! Assembly has taken over. Try again!"
              : "Assembly has taken over. Try again!"}
          </p>
        </>
      );
    }

    return null;
  }

  return (
    <main>
      {isGameWon && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={1000}
        />
      )}
      <header>
        <h1>Assembly Endgame</h1>
        <p>
          Guess the word within 8 attempts to keep the programming world safe
          from Assembly
        </p>
        <p className="timer">Time Left: {timeLeft} seconds</p>
        {!isWindowFocused && !isGameOver && (
          <p className="paused-status">Timer paused — tab not active</p>
        )}
      </header>

      <section aria-live="polite" role="status" className={gameStatusClass}>
        {renderGameStatus()}
      </section>

      <section className="language-chips">{languageElements}</section>

      <section className="letters">{letterElements}</section>

      {/* Accessibility section for screen readers */}
      <section className="sr-only" aria-live="polite" role="status">
        <p>
          {currentWord.includes(lastGuessedLetter)
            ? `Correct! The letter ${lastGuessedLetter} is in the word.`
            : `Sorry, the letter ${lastGuessedLetter} is not the word.`}
          You have {numOfGuessesLeft} attempts left.
        </p>
        <p>
          Current word:
          {currentWord
            .split("")
            .map((letter) =>
              guessedLetter.includes(letter) ? letter + "." : "blank"
            )
            .join(" ")}
        </p>
      </section>

      <section className="keyboard">{keyboard}</section>

      {isGameOver && (
        <button className="new-game" onClick={StartNewGame}>
          New Game
        </button>
      )}
    </main>
  );
}

export default App;

import React, { useState, useMemo } from "react";
import { quizQuestions, type QuizQuestion, type QuizOptionId } from "./quizData";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleQuestionOptions(q: QuizQuestion): QuizQuestion {
  const correctOption = q.options.find((o) => o.id === q.correctAnswer);
  if (!correctOption) return q;
  const correctText = correctOption.text;
  const shuffledTexts = shuffleArray(q.options.map((o) => o.text));
  const newOptions: { id: QuizOptionId; text: string }[] = shuffledTexts.map((text, idx) => ({
    id: (["A", "B", "C", "D"] as QuizOptionId[])[idx],
    text,
  }));
  const newCorrectAnswer = newOptions.find((o) => o.text === correctText)!.id;
  return {
    ...q,
    options: newOptions,
    correctAnswer: newCorrectAnswer,
  };
}

function prepareQuizSession(): QuizQuestion[] {
  return shuffleArray(quizQuestions).map(shuffleQuestionOptions);
}

type QuizViewProps = {
  onBackToSimulator: () => void;
};

type AnswerRecord = {
  questionId: string;
  selectedOption: QuizOptionId;
  isCorrect: boolean;
};

export const QuizView: React.FC<QuizViewProps> = ({ onBackToSimulator }) => {
  // Przetasowana lista pytań na bieżącą sesję quizu z losową kolejnością wariantów ABCD
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>(prepareQuizSession);

  // Indeks aktualnego pytania
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Zaznaczona odpowiedź na aktualne pytanie (null = jeszcze brak odpowiedzi)
  const [selectedAnswer, setSelectedAnswer] = useState<QuizOptionId | null>(null);

  // Historia odpowiedzi
  const [history, setHistory] = useState<AnswerRecord[]>([]);

  // Czy quiz został ukończony (wyczerpana pula pytań)
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const totalQuestions = shuffledQuestions.length;
  const currentQuestion = shuffledQuestions[currentIndex];

  // Punkty
  const correctAnswersCount = useMemo(
    () => history.filter((h) => h.isCorrect).length,
    [history]
  );

  const percentage = useMemo(() => {
    if (history.length === 0) return 0;
    return Math.round((correctAnswersCount / history.length) * 100);
  }, [correctAnswersCount, history.length]);

  // Obsługa wyboru odpowiedzi przez ucznia
  const handleSelectOption = (optionId: QuizOptionId) => {
    if (selectedAnswer !== null || isFinished) return; // zablokuj zmianę po pierwszym wyborze

    setSelectedAnswer(optionId);
    const isCorrect = optionId === currentQuestion.correctAnswer;

    setHistory((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        selectedOption: optionId,
        isCorrect,
      },
    ]);
  };

  // Przejście do następnego pytania z puli
  const handleNextQuestion = () => {
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  // Restart quizu (nowe losowe przetasowanie pytań i wariantów)
  const handleRestartQuiz = () => {
    setShuffledQuestions(prepareQuizSession());
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setHistory([]);
    setIsFinished(false);
  };

  // Statystyki kategorii na koniec quizu
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; correct: number }> = {};
    history.forEach((record) => {
      const q = quizQuestions.find((item) => item.id === record.questionId);
      if (q) {
        if (!stats[q.category]) {
          stats[q.category] = { total: 0, correct: 0 };
        }
        stats[q.category].total += 1;
        if (record.isCorrect) {
          stats[q.category].correct += 1;
        }
      }
    });
    return stats;
  }, [history]);

  return (
    <div className="quiz-container">
      {/* Pasek nawigacyjny modułu quizu */}
      <div className="quiz-topbar">
        <div className="quiz-topbar-left">
          <button
            type="button"
            className="quiz-back-btn"
            onClick={onBackToSimulator}
            title="Powrót do symulatora 3D"
          >
            ← Wróć do Symulatora
          </button>
          <div className="quiz-title-badge">
            <span className="quiz-badge-icon">🎓</span>
            <div>
              <strong>QUIZ EGZAMINACYJNY ELM.08</strong>
              <small>Eksploatacja i programowanie systemów robotyki</small>
            </div>
          </div>
        </div>

        <div className="quiz-topbar-right">
          <div className="quiz-stat-pill">
            <span className="stat-label">Pytanie:</span>
            <span className="stat-val">
              {currentIndex + 1} / {totalQuestions}
            </span>
          </div>
          <div className="quiz-stat-pill highlight">
            <span className="stat-label">Wynik:</span>
            <span className="stat-val">
              {correctAnswersCount} / {history.length} ({percentage}%)
            </span>
          </div>
        </div>
      </div>

      {/* Pasek postępu */}
      <div className="quiz-progress-track">
        <div
          className="quiz-progress-fill"
          style={{
            width: `${((currentIndex + (selectedAnswer ? 1 : 0)) / totalQuestions) * 100}%`,
          }}
        />
      </div>

      <div className="quiz-main-content">
        {!isFinished && currentQuestion ? (
          <div className="quiz-card">
            {/* Nagłówek pytania */}
            <div className="quiz-card-header">
              <span className="quiz-category-tag">{currentQuestion.category}</span>
              <span className="quiz-index-badge">
                Pytanie {currentIndex + 1} z {totalQuestions}
              </span>
            </div>

            {/* Treść pytania */}
            <h2 className="quiz-question-text">{currentQuestion.question}</h2>

            {/* Lista odpowiedzi ABCD */}
            <div className="quiz-options-list">
              {currentQuestion.options.map((opt) => {
                const isSelected = selectedAnswer === opt.id;
                const isCorrect = opt.id === currentQuestion.correctAnswer;
                const hasAnswered = selectedAnswer !== null;

                let optClass = "quiz-option-btn";
                if (hasAnswered) {
                  if (isCorrect) {
                    optClass += " correct";
                  } else if (isSelected) {
                    optClass += " incorrect";
                  } else {
                    optClass += " muted";
                  }
                }

                return (
                  <button
                    key={opt.id}
                    type="button"
                    className={optClass}
                    onClick={() => handleSelectOption(opt.id)}
                    disabled={hasAnswered}
                  >
                    <span className="opt-letter">{opt.id}</span>
                    <span className="opt-text">{opt.text}</span>
                    {hasAnswered && isCorrect && (
                      <span className="opt-status-icon correct">✓ Poprawna</span>
                    )}
                    {hasAnswered && isSelected && !isCorrect && (
                      <span className="opt-status-icon incorrect">✗ Twoja odpowiedź</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Panel wyjaśnienia i przejścia dalej (widoczny po odpowiedzi) */}
            {selectedAnswer !== null && (
              <div className="quiz-feedback-box">
                <div className="quiz-feedback-header">
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <span className="feedback-badge success">
                      🎉 Dobra odpowiedź! (+1 pkt)
                    </span>
                  ) : (
                    <span className="feedback-badge error">
                      ❌ Błędna odpowiedź. Poprawna to wariant{" "}
                      <strong>{currentQuestion.correctAnswer}</strong>.
                    </span>
                  )}
                </div>

                <div className="quiz-explanation">
                  <strong>💡 Wyjaśnienie techniczne CKE:</strong>
                  <p>{currentQuestion.explanation}</p>
                </div>

                <div className="quiz-actions-row">
                  <button
                    type="button"
                    className="quiz-next-btn"
                    onClick={handleNextQuestion}
                  >
                    {currentIndex + 1 < totalQuestions
                      ? "Następne pytanie ➔"
                      : "Zobacz podsumowanie egzaminu 🏁"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Ekran podsumowania po wyczerpaniu puli pytań */
          <div className="quiz-summary-card">
            <div className="summary-trophy">
              {percentage >= 50 ? "🏆" : "📚"}
            </div>
            <h1>Podsumowanie Quizu Egzaminacyjnego ELM.08</h1>
            <p className="summary-desc">
              Pula {totalQuestions} pytań testowych została wyczerpana.
            </p>

            <div className="summary-score-display">
              <div className="score-big-circle">
                <span className="score-number">{percentage}%</span>
                <span className="score-subtext">
                  {correctAnswersCount} / {totalQuestions} pkt
                </span>
              </div>
              <div className="score-verdict">
                {percentage >= 50 ? (
                  <div className="verdict-tag pass">
                    <span className="tag-icon">🟢</span>
                    <div>
                      <strong>EGZAMIN ZDANY!</strong>
                      <small>Uzyskano wynik powyżej oficjalnego progu CKE (min. 50%)</small>
                    </div>
                  </div>
                ) : (
                  <div className="verdict-tag fail">
                    <span className="tag-icon">🔴</span>
                    <div>
                      <strong>EGZAMIN NIEZDANY</strong>
                      <small>Wymagane minimum 50% poprawnych odpowiedzi. Warto powtórzyć materiał!</small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statystyki wg kategorii */}
            <div className="category-stats-container">
              <h3>Wyniki w poszczególnych kategoriach:</h3>
              <div className="category-stats-grid">
                {Object.entries(categoryStats).map(([category, s]) => {
                  const catPct = Math.round((s.correct / s.total) * 100);
                  return (
                    <div key={category} className="cat-stat-card">
                      <div className="cat-header">
                        <strong>{category}</strong>
                        <span className={`cat-pct ${catPct >= 50 ? "good" : "bad"}`}>
                          {catPct}%
                        </span>
                      </div>
                      <div className="cat-bar-track">
                        <div
                          className={`cat-bar-fill ${catPct >= 50 ? "good" : "bad"}`}
                          style={{ width: `${catPct}%` }}
                        />
                      </div>
                      <small>
                        {s.correct} z {s.total} poprawnych
                      </small>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Przyciski końcowe */}
            <div className="summary-actions">
              <button
                type="button"
                className="quiz-restart-btn"
                onClick={handleRestartQuiz}
              >
                🔄 Rozpocznij quiz ponownie (nowe losowanie)
              </button>
              <button
                type="button"
                className="quiz-exit-btn"
                onClick={onBackToSimulator}
              >
                🤖 Wróć do Symulatora RAPID
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

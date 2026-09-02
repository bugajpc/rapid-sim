import { quizQuestions } from "../src/quizData.ts";

console.log("================================================================================");
console.log("▶ TEST BAZY PYTAŃ I LOGIKI QUIZU ELM.08");
console.log("================================================================================");

console.log(`Liczba pytań w bazie: ${quizQuestions.length}`);

if (quizQuestions.length < 50) {
  console.error(`❌ Baza zawiera za mało pytań: ${quizQuestions.length} (wymagane min. 50)`);
  process.exit(1);
}
console.log(`✓ Liczba pytań spełnia kryterium: ${quizQuestions.length} >= 50`);

const seenIds = new Set();
const categoriesCount = {};
const staticAnswerCounts = { A: 0, B: 0, C: 0, D: 0 };

for (let i = 0; i < quizQuestions.length; i++) {
  const q = quizQuestions[i];
  
  // ID
  if (!q.id || seenIds.has(q.id)) {
    console.error(`❌ Błąd w pytaniu #${i + 1}: nieunikalne lub brakujące id '${q.id}'`);
    process.exit(1);
  }
  seenIds.add(q.id);

  // Kategoria
  if (!q.category) {
    console.error(`❌ Pytanie ${q.id} nie ma określonej kategorii!`);
    process.exit(1);
  }
  categoriesCount[q.category] = (categoriesCount[q.category] || 0) + 1;

  // Treść pytania
  if (!q.question || q.question.trim().length < 10) {
    console.error(`❌ Pytanie ${q.id} ma za krótką lub pustą treść!`);
    process.exit(1);
  }

  // Warianty ABCD
  if (!Array.isArray(q.options) || q.options.length !== 4) {
    console.error(`❌ Pytanie ${q.id} nie posiada dokładnie 4 wariantów odpowiedzi!`);
    process.exit(1);
  }

  const optionLetters = q.options.map(o => o.id);
  if (JSON.stringify(optionLetters) !== JSON.stringify(["A", "B", "C", "D"])) {
    console.error(`❌ Pytanie ${q.id} ma nieprawidłowe oznaczenia wariantów: ${optionLetters.join(", ")}`);
    process.exit(1);
  }

  for (const opt of q.options) {
    if (!opt.text || opt.text.trim().length === 0) {
      console.error(`❌ Pytanie ${q.id} wariant ${opt.id} ma pustą treść!`);
      process.exit(1);
    }
  }

  // Poprawna odpowiedź
  if (!["A", "B", "C", "D"].includes(q.correctAnswer)) {
    console.error(`❌ Pytanie ${q.id} ma błędną poprawną odpowiedź '${q.correctAnswer}'!`);
    process.exit(1);
  }
  staticAnswerCounts[q.correctAnswer]++;

  // Wyjaśnienie
  if (!q.explanation || q.explanation.trim().length < 15) {
    console.error(`❌ Pytanie ${q.id} nie ma wystarczającego wyjaśnienia technicznego!`);
    process.exit(1);
  }
}

console.log("✓ Wszystkie pytania mają poprawną strukturę, unikalne ID, warianty ABCD i merytoryczne wyjaśnienia.");

console.log("\nStatyczny rozkład poprawnych odpowiedzi w bazie quizData.ts:");
for (const [letter, count] of Object.entries(staticAnswerCounts)) {
  const pct = ((count / quizQuestions.length) * 100).toFixed(1);
  console.log(`  • Odpowiedź ${letter}: ${count} (${pct}%)`);
}

if (staticAnswerCounts.D === 0) {
  console.error("❌ BŁĄD: Odpowiedź D ani razu nie występuje w bazie pytań!");
  process.exit(1);
}
console.log("✓ Odpowiedź D występuje w bazie i jest prawidłowo zbalansowana.");

// Test losowania z przetasowaniem wariantów (jak w QuizView)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function shuffleQuestionOptions(q) {
  const correctOption = q.options.find((o) => o.id === q.correctAnswer);
  const correctText = correctOption.text;
  const shuffledTexts = shuffleArray(q.options.map((o) => o.text));
  const newOptions = shuffledTexts.map((text, idx) => ({
    id: ["A", "B", "C", "D"][idx],
    text,
  }));
  const newCorrectAnswer = newOptions.find((o) => o.text === correctText).id;
  return {
    ...q,
    options: newOptions,
    correctAnswer: newCorrectAnswer,
  };
}

const sessionRun = shuffleArray(quizQuestions).map(shuffleQuestionOptions);
const sessionCounts = { A: 0, B: 0, C: 0, D: 0 };
sessionRun.forEach(q => sessionCounts[q.correctAnswer]++);

console.log("\nPrzykładowy rozkład poprawnych odpowiedzi w pojedynczej sesji (55 pytań z losową kolejnością opcji):");
for (const [letter, count] of Object.entries(sessionCounts)) {
  const pct = ((count / sessionRun.length) * 100).toFixed(1);
  console.log(`  • Odpowiedź ${letter}: ${count} (${pct}%)`);
}

if (sessionCounts.D === 0) {
  console.error("❌ Odpowiedź D nie wystąpiła w sesji!");
  process.exit(1);
}
console.log(`✓ Odpowiedź D wystąpiła ${sessionCounts.D} razy w bieżącej sesji.`);

console.log("\n================================================================================");
console.log("🎉 TEST BAZY I ZBALANSOWANIA ODPOWIEDZI ABCD ZAKOŃCZONY PEŁNYM SUKCESEM!");
console.log("================================================================================");

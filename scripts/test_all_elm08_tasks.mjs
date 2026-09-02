import fs from "fs";
import { compile, evaluateExpression, formatTPWrite, tasks, targets } from "../src/rapid.ts";
import { isReachable, defaultWorkObjects, defaultTcp } from "../src/robotConfig.ts";

console.log("================================================================================");
console.log("     TESTOWANIE DZIAŁANIA PROGRAMÓW DLA WSZYSTKICH ZADAŃ EGZAMINACYJNYCH ELM.08");
console.log("================================================================================\n");

// Read solutions.md
const md = fs.readFileSync("solutions.md", "utf8");
const codeBlocks = [...md.matchAll(/```rapid\n([\s\S]*?)```/g)].map(m => m[1]);

// Map tasks to solutions. Programs 1..5 in solutions.md are basic-1..5, programs 6..17 are elm08-101..112
const elmTasks = tasks.filter(t => t.category === "elm08");

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

for (let idx = 0; idx < elmTasks.length; idx++) {
  const task = elmTasks[idx];
  const solutionCode = codeBlocks[5 + idx]; // index 5 is 101, index 16 is 112
  totalTests++;

  console.log(`\n--------------------------------------------------------------------------------`);
  console.log(`▶ TESTOWANIE ZADANIA: [${task.id}] - ${task.title}`);
  console.log(`--------------------------------------------------------------------------------`);

  // 1. Check starter code compilation
  const starterRes = compile(task.starterCode, targets);
  if (starterRes.error) {
    console.error(`  ❌ Błąd kompilacji starterCode: ${starterRes.error}`);
    failedTests++;
    continue;
  }
  console.log(`  ✓ Kod początkowy (starter) kompiluje się poprawnie (${starterRes.commands.length} instrukcji).`);

  // 2. Check solution code compilation
  if (!solutionCode) {
    console.error(`  ❌ Brak kodu wzorcowego w solutions.md dla zadania ${task.id}!`);
    failedTests++;
    continue;
  }

  const solRes = compile(solutionCode, targets);
  if (solRes.error) {
    console.error(`  ❌ Błąd kompilacji kodu wzorcowego: ${solRes.error}`);
    failedTests++;
    continue;
  }
  console.log(`  ✓ Kod wzorcowy kompiluje się bezbłędnie (${solRes.commands.length} instrukcji RAPID).`);

  // 3. Verify all targets reachability
  let targetsOk = true;
  const moveCommands = solRes.commands.filter(c => c.type === "move");
  const uniqueTargetNames = new Set(moveCommands.map(c => c.target));
  for (const tName of uniqueTargetNames) {
    const base = targets[tName];
    if (!base) {
      console.error(`  ❌ Punkt docelowy '${tName}' nie istnieje w bibliotece targets!`);
      targetsOk = false;
      continue;
    }
    if (!isReachable(base)) {
      console.error(`  ❌ Punkt docelowy '${tName}' [${base.join(", ")}] jest poza zasięgiem robota!`);
      targetsOk = false;
    }
  }

  if (targetsOk) {
    console.log(`  ✓ Wszystkie punkty trajektorii (${uniqueTargetNames.size} punktów) mieszczą się w strefie roboczej robota.`);
  } else {
    failedTests++;
    continue;
  }

  // 4. Virtual VM Execution Simulation
  const variables = {};
  const inputs = { ...(task.defaultInputs || { S1: false }) };
  const outputs = { ...(task.defaultOutputs || {}) };
  let tcp = [...defaultTcp];
  let pc = 0;
  let steps = 0;
  const maxSteps = 3000;
  let waitDiCount = 0;
  let movesCount = 0;
  let outputsSet = new Set();
  let executionError = null;

  while (pc < solRes.commands.length && steps < maxSteps) {
    steps++;
    const cmd = solRes.commands[pc];

    if (cmd.type === "jump") {
      pc = cmd.targetIndex;
      continue;
    }

    if (cmd.type === "jumpIfFalse") {
      const condVal = evaluateExpression(cmd.expr, {
        variables,
        targetLibrary: targets,
        inputs,
        outputs,
      });
      if (!condVal) {
        pc = cmd.targetIndex;
      } else {
        pc++;
      }
      continue;
    }

    if (cmd.type === "assign") {
      const val = evaluateExpression(cmd.expr, {
        variables,
        targetLibrary: targets,
        inputs,
        outputs,
      });
      variables[cmd.variable.toLowerCase()] = val;
      pc++;
      continue;
    }

    if (cmd.type === "increment") {
      const step = cmd.stepExpr ? evaluateExpression(cmd.stepExpr, { variables, targetLibrary: targets, inputs, outputs }) : 1;
      const k = cmd.variable.toLowerCase();
      variables[k] = (variables[k] || 0) + (Number(step) || 1);
      pc++;
      continue;
    }

    if (cmd.type === "decrement") {
      const step = cmd.stepExpr ? evaluateExpression(cmd.stepExpr, { variables, targetLibrary: targets, inputs, outputs }) : 1;
      const k = cmd.variable.toLowerCase();
      variables[k] = (variables[k] || 0) - (Number(step) || 1);
      pc++;
      continue;
    }

    if (cmd.type === "clear") {
      variables[cmd.variable.toLowerCase()] = 0;
      pc++;
      continue;
    }

    if (cmd.type === "output") {
      outputs[cmd.signal] = cmd.value;
      outputsSet.add(cmd.signal);
      pc++;
      continue;
    }

    if (cmd.type === "pulse") {
      outputs[cmd.signal] = true;
      outputsSet.add(cmd.signal);
      pc++;
      continue;
    }

    if (cmd.type === "waitInput") {
      waitDiCount++;
      // Auto-simulate reactive sensor/button input to satisfy wait and let the machine proceed
      inputs[cmd.signal] = cmd.value;
      pc++;
      continue;
    }

    if (cmd.type === "waitOutput") {
      outputs[cmd.signal] = cmd.value;
      pc++;
      continue;
    }

    if (cmd.type === "wait") {
      pc++;
      continue;
    }

    if (cmd.type === "move") {
      movesCount++;
      const baseDest = targets[cmd.target] || defaultTcp;
      let dest = [...baseDest];
      if (cmd.targetOffsetExpr) {
        const dx = Number(evaluateExpression(cmd.targetOffsetExpr[0], { variables, targetLibrary: targets, inputs, outputs })) || 0;
        const dy = Number(evaluateExpression(cmd.targetOffsetExpr[1], { variables, targetLibrary: targets, inputs, outputs })) || 0;
        const dz = Number(evaluateExpression(cmd.targetOffsetExpr[2], { variables, targetLibrary: targets, inputs, outputs })) || 0;
        dest = [dest[0] + dx, dest[1] + dy, dest[2] + dz];
      } else if (cmd.targetOffset) {
        dest = [dest[0] + cmd.targetOffset[0], dest[1] + cmd.targetOffset[1], dest[2] + cmd.targetOffset[2]];
      }
      if (cmd.wobj && defaultWorkObjects[cmd.wobj]) {
        const wobj = defaultWorkObjects[cmd.wobj];
        dest = [dest[0] + wobj.uframe[0], dest[1] + wobj.uframe[1], dest[2] + wobj.uframe[2]];
      }
      if (!isReachable(dest)) {
        executionError = `Punkt ruchu poza zasięgiem robota: ${dest.join(", ")} (linia ${cmd.line})`;
        break;
      }
      tcp = dest;
      pc++;
      continue;
    }

    if (cmd.type === "stop") {
      pc = solRes.commands.length;
      break;
    }

    if (cmd.type === "log" || cmd.type === "tpErase") {
      pc++;
      continue;
    }

    pc++;
  }

  if (executionError) {
    console.error(`  ❌ Błąd wykonania: ${executionError}`);
    failedTests++;
  } else if (steps >= maxSteps) {
    console.error(`  ❌ Przekroczono limit kroków (${maxSteps}) – możliwe zapętlenie!`);
    failedTests++;
  } else {
    console.log(`  ✓ Wykonanie programu zakończone sukcesem (Status: COMPLETED):`);
    console.log(`    - Liczba przetworzonych kroków: ${steps}`);
    console.log(`    - Liczba wykonanych ruchów manipulatora (MoveJ/L/C): ${movesCount}`);
    console.log(`    - Obsłużone synchronizacje sygnałów (WaitDI): ${waitDiCount}`);
    console.log(`    - Sterowane sygnały wyjściowe: [${[...outputsSet].join(", ")}]`);
    console.log(`    - Końcowa pozycja TCP: [${tcp.map(v => Math.round(v)).join(", ")}]`);
    passedTests++;
  }
}

console.log("\n================================================================================");
console.log(`PODSUMOWANIE TESTÓW ZADAŃ EGZAMINACYJNYCH:`);
console.log(`Przetestowano zadań: ${totalTests}`);
console.log(`Zakończonych sukcesem: ${passedTests} / ${totalTests}`);
console.log(`Błędów: ${failedTests}`);
console.log("================================================================================");

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log("\n🌟 WSZYSTKIE 12 ZADAŃ EGZAMINACYJNYCH ELM.08 PRZESZŁO TESTY Z SUKCESEM 100%!");
}

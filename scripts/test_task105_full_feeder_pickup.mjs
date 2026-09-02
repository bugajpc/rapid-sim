import fs from "fs";
import { compile, evaluateExpression, tasks, targets } from "../src/rapid.ts";
import { defaultTcp } from "../src/robotConfig.ts";

console.log("=== TEST PEŁNEGO POBRANIA 4 DETALI W ZADANIU ELM.08-105 ===");

const task105 = tasks.find(t => t.id === "task-elm08-105");
if (!task105) {
  console.error("Nie znaleziono zadania task-elm08-105!");
  process.exit(1);
}

console.log(`Liczba detali w magazynie opadowym: ${task105.blocks.length}`);
task105.blocks.forEach((b, i) => {
  console.log(`  Detal ${i + 1} (${b.id}): pozycja = [${b.position.join(", ")}]`);
});

// Read solutions.md
const md = fs.readFileSync("solutions.md", "utf8");
const codeBlocks = [...md.matchAll(/```rapid\n([\s\S]*?)```/g)].map(m => m[1]);
// Task 105 is index 9 (5 basic + 101(5), 102(6), 103(7), 104(8), 105(9))
const solCode = codeBlocks[9];

console.log("\nKompilacja programu wzorcowego ELM.08-105...");
const compiled = compile(solCode, targets);
if (compiled.error) {
  console.error(`Błąd kompilacji: ${compiled.error}`);
  process.exit(1);
}
console.log(`Skompilowano: ${compiled.commands.length} instrukcji.`);

let blocks = task105.blocks.map(b => ({ ...b, position: [...b.position] }));
let heldBlockId = null;
const variables = { ...(compiled.initialVariables || {}) };
const inputs = { S1: true, B3: true };
const outputs = { H1: false, H2: false, doGripper: false, doConvRun: false };
let tcp = [...defaultTcp];

let pickEvents = [];
let placeEvents = [];
let steps = 0;
const maxSteps = 1000;

for (let pc = 0; pc < compiled.commands.length && steps < maxSteps; pc++) {
  steps++;
  const cmd = compiled.commands[pc];

  if (cmd.type === "jump") {
    pc = cmd.targetIndex - 1;
    continue;
  }
  if (cmd.type === "jumpIfFalse") {
    const cond = evaluateExpression(cmd.expr, { variables, targetLibrary: targets, inputs, outputs });
    if (!cond) pc = cmd.targetIndex - 1;
    continue;
  }
  if (cmd.type === "assign") {
    variables[cmd.variable.toLowerCase()] = evaluateExpression(cmd.expr, { variables, targetLibrary: targets, inputs, outputs });
    continue;
  }
  if (cmd.type === "add") {
    const val = evaluateExpression(cmd.expr, { variables, targetLibrary: targets, inputs, outputs });
    const k = cmd.variable.toLowerCase();
    variables[k] = (variables[k] || 0) + (Number(val) || 0);
    continue;
  }
  if (cmd.type === "increment") {
    const step = cmd.stepExpr ? evaluateExpression(cmd.stepExpr, { variables, targetLibrary: targets, inputs, outputs }) : 1;
    const k = cmd.variable.toLowerCase();
    variables[k] = (variables[k] || 0) + (Number(step) || 1);
    continue;
  }
  if (cmd.type === "waitInput") {
    inputs[cmd.signal] = cmd.value;
    continue;
  }
  if (cmd.type === "output") {
    outputs[cmd.signal] = cmd.value;
    if (cmd.signal === "doGripper") {
      if (cmd.value) {
        let closest = null;
        let minDist = Infinity;
        for (const b of blocks) {
          const d = Math.hypot(tcp[0] - b.position[0], tcp[1] - b.position[1], tcp[2] - b.position[2]);
          if (d < minDist) {
            minDist = d;
            closest = b;
          }
        }
        if (closest && minDist <= 70) {
          heldBlockId = closest.id;
          pickEvents.push({ id: closest.id, atTcp: [...tcp], dist: minDist.toFixed(1) });
          console.log(`  ➔ CHWYTAK ZACIŚNIĘTY: Pobrany detal [${closest.id}] w punkcie [${tcp.map(Math.round).join(", ")}] (odległość: ${minDist.toFixed(1)} mm)`);
        } else {
          console.error(`  ❌ BŁĄD: Chwytak zamknięty na pusto! TCP [${tcp.join(", ")}], najbliższy: dist = ${minDist.toFixed(1)} mm`);
          process.exit(1);
        }
      } else if (heldBlockId) {
        const b = blocks.find(x => x.id === heldBlockId);
        if (b) {
          b.position = [...tcp];
          placeEvents.push({ id: b.id, atTcp: [...tcp] });
          console.log(`  ➔ CHWYTAK OTWARTY: Odłożony detal [${b.id}] na taśmociąg w punkcie [${tcp.map(Math.round).join(", ")}]`);
        }
        heldBlockId = null;
      }
    }
    continue;
  }

  if (cmd.type === "move") {
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
    tcp = dest;
    if (heldBlockId) {
      const b = blocks.find(x => x.id === heldBlockId);
      if (b) b.position = [...tcp];
    }
    continue;
  }
}

console.log(`\nPodsumowanie zdarzeń fizyki chwytaka:`);
console.log(`Pobranych detali: ${pickEvents.length} / 4`);
console.log(`Odłożonych detali: ${placeEvents.length} / 4`);

if (pickEvents.length === 4 && placeEvents.length === 4) {
  console.log("\n🎉 TEST ZALICZONY W 100%! Wszystkie 4 detale zostały poprawnie pobrane ze stosu i odłożone!");
} else {
  console.error("\n❌ TEST NIE ZALICZONY!");
  process.exit(1);
}

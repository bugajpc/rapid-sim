import { compile, evaluateExpression, targets, tasks } from "../src/rapid.ts";
import { defaultTcp } from "../src/robotConfig.ts";

console.log("================================================================================");
console.log("▶ TEST SYMULACJI: Zadanie ELM.08-107 - Sortowanie 4 detali pierścieniowych");
console.log("================================================================================");

const task = tasks.find(t => t.id === "task-elm08-107");
if (!task) {
  console.error("❌ Nie znaleziono zadania task-elm08-107!");
  process.exit(1);
}

console.log(`Liczba detali w zadaniu: ${task.blocks?.length}`);
if (!task.blocks || task.blocks.length !== 4) {
  console.error(`❌ Oczekiwano 4 detali, otrzymano: ${task.blocks?.length}`);
  process.exit(1);
}

// Skopiuj klocki
const blocks = task.blocks.map(b => ({ ...b, position: [...b.position] }));

// Sprawdź stan czujnika B1 przed uruchomieniem
let b1Active = false;
for (const b of blocks) {
  if (Math.hypot(b.position[0] - 170, b.position[1] - 310) < 35 && b.position[2] < 280) {
    b1Active = true;
  }
}
console.log(`Stan początkowy czujnika B1: ${b1Active ? "1 (Detal 4 obecny)" : "0"}`);
if (!b1Active) {
  console.error("❌ Czujnik B1 powinien wykrywać obecność detalu nr 4 na palecie!");
  process.exit(1);
}

const compileRes = compile(task.starterCode, targets);
if (compileRes.error) {
  console.error("❌ Błąd kompilacji starterCode:", compileRes.error);
  process.exit(1);
}

let tcp = [...defaultTcp];
let heldBlockId = null;
const variables = { ...(compileRes.initialVariables || {}) };
const inputs = { S1: true, B1: true };
const outputs = { H1: false, H2: false, doGripper: false, K3: false };
const pickEvents = [];
const placeEvents = [];
let b1TurnedOffWhenPicked = false;

for (let pc = 0; pc < compileRes.commands.length; pc++) {
  const cmd = compileRes.commands[pc];

  // Aktualizacja czujnika B1 na podstawie pozycji detalu 4
  const ring4 = blocks.find(b => b.id === "ring-4");
  const isRing4OnPallet = ring4 && Math.hypot(ring4.position[0] - 170, ring4.position[1] - 310) < 35 && ring4.position[2] < 280;
  inputs.B1 = isRing4OnPallet;

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
  if (cmd.type === "pulse") {
    outputs[cmd.signal] = true;
    console.log(`  ⚡ Impuls PulseDO na sygnał: ${cmd.signal} (długość: ${cmd.length}s)`);
    continue;
  }
  if (cmd.type === "wait") {
    continue;
  }
  if (cmd.type === "output") {
    outputs[cmd.signal] = cmd.value;
    if (cmd.signal === "H1") {
      console.log(`  💡 Lampa H1 (zielona) = ${cmd.value ? "ON" : "OFF"}`);
    }
    if (cmd.signal === "H2") {
      console.log(`  🚨 Lampa H2 (czerwona) = ${cmd.value ? "ON" : "OFF"}`);
    }
    if (cmd.signal === "doGripper") {
      if (cmd.value) {
        // Chwyć najbliższy klocek
        let closest = null, minDist = Infinity;
        for (const b of blocks) {
          const d = Math.hypot(tcp[0] - b.position[0], tcp[1] - b.position[1], tcp[2] - b.position[2]);
          if (d < minDist) { minDist = d; closest = b; }
        }
        if (closest && minDist <= 70) {
          heldBlockId = closest.id;
          pickEvents.push({ id: closest.id, atTcp: [...tcp], dist: minDist.toFixed(1) });
          console.log(`  ➔ Pobrano: ${closest.id} w punkcie TCP [${tcp.map(Math.round).join(", ")}] (odległość: ${minDist.toFixed(1)} mm)`);
        } else {
          console.error(`  ❌ Błąd chwytaka: brak klocka w zasięgu TCP [${tcp.map(Math.round).join(", ")}] (najbliższy: ${minDist.toFixed(1)} mm)`);
          process.exit(1);
        }
      } else if (heldBlockId) {
        const b = blocks.find(x => x.id === heldBlockId);
        if (b) {
          b.position = [...tcp];
          placeEvents.push({ id: b.id, atTcp: [...tcp] });
          console.log(`  ➔ Odłożono: ${b.id} na wałek w punkcie [${tcp.map(Math.round).join(", ")}]`);
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
      if (b) {
        b.position = [...tcp];
        if (b.id === "ring-4" && b.position[2] > 280) {
          b1TurnedOffWhenPicked = true;
        }
      }
    }
  }
}

console.log("\n================================================================================");
console.log("WYNIKI TESTU SYMULACJI ELM.08-107:");
console.log(`- Liczba pobranych detali: ${pickEvents.length} / 4`);
console.log(`- Liczba odłożonych detali: ${placeEvents.length} / 4`);
console.log(`- Czy czujnik B1 wyłączył się po uniesieniu detalu 4: ${b1TurnedOffWhenPicked ? "TAK" : "NIE"}`);
console.log(`- Czy wystawiono impuls PLC K3: ${outputs.K3 ? "TAK" : "NIE"}`);

if (pickEvents.length !== 4 || placeEvents.length !== 4) {
  console.error("❌ Nie wszystkie 4 detale zostały posortowane!");
  process.exit(1);
}

const ring1 = blocks.find(b => b.id === "ring-1");
const ring2 = blocks.find(b => b.id === "ring-2");
const ring3 = blocks.find(b => b.id === "ring-3");
const ring4 = blocks.find(b => b.id === "ring-4");

console.log(`- Detal 1 pozycja końcowa: [${ring1.position.map(Math.round).join(", ")}] (docelowo Wałek 1)`);
console.log(`- Detal 2 pozycja końcowa: [${ring2.position.map(Math.round).join(", ")}] (docelowo Wałek 1 +35mm)`);
console.log(`- Detal 3 pozycja końcowa: [${ring3.position.map(Math.round).join(", ")}] (docelowo Wałek 2)`);
console.log(`- Detal 4 pozycja końcowa: [${ring4.position.map(Math.round).join(", ")}] (docelowo Wałek 2 +35mm)`);

const pPin1 = targets.pPin1;
const pPin2 = targets.pPin2;

if (Math.hypot(ring1.position[0] - pPin1[0], ring1.position[1] - pPin1[1]) > 5 ||
    Math.hypot(ring2.position[0] - pPin1[0], ring2.position[1] - pPin1[1]) > 5) {
  console.error("❌ Detale 1 i 2 powinny znajdować się na Wałku 1!");
  process.exit(1);
}

if (Math.hypot(ring3.position[0] - pPin2[0], ring3.position[1] - pPin2[1]) > 5 ||
    Math.hypot(ring4.position[0] - pPin2[0], ring4.position[1] - pPin2[1]) > 5) {
  console.error("❌ Detale 3 i 4 powinny znajdować się na Wałku 2!");
  process.exit(1);
}

console.log("🎉 TEST ELM.08-107 ZAKOŃCZONY PEŁNYM SUKCESEM!");

import fs from "fs";
import { compile, evaluateExpression, tasks, targets } from "../src/rapid.ts";
import { defaultTcp } from "../src/robotConfig.ts";

console.log("=== TEST DZIAŁANIA TAŚMOCIĄGU I CZUJNIKA B4 W ZADANIU ELM.08-102 ===");

const task102 = tasks.find(t => t.id === "task-elm08-102");
if (!task102) {
  console.error("Nie znaleziono zadania task-elm08-102!");
  process.exit(1);
}

const compiled = compile(task102.starterCode, targets);
if (compiled.error) {
  console.error(`Błąd kompilacji: ${compiled.error}`);
  process.exit(1);
}

let blocks = task102.blocks.map(b => ({ ...b, position: [...b.position] }));
let heldBlockId = null;
const variables = { ...(compiled.initialVariables || {}) };
const inputs = { S1: true, B3: false, B4: false };
const outputs = { H1: false, H2: false, doGripper: false, doConvRun: false, doConvDir: false };
let tcp = [...defaultTcp];

console.log("Symulacja transportu detalu 1 na taśmociąg i dojazdu do czujnika B4...");

let convRunSteps = 0;
let b4TriggeredAtX = null;
let b4Triggered = false;

for (let pc = 0; pc < compiled.commands.length && convRunSteps < 500; pc++) {
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
  if (cmd.type === "output") {
    outputs[cmd.signal] = cmd.value;
    if (cmd.signal === "doGripper") {
      if (cmd.value) {
        let closest = null, minDist = Infinity;
        for (const b of blocks) {
          const d = Math.hypot(tcp[0] - b.position[0], tcp[1] - b.position[1], tcp[2] - b.position[2]);
          if (d < minDist) { minDist = d; closest = b; }
        }
        if (closest && minDist <= 70) {
          heldBlockId = closest.id;
          console.log(`  ➔ Chwytak pobrał: ${closest.id}`);
        }
      } else if (heldBlockId) {
        const b = blocks.find(x => x.id === heldBlockId);
        if (b) {
          b.position = [...tcp];
          console.log(`  ➔ Chwytak odłożył: ${b.id} w [${tcp.map(Math.round).join(", ")}]`);
        }
        heldBlockId = null;
      }
    }
    continue;
  }
  if (cmd.type === "move") {
    const baseDest = targets[cmd.target] || defaultTcp;
    let dest = [...baseDest];
    if (cmd.targetOffset) {
      dest = [dest[0] + cmd.targetOffset[0], dest[1] + cmd.targetOffset[1], dest[2] + cmd.targetOffset[2]];
    }
    tcp = dest;
    if (heldBlockId) {
      const b = blocks.find(x => x.id === heldBlockId);
      if (b) b.position = [...tcp];
    }
    continue;
  }
  if (cmd.type === "waitInput") {
    if (cmd.signal === "B4" && cmd.value === true) {
      console.log("  ➔ Program czeka na WaitDI B4, 1. Uruchamianie fizyki taśmociągu...");
      // Simulate conveyor movement ticks (5 mm per tick)
      while (!inputs.B4 && convRunSteps < 200) {
        convRunSteps++;
        // Move blocks on conveyor
        blocks.forEach(b => {
          if (b.position[0] > -380 && b.position[0] <= 0) {
            b.position[0] -= 5.0;
          }
          // Sensor check:
          if (Math.abs(b.position[0] - (-310)) < 20 && Math.abs(b.position[1] - 440) < 45 && b.position[2] < 300) {
            inputs.B4 = true;
            b4Triggered = true;
            b4TriggeredAtX = b.position[0];
          }
        });
      }
      console.log(`  ➔ Detal dotarł do czujnika B4: X = ${b4TriggeredAtX} mm (docelowo -310 mm)`);
      continue;
    }
    if (cmd.signal === "B4" && cmd.value === false) {
      console.log("  ➔ Program czeka na WaitDI B4, 0 (zdjęcie detalu przez operatora)...");
      inputs.B4 = false;
      // Remove block
      blocks = blocks.filter(b => b.id !== "part-1");
      console.log("  ➔ Detal zdjęty przez operatora ze stacji pakowania.");
      break; // Detal 1 fully tested!
    }
  }
}

console.log("\nPodsumowanie testu:");
console.log(`Czujnik B4 zadziałał: ${b4Triggered}`);
console.log(`Pozycja detalu przy zadziałaniu B4: ${b4TriggeredAtX} mm (docelowo -310 mm)`);
const errorDist = Math.abs(b4TriggeredAtX - (-310));
console.log(`Błąd pozycji względem czujnika: ${errorDist.toFixed(1)} mm`);

if (b4Triggered && errorDist <= 15) {
  console.log("🎉 TEST ZALICZONY! Detal dojechał bezpośrednio do czujnika B4 na końcu taśmy (stacja pakowania)!");
} else {
  console.error("❌ BŁĄD TESTU!");
  process.exit(1);
}

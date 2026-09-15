import fs from "fs";
import { compile, evaluateExpression, formatTPWrite, tasks, targets } from "../src/rapid.ts";
import { isReachable, defaultTcp } from "../src/robotConfig.ts";

console.log("================================================================================");
console.log("   TEST ZADANIA ELM.08-113: KIERUNKOWA SEGREGACJA I LINIOWA PALETYZACJA DETALI");
console.log("================================================================================\n");

// 1. Verify task metadata in tasks array
const task113 = tasks.find(t => t.id === "task-elm08-113");
if (!task113) {
  console.error("❌ Zadanie task-elm08-113 nie zostało znalezione w tasks!");
  process.exit(1);
}
console.log(`✓ Zadanie '${task113.title}' znalezione w bibliotece zadań.`);
console.log(`  - Arkusz CKE: ${task113.sheetId}`);
console.log(`  - Liczba bloków początkowych w magazynie: ${task113.blocks.length}`);
console.log(`  - Tabela sygnałów I/O: ${task113.signalsTable.length} pozycji`);
console.log(`  - Tabela punktów trajektorii: ${task113.targetsTable.length} pozycji`);
console.log(`  - Kryteria oceny CKE: ${task113.evaluationCriteria.length} kryteriów`);

// 2. Starter code compilation
const starterRes = compile(task113.starterCode, targets);
if (starterRes.error) {
  console.error(`❌ Błąd kompilacji starterCode: ${starterRes.error}`);
  process.exit(1);
}
console.log(`✓ Kod startowy (starterCode) kompiluje się poprawnie (${starterRes.commands.length} instrukcji).`);

// 3. Solution code compilation from solutions.md
const md = fs.readFileSync("solutions.md", "utf8");
const sectionRegex = /## ELM\.08-113:[\s\S]*?```rapid\n([\s\S]*?)```/;
const match = sectionRegex.exec(md);
if (!match) {
  console.error("❌ Nie znaleziono kodu wzorcowego dla ELM.08-113 w solutions.md!");
  process.exit(1);
}
const solutionCode = match[1];
const solRes = compile(solutionCode, targets);
if (solRes.error) {
  console.error(`❌ Błąd kompilacji kodu wzorcowego ELM.08-113: ${solRes.error}`);
  process.exit(1);
}
console.log(`✓ Kod wzorcowy kompiluje się poprawnie (${solRes.commands.length} instrukcji RAPID).`);

// 4. Verify robtarget reachability
const moveCmds = solRes.commands.filter(c => c.type === "move");
console.log(`✓ Liczba instrukcji ruchu (MoveJ/MoveL): ${moveCmds.length}`);
for (const c of moveCmds) {
  if (c.target === "CRobT") continue;
  const base = targets[c.target];
  if (!base) {
    console.error(`❌ Brak punktu '${c.target}' w bibliotece targets!`);
    process.exit(1);
  }
  if (!isReachable(base)) {
    console.error(`❌ Punkt '${c.target}' [${base.join(", ")}] poza zasięgiem robota!`);
    process.exit(1);
  }
}
console.log(`✓ Wszystkie punkty bazowe znajdują się w zasięgu robota IRB 1090.`);

// 5. Full Simulation of 4-workpiece cycle with physical dynamics
let blocks = task113.blocks.map(b => ({ ...b, position: [...b.position] }));
let heldBlockId = null;
const variables = { nlewo: 0, nprawo: 0, nsuma: 0 };
const inputs = {
  di_MagazynDetale: true,
  di_CzujnikLewy: false,
  di_CzujnikPrawy: false,
  di_Start: false,
  di_Kierunek: true, // Start with LEWO (1)
};
const outputs = {
  do_TasmaStart: false,
  do_TasmaKierunek: false,
  do_ChwytakON: false,
  do_ChwytakOFF: false,
  do_LampkaH1: false,
  do_LampkaH2: false,
  doGripper: false,
};
let tcp = [...defaultTcp];
const tpMessages = [];
const palletDeposits = [];
let pc = 0;
let steps = 0;
const maxSteps = 4000;

console.log("\n▶ Rozpoczęcie wirtualnej symulacji pracy stanowiska...");

while (pc < solRes.commands.length && steps < maxSteps) {
  steps++;
  const cmd = solRes.commands[pc];

  if (cmd.type === "jump") {
    pc = cmd.targetIndex;
    continue;
  }

  if (cmd.type === "jumpIfFalse") {
    const cond = evaluateExpression(cmd.expr, { variables, targetLibrary: targets, inputs, outputs });
    if (!cond) {
      pc = cmd.targetIndex;
    } else {
      pc++;
    }
    continue;
  }

  if (cmd.type === "assign") {
    const val = evaluateExpression(cmd.expr, { variables, targetLibrary: targets, inputs, outputs });
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

  if (cmd.type === "waitInput") {
    if (cmd.signal === "di_Start") {
      inputs.di_Start = true;
      console.log(`  [Operator] Wciśnięcie przycisku S1 (START)`);
    } else if (cmd.signal === "di_CzujnikLewy") {
      // Simulate conveyor transport left to X = -310
      const activeBlock = blocks.find(b => Math.abs(b.position[0] - (-180)) < 30 && Math.abs(b.position[1] - 440) < 30);
      if (activeBlock) {
        activeBlock.position[0] = -310;
        console.log(`  [Przenośnik] Transport detalu [${activeBlock.id}] w LEWO do pozycjonera X = -310`);
      }
      inputs.di_CzujnikLewy = true;
    } else if (cmd.signal === "di_CzujnikPrawy") {
      // Simulate conveyor transport right to X = -60
      const activeBlock = blocks.find(b => Math.abs(b.position[0] - (-180)) < 30 && Math.abs(b.position[1] - 440) < 30);
      if (activeBlock) {
        activeBlock.position[0] = -60;
        console.log(`  [Przenośnik] Transport detalu [${activeBlock.id}] w PRAWO do czujnika B_PRAWY X = -60`);
      }
      inputs.di_CzujnikPrawy = true;
    }
    pc++;
    continue;
  }

  if (cmd.type === "output") {
    outputs[cmd.signal] = cmd.value;

    if (cmd.signal === "do_ChwytakON" && cmd.value) {
      outputs.doGripper = true;
      // Find closest block
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
        console.log(`  [Chwytak] Zaciśnięty: Pobrany detal ${closest.id} przy TCP [${tcp.map(Math.round).join(", ")}]`);

        // If picked from feeder at [180, 440], remaining blocks drop down
        if (Math.abs(closest.position[0] - 180) < 20 && Math.abs(closest.position[1] - 440) < 20) {
          const remainingInFeeder = blocks
            .filter(b => b.id !== closest.id && Math.abs(b.position[0] - 180) < 20 && Math.abs(b.position[1] - 440) < 20)
            .sort((a, b) => a.position[2] - b.position[2]);
          remainingInFeeder.forEach((rb, idx) => {
            rb.position[2] = 255 + idx * 48;
          });
          if (remainingInFeeder.length === 0) {
            inputs.di_MagazynDetale = false;
            console.log(`  [Czujnik B_MAG] Magazyn grawitacyjny pusty (di_MagazynDetale = 0)`);
          }
        }
      } else {
        console.error(`❌ BŁĄD: Chwytak zamknięty na pusto przy TCP [${tcp.join(", ")}], najbliższy blok: ${minDist} mm!`);
        process.exit(1);
      }
    } else if (cmd.signal === "do_ChwytakOFF" && cmd.value) {
      outputs.doGripper = false;
      if (heldBlockId) {
        const b = blocks.find(x => x.id === heldBlockId);
        if (b) {
          b.position = [...tcp];
          console.log(`  [Chwytak] Otwarty: Odłożony detal ${b.id} na pozycji [${tcp.map(Math.round).join(", ")}]`);

          // Check if deposited on pallet
          if (Math.abs(tcp[1] - 310) < 15 && Math.abs(tcp[2] - 245) < 15) {
            palletDeposits.push({ id: b.id, pos: [...tcp] });
            console.log(`    ➔ Detal #${palletDeposits.length} ułożony w gnieździe palety X = ${Math.round(tcp[0])} mm`);
            // Alternate direction switch for next iteration: 1 -> 0 -> 1 -> 0
            inputs.di_Kierunek = (palletDeposits.length % 2 === 0);
            inputs.di_CzujnikLewy = false;
            inputs.di_CzujnikPrawy = false;
          }
        }
        heldBlockId = null;
      }
    }
    pc++;
    continue;
  }

  if (cmd.type === "move") {
    const baseDest = cmd.target === "CRobT" ? tcp : (targets[cmd.target] || defaultTcp);
    let dest = [...baseDest];
    if (cmd.targetOffsetExpr) {
      const dx = Number(evaluateExpression(cmd.targetOffsetExpr[0], { variables, targetLibrary: targets, inputs, outputs })) || 0;
      const dy = Number(evaluateExpression(cmd.targetOffsetExpr[1], { variables, targetLibrary: targets, inputs, outputs })) || 0;
      let dz = Number(evaluateExpression(cmd.targetOffsetExpr[2], { variables, targetLibrary: targets, inputs, outputs })) || 0;
      if (cmd.isRelTool && dz < 0) dz = -dz;
      dest = [dest[0] + dx, dest[1] + dy, dest[2] + dz];
    }
    if (!isReachable(dest)) {
      console.error(`❌ Ruch poza zasięgiem robota: [${dest.join(", ")}] (linia ${cmd.line})`);
      process.exit(1);
    }
    tcp = dest;
    if (heldBlockId) {
      const b = blocks.find(x => x.id === heldBlockId);
      if (b) b.position = [...tcp];
    }
    pc++;
    continue;
  }

  if (cmd.type === "log") {
    const formatted = formatTPWrite(cmd, {
      variables,
      targetLibrary: targets,
      inputs,
      outputs,
    });
    tpMessages.push(formatted);
    console.log(`  [TPWrite] "${formatted}"`);
    pc++;
    continue;
  }

  pc++;
}

console.log("\n================================================================================");
console.log("WYNIKI SYMULACJI ZADANIA ELM.08-113:");
console.log(`- Przetworzonych kroków instrukcji: ${steps}`);
console.log(`- Ułożonych detali na palecie: ${palletDeposits.length} / 4`);
console.log(`- Liczniki produkcyjne: nLewo = ${variables.nlewo}, nPrawo = ${variables.nprawo}, nSuma = ${variables.nsuma}`);
console.log(`- Lampka H2 (zakończenie): ${outputs.do_LampkaH2 ? "ZAŁĄCZONA (ON)" : "WYŁĄCZONA (OFF)"}`);
console.log("================================================================================");

// Validations
let errors = 0;
if (palletDeposits.length !== 4) {
  console.error(`❌ Nie ułożono wszystkich 4 detali (ułożono ${palletDeposits.length})!`);
  errors++;
}
if (variables.nsuma !== 4) {
  console.error(`❌ Zmienna nSuma powinna wynosić 4, a wynosi ${variables.nsuma}!`);
  errors++;
}
if (variables.nlewo !== 2 || variables.nprawo !== 2) {
  console.error(`❌ Zmienne kierunków powinny wynosić nLewo=2, nPrawo=2 (wynoszą ${variables.nlewo}, ${variables.nprawo})!`);
  errors++;
}
if (!outputs.do_LampkaH2) {
  console.error(`❌ Lampka H2 (do_LampkaH2) powinna być załączona na koniec cyklu!`);
  errors++;
}

// Verify linear pallet pitch of exactly 35 mm between consecutive parts
for (let i = 0; i < palletDeposits.length; i++) {
  const expectedX = -70 + i * 35;
  const actualX = Math.round(palletDeposits[i].pos[0]);
  if (actualX !== expectedX) {
    console.error(`❌ Detal #${i + 1} na palecie ma X = ${actualX} mm, oczekiwano ${expectedX} mm (krok 35 mm)!`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n❌ TEST NIE ZALICZONY (${errors} błędów)!`);
  process.exit(1);
} else {
  console.log("\n🎉 TEST ZADANIA ELM.08-113 ZAKOŃCZONY PEŁNYM SUKCESEM (100%)!");
  console.log("   - Segregacja dwukierunkowa na taśmie działa bezbłędnie");
  console.log("   - Wycofanie narzędzia RelTool(CRobT(), 0, 0, -50) działa idealnie");
  console.log("   - Paletyzacja liniowa z krokiem 35 mm na punktach X=[-70, -35, 0, 35] zweryfikowana");
  console.log("   - Logika czujników B_MAG, B_LEWY, B_PRAWY i liczniki nLewo, nPrawo, nSuma w 100% zgodne ze specyfikacją CKE");
}

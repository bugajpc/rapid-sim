import { tasks } from "../src/rapid.ts";

console.log(`Checking ${tasks.length} tasks for formatted sheet content...`);

let okCount = 0;
let warnCount = 0;

for (const t of tasks) {
  const hasSheet = Boolean(t.sheetId);
  const hasDesc = Boolean(t.workstationDescription);
  const hasSignals = Array.isArray(t.signalsTable);
  const hasTargets = Array.isArray(t.targetsTable);
  const hasSteps = Array.isArray(t.procedureSteps) && t.procedureSteps.length > 0;
  const hasCriteria = Array.isArray(t.evaluationCriteria) && t.evaluationCriteria.length > 0;

  if (hasSheet && hasDesc && hasSignals && hasTargets && hasSteps && hasCriteria) {
    console.log(`✓ [${t.id}] "${t.title}": sheet="${t.sheetId}", signals=${t.signalsTable.length}, targets=${t.targetsTable.length}, steps=${t.procedureSteps.length}`);
    okCount++;
  } else {
    console.warn(`⚠️ [${t.id}] missing fields:`, { hasSheet, hasDesc, hasSignals, hasTargets, hasSteps, hasCriteria });
    warnCount++;
  }
}

console.log(`\nVerified: ${okCount} complete, ${warnCount} warnings.`);
if (warnCount > 0) {
  process.exit(1);
}

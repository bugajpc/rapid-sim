import { tasks } from "../src/rapid.ts";

console.log("Checking all ELM.08 tasks for signal S1 and sensors...");

let missingS1 = 0;
for (const t of tasks) {
  if (t.category === "elm08") {
    const hasS1 = t.defaultInputs && ("S1" in t.defaultInputs);
    if (!hasS1) {
      console.error(`❌ Task ${t.id} missing S1 in defaultInputs!`);
      missingS1++;
    } else {
      console.log(`✓ Task ${t.id}: inputs =`, Object.keys(t.defaultInputs).join(", "), "| outputs =", Object.keys(t.defaultOutputs || {}).join(", "));
    }
  }
}

if (missingS1 > 0) {
  console.error(`Failed: ${missingS1} tasks missing S1`);
  process.exit(1);
} else {
  console.log("All ELM.08 tasks have S1 configured correctly!");
}

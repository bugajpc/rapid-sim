import fs from "fs";
import { compile, targets } from "../src/rapid.ts";

const md = fs.readFileSync("solutions.md", "utf8");
const codeBlockRegex = /```rapid\n([\s\S]*?)```/g;

let match;
let count = 0;
let failed = 0;

while ((match = codeBlockRegex.exec(md)) !== null) {
  count++;
  const code = match[1];
  const res = compile(code, targets);
  if (res.error) {
    console.error(`❌ Program #${count} in solutions.md FAILED:`, res.error);
    failed++;
  } else {
    console.log(`✓ Program #${count} passed compilation (${res.commands.length} commands)`);
  }
}

console.log(`\nVerified ${count} RAPID programs in solutions.md. Failures: ${failed}`);
if (failed > 0) {
  process.exit(1);
}

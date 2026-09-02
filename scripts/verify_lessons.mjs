import { examples, compile, targets } from "../src/rapid.ts";

console.log(`Checking ${examples.length} educational lessons...`);

let failCount = 0;
for (let i = 0; i < examples.length; i++) {
  const ex = examples[i];
  const res = compile(ex.code, targets);
  if (res.error) {
    console.error(`❌ Lesson #${i+1} [${ex.id}] "${ex.title}" FAILED:`, res.error);
    failCount++;
  } else {
    const hasLecture = Boolean(ex.lecture);
    const syntaxCount = ex.lecture?.syntax?.length || 0;
    const tipsCount = ex.lecture?.examTips?.length || 0;
    console.log(`✓ Lesson #${i+1} [${ex.id}] "${ex.title}" compiled (${res.commands.length} cmds, lecture=${hasLecture}, syntax=${syntaxCount}, tips=${tipsCount})`);
  }
}

if (failCount > 0) {
  console.error(`\nFailed: ${failCount} lessons failed compilation!`);
  process.exit(1);
} else {
  console.log(`\nALL ${examples.length} LESSONS PASSED COMPILATION AND HAVE FULL LECTURES!`);
}

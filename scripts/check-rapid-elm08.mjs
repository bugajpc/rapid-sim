import { compile, evaluateExpression, tasks, targets } from "../src/rapid.ts";

function assert(condition, message) {
  if (!condition) {
    console.error("FAIL:", message);
    process.exit(1);
  }
}

console.log("--- Testing IF-ELSEIF-ELSE-ENDIF compilation ---");
{
  const code = `
  MODULE MainModule
    VAR num x := 10;
    PROC main()
      IF x = 10 THEN
        TPWrite "ten";
      ELSEIF x = 20 THEN
        TPWrite "twenty";
      ELSE
        TPWrite "other";
      ENDIF
    ENDPROC
  ENDMODULE
  `;
  const res = compile(code);
  assert(!res.error, `Compilation failed: ${res.error}`);
  assert(res.commands.length >= 5, `Expected commands for IF, got ${res.commands.length}`);
  const hasJumpIfFalse = res.commands.some((c) => c.type === "jumpIfFalse");
  const hasJump = res.commands.some((c) => c.type === "jump");
  assert(hasJumpIfFalse && hasJump, "Missing jump or jumpIfFalse commands");
  console.log("✓ PASS: IF-ELSEIF-ELSE-ENDIF compiled to jumps");
}

console.log("--- Testing WHILE-DO-ENDWHILE compilation ---");
{
  const code = `
  MODULE MainModule
    VAR num count := 0;
    PROC main()
      WHILE count < 3 DO
        Incr count;
      ENDWHILE
    ENDPROC
  ENDMODULE
  `;
  const res = compile(code);
  assert(!res.error, `Compilation failed: ${res.error}`);
  assert(res.commands.some((c) => c.type === "jumpIfFalse"), "WHILE missing jumpIfFalse");
  assert(res.commands.some((c) => c.type === "jump"), "WHILE missing jump");
  console.log("✓ PASS: WHILE-DO-ENDWHILE compiled to loop jumps");
}

console.log("--- Testing FOR-FROM-TO-DO-ENDFOR compilation ---");
{
  const code = `
  MODULE MainModule
    PROC main()
      FOR i FROM 1 TO 5 DO
        TPWrite "step: " \\Num:=i;
      ENDFOR
    ENDPROC
  ENDMODULE
  `;
  const res = compile(code);
  assert(!res.error, `Compilation failed: ${res.error}`);
  assert(res.commands.some((c) => c.type === "assign"), "FOR missing init assign");
  assert(res.commands.some((c) => c.type === "jumpIfFalse"), "FOR missing loop condition");
  console.log("✓ PASS: FOR-FROM-TO-DO-ENDFOR compiled");
}

console.log("--- Testing Offs and \\WObj in MoveL ---");
{
  const code = `
  MODULE MainModule
    PROC main()
      MoveL Offs(pHome, 0, 0, 20), v30, fine, tPen \\WObj:=wobj1;
    ENDPROC
  ENDMODULE
  `;
  const res = compile(code);
  assert(!res.error, `Compilation failed: ${res.error}`);
  const moveCmd = res.commands[0];
  assert(moveCmd.type === "move", "Expected move command");
  assert(moveCmd.target === "pHome", "Target should be pHome");
  assert(Array.isArray(moveCmd.targetOffset) && moveCmd.targetOffset[2] === 20, "Offset should be [0, 0, 20]");
  assert(moveCmd.speed === 30, `Speed should be 30, got ${moveCmd.speed}`);
  assert(moveCmd.wobj === "wobj1", "WObj should be wobj1");
  console.log("✓ PASS: MoveL with Offs and \\WObj");
}

console.log("--- Testing DInput and DOutput in expressions ---");
{
  const context = {
    variables: { x: 5 },
    inputs: { b5: true, s1: false },
    outputs: { h1: true },
  };
  const val1 = evaluateExpression("DInput(B5) = 1", context);
  assert(val1 === true, "DInput(B5) = 1 should be true");

  const val2 = evaluateExpression("B5 = 1", context);
  assert(val2 === true, "B5 = 1 should be true");

  const val3 = evaluateExpression("S1 = 1", context);
  assert(val3 === false, "S1 = 1 should be false");

  const val4 = evaluateExpression("DOutput(H1) = 1", context);
  assert(val4 === true, "DOutput(H1) = 1 should be true");
  console.log("✓ PASS: DInput and DOutput signal expression evaluations");
}

console.log("--- Testing all 12 ELM.08 Exam Starter Codes Compilation ---");
{
  const elmTasks = tasks.filter((t) => t.category === "elm08");
  assert(elmTasks.length === 12, `Expected 12 ELM.08 tasks, found ${elmTasks.length}`);

  for (const t of elmTasks) {
    const res = compile(t.starterCode, targets);
    assert(!res.error, `Task ${t.id} failed compilation: ${res.error}`);
    console.log(`  ✓ Task ${t.id} (${t.title.split(":")[0]}) compiled (${res.commands.length} commands)`);
  }
  console.log("✓ PASS: All 12 ELM.08 exam starter programs compiled with 0 errors!");
}

console.log("\nALL RAPID ELM.08 COMPILER TESTS PASSED SUCCESSFULLY!");

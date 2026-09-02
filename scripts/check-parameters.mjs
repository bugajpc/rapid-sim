import { compile, formatTPWrite, evaluateExpression, targets } from "../src/rapid.ts";

function runTest(name, fn) {
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
  } catch (err) {
    console.error(`✗ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// 1. Literal number parameter
runTest("TPWrite literal number with \\Num:=1", () => {
  const code = `
  MODULE MainModule
    PROC main()
      TPWrite "number: " \\Num:=1;
    ENDPROC
  ENDMODULE
  `;
  const result = compile(code);
  if (result.error) throw new Error(result.error);
  if (result.commands.length !== 1) throw new Error(`Expected 1 command, got ${result.commands.length}`);
  const cmd = result.commands[0];
  const output = formatTPWrite(cmd, { variables: result.initialVariables || {}, targetLibrary: targets });
  if (output !== "number: 1") throw new Error(`Expected 'number: 1', got '${output}'`);
});

// 2. Spaces around := and case insensitivity
runTest("TPWrite with spaces around := and \\num:=10", () => {
  const code = `
  MODULE MainModule
    PROC main()
      TPWrite "value: " \\num := 10;
    ENDPROC
  ENDMODULE
  `;
  const result = compile(code);
  if (result.error) throw new Error(result.error);
  const cmd = result.commands[0];
  const output = formatTPWrite(cmd, { variables: result.initialVariables || {}, targetLibrary: targets });
  if (output !== "value: 10") throw new Error(`Expected 'value: 10', got '${output}'`);
});

// 3. Optional comma separator
runTest("TPWrite with comma separator before \\Num", () => {
  const code = `
  MODULE MainModule
    PROC main()
      TPWrite "number: ", \\Num:=42;
    ENDPROC
  ENDMODULE
  `;
  const result = compile(code);
  if (result.error) throw new Error(result.error);
  const cmd = result.commands[0];
  const output = formatTPWrite(cmd, { variables: result.initialVariables || {}, targetLibrary: targets });
  if (output !== "number: 42") throw new Error(`Expected 'number: 42', got '${output}'`);
});

// 4. Variables printed via \\Num:=var
runTest("TPWrite variable printing with \\Num:=nProducedParts", () => {
  const code = `
  MODULE MainModule
    VAR num nProducedParts := 0;

    PROC main()
      TPWrite "count: " \\Num:=nProducedParts;
      Incr nProducedParts;
      TPWrite "count after incr: " \\Num:=nProducedParts;
    ENDPROC
  ENDMODULE
  `;
  const result = compile(code);
  if (result.error) throw new Error(result.error);
  const vars = { ...(result.initialVariables || {}) };
  
  // First TPWrite
  const out1 = formatTPWrite(result.commands[0], { variables: vars, targetLibrary: targets });
  if (out1 !== "count: 0") throw new Error(`Expected 'count: 0', got '${out1}'`);

  // Incr simulation
  const incrCmd = result.commands[1];
  vars[incrCmd.variable.toLowerCase()] = (vars[incrCmd.variable.toLowerCase()] || 0) + 1;

  // Second TPWrite
  const out2 = formatTPWrite(result.commands[2], { variables: vars, targetLibrary: targets });
  if (out2 !== "count after incr: 1") throw new Error(`Expected 'count after incr: 1', got '${out2}'`);
});

// 5. Standalone \\Num:=1 without string
runTest("TPWrite \\Num:=5 standalone", () => {
  const code = `
  MODULE MainModule
    PROC main()
      TPWrite \\Num:=5;
    ENDPROC
  ENDMODULE
  `;
  const result = compile(code);
  if (result.error) throw new Error(result.error);
  const cmd = result.commands[0];
  const output = formatTPWrite(cmd, { variables: result.initialVariables || {}, targetLibrary: targets });
  if (output !== "5") throw new Error(`Expected '5', got '${output}'`);
});

// 6. \\Bool:=TRUE / FALSE
runTest("TPWrite with \\Bool parameter", () => {
  const code = `
  MODULE MainModule
    VAR bool bReady := TRUE;
    PROC main()
      TPWrite "ready: " \\Bool:=bReady;
      TPWrite "false: " \\Bool:=FALSE;
    ENDPROC
  ENDMODULE
  `;
  const result = compile(code);
  if (result.error) throw new Error(result.error);
  const vars = { ...(result.initialVariables || {}) };
  const out1 = formatTPWrite(result.commands[0], { variables: vars, targetLibrary: targets });
  const out2 = formatTPWrite(result.commands[1], { variables: vars, targetLibrary: targets });
  if (out1 !== "ready: TRUE") throw new Error(`Expected 'ready: TRUE', got '${out1}'`);
  if (out2 !== "false: FALSE") throw new Error(`Expected 'false: FALSE', got '${out2}'`);
});

// 7. \\Pos:=pHome parameter
runTest("TPWrite with \\Pos parameter", () => {
  const code = `
  MODULE MainModule
    PROC main()
      TPWrite "Home is " \\Pos:=pHome;
    ENDPROC
  ENDMODULE
  `;
  const result = compile(code);
  if (result.error) throw new Error(result.error);
  const cmd = result.commands[0];
  const output = formatTPWrite(cmd, { variables: result.initialVariables || {}, targetLibrary: targets });
  if (output !== "Home is [0, 490, 530]") throw new Error(`Expected 'Home is [0, 490, 530]', got '${output}'`);
});

// 8. Variable assignment and expressions
runTest("Variable assignment and arithmetic expressions", () => {
  const code = `
  MODULE MainModule
    VAR num x := 10;
    PROC main()
      x := x * 2 + 5;
      TPWrite "x = " \\Num:=x;
    ENDPROC
  ENDMODULE
  `;
  const result = compile(code);
  if (result.error) throw new Error(result.error);
  const vars = { ...(result.initialVariables || {}) };
  const assignCmd = result.commands[0];
  if (assignCmd.type === "assign") {
    vars[assignCmd.variable.toLowerCase()] = evaluateExpression(assignCmd.expr, { variables: vars, targetLibrary: targets });
  }
  const out = formatTPWrite(result.commands[1], { variables: vars, targetLibrary: targets });
  if (out !== "x = 25") throw new Error(`Expected 'x = 25', got '${out}'`);
});

// 9. Multiple Incr and Decr and Clear
runTest("Incr, Decr, Add, Clear instructions", () => {
  const code = `
  MODULE MainModule
    VAR num count := 5;
    PROC main()
      Incr count;
      Incr count \\Step:=3;
      Decr count;
      Add count, 10;
      Clear count;
    ENDPROC
  ENDMODULE
  `;
  const result = compile(code);
  if (result.error) throw new Error(result.error);
  const vars = { ...(result.initialVariables || {}) };
  
  // Incr count (+1 -> 6)
  vars.count += 1;
  if (vars.count !== 6) throw new Error(`Expected 6, got ${vars.count}`);

  // Incr count \Step:=3 (+3 -> 9)
  const step = evaluateExpression(result.commands[1].stepExpr, { variables: vars, targetLibrary: targets });
  vars.count += step;
  if (vars.count !== 9) throw new Error(`Expected 9, got ${vars.count}`);

  // Decr count (-1 -> 8)
  vars.count -= 1;
  if (vars.count !== 8) throw new Error(`Expected 8, got ${vars.count}`);

  // Add count, 10 (+10 -> 18)
  const addVal = evaluateExpression(result.commands[3].expr, { variables: vars, targetLibrary: targets });
  vars.count += addVal;
  if (vars.count !== 18) throw new Error(`Expected 18, got ${vars.count}`);

  // Clear count (-> 0)
  vars.count = 0;
  if (vars.count !== 0) throw new Error(`Expected 0, got ${vars.count}`);
});

console.log("\nAll parameter tests passed successfully!");

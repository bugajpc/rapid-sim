import Editor, { type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { RobotScene } from "./RobotScene";
import { moveCPosition } from "./motion";
import { blankProjectCode, compile, examples, targetNamesInCode, targets, type Command, type ExecutionStatus, type SignalMap, type StudentProject, type ToolKind } from "./rapid";
import { clampToReach, defaultTcp, isReachable, robotReach } from "./robotConfig";

const initialInputs: SignalMap = { diStart: false, diPartPresent: false, diReset: false, diSafetyOk: true };
const initialOutputs: SignalMap = { doReady: false, doGripper: false, doBusy: false, doComplete: false };
const initialPose = defaultTcp;
const initialBlock: [number, number, number] = targets.pGripPick;
const projectsKey = "rapid-sim-student-projects";

function loadProjects(): StudentProject[] {
  try {
    const value = localStorage.getItem(projectsKey);
    return value ? JSON.parse(value) : [];
  } catch { return []; }
}

function Status({ status }: { status: ExecutionStatus }) { return <span className={`status ${status.replaceAll(" ", "-").toLowerCase()}`}>{status}</span>; }

export function App() {
  const [selected, setSelected] = useState(examples[0]);
  const [code, setCode] = useState(examples[0].code);
  const [projectName, setProjectName] = useState("Moj program");
  const [savedProjects, setSavedProjects] = useState<StudentProject[]>(loadProjects);
  const [status, setStatus] = useState<ExecutionStatus>("Ready");
  const [consoleLines, setConsoleLines] = useState<string[]>(["RAPID Sim gotowy. Wybierz lekcje i uruchom program."]);
  const [inputs, setInputs] = useState<SignalMap>(initialInputs);
  const [outputs, setOutputs] = useState<SignalMap>(initialOutputs);
  const [tool, setTool] = useState<ToolKind>("pen");
  const [blockPosition, setBlockPosition] = useState<[number, number, number]>(initialBlock);
  const [blockHeld, setBlockHeld] = useState(false);
  const [blockEditing, setBlockEditing] = useState(false);
  const [tcp, setTcp] = useState<[number, number, number]>(initialPose);
  const [target, setTarget] = useState<string>();
  const [targetPositions, setTargetPositions] = useState<Record<string, [number, number, number]>>(() => ({ ...targets }));
  const [customTargets, setCustomTargets] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>();
  const [tcpEditing, setTcpEditing] = useState(false);
  const [trail, setTrail] = useState<[number, number, number][]>([]);
  const [activeLine, setActiveLine] = useState<number>();
  const [awaiting, setAwaiting] = useState<{ signal: string; value: boolean }>();
  const [simulationWidth, setSimulationWidth] = useState(440);
  const [lessonsOpen, setLessonsOpen] = useState(true);
  const [bottomHeight, setBottomHeight] = useState(235);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; target: string }>();
  const [newTargetPoint, setNewTargetPoint] = useState<[number, number, number]>();
  const [targetName, setTargetName] = useState("");
  const commands = useRef<Command[]>([]);
  const pc = useRef(0);
  const timer = useRef<number>();
  const cancelled = useRef(false);
  const tcpRef = useRef<[number, number, number]>(initialPose);
  const trailRef = useRef<[number, number, number][]>([]);
  const targetPositionsRef = useRef<Record<string, [number, number, number]>>({ ...targets });
  const customTargetsRef = useRef<string[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);
  const toolRef = useRef<ToolKind>("pen");
  const blockHeldRef = useRef(false);
  const blockPositionRef = useRef<[number, number, number]>(initialBlock);
  const monacoEditorRef = useRef<MonacoEditor.IStandaloneCodeEditor>();
  const editorPanelRef = useRef<HTMLElement>(null);

  const log = (message: string) => setConsoleLines((items) => [...items, `> ${message}`]);
  const clearTimer = () => { if (timer.current) { window.clearTimeout(timer.current); window.cancelAnimationFrame(timer.current); } timer.current = undefined; };
  const replaceTrail = (points: [number, number, number][]) => { trailRef.current = points; setTrail(points); };
  const appendTrailPoint = (point: [number, number, number], force = false) => {
    const previous = trailRef.current.at(-1);
    const distance = previous ? Math.hypot(point[0] - previous[0], point[1] - previous[1], point[2] - previous[2]) : Infinity;
    if (!force && distance < 8) return;
    const next = [...trailRef.current.slice(-499), point];
    trailRef.current = next;
    setTrail(next);
  };
  const reset = () => { clearTimer(); cancelled.current = true; pc.current = 0; tcpRef.current = initialPose; blockHeldRef.current = false; blockPositionRef.current = initialBlock; setStatus("Ready"); setInputs(initialInputs); setOutputs(initialOutputs); setTcp(initialPose); setBlockPosition(initialBlock); setBlockHeld(false); setTarget(undefined); setSelectedTarget(undefined); setTcpEditing(false); setBlockEditing(false); replaceTrail([]); setActiveLine(undefined); setAwaiting(undefined); setConsoleLines(["RAPID Sim gotowy. Stan symulacji zresetowany."]); };
  const setBlockAt = (position: [number, number, number]) => { blockPositionRef.current = position; setBlockPosition(position); };
  const setGripperOutput = (closed: boolean) => {
    setOutputs((values) => ({ ...values, doGripper: closed }));
    if (toolRef.current !== "gripper") return;
    if (closed) {
      const current = tcpRef.current;
      const block = blockPositionRef.current;
      const distance = Math.hypot(current[0] - block[0], current[1] - block[1], current[2] - block[2]);
      if (distance <= 70) { blockHeldRef.current = true; setBlockHeld(true); setBlockAt(current); log("Chwytak zamkniety: blok pobrany."); }
      else log("Chwytak zamkniety: brak bloku przy TCP.");
    } else if (blockHeldRef.current) {
      blockHeldRef.current = false; setBlockHeld(false); setBlockAt(tcpRef.current); log("Chwytak otwarty: blok odlozony.");
    }
  };

  const execute = (command: Command) => {
    setActiveLine(command.line);
    if (command.type === "log") { log(command.text); next(); return; }
    if (command.type === "output") {
      if (command.signal === "doGripper") setGripperOutput(command.value);
      else setOutputs((values) => ({ ...values, [command.signal]: command.value }));
      log(`${command.value ? "Set" : "Reset"} ${command.signal}`); next(); return;
    }
    if (command.type === "increment") { log(`Incr ${command.variable}`); next(); return; }
    if (command.type === "clear") { log(`Clear ${command.variable}`); next(); return; }
    if (command.type === "stop") { setStatus("Completed"); log("Program zatrzymany przez Stop."); return; }
    if (command.type === "waitInput") {
      if (inputs[command.signal] === command.value) { next(); return; }
      setAwaiting({ signal: command.signal, value: command.value }); setStatus("Waiting for DI"); log(`Oczekiwanie: ${command.signal} = ${command.value ? 1 : 0}`); return;
    }
    if (command.type === "wait") { timer.current = window.setTimeout(next, command.seconds * 1000); return; }
    if (command.type === "move") {
      setTarget(command.target);
      const destination = targetPositionsRef.current[command.target];
      const start = tcpRef.current;
      const started = performance.now();
      const duration = command.kind === "MoveJ" ? 650 : 950;
      const animate = (now: number) => {
        if (cancelled.current) return;
        const ratio = Math.min((now - started) / duration, 1);
        const smooth = ratio * ratio * (3 - 2 * ratio);
        const position = command.kind === "MoveC" && command.via
          ? moveCPosition(start, targetPositionsRef.current[command.via], destination, smooth)
          : [start[0] + (destination[0] - start[0]) * smooth, start[1] + (destination[1] - start[1]) * smooth, start[2] + (destination[2] - start[2]) * smooth] as [number, number, number];
        tcpRef.current = position; setTcp(position); if (blockHeldRef.current) setBlockAt(position); appendTrailPoint(position, ratio === 1);
        if (ratio < 1) timer.current = window.requestAnimationFrame(animate); else { log(`${command.kind} ${command.target}`); next(); }
      };
      timer.current = window.requestAnimationFrame(animate);
    }
  };
  const next = () => {
    if (cancelled.current) return;
    const command = commands.current[pc.current++];
    if (!command) { setStatus("Completed"); setActiveLine(undefined); log("Program zakonczony."); return; }
    execute(command);
  };
  const run = () => {
    const result = compile(code, targetPositionsRef.current);
    if (result.error) { setStatus("Error"); log(`BLAD: ${result.error}`); return; }
    clearTimer(); cancelled.current = false; commands.current = result.commands; pc.current = 0; replaceTrail([tcpRef.current]); setStatus("Running"); log("--- Uruchomiono program ---"); next();
  };
  const stop = () => { clearTimer(); cancelled.current = true; setStatus("Paused"); log("Wykonanie wstrzymane."); };
  const selectExample = (example: typeof examples[number]) => { reset(); setSelected(example); setCode(example.code); };
  const visibleTargets = [...new Set([...targetNamesInCode(code, targetPositions), ...customTargets])];
  const moveTarget = (name: string, position: [number, number, number]) => {
    if (!isReachable(position)) {
      log(`${name} nie zostal zmieniony: punkt jest poza zasiegiem robota.`);
      return false;
    }
    const next = { ...targetPositionsRef.current, [name]: position };
    targetPositionsRef.current = next;
    setTargetPositions(next);
    return true;
  };
  const createTarget = () => {
    const name = targetName.trim();
    const position = newTargetPoint;
    if (!position || !/^[A-Za-z_]\w*$/.test(name)) { log("Nazwa punktu musi zaczynac sie od litery lub _. "); return; }
    if (targetPositionsRef.current[name]) { log(`Punkt ${name} juz istnieje.`); return; }
    const constrained = clampToReach(position);
    const nextTargets = { ...targetPositionsRef.current, [name]: constrained };
    targetPositionsRef.current = nextTargets;
    customTargetsRef.current = [...customTargetsRef.current, name];
    setTargetPositions(nextTargets);
    setCustomTargets(customTargetsRef.current);
    setSelectedTarget(name);
    setNewTargetPoint(undefined);
    setTargetName("");
    log(`Dodano punkt ${name} = [${constrained.map((value) => Math.round(value)).join(", ")}] mm.`);
  };
  const removeTarget = (name: string) => {
    if (!customTargetsRef.current.includes(name)) { log(`Nie mozna usunac wbudowanego punktu ${name}.`); setContextMenu(undefined); return; }
    const { [name]: _removed, ...remaining } = targetPositionsRef.current;
    targetPositionsRef.current = remaining;
    customTargetsRef.current = customTargetsRef.current.filter((item) => item !== name);
    setTargetPositions(remaining);
    setCustomTargets(customTargetsRef.current);
    if (selectedTarget === name) setSelectedTarget(undefined);
    setContextMenu(undefined);
    log(`Usunieto punkt ${name}.`);
  };
  const openNewTargetDialog = () => {
    setTargetName("");
    setNewTargetPoint(tcpRef.current);
  };
  const projectSnapshot = (): StudentProject => ({ version: 1, name: projectName.trim() || "Moj program", code, targets: targetPositionsRef.current, customTargets: customTargetsRef.current, savedAt: new Date().toISOString() });
  const saveProject = () => {
    const project = projectSnapshot();
    const next = [project, ...savedProjects.filter((item) => item.name !== project.name)];
    localStorage.setItem(projectsKey, JSON.stringify(next));
    setSavedProjects(next);
    log(`Zapisano projekt: ${project.name}.`);
  };
  const loadProject = (project: StudentProject) => {
    reset();
    const importedTargets = { ...targets, ...project.targets };
    targetPositionsRef.current = importedTargets;
    customTargetsRef.current = project.customTargets ?? [];
    setProjectName(project.name);
    setCode(project.code);
    setTargetPositions(importedTargets);
    setCustomTargets(customTargetsRef.current);
    log(`Wczytano projekt: ${project.name}.`);
  };
  const newProject = () => {
    reset();
    targetPositionsRef.current = { ...targets };
    customTargetsRef.current = [];
    setProjectName("Moj program");
    setCode(blankProjectCode);
    setTargetPositions({ ...targets });
    setCustomTargets([]);
    log("Utworzono nowy projekt ucznia.");
  };
  const exportProject = () => {
    const file = new Blob([JSON.stringify(projectSnapshot(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${(projectName.trim() || "rapid-project").replace(/[^a-z0-9_-]/gi, "-")}.rapid-sim.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  const importProject = async (file?: File) => {
    if (!file) return;
    try {
      const project = JSON.parse(await file.text()) as StudentProject;
      if (project.version !== 1 || typeof project.name !== "string" || typeof project.code !== "string" || !project.targets || !Array.isArray(project.customTargets)) throw new Error("Nieprawidlowy plik projektu.");
      loadProject(project);
    } catch (error) { log(`BLAD importu: ${error instanceof Error ? error.message : "nieznany plik"}`); }
  };
  const moveTcp = (position: [number, number, number]) => {
    clearTimer();
    cancelled.current = true;
    tcpRef.current = position;
    setTcp(position);
    if (blockHeldRef.current) setBlockAt(position);
    setTarget(undefined);
    setStatus("Ready");
    replaceTrail([]);
  };
  const changeTool = (nextTool: ToolKind) => {
    if (nextTool === toolRef.current) return;
    clearTimer();
    cancelled.current = true;
    toolRef.current = nextTool;
    blockHeldRef.current = false;
    setTool(nextTool);
    setBlockEditing(false);
    setBlockHeld(false);
    setOutputs((values) => ({ ...values, doGripper: false }));
    setStatus("Ready");
    replaceTrail([]);
    log(`Wybrano narzedzie: ${nextTool === "pen" ? "tPen" : "tGripper"}.`);
  };
  const editorMount: OnMount = (editor, monaco) => {
    monacoEditorRef.current = editor;
    monaco.languages.register({ id: "rapid" });
    monaco.languages.setMonarchTokensProvider("rapid", {
      keywords: ["MODULE", "ENDMODULE", "PROC", "ENDPROC", "VAR", "PERS", "CONST", "IF", "THEN", "ELSE", "ENDIF", "WHILE", "DO", "ENDWHILE", "FOR", "FROM", "TO", "ENDFOR"],
      instructions: ["MoveJ", "MoveL", "MoveC", "Set", "Reset", "WaitDI", "WaitTime", "TPWrite", "Incr", "Clear", "Stop"],
      tokenizer: {
        root: [
          [/!.*/, "comment"],
          [/".*?"/, "string"],
          [/[a-zA-Z_][\w]*/, { cases: { "@keywords": "keyword", "@instructions": "type", "@default": "identifier" } }],
          [/\d+/, "number"],
        ],
      },
    });
    monaco.editor.setModelLanguage(editor.getModel()!, "rapid");
  };
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const panel = editorPanelRef.current;
      if (!panel || !monacoEditorRef.current) return;
      monacoEditorRef.current.layout({ width: panel.clientWidth, height: Math.max(0, panel.clientHeight - 38) });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [simulationWidth, lessonsOpen, bottomHeight]);
  useEffect(() => {
    if (status === "Waiting for DI" && awaiting && inputs[awaiting.signal] === awaiting.value) { setAwaiting(undefined); setStatus("Running"); next(); }
  }, [inputs, awaiting, status]);
  useEffect(() => () => clearTimer(), []);

  const startResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = simulationWidth;
    const onMove = (moveEvent: PointerEvent) => {
      const lessonsWidth = lessonsOpen ? 212 : 38;
      const maxWidth = Math.max(300, window.innerWidth - lessonsWidth - 320 - 6);
      setSimulationWidth(Math.min(maxWidth, Math.max(300, startWidth - (moveEvent.clientX - startX))));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };
  const startBottomResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const startY = event.clientY;
    const startHeight = bottomHeight;
    const onMove = (moveEvent: PointerEvent) => {
      const maxHeight = Math.max(180, window.innerHeight - 52 - 6 - 260);
      setBottomHeight(Math.min(maxHeight, Math.max(180, startHeight - (moveEvent.clientY - startY))));
    };
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  return <main style={{ gridTemplateRows: `52px minmax(0, 1fr) 6px ${bottomHeight}px` }}>
    <header><div className="brand"><span className="brand-dot">R</span><strong>RAPID Sim</strong><span className="robot-label">ABB IRB 1090 <i>·</i> OmniCore learning simulator</span></div><div className="controls"><div className="tool-switch" aria-label="Wybierz narzedzie"><button className={tool === "pen" ? "active" : ""} onClick={() => changeTool("pen")}>Pen</button><button className={tool === "gripper" ? "active" : ""} onClick={() => changeTool("gripper")}>Gripper</button></div><Status status={status} /><button className="primary" onClick={run}>Run</button><button onClick={stop}>Pause</button><button onClick={reset}>Reset</button></div></header>
    <section className="workspace" style={{ gridTemplateColumns: `${lessonsOpen ? "212px" : "38px"} minmax(300px, 1fr) 6px ${simulationWidth}px` }}>
      <aside className={`lessons ${lessonsOpen ? "" : "collapsed"}`}><button className="lesson-collapse" onClick={() => setLessonsOpen((open) => !open)} aria-label={lessonsOpen ? "Zwin lekcje" : "Rozwin lekcje"}>{lessonsOpen ? "‹" : "›"}</button>{lessonsOpen && <><div className="project-actions"><input value={projectName} onChange={(event) => setProjectName(event.target.value)} aria-label="Nazwa projektu" /><div><button onClick={newProject}>New</button><button onClick={saveProject}>Save</button></div><div><button onClick={exportProject}>Export</button><button onClick={() => importInputRef.current?.click()}>Import</button></div><input ref={importInputRef} className="file-input" type="file" accept="application/json" onChange={(event) => { void importProject(event.target.files?.[0]); event.currentTarget.value = ""; }} /></div><div className="panel-title">LEKCJE <span>{examples.length}</span></div>{examples.map((example) => <button className={`lesson ${selected.id === example.id ? "selected" : ""}`} key={example.id} onClick={() => selectExample(example)}><small>{example.topic}</small><b>{example.title}</b></button>)}{savedProjects.length > 0 && <><div className="panel-title saved-title">ZAPISANE</div>{savedProjects.map((project) => <button className="lesson saved-project" key={project.name} onClick={() => loadProject(project)}><small>{new Date(project.savedAt).toLocaleDateString("pl-PL")}</small><b>{project.name}</b></button>)}</>}<div className="notice"><b>Symulacja edukacyjna</b><p>Nie uruchamiaj tego kodu na prawdziwym robocie bez walidacji i procedur bezpieczenstwa.</p></div></>}</aside>
       <section className="editor-panel" ref={editorPanelRef}><div className="panel-head"><div><span className="file-dot" /> MainModule.mod</div><span>RAPID</span></div><Editor height="100%" value={code} onChange={(value) => setCode(value ?? "")} onMount={editorMount} theme="vs-dark" options={{ automaticLayout: true, fontSize: 14, minimap: { enabled: false }, lineNumbers: "on", scrollBeyondLastLine: false, padding: { top: 14 }, fontFamily: "SFMono-Regular, Consolas, monospace" }} /></section>
      <div className="resize-handle" onPointerDown={startResize} role="separator" aria-label="Zmien szerokosc widoku symulacji" aria-orientation="vertical" />
        <section className="sim-panel"><div className="panel-head"><div>3D SIMULATION</div><div className="sim-head-actions"><button onClick={openNewTargetDialog}>Add point at TCP</button><span>TCP {tcp.map((value) => Math.round(value)).join(" / ")} mm</span></div></div><div className="canvas"><RobotScene tcp={tcp} target={target} trail={trail} targets={targetPositions} visibleTargets={visibleTargets} selectedTarget={selectedTarget} tcpEditing={tcpEditing} onSelectTarget={(name) => { setTcpEditing(false); setBlockEditing(false); setSelectedTarget(name); }} onSelectTcp={() => { setSelectedTarget(undefined); setBlockEditing(false); setTcpEditing(true); }} onMoveTarget={moveTarget} onMoveTcp={moveTcp} tool={tool} gripperClosed={outputs.doGripper} fadeWhileRunning={status !== "Running"} blockPosition={blockPosition} blockHeld={blockHeld} blockEditing={blockEditing} onSelectBlock={() => { setSelectedTarget(undefined); setTcpEditing(false); setBlockEditing(true); }} onMoveBlock={setBlockAt} onTargetContextMenu={(screenPosition, name) => setContextMenu({ ...screenPosition, target: name })} /></div><div className="sim-footer"><div className="sim-info"><span className="sim-tool"><b>Tool</b> {tool === "pen" ? "tPen" : "tGripper"}</span><span className="sim-target"><b>Target</b> {target ?? "-"}</span><span className="sim-line"><b>Line</b> {activeLine ?? "-"}</span><span className="sim-reach"><b>Reach</b> {robotReach.minimum}-{robotReach.maximum} mm</span>{selectedTarget && <span className="sim-edit"><b>Edit</b> {selectedTarget} [{targetPositions[selectedTarget].map((value) => Math.round(value)).join(", ")}]</span>}{tcpEditing && <span className="sim-edit"><b>Edit</b> TCP</span>}{blockEditing && <span className="sim-edit"><b>Edit</b> block [{blockPosition.map((value) => Math.round(value)).join(", ")}]</span>}<span className="legend">right-click a custom point to remove</span></div></div></section>
    </section>
    <div className="bottom-resize-handle" onPointerDown={startBottomResize} role="separator" aria-label="Zmien wysokosc konsoli i sygnalow" aria-orientation="horizontal" />
    <section className="bottom"><div className="console"><div className="tabs"><b>CONSOLE</b><span>DEBUGGER</span></div><div className="terminal">{consoleLines.map((line, index) => <div key={`${line}-${index}`} className={line.includes("BLAD") ? "error-text" : ""}>{line}</div>)}</div></div><div className="signals"><div className="tabs"><b>SIGNALS</b><span>{awaiting ? `WAITING: ${awaiting.signal}` : "I/O BOARD"}</span></div><div className="signal-groups"><SignalGroup title="DIGITAL INPUTS" signals={inputs} waiting={awaiting?.signal} onToggle={(name) => setInputs((values) => ({ ...values, [name]: !values[name] }))} /><SignalGroup title="DIGITAL OUTPUTS" signals={outputs} enabledSignals={["doGripper"]} onToggle={() => setGripperOutput(!outputs.doGripper)} /></div></div>
    {contextMenu && <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }} onContextMenu={(event) => event.preventDefault()}><b>{contextMenu.target}</b><button disabled={!customTargets.includes(contextMenu.target)} onClick={() => removeTarget(contextMenu.target)}>Remove point</button>{!customTargets.includes(contextMenu.target) && <small>Wbudowany punkt nie moze zostac usuniety.</small>}</div>}
    {newTargetPoint && <div className="target-dialog-backdrop" onMouseDown={() => setNewTargetPoint(undefined)}><div className="target-dialog" role="dialog" aria-modal="true" aria-label="Dodaj punkt" onMouseDown={(event) => event.stopPropagation()}><b>Add point at TCP</b><small>[{newTargetPoint.map((value) => Math.round(value)).join(", ")}] mm</small><label>Name<input autoFocus value={targetName} onChange={(event) => setTargetName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createTarget(); if (event.key === "Escape") setNewTargetPoint(undefined); }} placeholder="pCustom" /></label><div><button onClick={() => setNewTargetPoint(undefined)}>Cancel</button><button className="confirm" onClick={createTarget}>Add point</button></div></div></div>}
    </section>
  </main>;
}

function SignalGroup({ title, signals, waiting, onToggle, enabledSignals }: { title: string; signals: SignalMap; waiting?: string; onToggle?: (name: string) => void; enabledSignals?: string[] }) { return <div className="signal-group"><small>{title}</small>{Object.entries(signals).map(([name, value]) => <button disabled={!onToggle || (enabledSignals !== undefined && !enabledSignals.includes(name))} onClick={() => onToggle?.(name)} className={`signal ${value ? "on" : ""} ${waiting === name ? "waiting" : ""}`} key={name}><span className="led" />{name}<b>{value ? "1" : "0"}</b></button>)}</div>; }

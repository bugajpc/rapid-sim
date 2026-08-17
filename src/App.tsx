import Editor, { type Monaco, type OnMount } from "@monaco-editor/react";
import type { editor as MonacoEditorType } from "monaco-editor";
import { useEffect, useRef, useState } from "react";
import { RobotScene } from "./RobotScene";
import { moveCPosition } from "./motion";
import { blankProjectCode, compile, examples, tasks, targetNamesInCode, targets, type Command, type ExecutionStatus, type SignalMap, type StudentProject, type Task, type ToolKind } from "./rapid";
import { clampToReach, defaultTablePosition, defaultTcp, getFloorZ, isReachable, robotReach, tableConfig, type BlockItem, type SceneSnapshot } from "./robotConfig";

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
  const [sidebarTab, setSidebarTab] = useState<"lessons" | "tasks">("lessons");
  const [selected, setSelected] = useState(examples[0]);
  const [selectedTask, setSelectedTask] = useState<Task>();
  const [code, setCode] = useState(examples[0].code);
  const [projectName, setProjectName] = useState("Moj program");
  const [savedProjects, setSavedProjects] = useState<StudentProject[]>(loadProjects);
  const [status, setStatus] = useState<ExecutionStatus>("Ready");
  const [consoleLines, setConsoleLines] = useState<string[]>(["RAPID Sim gotowy. Wybierz lekcje lub zadanie i uruchom program."]);
  const [inputs, setInputs] = useState<SignalMap>(initialInputs);
  const [outputs, setOutputs] = useState<SignalMap>(initialOutputs);
  const [tool, setTool] = useState<ToolKind>("pen");
  const [showTable, setShowTable] = useState(true);
  const [tablePosition, setTablePosition] = useState<[number, number]>(defaultTablePosition);
  const [tableEditing, setTableEditing] = useState(false);
  const [blocks, setBlocks] = useState<BlockItem[]>([{ id: "block-1", position: initialBlock }]);
  const [heldBlockId, setHeldBlockId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [tcp, setTcp] = useState<[number, number, number]>(initialPose);
  const [target, setTarget] = useState<string>();
  const [targetPositions, setTargetPositions] = useState<Record<string, [number, number, number]>>(() => ({ ...targets }));
  const [customTargets, setCustomTargets] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>();
  const [tcpEditing, setTcpEditing] = useState(false);
  const [tcpPitch, setTcpPitch] = useState<number>(-90);
  const [trail, setTrail] = useState<[number, number, number][]>([]);
  const [activeLine, setActiveLine] = useState<number>();
  const [awaiting, setAwaiting] = useState<{ signal: string; value: boolean }>();
  const [simulationWidth, setSimulationWidth] = useState(440);
  const [lessonsOpen, setLessonsOpen] = useState(true);
  const [bottomHeight, setBottomHeight] = useState(235);
  const [contextMenu, setContextMenu] = useState<
    | { type: "target"; x: number; y: number; target: string }
    | { type: "block"; x: number; y: number; id: string }
  >();
  const [newTargetPoint, setNewTargetPoint] = useState<[number, number, number]>();
  const [targetName, setTargetName] = useState("");
  const commands = useRef<Command[]>([]);
  const pc = useRef(0);
  const timer = useRef<number>();
  const dropTimers = useRef<Record<string, number>>({});
  const showTableRef = useRef(true);
  const tablePositionRef = useRef<[number, number]>(defaultTablePosition);
  const cancelled = useRef(false);
  const tcpRef = useRef<[number, number, number]>(initialPose);
  const tcpPitchRef = useRef<number>(-90);
  const trailRef = useRef<[number, number, number][]>([]);
  const targetPositionsRef = useRef<Record<string, [number, number, number]>>({ ...targets });
  const customTargetsRef = useRef<string[]>([]);
  const importInputRef = useRef<HTMLInputElement>(null);
  const toolRef = useRef<ToolKind>("pen");
  const heldBlockIdRef = useRef<string | null>(null);
  const blocksRef = useRef<BlockItem[]>([{ id: "block-1", position: initialBlock }]);
  const undoStackRef = useRef<SceneSnapshot[]>([]);
  const redoStackRef = useRef<SceneSnapshot[]>([]);
  const monacoRef = useRef<Monaco>();
  const monacoEditorRef = useRef<MonacoEditorType.IStandaloneCodeEditor>();
  const editorPanelRef = useRef<HTMLElement>(null);

  const clearEditorMarkers = () => {
    if (!monacoEditorRef.current || !monacoRef.current) return;
    const model = monacoEditorRef.current.getModel();
    if (model) {
      monacoRef.current.editor.setModelMarkers(model, "rapid", []);
    }
  };

  const setEditorErrorMarker = (line: number, message: string) => {
    if (!monacoEditorRef.current || !monacoRef.current) return;
    const model = monacoEditorRef.current.getModel();
    if (model) {
      monacoRef.current.editor.setModelMarkers(model, "rapid", [
        {
          startLineNumber: line,
          startColumn: 1,
          endLineNumber: line,
          endColumn: 1000,
          message,
          severity: 8, // MarkerSeverity.Error
        },
      ]);
    }
  };

  const handleCodeChange = (value?: string) => {
    setCode(value ?? "");
    clearEditorMarkers();
  };

  const log = (message: string) => setConsoleLines((items) => [...items, `> ${message}`]);
  const clearTimer = () => { if (timer.current) { window.clearTimeout(timer.current); window.cancelAnimationFrame(timer.current); } timer.current = undefined; };
  const clearAllDropTimers = () => {
    Object.values(dropTimers.current).forEach((timerId) => window.cancelAnimationFrame(timerId));
    dropTimers.current = {};
  };
  const clearBlockDropTimer = (id: string) => {
    if (dropTimers.current[id]) {
      window.cancelAnimationFrame(dropTimers.current[id]);
      delete dropTimers.current[id];
    }
  };
  const updateUndoRedoState = () => {
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(redoStackRef.current.length > 0);
  };
  const captureSceneSnapshot = (): SceneSnapshot => ({
    targets: { ...targetPositionsRef.current },
    customTargets: [...customTargetsRef.current],
    tcp: [...tcpRef.current],
    tcpPitch: tcpPitchRef.current,
    tool: toolRef.current,
    showTable: showTableRef.current,
    tablePosition: [...tablePositionRef.current],
    blocks: blocksRef.current.map((b) => ({ ...b, position: [...b.position] })),
  });
  const pushSceneSnapshot = () => {
    const snapshot = captureSceneSnapshot();
    undoStackRef.current.push(snapshot);
    if (undoStackRef.current.length > 50) undoStackRef.current.shift();
    redoStackRef.current = [];
    updateUndoRedoState();
  };
  const restoreSceneSnapshot = (snapshot: SceneSnapshot) => {
    clearTimer();
    clearAllDropTimers();
    cancelled.current = true;
    targetPositionsRef.current = { ...snapshot.targets };
    setTargetPositions({ ...snapshot.targets });
    customTargetsRef.current = [...snapshot.customTargets];
    setCustomTargets([...snapshot.customTargets]);
    tcpRef.current = [...snapshot.tcp];
    setTcp([...snapshot.tcp]);
    if (snapshot.tcpPitch !== undefined) {
      tcpPitchRef.current = snapshot.tcpPitch;
      setTcpPitch(snapshot.tcpPitch);
    }
    toolRef.current = snapshot.tool;
    setTool(snapshot.tool);
    showTableRef.current = snapshot.showTable;
    setShowTable(snapshot.showTable);
    tablePositionRef.current = [...snapshot.tablePosition];
    setTablePosition([...snapshot.tablePosition]);
    const restoredBlocks = snapshot.blocks.map((b) => ({ ...b, position: [...b.position] as [number, number, number] }));
    blocksRef.current = restoredBlocks;
    setBlocks(restoredBlocks);
    heldBlockIdRef.current = null;
    setHeldBlockId(null);
    setSelectedBlockId(null);
    setSelectedTarget(undefined);
    setTcpEditing(false);
    setTableEditing(false);
    setOutputs((values) => ({ ...values, doGripper: false }));
    replaceTrail([]);
  };
  const undo = () => {
    if (undoStackRef.current.length === 0) return;
    const current = captureSceneSnapshot();
    const previous = undoStackRef.current.pop()!;
    redoStackRef.current.push(current);
    restoreSceneSnapshot(previous);
    updateUndoRedoState();
    log("Cofnieto zmiane w scenie (Undo).");
  };
  const redo = () => {
    if (redoStackRef.current.length === 0) return;
    const current = captureSceneSnapshot();
    const next = redoStackRef.current.pop()!;
    undoStackRef.current.push(current);
    restoreSceneSnapshot(next);
    updateUndoRedoState();
    log("Ponowiono zmiane w scenie (Redo).");
  };

  const replaceTrail = (points: [number, number, number][]) => { trailRef.current = points; setTrail(points); };
  const appendTrailPoint = (point: [number, number, number], force = false) => {
    const previous = trailRef.current.at(-1);
    const distance = previous ? Math.hypot(point[0] - previous[0], point[1] - previous[1], point[2] - previous[2]) : Infinity;
    if (!force && distance < 8) return;
    const next = [...trailRef.current.slice(-499), point];
    trailRef.current = next;
    setTrail(next);
  };
  const reset = () => {
    clearTimer();
    clearAllDropTimers();
    cancelled.current = true;
    pc.current = 0;
    tcpRef.current = initialPose;
    heldBlockIdRef.current = null;
    const resetBlocks: BlockItem[] = [{ id: "block-1", position: initialBlock }];
    blocksRef.current = resetBlocks;
    tablePositionRef.current = defaultTablePosition;
    setTablePosition(defaultTablePosition);
    setTableEditing(false);
    setStatus("Ready");
    setInputs(initialInputs);
    setOutputs(initialOutputs);
    setTcp(initialPose);
    tcpPitchRef.current = -90;
    setTcpPitch(-90);
    setBlocks(resetBlocks);
    setHeldBlockId(null);
    setSelectedBlockId(null);
    setTarget(undefined);
    setSelectedTarget(undefined);
    setTcpEditing(false);
    replaceTrail([]);
    setActiveLine(undefined);
    setAwaiting(undefined);
    undoStackRef.current = [];
    redoStackRef.current = [];
    updateUndoRedoState();
    setConsoleLines(["RAPID Sim gotowy. Stan symulacji zresetowany."]);
  };
  const updateBlockPosition = (id: string, position: [number, number, number]) => {
    const next = blocksRef.current.map((b) => (b.id === id ? { ...b, position } : b));
    blocksRef.current = next;
    setBlocks(next);
  };
  const dropBlock = (blockId: string) => {
    clearBlockDropTimer(blockId);
    const gravity = 9810;
    const restitution = 0.2;
    let vz = 0;
    let lastTime = performance.now();
    const step = (now: number) => {
      if (heldBlockIdRef.current === blockId) return;
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      const block = blocksRef.current.find((b) => b.id === blockId);
      if (!block) {
        delete dropTimers.current[blockId];
        return;
      }
      const [bx, by, bz] = block.position;
      const floorZ = getFloorZ(bx, by, showTableRef.current, tablePositionRef.current);
      vz -= gravity * dt;
      let nextZ = bz + vz * dt;
      if (nextZ <= floorZ) {
        nextZ = floorZ;
        if (Math.abs(vz) > 200) {
          vz = -vz * restitution;
        } else {
          vz = 0;
          updateBlockPosition(blockId, [bx, by, floorZ]);
          delete dropTimers.current[blockId];
          return;
        }
      }
      updateBlockPosition(blockId, [bx, by, nextZ]);
      dropTimers.current[blockId] = window.requestAnimationFrame(step);
    };
    dropTimers.current[blockId] = window.requestAnimationFrame(step);
  };

  const getSpawnPosition = (index: number): [number, number, number] => {
    if (showTableRef.current) {
      const [tableX, tableY] = tablePositionRef.current;
      const holeCols = [-270, -180, -90, 0, 90, 180, 270];
      const holeRows = [135, 45, -45, -135];
      const col = index % holeCols.length;
      const row = Math.floor(index / holeCols.length) % holeRows.length;
      return [tableX + holeCols[col], tableY + holeRows[row], tableConfig.topZ + 35];
    }
    const col = index % 5;
    const row = Math.floor(index / 5);
    return [-160 + col * 80, 300 + row * 80, 35];
  };

  const addBlock = () => {
    pushSceneSnapshot();
    const nextIndex = blocksRef.current.length;
    const spawnPos = getSpawnPosition(nextIndex);
    const newBlock: BlockItem = {
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      position: spawnPos,
    };
    const next = [...blocksRef.current, newBlock];
    blocksRef.current = next;
    setBlocks(next);
    setSelectedBlockId(newBlock.id);
    setSelectedTarget(undefined);
    setTcpEditing(false);
    setTableEditing(false);
    log(`Dodano blok #${next.length} w [${spawnPos.map((v) => Math.round(v)).join(", ")}] mm.`);
  };

  const setBlockCount = (count: number) => {
    const targetCount = Math.max(0, Math.min(28, count));
    const current = blocksRef.current;
    if (targetCount === current.length) return;
    pushSceneSnapshot();
    if (targetCount > current.length) {
      const next = [...current];
      for (let i = current.length; i < targetCount; i++) {
        next.push({
          id: `block-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
          position: getSpawnPosition(i),
        });
      }
      blocksRef.current = next;
      setBlocks(next);
      log(`Ustawiono liczbe blokow: ${next.length}.`);
    } else {
      const next = current.slice(0, targetCount);
      if (heldBlockIdRef.current && !next.some((b) => b.id === heldBlockIdRef.current)) {
        heldBlockIdRef.current = null;
        setHeldBlockId(null);
      }
      if (selectedBlockId && !next.some((b) => b.id === selectedBlockId)) {
        setSelectedBlockId(null);
      }
      blocksRef.current = next;
      setBlocks(next);
      log(`Ustawiono liczbe blokow: ${next.length}.`);
    }
  };

  const removeBlock = (id: string) => {
    pushSceneSnapshot();
    clearBlockDropTimer(id);
    if (heldBlockIdRef.current === id) {
      heldBlockIdRef.current = null;
      setHeldBlockId(null);
    }
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
    const next = blocksRef.current.filter((b) => b.id !== id);
    blocksRef.current = next;
    setBlocks(next);
    setContextMenu(undefined);
    log("Usunieto blok.");
  };

  const setGripperOutput = (closed: boolean) => {
    setOutputs((values) => ({ ...values, doGripper: closed }));
    if (toolRef.current !== "gripper") return;
    if (closed) {
      clearAllDropTimers();
      const current = tcpRef.current;
      let closest: BlockItem | null = null;
      let minDist = Infinity;
      for (const b of blocksRef.current) {
        const d = Math.hypot(current[0] - b.position[0], current[1] - b.position[1], current[2] - b.position[2]);
        if (d < minDist) {
          minDist = d;
          closest = b;
        }
      }
      if (closest && minDist <= 70) {
        clearBlockDropTimer(closest.id);
        heldBlockIdRef.current = closest.id;
        setHeldBlockId(closest.id);
        updateBlockPosition(closest.id, current);
        log("Chwytak zamkniety: blok pobrany.");
      } else {
        log("Chwytak zamkniety: brak bloku przy TCP.");
      }
    } else if (heldBlockIdRef.current) {
      const releasedId = heldBlockIdRef.current;
      heldBlockIdRef.current = null;
      setHeldBlockId(null);
      log("Chwytak otwarty: blok odlozony.");
      dropBlock(releasedId);
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
        tcpRef.current = position; setTcp(position); if (heldBlockIdRef.current) updateBlockPosition(heldBlockIdRef.current, position); appendTrailPoint(position, ratio === 1);
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
    if (result.error) {
      if (result.errorLine) setEditorErrorMarker(result.errorLine, result.error);
      setStatus("Error");
      log(`BLAD: ${result.error}`);
      return;
    }
    clearEditorMarkers();
    clearTimer();
    cancelled.current = false;
    commands.current = result.commands;
    pc.current = 0;
    replaceTrail([tcpRef.current]);
    setStatus("Running");
    log("--- Uruchomiono program ---");
    next();
  };
  const stop = () => { clearTimer(); cancelled.current = true; setStatus("Paused"); log("Wykonanie wstrzymane."); };
  const selectExample = (example: typeof examples[number]) => {
    reset();
    undoStackRef.current = [];
    redoStackRef.current = [];
    updateUndoRedoState();
    clearEditorMarkers();
    setSelectedTask(undefined);
    setSelected(example);
    setCode(example.code);
  };
  const selectTask = (task: Task) => {
    reset();
    undoStackRef.current = [];
    redoStackRef.current = [];
    updateUndoRedoState();
    clearEditorMarkers();
    setSelectedTask(task);
    setCode(task.starterCode);
    if (task.tool !== toolRef.current) {
      changeTool(task.tool);
    }
    log(`Wybrano zadanie: ${task.title}. Przeczytaj wskazowki i uzupelnij kod programu.`);
  };
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
    const lowerName = name.toLowerCase();
    if (Object.keys(targetPositionsRef.current).some((k) => k.toLowerCase() === lowerName)) {
      log(`Punkt o nazwie „${name}” juz istnieje.`);
      return;
    }
    pushSceneSnapshot();
    const constrained = clampToReach(position);
    const clampedZ = Math.max(10, constrained[2]);
    const finalPoint: [number, number, number] = [constrained[0], constrained[1], clampedZ];
    const nextTargets = { ...targetPositionsRef.current, [name]: finalPoint };
    targetPositionsRef.current = nextTargets;
    customTargetsRef.current = [...customTargetsRef.current, name];
    setTargetPositions(nextTargets);
    setCustomTargets(customTargetsRef.current);
    setSelectedTarget(name);
    setNewTargetPoint(undefined);
    setTargetName("");
    log(`Dodano punkt ${name} = [${finalPoint.map((value) => Math.round(value)).join(", ")}] mm.`);
  };
  const removeTarget = (name: string) => {
    if (!targetPositionsRef.current[name]) {
      setContextMenu(undefined);
      return;
    }
    pushSceneSnapshot();
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
  const projectSnapshot = (): StudentProject => ({
    version: 2,
    name: projectName.trim() || "Moj program",
    code,
    targets: targetPositionsRef.current,
    customTargets: customTargetsRef.current,
    savedAt: new Date().toISOString(),
    tool: toolRef.current,
    showTable: showTableRef.current,
    tablePosition: tablePositionRef.current,
    blocks: blocksRef.current,
    tcp: tcpRef.current,
    tcpPitch: tcpPitchRef.current,
  });
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
    setSelectedTask(undefined);
    setProjectName(project.name);
    setCode(project.code);
    setTargetPositions(importedTargets);
    setCustomTargets(customTargetsRef.current);

    if (project.tool) {
      toolRef.current = project.tool;
      setTool(project.tool);
    }
    if (project.showTable !== undefined) {
      showTableRef.current = project.showTable;
      setShowTable(project.showTable);
    }
    if (project.tablePosition) {
      tablePositionRef.current = project.tablePosition;
      setTablePosition(project.tablePosition);
    }
    if (project.blocks && Array.isArray(project.blocks)) {
      blocksRef.current = project.blocks;
      setBlocks(project.blocks);
    }
    if (project.tcp) {
      tcpRef.current = project.tcp;
      setTcp(project.tcp);
    }
    if (project.tcpPitch !== undefined) {
      tcpPitchRef.current = project.tcpPitch;
      setTcpPitch(project.tcpPitch);
    }
    undoStackRef.current = [];
    redoStackRef.current = [];
    updateUndoRedoState();
    clearEditorMarkers();
    log(`Wczytano projekt: ${project.name}.`);
  };
  const newProject = () => {
    reset();
    targetPositionsRef.current = { ...targets };
    customTargetsRef.current = [];
    setSelectedTask(undefined);
    setProjectName("Moj program");
    setCode(blankProjectCode);
    setTargetPositions({ ...targets });
    setCustomTargets([]);
    toolRef.current = "pen";
    setTool("pen");
    showTableRef.current = true;
    setShowTable(true);
    tablePositionRef.current = defaultTablePosition;
    setTablePosition(defaultTablePosition);
    const defaultBlocks: BlockItem[] = [{ id: "block-1", position: initialBlock }];
    blocksRef.current = defaultBlocks;
    setBlocks(defaultBlocks);
    tcpRef.current = initialPose;
    setTcp(initialPose);
    tcpPitchRef.current = -90;
    setTcpPitch(-90);
    undoStackRef.current = [];
    redoStackRef.current = [];
    updateUndoRedoState();
    clearEditorMarkers();
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
      if (
        (project.version !== 1 && project.version !== 2) ||
        typeof project.name !== "string" ||
        typeof project.code !== "string" ||
        !project.targets ||
        !Array.isArray(project.customTargets)
      ) {
        throw new Error("Nieprawidlowy plik projektu.");
      }
      loadProject(project);
    } catch (error) { log(`BLAD importu: ${error instanceof Error ? error.message : "nieznany plik"}`); }
  };
  const clearSelection = () => {
    setSelectedTarget(undefined);
    setTcpEditing(false);
    setSelectedBlockId(null);
    setTableEditing(false);
  };
  const moveTcp = (position: [number, number, number]) => {
    clearTimer();
    cancelled.current = true;
    tcpRef.current = position;
    setTcp(position);
    if (heldBlockIdRef.current) updateBlockPosition(heldBlockIdRef.current, position);
    setTarget(undefined);
    setStatus("Ready");
    replaceTrail([]);
  };
  const changeTool = (nextTool: ToolKind) => {
    if (nextTool === toolRef.current) return;
    pushSceneSnapshot();
    clearTimer();
    clearAllDropTimers();
    cancelled.current = true;
    toolRef.current = nextTool;
    heldBlockIdRef.current = null;
    setTool(nextTool);
    setSelectedBlockId(null);
    setTableEditing(false);
    setHeldBlockId(null);
    setOutputs((values) => ({ ...values, doGripper: false }));
    setStatus("Ready");
    replaceTrail([]);
    log(`Wybrano narzedzie: ${nextTool === "pen" ? "tPen" : "tGripper"}.`);
  };
  const editorMount: OnMount = (editor, monaco) => {
    monacoEditorRef.current = editor;
    monacoRef.current = monaco;
    monaco.languages.register({ id: "rapid" });
    monaco.languages.setMonarchTokensProvider("rapid", {
      keywords: ["MODULE", "ENDMODULE", "PROC", "ENDPROC", "VAR", "PERS", "CONST", "IF", "THEN", "ELSE", "ENDIF", "WHILE", "DO", "ENDWHILE", "FOR", "FROM", "TO", "ENDFOR"],
      instructions: ["MoveJ", "MoveL", "MoveC", "Set", "Reset", "SetDO", "ResetDO", "WaitDI", "WaitTime", "TPWrite", "Incr", "Clear", "Stop"],
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
    showTableRef.current = showTable;
  }, [showTable]);
  useEffect(() => {
    tablePositionRef.current = tablePosition;
  }, [tablePosition]);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMetaOrCtrl = event.metaKey || event.ctrlKey;
      if (!isMetaOrCtrl) return;

      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl?.getAttribute("contenteditable") === "true";

      if (monacoEditorRef.current?.hasTextFocus() || isInput) {
        return;
      }

      if (event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (
        (event.key.toLowerCase() === "z" && event.shiftKey) ||
        event.key.toLowerCase() === "y"
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const panel = editorPanelRef.current;
      if (!panel || !monacoEditorRef.current) return;
      monacoEditorRef.current.layout({ width: panel.clientWidth, height: Math.max(0, panel.clientHeight - 38) });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [simulationWidth, lessonsOpen, bottomHeight]);
  useEffect(() => {
    if (!contextMenu) return;
    const handlePointerDown = (event: PointerEvent) => {
      const el = event.target as HTMLElement | null;
      if (el?.closest(".context-menu")) return;
      setContextMenu(undefined);
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setContextMenu(undefined);
      }
    };
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [contextMenu]);
  useEffect(() => () => { clearTimer(); clearAllDropTimers(); }, []);

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
    <header><div className="brand"><span className="brand-dot">R</span><strong>RAPID Sim</strong><span className="robot-label">ABB IRB 1090 <i>·</i> OmniCore learning simulator</span></div><div className="controls"><div className="history-controls" aria-label="Historia zmian"><button onClick={undo} disabled={!canUndo} title="Cofnij (Cmd+Z / Ctrl+Z)">↺ Undo</button><button onClick={redo} disabled={!canRedo} title="Ponow (Cmd+Shift+Z / Ctrl+Y)">↻ Redo</button></div><div className="tool-switch" aria-label="Wybierz narzedzie"><button className={tool === "pen" ? "active" : ""} onClick={() => changeTool("pen")}>Pen</button><button className={tool === "gripper" ? "active" : ""} onClick={() => changeTool("gripper")}>Gripper</button></div><Status status={status} /><button className="primary" onClick={run}>Run</button><button onClick={stop}>Pause</button><button onClick={reset}>Reset</button></div></header>
    <section className="workspace" style={{ gridTemplateColumns: `${lessonsOpen ? "212px" : "38px"} minmax(300px, 1fr) 6px ${simulationWidth}px` }}>
      <aside className={`lessons ${lessonsOpen ? "" : "collapsed"}`}>
        <button className="lesson-collapse" onClick={() => setLessonsOpen((open) => !open)} aria-label={lessonsOpen ? "Zwin panel" : "Rozwin panel"}>{lessonsOpen ? "‹" : "›"}</button>
        {lessonsOpen && <>
          <div className="project-actions">
            <input value={projectName} onChange={(event) => setProjectName(event.target.value)} aria-label="Nazwa projektu" />
            <div><button onClick={newProject}>New</button><button onClick={saveProject}>Save</button></div>
            <div><button onClick={exportProject}>Export</button><button onClick={() => importInputRef.current?.click()}>Import</button></div>
            <input ref={importInputRef} className="file-input" type="file" accept="application/json" onChange={(event) => { void importProject(event.target.files?.[0]); event.currentTarget.value = ""; }} />
          </div>

          <div className="sidebar-tabs" role="tablist">
            <button
              className={`sidebar-tab ${sidebarTab === "lessons" ? "active" : ""}`}
              onClick={() => setSidebarTab("lessons")}
              role="tab"
              aria-selected={sidebarTab === "lessons"}
            >
              Lekcje <span>{examples.length}</span>
            </button>
            <button
              className={`sidebar-tab ${sidebarTab === "tasks" ? "active" : ""}`}
              onClick={() => setSidebarTab("tasks")}
              role="tab"
              aria-selected={sidebarTab === "tasks"}
            >
              Zadania <span>{tasks.length}</span>
            </button>
          </div>

          {sidebarTab === "lessons" && <>
            <div className="panel-title">LEKCJE <span>{examples.length}</span></div>
            {examples.map((example) => (
              <button
                className={`lesson ${!selectedTask && selected.id === example.id ? "selected" : ""}`}
                key={example.id}
                onClick={() => selectExample(example)}
              >
                <small>{example.topic}</small>
                <b>{example.title}</b>
              </button>
            ))}
            {savedProjects.length > 0 && <>
              <div className="panel-title saved-title">ZAPISANE</div>
              {savedProjects.map((project) => (
                <button className="lesson saved-project" key={project.name} onClick={() => loadProject(project)}>
                  <small>{new Date(project.savedAt).toLocaleDateString("pl-PL")}</small>
                  <b>{project.name}</b>
                </button>
              ))}
            </>}
          </>}

          {sidebarTab === "tasks" && <>
            <div className="panel-title">ZADANIA TRENINGOWE <span>5</span></div>
            {tasks.filter((t) => t.category === "podstawowe").map((task) => (
              <button
                className={`lesson task-item ${selectedTask?.id === task.id ? "selected" : ""}`}
                key={task.id}
                onClick={() => selectTask(task)}
              >
                <div className="task-header-row">
                  <span className="task-tag basic">Trening</span>
                  <small>{task.topic}</small>
                </div>
                <b>{task.title}</b>
              </button>
            ))}

            <div className="panel-title exam-title">EGZAMIN ELM.08 <span>5</span></div>
            {tasks.filter((t) => t.category === "elm08").map((task) => (
              <button
                className={`lesson task-item elm08 ${selectedTask?.id === task.id ? "selected" : ""}`}
                key={task.id}
                onClick={() => selectTask(task)}
              >
                <div className="task-header-row">
                  <span className="task-tag elm">ELM.08</span>
                  <small>{task.topic}</small>
                </div>
                <b>{task.title}</b>
              </button>
            ))}

            {selectedTask && (
              <div className="task-info-card">
                <div className="task-info-head">
                  <b>Treść zadania</b>
                  <span className={`task-badge ${selectedTask.category}`}>{selectedTask.category === "elm08" ? "ELM.08" : "Podstawowe"}</span>
                </div>
                <p className="task-info-desc">{selectedTask.summary}</p>
                <div className="task-tips-box">
                  <strong>Wskazówki dla ucznia:</strong>
                  <ul>
                    {selectedTask.tips.map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>}

          <div className="notice">
            <b>{sidebarTab === "tasks" ? "Czytaj ze zrozumieniem" : "Symulacja edukacyjna"}</b>
            <p>{sidebarTab === "tasks" ? "Przeanalizuj treść zadania i wskazówki. Zadanie nie zawiera gotowego rozwiązania." : "Nie uruchamiaj tego kodu na prawdziwym robocie bez walidacji i procedur bezpieczenstwa."}</p>
          </div>
        </>}
      </aside>
       <section className="editor-panel" ref={editorPanelRef}><div className="panel-head"><div><span className="file-dot" /> MainModule.mod</div><span>RAPID</span></div><Editor height="100%" value={code} onChange={handleCodeChange} onMount={editorMount} theme="vs-dark" options={{ automaticLayout: true, fontSize: 14, minimap: { enabled: false }, lineNumbers: "on", scrollBeyondLastLine: false, padding: { top: 14 }, fontFamily: "SFMono-Regular, Consolas, monospace" }} /></section>
      <div className="resize-handle" onPointerDown={startResize} role="separator" aria-label="Zmien szerokosc widoku symulacji" aria-orientation="vertical" />
        <section className="sim-panel">
          <div className="panel-head">
            <div>3D SIMULATION</div>
            <div className="sim-head-actions">
              <div className="tcp-pitch-controls" title="Orientacja narzędzia TCP (kąt w pionie)">
                <span>TCP:</span>
                <button
                  className={tcpPitch === -90 ? "active" : ""}
                  onClick={() => {
                    pushSceneSnapshot();
                    setTcpPitch(-90);
                    tcpPitchRef.current = -90;
                    log("Orientacja TCP: Pionowo w dół (-90°).");
                  }}
                  title="Skieruj narzędzie pionowo w dół (-90°)"
                >
                  ⬇ Pion
                </button>
                <button
                  className={tcpPitch === -45 ? "active" : ""}
                  onClick={() => {
                    pushSceneSnapshot();
                    setTcpPitch(-45);
                    tcpPitchRef.current = -45;
                    log("Orientacja TCP: Pochylenie (-45°).");
                  }}
                  title="Pochyl narzędzie pod kątem -45°"
                >
                  ↘ 45°
                </button>
                <button
                  className={tcpPitch === 0 ? "active" : ""}
                  onClick={() => {
                    pushSceneSnapshot();
                    setTcpPitch(0);
                    tcpPitchRef.current = 0;
                    log("Orientacja TCP: Poziomo (0°).");
                  }}
                  title="Skieruj narzędzie poziomo (0°)"
                >
                  ➡ Poziom
                </button>
              </div>
              <button
                className={showTable ? "active" : ""}
                onClick={() => {
                  pushSceneSnapshot();
                  setShowTable((v) => !v);
                }}
              >
                {showTable ? "Table ON" : "Table OFF"}
              </button>
              {tool === "gripper" && (
                <div className="block-stepper" title="Liczba blokow">
                  <span>Blocks:</span>
                  <button onClick={() => setBlockCount(blocks.length - 1)} disabled={blocks.length <= 1}>
                    −
                  </button>
                  <b>{blocks.length}</b>
                  <button onClick={() => setBlockCount(blocks.length + 1)} disabled={blocks.length >= 28}>
                    +
                  </button>
                  <button onClick={addBlock}>+ Block</button>
                </div>
              )}
              <button onClick={openNewTargetDialog}>Add point at TCP</button>
              <span>TCP {tcp.map((value) => Math.round(value)).join(" / ")} mm</span>
            </div>
          </div>
          <div className="canvas">
            <RobotScene
              tcp={tcp}
              tcpPitch={tcpPitch}
              target={target}
              trail={trail}
              targets={targetPositions}
              visibleTargets={visibleTargets}
              selectedTarget={selectedTarget}
              tcpEditing={tcpEditing}
              onSelectTarget={(name) => {
                setTcpEditing(false);
                setSelectedBlockId(null);
                setTableEditing(false);
                setSelectedTarget(name);
              }}
              onSelectTcp={() => {
                setSelectedTarget(undefined);
                setSelectedBlockId(null);
                setTableEditing(false);
                setTcpEditing(true);
              }}
              onMoveTarget={moveTarget}
              onMoveTcp={moveTcp}
              onDragStart={pushSceneSnapshot}
              tool={tool}
              gripperClosed={outputs.doGripper}
              fadeWhileRunning={status !== "Running"}
              blocks={blocks}
              heldBlockId={heldBlockId}
              selectedBlockId={selectedBlockId}
              onSelectBlock={(id) => {
                setSelectedTarget(undefined);
                setTcpEditing(false);
                setTableEditing(false);
                setSelectedBlockId(id);
              }}
              onMoveBlock={(id, position) => {
                clearBlockDropTimer(id);
                updateBlockPosition(id, position);
              }}
              onBlockContextMenu={(screenPosition, id) => {
                const clampedX = Math.max(10, Math.min(screenPosition.x, window.innerWidth - 210));
                const clampedY = Math.max(10, Math.min(screenPosition.y, window.innerHeight - 160));
                setContextMenu({ type: "block", x: clampedX, y: clampedY, id });
              }}
              onTargetContextMenu={(screenPosition, name) => {
                const clampedX = Math.max(10, Math.min(screenPosition.x, window.innerWidth - 210));
                const clampedY = Math.max(10, Math.min(screenPosition.y, window.innerHeight - 160));
                setContextMenu({ type: "target", x: clampedX, y: clampedY, target: name });
              }}
              showTable={showTable}
              tablePosition={tablePosition}
              tableEditing={tableEditing}
              onSelectTable={() => {
                setSelectedTarget(undefined);
                setTcpEditing(false);
                setSelectedBlockId(null);
                setTableEditing(true);
              }}
              onMoveTable={(position) => {
                tablePositionRef.current = position;
                setTablePosition(position);
              }}
              onClearSelection={clearSelection}
            />
          </div>
          <div className="sim-footer">
            <div className="sim-info">
              <span className="sim-tool">
                <b>Tool</b> {tool === "pen" ? "tPen" : "tGripper"}
              </span>
              <span className="sim-pitch">
                <b>TCP</b> {tcpPitch === -90 ? "Pion ⬇" : tcpPitch === 0 ? "Poziom ➡" : `${tcpPitch}°`}
              </span>
              <span className="sim-target">
                <b>Target</b> {target ?? "-"}
              </span>
              <span className="sim-line">
                <b>Line</b> {activeLine ?? "-"}
              </span>
              <span className="sim-reach">
                <b>Reach</b> {robotReach.minimum}-{robotReach.maximum} mm
              </span>
              {tool === "gripper" && (
                <span className="sim-block-count">
                  <b>Blocks</b> {blocks.length}
                </span>
              )}
              {showTable && !tableEditing && (
                <span className="sim-table">
                  <b>Table</b> [{tablePosition.map((value) => Math.round(value)).join(", ")}] mm
                </span>
              )}
              {selectedTarget && (
                <span className="sim-edit">
                  <b>Edit</b> {selectedTarget} [{targetPositions[selectedTarget].map((value) => Math.round(value)).join(", ")}]
                </span>
              )}
              {tcpEditing && <span className="sim-edit"><b>Edit</b> TCP</span>}
              {tableEditing && (
                <span className="sim-edit">
                  <b>Edit</b> table [{tablePosition.map((value) => Math.round(value)).join(", ")}]
                </span>
              )}
              {selectedBlockId &&
                (() => {
                  const b = blocks.find((item) => item.id === selectedBlockId);
                  const idx = blocks.findIndex((item) => item.id === selectedBlockId);
                  return b ? (
                    <span className="sim-edit">
                      <b>Edit</b> block #{idx + 1} [{b.position.map((v) => Math.round(v)).join(", ")}]
                    </span>
                  ) : null;
                })()}
              <span className="legend">right-click a custom point or block to remove</span>
            </div>
          </div>
        </section>
    </section>
    <div className="bottom-resize-handle" onPointerDown={startBottomResize} role="separator" aria-label="Zmien wysokosc konsoli i sygnalow" aria-orientation="horizontal" />
    <section className="bottom"><div className="console"><div className="tabs"><b>CONSOLE</b><span>DEBUGGER</span></div><div className="terminal">{consoleLines.map((line, index) => <div key={`${line}-${index}`} className={line.includes("BLAD") ? "error-text" : ""}>{line}</div>)}</div></div><div className="signals"><div className="tabs"><b>SIGNALS</b><span>{awaiting ? `WAITING: ${awaiting.signal}` : "I/O BOARD"}</span></div><div className="signal-groups"><SignalGroup title="DIGITAL INPUTS" signals={inputs} waiting={awaiting?.signal} onToggle={(name) => setInputs((values) => ({ ...values, [name]: !values[name] }))} /><SignalGroup title="DIGITAL OUTPUTS" signals={outputs} enabledSignals={["doGripper"]} onToggle={() => setGripperOutput(!outputs.doGripper)} /></div></div>
    {contextMenu && (
      <div
        className="context-menu"
        style={{ left: contextMenu.x, top: contextMenu.y }}
        onContextMenu={(event) => event.preventDefault()}
        onClick={(event) => event.stopPropagation()}
      >
        {contextMenu.type === "target" ? (
          <>
            <b>{contextMenu.target}</b>
            {targetPositions[contextMenu.target] && (
              <small>
                [{targetPositions[contextMenu.target].map((v) => Math.round(v)).join(", ")}] mm
              </small>
            )}
            <button onClick={() => removeTarget(contextMenu.target)}>Usuń punkt</button>
            <button className="secondary" onClick={() => setContextMenu(undefined)}>
              Anuluj
            </button>
          </>
        ) : (
          <>
            <b>
              {(() => {
                const idx = blocks.findIndex((b) => b.id === contextMenu.id);
                const b = blocks[idx];
                return `Block #${idx + 1}${
                  b ? ` [${b.position.map((v) => Math.round(v)).join(", ")}]` : ""
                }`;
              })()}
            </b>
            <button onClick={() => removeBlock(contextMenu.id)}>Usuń blok</button>
            <button className="secondary" onClick={() => setContextMenu(undefined)}>
              Anuluj
            </button>
          </>
        )}
      </div>
    )}
    {newTargetPoint && <div className="target-dialog-backdrop" onMouseDown={() => setNewTargetPoint(undefined)}><div className="target-dialog" role="dialog" aria-modal="true" aria-label="Dodaj punkt" onMouseDown={(event) => event.stopPropagation()}><b>Add point at TCP</b><small>[{newTargetPoint.map((value) => Math.round(value)).join(", ")}] mm</small><label>Name<input autoFocus value={targetName} onChange={(event) => setTargetName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") createTarget(); if (event.key === "Escape") setNewTargetPoint(undefined); }} placeholder="pCustom" /></label><div><button onClick={() => setNewTargetPoint(undefined)}>Cancel</button><button className="confirm" onClick={createTarget}>Add point</button></div></div></div>}
    </section>
  </main>;
}

function SignalGroup({ title, signals, waiting, onToggle, enabledSignals }: { title: string; signals: SignalMap; waiting?: string; onToggle?: (name: string) => void; enabledSignals?: string[] }) { return <div className="signal-group"><small>{title}</small>{Object.entries(signals).map(([name, value]) => <button disabled={!onToggle || (enabledSignals !== undefined && !enabledSignals.includes(name))} onClick={() => onToggle?.(name)} className={`signal ${value ? "on" : ""} ${waiting === name ? "waiting" : ""}`} key={name}><span className="led" />{name}<b>{value ? "1" : "0"}</b></button>)}</div>; }

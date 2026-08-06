export type Example = {
  id: string;
  title: string;
  topic: string;
  summary: string;
  code: string;
};

export type SignalMap = Record<string, boolean>;
export type ToolKind = "pen" | "gripper";
export type StudentProject = {
  version: 1;
  name: string;
  code: string;
  targets: Record<string, [number, number, number]>;
  customTargets: string[];
  savedAt: string;
};
export type ExecutionStatus = "Ready" | "Running" | "Paused" | "Waiting for DI" | "Completed" | "Error";
export type Command =
  | { type: "log"; text: string; line: number }
  | { type: "move"; kind: "MoveJ" | "MoveL" | "MoveC"; target: string; via?: string; line: number }
  | { type: "output"; signal: string; value: boolean; line: number }
  | { type: "waitInput"; signal: string; value: boolean; line: number }
  | { type: "wait"; seconds: number; line: number }
  | { type: "increment"; variable: string; line: number }
  | { type: "clear"; variable: string; line: number }
  | { type: "stop"; line: number };

export const targets: Record<string, [number, number, number]> = {
  // Coordinates are millimetres. Every lesson target is in the calculated
  // 280–550 mm comfortable workspace measured from the shoulder axis.
  pHome: [0, 490, 530],
  pSquareStart: [-180, 400, 520],
  pSquareA: [-180, 280, 450],
  pSquareB: [180, 280, 450],
  pSquareC: [180, 480, 450],
  pSquareD: [-180, 480, 450],
  pCircleStart: [0, 440, 530],
  pCircleA: [0, 260, 460],
  pCircleB: [180, 400, 460],
  pCircleC: [0, 525, 460],
  pCircleD: [-180, 400, 460],
  pPick: [220, 330, 420],
  pPlace: [-220, 465, 420],
  pGripApproach: [220, 330, 510],
  pGripPick: [220, 330, 420],
  pGripPlace: [-220, 465, 420],
  pGripRetreat: [-220, 465, 510],
};

export const examples: Example[] = [
  {
    id: "hello",
    title: "Pierwszy program",
    topic: "Podstawy",
    summary: "Uruchom procedurę main i obserwuj komunikat w konsoli.",
    code: `MODULE MainModule

    PROC main()
        TPWrite "Witaj w RAPID Sim!";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "home",
    title: "Ruch do pozycji startowej",
    topic: "Ruch robota",
    summary: "MoveJ przemieszcza robota po ruchu osiowym do punktu pHome.",
    code: `MODULE MainModule

    PROC main()
        TPWrite "Ruch do pozycji bazowej";
        MoveJ pHome, v200, fine, tPen;
    ENDPROC

ENDMODULE`,
  },
  {
    id: "square",
    title: "Rysowanie kwadratu",
    topic: "Ruch liniowy",
    summary: "MoveL prowadzi TCP po bokach kwadratu. Wlacz widok TCP trail.",
    code: `MODULE MainModule

    PROC main()
        MoveJ pSquareStart, v200, fine, tPen;
        MoveL pSquareA, v100, fine, tPen;
        MoveL pSquareB, v100, fine, tPen;
        MoveL pSquareC, v100, fine, tPen;
        MoveL pSquareD, v100, fine, tPen;
        MoveL pSquareA, v100, fine, tPen;
        MoveJ pHome, v200, fine, tPen;
    ENDPROC

ENDMODULE`,
  },
  {
    id: "circle",
    title: "Ruch po okregu",
    topic: "Ruch robota",
    summary: "MoveC wykorzystuje punkt posredni i docelowy do prowadzenia luku.",
    code: `MODULE MainModule

    PROC main()
        MoveJ pCircleStart, v200, fine, tPen;
        MoveL pCircleA, v100, fine, tPen;
        MoveC pCircleB, pCircleC, v100, fine, tPen;
        MoveC pCircleD, pCircleA, v100, fine, tPen;
        MoveJ pHome, v200, fine, tPen;
    ENDPROC

ENDMODULE`,
  },
  {
    id: "io",
    title: "Chwytak i sygnaly",
    topic: "Digital I/O",
    summary: "Program zatrzyma sie na WaitDI. Ustaw diStart na 1 w zakladce Signals.",
    code: `MODULE MainModule

    PROC main()
        TPWrite "Ustaw diStart na 1";
        WaitDI diStart, 1;
        Set doBusy;
        Set doGripper;
        WaitTime 1;
        Reset doGripper;
        Reset doBusy;
        Set doComplete;
        TPWrite "Cykl zakonczony";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "counter",
    title: "Licznik czesci",
    topic: "Zmienne i petle",
    summary: "Prosty licznik z Incr oraz komunikatami operatora.",
    code: `MODULE MainModule
    VAR num nProducedParts := 0;

    PROC main()
        Incr nProducedParts;
        TPWrite "Wyprodukowano element 1";
        Incr nProducedParts;
        TPWrite "Wyprodukowano element 2";
        Incr nProducedParts;
        TPWrite "Plan wykonany";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "gripper",
    title: "Pick and place chwytakiem",
    topic: "Narzedzie i I/O",
    summary: "Wybierz narzedzie Gripper. Chwytak zamknie sie na bloku, przeniesie go i odlozy.",
    code: `MODULE MainModule

    PROC main()
        MoveJ pGripApproach, v200, fine, tGripper;
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
        MoveJ pGripRetreat, v200, fine, tGripper;
        MoveL pGripPlace, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL pGripRetreat, v100, fine, tGripper;
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Blok odlozony";
    ENDPROC

ENDMODULE`,
  },
];

export const blankProjectCode = `MODULE MainModule

    PROC main()
        TPWrite "Moj program RAPID";
    ENDPROC

ENDMODULE`;

const outputNames = new Set(["doReady", "doGripper", "doBusy", "doComplete"]);
const inputNames = new Set(["diStart", "diPartPresent", "diReset", "diSafetyOk"]);

function removeComment(source: string) {
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '"') quoted = !quoted;
    if (source[index] === "!" && !quoted) return source.slice(0, index);
  }
  return source;
}

export function compile(code: string, targetLibrary: Record<string, [number, number, number]> = targets): { commands: Command[]; error?: string } {
  const commands: Command[] = [];
  const lines = code.split("\n");
  let inMain = false;
  let sawMain = false;

  for (let index = 0; index < lines.length; index += 1) {
    const line = index + 1;
    const source = removeComment(lines[index]).trim();
    if (!source) continue;
    if (/^PROC\s+main\s*\(/i.test(source)) {
      inMain = true;
      sawMain = true;
      continue;
    }
    if (/^ENDPROC/i.test(source)) {
      inMain = false;
      continue;
    }
    if (!inMain || /^(MODULE|ENDMODULE|PROC|CONST|VAR|PERS)\b/i.test(source)) continue;

    let match: RegExpMatchArray | null;
    if ((match = source.match(/^TPWrite\s+"(.*)"\s*;?$/i))) {
      commands.push({ type: "log", text: match[1], line });
    } else if ((match = source.match(/^(MoveJ|MoveL)\s+(\w+)/i))) {
      const target = match[2];
      if (!targetLibrary[target]) return { commands, error: `Linia ${line}: nieznany robtarget „${target}”.` };
      commands.push({ type: "move", kind: match[1] as "MoveJ" | "MoveL", target, line });
    } else if ((match = source.match(/^MoveC\s+(\w+)\s*,\s*(\w+)/i))) {
      const via = match[1];
      const target = match[2];
      if (!targetLibrary[via]) return { commands, error: `Linia ${line}: nieznany robtarget „${via}”.` };
      if (!targetLibrary[target]) return { commands, error: `Linia ${line}: nieznany robtarget „${target}”.` };
      commands.push({ type: "move", kind: "MoveC", via, target, line });
    } else if ((match = source.match(/^(Set|Reset)\s+(\w+)/i))) {
      const signal = match[2];
      if (!outputNames.has(signal)) return { commands, error: `Linia ${line}: wyjscie „${signal}” nie jest skonfigurowane.` };
      commands.push({ type: "output", signal, value: match[1].toLowerCase() === "set", line });
    } else if ((match = source.match(/^WaitDI\s+(\w+)\s*,\s*([01])\s*;?$/i))) {
      const signal = match[1];
      if (!inputNames.has(signal)) return { commands, error: `Linia ${line}: wejscie „${signal}” nie jest skonfigurowane.` };
      commands.push({ type: "waitInput", signal, value: match[2] === "1", line });
    } else if ((match = source.match(/^WaitTime\s+([\d.]+)/i))) {
      commands.push({ type: "wait", seconds: Number(match[1]), line });
    } else if ((match = source.match(/^Incr\s+(\w+)/i))) {
      commands.push({ type: "increment", variable: match[1], line });
    } else if ((match = source.match(/^Clear\s+(\w+)/i))) {
      commands.push({ type: "clear", variable: match[1], line });
    } else if (/^Stop\s*;?$/i.test(source)) {
      commands.push({ type: "stop", line });
    } else if (/^(IF|ELSE|ENDIF|WHILE|ENDWHILE|FOR|ENDFOR|TEST|CASE|DEFAULT|ENDTEST|TPErase)/i.test(source)) {
      return { commands, error: `Linia ${line}: ta struktura RAPID nie jest jeszcze wykonywalna w wersji edukacyjnej.` };
    } else {
      return { commands, error: `Linia ${line}: nieobslugiwana instrukcja „${source.replace(/;$/, "")}”.` };
    }
  }
  if (!sawMain) return { commands, error: "Brak procedury PROC main()." };
  return { commands };
}

export function targetNamesInCode(code: string, targetLibrary: Record<string, [number, number, number]> = targets) {
  const names = new Set<string>();
  for (const line of code.split("\n")) {
    const source = removeComment(line);
    const linearMotion = source.match(/^\s*Move(?:J|L)\s+(\w+)/i);
    const circularMotion = source.match(/^\s*MoveC\s+(\w+)\s*,\s*(\w+)/i);
    for (const name of [linearMotion?.[1], circularMotion?.[1], circularMotion?.[2]]) {
      if (name && targetLibrary[name]) names.add(name);
    }
  }
  return [...names];
}

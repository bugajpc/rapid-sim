export type LectureSyntaxItem = {
  instruction: string;
  syntax: string;
  description: string;
  params?: string[];
};

export type ExampleLecture = {
  title: string;
  overview: string;
  syntax: LectureSyntaxItem[];
  keyConcepts: string[];
  examTips: string[];
  industrialContext?: string;
};

export type Example = {
  id: string;
  title: string;
  topic: string;
  summary: string;
  code: string;
  tool?: ToolKind;
  lecture?: ExampleLecture;
};

export type SignalMap = Record<string, boolean>;
import type { BlockItem } from "./robotConfig";

export type ToolKind = "pen" | "gripper";
export type StudentProject = {
  version: 1 | 2;
  name: string;
  code: string;
  targets: Record<string, [number, number, number]>;
  customTargets: string[];
  savedAt: string;
  tool?: ToolKind;
  showTable?: boolean;
  tablePosition?: [number, number];
  blocks?: BlockItem[];
  tcp?: [number, number, number];
  tcpPitch?: number;
};
export type ExecutionStatus = "Ready" | "Running" | "Paused" | "Waiting for DI" | "Completed" | "Error";
export type TPWriteParam = {
  kind: "num" | "dnum" | "bool" | "pos" | "orient";
  expr: string;
};

export type EvaluationContext = {
  variables: Record<string, any>;
  targetLibrary?: Record<string, [number, number, number]>;
  inputs?: Record<string, boolean>;
  outputs?: Record<string, boolean>;
};

export type Command =
  | { type: "log"; text?: string; textExpr?: string; params?: TPWriteParam[]; line: number }
  | {
      type: "move";
      kind: "MoveJ" | "MoveL" | "MoveC" | "MoveAbsJ";
      target: string;
      via?: string;
      targetOffset?: [number, number, number];
      targetOffsetExpr?: [string, string, string];
      viaOffset?: [number, number, number];
      viaOffsetExpr?: [string, string, string];
      wobj?: string;
      speed?: number; // mm/s
      zone?: string;
      tool?: string;
      line: number;
    }
  | { type: "output"; signal: string; value: boolean; line: number }
  | { type: "pulse"; signal: string; length: number; line: number }
  | { type: "waitInput"; signal: string; value: boolean; line: number }
  | { type: "waitOutput"; signal: string; value: boolean; line: number }
  | { type: "wait"; seconds: number; line: number }
  | { type: "increment"; variable: string; stepExpr?: string; line: number }
  | { type: "decrement"; variable: string; stepExpr?: string; line: number }
  | { type: "clear"; variable: string; line: number }
  | { type: "assign"; variable: string; expr: string; line: number }
  | { type: "add"; variable: string; expr: string; line: number }
  | { type: "jump"; targetIndex: number; line: number }
  | { type: "jumpIfFalse"; expr: string; targetIndex: number; line: number }
  | { type: "tpErase"; line: number }
  | { type: "stop"; line: number };

export const targets: Record<string, [number, number, number]> = {
  // Coordinates in millimetres.
  pHome: [0, 490, 530],
  pInit: [0, 440, 560],

  // Square
  pSquareStart: [-180, 400, 520],
  pSquareA: [-180, 280, 450],
  pSquareB: [180, 280, 450],
  pSquareC: [180, 480, 450],
  pSquareD: [-180, 480, 450],

  // Circle
  pCircleStart: [0, 440, 530],
  pCircleA: [0, 260, 460],
  pCircleB: [180, 400, 460],
  pCircleC: [0, 525, 460],
  pCircleD: [-180, 400, 460],

  // Triangle (inside circle for exam 112)
  // Local drawing targets within WorkObject frames (wobj1, wobj2)
  pTriangleA: [0, -35, 0],
  pTriangleB: [30, 25, 0],
  pTriangleC: [-30, 25, 0],

  // Table Pick & Place
  pPick: [100, 330, 420],
  pPlace: [-220, 440, 420],
  pGripApproach: [100, 330, 510],
  pGripPick: [100, 330, 420],
  pGripPlace: [-220, 440, 420],
  pGripRetreat: [-220, 440, 510],

  // Conveyor belt positions
  pConvStartApproach: [-60, 440, 350],
  pConvStart: [-60, 440, 255],
  pConvMid: [-180, 440, 255],
  pConvEnd: [-310, 440, 255],
  pPacking: [-310, 440, 255],

  // Drop/gravity feeder (mounted on right table zone)
  pFeederApproach: [180, 440, 350],
  pFeederPick: [180, 440, 255],

  // Sensors
  pSensorB5Approach: [110, 310, 380],
  pSensorB5: [110, 310, 270],

  // Sorter bins (dedicated outer stations for task 101)
  pBin1: [270, 340, 260],
  pBin2: [270, 480, 260],
  pPin1: [-50, 360, 280],
  pPin2: [50, 360, 280],
  pPin3: [0, 360, 280],

  // Tower stacking points
  pTowerBase: [-120, 340, 235],
  pTowerLevel1: [-120, 340, 285],
  pTowerLevel2: [-120, 340, 335],
  pTowerLevel3: [-120, 340, 385],

  // Tool rack
  pToolRackApproach: [240, 220, 440],
  pToolRack: [240, 220, 310],

  // Exam trajectory points P1..P16 (for exams 109 & 110)
  pP1: [-150, 320, 440],
  pP2: [-100, 320, 440],
  pP3: [-50, 320, 440],
  pP4: [0, 320, 440],
  pP5: [50, 320, 440],
  pP6: [100, 320, 440],
  pP7: [150, 320, 440],
  pP8: [150, 380, 440],
  pP9: [100, 380, 440],
  pP10: [50, 380, 440],
  pP11: [0, 380, 440],
  pP12: [-50, 380, 440],
  pP13: [-100, 380, 440],
  pP14: [-150, 380, 440],
  pP15: [-150, 440, 440],
  pP16: [0, 440, 440],

  // Common aliases for training exercises and exam sheets
  p1: [-100, 320, 440],
  p2: [100, 320, 440],
  p3: [100, 440, 440],
  p4: [-100, 440, 440],
  pGripAbove: [100, 330, 510],
  pPlaceAbove: [-220, 440, 510],
  pFeederAbove: [180, 440, 350],
  pSensorAbove: [120, 310, 380],
  pBin1Above: [250, 400, 460],
  pBin2Above: [250, 480, 460],
  pConvStartAbove: [-60, 440, 350],
  pAboveObstacle: [0, 400, 520],
  pArcVia: [0, 450, 480],
  pPallet1: [120, 260, 240],
  pPallet2: [120, 310, 240],
  pPallet3: [170, 260, 240],
  pPallet4: [170, 310, 240],
  // Local drawing targets within WorkObject frames (wobj1, wobj2)
  pSquare1: [-30, -30, 0],
  pSquare2: [30, -30, 0],
  pSquare3: [30, 30, 0],
  pSquare4: [-30, 30, 0],
  pCircle1: [0, -25, 0],
  pCircle2: [0, 25, 0],
  pCircleVia1: [25, 0, 0],
  pCircleVia2: [-25, 0, 0],
};

export const examples: Example[] = [
  {
    id: "hello",
    title: "1. Pierwszy program i konsola (TPWrite)",
    topic: "Podstawy RAPID",
    summary: "Poznaj budowę modułu RAPID, procedurę main oraz wyświetlanie komunikatów i wartości na panelu operatora FlexPendant.",
    tool: "pen",
    code: `MODULE MainModule

    VAR num nParts := 5;

    PROC main()
        TPWrite "Witaj w RAPID Sim!";
        TPWrite "Liczba wyprodukowanych sztuk: " \Num:=nParts;
        TPWrite "Stanowisko zrobotyzowane gotowe do pracy.";
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 1: Struktura programu RAPID i komunikacja z operatorem (TPWrite)",
      overview: "Język RAPID (język sterowników robotów przemysłowych ABB) zorganizowany jest modułowo. Każdy program roboczy składa się z modułów (MODULE ... ENDMODULE). Wewnątrz modułu deklarowane są zmienne globalne (VAR), stałe (CONST) oraz procedury (PROC).\n\nPunktem wejściowym do wykonania programu jest zawsze procedura główna o nazwie 'main()'. Gdy operator na programatorze ręcznym FlexPendant naciska przycisk START, wskaźnik programu (Program Pointer - PP) rozpoczyna realizację od pierwszej instrukcji w 'PROC main()'.\n\nInstrukcja TPWrite (Teach Pendant Write) służy do wysyłania informacji tekstowych i diagnostycznych do operatora na ekran konsoli FlexPendant.",
      syntax: [{"instruction": "TPWrite", "syntax": "TPWrite \"Tekst\" [\\Num:=wartość] [\\Bool:=stan];", "description": "Wypisuje łańcuch tekstowy w oknie komunikatów operatora z opcjonalnymi wartościami zmiennych.", "params": ["\\Num:=numeryczna_wartość", "\\Bool:=logiczny_stan", "\\Pos:=współrzędne"]}],
      keyConcepts: ["Każdy moduł RAPID otwiera słowo kluczowe MODULE NazwaModule i zamyka ENDMODULE.", "Procedura main() jest obowiązkowa w module głównym jako punkt wejściowy programu.", "Wszystkie instrukcje w języku RAPID muszą kończyć się średnikiem (;).", "Komentarze w RAPID zaczynają się od wykrzyknika (!)."],
      examTips: ["Na egzaminie CKE arkusz często wymaga umieszczenia komentarzy objaśniających działanie poszczególnych bloków programu (! Krok 1...).", "Pamiętaj o dwukropku ze znakiem równości (:=) przy przełącznikach opcjonalnych: TPWrite \"Liczba: \" \\Num:=zmienna;", "Literały tekstowe w cudzysłowach nie mogą zawierać niedomkniętych znaków."],
      industrialContext: "Na rzeczywistym kontrolerze ABB OmniCore lub IRC5 komunikaty TPWrite pojawiają się w dzienniku zdarzeń (Event Log) lub dedykowanym widoku aplikacji produkcyjnej na ekranie dotykowym FlexPendant.",
    },
  },
  {
    id: "home",
    title: "2. Ruch osiowy i bazowanie (MoveJ)",
    topic: "Kinematyka i bazowanie",
    summary: "Przemieszczanie ramienia robota ruchem osiowym MoveJ do pozycji bazowej pHome z kontrolą strefy zatrzymania fine.",
    tool: "pen",
    code: `MODULE MainModule

    PROC main()
        TPWrite "Ruch do pozycji bazowej pHome...";
        MoveJ pHome, v200, fine, tPen;
        TPWrite "Pozycja bazowa osiagnieta pomyslnie.";
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 2: Ruch w przestrzeni złączy (MoveJ) i pozycja bazowa HOME",
      overview: "Ruch MoveJ (Joint Move) jest podstawowym i najszybszym sposobem przemieszczania robota 6-osiowego. W ruchu MoveJ sterownik robota planuje trajektorię tak, aby wszystkie 6 osi zsynchronizowanie rozpoczęły i zakończyły obrót w tym samym momencie.\n\nPonieważ ruch odbywa się w przestrzeni złączy (kątów osi), trajektoria punktu TCP w przestrzeni kartezjańskiej NIE jest linią prostą, lecz łukiem w przestrzeni. Z tego względu MoveJ stosuje się w przestrzeni wolnej od przeszkód, do szybkich dojazdów, przejazdów transportowych oraz do bazowania w pozycji pHome.\n\nStrefa zatrzymania 'fine' wymusza wyhamowanie robota do zerowej prędkości i dokładne zatrzymanie w punkcie przed przejściem do kolejnej instrukcji.",
      syntax: [{"instruction": "MoveJ", "syntax": "MoveJ ToPoint, Speed, Zone, Tool [\\WObj];", "description": "Ruch osiowy (przegubowy) do zadanego punktu docelowego.", "params": ["ToPoint: robtarget", "Speed: speeddata (np. v200, v100)", "Zone: zonedata (fine, z10, z50)", "Tool: tooldata (tPen, tGripper)", "\\WObj: wobjdata"]}],
      keyConcepts: ["MoveJ minimalizuje obciążenie przekładni robota i pozwala na osiągnięcie maksymalnej dynamiki.", "Strefa 'fine' gwarantuje dokładne osiągnięcie pozycji docelowej.", "Strefy 'z10'..'z100' (Fly-by) pozwalają robotowi zaokrąglić narożnik bez zatrzymywania, skracając czas cyklu.", "Pozycja pHome jest pozycją bezpieczną i zawsze musi być osiągana ze strefą fine."],
      examTips: ["W kryteriach oceniania egzaminu ELM.08 za brak strefy 'fine' w pozycji HOME lub w punktach chwytania detalu egzaminator odejmuje punkty!", "Pamiętaj o podaniu właściwego narzędzia (tGripper dla zadań ze chwytakiem, tPen dla zadań kreślarskich)."],
      industrialContext: "W przemyśle ruch do pozycji HOME wykonuje się zawsze na początku i na końcu cyklu automatycznego oraz po naciśnięciu przycisku resetu bezpieczeństwa.",
    },
  },
  {
    id: "square",
    title: "3. Ruch liniowy i kontury (MoveL)",
    topic: "Ruch liniowy",
    summary: "Interpolacja liniowa MoveL po krawędziach geometrycznych. TCP porusza się w linii prostej ze stałą prędkością liniową.",
    tool: "pen",
    code: `MODULE MainModule

    PROC main()
        TPWrite "Start kreślenia kwadratu";
        MoveJ pSquareStart, v200, fine, tPen;
        MoveL pSquareA, v100, fine, tPen;
        MoveL pSquareB, v100, fine, tPen;
        MoveL pSquareC, v100, fine, tPen;
        MoveL pSquareD, v100, fine, tPen;
        MoveL pSquareA, v100, fine, tPen;
        MoveJ pHome, v200, fine, tPen;
        TPWrite "Kwadrat narysowany, robot w pHome";
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 3: Interpolacja liniowa (MoveL) i obróbka konturów",
      overview: "Instrukcja MoveL (Linear Move) wymusza, aby punkt centralny narzędzia (TCP) poruszał się po idealnej linii prostej w układzie współrzędnych kartezjańskich, zachowując stałą prędkość liniową i zadaną orientację kątową narzędzia.\n\nSterownik robota realizuje MoveL poprzez ciągłe przeliczanie tzw. prostej i odwrotnej kinematyki w czasie rzeczywistym (co kilka milisekund przeliczając współrzędne X, Y, Z na kąty obrotu osi 1..6).\n\nZastosowanie MoveL:\n1. Precyzyjne dojazdy pionowe (w osi Z) do detali w gniazdach i na paletach (unikanie kolizji ze ściankami).\n2. Kreślenie linii prostych, spawanie, cięcie laserowe, uszczelnianie, klejenie.",
      syntax: [{"instruction": "MoveL", "syntax": "MoveL ToPoint, Speed, Zone, Tool [\\WObj];", "description": "Ruch w interpolacji liniowej kartezjańskiej.", "params": ["ToPoint: cel ruchu", "Speed: zadana prędkość TCP (mm/s)", "Zone: precyzja przejścia (fine/z...)", "Tool: aktywne narzędzie"]}],
      keyConcepts: ["MoveL prowadzi TCP w linii prostej pomiędzy bieżącą pozycją a celem.", "Ruch liniowy może natrafić na osobliwość kinematyczną (Singularity) - zwłaszcza gdy oś 5 osiąga kąt 0°.", "Dlatego dalekie dojazdy wykonuje się MoveJ, a bezpośrednie zbliżenie do detalu MoveL."],
      examTips: ["W arkuszach ELM.08 niemal zawsze pojawia się wymóg: 'W programie co najmniej raz wykorzystaj ruch w interpolacji liniowej'.", "Podjazd pionowy do detalu (Approach) oraz zjazd (Pick) ZAWSZE realizuj ruchem MoveL!"],
      industrialContext: "W aplikacjach klejenia lub cięcia laserowego prędkość w MoveL musi być idealnie stała, aby grubość spoiny lub cięcia nie ulegała zmianie.",
    },
  },
  {
    id: "circle",
    title: "4. Ruch po łuku kołowym (MoveC)",
    topic: "Interpolacja kołowa",
    summary: "Ruch MoveC po okręgu z wykorzystaniem punktu pośredniego (via point) i punktu końcowego.",
    tool: "pen",
    code: `MODULE MainModule

    PROC main()
        TPWrite "Start kreślenia okręgu ruchem MoveC";
        MoveJ pCircleStart, v200, fine, tPen;
        MoveL pCircleA, v100, fine, tPen;
        ! Pierwszy półokrąg: przez punkt pośredni B do C
        MoveC pCircleB, pCircleC, v100, fine, tPen;
        ! Drugi półokrąg: przez punkt pośredni D powrót do A
        MoveC pCircleD, pCircleA, v100, fine, tPen;
        MoveJ pHome, v200, fine, tPen;
        TPWrite "Okrąg zakończony pomyślnie";
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 4: Interpolacja kołowa (MoveC) i łuki przestrzenne",
      overview: "Zgodnie z zasadami geometrii, przez dowolne 3 niewspółliniowe punkty w przestrzeni trójwymiarowej można poprowadzić dokładnie jeden okrąg lub łuk kołowy.\n\nInstrukcja MoveC (Circular Move) w języku RAPID wykorzystuje tę zasadę:\n- Punkt 1: Aktualna pozycja robota (gdzie robot stoi przed wykonaniem MoveC),\n- Punkt 2: CirPoint (punkt pośredni na łuku okręgu),\n- Punkt 3: ToPoint (punkt docelowy łuku).\n\nAby narysować pełny okrąg 360°, należy połączyć dwa kolejne polecenia MoveC (każde zakreśla łuk 180°), ponieważ pojedynczy MoveC nie może mieć punktu początkowego równego punktowi docelowemu.",
      syntax: [{"instruction": "MoveC", "syntax": "MoveC CirPoint, ToPoint, Speed, Zone, Tool [\\WObj];", "description": "Ruch po łuku kołowym przechodzącym przez punkt pośredni CirPoint do punktu docelowego ToPoint.", "params": ["CirPoint: punkt na łuku", "ToPoint: koniec łuku", "Speed: prędkość", "Zone: strefa", "Tool: narzędzie"]}],
      keyConcepts: ["MoveC wymaga znajomości punktu pośredniego wyznaczającego krzywiznę łuku.", "Pełen okrąg wymaga dwóch instrukcji MoveC (np. łuk A->B->C i łuk C->D->A).", "Ruch MoveC jest wymagany na egzaminach CKE ELM.08-103 (omijanie przeszkody po łuku), 111 oraz 112."],
      examTips: ["Częsty błąd: podanie tego samego punktu jako CirPoint i ToPoint prowadzi do błędu wykonania kontrolera.", "Pomiędzy MoveL a MoveC nie jest wymagane zatrzymanie fine, jeśli zależy nam na płynnym przejściu konturu."],
      industrialContext: "MoveC jest powszechnie stosowany w zrobotyzowanym gratowaniu odlewów, spawaniu rur oraz montażu kołnierzy silników.",
    },
  },
  {
    id: "offsets",
    title: "5. Przesunięcia współrzędnych (Offs)",
    topic: "Matematyka trajektorii",
    summary: "Funkcja Offs(pPoint, dx, dy, dz) do generowania bezpiecznych pozycji najazdowych i wielopoziomowego odkładania.",
    tool: "gripper",
    code: `MODULE MainModule

    PROC main()
        TPWrite "Pobieranie detalu z użyciem Offs Z=+80mm";
        ! Dojazd 80 mm nad detal
        MoveJ Offs(pGripPick, 0, 0, 80), v200, fine, tGripper;
        ! Zjazd liniowy do detalu
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        ! Pionowe podniesienie o 80 mm
        MoveL Offs(pGripPick, 0, 0, 80), v100, fine, tGripper;
        
        ! Transport nad miejsce odłożenia z offsetem
        MoveJ Offs(pGripPlace, 0, 0, 80), v200, fine, tGripper;
        MoveL pGripPlace, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL Offs(pGripPlace, 0, 0, 80), v100, fine, tGripper;
        MoveJ pHome, v200, fine, tGripper;
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 5: Funkcja matematyczna Offs i programowanie elastycznych trajektorii",
      overview: "W programowaniu przemysłowym definiowanie osobnego punktu robtarget dla każdego podejścia i odejścia jest nieefektywne i zaciemnia kod. Funkcja matematyczna Offs() pozwala na dynamiczne przesunięcie współrzędnych bazowego celu o zadany wektor [X, Y, Z] w milimetrach.\n\nSkładnia funkcji: Offs(punkt_bazowy, dx, dy, dz)\n- dx: przesunięcie wzdłuż osi X,\n- dy: przesunięcie wzdłuż osi Y,\n- dz: przesunięcie wzdłuż osi Z (np. +50 unosi narzędzie o 50 mm w górę).\n\nZastosowanie Offs na egzaminie CKE ELM.08:\n- Bezpieczne podejścia pionowe (Approach / Depart) bez uczenia dodatkowych punktów.\n- Paletyzacja matrycowa detali w wierszach i kolumnach.\n- Sztaplowanie detali w wieżę (kolejne warstwy: Z=+50, Z=+100, Z=+150 mm).",
      syntax: [{"instruction": "Offs", "syntax": "Offs(Point, XOffset, YOffset, ZOffset)", "description": "Zwraca pozycję przesuniętą o zadany wektor kartezjański.", "params": ["Point: robtarget", "XOffset: przesunięcie X (mm)", "YOffset: przesunięcie Y (mm)", "ZOffset: przesunięcie Z (mm)"]}],
      keyConcepts: ["Offs nie tworzy nowego punktu w pamięci robota, lecz modyfikuje współrzędne w locie.", "Przesunięcie następuje w aktywnym układzie odniesienia narzędzia lub przedmiotu.", "Offset Z dodatni unosi narzędzie w górę, ujemny opuszcza w dół."],
      examTips: ["Zadanie ELM.08-104 wymaga zbadania osi z Offs(PINIT, 0, 0, 50).", "W zadaniach rysunkowych 111 i 112 Offs(..., 0, 0, 20) służy do uniesienia pisaka nad arkuszem podczas przejazdów jałowych."],
      industrialContext: "W zrobotyzowanej paletyzacji za pomocą jednej pozycji bazowej pCorner oraz dwóch pętli z funkcją Offs można obsłużyć całą paletę euro zawierającą kilkadziesiąt skrzynek.",
    },
  },
  {
    id: "wobj",
    title: "6. Układy przedmiotu (WorkObjects \\WObj)",
    topic: "Układy współrzędnych",
    summary: "Rysowanie figur w ruchomych lub wielostrefowych układach współrzędnych przedmiotu \\WObj:=wobj1 i \\WObj:=wobj2.",
    tool: "pen",
    code: `MODULE MainModule

    PROC main()
        TPWrite "Rysowanie na lewym arkuszu (wobj1)";
        MoveJ Offs(pSquare1, 0, 0, 20), v100, fine, tPen \WObj:=wobj1;
        MoveL pSquare1, v50, fine, tPen \WObj:=wobj1;
        MoveL pSquare2, v50, fine, tPen \WObj:=wobj1;
        MoveL pSquare3, v50, fine, tPen \WObj:=wobj1;
        MoveL pSquare4, v50, fine, tPen \WObj:=wobj1;
        MoveL pSquare1, v50, fine, tPen \WObj:=wobj1;
        MoveL Offs(pSquare1, 0, 0, 20), v100, fine, tPen \WObj:=wobj1;
        
        TPWrite "Powrót do bazy pHome w wobj0";
        MoveJ pHome, v200, fine, tPen;
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 6: Układy współrzędnych przedmiotu obrabianego (WorkObjects)",
      overview: "W standardowym układzie robota (World/Base - wobj0) punkty są przywiązane do podstawy maszyny. Jeśli stół montażowy, paleta lub detal zostaną przesunięte o 50 mm, wszystkie wyuczone punkty przestają pasować.\n\nRozwiązaniem jest układ współrzędnych przedmiotu (Work Object - wobjdata). Definiuje on lokalny układ kartezjański powiązany z fizycznym detalem lub stołem roboczym. Współrzędne punktów podawane są wówczas względem początku tego obiektu.\n\nKorzyści z WorkObjects:\n1. Jeśli przestawimy stół lub arkusz, wystarczy zmierzyć 3 punkty kalibracyjne układu wobj, a wszystkie zaprogramowane trajektorie automatycznie przesuną się we właściwe miejsce.\n2. Ten sam program (np. spawanie ramy) można wykonać na stanowisku 1 (\\WObj:=wobj1) i na stanowisku 2 (\\WObj:=wobj2) bez przeprogramowywania punktów!",
      syntax: [{"instruction": "\\WObj", "syntax": "MoveL Target, Speed, Zone, Tool \\WObj:=nazwa_wobj;", "description": "Przełącznik opcjonalny nakazujący interpretację współrzędnych celu w zadanym układzie przedmiotu.", "params": ["\\WObj:=wobj1", "\\WObj:=wobj2"]}],
      keyConcepts: ["Domyślnym układem przy braku przełącznika \\WObj jest wobj0 (układ globalny robota).", "Wszystkie punkty trajektorii w obrębie danego obiektu powinny być wywoływane z tym samym przełącznikiem \\WObj.", "Pozycje bazowe pHome zaleca się wykonywać w wobj0."],
      examTips: ["Arkusze CKE ELM.08-111 oraz 112 wymagają bezwzględnego stosowania \\WObj:=wobj1 oraz \\WObj:=wobj2.", "Zwróć uwagę na wielkość liter i poprawność dwukropka ze znakiem równości: \\WObj:=wobj1."],
      industrialContext: "Na liniach zgrzewania karoserii samochodowych WorkObject jest kalibrowany za pomocą czujników optycznych po każdym wjechaniu wózka transportowego do gniazda.",
    },
  },
  {
    id: "inputs",
    title: "7. Cyfrowe wejścia i przyciski (WaitDI, DInput)",
    topic: "Digital Inputs (DI)",
    summary: "Synchronizacja pracy robota z przyciskiem operatora S1 oraz czujnikami obecności detali B1..B5.",
    tool: "gripper",
    code: `MODULE MainModule

    PROC main()
        TPWrite "Oczekiwanie na przycisk START (S1)...";
        ! Czekaj na wciśnięcie przycisku S1 (stan wysoki 1)
        WaitDI S1, 1;
        TPWrite "Przycisk S1 wciśnięty. Rozpoczęcie cyklu.";
        
        MoveJ pGripApproach, v200, fine, tGripper;
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
        
        ! Przejazd nad czujnik indukcyjny B5
        MoveJ pSensorB5, v200, fine, tGripper;
        WaitTime 1.0;
        
        ! Sprawdzenie stanu czujnika B5
        IF DInput(B5) = 1 THEN
            TPWrite "Wykryto detal metalowy (B5=1)!";
        ELSE
            TPWrite "Detal niemetalowy (tworzywo, B5=0).";
        ENDIF
        
        MoveJ pHome, v200, fine, tGripper;
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 7: Sygnały wejściowe DI, synchronizacja i czujniki przemysłowe",
      overview: "Robot przemysłowy nie pracuje w izolacji. Sygnały wejściowe cyfrowe (Digital Inputs - DI) to elektryczne linie sygnałowe (typowo 24V DC), które dostarczają do kontrolera robota informacje o stanie otoczenia:\n- Przyciski sterownicze operatora (S1 - START, STOP, E-STOP),\n- Czujniki optyczne (B1, B3, B4) - wykrywanie krawędzi lub obecności detalu na taśmie,\n- Czujniki indukcyjne (B5) - detekcja metali ferromagnetycznych,\n- Czujniki ciśnienia i kontaktrony pneumatyczne.\n\nInstrukcja WaitDI (Wait Digital Input) wstrzymuje wykonanie programu w danej linii do momentu, gdy podane wejście osiągnie zadany stan (0 lub 1).\n\nFunkcja DInput(sygnał) służy do natychmiastowego odczytania wartości logicznej (zwraca 1 lub 0) wewnątrz wyrażeń warunkowych IF lub pętli WHILE.",
      syntax: [{"instruction": "WaitDI", "syntax": "WaitDI Signal, Value [\\MaxTime:=Czas] [\\TimeFlag:=Flaga];", "description": "Zatrzymuje program do momentu, aż sygnał cyfrowy osiągnie zadaną wartość (0 lub 1).", "params": ["Signal: nazwa sygnału dinput", "Value: 1 lub 0", "\\MaxTime: maksymalny czas oczekiwania (s)"]}, {"instruction": "DInput", "syntax": "DInput(Signal)", "description": "Funkcja zwracająca bieżący stan wejścia cyfrowego (1 lub 0).", "params": ["Signal: nazwa sygnału"]}],
      keyConcepts: ["WaitDI blokuje wskaźnik programu (PP) dopóki warunek nie zostanie spełniony.", "DInput nie blokuje programu - pobiera stan natychmiastowo.", "Przyciski monostabilne (jak S1) po wciśnięciu przyjmują stan 1, a po zwolnieniu powracają do 0.", "Wykrywanie zbocza opadającego (np. zabranie detalu) realizuje się przez WaitDI B4, 0;."],
      examTips: ["W każdym zadaniu CKE ELM.08 pierwszym krokiem po starcie programu jest WaitDI S1, 1;.", "W symulatorze RAPID Sim sygnały wejściowe można wymuszać klikając przyciski w panelu SIGNALS na dole ekranu."],
      industrialContext: "W bezpiecznych gniazdach zrobotyzowanych sygnał diSafetyOk pochodzi z kurtyny świetlnej lub skanera laserowego - przerwanie wiązki powoduje natychmiastowe zatrzymanie robota.",
    },
  },
  {
    id: "outputs",
    title: "8. Cyfrowe wyjścia i chwytak (Set, Reset, PulseDO)",
    topic: "Digital Outputs (DO)",
    summary: "Sterowanie chwytakiem pneumaticznym, lampkami sygnalizacyjnymi i generowanie impulsów synchronizujących dla PLC.",
    tool: "gripper",
    code: `MODULE MainModule

    PROC main()
        TPWrite "Inicjalizacja wyjść: wygaszenie lampek";
        Reset H1;
        Reset H2;
        
        TPWrite "Otwarcie chwytaka i gotowość";
        Reset doGripper;
        Set H1; ! Lampka H1 sygnalizuje gotowość
        WaitTime 1.0;
        
        TPWrite "Zamknięcie chwytaka";
        Set doGripper;
        WaitTime 0.5; ! Czas na mechaniczne domknięcie szczęk
        Reset H1;
        Set H2; ! Lampka H2 sygnalizuje zaciśnięcie chwytaka
        
        TPWrite "Wysłanie impulsu K3 (1s) do sterownika PLC";
        PulseDO \\PLength:=1.0, K3;
        
        TPWrite "Wyłączenie wyjść i powrót do HOME";
        Reset H2;
        MoveJ pHome, v200, fine, tGripper;
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 8: Wyjścia cyfrowe DO, pneumatyka i komunikacja z PLC",
      overview: "Wyjścia cyfrowe (Digital Outputs - DO) umożliwiają sterownikowi robota oddziaływanie na świat zewnętrzny:\n- Załączanie cewek elektrozaworów pneumatycznych (doGripper) otwierających i zamykających szczęki chwytaka,\n- Sterowanie kolumnami sygnalizacyjnymi i lampkami pulpitowymi (H1 - zielona/gotowość, H2 - czerwona/praca),\n- Uruchamianie styczników silników taśmociągów (doConvRun, START_STOP),\n- Przekazywanie sygnałów synchronizacyjnych i zezwoleń do nadrzędnego sterownika PLC (np. impuls K3).\n\nKluczowe instrukcje RAPID:\n- Set doSignal; - ustawienie stanu 1 (załączenie 24V),\n- Reset doSignal; - ustawienie stanu 0 (odłączenie 24V),\n- PulseDO [\\PLength:=czas], doSignal; - wystawienie impulsu o zadanym czasie trwania.",
      syntax: [{"instruction": "Set", "syntax": "Set Signal;", "description": "Ustawia wyjście cyfrowe w stan wysoki (1 / TRUE).", "params": ["Signal: nazwa doutput"]}, {"instruction": "Reset", "syntax": "Reset Signal;", "description": "Ustawia wyjście cyfrowe w stan niski (0 / FALSE).", "params": ["Signal: nazwa doutput"]}, {"instruction": "PulseDO", "syntax": "PulseDO [\\PLength:=czas], Signal;", "description": "Generuje impuls prostokątny o zadanym czasie trwania (domyślnie 0.2 s).", "params": ["\\PLength:=czas_w_sekundach", "Signal: nazwa wyjścia"]}],
      keyConcepts: ["Elektrozawory pneumatyczne mają bezwładność mechaniczną - po Set/Reset doGripper ZAWSZE należy zastosować WaitTime (np. 0.5 s).", "Brak WaitTime po chwyceniu detalu spowoduje, że robot zacznie unosić ramię zanim szczęki zdążą zablokować detal!", "Instrukcja PulseDO nie blokuje wykonywania programu - impuls generowany jest asynchronicznie przez kartę wejść/wyjść."],
      examTips: ["W zadaniu ELM.08-107 wymagany jest impuls na cewkę K3 o długości 1 sekundy: PulseDO \\PLength:=1.0, K3;.", "Pamiętaj o wyzerowaniu wyjść po zakończeniu pracy programu."],
      industrialContext: "W profesjonalnych chwytakach stosuje się czujniki zbliżeniowe potwierdzenia zamknięcia (GripperClosed) i czujnik podciśnienia w przyssawkach (VacuumOK).",
    },
  },
  {
    id: "conditions",
    title: "9. Instrukcje warunkowe (IF / ELSEIF / ELSE)",
    topic: "Sterowanie przepływem",
    summary: "Rozgałęzianie trajektorii i decyzje technologiczne w oparciu o odczyty czujników materiałowych.",
    tool: "gripper",
    code: `MODULE MainModule

    PROC main()
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Sprawdzanie materiału na czujniku B5...";
        MoveJ pSensorB5, v200, fine, tGripper;
        WaitTime 2.0; ! Czas na stabilizację pomiaru
        
        IF DInput(B5) = 1 THEN
            TPWrite "WYNIK: Detal METALOWY. Transport do Pojemnika 2";
            Set H1;
            MoveJ pBin2, v200, fine, tGripper;
            Reset doGripper;
            WaitTime 0.5;
            Reset H1;
        ELSE
            TPWrite "WYNIK: Detal TWORZYWO. Transport do Pojemnika 1";
            Reset H1;
            MoveJ pBin1, v200, fine, tGripper;
            Reset doGripper;
            WaitTime 0.5;
        ENDIF
        
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Koniec cyklu decyzyjnego.";
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 9: Instrukcje warunkowe IF-THEN-ELSE i algorytmy decyzyjne",
      overview: "Zrobotyzowane stanowiska automatyki muszą autonomicznie reagować na zmienne warunki produkcji: rodzaj surowca, brak detalu, wykrycie wady lub zapełnienie zasobnika.\n\nW języku RAPID podstawową strukturą decyzyjną jest blok warunkowy IF:\n- Jeśli warunek logiczny po słowie THEN jest prawdziwy (TRUE), wykonywane są instrukcje wewnątrz bloku.\n- Opcjonalne słowo ELSEIF pozwala na sprawdzenie kolejnego warunku alternatywnego.\n- Słowo ELSE określa gałąź domyślną, wykonywaną gdy żaden wcześniejszy warunek nie został spełniony.\n- Blok ZAWSZE musi być zakończony słowem kluczowym ENDIF.\n\nOperatory porównania w RAPID:\n= (równe), <> (różne), < (mniejsze), > (większe), <= (mniejsze równe), >= (większe równe).\nOperatory logiczne: AND (koniunkcja), OR (alternatywa), NOT (negacja).",
      syntax: [{"instruction": "IF", "syntax": "IF warunek THEN\\n    ! kod gdy TRUE\\n[ELSEIF warunek2 THEN\\n    ! kod alternatywny]\\n[ELSE\\n    ! kod domyślny]\\nENDIF", "description": "Instrukcja warunkowego wykonania bloku kodu.", "params": ["warunek logiczny (np. DInput(B5) = 1)", "AND / OR / NOT"]}],
      keyConcepts: ["W języku RAPID operatorem równości jest pojedynczy znak '=' (a nie '==' jak w C/Pythonie).", "Operatorem różności jest '<>' (a nie '!=').", "Każdy blok IF musi posiadać odpowiadające mu słowo kończące ENDIF."],
      examTips: ["Zadania CKE ELM.08-101, 106 i 107 opierają się bezpośrednio na instrukcji IF B5 = 1 THEN ... ELSE ... ENDIF.", "Zawsze dbaj o czytelne wcięcia kodu (indentację) wewnątrz bloków IF - ułatwia to kontrolę poprawności struktury."],
      industrialContext: "W systemach wizyjnych wynik inspekcji jakościowej przekazywany jest jako kod błędu do robota, który w bloku IF decyduje o odłożeniu detalu na linię sprawną lub do strefy braków (Reject).",
    },
  },
  {
    id: "loops_for",
    title: "10. Pętla licznikowa (FOR ... FROM ... TO)",
    topic: "Pętle programowe",
    summary: "Wykonywanie cyklu zadanej liczby powtórzeń przy paletyzacji i pobieraniu partii detali.",
    tool: "gripper",
    code: `MODULE MainModule

    VAR num i := 0;

    PROC main()
        TPWrite "Rozpoczęcie rozładunku partii 4 detali";
        MoveJ pHome, v200, fine, tGripper;
        
        FOR i FROM 1 TO 4 DO
            TPWrite "--- Cykl pobrania detalu nr: " \Num:=i;
            MoveJ pFeederAbove, v200, fine, tGripper;
            MoveL pFeederPick, v100, fine, tGripper;
            Set doGripper;
            WaitTime 0.5;
            MoveL pFeederAbove, v100, fine, tGripper;
            
            MoveJ pConvStartAbove, v200, fine, tGripper;
            MoveL pConvStart, v100, fine, tGripper;
            Reset doGripper;
            WaitTime 0.5;
            MoveL pConvStartAbove, v100, fine, tGripper;
            
            ! Chwilowy ruch taśmy celem zwolnienia miejsca
            Set doConvRun;
            WaitTime 1.5;
            Reset doConvRun;
        ENDFOR
        
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Wszystkie 4 detale zostały rozładowane pomyślnie!";
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 10: Pętla licznikowa FOR-FROM-TO i automatyzacja cykli",
      overview: "Zamiast powielać w programie te same bloki kodu czterokrotnie czy sześciokrotnie, w języku RAPID stosuje się pętlę licznikową FOR.\n\nPętla FOR powtarza wykonanie zawartych w niej instrukcji dla rosnącej (lub malejącej z opcją STEP) wartości zmiennej sterującej od wartości początkowej FROM do wartości końcowej TO włącznie.\n\nStruktura pętli:\nFOR zmienna FROM start TO koniec [STEP krok] DO\n    ! instrukcje powtarzane w każdym cyklu\nENDFOR\n\nZastosowanie na egzaminie CKE ELM.08:\n- Zadanie 103: pętla FOR i FROM 1 TO 6 DO do przeniesienia 6 klocków do magazynu docelowego.\n- Zadanie 105: pętla FOR i FROM 1 TO 4 DO do rozładunku 4 detali z magazynu opadowego.\n- Paletyzacja matrycowa: zmienna 'i' może być użyta do obliczenia offsetu Z lub pozycji kolejnego gniazda.",
      syntax: [{"instruction": "FOR", "syntax": "FOR counter FROM start TO end [STEP step] DO\\n    ! powtarzane instrukcje\\nENDFOR", "description": "Pętla iteracyjna o ustalonej z góry liczbie kroków.", "params": ["counter: zmienna numeryczna", "start: wartość początkowa", "end: wartość końcowa", "STEP: opcjonalny krok iteracji"]}],
      keyConcepts: ["Pętla FOR wykonuje się dokładnie (koniec - start + 1) razy przy domyślnym kroku 1.", "Zmienna licznikowa po zakończeniu pętli osiąga wartość równą wartości końcowej.", "Nie należy modyfikować wartości zmiennej licznikowej wewnątrz ciała pętli FOR."],
      examTips: ["Pętla FOR znacząco skraca długość programu i jest wysoko oceniana w kryteriach jakości kodu przez egzaminatorów CKE.", "Zawsze pamiętaj o słowie zamykającym ENDFOR."],
      industrialContext: "Pętla FOR jest standardem w aplikacjach pakowania do kartonów zbiorczych, gdzie robot układa warstwy produktów w stałej siatce pozycji.",
    },
  },
  {
    id: "loops_while",
    title: "11. Pętla warunkowa (WHILE ... DO)",
    topic: "Pętle programowe",
    summary: "Pętla dopóki (WHILE) do obsługi pracy ciągłej linii produkcyjnej aż do wystąpienia warunku zatrzymania.",
    tool: "gripper",
    code: `MODULE MainModule

    VAR num nCycles := 0;

    PROC main()
        TPWrite "Praca w pętli WHILE do momentu osiągnięcia 3 cykli";
        MoveJ pHome, v200, fine, tGripper;
        
        WHILE nCycles < 3 DO
            Incr nCycles;
            TPWrite "Rozpoczęcie cyklu produkcyjnego nr: " \Num:=nCycles;
            MoveJ pGripApproach, v200, fine, tGripper;
            MoveL pGripPick, v100, fine, tGripper;
            Set doGripper;
            WaitTime 0.5;
            MoveL pGripApproach, v100, fine, tGripper;
            Reset doGripper;
            WaitTime 0.5;
        ENDWHILE
        
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Pętla WHILE zakończona. Łącznie cykli: " \Num:=nCycles;
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 11: Pętla warunkowa WHILE-DO i obsługa procesów ciągłych",
      overview: "W odróżnieniu od pętli FOR, która wykonuje się z góry znaną liczbę razy, pętla WHILE (dopóki) wykonuje się tak długo, jak długo spełniony jest zadany warunek logiczny.\n\nPrzed każdym wykonaniem ciała pętli sterownik sprawdza warunek początkowy:\n- Jeśli warunek jest prawdziwy (TRUE), wykonywane są instrukcje wewnątrz bloku, po czym następuje powrót do sprawdzenia warunku.\n- Jeśli warunek jest fałszywy (FALSE) już na początku, pętla nie wykona się ani razu.\n\nStruktura pętli:\nWHILE warunek_logiczny DO\n    ! instrukcje\nENDWHILE\n\nTypowe zastosowania w robotyce:\n1. Oczekiwanie na opróżnienie bufora: WHILE DInput(diPartPresent) = 1 DO ... ENDWHILE,\n2. Praca ciągła stacji aż do wciśnięcia przycisku zatrzymania lub wyzerowania sygnału gotowości,\n3. Algorytmy dozowania i napełniania z kontrolą poziomu.",
      syntax: [{"instruction": "WHILE", "syntax": "WHILE warunek DO\\n    ! instrukcje\\nENDWHILE", "description": "Pętla wykonująca się dopóki warunek pozostaje spełniony.", "params": ["warunek: wyrażenie logiczne (np. nLicznik < 10, DInput(B1) = 1)"]}],
      keyConcepts: ["Pętla sprawdza warunek na początku (przed wykonaniem instrukcji).", "Aby uniknąć zawieszenia programu w nieskończonej pętli, wewnątrz ciała pętli musi istnieć operacja, która w pewnym momencie zmieni wartość warunku na FALSE!", "W pętli sterującej maszyną zawsze uwzględniaj czas cyklu lub odpytywanie czujników."],
      examTips: ["Pamiętaj o zamknięciu pętli słowem ENDWHILE.", "Jeśli w pętli używasz licznika, upewnij się, że jest on inkrementowany (Incr nZmienna;) w każdym przebiegu."],
      industrialContext: "Główne procedury stacji zrobotyzowanych często działają w pętli WHILE diProductionActive = 1 DO, z bezpiecznym wyjściem do HOME po zakończeniu zmiany roboczej.",
    },
  },
  {
    id: "variables",
    title: "12. Zmienne i operacje arytmetyczne (VAR num)",
    topic: "Zmienne i dane",
    summary: "Deklaracja zmiennych num, przypisanie wartości (:=), inkrementacja (Incr) i operacje arytmetyczne.",
    tool: "pen",
    code: `MODULE MainModule

    VAR num nCount := 0;
    VAR num nTotal := 0;

    PROC main()
        TPWrite "Demonstracja zmiennych i arytmetyki w RAPID";
        nCount := 10;
        nTotal := nCount * 2 + 5;
        TPWrite "Wynik nTotal (10 * 2 + 5) = " \Num:=nTotal;
        
        Incr nCount;
        TPWrite "Po Incr nCount = " \Num:=nCount;
        
        Decr nTotal;
        TPWrite "Po Decr nTotal = " \Num:=nTotal;
        
        Add nCount, 5;
        TPWrite "Po Add nCount, 5 = " \Num:=nCount;
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 12: Zmienne w języku RAPID, typy danych i operacje arytmetyczne",
      overview: "Zmienne służą do przechowywania danych, które zmieniają się w trakcie działania programu. W języku RAPID deklaracja zmiennej zaczyna się od słowa kluczowego określającego jej trwałość (zazwyczaj VAR), po którym następuje typ danych, nazwa zmiennej oraz opcjonalna wartość początkowa.\n\nPodstawowe typy danych w RAPID:\n- num: liczby (zarówno całkowite, jak i zmiennoprzecinkowe, np. 5, 3.14),\n- bool: wartości logiczne (TRUE lub FALSE),\n- string: łańcuchy znaków tekstowych (np. \"Detal OK\"),\n- robtarget: rekord współrzędnych przestrzennych punktu [X, Y, Z, q1, q2, q3, q4, ...].\n\nOperacje modyfikacji zmiennych numerycznych:\n- Przypisanie: zmienna := wyrażenie; (np. x := a + b * 2;),\n- Inkrementacja (zwiększenie o 1): Incr zmienna;,\n- Dekrementacja (zmniejszenie o 1): Decr zmienna;,\n- Dodawanie: Add zmienna, wartość;,\n- Czyszczenie (wyzerowanie): Clear zmienna; (ustawia 0).",
      syntax: [{"instruction": "VAR", "syntax": "VAR typ nazwa [:= wartość_początkowa];", "description": "Deklaracja zmiennej w module lub procedurze.", "params": ["typ: num, bool, string, robtarget"]}, {"instruction": ":=", "syntax": "zmienna := wyrażenie;", "description": "Operator przypisania wartości w języku RAPID.", "params": ["wyrażenie: arytmetyczne, logiczne lub tekstowe"]}, {"instruction": "Incr / Decr", "syntax": "Incr zmienna; / Decr zmienna;", "description": "Zwiększa (Incr) lub zmniejsza (Decr) wartość zmiennej num o 1.", "params": ["zmienna: nazwa zmiennej typu num"]}],
      keyConcepts: ["Operator przypisania w RAPID to zawsze dwukropek ze znakiem równości ':=' (sam znak '=' służy wyłącznie do porównań).", "Instrukcja Incr nVal; jest równoważna zapisowi nVal := nVal + 1; ale jest bardziej zwięzła i czytelna.", "Zmienne zadeklarowane poza procedurami (na poziomie modułu) są widoczne we wszystkich procedurach tego modułu."],
      examTips: ["W zadaniu treningowym #3 oraz w zadaniach ze zliczaniem detali wymagane jest użycie VAR num oraz Incr.", "Pamiętaj o właściwej kolejności działań w wyrażeniach arytmetycznych (mnożenie i dzielenie mają pierwszeństwo przed dodawaniem)."],
      industrialContext: "Zmienne persystentne (PERS num nTotalParts) na kontrolerach ABB zachowują swoją wartość nawet po wyłączeniu zasilania szafy sterowniczej, co zapobiega utracie stanu licznika produkcji.",
    },
  },
  {
    id: "procedures",
    title: "13. Podprogramy i procedury (PROC)",
    topic: "Struktura programu",
    summary: "Modularyzacja programu i dekompozycja zadań na czytelne procedury technologiczne.",
    tool: "gripper",
    code: `MODULE MainModule

    PROC InicjalizacjaStanowiska()
        TPWrite "--- Inicjalizacja stanowiska ---";
        Reset H1;
        Reset H2;
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
    ENDPROC

    PROC PobierzDetal()
        TPWrite "Pobieranie detalu...";
        MoveJ pGripApproach, v200, fine, tGripper;
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
    ENDPROC

    PROC OdlozDetal()
        TPWrite "Odkladanie detalu...";
        MoveJ pGripRetreat, v200, fine, tGripper;
        MoveL pGripPlace, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL pGripRetreat, v100, fine, tGripper;
    ENDPROC

    PROC main()
        TPWrite "Uruchomienie programu głównego";
        InicjalizacjaStanowiska;
        PobierzDetal;
        OdlozDetal;
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Zadanie zrealizowane za pomocą procedur.";
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 13: Procedury (PROC), podprogramy i architektura kodu RAPID",
      overview: "W profesjonalnym programowaniu robotów przemysłowych cały kod nie powinien znajdować się w jednej, tasiemcowej procedurze main(). Zamiast tego stosuje się dekompozycję funkcjonalną - dzieląc program na logiczne, samowystarczalne podprogramy (procedury).\n\nZalety stosowania procedur:\n1. Czytelność: procedura main() staje się 'spisem treści' procesu technologicznego,\n2. Łatwość testowania: każdą procedurę można przetestować niezależnie w trybie ręcznym krok po kroku na FlexPendant,\n3. Reużywalność: procedurę InicjalizacjaStanowiska() można wywołać na początku, na końcu oraz w procedurze obsługi błędów.\n\nDefinicja procedury rozpoczyna się od słowa kluczowego PROC NazwaProcedury(), a kończy słowem ENDPROC.\nWywołanie procedury polega na podaniu jej nazwy ze średnikiem: NazwaProcedury;.",
      syntax: [{"instruction": "PROC", "syntax": "PROC NazwaProcedury()\\n    ! instrukcje procedury\\nENDPROC", "description": "Definiuje nową procedurę użytkownika.", "params": ["NazwaProcedury: identyfikator"]}],
      keyConcepts: ["Procedury pomocnicze muszą być zadeklarowane w tym samym module lub w module systemowym.", "Wywołanie procedury bez parametrów nie wymaga nawiasów (np. PobierzDetal;).", "Wykonywanie procedury kończy się po napotkaniu ENDPROC lub instrukcji RETURN."],
      examTips: ["Podział programu na czytelne procedury demonstruje wysokie kompetencje programistyczne zdającego egzamin technika robotyka.", "Pamiętaj, że procedura główna ZAWSZE musi nosić nazwę 'main'."],
      industrialContext: "W fabrykach samochodowych programy zawierają dziesiątki procedur: HomePos(), CleanGun(), ServicePos(), TipDress(), co pozwala na błyskawiczną diagnostykę linii produkcyjnej.",
    },
  },
  {
    id: "params",
    title: "14. Procedury z parametrami (PROC z robtarget)",
    topic: "Zaawansowany RAPID",
    summary: "Tworzenie sparametryzowanych podprogramów przyjmujących punkty docelowe jako argumenty wywołania.",
    tool: "gripper",
    code: `MODULE MainModule

    ! Procedura uniwersalna nakładająca detal na dowolny zadany wałek
    PROC NakladajNaWalek(robtarget pWalek)
        TPWrite "Pobieranie detalu z zasobnika...";
        MoveJ pGripApproach, v200, fine, tGripper;
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
        
        TPWrite "Transport i montaż na zadanym wałku...";
        MoveJ Offs(pWalek, 0, 0, 80), v200, fine, tGripper;
        MoveL pWalek, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL Offs(pWalek, 0, 0, 80), v100, fine, tGripper;
    ENDPROC

    PROC main()
        TPWrite "Start cyklu montażu na 3 wałkach";
        MoveJ pHome, v200, fine, tGripper;
        
        ! Wywołanie tej samej procedury z trzema różnymi punktami docelowymi
        NakladajNaWalek pPin1;
        NakladajNaWalek pPin2;
        NakladajNaWalek pPin3;
        
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Montaż na wszystkich wałkach zakończony!";
    ENDPROC

ENDMODULE`,
    lecture: {
      title: "Wykład 14: Parametryzacja procedur i reużywalność algorytmów",
      overview: "W zadaniu egzaminacyjnym CKE ELM.08-107 robot ma nałożyć detale na 3 różne wałki montażowe: pPin1, pPin2, pPin3. Zamiast pisać 3 niemal identyczne procedury różniące się tylko jednym punktem docelowym, profesjonalny programista RAPID definiuje jedną procedurę parametryzowaną.\n\nParametryzacja polega na umieszczeniu w nagłówku procedury deklaracji parametrów formalnych:\nPROC NakladajNaWalek(robtarget pWalek)\n\nWewnątrz procedury zmienna 'pWalek' reprezentuje punkt, który zostanie przekazany w momencie wywołania:\nNakladajNaWalek pPin1;\nNakladajNaWalek pPin2;\nNakladajNaWalek pPin3;\n\nDzięki temu kod jest trzykrotnie krótszy, nie zawiera duplikatów i jest całkowicie odporny na błędy kopiowania.",
      syntax: [{"instruction": "PROC z parametrem", "syntax": "PROC Nazwa(typ parametr1 [, typ parametr2])\\n    ! ciało procedury\\nENDPROC", "description": "Definiuje podprogram przyjmujący argumenty wejściowe.", "params": ["robtarget: cel ruchu", "num: prędkość, czas lub licznik", "bool: flaga logiczna"]}, {"instruction": "Wywołanie z parametrem", "syntax": "Nazwa argument1 [, argument2]; lub Nazwa(argument1);", "description": "Wywołuje procedurę przekazując konkretne wartości lub punkty jako argumenty.", "params": ["pPin1, pPlace, v200"]}],
      keyConcepts: ["Parametry formalne procedury działają wewnątrz niej jak zmienne lokalne.", "Przekazywanie robtarget pozwala na tworzenie uniwersalnych algorytmów chwytania i odkładania.", "W języku RAPID argumenty w wywołaniu można oddzielać spacją lub zamknąć w nawiasach."],
      examTips: ["Zadanie ELM.08-107 wprost sugeruje wykorzystanie procedury parametryzowanej do montażu na wałkach pPin1..pPin3.", "Zastosowanie procedury z parametrem gwarantuje uzyskanie maksymalnej liczby punktów za strukturę kodu na egzaminie zawodowym."],
      industrialContext: "W zrobotyzowanym zgrzewaniu punktowym procedura SpotWeld(robtarget pPoint, num nTime) jest wywoływana setki razy dla każdego punktu zgrzewczego na płycie podłogowej pojazdu.",
    },
  },
];

export type TaskSignalInfo = {
  name: string;
  type: "DI" | "DO";
  description: string;
};

export type TaskTargetInfo = {
  name: string;
  description: string;
};

export type Task = {
  id: string;
  title: string;
  category: "podstawowe" | "elm08";
  topic: string;
  summary: string;
  tips: string[];
  tool: ToolKind;
  starterCode: string;
  defaultInputs?: SignalMap;
  defaultOutputs?: SignalMap;
  blocks?: BlockItem[];
  showTable?: boolean;
  showConveyor?: boolean;
  showGravityFeeder?: boolean;
  showSorterBins?: boolean;
  showMountingPins?: boolean;
  sheetId?: string;
  workstationDescription?: string;
  signalsTable?: TaskSignalInfo[];
  targetsTable?: TaskTargetInfo[];
  procedureSteps?: string[];
  evaluationCriteria?: string[];
};

export const tasks: Task[] = [
  // --- 5 ZADAŃ PODSTAWOWYCH / TRENINGOWYCH ---
  {
    id: "task-basic-1",
    sheetId: "Zadanie Treningowe #1",    workstationDescription: "Podstawowe stanowisko zrobotyzowane z manipulatorem ABB wyposażonym w narzędzie pisaka tPen. Ćwiczenie zapoznaje z obsługą konsoli Teach Pendant (FlexPendant) oraz bazowaniem manipulatora.",    signalsTable: [],    targetsTable: [{"name": "pHome", "description": "Główna pozycja bazowa (spoczynkowa) robota"}],    procedureSteps: ["Wyświetl na konsoli FlexPendant komunikat powitalny 'Robot gotowy do pracy'.", "Przemieść ramię robota ruchem przegubowym MoveJ do pozycji pHome z prędkością v200 i strefą fine.", "Wyświetl komunikat końcowy 'Pozycja bazowa osiagnieta'."],    evaluationCriteria: ["Poprawna składnia instrukcji TPWrite z literałami tekstowymi w cudzysłowach.", "Użycie ruchu osiowego MoveJ do pozycji pHome ze strefą zatrzymania fine."],
    title: "1. Komunikaty i bazowanie",
    category: "podstawowe",
    topic: "Podstawy RAPID",
    summary: "Napisz program, który po uruchomieniu wyświetli na panelu operatora komunikat powitalny \'Robot gotowy do pracy\', przemieści ramię robota ruchem MoveJ do pozycji bazowej pHome z prędkością v200 i potwierdzi osiągnięcie celu drugim komunikatem \'Pozycja bazowa osiagnieta\'.",
    tool: "pen",
    tips: [

      "Użyj instrukcji TPWrite 'tekst'; do wypisywania wiadomości w konsoli.",
      "Składnia ruchu osiowego: MoveJ punkt, predkosc, strefa, narzedzie; (np. MoveJ pHome, v200, fine, tPen;).",
      "Pamiętaj o średnikach na końcu każdej instrukcji."
    
    ],
    starterCode: `MODULE MainModule

    PROC main()
        ! Krok 1: Wypisz na panelu TPWrite komunikat "Robot gotowy do pracy"
        
        ! Krok 2: Wykonaj ruch MoveJ do punktu bazowego pHome z narzedziem tPen
        
        ! Krok 3: Wypisz komunikat "Pozycja bazowa osiagnieta"
        
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-basic-2",
    sheetId: "Zadanie Treningowe #2",    workstationDescription: "Stanowisko kreślarskie ze stołem roboczym. Robot z narzędziem tPen kreśli zamknięty kontur kwadratowy o boku 200 mm z dojazdem liniowym.",    signalsTable: [],    targetsTable: [{"name": "pHome", "description": "Pozycja bazowa początkowa i końcowa"}, {"name": "p1", "description": "Pierwszy narożnik kwadratu [-100, 320, 440]"}, {"name": "p2", "description": "Drugi narożnik kwadratu [100, 320, 440]"}, {"name": "p3", "description": "Trzeci narożnik kwadratu [100, 440, 440]"}, {"name": "p4", "description": "Czwarty narożnik kwadratu [-100, 440, 440]"}],    procedureSteps: ["Ruch przegubowy MoveJ z pozycji bieżącej do pHome.", "Zjazd liniowy MoveL do narożnika p1 z prędkością v150.", "Wykreślenie kolejnych boków ruchem liniowym MoveL przez p2, p3, p4.", "Powrót do punktu p1 celem zamknięcia obrysu.", "Ruch powrotny do pHome z prędkością v200."],    evaluationCriteria: ["Interpolacja liniowa MoveL na wszystkich krawędziach ścieżki.", "Utrzymanie stałej wysokości Z nad stołem podczas kreślenia."],
    title: "2. Rysowanie ścieżki liniowej",
    category: "podstawowe",
    topic: "Ruch liniowy MoveL",
    summary: "Ramię robota z narzędziem tPen ma narysować zamknięty kontur kwadratu. Rozpocznij od pHome, zjedź do pSquareStart, wykonaj ruchy liniowe MoveL po kolejnych wierzchołkach: pSquareA -> pSquareB -> pSquareC -> pSquareD -> pSquareA, a następnie powróć do pHome.",
    tool: "pen",
    tips: [

      "Do pierwszego wierzchołka dojedź ruchem MoveJ, a po bokach kwadratu poruszaj się ruchem MoveL.",
      "Parametry ruchu: punkt docelowy, prędkość (np. v100), strefa zatrzymania (fine) oraz narzędzie (tPen).",
      "Obserwuj ślad TCP trail w oknie symulacji 3D, aby zweryfikować ciągłość linii."
    
    ],
    starterCode: `MODULE MainModule

    PROC main()
        ! Krok 1: Dojazd z pHome do punktu pSquareStart (MoveJ)
        
        ! Krok 2: Liniowy przejazd przez kolejne wierzcholki kwadratu (MoveL)
        ! pSquareA -> pSquareB -> pSquareC -> pSquareD -> pSquareA
        
        ! Krok 3: Powrot do pozycji wyjsciowej pHome (MoveJ)
        
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-basic-3",
    sheetId: "Zadanie Treningowe #3",    workstationDescription: "Stanowisko zliczania taktów produkcyjnych. Zapoznaje z deklaracją zmiennych numerycznych RAPID (VAR num) oraz formatowaniem parametrów opcjonalnych \\Num instrukcji TPWrite.",    signalsTable: [],    targetsTable: [{"name": "pHome", "description": "Pozycja bazowa robota"}, {"name": "p1", "description": "Punkt operacyjny cyklu produkcyjnego"}],    procedureSteps: ["Deklaracja zmiennej VAR num nParts := 0; na początku modułu.", "Inkrementacja licznika instrukcją Incr nParts; lub nParts := nParts + 1;.", "Wyświetlenie aktualnej liczby wyprodukowanych detali przy użyciu przełącznika \\Num:=nParts.", "Ruch robota do punktu p1 i powrót do pHome."],    evaluationCriteria: ["Właściwe formatowanie instrukcji TPWrite z opcjonalnym przełącznikiem \\Num.", "Prawidłowa obsługa zmiennych numerycznych RAPID."],
    title: "3. Licznik wyprodukowanych sztuk",
    category: "podstawowe",
    topic: "Zmienne numeryczne i Incr",
    summary: "Zadeklaruj zmienną numeryczną nPartCounter o wartości początkowej 0. Zasymuluj zliczanie 3 operacji w punktach pSquareA, pSquareB i pSquareC. Po osiągnięciu każdego punktu zwiększ licznik instrukcją Incr i wyświetl powiadomienie. Na koniec wyczyść licznik instrukcją Clear.",
    tool: "pen",
    tips: [

      "Zmienną deklaruje się przed procedurą main słowem kluczowym: VAR num nPartCounter := 0;",
      "Inkrementacja wartości zmiennej: Incr nPartCounter;",
      "Zerowanie zmiennej: Clear nPartCounter;"
    
    ],
    starterCode: `MODULE MainModule
    VAR num nPartCounter := 0;

    PROC main()
        ! Krok 1: Przejazd do pSquareA, zwiekszenie licznika (Incr) i powiadomienie TPWrite
        
        ! Krok 2: Przejazd do pSquareB, zwiekszenie licznika (Incr) i powiadomienie TPWrite
        
        ! Krok 3: Przejazd do pSquareC, zwiekszenie licznika (Incr) i powiadomienie TPWrite
        
        ! Krok 4: Wypisanie komunikatu o zakonczeniu partii i wyczyszczenie licznika (Clear)
        
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-basic-4",
    sheetId: "Zadanie Treningowe #4",    workstationDescription: "Zrobotyzowane gniazdo Pick & Place. Robot z chwytakiem dwuszczękowym tGripper pobiera detal z pozycji podania i przenosi na pozycję odłożenia z bezpiecznymi dojazdami pionowymi.",    signalsTable: [{"name": "doGripper", "type": "DO", "description": "Cyfrowe sterowanie zaciskiem chwytaka (1 - zaciśnij, 0 - otwórz)"}],    targetsTable: [{"name": "pHome", "description": "Pozycja bazowa spoczynkowa"}, {"name": "pGripAbove", "description": "Bezpieczna pozycja najazdowa nad detalem"}, {"name": "pGripPick", "description": "Punkt chwycenia detalu na stole"}, {"name": "pPlaceAbove", "description": "Bezpieczna pozycja najazdowa nad miejscem odłożenia"}, {"name": "pPlace", "description": "Punkt odłożenia detalu"}],    procedureSteps: ["Dojazd nad detal do pGripAbove ruchem MoveJ.", "Zjazd pionowy MoveL do pGripPick z prędkością v100.", "Zaciśnięcie chwytaka (Set doGripper;) i odczekanie czasu technologicznego 0.5 s (WaitTime 0.5;).", "Pionowe uniesienie do pGripAbove ruchem liniowym.", "Przejazd nad cel do pPlaceAbove.", "Zjazd do pPlace, otwarcie chwytaka (Reset doGripper;) i odczekanie 0.5 s.", "Pionowy wyjazd i powrót do pHome."],    evaluationCriteria: ["Zastosowanie przerw WaitTime po zmianie stanu chwytaka dla pewnego zadziałania mechaniki.", "Pionowe najazdy liniowe MoveL zapobiegające kolizjom z otoczeniem."],
    title: "4. Przenoszenie detalu chwytakiem",
    category: "podstawowe",
    topic: "Narzędzie Gripper i I/O",
    summary: "Wybierz narzędzie Gripper. Zaprogramuj cykl pobrania bloku ze stołu z pozycji pGripPick i odłożenia go w punkcie pGripPlace. Uwzględnij punkty dojazdowe pGripApproach i pGripRetreat, aby uniknąć kolizji ze stołem.",
    tool: "gripper",
    tips: [

      "Zamknięcie chwytaka realizuje instrukcja Set doGripper; (lub SetDO doGripper, 1;).",
      "Pamiętaj o dodaniu opóźnienia WaitTime 0.5; po zamknięciu i otwarciu chwytaka, aby mechanizm zdążył zadziałać.",
      "Zwolnienie detalu realizuje Reset doGripper;."
    
    ],
    starterCode: `MODULE MainModule

    PROC main()
        ! Krok 1: Dojazd nad detal do punktu pGripApproach (narzedzie tGripper)
        
        ! Krok 2: Zjazd pionowy do pGripPick, zamkniecie chwytaka (Set doGripper) i odczekanie 0.5s
        
        ! Krok 3: Podniesienie detalu do pGripApproach
        
        ! Krok 4: Przejazd tranzytowy do pGripRetreat
        
        ! Krok 5: Zjazd do pGripPlace, otwarcie chwytaka (Reset doGripper) i odczekanie 0.5s
        
        ! Krok 6: Wycofanie do pGripRetreat i powrot do pHome
        
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-basic-5",
    sheetId: "Zadanie Treningowe #5",    workstationDescription: "Stanowisko z pełną synchronizacją sygnałów I/O z operatorem i układem bezpieczeństwa. Symuluje cykl pracy linii produkcyjnej z lampkami stanu gotowości (doReady) i pracy (doBusy).",    signalsTable: [{"name": "diStart", "type": "DI", "description": "Przycisk startu cyklu od operatora"}, {"name": "diSafetyOk", "type": "DI", "description": "Obwód bezpieczeństwa (kurtyna świetlna / E-Stop)"}, {"name": "doReady", "type": "DO", "description": "Sygnalizator gotowości robota do nowego cyklu"}, {"name": "doBusy", "type": "DO", "description": "Sygnalizator trwania cyklu obróbczego"}, {"name": "doComplete", "type": "DO", "description": "Sygnalizator zakończenia partii produkcyjnej"}],    targetsTable: [{"name": "pHome", "description": "Pozycja bazowa robota"}, {"name": "p1", "description": "Pozycja technologiczna wykonania operacji"}],    procedureSteps: ["Wystawienie sygnału gotowości: Set doReady; Reset doBusy; Reset doComplete;.", "Oczekiwanie na sygnał startu: WaitDI diStart, 1;.", "Przełączenie sygnalizacji na stan pracy: Reset doReady; Set doBusy;.", "Wykonanie ruchu roboczego do punktu technologicznego p1.", "Odczekanie 1.0 s czasu technologicznego procesu.", "Powrót do pHome, wyłączenie doBusy i załączenie doComplete."],    evaluationCriteria: ["Właściwe sekwencjonowanie sygnałów gotowości i zajętości.", "Poprawne użycie instrukcji WaitDI, Set, Reset i WaitTime."],
    title: "5. Synchronizacja z operatorem (WaitDI)",
    category: "podstawowe",
    topic: "Cyfrowe wejścia/wyjścia",
    summary: "Robot w pozycji pHome oczekuje na sygnał startu od operatora (diStart = 1). Po odebraniu sygnału załącza sygnalizację pracy doBusy, wykonuje ruch inspekcyjny do pCircleStart, odczekuje 1 sekundę, wraca do pHome, wyłącza doBusy i wystawia sygnał doComplete.",
    tool: "pen",
    tips: [

      "Do wstrzymania programu do momentu podania sygnału użyj WaitDI diStart, 1;.",
      "Podczas działania programu kliknij przycisk diStart w zakładce SIGNALS na dolnym pasku.",
      "Sterowanie lampkami wyjściowymi: Set nazwaSygnalu; oraz Reset nazwaSygnalu;."
    
    ],
    starterCode: `MODULE MainModule

    PROC main()
        ! Krok 1: Wypisz komunikat z prosba o wcisniecie diStart
        
        ! Krok 2: Oczekuj na stan wysoki wejscia diStart (WaitDI)
        
        ! Krok 3: Zasygnalizuj prace (Set doBusy) i przemiesc robota do pCircleStart
        
        ! Krok 4: Odczekaj 1 sekunde czasu technologicznego (WaitTime)
        
        ! Krok 5: Powrot do pHome, wylaczenie doBusy i zalaczenie doComplete
        
    ENDPROC

ENDMODULE`,
  },

  // --- 12 OFICJALNYCH ZADAŃ EGZAMINACYJNYCH ELM.08 (TECHNIK ROBOTYK) ---
  {
    id: "task-elm08-101",
    sheetId: "CKE ELM.08-101",    workstationDescription: "Zrobotyzowane stanowisko do detekcji detali wyposażone w robota 6-osiowego ABB z chwytakiem pneumatycznym. Na platformie roboczej znajduje się paleta z 4 detalami cylindrycznymi, czujnik indukcyjny B5, dwie przeszkody oraz dwa pojemniki zrzutowe. Detale metalowe powodują zaburzenie pola magnetycznego czujnika B5, a detale z tworzywa nie.",    signalsTable: [{"name": "S1", "type": "DI", "description": "Przycisk sterowniczy START (zestyk NO, monostabilny)"}, {"name": "B5", "type": "DI", "description": "Czujnik zbliżeniowy indukcyjny (rozpoznawanie detalu metalowego)"}, {"name": "H1", "type": "DO", "description": "Lampka sygnalizacyjna (sygnalizuje wykrycie detalu metalowego)"}, {"name": "doGripper", "type": "DO", "description": "Chwytak pneumatyczny robota (1 - zaciśnij, 0 - otwórz)"}],    targetsTable: [{"name": "pHome", "description": "Pozycja początkowa i końcowa HOME"}, {"name": "pGripPick", "description": "Punkt pobrania detalu z palety"}, {"name": "pGripAbove", "description": "Punkt dojazdu pionowego nad detal"}, {"name": "pSensorB5", "description": "Punkt kontrolny nad czołem czujnika indukcyjnego B5"}, {"name": "pSensorAbove", "description": "Punkt najazdowy nad czujnik B5"}, {"name": "pAboveObstacle", "description": "Punkt bezpiecznego ominięcia przeszkody nr 1"}, {"name": "pBin1", "description": "Punkt zrzutu detalu do Pojemnika nr 1 (detale niemetalowe)"}, {"name": "pBin2", "description": "Punkt zrzutu detalu do Pojemnika nr 2 (detale metalowe)"}],    procedureSteps: ["1. Wciśnięcie przycisku S1 rozpoczyna ruch z ustalonej pozycji HOME.", "2. Odliczenie czasu 3 sekund (WaitTime 3.0;).", "3. Pobranie i chwycenie detalu z palety.", "4. Przemieszczenie detalu nad czoło czujnika indukcyjnego B5.", "5. Odliczenie czasu 5 sekund na inspekcję. Lampka H1 zapala się wyłącznie przy wykryciu metalu (B5=1).", "6. Po upływie 5 sekund detal niemetalowy trafia do pojemnika nr 1 (nad przeszkodą nr 1), a detal metalowy do pojemnika nr 2 (przestrzenią obok przeszkody nr 2).", "7. Powrót do pozycji początkowej HOME i powtórzenie kroków dla kolejnych detali.", "8. Zakończenie procesu w pozycji HOME po posortowaniu wszystkich detali."],    evaluationCriteria: ["Wykorzystanie co najmniej raz ruchu w interpolacji liniowej MoveL.", "Zastosowanie instrukcji warunkowej IF DInput(B5) = 1 (lub IF B5 = 1).", "Zachowanie reżimu czasowego (3 s przed pobraniem, 5 s nad czujnikiem).", "Sterowanie lampką sygnalizacyjną H1 zgodnie z wymaganiami arkusza."],
    title: "ELM.08-101: Detekcja i sortowanie detali (metal/tworzywo)",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Zadanie egzaminacyjne 101",
    summary: "Stanowisko do detekcji i sortowania detali. Robot z pozycji HOME pobiera detal po wciśnięciu S1 i odliczeniu 3s. Transportuje detal nad czujnik indukcyjny B5 (odczekanie 5s). Jeśli detal jest metalowy (B5=1), zapala się lampka H1 i detal trafia do pojemnika 2 z ominięciem przeszkody 2. Jeśli niemetalowy, trafia do pojemnika 1 nad przeszkodą 1.",
    tool: "gripper",
    defaultInputs: { S1: false, B5: false },
    defaultOutputs: { H1: false, doGripper: false },
    showConveyor: false,
    showGravityFeeder: false,
    showSorterBins: true,
    blocks: [
      { id: "part-metal", position: targets.pGripPick, material: "metal" },
    ],
    tips: [

      "Zastosuj instrukcję warunkową IF B5 = 1 THEN ... ELSE ... ENDIF.",
      "Oczekiwanie na start: WaitDI S1, 1; następnie WaitTime 3.0;",
      "Nad czujnikiem indukcyjnym B5 wstrzymaj ruch na 5 sekund: WaitTime 5.0;",
      "Przetransportuj detal metalowy do pBin2, a niemetalowy do pBin1, po czym rozewrzyj chwytak (Reset doGripper)."
    
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 101
    ! Detekcja materialu czujnikiem indukcyjnym B5 i sortowanie
    ! =================================================================

    PROC main()
        ! 1. Pozycja poczatkowa HOME, chwytak otwarty, lampka H1 zgaszona
        Reset doGripper;
        Reset H1;
        MoveJ pHome, v200, fine, tGripper;
        
        ! 2. Oczekiwanie na wcisniecie przycisku S1
        TPWrite "Oczekiwanie na przycisk S1...";
        WaitDI S1, 1;
        WaitTime 3.0;
        
        ! 3. Dojazd i pobranie detalu nr 1
        MoveJ pGripApproach, v200, fine, tGripper;
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
        
        ! 4. Przejazd nad czujnik indukcyjny B5 i detekcja (5s)
        MoveJ pSensorB5Approach, v200, fine, tGripper;
        MoveL pSensorB5, v100, fine, tGripper;
        WaitTime 5.0;
        
        ! 5. Warunek: jesli metal (B5=1) -> pojemnik 2, inaczej -> pojemnik 1
        IF B5 = 1 THEN
            Set H1;
            TPWrite "Wykryto detal metalowy -> Pojemnik 2";
            MoveL pSensorB5Approach, v100, fine, tGripper;
            MoveJ pBin2, v200, fine, tGripper;
            Reset doGripper;
            WaitTime 0.5;
            Reset H1;
        ELSE
            TPWrite "Detal niemetalowy -> Pojemnik 1";
            MoveL pSensorB5Approach, v100, fine, tGripper;
            MoveJ pBin1, v200, fine, tGripper;
            Reset doGripper;
            WaitTime 0.5;
        ENDIF
        
        ! 6. Powrot do HOME
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Cykl sortowania zakonczony";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-102",
    sheetId: "CKE ELM.08-102",    workstationDescription: "Zrobotyzowane stanowisko transferu detali na przenośnik taśmowy. Stanowisko wyposażone jest w magazyn grawitacyjny, taśmociąg napędzany silnikiem elektrycznym, czujnik wejściowy B3 oraz czujnik stacji odbiorczej B4.",    signalsTable: [{"name": "S1", "type": "DI", "description": "Przycisk sterowniczy START rozpoczęcia procesu"}, {"name": "B3", "type": "DI", "description": "Czujnik optyczny obecności detalu na wejściu taśmy"}, {"name": "B4", "type": "DI", "description": "Czujnik optyczny stacji pakowania na końcu taśmy"}, {"name": "H1", "type": "DO", "description": "Lampka sygnalizacyjna gotowości i trwania cyklu"}, {"name": "H2", "type": "DO", "description": "Lampka sygnalizacyjna ruchu taśmy przenośnika"}, {"name": "doConvRun", "type": "DO", "description": "Załączenie napędu silnika taśmociągu"}, {"name": "doConvDir", "type": "DO", "description": "Kierunek przesuwu taśmy (0 - w stronę odbioru)"}, {"name": "doGripper", "type": "DO", "description": "Sterowanie zaciskiem chwytaka"}],    targetsTable: [{"name": "pHome", "description": "Pozycja bazowa robota"}, {"name": "pFeederPick", "description": "Punkt pobrania detalu ze szczeliny podajnika"}, {"name": "pFeederAbove", "description": "Punkt najazdowy nad magazyn"}, {"name": "pConvStart", "description": "Punkt odłożenia detalu na taśmę transportową"}, {"name": "pConvStartAbove", "description": "Punkt najazdowy nad początek taśmy"}],    procedureSteps: ["1. Stan początkowy: robot w pHome, wygaszone lampki H1 i H2, zatrzymana taśma.", "2. Wciśnięcie przycisku S1 załącza lampkę H1 i rozpoczyna cykl.", "3. Pobranie detalu z magazynu i odłożenie na początek taśmociągu.", "4. Załączenie napędu taśmy (doConvRun) i lampki H2.", "5. Monitorowanie przejścia detalu przed czujnikiem wejściowym B3 (WaitDI B3, 1;).", "6. Zatrzymanie taśmy po dotarciu detalu do czujnika stacji pakowania B4 (WaitDI B4, 1;).", "7. Oczekiwanie na odebranie detalu przez pracownika (zbocze opadające: WaitDI B4, 0;).", "8. Wyłączenie taśmy i lampki H2, powrót do pHome i wygaszenie H1."],    evaluationCriteria: ["Synchronizacja pracy robota z ruchem przenośnika taśmowego.", "Prawidłowa detekcja zbocza opadającego na czujniku B4.", "Bezpieczne ruchy pionowe przy pobieraniu z podajnika."],
    title: "ELM.08-102: Transport na taśmociąg i strefa pakowania",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Zadanie egzaminacyjne 102",
    summary: "Stanowisko transportu detali z magazynu na taśmociąg. Warunek startu S1 przy zatrzymanej taśmie i pustych czujnikach B3, B4. Robot zapala H1, pobiera detal 1, odkłada na taśmę pConvStart, unosi się 40 mm (v40%). Taśma rusza w lewo. Po wykryciu przez B4 taśma staje. Wznowienie cyklu następuje po zdjęciu detalu (zbocze opadające B4). Następnie transportowany jest detal 2.",
    tool: "gripper",
    defaultInputs: { S1: false, B3: false, B4: false },
    defaultOutputs: { H1: false, H2: false, doGripper: false, doConvRun: false, doConvDir: false },
    showConveyor: true,
    showGravityFeeder: true,
    showSorterBins: false,
    blocks: [
      { id: "part-1", position: targets.pGripPick, material: "plastic" },
      { id: "part-2", position: [targets.pGripPick[0] + 50, targets.pGripPick[1], targets.pGripPick[2]], material: "plastic" },
    ],
    tips: [

      "Prędkość najazdu 40% maksymalnej odpowiada v200.",
      "Uruchomienie taśmy w lewo: Reset doConvDir; Set doConvRun;",
      "Zatrzymanie taśmy: Reset doConvRun;",
      "Oczekiwanie na zdjęcie detalu z B4: WaitDI B4, 0;"
    
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 102
    ! Stanowisko zrobotyzowane z przenosnikiem tasmowym i stacja B3/B4
    ! =================================================================

    PROC TransportujDetal()
        ! Pobranie detalu z magazynu
        MoveJ pGripApproach, v200, fine, tGripper;
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
        
        ! Przeniesienie na poczatek przenosnika tasmowego (B3)
        MoveJ pConvStartApproach, v200, fine, tGripper;
        MoveL pConvStart, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        
        ! Odjazd 40 mm ruchem liniowym w gore
        MoveL Offs(pConvStart, 0, 0, 40), v200, fine, tGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        ! Zalaczenie tasmy w lewo (doConvDir=0, doConvRun=1)
        Reset doConvDir;
        Set doConvRun;
        
        ! Oczekiwanie na dojazd detalu do stanowiska pakowania (B4)
        WaitDI B4, 1;
        Reset doConvRun;
        TPWrite "Detal w strefie pakowania. Zdejmij detal (B4=0)...";
        
        ! Oczekiwanie na zdjecie detalu (zbocze opadajace)
        WaitDI B4, 0;
        TPWrite "Detal zdjety. Wznawianie pracy.";
    ENDPROC

    PROC main()
        ! 1. Warunki poczatkowe
        Reset H1;
        Reset H2;
        Reset doConvRun;
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        ! 2. Start po wcisnieciu S1
        TPWrite "Oczekiwanie na przycisk S1...";
        WaitDI S1, 1;
        Set H1;
        
        ! 3. Transport pierwszego detalu
        TPWrite "Transport detalu 1";
        TransportujDetal;
        
        ! 4. Transport drugiego detalu
        TPWrite "Transport detalu 2";
        TransportujDetal;
        
        ! 5. Zakonczenie cyklu
        Reset H1;
        TPWrite "Cykl transportu obu detali zakonczony";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-103",
    sheetId: "CKE ELM.08-103",    workstationDescription: "Zrobotyzowane gniazdo paletyzacji 6 detali sześciokątnych. Zadanie wymaga realizacji trajektorii po łuku kołowym MoveC, sygnalizacji stanu chwytaka lampkami H1 i H2 oraz zachowania zredukowanych prędkości roboczych.",    signalsTable: [{"name": "S1", "type": "DI", "description": "Przycisk monostabilny START"}, {"name": "H1", "type": "DO", "description": "Lampka zielona: sygnalizacja otwarcia chwytaka"}, {"name": "H2", "type": "DO", "description": "Lampka czerwona: sygnalizacja zamknięcia chwytaka"}, {"name": "doGripper", "type": "DO", "description": "Chwytak pneumatyczny robota"}],    targetsTable: [{"name": "pHome", "description": "Pozycja bazowa robota"}, {"name": "pGripPick", "description": "Punkt pobrania detalu z palety zasilającej"}, {"name": "pGripAbove", "description": "Punkt dojazdu pionowego nad detal"}, {"name": "pArcVia", "description": "Punkt pośredni łuku kołowego MoveC"}, {"name": "pPlace", "description": "Punkt odłożenia na palecie odbiorczej"}, {"name": "pPlaceAbove", "description": "Punkt końcowy łuku kołowego nad miejscem odłożenia"}],    procedureSteps: ["1. W stanie gotowości świeci lampka H1 (chwytak otwarty).", "2. Oczekiwanie na przycisk S1 (WaitDI S1, 1;).", "3. Wykonanie pętli FOR i FROM 1 TO 6 DO dla 6 detali.", "4. Dojazd i chwycenie detalu z prędkością 20% (v100). Zamknięcie chwytaka: Reset H1; Set H2;.", "5. Transfer detalu po łuku kołowym MoveC pArcVia, pPlaceAbove z prędkością 50% (v250).", "6. Pionowe odłożenie detalu z prędkością 20%, otwarcie chwytaka: Reset H2; Set H1;.", "7. Powrót do pHome po ułożeniu wszystkich 6 detali."],    evaluationCriteria: ["Użycie interpolacji kołowej MoveC z punktem przejściowym pArcVia.", "Programowanie pętli licznikowej FOR..ENDFOR.", "Prawidłowe sterowanie lampkami H1 i H2 w zależności od stanu chwytaka."],
    title: "ELM.08-103: Przenoszenie 6 klocków do magazynu docelowego",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Zadanie egzaminacyjne 103",
    summary: "Robot pobiera 6 klocków z magazynu detali i układa je w magazynie docelowym. Otwarcie chwytaka 50 mm nad klockiem (H1 zielona = 1, H2 czerwona = 0). Zjazd, zamknięcie chwytaka (H1=0, H2=1, zwłoka 0.5s). Podniesienie pionowe 50 mm liniowo (v20%). Transport nad magazyn docelowy (v50%), odłożenie, uniesienie chwytaka i powrót po kolejny klocek. Wymagane użycie MoveC na łuku.",
    tool: "gripper",
    defaultInputs: { S1: false },
    defaultOutputs: { H1: false, H2: false, doGripper: false },
    blocks: [
      { id: "b1", position: [100, 330, 420], material: "plastic" },
      { id: "b2", position: [135, 330, 420], material: "plastic" },
      { id: "b3", position: [170, 330, 420], material: "plastic" },
      { id: "b4", position: [205, 330, 420], material: "plastic" },
      { id: "b5", position: [240, 330, 420], material: "plastic" },
      { id: "b6", position: [275, 330, 420], material: "plastic" },
    ],
    tips: [
      "Prędkość 20% to ok. v100, 50% to ok. v250.",
      "Zastosuj pętlę FOR nKlocek FROM 1 TO 6 DO ... ENDFOR z wyliczeniem przesunięcia nOffsX := (nKlocek - 1) * 35;.",
      "Pobieraj i odkładaj klocki za pomocą funkcji odsunięcia: Offs(pGripPick, nOffsX, 0, 0) oraz Offs(pPlace, nOffsX, 0, 0).",
      "Stan lampek: gdy chwytak otwarty: Set H1; Reset H2; gdy zamknięty: Reset H1; Set H2;.",
      "Zastosuj ruch łukowy MoveC pArcVia, Offs(pPlaceAbove, nOffsX, 0, 0) na trasie przelotu między magazynami.",
    ],
    starterCode: `MODULE MainModule
    VAR num nKlocek := 1;
    VAR num nOffsX := 0;

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 103
    ! Przenoszenie 6 klockow ze statusem lampek H1 (otwarty) / H2 (zamkniety)
    ! =================================================================

    PROC PrzeniesKlocek()
        nOffsX := (nKlocek - 1) * 35;

        ! 1. Otwarcie chwytaka 50 mm nad detalem (swieci zielona H1)
        MoveJ Offs(pGripApproach, nOffsX, 0, 0), v250, fine, tGripper;
        Reset doGripper;
        Set H1;
        Reset H2;
        WaitTime 0.5;
        
        ! 2. Zjazd do detalu i zamkniecie (swieci czerwona H2)
        MoveL Offs(pGripPick, nOffsX, 0, 0), v100, fine, tGripper;
        Set doGripper;
        Reset H1;
        Set H2;
        WaitTime 0.5;
        
        ! 3. Podniesienie liniowe na 50 mm z predkoscia 20%
        MoveL Offs(pGripApproach, nOffsX, 0, 0), v100, fine, tGripper;
        
        ! 4. Transport nad magazyn docelowy z lukiem MoveC i predkoscia 50%
        MoveC pArcVia, Offs(pPlaceAbove, nOffsX, 0, 0), v250, fine, tGripper;
        
        ! 5. Zjazd pionowy i odlozenie klocka
        MoveL Offs(pPlace, nOffsX, 0, 0), v100, fine, tGripper;
        Reset doGripper;
        Set H1;
        Reset H2;
        WaitTime 0.5;
        
        ! 6. Uniesienie chwytaka i zamkniecie w powietrzu
        MoveL Offs(pPlaceAbove, nOffsX, 0, 0), v100, fine, tGripper;
        Set doGripper;
        Reset H1;
        Set H2;
        WaitTime 0.5;
    ENDPROC

    PROC main()
        ! Pozycja bazowa HOME z zamknietym chwytakiem
        Set doGripper;
        Reset H1;
        Set H2;
        MoveJ pHome, v250, fine, tGripper;
        
        TPWrite "Oczekiwanie na przycisk S1...";
        WaitDI S1, 1;
        
        ! Petla dla 6 klockow
        FOR nKlocek FROM 1 TO 6 DO
            TPWrite "Przenoszenie klocka nr: " \Num:=nKlocek;
            PrzeniesKlocek;
        ENDFOR
        
        ! Powrot do HOME
        MoveJ pHome, v250, fine, tGripper;
        Reset H1;
        Reset H2;
        TPWrite "Zadanie 103 ukonczone pomyslnie";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-104",
    sheetId: "CKE ELM.08-104",    workstationDescription: "Procedura kalibracyjna i testowa bazowania robota w trybie ręcznym z prędkością bezpieczną ograniczoną do 10% (v50). Weryfikacja działania chwytaka i dojazdu z offsetem współrzędnych Offs.",    signalsTable: [{"name": "S1", "type": "DI", "description": "Przycisk startowy procedury testowej"}, {"name": "doGripper", "type": "DO", "description": "Chwytak pneumatyczny robota"}],    targetsTable: [{"name": "PHOME", "description": "Pozycja bazowa osi manipulatora"}, {"name": "PINIT", "description": "Pozycja inicjalizacyjna dojazdu"}],    procedureSteps: ["1. Uruchomienie procedury po naciśnięciu przycisku S1.", "2. Ruch MoveJ do punktu PHOME z prędkością v50 i strefą fine.", "3. Test sprawności chwytaka: zaciśnięcie (WaitTime 1.0;), otwarcie (WaitTime 1.0;).", "4. Przejazd ruchem MoveJ do pozycji PINIT.", "5. Wykonanie ruchu liniowego z offsetem MoveL Offs(PINIT, 0, 0, 50), v50, fine, tGripper; i powrót do PINIT.", "6. Ruch powrotny do PHOME i zgłoszenie zakończenia testu."],    evaluationCriteria: ["Ścisłe przestrzeganie ograniczenia prędkości do v50 (10% override).", "Prawidłowe użycie funkcji matematycznej Offs(punkt, dx, dy, dz)."],
    title: "ELM.08-104: Test osi robota, synchronizacja i test chwytaka",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Zadanie egzaminacyjne 104",
    summary: "Test napędów i osi robota. Ograniczenie prędkości do 10% (v50). Start od PINIT po wciśnięciu S1. Kolejny ruch każdą osią od osi 6 do 1 o 10 stopni z użyciem funkcji przesunięcia Offs. Odczekanie 3s, ruch do PHOME z załączeniem H1. Test chwytaka w PHOME (otwarcie, 2s, zamknięcie). Powrót z PHOME do PINIT.",
    tool: "gripper",
    defaultInputs: { S1: false },
    defaultOutputs: { H1: false, doGripper: false },
    tips: [

      "Prędkość maksymalna ograniczona do 10% (użyj v50 lub v30).",
      "Do ruchów relatywnych wykorzystaj funkcję Offs(pInit, dx, dy, dz).",
      "W punkcie PHOME: Reset doGripper; WaitTime 2.0; Set doGripper;"
    
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 104
    ! Sekwencja testowa osi robota i procedury chwytaka
    ! =================================================================

    PROC main()
        ! 1. Ograniczenie predkosci do 10% (v50)
        Reset H1;
        Reset doGripper;
        MoveJ pInit, v50, fine, tGripper;
        
        ! 2. Oczekiwanie na przycisk S1
        TPWrite "Oczekiwanie na S1 (Tryb testowy 10%)...";
        WaitDI S1, 1;
        
        ! 3. Ruchy testowe z uzyciem operacji matematycznej Offs
        TPWrite "Testowanie osi robota (ruchy po 10 mm/stopni)...";
        MoveL Offs(pInit, 0, 0, 10), v50, fine, tGripper;
        MoveL Offs(pInit, 10, 0, 10), v50, fine, tGripper;
        MoveL Offs(pInit, 10, 10, 10), v50, fine, tGripper;
        MoveL Offs(pInit, 0, 10, 0), v50, fine, tGripper;
        MoveL pInit, v50, fine, tGripper;
        
        ! 4. Odczekanie 3 sekund
        WaitTime 3.0;
        
        ! 5. Przejazd do PHOME i zalaczenie lampki H1
        Set H1;
        MoveJ pHome, v50, fine, tGripper;
        
        ! 6. Test chwytaka w punkcie PHOME (otwarcie, 2s, zamkniecie)
        TPWrite "Test chwytaka...";
        Reset doGripper;
        WaitTime 2.0;
        Set doGripper;
        WaitTime 1.0;
        
        ! 7. Powrot do PINIT i wylaczenie H1
        MoveJ pInit, v50, fine, tGripper;
        Reset H1;
        TPWrite "Test procedury zakonczony pomyslnie";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-105",
    sheetId: "CKE ELM.08-105",    workstationDescription: "Zrobotyzowane stanowisko rozładunku 4 detali ze szczeliny magazynu grawitacyjnego i podawania ich na taśmę transportową. Wymaga użycia pętli licznikowej oraz synchronizacji z czujnikiem B3.",    signalsTable: [{"name": "S1", "type": "DI", "description": "Przycisk START cyklu"}, {"name": "B3", "type": "DI", "description": "Czujnik optyczny obecności detalu na taśmie"}, {"name": "H1", "type": "DO", "description": "Lampka sygnalizacji pracy stanowiska"}, {"name": "H2", "type": "DO", "description": "Lampka sygnalizacji ruchu taśmy"}, {"name": "doConvRun", "type": "DO", "description": "Napęd silnika taśmy"}, {"name": "doGripper", "type": "DO", "description": "Chwytak robota"}],    targetsTable: [{"name": "pHome", "description": "Pozycja spoczynkowa robota"}, {"name": "pFeederPick", "description": "Dolna szczelina pobierania magazynu grawitacyjnego"}, {"name": "pFeederAbove", "description": "Najazd pionowy nad szczelinę podajnika"}, {"name": "pConvStart", "description": "Punkt odłożenia detalu na taśmie transportowej"}, {"name": "pConvStartAbove", "description": "Najazd pionowy nad początek taśmy"}],    procedureSteps: ["1. Oczekiwanie na wciśnięcie przycisku S1, załączenie lampki H1.", "2. Wykonanie pętli FOR nPart FROM 1 TO 4 DO.", "3. Pobranie detalu ze szczeliny magazynu pFeederPick.", "4. Przeniesienie i precyzyjne odłożenie na taśmociąg pConvStart.", "5. Chwilowe załączenie taśmy na 2 sekundy (Set doConvRun; WaitTime 2.0; Reset doConvRun;) celem przesunięcia detalu.", "6. Powtórzenie dla kolejnych detali aż do opróżnienia magazynu.", "7. Powrót do pHome i wygaszenie lampki H1."],    evaluationCriteria: ["Zastosowanie pętli FOR do obsługi 4 detali.", "Prawidłowy czas przesuwu taśmy pomiędzy kolejnymi cyklami pobrania."],
    title: "ELM.08-105: Magazyn opadowy i taśmociąg (4 detale)",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Zadanie egzaminacyjne 105",
    summary: "Zrobotyzowane gniazdo z magazynem opadowym i taśmociągiem. Po S1 lampka H1=1. Robot jedzie z prędkością v40% 50 mm nad magazyn opadowy, zjeżdża liniowo po detal, chwyta go i unosi 50 mm. Transportuje 30 mm nad początek taśmy, odkłada i odjeżdża 40 mm w górę (v40%). Czujnik optyczny B3 wykrywa detal, następuje załączenie taśmy w lewo. Cykl powtarza się dla 4 detali.",
    tool: "gripper",
    defaultInputs: { S1: false, B3: false },
    defaultOutputs: { H1: false, H2: false, doGripper: false, doConvRun: false },
    showConveyor: true,
    showGravityFeeder: true,
    showSorterBins: false,
    blocks: [
      { id: "f1", position: targets.pFeederPick, material: "plastic" },
      { id: "f2", position: [targets.pFeederPick[0], targets.pFeederPick[1], targets.pFeederPick[2] + 48], material: "plastic" },
      { id: "f3", position: [targets.pFeederPick[0], targets.pFeederPick[1], targets.pFeederPick[2] + 96], material: "plastic" },
      { id: "f4", position: [targets.pFeederPick[0], targets.pFeederPick[1], targets.pFeederPick[2] + 144], material: "plastic" },
    ],
    tips: [
      "Prędkość 40% odpowiada v200, a prędkość 20% to v100.",
      "Detale w magazynie tworzą pionowy stos z krokiem 48 mm: nOffsZ := (nSztuka - 1) * 48;.",
      "Dojazd 50 mm nad aktualny detal: MoveJ Offs(pFeederPick, 0, 0, nOffsZ + 50), v200, fine, tGripper;.",
      "Zjazd i chwycenie detalu ze stosu: MoveL Offs(pFeederPick, 0, 0, nOffsZ), v100, fine, tGripper;.",
      "Odkładanie na taśmę: dojazd 30 mm nad taśmę: Offs(pConvStart, 0, 0, 30), zjazd i odjazd 40 mm.",
      "Uruchomienie taśmy po wykryciu B3: WaitDI B3, 1; Set doConvRun;.",
    ],
    starterCode: `MODULE MainModule
    VAR num nSztuka := 1;
    VAR num nOffsZ := 0;

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 105
    ! Obsluga magazynu opadowego i przenosnika tasmowego dla 4 detali
    ! =================================================================

    PROC PodajDetal()
        ! Wyliczenie poprawnego offsetu wysokosci dla detali w magazynie
        ! Krok wysokosci w osi Z wynosi 48 mm na sztuke: (nSztuka - 1) * 48
        nOffsZ := (nSztuka - 1) * 48;

        ! Dojazd 50 mm nad magazyn opadowy ruchem MoveJ
        MoveJ Offs(pFeederPick, 0, 0, nOffsZ + 50), v200, fine, tGripper;
        MoveL Offs(pFeederPick, 0, 0, nOffsZ), v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL Offs(pFeederPick, 0, 0, nOffsZ + 50), v100, fine, tGripper;
        
        ! Transport 30 mm nad poczatek przenosnika
        MoveJ Offs(pConvStart, 0, 0, 30), v200, fine, tGripper;
        MoveL pConvStart, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        
        ! Odjazd 40 mm liniowo nad tasme z predkoscia 40%
        MoveL Offs(pConvStart, 0, 0, 40), v200, fine, tGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        ! Uruchomienie tasmy po potwierdzeniu przez B3
        WaitDI B3, 1;
        Set doConvRun;
        WaitTime 2.5;
        Reset doConvRun;
    ENDPROC

    PROC main()
        Reset H1;
        Reset doGripper;
        Reset doConvRun;
        MoveJ pHome, v200, fine, tGripper;
        
        TPWrite "Oczekiwanie na przycisk S1...";
        WaitDI S1, 1;
        Set H1;
        
        FOR nSztuka FROM 1 TO 4 DO
            TPWrite "Pobieranie detalu nr: " \Num:=nSztuka;
            PodajDetal;
        ENDFOR
        
        Reset H1;
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Zakonczono transfer 4 detali";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-106",
    sheetId: "CKE ELM.08-106",    workstationDescription: "Zrobotyzowane stanowisko segregacji dwukierunkowej. Robot pobiera detale z magazynu, poddaje inspekcji nad czujnikiem indukcyjnym B5 i odkłada na taśmociąg rewersyjny (kierunek LEWO - metal, PRAWO - tworzywo).",    signalsTable: [{"name": "S1", "type": "DI", "description": "Przycisk START segregacji"}, {"name": "B5", "type": "DI", "description": "Czujnik indukcyjny detekcji metalu"}, {"name": "START_STOP", "type": "DO", "description": "Załączenie napędu taśmociągu rewersyjnego"}, {"name": "LEWO_PRAWO", "type": "DO", "description": "Kierunek obrotów taśmy (0 - lewo / metal, 1 - prawo / tworzywo)"}, {"name": "H1", "type": "DO", "description": "Lampa sygnalizacyjna cyklu roboczego"}, {"name": "doGripper", "type": "DO", "description": "Chwytak pneumatyczny robota"}],    targetsTable: [{"name": "pHome", "description": "Pozycja bazowa robota"}, {"name": "pFeederPick", "description": "Pobranie detalu z magazynu"}, {"name": "pSensorB5", "description": "Punkt kontrolny nad czujnikiem indukcyjnym"}, {"name": "pConvStart", "description": "Punkt odłożenia na środek taśmy transportowej"}],    procedureSteps: ["1. Pobranie detalu ze szczeliny magazynu podajnika.", "2. Przejazd i inspekcja nad czujnikiem indukcyjnym B5.", "3. Odłożenie detalu na taśmę transportową.", "4. Jeśli detal jest metalowy (B5=1): ustawienie kierunku w LEWO (Reset LEWO_PRAWO;) i załączenie taśmy na 3 s.", "5. Jeśli detal jest niemetalowy (B5=0): ustawienie kierunku w PRAWO (Set LEWO_PRAWO;) i załączenie taśmy na 3 s.", "6. Zatrzymanie taśmy, powrót do pHome i powtórzenie dla kolejnych detali."],    evaluationCriteria: ["Poprawna logika sterowania kierunkiem taśmy LEWO_PRAWO.", "Bezpieczne odczekanie na opuszczenie taśmy przez detal."],
    title: "ELM.08-106: Sortowanie dwukierunkowe na taśmociąg",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Zadanie egzaminacyjne 106",
    summary: "W magazynie opadowym znajdują się dwa detale – metalowy i niemetalowy. Po wciśnięciu S1 robot pobiera detal (lift 60 mm), odkłada na środek taśmy pConvMid i odjeżdża 50 mm w górę (v40%). Jeśli czujnik indukcyjny B5 wykrył detal metalowy (B5=1), taśmociąg rusza w lewo (doConvDir=0). Jeśli niemetalowy, taśmociąg rusza w prawo (doConvDir=1).",
    tool: "gripper",
    defaultInputs: { S1: false, B5: false },
    defaultOutputs: { START_STOP: false, LEWO_PRAWO: false, H1: false, doGripper: false, doConvRun: false, doConvDir: false },
    showConveyor: true,
    showGravityFeeder: true,
    showSorterBins: false,
    blocks: [
      { id: "detal-metal", position: targets.pFeederPick, material: "metal" },
      { id: "detal-plastic", position: [targets.pFeederPick[0], targets.pFeederPick[1], targets.pFeederPick[2] + 48], material: "plastic" },
    ],
    tips: [

      "Wykorzystaj strukturę IF B5 = 1 THEN ... ELSE ... ENDIF.",
      "Kierunek lewo: Reset doConvDir; Set doConvRun;",
      "Kierunek prawo: Set doConvDir; Set doConvRun;"
    
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 106
    ! Sortowanie dwukierunkowe (lewo/prawo) wg czujnika indukcyjnego B5
    ! =================================================================

    PROC SortujPojedynczyDetal()
        ! Dojazd 40 mm nad detal, pobranie i podniesienie na 60 mm
        MoveJ Offs(pFeederPick, 0, 0, 40), v200, fine, tGripper;
        MoveL pFeederPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL Offs(pFeederPick, 0, 0, 60), v100, fine, tGripper;
        
        ! Przejazd na srodek tasmy (pConvMid) i odlozenie
        MoveJ Offs(pConvMid, 0, 0, 40), v200, fine, tGripper;
        MoveL pConvMid, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL Offs(pConvMid, 0, 0, 50), v200, fine, tGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        ! Decyzja na podstawie czujnika indukcyjnego B5
        IF B5 = 1 THEN
            TPWrite "Detal METALOWY -> Tasma w LEWO";
            Reset doConvDir;
            Set doConvRun;
            WaitTime 3.0;
            Reset doConvRun;
        ELSE
            TPWrite "Detal NIEMETALOWY -> Tasma w PRAWO";
            Set doConvDir;
            Set doConvRun;
            WaitTime 3.0;
            Reset doConvRun;
        ENDIF
    ENDPROC

    PROC main()
        Reset H1;
        Reset doGripper;
        Reset doConvRun;
        MoveJ pHome, v200, fine, tGripper;
        
        TPWrite "Oczekiwanie na wcisniecie S1...";
        WaitDI S1, 1;
        Set H1;
        
        ! Sortowanie dwoch detali
        TPWrite "Sortowanie pierwszego detalu";
        SortujPojedynczyDetal;
        
        TPWrite "Sortowanie drugiego detalu";
        SortujPojedynczyDetal;
        
        Reset H1;
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Koniec cyklu sortowania dwukierunkowego";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-107",
    sheetId: "CKE ELM.08-107",
    workstationDescription: "Zrobotyzowane stanowisko do sortowania 4 detali pierścieniowych na 2 wałki montażowe. Stanowisko wyposażone jest w paletę 2x2, czujnik pojemnościowy B1 kontrolujący obecność detalu nr 4, kolumnę sygnalizacyjną H1/H2 oraz układ komunikacji z nadrzędnym sterownikiem PLC (przekaźnik K3).",
    signalsTable: [
      { name: "S1", type: "DI", description: "Przycisk sterowniczy START procesu sortowania" },
      { name: "B1", type: "DI", description: "Czujnik pojemnościowy obecności detalu nr 4 na palecie" },
      { name: "K3", type: "DO", description: "Cewka przekaźnika K3 – impuls potwierdzenia do PLC" },
      { name: "H1", type: "DO", description: "Lampa zielona: obecność detalu nr 4 na palecie" },
      { name: "H2", type: "DO", description: "Lampa czerwona: brak detalu nr 4 na palecie (miganie)" },
      { name: "doGripper", type: "DO", description: "Chwytak pneumatyczny robota" }
    ],
    targetsTable: [
      { name: "pHome", description: "Pozycja bazowa robota nad stanowiskiem" },
      { name: "pPallet1", description: "Gniazdo 1 palety (Detal nr 1 - duży pierścień)" },
      { name: "pPallet2", description: "Gniazdo 2 palety (Detal nr 2 - duży pierścień)" },
      { name: "pPallet3", description: "Gniazdo 3 palety (Detal nr 3 - mały pierścień)" },
      { name: "pPallet4", description: "Gniazdo 4 palety (Detal nr 4 - mały pierścień przy B1)" },
      { name: "pPin1", description: "Wałek montażowy nr 1 (większa średnica, detale 1 i 2)" },
      { name: "pPin2", description: "Wałek montażowy nr 2 (mniejsza średnica, detale 3 i 4)" }
    ],
    procedureSteps: [
      "1. Stan początkowy: robot w pHome, czujnik B1=1 (detal 4 na palecie), lampka zielona H1 włączona.",
      "2. Wciśnięcie przycisku S1 (lub impuls K3 z PLC) uruchamia cykl sortowania.",
      "3. Pobranie detalu 1 (pPallet1) i nałożenie na wałek nr 1 (pPin1) na poziom 0.",
      "4. Pobranie detalu 2 (pPallet2) i nałożenie na wałek nr 1 (pPin1) na poziom 2 (+35 mm).",
      "5. Pobranie detalu 3 (pPallet3) i nałożenie na wałek nr 2 (pPin2) na poziom 0.",
      "6. Pobranie detalu 4 (pPallet4) – w chwili uniesienia czujnik B1=0, zapala się lampka H2.",
      "7. Nałożenie detalu 4 na wałek nr 2 (pPin2) na poziom 2 (+35 mm).",
      "8. Wystawienie impulsu 1 s na przekaźnik K3 (PulseDO \\PLength:=1.0, K3;) jako potwierdzenie dla PLC.",
      "9. Powrót do pozycji pHome i zakończenie procesu."
    ],
    evaluationCriteria: [
      "Zastosowanie procedury parametryzowanej NakladajNaWalek(robtarget pDetal, robtarget pWalek, num nZOffs).",
      "Poprawne przyporządkowanie średnic pierścieni do wałków (detale 1, 2 -> wałek 1; detale 3, 4 -> wałek 2).",
      "Prawidłowa obsługa czujnika pojemnościowego B1 i sygnalizacji H1/H2.",
      "Wysłanie impulsu synchronizacji do PLC (PulseDO)."
    ],
    title: "ELM.08-107: Sorter detali pierścieniowych na wałki (PLC K3)",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Zadanie egzaminacyjne 107",
    summary: "Sortowanie 4 detali pierścieniowych z palety na 2 pionowe wałki montażowe. Detale 1 i 2 (duża średnica) trafiają na wałek nr 1 (pPin1). Detale 3 i 4 (mała średnica) trafiają na wałek nr 2 (pPin2). Stan gniazda detalu 4 jest monitorowany przez czujnik pojemnościowy B1. Po opróżnieniu palety robot wysyła impuls 1 s na wyjście K3 do sterownika PLC.",
    tool: "gripper",
    defaultInputs: { S1: false, B1: true },
    defaultOutputs: { K3: false, H1: true, H2: false, doGripper: false },
    showConveyor: false,
    showGravityFeeder: false,
    showSorterBins: false,
    showMountingPins: true,
    blocks: [
      { id: "ring-1", position: targets.pPallet1, material: "plastic", color: "#38bdf8" },
      { id: "ring-2", position: targets.pPallet2, material: "plastic", color: "#38bdf8" },
      { id: "ring-3", position: targets.pPallet3, material: "plastic", color: "#a855f7" },
      { id: "ring-4", position: targets.pPallet4, material: "plastic", color: "#a855f7" },
    ],
    tips: [
      "Procedura parametryzowana: PROC NakladajNaWalek(robtarget pDetal, robtarget pWalek, num nZOffs).",
      "Drugi poziom na wałku: nZOffs = 35 mm (Offs(pWalek, 0, 0, 35)).",
      "Detale 1 i 2 na pPin1, detale 3 i 4 na pPin2.",
      "Czujnik B1 reaguje na obecność detalu 4 na palecie: gdy obecny H1=1, po pobraniu H1=0 i H2=1.",
      "Wysłanie impulsu do PLC: PulseDO \\PLength:=1.0, K3;."
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 107
    ! Sortowanie 4 detali pierscieniowych na 2 walki montazowe z czujnikiem B1
    ! =================================================================

    PROC NakladajNaWalek(robtarget pDetal, robtarget pWalek, num nZOffs)
        ! Dojazd pionowy 50 mm nad detal na palecie
        MoveJ Offs(pDetal, 0, 0, 50), v200, fine, tGripper;
        MoveL pDetal, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL Offs(pDetal, 0, 0, 50), v100, fine, tGripper;
        
        ! Dojazd nad walek montazowy i nalozenie detalu (z uwzglednieniem poziomu)
        MoveJ Offs(pWalek, 0, 0, 70), v200, fine, tGripper;
        MoveL Offs(pWalek, 0, 0, nZOffs), v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL Offs(pWalek, 0, 0, 70), v100, fine, tGripper;
    ENDPROC

    PROC main()
        Reset H1;
        Reset H2;
        Reset doGripper;
        Reset K3;
        MoveJ pHome, v200, fine, tGripper;
        
        ! 1. Sprawdzenie stanu poczatkowego czujnika B1 (obecnosc detalu 4)
        IF B1 = 1 THEN
            Set H1;
            Reset H2;
            TPWrite "Detal nr 4 obecny na palecie (H1 zielona).";
        ELSE
            Reset H1;
            Set H2;
            TPWrite "Brak detalu nr 4! Alarm H2.";
        ENDIF
        
        ! 2. Oczekiwanie na impuls START (S1 / PLC)
        TPWrite "Oczekiwanie na przycisk START (S1)...";
        WaitDI S1, 1;
        
        ! 3. Detale 1 i 2 (duze) -> Nakladanie na Walek nr 1
        TPWrite "Pobieranie detalu 1 -> Walek 1";
        NakladajNaWalek pPallet1, pPin1, 0;
        
        TPWrite "Pobieranie detalu 2 -> Walek 1 (poziom 2)";
        NakladajNaWalek pPallet2, pPin1, 35;
        
        ! 4. Detale 3 i 4 (male) -> Nakladanie na Walek nr 2
        TPWrite "Pobieranie detalu 3 -> Walek 2";
        NakladajNaWalek pPallet3, pPin2, 0;
        
        TPWrite "Pobieranie detalu 4 -> Walek 2 (poziom 2)";
        NakladajNaWalek pPallet4, pPin2, 35;
        
        ! 5. Po zabraniu detalu 4 paleta jest pusta (B1=0 -> H2 czerwona)
        Reset H1;
        Set H2;
        TPWrite "Paleta oprozniona (B1=0, H2 czerwona).";
        
        ! 6. Wystawienie impulsu potwierdzenia do sterownika PLC (K3)
        PulseDO \PLength:=1.0, K3;
        WaitTime 1.0;
        
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Cykl sortowania 4 detali zakonczony pomyslnie.";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-108",
    sheetId: "CKE ELM.08-108",    workstationDescription: "Automatyczny rozładunek palety 4 detali w układzie siatki 2x2 na zsuwnię podajnika ze sprawdzeniem czujnika obecności B1 oraz czujnika przepełnienia B2 z czasem zrzutu T1.",    signalsTable: [{"name": "S1", "type": "DI", "description": "Przycisk startu procesu rozładunku"}, {"name": "B1", "type": "DI", "description": "Czujnik obecności detalu w strefie zsuwni podajnika"}, {"name": "B2", "type": "DI", "description": "Czujnik przepełnienia podajnika odbiorczego"}, {"name": "H1", "type": "DO", "description": "Lampka sygnalizacyjna trwania rozładunku"}, {"name": "H2", "type": "DO", "description": "Lampka sygnalizacyjna stanu podajnika"}, {"name": "doGripper", "type": "DO", "description": "Chwytak pneumatyczny"}],    targetsTable: [{"name": "pHome", "description": "Pozycja bazowa robota"}, {"name": "pPallet1", "description": "Gniazdo palety [wiersz 1, kolumna 1]"}, {"name": "pPallet2", "description": "Gniazdo palety [wiersz 1, kolumna 2]"}, {"name": "pPallet3", "description": "Gniazdo palety [wiersz 2, kolumna 1]"}, {"name": "pPallet4", "description": "Gniazdo palety [wiersz 2, kolumna 2]"}, {"name": "pConvStart", "description": "Punkt zrzutu na zsuwnię podajnika"}],    procedureSteps: ["1. Załączenie lampki H1 po wciśnięciu przycisku S1.", "2. Kolejne pobieranie detali z gniazd pPallet1..pPallet4 z dojazdami w osi Z za pomocą Offs.", "3. Przeniesienie każdego detalu nad zsuwnię podajnika.", "4. Weryfikacja czujnika B1 oraz odczekanie czasu zrzutu T1 (WaitTime 2.0;).", "5. Zakończenie rozładunku po opróżnieniu palety i powrót do pHome."],    evaluationCriteria: ["Zastosowanie funkcji Offs do generowania trajektorii nad gniazdami palety.", "Synchronizacja z sygnałami czujników zsuwni."],
    title: "ELM.08-108: Automatyczny załadunek palety na taśmociąg",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Zadanie egzaminacyjne 108",
    summary: "Transport 4 detali z palety na taśmę do pojemnika zrzutowego. Przed startem taśma stoi, świeci czerwona H2. Po wciśnięciu S1: H1=1, H2=0. Robot pobiera detal, odkłada w obszarze B1 (pConvStart). Po aktywacji B1 odlicza 5s i wraca do HOME. Taśma rusza. Po wykryciu przez B2 odlicza czas T1 (zrzut do pojemnika), czeka 2s i staje. Sekwencja powtarza się dla 4 detali.",
    tool: "gripper",
    defaultInputs: { S1: false, B1: false, B2: false },
    defaultOutputs: { H1: false, H2: true, doGripper: false, doConvRun: false },
    showConveyor: true,
    showGravityFeeder: true,
    showSorterBins: false,
    blocks: [
      { id: "p1", position: targets.pGripPick, material: "plastic" },
      { id: "p2", position: [targets.pGripPick[0] + 45, targets.pGripPick[1], targets.pGripPick[2]], material: "plastic" },
      { id: "p3", position: [targets.pGripPick[0], targets.pGripPick[1] + 45, targets.pGripPick[2]], material: "plastic" },
      { id: "p4", position: [targets.pGripPick[0] + 45, targets.pGripPick[1] + 45, targets.pGripPick[2]], material: "plastic" },
    ],
    tips: [

      "Przed startem: Set H2; Reset H1; Po wciśnięciu S1: Set H1; Reset H2;",
      "Po odłożeniu na B1: WaitTime 5.0 w trakcie powrotu ramienia do HOME.",
      "Uruchomienie taśmy do czujnika B2, zwłoka T1 (np. 1.5s), zatrzymanie taśmy.",
      "Pętla FOR i FROM 1 TO 4 DO ... ENDFOR."
    
    ],
    starterCode: `MODULE MainModule
    VAR num nDetal := 1;

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 108
    ! Sekwencja 4 detali na przenosnik tasmowy z kontrola B1 i B2
    ! =================================================================

    PROC CyklDetalu()
        ! 1. Pobranie detalu z palety
        MoveJ pGripApproach, v200, fine, tGripper;
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
        
        ! 2. Odlozenie na tasme w obszarze czujnika B1
        MoveJ pConvStartApproach, v200, fine, tGripper;
        MoveL pConvStart, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL pConvStartApproach, v100, fine, tGripper;
        
        ! 3. Odliczenie 5s i powrot do HOME
        MoveJ pHome, v200, fine, tGripper;
        WaitTime 5.0;
        
        ! 4. Uruchomienie tasmociagu
        Set doConvRun;
        WaitDI B2, 1;
        
        ! 5. Czas T1 na zrzut detalu do pojemnika + 2 sekundy zwloki
        WaitTime 1.5;
        WaitTime 2.0;
        Reset doConvRun;
    ENDPROC

    PROC main()
        ! Stan poczatkowy: czerwona H2 wlaczona, zielona H1 wylaczona
        Reset H1;
        Set H2;
        Reset doConvRun;
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        TPWrite "Oczekiwanie na S1...";
        WaitDI S1, 1;
        Set H1;
        Reset H2;
        
        ! Petla transportu 4 detali
        FOR nDetal FROM 1 TO 4 DO
            TPWrite "Transport detalu nr: " \Num:=nDetal;
            CyklDetalu;
        ENDFOR
        
        ! Stan koncowy
        Reset H1;
        Set H2;
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Cykl 4 detali zrealizowany pomyslnie";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-109",
    sheetId: "CKE ELM.08-109",    workstationDescription: "Montaż pionowej wieży z 3 detali klockowych, weryfikacja stabilności przez operatora z przyciskiem S1, automatyczna wymiana narzędzia na pisak tPen w stojaku narzędziowym i wykreślenie wzoru po 16 punktach pP1..pP16.",    signalsTable: [{"name": "S1", "type": "DI", "description": "Przycisk start i wznowienia programu po weryfikacji wieży"}, {"name": "H1", "type": "DO", "description": "Lampka sygnalizacyjna etapu montażu wieży"}, {"name": "H2", "type": "DO", "description": "Lampka sygnalizacyjna etapu kreślenia wzoru"}, {"name": "doGripper", "type": "DO", "description": "Chwytak pneumatyczny robota"}],    targetsTable: [{"name": "pHome", "description": "Pozycja bazowa robota"}, {"name": "pTowerBase", "description": "Podstawa wieży montażowej (poziom 0)"}, {"name": "pTowerLevel1", "description": "Drugi poziom wieży (+50 mm)"}, {"name": "pTowerLevel2", "description": "Trzeci poziom wieży (+100 mm)"}, {"name": "pToolRack", "description": "Stojak automatycznej wymiany narzędzia"}, {"name": "pP1 .. pP16", "description": "Punkty ścieżki rysunkowej na płycie roboczej"}],    procedureSteps: ["1. Ułożenie 3 detali w pionową wieżę (pTowerBase, pTowerLevel1, pTowerLevel2).", "2. Powrót do pHome i oczekiwanie na zatwierdzenie stabilności przez operatora (WaitDI S1, 1;).", "3. Pobranie pisaka tPen ze stojaka narzędzi pToolRack.", "4. Realizacja ścieżki kreślarskiej przez punkty pP1 do pP16 ruchem MoveL.", "5. Podniesienie pisaka i powrót do pHome."],    evaluationCriteria: ["Poprawne naliczanie wysokości poziomów wieży.", "Wymiana narzędzia w stojaku i zmiana parametrów ruchu w kodzie."],
    title: "ELM.08-109: Wieża z 3 detali i trajektoria konturowa P1..P16",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Zadanie egzaminacyjne 109",
    summary: "Dwuetapowe zadanie egzaminacyjne. Etap 1: Robot chwytakiem pobiera 3 detale z palety i układa wieżę (detal na detalu w polu planszy), po każdym pobraniu czekając na wciśnięcie S1. Lampka H1 świeci w etapie 1, a po ułożeniu wieży gaśnie i zapalają się H2, H3. Etap 2: Robot odkłada chwytak / pobiera pisak ze stojaka, prowadzi narzędzie nad planszą po punktach P1..P16 z interpolacją kołową MoveC i liniową MoveL, odkłada narzędzie i wraca do HOME.",
    tool: "gripper",
    defaultInputs: { S1: false },
    defaultOutputs: { H1: false, H2: false, H3: false, doGripper: false },
    blocks: [
      { id: "t1", position: targets.pGripPick, material: "plastic" },
      { id: "t2", position: [targets.pGripPick[0] + 45, targets.pGripPick[1], targets.pGripPick[2]], material: "plastic" },
      { id: "t3", position: [targets.pGripPick[0] + 90, targets.pGripPick[1], targets.pGripPick[2]], material: "plastic" },
    ],
    tips: [

      "Wieża: detal 1 na pTowerBase, detal 2 na pTowerLevel1, detal 3 na pTowerLevel2.",
      "Po ułożeniu 3 detali: Reset H1; Set H2; Set H3;",
      "W etapie 2 przejedź po punktach P1 do P16 z prędkością v200.",
      "Wymagane jest użycie przynajmniej raz MoveJ, MoveL oraz MoveC."
    
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 109
    ! Etap 1: Wieza z 3 detali. Etap 2: Trajektoria pisakiem P1..P16
    ! =================================================================

    PROC UlozPoziomWiezy(robtarget pCel)
        MoveJ pGripApproach, v200, fine, tGripper;
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
        
        TPWrite "Oczekiwanie na S1 przed odlozeniem...";
        WaitDI S1, 1;
        
        MoveJ Offs(pCel, 0, 0, 60), v200, fine, tGripper;
        MoveL pCel, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL Offs(pCel, 0, 0, 60), v100, fine, tGripper;
    ENDPROC

    PROC main()
        ! ETAP 1: Układanie wieży z trzech detali
        Set H1;
        Reset H2;
        Reset H3;
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        TPWrite "ETAP 1: Ukladanie wiezy z detali";
        UlozPoziomWiezy pTowerBase;
        UlozPoziomWiezy pTowerLevel1;
        UlozPoziomWiezy pTowerLevel2;
        
        ! Zmiana sygnalizacji: H1 gasnie, H2 i H3 zapalone
        Reset H1;
        Set H2;
        Set H3;
        TPWrite "Wieza ulozona. Rozpoczecie Etapu 2.";
        
        ! ETAP 2: Pobranie narzedzia i przejazd P1..P16
        MoveJ pToolRackApproach, v200, fine, tGripper;
        MoveL pToolRack, v100, fine, tGripper;
        WaitTime 0.5;
        MoveL pToolRackApproach, v100, fine, tGripper;
        
        ! Ruch po trajektorii planszy (MoveJ, MoveL, MoveC)
        MoveJ pP1, v200, fine, tPen;
        MoveL pP2, v100, fine, tPen;
        MoveL pP3, v100, fine, tPen;
        MoveL pP4, v100, fine, tPen;
        MoveC pP5, pP6, v100, fine, tPen;
        MoveL pP7, v100, fine, tPen;
        MoveL pP8, v100, fine, tPen;
        MoveL pP9, v100, fine, tPen;
        MoveL pP10, v100, fine, tPen;
        MoveL pP11, v100, fine, tPen;
        MoveL pP12, v100, fine, tPen;
        MoveC pP13, pP14, v100, fine, tPen;
        MoveL pP15, v100, fine, tPen;
        MoveL pP16, v100, fine, tPen;
        
        ! Odlozenie narzedzia do magazynu
        MoveJ pToolRackApproach, v200, fine, tGripper;
        MoveL pToolRack, v100, fine, tGripper;
        WaitTime 0.5;
        MoveL pToolRackApproach, v100, fine, tGripper;
        
        ! Powrot do HOME
        MoveJ pHome, v200, fine, tGripper;
        Reset H2;
        Reset H3;
        TPWrite "Egzamin 109 zrealizowany w calosci";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-110",
    sheetId: "CKE ELM.08-110",    workstationDescription: "Obsługa gniazda obróbczego: podanie detalu na pozycję mocowania z weryfikacją czujnika B1, pobranie pisaka tPen i wykonanie ścieżki obróbki pP1..pP12 z postojem technologicznym 3 s w punkcie inspekcyjnym pP7.",    signalsTable: [{"name": "S1", "type": "DI", "description": "Przycisk start procedury obróbczej"}, {"name": "B1", "type": "DI", "description": "Czujnik potwierdzenia prawidłowego zamocowania detalu"}, {"name": "H1", "type": "DO", "description": "Lampa sygnalizacji gotowości gniazda obróbczego"}, {"name": "doGripper", "type": "DO", "description": "Chwytak pneumatyczny robota"}],    targetsTable: [{"name": "pHome", "description": "Pozycja spoczynkowa robota"}, {"name": "pConvStart", "description": "Gniazdo mocujące stanowiska obróbczego"}, {"name": "pToolRack", "description": "Stojak narzędziowy tPen"}, {"name": "pP1 .. pP12", "description": "Punkty trajektorii obróbki (punkt pP7 z postojem 3 s)"}],    procedureSteps: ["1. Pobranie detalu i odłożenie w gnieździe mocującym.", "2. Oczekiwanie na sygnał zamocowania (WaitDI B1, 1;).", "3. Pobranie pisaka tPen ze stojaka narzędziowego pToolRack.", "4. Realizacja ścieżki od pP1 do pP7.", "5. Postój technologiczny 3 s w punkcie pP7 (WaitTime 3.0;).", "6. Kontynuacja trajektorii do pP12 i powrót do bazy pHome."],    evaluationCriteria: ["Precyzyjne wykonanie postoju technicznego w punkcie pP7.", "Poprawna sekwencja ruchów pobrania narzędzia ze stojaka."],
    title: "ELM.08-110: Magazyn opadowy/obróbczy i trajektoria P1..P12",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Zadanie egzaminacyjne 110",
    summary: "Dwuetapowe zadanie. Etap 1: Detal 1 i 2 z palety trafiają do magazynu opadowego. Detal 3 trafia do magazynu detalu obrabianego z czujnikiem B1. Po wykryciu przez B1 zapalają się H1 i H3. Etap 2: Pobranie pisaka, przejazd P1..P7 nad planszą. W punkcie P7 zapala się H2 i robot czeka na wciśnięcie S1. Po S1 lampki H1 i H3 gasną, kontynuacja ruchu P7..P12 z MoveC, odłożenie narzędzia i powrót do HOME.",
    tool: "gripper",
    defaultInputs: { S1: false, B1: false },
    defaultOutputs: { H1: false, H2: false, H3: false, doGripper: false },
    blocks: [
      { id: "d1", position: targets.pGripPick, material: "plastic" },
      { id: "d2", position: [targets.pGripPick[0] + 45, targets.pGripPick[1], targets.pGripPick[2]], material: "plastic" },
      { id: "d3", position: [targets.pGripPick[0] + 90, targets.pGripPick[1], targets.pGripPick[2]], material: "plastic" },
    ],
    tips: [

      "Po odłożeniu detalu 3 na stację B1: WaitDI B1, 1; Set H1; Set H3;",
      "W punkcie P7: Set H2; WaitDI S1, 1; Reset H1; Reset H3;",
      "Zastosuj MoveC na fragmencie łukowym trajektorii planszy."
    
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 110
    ! Rozdzial detali do magazynow i trajektoria z punktem kontrolnym P7
    ! =================================================================

    PROC PrzeniesDoOpadowego()
        MoveJ pGripApproach, v200, fine, tGripper;
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
        
        MoveJ pFeederApproach, v200, fine, tGripper;
        MoveL pFeederPick, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL pFeederApproach, v100, fine, tGripper;
    ENDPROC

    PROC main()
        ! ETAP 1: Przenoszenie detali
        Reset H1;
        Reset H2;
        Reset H3;
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        TPWrite "Detal 1 do magazynu opadowego";
        PrzeniesDoOpadowego;
        
        TPWrite "Detal 2 do magazynu opadowego";
        PrzeniesDoOpadowego;
        
        ! Detal 3 do stacji obrobki z czujnikiem B1
        TPWrite "Detal 3 do stacji B1";
        MoveJ pGripApproach, v200, fine, tGripper;
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
        
        MoveJ Offs(pPin1, 0, 0, 50), v200, fine, tGripper;
        MoveL pPin1, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL Offs(pPin1, 0, 0, 50), v100, fine, tGripper;
        
        ! Sprawdzenie czujnika B1
        WaitDI B1, 1;
        Set H1;
        Set H3;
        
        ! ETAP 2: Narzedzie i trajektoria planszy
        MoveJ pToolRackApproach, v200, fine, tGripper;
        MoveL pToolRack, v100, fine, tGripper;
        WaitTime 0.5;
        MoveL pToolRackApproach, v100, fine, tGripper;
        
        ! Ruch P1..P7
        MoveJ pP1, v200, fine, tPen;
        MoveL pP2, v100, fine, tPen;
        MoveL pP3, v100, fine, tPen;
        MoveL pP4, v100, fine, tPen;
        MoveC pP5, pP6, v100, fine, tPen;
        MoveL pP7, v100, fine, tPen;
        
        ! Punkt kontrolny P7: lampka H2 i czekanie na S1
        Set H2;
        TPWrite "Punkt P7 osiagniety. Wcisnij S1...";
        WaitDI S1, 1;
        Reset H1;
        Reset H3;
        
        ! Ruch P7..P12
        MoveL pP8, v100, fine, tPen;
        MoveL pP9, v100, fine, tPen;
        MoveL pP10, v100, fine, tPen;
        MoveC pP11, pP12, v100, fine, tPen;
        
        ! Odlozenie narzedzia i powrot
        MoveJ pToolRackApproach, v200, fine, tGripper;
        MoveL pToolRack, v100, fine, tGripper;
        WaitTime 0.5;
        MoveL pToolRackApproach, v100, fine, tGripper;
        
        MoveJ pHome, v200, fine, tGripper;
        Reset H2;
        TPWrite "Egzamin 110 ukonczony";
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-111",
    sheetId: "CKE ELM.08-111",    workstationDescription: "Kreślenie figur geometrycznych (kwadrat i okrąg) na arkuszu papieru w lokalnym układzie współrzędnych przedmiotu obrabianego \\WObj:=wobj1 z prędkością v30 i podniesieniem pisaka o 20 mm w osi Z za pomocą Offs.",    signalsTable: [{"name": "S1", "type": "DI", "description": "Przycisk START kreślenia wzorów"}, {"name": "H1", "type": "DO", "description": "Lampa sygnalizacyjna trwania kreślenia"}],    targetsTable: [{"name": "pHome", "description": "Pozycja bazowa manipulatora"}, {"name": "pSquare1 .. pSquare4", "description": "Narożniki kwadratu zdefiniowane w układzie wobj1"}, {"name": "pCircle1, pCircle2", "description": "Punkty krańcowe średnicy okręgu w układzie wobj1"}, {"name": "pCircleVia1, pCircleVia2", "description": "Punkty pośrednie łuków okręgu w układzie wobj1"}],    procedureSteps: ["1. Oczekiwanie na przycisk S1 i załączenie lampki H1.", "2. Dojazd nad pierwszy narożnik z offsetem: MoveJ Offs(pSquare1, 0, 0, 20), v100, fine, tPen \\WObj:=wobj1;.", "3. Rysowanie boków kwadratu ruchem liniowym MoveL z prędkością v30 w układzie wobj1.", "4. Podniesienie pisaka o 20 mm w osi Z za pomocą Offs i przejazd nad okrąg.", "5. Wykreślenie okręgu dwoma łukami MoveC z prędkością v30 w układzie wobj1.", "6. Podniesienie narzędzia, wyłączenie lampki H1 i powrót do pHome."],    evaluationCriteria: ["Konsekwentne stosowanie przełącznika \\WObj:=wobj1 w instrukcjach ruchu.", "Podnoszenie narzędzia nad papierem za pomocą Offs(..., 0, 0, 20).", "Zachowanie prędkości roboczej v30."],
    title: "ELM.08-111: Rysowanie: Kwadrat i Okrąg w wobj1 z funkcją Offs",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Zadanie egzaminacyjne 111",
    summary: "Program o nazwie EGZAMIN pracujący w pętli po naciśnięciu S1. Rysowanie figur w zadeklarowanym układzie użytkownika wobj1: kwadrat (świeci H1) oraz okrąg wewnątrz kwadratu (świeci H2). Ruchy rysowania z prędkością 30 mm/s (v30). Przejście między figurami z uniesieniem pisaka o 20 mm funkcją odsunięcia Offs. Po zakończeniu powrót do HOME.",
    tool: "pen",
    defaultInputs: { S1: false },
    defaultOutputs: { H1: false, H2: false },
    tips: [

      "Nazwij moduł lub procedurę główną zgodnie z arkuszem: PROC EGZAMIN() lub PROC main().",
      "Wymóg CKE: wykorzystaj co najmniej jedną funkcję odsunięcia, np. Offs(pSquareA, 0, 0, 20).",
      "Wymóg CKE: wybierz zadeklarowany układ użytkownika: \WObj:=wobj1;",
      "Prędkość rysowania linii: v30 (30 mm/s)."
    
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 111
    ! Stanowisko rysujace: Kwadrat i Okrag w ukladzie wobj1 z funkcja Offs
    ! =================================================================

    PROC RysujKwadrat()
        Set H1;
        TPWrite "Rysowanie kwadratu w wobj1 (v30)...";
        MoveL pSquareA, v30, fine, tPen \WObj:=wobj1;
        MoveL pSquareB, v30, fine, tPen \WObj:=wobj1;
        MoveL pSquareC, v30, fine, tPen \WObj:=wobj1;
        MoveL pSquareD, v30, fine, tPen \WObj:=wobj1;
        MoveL pSquareA, v30, fine, tPen \WObj:=wobj1;
        Reset H1;
        
        ! Podniesienie pisaka o 20 mm funkcja Offs
        MoveL Offs(pSquareA, 0, 0, 20), v100, fine, tPen \WObj:=wobj1;
    ENDPROC

    PROC RysujOkrag()
        Set H2;
        TPWrite "Rysowanie okregu wewnatrz kwadratu (v30)...";
        MoveJ Offs(pCircleA, 0, 0, 20), v200, fine, tPen \WObj:=wobj1;
        MoveL pCircleA, v30, fine, tPen \WObj:=wobj1;
        MoveC pCircleB, pCircleC, v30, fine, tPen \WObj:=wobj1;
        MoveC pCircleD, pCircleA, v30, fine, tPen \WObj:=wobj1;
        Reset H2;
        
        ! Podniesienie pisaka o 20 mm funkcja Offs
        MoveL Offs(pCircleA, 0, 0, 20), v100, fine, tPen \WObj:=wobj1;
    ENDPROC

    PROC EGZAMIN()
        Reset H1;
        Reset H2;
        MoveJ pHome, v200, fine, tPen;
        
        TPWrite "Oczekiwanie na start cyklu rysowania (S1)...";
        WaitDI S1, 1;
        
        ! Wykonanie rysunku
        RysujKwadrat;
        RysujOkrag;
        
        ! Powrot do HOME
        MoveJ pHome, v200, fine, tPen;
        TPWrite "Cykl rysowania ukonczony pomyslnie";
    ENDPROC

    PROC main()
        EGZAMIN;
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-112",
    sheetId: "CKE ELM.08-112",    workstationDescription: "Kreślenie wzornika (trójkąt + okrąg) na dwóch niezależnych arkuszach roboczych w układach wobj1 (lampa H1) oraz wobj2 (lampa H2) z prędkością roboczą v30, podniesieniem Offs o 20 mm i przerwą technologiczną 2.0 s.",    signalsTable: [{"name": "S1", "type": "DI", "description": "Przycisk startu cyklu dwustrefowego"}, {"name": "H1", "type": "DO", "description": "Sygnalizacja kreślenia na obszarze wobj1 (strefa lewa)"}, {"name": "H2", "type": "DO", "description": "Sygnalizacja kreślenia na obszarze wobj2 (strefa prawa)"}],    targetsTable: [{"name": "pHome", "description": "Pozycja bazowa robota"}, {"name": "pTriangleA, pTriangleB, pTriangleC", "description": "Wierzchołki trójkąta wzornika"}, {"name": "pCircle1, pCircle2", "description": "Punkty początkowe/końcowe łuków okręgu"}, {"name": "pCircleVia1, pCircleVia2", "description": "Punkty przejściowe łuków okręgu"}],    procedureSteps: ["1. Załączenie lampki H1. Rysowanie trójkąta i okręgu w układzie \\WObj:=wobj1 z prędkością v30. Wyłączenie H1.", "2. Powrót do pozycji pHome i odczekanie przerwy technologicznej 2.0 s (WaitTime 2.0;).", "3. Załączenie lampki H2. Rysowanie trójkąta i okręgu w układzie \\WObj:=wobj2 z prędkością v30. Wyłączenie H2.", "4. Powrót do pHome i zakończenie programu."],    evaluationCriteria: ["Przełączanie układów współrzędnych przedmiotu \\WObj:=wobj1 i \\WObj:=wobj2.", "Odpowiednia sygnalizacja lampkami H1 oraz H2 dla każdej ze stref roboczych.", "Prawidłowa przerwa technologiczna 2.0 s w pozycji pHome."],
    title: "ELM.08-112: Rysowanie: Trójkąt i Okrąg w wobj1 i wobj2 z funkcją Offs",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Zadanie egzaminacyjne 112",
    summary: "Program EGZAMIN. Wykonanie rysunku figur (trójkąt wewnątrz okręgu) w dwóch różnych układach użytkownika. Najpierw wg wobj1 (świeci H1, prędkość v30), podniesienie pisaka o 20 mm funkcją Offs, powrót do HOME. Po odczekaniu 2 sekund powtórzenie tego samego wzorca wg wobj2 (świeci H2), powrót do HOME. Program pracuje w pętli.",
    tool: "pen",
    defaultInputs: { S1: false },
    defaultOutputs: { H1: false, H2: false },
    tips: [

      "Wymóg CKE: wykorzystaj dwa układy współrzędnych użytkownika: \WObj:=wobj1 oraz \WObj:=wobj2.",
      "Przejście między figurami z uniesieniem pisaka 20 mm ponad kartkę: Offs(punkt, 0, 0, 20).",
      "Prędkość rysowania: v30 (30 mm/s). Odczekanie 2s: WaitTime 2.0;"
    
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 112
    ! Podwojny rysunek: trojkat w okregu w ukladach wobj1 i wobj2
    ! =================================================================

    PROC RysujWzorzecWobj1()
        Set H1;
        TPWrite "Rysowanie wg ukladu wobj1 (H1)...";
        
        ! 1. Trojkat w wobj1
        MoveJ Offs(pTriangleA, 0, 0, 20), v200, fine, tPen \WObj:=wobj1;
        MoveL pTriangleA, v30, fine, tPen \WObj:=wobj1;
        MoveL pTriangleB, v30, fine, tPen \WObj:=wobj1;
        MoveL pTriangleC, v30, fine, tPen \WObj:=wobj1;
        MoveL pTriangleA, v30, fine, tPen \WObj:=wobj1;
        MoveL Offs(pTriangleA, 0, 0, 20), v100, fine, tPen \WObj:=wobj1;
        
        ! 2. Okrag w wobj1
        MoveJ Offs(pCircleA, 0, 0, 20), v200, fine, tPen \WObj:=wobj1;
        MoveL pCircleA, v30, fine, tPen \WObj:=wobj1;
        MoveC pCircleB, pCircleC, v30, fine, tPen \WObj:=wobj1;
        MoveC pCircleD, pCircleA, v30, fine, tPen \WObj:=wobj1;
        MoveL Offs(pCircleA, 0, 0, 20), v100, fine, tPen \WObj:=wobj1;
        
        Reset H1;
    ENDPROC

    PROC RysujWzorzecWobj2()
        Set H2;
        TPWrite "Rysowanie wg ukladu wobj2 (H2)...";
        
        ! 1. Trojkat w wobj2
        MoveJ Offs(pTriangleA, 0, 0, 20), v200, fine, tPen \WObj:=wobj2;
        MoveL pTriangleA, v30, fine, tPen \WObj:=wobj2;
        MoveL pTriangleB, v30, fine, tPen \WObj:=wobj2;
        MoveL pTriangleC, v30, fine, tPen \WObj:=wobj2;
        MoveL pTriangleA, v30, fine, tPen \WObj:=wobj2;
        MoveL Offs(pTriangleA, 0, 0, 20), v100, fine, tPen \WObj:=wobj2;
        
        ! 2. Okrag w wobj2
        MoveJ Offs(pCircleA, 0, 0, 20), v200, fine, tPen \WObj:=wobj2;
        MoveL pCircleA, v30, fine, tPen \WObj:=wobj2;
        MoveC pCircleB, pCircleC, v30, fine, tPen \WObj:=wobj2;
        MoveC pCircleD, pCircleA, v30, fine, tPen \WObj:=wobj2;
        MoveL Offs(pCircleA, 0, 0, 20), v100, fine, tPen \WObj:=wobj2;
        
        Reset H2;
    ENDPROC

    PROC EGZAMIN()
        Reset H1;
        Reset H2;
        MoveJ pHome, v200, fine, tPen;
        
        TPWrite "Oczekiwanie na S1...";
        WaitDI S1, 1;
        
        ! Rysunek 1 wg wobj1
        RysujWzorzecWobj1;
        MoveJ pHome, v200, fine, tPen;
        
        ! Oczekaj 2 sekundy
        TPWrite "Zwloka 2s przed wobj2...";
        WaitTime 2.0;
        
        ! Rysunek 2 wg wobj2
        RysujWzorzecWobj2;
        MoveJ pHome, v200, fine, tPen;
        
        TPWrite "Oba rysunki ukonczone pomyslnie";
    ENDPROC

    PROC main()
        EGZAMIN;
    ENDPROC

ENDMODULE`,
  },
];
export const blankProjectCode = `MODULE MainModule

    PROC main()
        TPWrite "Moj program RAPID";
    ENDPROC

ENDMODULE`;

export function findTargetKey(targetLibrary: Record<string, [number, number, number]>, name: string): string | undefined {
  if (targetLibrary[name]) return name;
  const lower = name.toLowerCase();
  return Object.keys(targetLibrary).find((key) => key.toLowerCase() === lower);
}

export function findOutputName(name: string): string {
  return name;
}

export function findInputName(name: string): string {
  return name;
}

function removeComment(source: string) {
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '"') quoted = !quoted;
    if (source[index] === "!" && !quoted) return source.slice(0, index);
  }
  return source;
}

export function evaluateExpression(expr: string, context: EvaluationContext): any {
  const trimmed = expr.trim();
  if (!trimmed) return "";

  // Tokenize
  const tokens: Array<{ type: string; value: string }> = [];
  let i = 0;
  while (i < trimmed.length) {
    const ch = trimmed[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    // String literal
    if (ch === '"') {
      let strVal = "";
      i++; // skip opening quote
      while (i < trimmed.length) {
        if (trimmed[i] === '"') {
          if (i + 1 < trimmed.length && trimmed[i + 1] === '"') {
            strVal += '"';
            i += 2;
          } else {
            i++; // skip closing quote
            break;
          }
        } else {
          strVal += trimmed[i];
          i++;
        }
      }
      tokens.push({ type: "STRING", value: strVal });
      continue;
    }
    // Number literal
    if (/\d/.test(ch) || (ch === "." && i + 1 < trimmed.length && /\d/.test(trimmed[i + 1]))) {
      let numStr = "";
      while (i < trimmed.length && /[\d.]/.test(trimmed[i])) {
        numStr += trimmed[i];
        i++;
      }
      tokens.push({ type: "NUMBER", value: numStr });
      continue;
    }
    // Multi-char operators
    const twoChars = trimmed.slice(i, i + 2);
    if (twoChars === "<>" || twoChars === "<=" || twoChars === ">=" || twoChars === ":=") {
      tokens.push({ type: "OPERATOR", value: twoChars });
      i += 2;
      continue;
    }
    // Single-char symbols / operators
    if ("=<>+-*/()[],{}".includes(ch)) {
      tokens.push({ type: "OPERATOR", value: ch });
      i++;
      continue;
    }
    // Identifiers & keywords
    if (/[A-Za-z_]/.test(ch)) {
      let ident = "";
      while (i < trimmed.length && /[A-Za-z0-9_]/.test(trimmed[i])) {
        ident += trimmed[i];
        i++;
      }
      const upper = ident.toUpperCase();
      if (upper === "TRUE" || upper === "FALSE") {
        tokens.push({ type: "BOOLEAN", value: upper });
      } else if (["AND", "OR", "XOR", "NOT", "DIV", "MOD"].includes(upper)) {
        tokens.push({ type: "KEYWORD_OP", value: upper });
      } else {
        tokens.push({ type: "IDENT", value: ident });
      }
      continue;
    }

    i++;
  }

  let pos = 0;
  function peek() {
    return tokens[pos];
  }
  function consume(expected?: string) {
    const t = tokens[pos];
    if (expected && (!t || t.value !== expected)) {
      throw new Error(`Oczekiwano '${expected}', otrzymano '${t ? t.value : "EOF"}'`);
    }
    pos++;
    return t;
  }

  function parseOr(): any {
    let left = parseAnd();
    while (pos < tokens.length) {
      const token = peek();
      if (token && token.type === "KEYWORD_OP" && (token.value === "OR" || token.value === "XOR")) {
        consume();
        const right = parseAnd();
        if (token.value === "OR") left = Boolean(left || right);
        else left = Boolean(left ? !right : right);
      } else {
        break;
      }
    }
    return left;
  }

  function parseAnd(): any {
    let left = parseEquality();
    while (pos < tokens.length) {
      const token = peek();
      if (token && token.type === "KEYWORD_OP" && token.value === "AND") {
        consume();
        const right = parseEquality();
        left = Boolean(left && right);
      } else {
        break;
      }
    }
    return left;
  }

  function parseEquality(): any {
    let left = parseRelational();
    while (pos < tokens.length) {
      const token = peek();
      if (token && token.type === "OPERATOR" && (token.value === "=" || token.value === "<>")) {
        consume();
        const right = parseRelational();
        if (token.value === "=") left = left == right;
        else left = left != right;
      } else {
        break;
      }
    }
    return left;
  }

  function parseRelational(): any {
    let left = parseAdditive();
    while (pos < tokens.length) {
      const token = peek();
      if (token && token.type === "OPERATOR" && ["<", "<=", ">", ">="].includes(token.value)) {
        consume();
        const right = parseAdditive();
        if (token.value === "<") left = Number(left) < Number(right);
        else if (token.value === "<=") left = Number(left) <= Number(right);
        else if (token.value === ">") left = Number(left) > Number(right);
        else if (token.value === ">=") left = Number(left) >= Number(right);
      } else {
        break;
      }
    }
    return left;
  }

  function parseAdditive(): any {
    let left = parseMultiplicative();
    while (pos < tokens.length) {
      const token = peek();
      if (token && token.type === "OPERATOR" && (token.value === "+" || token.value === "-")) {
        consume();
        const right = parseMultiplicative();
        if (token.value === "+") {
          if (typeof left === "string" || typeof right === "string") {
            left = String(left ?? "") + String(right ?? "");
          } else {
            left = Number(left) + Number(right);
          }
        } else {
          left = Number(left) - Number(right);
        }
      } else {
        break;
      }
    }
    return left;
  }

  function parseMultiplicative(): any {
    let left = parseUnary();
    while (pos < tokens.length) {
      const token = peek();
      if (
        token &&
        ((token.type === "OPERATOR" && (token.value === "*" || token.value === "/")) ||
          (token.type === "KEYWORD_OP" && (token.value === "DIV" || token.value === "MOD")))
      ) {
        consume();
        const right = parseUnary();
        if (token.value === "*") left = Number(left) * Number(right);
        else if (token.value === "/") left = Number(left) / Number(right);
        else if (token.value === "DIV") left = Math.floor(Number(left) / Number(right));
        else if (token.value === "MOD") left = Number(left) % Number(right);
      } else {
        break;
      }
    }
    return left;
  }

  function parseUnary(): any {
    const token = peek();
    if (token) {
      if (token.type === "OPERATOR" && token.value === "-") {
        consume();
        return -Number(parseUnary());
      }
      if (token.type === "OPERATOR" && token.value === "+") {
        consume();
        return +Number(parseUnary());
      }
      if (token.type === "KEYWORD_OP" && token.value === "NOT") {
        consume();
        return !parseUnary();
      }
    }
    return parsePrimary();
  }

  function parsePrimary(): any {
    const token = consume();
    if (!token) return undefined;

    if (token.type === "NUMBER") {
      return Number(token.value);
    }
    if (token.type === "STRING") {
      return token.value;
    }
    if (token.type === "BOOLEAN") {
      return token.value === "TRUE";
    }
    if (token.type === "OPERATOR" && token.value === "(") {
      const val = parseOr();
      if (peek() && peek().value === ")") consume(")");
      return val;
    }
    if (token.type === "OPERATOR" && (token.value === "[" || token.value === "{")) {
      const closeChar = token.value === "[" ? "]" : "}";
      const elements: any[] = [];
      while (pos < tokens.length && peek()?.value !== closeChar) {
        elements.push(parseOr());
        if (peek()?.value === ",") consume(",");
      }
      if (peek()?.value === closeChar) consume(closeChar);
      return elements;
    }
    if (token.type === "IDENT") {
      // Function call: DInput(sig), DOutput(sig), etc.
      if (peek() && peek().value === "(") {
        const fnName = token.value.toUpperCase();
        consume("(");
        let argName = "";
        if (peek() && peek().value !== ")") {
          const argTok = consume();
          argName = argTok.value;
        }
        if (peek() && peek().value === ")") consume(")");

        if (fnName === "DINPUT") {
          const inKey = Object.keys(context.inputs || {}).find((k) => k.toLowerCase() === argName.toLowerCase());
          return inKey && context.inputs ? (context.inputs[inKey] ? 1 : 0) : 0;
        }
        if (fnName === "DOUTPUT") {
          const outKey = Object.keys(context.outputs || {}).find((k) => k.toLowerCase() === argName.toLowerCase());
          return outKey && context.outputs ? (context.outputs[outKey] ? 1 : 0) : 0;
        }
      }

      const lower = token.value.toLowerCase();
      // Look in variables
      if (context.variables && lower in context.variables) {
        return context.variables[lower];
      }
      // Look in inputs
      if (context.inputs) {
        const inKey = Object.keys(context.inputs).find((k) => k.toLowerCase() === lower);
        if (inKey) return context.inputs[inKey] ? 1 : 0;
      }
      // Look in outputs
      if (context.outputs) {
        const outKey = Object.keys(context.outputs).find((k) => k.toLowerCase() === lower);
        if (outKey) return context.outputs[outKey] ? 1 : 0;
      }
      // Look in targetLibrary
      if (context.targetLibrary) {
        const canonical = findTargetKey(context.targetLibrary, token.value);
        if (canonical && context.targetLibrary[canonical]) {
          return context.targetLibrary[canonical];
        }
      }
      // Fallback
      return 0;
    }

    return token.value;
  }

  try {
    return parseOr();
  } catch (_e) {
    return trimmed;
  }
}

export function formatTPWrite(
  command: { text?: string; textExpr?: string; params?: TPWriteParam[] },
  context: EvaluationContext
): string {
  if (command.text !== undefined && !command.textExpr && (!command.params || command.params.length === 0)) {
    return command.text;
  }

  let baseText = "";
  if (command.textExpr !== undefined) {
    const val = evaluateExpression(command.textExpr, context);
    baseText = val === undefined || val === null ? "" : String(val);
  } else if (command.text !== undefined) {
    baseText = command.text;
  }

  if (!command.params || command.params.length === 0) {
    return baseText;
  }

  const paramTexts = command.params.map((p) => {
    if (!p.expr) return "";
    const val = evaluateExpression(p.expr, context);
    if (p.kind === "bool") {
      return val ? "TRUE" : "FALSE";
    }
    if (p.kind === "pos" || p.kind === "orient") {
      if (Array.isArray(val)) {
        return `[${val.join(", ")}]`;
      }
      return String(val ?? "");
    }
    if (typeof val === "number") {
      return Number.isInteger(val) ? String(val) : String(Number(val.toFixed(4)));
    }
    if (Array.isArray(val)) {
      return `[${val.join(", ")}]`;
    }
    return String(val ?? "");
  });

  return baseText + paramTexts.join("");
}

export function parseDeclaration(source: string): { variables: Array<{ name: string; type: string; initialValue?: any }> } | null {
  const match = source.match(/^(?:VAR|PERS|CONST|TASK)\s+([A-Za-z_]\w*)\s+(.+?);?$/i);
  if (!match) return null;
  const typeName = match[1].toLowerCase();
  const defsStr = match[2];

  const variables: Array<{ name: string; type: string; initialValue?: any }> = [];

  const defs: string[] = [];
  let current = "";
  let inQ = false;
  let depth = 0;
  for (let i = 0; i < defsStr.length; i++) {
    const ch = defsStr[i];
    if (ch === '"') inQ = !inQ;
    else if (!inQ) {
      if (ch === '[' || ch === '(' || ch === '{') depth++;
      else if (ch === ']' || ch === ')' || ch === '}') depth--;
      else if (ch === ',' && depth === 0) {
        defs.push(current.trim());
        current = "";
        continue;
      }
    }
    current += ch;
  }
  if (current.trim()) {
    defs.push(current.trim());
  }

  for (const def of defs) {
    const assignMatch = def.match(/^([A-Za-z_]\w*)(?:\s*:=\s*(.+))?$/);
    if (assignMatch) {
      const name = assignMatch[1];
      const rawVal = assignMatch[2]?.trim();
      let initialValue: any = undefined;
      if (rawVal !== undefined) {
        initialValue = evaluateExpression(rawVal, { variables: {}, targetLibrary: targets });
      } else {
        if (typeName === "num" || typeName === "dnum") initialValue = 0;
        else if (typeName === "bool") initialValue = false;
        else if (typeName === "string") initialValue = "";
        else if (typeName === "pos") initialValue = [0, 0, 0];
        else initialValue = 0;
      }
      variables.push({ name, type: typeName, initialValue });
    }
  }

  return { variables };
}

export function parseTPWriteArgs(argsStr: string): { textExpr?: string; params: TPWriteParam[]; error?: string } {
  const trimmed = argsStr.trim();
  if (!trimmed) {
    return { params: [] };
  }

  let firstSlashIdx = -1;
  let inQuote = false;
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === '"') {
      inQuote = !inQuote;
    } else if (trimmed[i] === "\\" && !inQuote) {
      firstSlashIdx = i;
      break;
    }
  }

  let textExpr: string | undefined = undefined;
  let paramsPart = "";

  if (firstSlashIdx === -1) {
    textExpr = trimmed;
  } else {
    const rawText = trimmed.slice(0, firstSlashIdx).trim();
    const cleanedText = rawText.replace(/,\s*$/, "").trim();
    if (cleanedText.length > 0) {
      textExpr = cleanedText;
    }
    paramsPart = trimmed.slice(firstSlashIdx);
  }

  const params: TPWriteParam[] = [];
  if (paramsPart) {
    let i = 0;
    while (i < paramsPart.length) {
      if (paramsPart[i] !== "\\") {
        i++;
        continue;
      }
      i++; // skip '\'
      let paramName = "";
      while (i < paramsPart.length && /[A-Za-z_]/.test(paramsPart[i])) {
        paramName += paramsPart[i];
        i++;
      }
      while (i < paramsPart.length && /\s/.test(paramsPart[i])) i++;
      if (i + 1 < paramsPart.length && paramsPart.slice(i, i + 2) === ":=") {
        i += 2;
      } else {
        return { params: [], error: `Niepoprawna składnia parametru \\${paramName} (brak :=)` };
      }
      while (i < paramsPart.length && /\s/.test(paramsPart[i])) i++;

      let exprStr = "";
      let pInQ = false;
      let pDepth = 0;
      while (i < paramsPart.length) {
        const ch = paramsPart[i];
        if (ch === '"') pInQ = !pInQ;
        else if (!pInQ) {
          if (ch === "[" || ch === "(" || ch === "{") pDepth++;
          else if (ch === "]" || ch === ")" || ch === "}") pDepth--;
          else if (pDepth === 0 && (ch === "\\" || ch === "," || ch === ";")) {
            if (ch === ",") {
              i++;
              while (i < paramsPart.length && /\s/.test(paramsPart[i])) i++;
            }
            break;
          }
        }
        exprStr += ch;
        i++;
      }

      const pLower = paramName.toLowerCase();
      if (["num", "dnum", "bool", "pos", "orient"].includes(pLower)) {
        params.push({ kind: pLower as any, expr: exprStr.trim() });
      } else {
        return { params: [], error: `Nieobsługiwany typ parametru TPWrite \\${paramName}` };
      }
    }
  }

  return { textExpr, params };
}

function parseSpeed(str?: string): number {
  if (!str) return 100;
  const match = str.match(/^v(\d+|max)/i);
  if (match) {
    if (match[1].toLowerCase() === "max") return 1000;
    return Number(match[1]) || 100;
  }
  const val = Number(str);
  return isNaN(val) ? 100 : val;
}

export function splitTopLevelArgs(argsStr: string): string[] {
  const result: string[] = [];
  let current = "";
  let depth = 0;
  let inQuote = false;
  for (let i = 0; i < argsStr.length; i++) {
    const ch = argsStr[i];
    if (ch === '"') inQuote = !inQuote;
    else if (!inQuote) {
      if (ch === '(' || ch === '[' || ch === '{') depth++;
      else if (ch === ')' || ch === ']' || ch === '}') depth--;
      else if (ch === ',' && depth === 0) {
        if (current.trim()) result.push(current.trim());
        current = "";
        continue;
      }
    }
    current += ch;
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function parseTargetExpr(str: string, targetLibrary: Record<string, [number, number, number]>): { target: string; offset?: [number, number, number]; offsetExpr?: [string, string, string] } | null {
  const trimmed = str.trim();
  const offsMatch = trimmed.match(/^Offs\s*\(\s*([A-Za-z_]\w*)\s*,\s*([^,]+)\s*,\s*([^,]+)\s*,\s*([^)]+)\s*\)/i);
  if (offsMatch) {
    const rawTarget = offsMatch[1];
    const canonical = findTargetKey(targetLibrary, rawTarget);
    if (!canonical) return null;
    const exprX = offsMatch[2].trim();
    const exprY = offsMatch[3].trim();
    const exprZ = offsMatch[4].trim();
    const dx = Number(evaluateExpression(exprX, { variables: {}, targetLibrary })) || 0;
    const dy = Number(evaluateExpression(exprY, { variables: {}, targetLibrary })) || 0;
    const dz = Number(evaluateExpression(exprZ, { variables: {}, targetLibrary })) || 0;
    return {
      target: canonical,
      offset: [dx, dy, dz],
      offsetExpr: [exprX, exprY, exprZ],
    };
  }

  const canonical = findTargetKey(targetLibrary, trimmed);
  if (canonical) return { target: canonical };
  return null;
}

type ProcedureDefinition = {
  name: string;
  params: string[];
  startLine: number;
  body: { text: string; line: number }[];
};

type BlockControl =
  | {
      kind: "if";
      branchJumpsToPatch: number[];
      endJumpsToPatch: number[];
      startLine: number;
    }
  | {
      kind: "while";
      startIndex: number;
      jumpFalseIndex: number;
      startLine: number;
    }
  | {
      kind: "for";
      varName: string;
      stepExpr: string;
      startIndex: number;
      jumpFalseIndex: number;
      startLine: number;
    };

export function compile(
  code: string,
  targetLibrary: Record<string, [number, number, number]> = targets
): { commands: Command[]; initialVariables?: Record<string, any>; error?: string; errorLine?: number } {
  const lines = code.split("\n");
  const procedures = new Map<string, ProcedureDefinition>();
  const initialVariables: Record<string, any> = {};
  let currentProc: ProcedureDefinition | null = null;

  // Pass 1: Parse module structure, collect declarations and procedures
  for (let index = 0; index < lines.length; index += 1) {
    const lineNum = index + 1;
    const source = removeComment(lines[index]).trim();
    if (!source) continue;

    // Module header / footer
    if (/^MODULE\b/i.test(source) || /^ENDMODULE\b/i.test(source)) {
      continue;
    }

    // Procedure header: PROC name(args) or PROC name
    const procStart = source.match(/^PROC\s+([A-Za-z_]\w*)\s*(?:\((.*?)\))?\s*$/i);
    if (procStart) {
      if (currentProc) {
        return {
          commands: [],
          error: `Linia ${lineNum}: Zagnieżdżone deklaracje procedur nie są dozwolone w RAPID. Brak ENDPROC dla „${currentProc.name}”.`,
          errorLine: lineNum,
        };
      }
      const rawName = procStart[1];
      const lowerName = rawName.toLowerCase();
      if (procedures.has(lowerName)) {
        return {
          commands: [],
          error: `Linia ${lineNum}: Zduplikowana deklaracja procedury „${rawName}”.`,
          errorLine: lineNum,
        };
      }
      const paramsStr = procStart[2]?.trim() || "";
      const params = paramsStr
        ? paramsStr.split(",").map((p) => {
            const m = p.trim().match(/^(?:[A-Za-z_]\w*\s+)?([A-Za-z_]\w*)$/);
            return m ? m[1].toLowerCase() : p.trim().toLowerCase();
          })
        : [];
      currentProc = { name: rawName, params, startLine: lineNum, body: [] };
      procedures.set(lowerName, currentProc);
      continue;
    }

    // Procedure end
    if (/^ENDPROC\b/i.test(source)) {
      if (!currentProc) {
        return {
          commands: [],
          error: `Linia ${lineNum}: ENDPROC bez odpowiadającej deklaracji PROC.`,
          errorLine: lineNum,
        };
      }
      currentProc = null;
      continue;
    }

    // Outside of any procedure: check for variable declarations
    if (!currentProc) {
      const decl = parseDeclaration(source);
      if (decl) {
        for (const v of decl.variables) {
          initialVariables[v.name.toLowerCase()] = v.initialValue;
        }
        continue;
      }
      if (/^(CONST|VAR|PERS|TASK)\b/i.test(source)) {
        continue;
      }
      return {
        commands: [],
        error: `Linia ${lineNum}: Instrukcja „${source.replace(/;$/, "")}” poza wnętrzem procedury.`,
        errorLine: lineNum,
      };
    }

    // Inside a procedure
    currentProc.body.push({ text: source, line: lineNum });
  }

  if (currentProc) {
    return {
      commands: [],
      error: `Linia ${currentProc.startLine}: Brak zamknięcia ENDPROC dla procedury „${currentProc.name}”.`,
      errorLine: currentProc.startLine,
    };
  }

  // Pass 2: Find main entry point (main or EGZAMIN)
  let mainProc = procedures.get("main");
  if (!mainProc) {
    mainProc = procedures.get("egzamin");
  }
  if (!mainProc) {
    return { commands: [], error: "Brak procedury głównej PROC main() lub PROC EGZAMIN().", errorLine: 1 };
  }

  const commands: Command[] = [];

  // Recursive procedure compiler with call stack and cycle detection
  function compileProc(
    proc: ProcedureDefinition,
    callStack: string[] = [],
    argBindings: Record<string, string> = {}
  ): { error?: string; errorLine?: number } | null {
    const procKey = proc.name.toLowerCase();
    if (callStack.includes(procKey)) {
      const chain = [...callStack.map((k) => procedures.get(k)?.name || k), proc.name].join(" -> ");
      return {
        error: `Wykryto zapętlenie wywołań procedur (rekurencja): ${chain}.`,
        errorLine: proc.startLine,
      };
    }
    if (callStack.length > 50) {
      return {
        error: `Przekroczono maksymalną głębokość wywołań procedur (50).`,
        errorLine: proc.startLine,
      };
    }

    const currentStack = [...callStack, procKey];
    const blockStack: BlockControl[] = [];

    for (const item of proc.body) {
      let source = item.text;
      const line = item.line;

      for (const [param, val] of Object.entries(argBindings)) {
        source = source.replace(new RegExp(`\\b${param}\\b`, "gi"), val);
      }

      // Routine-level variable declaration
      const decl = parseDeclaration(source);
      if (decl) {
        for (const v of decl.variables) {
          initialVariables[v.name.toLowerCase()] = v.initialValue;
        }
        continue;
      }
      if (/^(CONST|VAR|PERS|TASK)\b/i.test(source)) continue;

      let match: RegExpMatchArray | null;

      // --- CONTROL FLOW STRUCTURES ---
      // 1. IF ... THEN
      if ((match = source.match(/^IF\s+(.+?)\s+THEN$/i))) {
        const condExpr = match[1].trim();
        commands.push({ type: "jumpIfFalse", expr: condExpr, targetIndex: -1, line });
        blockStack.push({
          kind: "if",
          branchJumpsToPatch: [commands.length - 1],
          endJumpsToPatch: [],
          startLine: line,
        });
        continue;
      }

      // 2. ELSEIF ... THEN
      if ((match = source.match(/^ELSEIF\s+(.+?)\s+THEN$/i))) {
        const top = blockStack[blockStack.length - 1];
        if (!top || top.kind !== "if") {
          return { error: `Linia ${line}: ELSEIF bez odpowiadającego IF.`, errorLine: line };
        }
        commands.push({ type: "jump", targetIndex: -1, line });
        top.endJumpsToPatch.push(commands.length - 1);
        top.branchJumpsToPatch.forEach((idx) => {
          (commands[idx] as any).targetIndex = commands.length;
        });
        top.branchJumpsToPatch = [];

        const condExpr = match[1].trim();
        commands.push({ type: "jumpIfFalse", expr: condExpr, targetIndex: -1, line });
        top.branchJumpsToPatch.push(commands.length - 1);
        continue;
      }

      // 3. ELSE
      if (/^ELSE$/i.test(source)) {
        const top = blockStack[blockStack.length - 1];
        if (!top || top.kind !== "if") {
          return { error: `Linia ${line}: ELSE bez odpowiadającego IF.`, errorLine: line };
        }
        commands.push({ type: "jump", targetIndex: -1, line });
        top.endJumpsToPatch.push(commands.length - 1);
        top.branchJumpsToPatch.forEach((idx) => {
          (commands[idx] as any).targetIndex = commands.length;
        });
        top.branchJumpsToPatch = [];
        continue;
      }

      // 4. ENDIF
      if (/^ENDIF;?$/i.test(source)) {
        const top = blockStack[blockStack.length - 1];
        if (!top || top.kind !== "if") {
          return { error: `Linia ${line}: ENDIF bez odpowiadającego IF.`, errorLine: line };
        }
        top.branchJumpsToPatch.forEach((idx) => {
          (commands[idx] as any).targetIndex = commands.length;
        });
        top.endJumpsToPatch.forEach((idx) => {
          (commands[idx] as any).targetIndex = commands.length;
        });
        blockStack.pop();
        continue;
      }

      // 5. WHILE ... DO
      if ((match = source.match(/^WHILE\s+(.+?)\s+DO$/i))) {
        const condExpr = match[1].trim();
        const startIndex = commands.length;
        commands.push({ type: "jumpIfFalse", expr: condExpr, targetIndex: -1, line });
        blockStack.push({
          kind: "while",
          startIndex,
          jumpFalseIndex: commands.length - 1,
          startLine: line,
        });
        continue;
      }

      // 6. ENDWHILE
      if (/^ENDWHILE;?$/i.test(source)) {
        const top = blockStack[blockStack.length - 1];
        if (!top || top.kind !== "while") {
          return { error: `Linia ${line}: ENDWHILE bez odpowiadającego WHILE.`, errorLine: line };
        }
        commands.push({ type: "jump", targetIndex: top.startIndex, line });
        (commands[top.jumpFalseIndex] as any).targetIndex = commands.length;
        blockStack.pop();
        continue;
      }

      // 7. FOR ... FROM ... TO ... [STEP ...] DO
      if ((match = source.match(/^FOR\s+([A-Za-z_]\w*)\s+FROM\s+(.+?)\s+TO\s+(.+?)(?:\s+STEP\s+(.+?))?\s+DO$/i))) {
        const varName = match[1];
        const startExpr = match[2].trim();
        const endExpr = match[3].trim();
        const stepExpr = match[4]?.trim() || "1";

        if (!(varName.toLowerCase() in initialVariables)) {
          initialVariables[varName.toLowerCase()] = 0;
        }

        commands.push({ type: "assign", variable: varName, expr: startExpr, line });
        const startIndex = commands.length;
        commands.push({ type: "jumpIfFalse", expr: `${varName} <= (${endExpr})`, targetIndex: -1, line });
        blockStack.push({
          kind: "for",
          varName,
          stepExpr,
          startIndex,
          jumpFalseIndex: commands.length - 1,
          startLine: line,
        });
        continue;
      }

      // 8. ENDFOR
      if (/^ENDFOR;?$/i.test(source)) {
        const top = blockStack[blockStack.length - 1];
        if (!top || top.kind !== "for") {
          return { error: `Linia ${line}: ENDFOR bez odpowiadającego FOR.`, errorLine: line };
        }
        commands.push({ type: "add", variable: top.varName, expr: top.stepExpr, line });
        commands.push({ type: "jump", targetIndex: top.startIndex, line });
        (commands[top.jumpFalseIndex] as any).targetIndex = commands.length;
        blockStack.pop();
        continue;
      }

      // --- INSTRUCTIONS ---
      if (/^TPWrite\b/i.test(source)) {
        const argsStr = source.replace(/^TPWrite\s*/i, "").replace(/;$/, "");
        const parsed = parseTPWriteArgs(argsStr);
        if (parsed.error) return { error: `Linia ${line}: ${parsed.error}`, errorLine: line };
        commands.push({ type: "log", textExpr: parsed.textExpr, params: parsed.params, line });
      } else if (/^TPErase\s*;?$/i.test(source)) {
        commands.push({ type: "tpErase", line });
      } else if ((match = source.match(/^(MoveJ|MoveL)\s+(.+?)(?:\s*;|$)/i))) {
        const kind = match[1].toUpperCase() === "MOVEJ" ? "MoveJ" : "MoveL";
        const rest = match[2];

        // Parse optional \WObj:=wobj
        let wobj: string | undefined = undefined;
        const wobjMatch = rest.match(/\\WObj\s*:=\s*(\w+)/i);
        if (wobjMatch) {
          wobj = wobjMatch[1];
        }

        // Split arguments by comma
        const parts: string[] = [];
        let curr = "";
        let inP = 0;
        for (let c = 0; c < rest.length; c++) {
          const ch = rest[c];
          if (ch === "(") inP++;
          else if (ch === ")") inP--;
          else if (ch === "," && inP === 0) {
            parts.push(curr.trim());
            curr = "";
            continue;
          }
          if (ch === "\\" && inP === 0) break; // optional args
          curr += ch;
        }
        if (curr.trim()) parts.push(curr.trim());

        const rawTargetStr = parts[0] || "";
        const parsedTarget = parseTargetExpr(rawTargetStr, targetLibrary);
        if (!parsedTarget) {
          return { error: `Linia ${line}: nieznany cel lub niepoprawne Offs w „${rawTargetStr}”.`, errorLine: line };
        }

        const speedVal = parseSpeed(parts[1]);
        const zoneVal = parts[2]?.trim();
        const toolVal = parts[3]?.trim();

        commands.push({
          type: "move",
          kind,
          target: parsedTarget.target,
          targetOffset: parsedTarget.offset,
          targetOffsetExpr: parsedTarget.offsetExpr,
          speed: speedVal,
          zone: zoneVal,
          tool: toolVal,
          wobj,
          line,
        });
      } else if ((match = source.match(/^MoveC\s+(.+?)(?:\s*;|$)/i))) {
        const rest = match[1];
        let wobj: string | undefined = undefined;
        const wobjMatch = rest.match(/\\WObj\s*:=\s*(\w+)/i);
        if (wobjMatch) wobj = wobjMatch[1];

        const parts: string[] = [];
        let curr = "";
        let inP = 0;
        for (let c = 0; c < rest.length; c++) {
          const ch = rest[c];
          if (ch === "(") inP++;
          else if (ch === ")") inP--;
          else if (ch === "," && inP === 0) {
            parts.push(curr.trim());
            curr = "";
            continue;
          }
          if (ch === "\\" && inP === 0) break;
          curr += ch;
        }
        if (curr.trim()) parts.push(curr.trim());

        const parsedVia = parseTargetExpr(parts[0] || "", targetLibrary);
        const parsedTarget = parseTargetExpr(parts[1] || "", targetLibrary);
        if (!parsedVia) return { error: `Linia ${line}: nieznany punkt pośredni MoveC „${parts[0]}”.`, errorLine: line };
        if (!parsedTarget) return { error: `Linia ${line}: nieznany punkt docelowy MoveC „${parts[1]}”.`, errorLine: line };

        const speedVal = parseSpeed(parts[2]);
        const zoneVal = parts[3]?.trim();
        const toolVal = parts[4]?.trim();

        commands.push({
          type: "move",
          kind: "MoveC",
          via: parsedVia.target,
          viaOffset: parsedVia.offset,
          target: parsedTarget.target,
          targetOffset: parsedTarget.offset,
          targetOffsetExpr: parsedTarget.offsetExpr,
          speed: speedVal,
          zone: zoneVal,
          tool: toolVal,
          wobj,
          line,
        });
      } else if ((match = source.match(/^MoveAbsJ\s+(\w+)/i))) {
        const target = findTargetKey(targetLibrary, match[1]) || match[1];
        commands.push({ type: "move", kind: "MoveAbsJ", target, line });
      } else if ((match = source.match(/^(SetDO)\s+(\w+)\s*,\s*([01]|high|low)\s*;?$/i))) {
        const signal = match[2];
        const isHigh = match[3] === "1" || match[3].toLowerCase() === "high";
        commands.push({ type: "output", signal, value: isHigh, line });
      } else if ((match = source.match(/^(Set|Reset|ResetDO)\s+(\w+)/i))) {
        const signal = match[2];
        const isSet = /^Set$/i.test(match[1]);
        commands.push({ type: "output", signal, value: isSet, line });
      } else if ((match = source.match(/^PulseDO(?:\s*\\?PLength\s*:=\s*([0-9.]+))?\s*,?\s*(\w+)\s*;?$/i))) {
        const length = match[1] ? Number(match[1]) : 1.0;
        const signal = match[2];
        commands.push({ type: "pulse", signal, length: isNaN(length) ? 1.0 : length, line });
      } else if ((match = source.match(/^WaitDI\s+(\w+)\s*,\s*([01]|high|low)\s*;?$/i))) {
        const signal = match[1];
        const isHigh = match[2] === "1" || match[2].toLowerCase() === "high";
        commands.push({ type: "waitInput", signal, value: isHigh, line });
      } else if ((match = source.match(/^WaitDO\s+(\w+)\s*,\s*([01]|high|low)\s*;?$/i))) {
        const signal = match[1];
        const isHigh = match[2] === "1" || match[2].toLowerCase() === "high";
        commands.push({ type: "waitOutput", signal, value: isHigh, line });
      } else if ((match = source.match(/^WaitTime\s+(?:\\InPos\s*,\s*)?([A-Za-z0-9_.]+)/i))) {
        const val = Number(match[1]);
        commands.push({ type: "wait", seconds: isNaN(val) ? 1 : val, line });
      } else if ((match = source.match(/^Incr\s+([A-Za-z_]\w*)(?:\s*,?\s*\\Step\s*:=\s*([^;]+))?\s*;?$/i))) {
        const varName = match[1];
        if (!(varName.toLowerCase() in initialVariables)) initialVariables[varName.toLowerCase()] = 0;
        commands.push({ type: "increment", variable: varName, stepExpr: match[2]?.trim(), line });
      } else if ((match = source.match(/^Decr\s+([A-Za-z_]\w*)(?:\s*,?\s*\\Step\s*:=\s*([^;]+))?\s*;?$/i))) {
        const varName = match[1];
        if (!(varName.toLowerCase() in initialVariables)) initialVariables[varName.toLowerCase()] = 0;
        commands.push({ type: "decrement", variable: varName, stepExpr: match[2]?.trim(), line });
      } else if ((match = source.match(/^Clear\s+([A-Za-z_]\w*)\s*;?$/i))) {
        const varName = match[1];
        if (!(varName.toLowerCase() in initialVariables)) initialVariables[varName.toLowerCase()] = 0;
        commands.push({ type: "clear", variable: varName, line });
      } else if ((match = source.match(/^Add\s+([A-Za-z_]\w*)\s*,\s*([^;]+)\s*;?$/i))) {
        const varName = match[1];
        if (!(varName.toLowerCase() in initialVariables)) initialVariables[varName.toLowerCase()] = 0;
        commands.push({ type: "add", variable: varName, expr: match[2].trim(), line });
      } else if ((match = source.match(/^([A-Za-z_]\w*)\s*:=\s*([^;]+)\s*;?$/i))) {
        const varName = match[1];
        if (!(varName.toLowerCase() in initialVariables)) initialVariables[varName.toLowerCase()] = 0;
        commands.push({ type: "assign", variable: varName, expr: match[2].trim(), line });
      } else if (/^Stop\s*;?$/i.test(source)) {
        commands.push({ type: "stop", line });
      } else {
        // Procedure Call: name; or name(); or name arg1, arg2; or name(arg1, arg2);
        const callMatch = source.match(/^([A-Za-z_]\w*)(?:\s*\((.*?)\)|\s+([^;]+))?\s*;?$/i);
        if (callMatch) {
          const calledName = callMatch[1];
          const calledProc = procedures.get(calledName.toLowerCase());
          if (calledProc) {
            const rawArgsStr = callMatch[2] ?? callMatch[3] ?? "";
            const args = rawArgsStr
              ? splitTopLevelArgs(rawArgsStr)
              : [];
            const bindings: Record<string, string> = {};
            calledProc.params.forEach((paramName, idx) => {
              if (args[idx]) bindings[paramName] = args[idx];
            });
            const res = compileProc(calledProc, currentStack, bindings);
            if (res?.error) return res;
            continue;
          }
        }
        return { error: `Linia ${line}: nieobsługiwana instrukcja lub nieznana procedura „${source.replace(/;$/, "")}”.`, errorLine: line };
      }
    }

    if (blockStack.length > 0) {
      const unclosed = blockStack[blockStack.length - 1];
      return {
        error: `Linia ${unclosed.startLine}: Brak zamknięcia dla struktury ${unclosed.kind.toUpperCase()}.`,
        errorLine: unclosed.startLine,
      };
    }

    return null;
  }

  const result = compileProc(mainProc);
  if (result?.error) {
    return { commands: [], error: result.error, errorLine: result.errorLine };
  }

  return { commands, initialVariables };
}

export function targetNamesInCode(code: string, targetLibrary: Record<string, [number, number, number]> = targets) {
  const names = new Set<string>();
  for (const line of code.split("\n")) {
    const source = removeComment(line);
    const linearMotion = source.match(/^\s*Move(?:J|L)\s+([A-Za-z_]\w*)/i);
    const offsMotion = source.match(/Offs\s*\(\s*([A-Za-z_]\w*)/i);
    const circularMotion = source.match(/^\s*MoveC\s+([A-Za-z_]\w*)\s*,\s*([A-Za-z_]\w*)/i);

    for (const rawName of [linearMotion?.[1], offsMotion?.[1], circularMotion?.[1], circularMotion?.[2]]) {
      if (rawName) {
        const canonical = findTargetKey(targetLibrary, rawName);
        if (canonical) names.add(canonical);
      }
    }
  }
  return [...names];
}

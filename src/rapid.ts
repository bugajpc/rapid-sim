export type Example = {
  id: string;
  title: string;
  topic: string;
  summary: string;
  code: string;
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
  {
    id: "procedures",
    title: "Podprogramy i procedury",
    topic: "Struktura programu",
    summary: "Modularyzacja programu za pomoca wlasnych procedur PROC wywolywanych w main.",
    code: `MODULE MainModule

    PROC PobierzDetal()
        TPWrite "Pobieranie detalu ze stacji...";
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
    ENDPROC

    PROC OdlozDetal()
        TPWrite "Odkladanie detalu do gniazda...";
        MoveJ pGripRetreat, v200, fine, tGripper;
        MoveL pGripPlace, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL pGripRetreat, v100, fine, tGripper;
    ENDPROC

    PROC main()
        TPWrite "Start programu glownego";
        MoveJ pHome, v200, fine, tGripper;
        PobierzDetal;
        OdlozDetal;
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Cykl procedur zakonczony";
    ENDPROC

ENDMODULE`,
  },
];

export type Task = {
  id: string;
  title: string;
  category: "podstawowe" | "elm08";
  topic: string;
  summary: string;
  tips: string[];
  tool: ToolKind;
  starterCode: string;
};

export const tasks: Task[] = [
  // --- 5 ZADAŃ PODSTAWOWYCH / TRENINGOWYCH ---
  {
    id: "task-basic-1",
    title: "1. Komunikaty i bazowanie",
    category: "podstawowe",
    topic: "Podstawy RAPID",
    summary: "Napisz program, który po uruchomieniu wyświetli na panelu operatora komunikat powitalny \"Robot gotowy do pracy\", przemieści ramię robota ruchem MoveJ do pozycji bazowej pHome z prędkością v200 i potwierdzi osiągnięcie celu drugim komunikatem \"Pozycja bazowa osiagnieta\".",
    tool: "pen",
    tips: [
      "Użyj instrukcji TPWrite \"twoj tekst\"; do wypisywania wiadomości w konsoli.",
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
    title: "2. Rysowanie ścieżki liniowej",
    category: "podstawowe",
    topic: "Ruch liniowy MoveL",
    summary: "Ramię robota z narzędziem tPen ma narysować zamknięty kontur kontrolny kwadratu. Rozpocznij od pHome, zjedź do pSquareStart, wykonaj ruchy liniowe MoveL po kolejnych wierzchołkach: pSquareA -> pSquareB -> pSquareC -> pSquareD -> pSquareA, a następnie powróć do pHome.",
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
    title: "3. Licznik wyprodukowanych sztuk",
    category: "podstawowe",
    topic: "Zmienne numeryczne i Incr",
    summary: "Zadeklaruj zmienną numeryczną nPartCounter o wartości początkowej 0. Zasymuluj zliczanie 3 wykonanych operacji w punktach pSquareA, pSquareB i pSquareC. Po osiągnięciu każdego punktu zwiększ licznik instrukcją Incr i wyświetl powiadomienie. Na koniec wyczyść licznik instrukcją Clear.",
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
    title: "4. Przenoszenie detalu chwytakiem",
    category: "podstawowe",
    topic: "Narzędzie Gripper i I/O",
    summary: "Wybierz narzędzie Gripper. Zaprogramuj cykl pobrania bloku ze stołu z pozycji pGripPick i odłożenia go w punkcie pGripPlace. Uwzględnij punkty dojazdowe pGripApproach i pGripRetreat, aby uniknąć kolizji z krawędzią stołu.",
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
    title: "5. Synchronizacja z operatorem (WaitDI)",
    category: "podstawowe",
    topic: "Cyfrowe wejścia/wyjścia",
    summary: "Robot w pozycji pHome oczekuje na sygnał startu od operatora (diStart = 1). Po odebraniu sygnału robot załącza sygnalizację pracy doBusy, wykonuje ruch inspekcyjny do pCircleStart, odczekuje 1 sekundę czasu technologicznego, wraca do pHome, wyłącza doBusy i wystawia sygnał doComplete.",
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

  // --- 5 ZADAŃ EGZAMINACYJNYCH ELM.08 (TECHNIK ROBOTYK) ---
  {
    id: "task-elm08-1",
    title: "ELM.08 Zadanie 1: Gniazdo paletyzacji z kontrolą czujnika",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Egzamin praktyczny",
    summary: "Zadanie egzaminacyjne CKE: Zrobotyzowane gniazdo paletyzacji. Przed pobraniem detalu ramię musi sprawdzić czujnik obecności diPartPresent, zasygnalizować stan zajętości doBusy, przenieść detal z pGripPick do pGripPlace z zachowaniem punktów dojazdu i potwierdzić koniec cyklu sygnałem doComplete.",
    tool: "gripper",
    tips: [
      "Dokładnie przeczytaj kolejność operacji: warunek początkowy -> sprawdzenie czujnika -> sygnalizacja -> transfer -> sygnalizacja końcowa.",
      "Upewnij się, że w panelu SIGNALS włączysz diPartPresent, gdy program przejdzie w stan oczekiwania.",
      "Wymagane jest zachowanie płynności ruchu oraz czasów technologicznych 0.5 s po każdej zmianie stanu chwytaka."
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 1
    ! Stanowisko zrobotyzowanej paletyzacji i kontroli obecnosci detalu
    ! =================================================================

    PROC main()
        ! 1. Warunki poczatkowe: zresetuj doBusy i doComplete, ustaw doReady
        
        ! 2. Przemieść robota do pozycji bazowej pHome (MoveJ, v200, fine, tGripper)
        
        ! 3. Oczekuj na sygnal obecnosci detalu z czujnika: diPartPresent = 1
        
        ! 4. Wyzeruj doReady, załacz doBusy, wypisz "Pobieranie detalu"
        
        ! 5. Dojazd nad detal: pGripApproach (MoveJ, v200) -> pGripPick (MoveL, v100)
        
        ! 6. Zamkniecie chwytaka (Set doGripper), odczekaj 0.5s, podniesienie do pGripApproach
        
        ! 7. Przejazd do strefy odkladczej: pGripRetreat (MoveJ) -> pGripPlace (MoveL)
        
        ! 8. Otwarcie chwytaka (Reset doGripper), odczekaj 0.5s, wycofanie do pGripRetreat
        
        ! 9. Powrot do pHome, wylaczenie doBusy, wystawienie impulsu doComplete
        
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-2",
    title: "ELM.08 Zadanie 2: Obróbka konturowa z blokadą bezpieczeństwa",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Egzamin praktyczny",
    summary: "Zadanie egzaminacyjne CKE: Zrobotyzowane stanowisko obróbki krawędzi detalu. Przed uruchomieniem cyklu program musi zweryfikować obwód bezpieczeństwa (diSafetyOk = 1) oraz przycisk startu (diStart = 1), po czym wykonać obróbkę obrysu kwadratowego narzędziem tPen.",
    tool: "pen",
    tips: [
      "Czytanie ze zrozumieniem: program nie może ruszyć, dopóki obwód bezpieczeństwa diSafetyOk oraz przycisk diStart nie osiągną stanu wysokiego (1).",
      "Prędkość najazdu do punktu początkowego wynosi v200, natomiast prędkość obróbki liniowej MoveL wynosi v100.",
      "Po zakończeniu obróbki robot musi bezpiecznie wyjechać do pSquareStart przed powrotem do pHome."
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 2
    ! Stanowisko obrobki konturowej z dwuetapowym warunkiem startu
    ! =================================================================

    PROC main()
        ! 1. Sprawdz obwod bezpieczenstwa: oczekuj na diSafetyOk = 1
        
        ! 2. Wypisz komunikat "Obwod bezpieczenstwa OK. Oczekiwanie na start"
        
        ! 3. Oczekuj na wcisniecie przycisku startu przez operatora: diStart = 1
        
        ! 4. Załacz sygnalizator pracy doBusy, zgas doReady
        
        ! 5. Dojedz z pHome do pSquareStart (MoveJ, v200, fine, tPen)
        
        ! 6. Wykonaj obrobke liniowa MoveL (v100) po sciezce:
        !    pSquareA -> pSquareB -> pSquareC -> pSquareD -> pSquareA
        
        ! 7. Odjedz pionowo do pSquareStart, powroc do pHome
        
        ! 8. Wyzeruj doBusy, załacz doComplete, wypisz "Koniec cyklu obrobki"
        
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-3",
    title: "ELM.08 Zadanie 3: Skanowanie łukowe MoveC i licznik partii",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Egzamin praktyczny",
    summary: "Zadanie egzaminacyjne CKE: Automatyczna kontrola wymiarowa okręgu z wykorzystaniem ruchów kołowych MoveC. Ramię przemieszcza głowicę pomiarową tPen po okręgu testowym, rejestruje zbadaną sztukę w liczniku nProducedParts i wystawia sygnał zakończenia.",
    tool: "pen",
    tips: [
      "Ruch po okręgu wymaga dwóch instrukcji MoveC: pierwsza od pCircleA przez pCircleB do pCircleC, druga od pCircleC przez pCircleD do pCircleA.",
      "Składnia: MoveC punkt_posredni, punkt_koncowy, v100, fine, tPen;.",
      "Pamiętaj o deklaracji zmiennej VAR num nProducedParts := 0; na początku modułu."
    ],
    starterCode: `MODULE MainModule
    VAR num nProducedParts := 0;

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 3
    ! Pomiar geometrii luku (MoveC) i ewidencja ilosciowa partii
    ! =================================================================

    PROC main()
        ! 1. Wyzeruj wyjscia technologiczne, przemiesc robota do pHome
        
        ! 2. Dojedz do punktu rozpoczecia skanowania pCircleStart (MoveJ)
        
        ! 3. Zjedz pionowo do pCircleA, załacz sygnalizator doBusy
        
        ! 4. Wykonaj ruch po pierwszym polokregu: MoveC pCircleB, pCircleC...
        
        ! 5. Wykonaj ruch po drugim polokregu: MoveC pCircleD, pCircleA...
        
        ! 6. Odjedz pionowo do pCircleStart, powroc do pHome
        
        ! 7. Zwieksz licznik detali (Incr nProducedParts) i wypisz jego stan
        
        ! 8. Wylacz doBusy, załacz sygnal doComplete
        
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-4",
    title: "ELM.08 Zadanie 4: Sekwencja resetu i przezbrajania stanowiska",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Egzamin praktyczny",
    summary: "Zadanie egzaminacyjne CKE: Procedura przygotowawcza i obsługa przycisku resetu. Program musi najpierw wymusić naciśnięcie diReset przez operatora, wyzerować stan wykonawczy, dokonać zbazowania ramienia i dopiero wtedy umożliwić rozpoczęcie cyklu pobierania detalu po wciśnięciu diStart.",
    tool: "gripper",
    tips: [
      "Zwróć uwagę na logikę sekwencji: najpierw faza resetu (diReset), potem faza gotowości (doReady), a dopiero na końcu faza pracy po sygnale diStart.",
      "Do sterowania chwytakiem możesz użyć standardowych instrukcji Set doGripper / Reset doGripper lub SetDO doGripper, 1 / ResetDO doGripper.",
      "Zadbaj o właściwe punkty dojazdu pGripApproach i pGripRetreat."
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 4
    ! Procedura bezpiecznego zerowania, bazowania i startu cyklu
    ! =================================================================

    PROC main()
        ! 1. Wypisz komunikat "Wymagany reset stanowiska (wcisnij diReset)"
        
        ! 2. Oczekuj na sygnał resetu: diReset = 1 (WaitDI)
        
        ! 3. Wyzeruj wszystkie wyjscia (doBusy, doComplete, doGripper)
        
        ! 4. Przemieść ramie do pozycji bazowej pHome (MoveJ, v200, fine, tGripper)
        
        ! 5. Załacz sygnal gotowosci: Set doReady, wypisz "Stanowisko gotowe do pracy"
        
        ! 6. Oczekuj na sygnał startu cyklu produkcyjnego: diStart = 1
        
        ! 7. Zgas doReady, załacz doBusy, wykonaj pelny cykl pobrania z pGripPick
        !    oraz odlozenia do pGripPlace (z zachowaniem podejsc i odjazdow)
        
        ! 8. Powrot do pHome, wylaczenie doBusy, wystawienie doComplete
        
    ENDPROC

ENDMODULE`,
  },
  {
    id: "task-elm08-5",
    title: "ELM.08 Zadanie 5: Transfer detalu z inspekcją pośrednią",
    category: "elm08",
    topic: "Kwalifikacja ELM.08 · Egzamin praktyczny",
    summary: "Zadanie egzaminacyjne CKE: Złożony cykl transportowy z buforem międzyoperacyjnym. Robot pobiera detal z gniazda pGripPick, przenosi go do stacji kontroli wizyjnej pPick, zatrzymuje detal w chwycie na czas inspekcji 1.0 s, po czym odstawia gotowy element do gniazda końcowego pGripPlace.",
    tool: "gripper",
    tips: [
      "W punkcie stacji pośredniej pPick nie otwieraj chwytaka! Zastosuj WaitTime 1.0; przy zaciśniętych szczękach chwytaka.",
      "Przed startem programu wymagane jest jednoczesne potwierdzenie diSafetyOk = 1 oraz diStart = 1.",
      "Wypisuj w oknie konsoli poszczególne etapy cyklu, aby operator widział aktualny status gniazda."
    ],
    starterCode: `MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 5
    ! Transport dwuetapowy ze stacja kontroli wizyjnej w punkcie pPick
    ! =================================================================

    PROC main()
        ! 1. Sygnalizuj gotowosc: Set doReady, zresetuj doBusy i doComplete
        
        ! 2. Oczekuj na spelnienie warunkow: diSafetyOk = 1 oraz diStart = 1
        
        ! 3. Zgas doReady, ustaw doBusy, wypisz "Rozpoczecie cyklu transportowego"
        
        ! 4. Pobierz detal ze stolu: dojazd pGripApproach -> zjazd pGripPick -> Set doGripper -> 0.5s -> powrot pGripApproach
        
        ! 5. Przetransportuj detal do punktu kontroli optycznej pPick (MoveJ, v200)
        
        ! 6. Wstrzymaj ruch na czas inspekcji optycznej 1.0s (detal pozostaje w chwytaku!)
        
        ! 7. Przemieść detal do strefy odkladczej: najazd pGripRetreat -> zjazd pGripPlace -> Reset doGripper -> 0.5s
        
        ! 8. Wycofanie do pGripRetreat, powrot do pHome, wylaczenie doBusy, wystawienie doComplete
        
    ENDPROC

ENDMODULE`,
  },
];

export const blankProjectCode = `MODULE MainModule

    PROC main()
        TPWrite "Moj program RAPID";
    ENDPROC

ENDMODULE`;

const outputNames = ["doReady", "doGripper", "doBusy", "doComplete"];
const inputNames = ["diStart", "diPartPresent", "diReset", "diSafetyOk"];

export function findTargetKey(targetLibrary: Record<string, [number, number, number]>, name: string): string | undefined {
  if (targetLibrary[name]) return name;
  const lower = name.toLowerCase();
  return Object.keys(targetLibrary).find((key) => key.toLowerCase() === lower);
}

export function findOutputName(name: string): string | undefined {
  const lower = name.toLowerCase();
  return outputNames.find((sig) => sig.toLowerCase() === lower);
}

export function findInputName(name: string): string | undefined {
  const lower = name.toLowerCase();
  return inputNames.find((sig) => sig.toLowerCase() === lower);
}

function removeComment(source: string) {
  let quoted = false;
  for (let index = 0; index < source.length; index += 1) {
    if (source[index] === '"') quoted = !quoted;
    if (source[index] === "!" && !quoted) return source.slice(0, index);
  }
  return source;
}

type ProcedureDefinition = {
  name: string;
  startLine: number;
  body: { text: string; line: number }[];
};

export function compile(
  code: string,
  targetLibrary: Record<string, [number, number, number]> = targets
): { commands: Command[]; error?: string; errorLine?: number } {
  const lines = code.split("\n");
  const procedures = new Map<string, ProcedureDefinition>();
  let currentProc: ProcedureDefinition | null = null;

  // Pass 1: Parse module structure and collect procedures
  for (let index = 0; index < lines.length; index += 1) {
    const lineNum = index + 1;
    const source = removeComment(lines[index]).trim();
    if (!source) continue;

    // Module header / footer
    if (/^MODULE\b/i.test(source) || /^ENDMODULE\b/i.test(source)) {
      continue;
    }

    // Procedure header: PROC name() or PROC name
    const procStart = source.match(/^PROC\s+([A-Za-z_]\w*)\s*(?:\(\s*\))?\s*$/i);
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
      currentProc = { name: rawName, startLine: lineNum, body: [] };
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

    // Outside of any procedure
    if (!currentProc) {
      if (/^(CONST|VAR|PERS)\b/i.test(source)) {
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

  // Pass 2: Find main entry point
  const mainProc = procedures.get("main");
  if (!mainProc) {
    return { commands: [], error: "Brak procedury głównej PROC main().", errorLine: 1 };
  }

  const commands: Command[] = [];

  // Recursive procedure compiler with call stack and cycle detection
  function compileProc(proc: ProcedureDefinition, callStack: string[] = []): { error?: string; errorLine?: number } | null {
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

    for (const item of proc.body) {
      const { text: source, line } = item;
      if (/^(CONST|VAR|PERS)\b/i.test(source)) continue;

      let match: RegExpMatchArray | null;
      if ((match = source.match(/^TPWrite\s+"(.*)"\s*;?$/i))) {
        commands.push({ type: "log", text: match[1], line });
      } else if ((match = source.match(/^(MoveJ|MoveL)\s+(\w+)/i))) {
        const rawTarget = match[2];
        const target = findTargetKey(targetLibrary, rawTarget);
        if (!target) return { error: `Linia ${line}: nieznany robtarget „${rawTarget}”.`, errorLine: line };
        commands.push({ type: "move", kind: match[1].toUpperCase() === "MOVEJ" ? "MoveJ" : "MoveL", target, line });
      } else if ((match = source.match(/^MoveC\s+(\w+)\s*,\s*(\w+)/i))) {
        const rawVia = match[1];
        const rawTarget = match[2];
        const via = findTargetKey(targetLibrary, rawVia);
        const target = findTargetKey(targetLibrary, rawTarget);
        if (!via) return { error: `Linia ${line}: nieznany robtarget „${rawVia}”.`, errorLine: line };
        if (!target) return { error: `Linia ${line}: nieznany robtarget „${rawTarget}”.`, errorLine: line };
        commands.push({ type: "move", kind: "MoveC", via, target, line });
      } else if ((match = source.match(/^(SetDO)\s+(\w+)\s*,\s*([01])\s*;?$/i))) {
        const signal = findOutputName(match[2]);
        if (!signal) return { error: `Linia ${line}: wyjscie „${match[2]}” nie jest skonfigurowane.`, errorLine: line };
        commands.push({ type: "output", signal, value: match[3] === "1", line });
      } else if ((match = source.match(/^(Set|Reset|ResetDO)\s+(\w+)/i))) {
        const signal = findOutputName(match[2]);
        if (!signal) return { error: `Linia ${line}: wyjscie „${match[2]}” nie jest skonfigurowane.`, errorLine: line };
        const isSet = /^Set$/i.test(match[1]);
        commands.push({ type: "output", signal, value: isSet, line });
      } else if ((match = source.match(/^WaitDI\s+(\w+)\s*,\s*([01])\s*;?$/i))) {
        const signal = findInputName(match[1]);
        if (!signal) return { error: `Linia ${line}: wejscie „${match[1]}” nie jest skonfigurowane.`, errorLine: line };
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
        return { error: `Linia ${line}: ta struktura RAPID nie jest jeszcze wykonywalna w wersji edukacyjnej.`, errorLine: line };
      } else {
        // Procedure Call: name; or name(); or name
        const callMatch = source.match(/^([A-Za-z_]\w*)\s*(?:\(\s*\))?\s*;?$/i);
        if (callMatch) {
          const calledName = callMatch[1];
          const calledProc = procedures.get(calledName.toLowerCase());
          if (calledProc) {
            const res = compileProc(calledProc, currentStack);
            if (res?.error) return res;
            continue;
          }
        }
        return { error: `Linia ${line}: nieobslugiwana instrukcja lub nieznana procedura „${source.replace(/;$/, "")}”.`, errorLine: line };
      }
    }
    return null;
  }

  const result = compileProc(mainProc);
  if (result?.error) {
    return { commands: [], error: result.error, errorLine: result.errorLine };
  }

  return { commands };
}

export function targetNamesInCode(code: string, targetLibrary: Record<string, [number, number, number]> = targets) {
  const names = new Set<string>();
  for (const line of code.split("\n")) {
    const source = removeComment(line);
    const linearMotion = source.match(/^\s*Move(?:J|L)\s+(\w+)/i);
    const circularMotion = source.match(/^\s*MoveC\s+(\w+)\s*,\s*(\w+)/i);
    for (const rawName of [linearMotion?.[1], circularMotion?.[1], circularMotion?.[2]]) {
      if (rawName) {
        const canonical = findTargetKey(targetLibrary, rawName);
        if (canonical) names.add(canonical);
      }
    }
  }
  return [...names];
}

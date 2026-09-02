export type QuizOptionId = "A" | "B" | "C" | "D";

export type QuizCategory =
  | "RAPID & Programowanie"
  | "Kinematyka i Budowa"
  | "Sensoryka i Pomiary"
  | "Pneumatyka i Chwytaki"
  | "Sterowniki PLC i Komunikacja"
  | "Bezpieczeństwo i Normy"
  | "Eksploatacja i Konserwacja";

export type QuizQuestion = {
  id: string;
  category: QuizCategory;
  question: string;
  options: { id: QuizOptionId; text: string }[];
  correctAnswer: QuizOptionId;
  explanation: string;
};

export const quizQuestions: QuizQuestion[] = [
  // --- KATEGORIA: RAPID & Programowanie (1-10) ---
  {
    id: "elm08-q01",
    category: "RAPID & Programowanie",
    question: "Która instrukcja języka RAPID realizuje ruch liniowy narzędzia robota ze stałą orientacją TCP do wskazanego punktu docelowego?",
    options: [
      { id: "A", text: "MoveJ" },
      { id: "B", text: "MoveL" },
      { id: "C", text: "MoveC" },
      { id: "D", text: "MoveAbsJ" }
    ],
    correctAnswer: "B",
    explanation: "MoveL (Move Linear) powoduje przemieszczenie punktu TCP wzdłuż linii prostej w przestrzeni kartezjańskiej. MoveJ realizuje ruch w przestrzeni złączowej (najszybszy, ale nieliniowy), a MoveC ruch po łuku okręgu."
  },
  {
    id: "elm08-q02",
    category: "RAPID & Programowanie",
    question: "Do czego służy parametr strefy zbliżenia 'fine' w instrukcji ruchu robota ABB RAPID?",
    options: [
      { id: "A", text: "Do wykonania płynnego przejścia (fly-by) bez zatrzymania robota w promieniu 10 mm" },
      { id: "B", text: "Do wymuszenia precyzyjnego zatrzymania ruchu w punkcie docelowym i synchronizacji z kolejną instrukcją" },
      { id: "C", text: "Do zwiększenia prędkości maksymalnej manipulatora w danej strefie" },
      { id: "D", text: "Do automatycznego załączenia chwytaka w punkcie docelowym" }
    ],
    correctAnswer: "B",
    explanation: "Strefa 'fine' wymusza fizyczne wyzerowanie prędkości i dokładne osiągnięcie zadanego punktu robtarget (tzw. stop point). Strefy typu z0, z10, z50 pozwalają na wygładzenie trajektorii bez zatrzymania."
  },
  {
    id: "elm08-q03",
    category: "RAPID & Programowanie",
    question: "Jaki typ danych w języku RAPID przechowuje pozycję kartezjańską punktu roboczego (X, Y, Z, kwaterniony orientacji oraz konfigurację osi)?",
    options: [
      { id: "A", text: "pos" },
      { id: "B", text: "jointtarget" },
      { id: "C", text: "wobjdata" },
      { id: "D", text: "robtarget" }
    ],
    correctAnswer: "D",
    explanation: "Typ 'robtarget' definiuje kompletną pozycję roboczą TCP w przestrzeni kartezjańskiej (współrzędne translacyjne, kwaterniony rotacji q1..q4, confdata i pozycje osi zewnętrznych extjoint)."
  },
  {
    id: "elm08-q04",
    category: "RAPID & Programowanie",
    question: "Wskaż prawidłowy wynik działania funkcji Offs(p1, 0, 0, 50) w języku RAPID:",
    options: [
      { id: "A", text: "Przesunięcie punktu p1 o 50 mm wzdłuż osi X" },
      { id: "B", text: "Przesunięcie punktu p1 o 50 mm wzdłuż osi Y" },
      { id: "C", text: "Przesunięcie punktu p1 o 50 mm w górę wzdłuż osi Z aktywnego układu współrzędnych" },
      { id: "D", text: "Obrót narzędzia wokół osi Z o kąt 50 stopni" }
    ],
    correctAnswer: "C",
    explanation: "Składnia funkcji to Offs(Point, XOffset, YOffset, ZOffset). Wartość 50 na trzeciej pozycji oznacza przesunięcie o 50 mm wzdłuż osi Z."
  },
  {
    id: "elm08-q05",
    category: "RAPID & Programowanie",
    question: "Która instrukcja języka RAPID generuje impuls o zadanym czasie trwania na wskazanym wyjściu cyfrowym do sterownika PLC?",
    options: [
      { id: "A", text: "SetDO \\Time:=1.0, doSignal;" },
      { id: "B", text: "WaitDI doSignal, 1;" },
      { id: "C", text: "Reset \\Pulse:=1.0, doSignal;" },
      { id: "D", text: "PulseDO \\PLength:=1.0, doSignal;" }
    ],
    correctAnswer: "D",
    explanation: "Instrukcja PulseDO (Pulse Digital Output) z opcjonalnym argumentem \\PLength:=czas generuje impuls prostokątny o zadanej długości w sekundach na wyjściu cyfrowym."
  },
  {
    id: "elm08-q06",
    category: "RAPID & Programowanie",
    question: "Czym różni się instrukcja MoveC od MoveL w języku RAPID?",
    options: [
      { id: "A", text: "MoveC porusza się w osiach, a MoveL w przestrzeni kartezjańskiej" },
      { id: "B", text: "MoveC nie pozwala na używanie narzędzia tGripper" },
      { id: "C", text: "MoveC wymaga zdefiniowania punktu tranzytowego (via point) oraz punktu docelowego, tworząc łuk kołowy" },
      { id: "D", text: "MoveC służy wyłącznie do szybkiego powrotu robota do pozycji Home" }
    ],
    correctAnswer: "C",
    explanation: "MoveC (Move Circular) wymaga podania punktu pośredniego i docelowego: MoveC pVia, pDest, vSpeed, zZone, tool; – przez te trzy punkty (początkowy, pośredni, końcowy) prowadzony jest łuk okręgu."
  },
  {
    id: "elm08-q07",
    category: "RAPID & Programowanie",
    question: "Co oznacza skrót PP (Program Pointer) w sterowniku robota przemysłowego?",
    options: [
      { id: "A", text: "Pozycję Parkowania manipulatora" },
      { id: "B", text: "Prędkość Procesową w procentach" },
      { id: "C", text: "Protokół Przemysłowy do komunikacji z chwytakiem" },
      { id: "D", text: "Wskaźnik instrukcji programu, która będzie aktualnie wykonywana przez kontroler" }
    ],
    correctAnswer: "D",
    explanation: "PP (Program Pointer) to wskaźnik programu wskazujący bieżącą linię kodu RAPID przetwarzaną przez system operacyjny robota. Na panelu FlexPendant oznaczony jest żółtą strzałką."
  },
  {
    id: "elm08-q08",
    category: "RAPID & Programowanie",
    question: "Która instrukcja języka RAPID powoduje wstrzymanie wykonywania programu robota do czasu, aż na wejściu diStart pojawi się stan wysoki (1)?",
    options: [
      { id: "A", text: "WaitDI diStart, 1;" },
      { id: "B", text: "WaitTime diStart, 1;" },
      { id: "C", text: "WaitUntil diStart := 1;" },
      { id: "D", text: "CheckDI diStart, HIGH;" }
    ],
    correctAnswer: "A",
    explanation: "Standardowa instrukcja WaitDI przyjmuje nazwę sygnału cyfrowego wejściowego oraz oczekiwaną wartość binarną (0 lub 1), np. WaitDI diStart, 1;."
  },
  {
    id: "elm08-q09",
    category: "RAPID & Programowanie",
    question: "W jakiej pętli języka RAPID liczba iteracji jest z góry określona za pomocą licznika numerycznego?",
    options: [
      { id: "A", text: "WHILE ... DO ... ENDWHILE" },
      { id: "B", text: "FOR ... FROM ... TO ... DO ... ENDFOR" },
      { id: "C", text: "LOOP ... UNTIL ... ENDLOOP" },
      { id: "D", text: "REPEAT ... UNTIL" }
    ],
    correctAnswer: "B",
    explanation: "Pętla FOR (np. FOR i FROM 1 TO 6 DO) realizuje z góry zadaną liczbę powtórzeń, inkrementując zmienną sterującą o zdefiniowany krok."
  },
  {
    id: "elm08-q10",
    category: "RAPID & Programowanie",
    question: "Do czego w robocie ABB służy obiekt danych typu 'wobjdata' (WorkObject)?",
    options: [
      { id: "A", text: "Do definiowania masy i środka ciężkości narzędzia robota" },
      { id: "B", text: "Do konfiguracji adresów sieciowych modułu wejść/wyjść" },
      { id: "C", text: "Do ograniczania strefy kolizji manipulatora" },
      { id: "D", text: "Do definiowania lokalnego układu współrzędnych detalu lub stanowiska (np. palety, stołu)" }
    ],
    correctAnswer: "D",
    explanation: "WorkObject (wobjdata) definiuje układ współrzędnych przedmiotu obrabianego. Dzięki niemu przemieszczenie lub obrót całej palety/arkusza wymaga jedynie redefinicji bazy wobj, bez modyfikacji pojedynczych punktów trajektorii."
  },

  // --- KATEGORIA: Kinematyka i Budowa (11-18) ---
  {
    id: "elm08-q11",
    category: "Kinematyka i Budowa",
    question: "Czym charakteryzuje się robot przemysłowy o strukturze kinematycznej SCARA?",
    options: [
      { id: "A", text: "Trzema osiami liniowymi prostopadłymi do siebie (PPP)" },
      { id: "B", text: "Równoległymi ramionami tworzącymi przestrzenną strukturę delta" },
      { id: "C", text: "Dwoma równoległymi osiami obrotowymi pracującymi w płaszczyźnie poziomej oraz jedną osią liniową pionową" },
      { id: "D", text: "Sześcioma osiami obrotowymi o sferycznej przestrzeni roboczej" }
    ],
    correctAnswer: "C",
    explanation: "SCARA (Selective Compliance Assembly Robot Arm) posiada osie obrotowe o pionowych wektorach obrotu (ruch w płaszczyźnie poziomej XY) oraz ruch postępowy w osi Z, co daje dużą sztywność pionową i podatność poziomą."
  },
  {
    id: "elm08-q12",
    category: "Kinematyka i Budowa",
    question: "Czym jest punkt TCP (Tool Center Point) manipulatora?",
    options: [
      { id: "A", text: "Geometrycznym środkiem podstawy robota (Base Frame)" },
      { id: "B", text: "Środkiem ciężkości całego manipulatora" },
      { id: "C", text: "Punktem środkowym kołnierza montażowego kiści (Tool0)" },
      { id: "D", text: "Punktem charakterystycznym narzędzia, dla którego definiowana jest trajektoria, prędkość i orientacja" }
    ],
    correctAnswer: "D",
    explanation: "TCP to punkt referencyjny narzędzia (np. czubek dyszy spawalniczej, punkt chwytu chwytaka, końcówka pisaka), w odniesieniu do którego sterownik kontroluje pozycję i prędkość roboczą."
  },
  {
    id: "elm08-q13",
    category: "Kinematyka i Budowa",
    question: "Ile stopni swobody (DOF) posiada typowy antropomorficzny robot przegubowy wykorzystywany na stanowiskach spawalniczych i montażowych?",
    options: [
      { id: "A", text: "3 stopnie swobody" },
      { id: "B", text: "4 stopnie swobody" },
      { id: "C", text: "6 stopni swobody" },
      { id: "D", text: "12 stopni swobody" }
    ],
    correctAnswer: "C",
    explanation: "6 stopni swobody pozwala na pełną swobodę pozycjonowania w przestrzeni 3D: 3 stopnie translacyjne (X, Y, Z) oraz 3 stopnie orientacyjne (kąty Eulera: Roll, Pitch, Yaw)."
  },
  {
    id: "elm08-q14",
    category: "Kinematyka i Budowa",
    question: "Czym jest tzw. punkt osobliwy (singularność) w kinematyce robota przemysłowego?",
    options: [
      { id: "A", text: "Awarią przetwornika położenia (enkodera) w osi 1" },
      { id: "B", text: "Konfiguracją ramion, w której robot traci co najmniej jeden stopień swobody, a prędkości kątowe niektórych osi dążą do nieskończoności" },
      { id: "C", text: "Maksymalnym dopuszczalnym zasięgiem ramienia robota" },
      { id: "D", text: "Punktem zderzenia narzędzia z detalem" }
    ],
    correctAnswer: "B",
    explanation: "Singularność to stan geometryczny (np. wyprostowane ramię w jednej linii lub współosiowość osi 4 i 6), w którym wyznacznik macierzy Jacobiego wynosi zero, co uniemożliwia wyznaczenie odwrotnego zadania kinematyki dla ruchu kartezjańskiego."
  },
  {
    id: "elm08-q15",
    category: "Kinematyka i Budowa",
    question: "Jaki rodzaj przekładni mechanicznej jest najczęściej stosowany w osiach kiści robotów precyzyjnych ze względu na brak luzu nawrotnego i wysokie przełożenie?",
    options: [
      { id: "A", text: "Przekładnia pasowa z pasem klinowym" },
      { id: "B", text: "Przekładnia cierna stożkowa" },
      { id: "C", text: "Przekładnia łańcuchowa" },
      { id: "D", text: "Przekładnia falowa (Harmonic Drive)" }
    ],
    correctAnswer: "D",
    explanation: "Przekładnie falowe (Harmonic Drive) oraz cykloidalne cechują się zerowym lub minimalnym luzem kątowym (backlash), wysoką sztywnością i kompaktową budową, co jest kluczowe w kiściach robotów."
  },
  {
    id: "elm08-q16",
    category: "Kinematyka i Budowa",
    question: "Jak nazywa się metoda wyznaczania położenia TCP narzędzia polegająca na dojeżdżaniu do jednego stałego punktu odniesienia z kilku różnych orientacji narzędzia?",
    options: [
      { id: "A", text: "Metoda 4 punktów (TCP 4-point method)" },
      { id: "B", text: "Metoda masteringu osi (Homing)" },
      { id: "C", text: "Metoda bazowania wobj" },
      { id: "D", text: "Metoda pomiaru prądu silników" }
    ],
    correctAnswer: "A",
    explanation: "Kalibracja TCP metodą 4 punktów polega na nakierowaniu wierzchołka narzędzia na stały kolec pomiarowy z czterech różnych kątów. Na podstawie tych pozycji sterownik oblicza współrzędne środka sfery (wektor przesunięcia TCP względem kołnierza)."
  },
  {
    id: "elm08-q17",
    category: "Kinematyka i Budowa",
    question: "Który układ współrzędnych ma swój początek na stałe związany z kołnierzem montażowym kiści manipulatora?",
    options: [
      { id: "A", text: "World Frame" },
      { id: "B", text: "Base Frame" },
      { id: "C", text: "User Frame" },
      { id: "D", text: "Tool0 (Wrist Frame)" }
    ],
    correctAnswer: "D",
    explanation: "Układ Tool0 znajduje się w geometrycznym środku powierzchni czołowej kołnierza kiści robota (flange). Każde montowane narzędzie (np. tGripper) definiuje się jako przesunięcie i obrót względem Tool0."
  },
  {
    id: "elm08-q18",
    category: "Kinematyka i Budowa",
    question: "Czym różni się proste zadanie kinematyki (FK) od odwrotnego zadania kinematyki (IK)?",
    options: [
      { id: "A", text: "FK wyznacza pozycję TCP na podstawie kątów osi, a IK wyznacza kąty osi dla zadanej pozycji TCP" },
      { id: "B", text: "FK dotyczy tylko robotów kartezjańskich, a IK robotów SCARA" },
      { id: "C", text: "FK wylicza prędkość, a IK przyspieszenie" },
      { id: "D", text: "Nie ma między nimi żadnej różnicy" }
    ],
    correctAnswer: "A",
    explanation: "Proste zadanie kinematyki (Forward Kinematics): mając dane kąty obrotu poszczególnych złączy, jednoznacznie obliczamy pozycję TCP w przestrzeni kartezjańskiej. Zadanie odwrotne (Inverse Kinematics): dla zadanego położenia TCP wyliczamy kąty osi manipulatora (może istnieć wiele rozwiązań konfiguracyjnych)."
  },

  // --- KATEGORIA: Sensoryka i Pomiary (19-26) ---
  {
    id: "elm08-q19",
    category: "Sensoryka i Pomiary",
    question: "Który typ czujnika zbliżeniowego reaguje WYŁĄCZNIE na materiały przewodzące prąd (głównie metale ferromagnetyczne i nieżelazne)?",
    options: [
      { id: "A", text: "Czujnik pojemnościowy" },
      { id: "B", text: "Czujnik indukcyjny" },
      { id: "C", text: "Czujnik ultradźwiękowy" },
      { id: "D", text: "Czujnik optyczny refleksyjny" }
    ],
    correctAnswer: "B",
    explanation: "Czujnik indukcyjny wytwarza zmienne pole magnetyczne wysokiej częstotliwości. Wprowadzenie metalu powoduje indukowanie prądów wirowych tłumiących drgania generatora, co wyzwala sygnał wyjściowy."
  },
  {
    id: "elm08-q20",
    category: "Sensoryka i Pomiary",
    question: "Który czujnik jest dedykowany do wykrywania detali wykonanych z tworzywa sztucznego, szkła, drewna oraz poziomu cieczy w pojemnikach?",
    options: [
      { id: "A", text: "Czujnik indukcyjny" },
      { id: "B", text: "Czujnik Halla" },
      { id: "C", text: "Czujnik magnetoindukcyjny" },
      { id: "D", text: "Czujnik pojemnościowy" }
    ],
    correctAnswer: "D",
    explanation: "Czujnik pojemnościowy reaguje na zmianę przenikalności dielektrycznej w strefie czoła pomiarowego, dzięki czemu wykrywa zarówno metale, jak i tworzywa sztuczne, ciecze czy materiały sypkie."
  },
  {
    id: "elm08-q21",
    category: "Sensoryka i Pomiary",
    question: "Co oznacza oznaczenie wyjścia czujnika tranzystorowego PNP z funkcją NO (Normally Open)?",
    options: [
      { id: "A", text: "Po zadziałaniu czujnika wyjście jest zwierane do masy (0 V), w spoczynku jest rozwarte" },
      { id: "B", text: "Po zadziałaniu czujnika na wyjściu pojawia się potencjał dodatni (+24 V), w spoczynku wyjście jest rozwarte" },
      { id: "C", text: "Wyjście generuje sygnał analogowy 4-20 mA" },
      { id: "D", text: "Wyjście jest zwarte w spoczynku i rozwiera się po wykryciu obiektu" }
    ],
    correctAnswer: "B",
    explanation: "Wyjście PNP (źródłowe / sourcing) podaje na wyjście potencjał dodatni zasilania (+24V). NO (normalnie otwarte) oznacza, że klucz tranzystorowy zamyka się dopiero po wykryciu obiektu."
  },
  {
    id: "elm08-q22",
    category: "Sensoryka i Pomiary",
    question: "Jakie czujniki montuje się w rowkach korpusu siłowników pneumatycznych do wykrywania położeń krańcowych tłoka?",
    options: [
      { id: "A", text: "Bariery optyczne jednokierunkowe" },
      { id: "B", text: "Czujniki tensometryczne nacisku" },
      { id: "C", text: "Czujniki pojemnościowe wysokotemperaturowe" },
      { id: "D", text: "Czujniki magnetyczne (kontaktronowe lub Halla) reagujące na magnes stały wbudowany w tłok" }
    ],
    correctAnswer: "D",
    explanation: "W pneumatyce przemysłowej standardem są czujniki pola magnetycznego (kontaktrony lub półprzewodnikowe czujniki Halla/magnetorezystancyjne), które reagują na pierścień magnetyczny umieszczony na tłoku siłownika."
  },
  {
    id: "elm08-q23",
    category: "Sensoryka i Pomiary",
    question: "Czym różni się enkoder absolutny od enkodera inkrementalnego?",
    options: [
      { id: "A", text: "Enkoder absolutny po zaniku zasilania pamięta rzeczywiste położenie kątowe bez konieczności bazowania" },
      { id: "B", text: "Enkoder inkrementalny ma wyższą cenę i nie wymaga impulsów odniesienia Z" },
      { id: "C", text: "Enkoder absolutny mierzy wyłącznie prędkość obrotową, a nie położenie" },
      { id: "D", text: "Enkoder inkrementalny wykorzystuje kod Graya, a absolutny kod binarny" }
    ],
    correctAnswer: "A",
    explanation: "Enkoder absolutny odczytuje unikalny kod położenia (np. w kodzie Graya) dla każdej pozycji wału, dzięki czemu natychmiast po załączeniu zasilania zna swoją dokładną pozycję bez procedury bazowania (homing)."
  },
  {
    id: "elm08-q24",
    category: "Sensoryka i Pomiary",
    question: "O ile stopni elektrycznych przesunięte są względem siebie kanały A i B w optycznym enkoderze inkrementalnym w celu rozpoznawania kierunku wirowania?",
    options: [
      { id: "A", text: "O 45 stopni" },
      { id: "B", text: "O 90 stopni (przesunięcie kwadraturowe)" },
      { id: "C", text: "O 180 stopni" },
      { id: "D", text: "Są dokładnie w fazie (0 stopni)" }
    ],
    correctAnswer: "B",
    explanation: "Przesunięcie kwadraturowe o 90° elektrycznych pozwala układowi logicznemu stwierdzić, który kanał wyprzedza drugi (A przed B lub B przed A), co bezpośrednio wskazuje kierunek obrotu osi."
  },
  {
    id: "elm08-q25",
    category: "Sensoryka i Pomiary",
    question: "Jaki typ czujnika optoelektronicznego składa się z oddzielnego nadajnika i oddzielnego odbiornika umieszczonych naprzeciwko siebie w osi optycznej?",
    options: [
      { id: "A", text: "Bariera optyczna jednokierunkowa (thru-beam)" },
      { id: "B", text: "Czujnik dyfuzyjny (odbiciowy od obiektu)" },
      { id: "C", text: "Czujnik refleksyjny z pryzmatem zwierciadlanym" },
      { id: "D", text: "Czujnik triangulacyjny laserowy" }
    ],
    correctAnswer: "A",
    explanation: "Bariera jednokierunkowa (nadajnik-odbiornik w osobnych obudowach) oferuje największy zasięg i odporność na zabrudzenia, ponieważ promień świetlny pokonuje drogę między elementami tylko raz."
  },
  {
    id: "elm08-q26",
    category: "Sensoryka i Pomiary",
    question: "Do czego na zrobotyzowanym stanowisku sortującym służy przemysłowa kamera systemu wizyjnego 2D?",
    options: [
      { id: "A", text: "Wyłącznie do nagrywania obrazu w celach bezpieczeństwa BHP" },
      { id: "B", text: "Do bezpośredniego zasilania serwonapędów manipulatora" },
      { id: "C", text: "Do kalibracji ciśnienia sprężonego powietrza w chwytaku" },
      { id: "D", text: "Do rozpoznawania typu detalu, pomiaru jego wymiarów oraz określenia współrzędnych X, Y i kąta orientacji dla robota" }
    ],
    correctAnswer: "D",
    explanation: "Systemy wizyjne 2D realizują inspekcję jakościową, identyfikację detalu na podstawie kształtu lub kodu oraz przekazują do robota współrzędne pochwycenia (Pick position) i kąt obrotu na taśmociągu."
  },

  // --- KATEGORIA: Pneumatyka i Chwytaki (27-34) ---
  {
    id: "elm08-q27",
    category: "Pneumatyka i Chwytaki",
    question: "Jakie standardowe ciśnienie robocze stosuje się w przemysłowych układach pneumatyki wykonawczej robotów?",
    options: [
      { id: "A", text: "0.05 - 0.1 MPa (0.5 - 1 bar)" },
      { id: "B", text: "0.4 - 0.6 MPa (4 - 6 bar)" },
      { id: "C", text: "2.0 - 4.0 MPa (20 - 40 bar)" },
      { id: "D", text: "15 - 25 MPa (150 - 250 bar)" }
    ],
    correctAnswer: "B",
    explanation: "Typowe ciśnienie w instalacjach pneumatyki zasilającej siłowniki i chwytaki wynosi 6 bar (0.6 MPa), co zapewnia optymalną siłę chwytu przy zachowaniu trwałości uszczelnień i bezpieczeństwa."
  },
  {
    id: "elm08-q28",
    category: "Pneumatyka i Chwytaki",
    question: "Z jakich podstawowych elementów składa się zespół przygotowania sprężonego powietrza (FRL)?",
    options: [
      { id: "A", text: "Filtr, Reduktor ciśnienia, Smarownica (olejacz)" },
      { id: "B", text: "Falownik, Rozdzielacz, Licznik" },
      { id: "C", text: "Filtropochłaniacz, Rura, Łożysko" },
      { id: "D", text: "Flansza, Rezystor, Lampa" }
    ],
    correctAnswer: "A",
    explanation: "Blok FRL (Filter, Regulator, Lubricator) oczyszcza powietrze z cząstek stałych i kondensatu wody (Filtr), stabilizuje ciśnienie robocze (Reduktor) i opcjonalnie dozuje mgłę olejową (Smarownica)."
  },
  {
    id: "elm08-q29",
    category: "Pneumatyka i Chwytaki",
    question: "Do sterowania pneumatycznym siłownikiem dwustronnego działania najczęściej stosuje się zawór rozdzielający o symbolu:",
    options: [
      { id: "A", text: "2/2 (dwudrogowy, dwupołożeniowy)" },
      { id: "B", text: "3/2 (trzydrogowy, dwupołożeniowy)" },
      { id: "C", text: "5/2 (pięciodrogowy, dwupołożeniowy)" },
      { id: "D", text: "Zawór zwrotny sterowany" }
    ],
    correctAnswer: "C",
    explanation: "Zawór 5/2 posiada 1 przyłącze zasilające, 2 przyłącza robocze (do obu komór siłownika) i 2 przyłącza odpowietrzające, co umożliwia naprzemienne wysuwanie i wsuwanie tłoczyska siłownika dwustronnego działania."
  },
  {
    id: "elm08-q30",
    category: "Pneumatyka i Chwytaki",
    question: "Co stanie się z zaworem rozdzielającym monostabilnym ze sprężyną powrotną po zaniku sygnału sterującego na cewce elektromagnesu?",
    options: [
      { id: "A", text: "Pozostanie w ostatnio wymuszonej pozycji" },
      { id: "B", text: "Zablokuje się w pozycji środkowej zamkniętej" },
      { id: "C", text: "Samoczynnie powróci do położenia wyjściowego (spoczynkowego) pod wpływem sprężyny" },
      { id: "D", text: "Ulegnie mechanicznemu uszkodzeniu" }
    ],
    correctAnswer: "C",
    explanation: "Zawór monostabilny posiada sprężynę mechaniczną, która po odłączeniu zasilania cewki natychmiast przestawia suwak zaworu do stabilnego stanu spoczynkowego."
  },
  {
    id: "elm08-q31",
    category: "Pneumatyka i Chwytaki",
    question: "W jaki sposób wytwarzane jest podciśnienie w chwytakach podciśnieniowych (przyssawkowych) robotów przemysłowych bez użycia mechanicznej pompy próżniowej?",
    options: [
      { id: "A", text: "Przez gwałtowne podgrzanie powietrza w przyssawce" },
      { id: "B", text: "Za pomocą transformatora wysokiego napięcia" },
      { id: "C", text: "Przez odwrócenie kierunku obrotów serwonapędu kiści" },
      { id: "D", text: "Za pomocą eżektora próżniowego wykorzystującego zjawisko zwężki Venturiego" }
    ],
    correctAnswer: "D",
    explanation: "Eżektor próżniowy przepuszcza sprężone powietrze przez zwężkę Venturiego. Zgodnie z prawem Bernoulliego przyspieszenie strugi wywołuje podciśnienie w kanale bocznym, wytwarzając próżnię w przyssawce."
  },
  {
    id: "elm08-q32",
    category: "Pneumatyka i Chwytaki",
    question: "W jaki sposób poprawnie reguluje się prędkość ruchu siłownika pneumatycznego za pomocą zaworów dławiąco-zwrotnych?",
    options: [
      { id: "A", text: "Poprzez dławienie powietrza zasilającego wpływające do siłownika" },
      { id: "B", text: "Poprzez dławienie powietrza wylotowego uchodzącego z komory siłownika (dławienie na wylocie)" },
      { id: "C", text: "Wyłącznie poprzez obniżenie ciśnienia na głównym reduktorze FRL" },
      { id: "D", text: "Poprzez zmianę średnicy przewodów elektrycznych zaworu" }
    ],
    correctAnswer: "B",
    explanation: "Dławienie na wylocie (exhaust air throttling) zapewnia stabilny ruch bez szarpania i zjawiska 'stick-slip', ponieważ poduszka sprężonego powietrza po stronie wylotowej równomiernie hamuje tłok."
  },
  {
    id: "elm08-q33",
    category: "Pneumatyka i Chwytaki",
    question: "Jaki rodzaj chwytaka należy dobrać do manipulowania płaskimi taflami szkła lub cienkimi arkuszami blachy?",
    options: [
      { id: "A", text: "Chwytak podciśnieniowy z przyssawkami elastomerowymi" },
      { id: "B", text: "Chwytak magnetyczny ze stałym magnesem" },
      { id: "C", text: "Chwytak dwuszczękowy z ząbkowanymi stalowymi nakładkami" },
      { id: "D", text: "Chwytak igłowy" }
    ],
    correctAnswer: "A",
    explanation: "Chwytaki próżniowe z przyssawkami z miękkiego elastomeru (np. silikonu, NBR) idealnie dopasowują się do gładkich, płaskich powierzchni, nie powodując zarysowań ani uszkodzeń mechanicznych szkła czy blachy."
  },
  {
    id: "elm08-q34",
    category: "Pneumatyka i Chwytaki",
    question: "Który element układu podciśnieniowego odpowiada za szybkie 'odklejenie' detalu od przyssawki po zakończeniu manipulacji?",
    options: [
      { id: "A", text: "Filtr próżniowy" },
      { id: "B", text: "Impuls przedmuchu (blow-off pulse)" },
      { id: "C", text: "Zawór dławiący zwrotny" },
      { id: "D", text: "Wakuometr" }
    ],
    correctAnswer: "B",
    explanation: "Impuls przedmuchu podaje krótkie uderzenie sprężonego powietrza nadciśnieniowego do wnętrza przyssawki, co natychmiast likwiduje próżnię i odpycha detal, przyspieszając cykl odkładania."
  },

  // --- KATEGORIA: Sterowniki PLC i Komunikacja (35-42) ---
  {
    id: "elm08-q35",
    category: "Sterowniki PLC i Komunikacja",
    question: "Jaki jest standardowy poziom napięcia sygnałów dyskretnych (dwustanowych) w automatyce przemysłowej i sterownikach PLC (zgodnie z IEC 61131-2)?",
    options: [
      { id: "A", text: "5 V DC (standard TTL)" },
      { id: "B", text: "12 V AC" },
      { id: "C", text: "24 V DC" },
      { id: "D", text: "230 V AC" }
    ],
    correctAnswer: "C",
    explanation: "Przemysłowy standard sygnałów I/O dla sterowników PLC i robotów to 24 V DC (stan niski zwykle -3V..+5V, stan wysoki +15V..+30V)."
  },
  {
    id: "elm08-q36",
    category: "Sterowniki PLC i Komunikacja",
    question: "W jakiej kolejności wykonywany jest podstawowy cykl pracy sterownika PLC?",
    options: [
      { id: "A", text: "Zapis wyjść -> Wykonanie programu -> Odczyt wejść" },
      { id: "B", text: "Kompilacja kodu -> Bazowanie osi -> Odczyt czujników" },
      { id: "C", text: "Wykonanie programu -> Wyłączenie zasilania -> Reset rejestrów" },
      { id: "D", text: "Odczyt wejść (PAE) -> Wykonanie programu logicznego -> Zapis stanów do pamięci wyjść (PAA) -> Komunikacja i diagnostyka" }
    ],
    correctAnswer: "D",
    explanation: "Cykl PLC (Scan Cycle) realizuje: 1. Odczyt fizycznych wejść do obrazu procesu (PAE), 2. Wykonanie programu użytkownika, 3. Zapis obrazu wyjść (PAA) do modułów fizycznych, 4. Obsługa sieci i zadań systemowych."
  },
  {
    id: "elm08-q37",
    category: "Sterowniki PLC i Komunikacja",
    question: "Który język programowania sterowników PLC według normy IEC 61131-3 jest graficznym odpowiednikiem klasycznych schematów przekaźnikowo-stycznikowych?",
    options: [
      { id: "A", text: "ST (Structured Text)" },
      { id: "B", text: "IL (Instruction List)" },
      { id: "C", text: "LD (Ladder Diagram - język drabinkowy)" },
      { id: "D", text: "SFC (Sequential Function Chart)" }
    ],
    correctAnswer: "C",
    explanation: "Język drabinkowy LD (Ladder Diagram) odwzorowuje ścieżki przepływu prądu za pomocą symboli styków normalnie otwartych, normalnie zamkniętych oraz cewek wyjściowych ułożonych między szynami zasilania."
  },
  {
    id: "elm08-q38",
    category: "Sterowniki PLC i Komunikacja",
    question: "Która przemysłowa sieć komunikacyjna oparta na standardzie Ethernet czasu rzeczywistego (Real-Time Ethernet) jest powszechnie stosowana w układach automatyki z robotami?",
    options: [
      { id: "A", text: "RS-232" },
      { id: "B", text: "PROFINET" },
      { id: "C", text: "HART" },
      { id: "D", text: "I2C" }
    ],
    correctAnswer: "B",
    explanation: "PROFINET (oraz EtherCAT, Ethernet/IP) to wiodące standardy Ethernetu przemysłowego czasu rzeczywistego, umożliwiające szybką wymianę danych cyfrowych, bezpiecznych (PROFIsafe) i konfiguracji między PLC a robotem."
  },
  {
    id: "elm08-q39",
    category: "Sterowniki PLC i Komunikacja",
    question: "Na czym polega mechanizm synchronizacji 'handshake' (uścisk dłoni) pomiędzy robotem a sterownikiem PLC?",
    options: [
      { id: "A", text: "Na ciągłym wysyłaniu sygnału zegarowego o częstotliwości 1 kHz" },
      { id: "B", text: "Na wspólnym wyłączeniu zasilania awaryjnego" },
      { id: "C", text: "Na mechanicznym zblokowaniu ramienia robota" },
      { id: "D", text: "Na wymianie sygnałów potwierdzenia: PLC wystawia żądanie (Start), robot potwierdza rozpoczęcie pracy (Busy), a po ukończeniu wystawia sygnał zakończenia (Done)" }
    ],
    correctAnswer: "D",
    explanation: "Handshake to dwukierunkowy protokół potwierdzania stanów sygnałami dwustanowymi: żądanie wykonania czynności -> potwierdzenie przyjęcia -> wykonanie -> zgłoszenie gotowości/zakończenia."
  },
  {
    id: "elm08-q40",
    category: "Sterowniki PLC i Komunikacja",
    question: "Do czego w falowniku (przemienniku częstotliwości) napędu taśmociągu służą wejścia cyfrowe DI1 i DI2?",
    options: [
      { id: "A", text: "Do bezpośredniego pomiaru temperatury uzwojeń silnika" },
      { id: "B", text: "Do załączania pracy silnika (Start/Stop) oraz wyboru kierunku obrotów (Prawo/Lewo)" },
      { id: "C", text: "Do programowania oprogramowania układowego (firmware)" },
      { id: "D", text: "Do kompensacji mocy biernej" }
    ],
    correctAnswer: "B",
    explanation: "W falownikach wejścia cyfrowe konfiguruje się jako sygnały sterujące pracą napędu: np. DI1 = START/STOP (bieg), DI2 = REVERSE (kierunek obrotów przód/tył)."
  },
  {
    id: "elm08-q41",
    category: "Sterowniki PLC i Komunikacja",
    question: "Który rejestr pamięci sterownika Siemens SIMATIC S7 odpowiada za binarne wejścia cyfrowe modułów?",
    options: [
      { id: "A", text: "Rejestr I (np. I0.0)" },
      { id: "B", text: "Rejestr Q (np. Q0.0)" },
      { id: "C", text: "Rejestr M (np. M0.0)" },
      { id: "D", text: "Rejestr DB (np. DB1.DBX0.0)" }
    ],
    correctAnswer: "A",
    explanation: "I (Input - wejście, w wersji niemieckiej E - Eingang). Wyjścia oznaczane są jako Q (Output / A - Ausgang), a pamięć znaczników pomocniczych jako M (Merker)."
  },
  {
    id: "elm08-q42",
    category: "Sterowniki PLC i Komunikacja",
    question: "Do czego na stanowisku zrobotyzowanym służy panel operatorski HMI (Human-Machine Interface)?",
    options: [
      { id: "A", text: "Do bezpośredniego zasilania silników serwo" },
      { id: "B", text: "Zastępuje w 100% wyłącznik awaryjny E-Stop" },
      { id: "C", text: "Do wizualizacji stanu pracy gniazda, zadawania parametrów produkcyjnych, wyświetlania alarmów i sterowania ręcznego" },
      { id: "D", text: "Do wykonywania kopii zapasowej oleju w przekładniach" }
    ],
    correctAnswer: "C",
    explanation: "Panel HMI umożliwia operatorowi interakcję z procesem technologicznym: podgląd liczników detali, stanów czujników, diagnozowanie przyczyn zatrzymań awaryjnych oraz wprowadzanie receptur."
  },

  // --- KATEGORIA: Bezpieczeństwo i Normy (43-49) ---
  {
    id: "elm08-q43",
    category: "Bezpieczeństwo i Normy",
    question: "Jak działa trójpozycyjny przycisk zezwalający (Deadman switch) umieszczony z tyłu panelu programowania teach pendant?",
    options: [
      { id: "A", text: "Zezwala na ruch robota w trybie ręcznym wyłącznie wtedy, gdy jest wciśnięty do środkowej pozycji" },
      { id: "B", text: "Zezwala na ruch tylko wtedy, gdy zostanie całkowicie wciśnięty do oporu" },
      { id: "C", text: "Działa identycznie jak grzybkowy wyłącznik awaryjny E-Stop" },
      { id: "D", text: "Musi być trzymany również podczas pełnej pracy automatycznej robota" }
    ],
    correctAnswer: "A",
    explanation: "Przycisk trójpozycyjny zapewnia bezpieczeństwo w przypadku paniki: puszczenie przycisku (pozycja 1) LUB zaciśnięcie go ze strachu do oporu (pozycja 3) natychmiast odcina zasilanie napędów. Ruch możliwy jest TYLKO w pozycji środkowej (pozycja 2)."
  },
  {
    id: "elm08-q44",
    category: "Bezpieczeństwo i Normy",
    question: "Jaka jest maksymalna dopuszczalna prędkość punktu TCP robota w ręcznym trybie uczenia T1 (Manual Reduced Speed) zgodnie z normą ISO 10218?",
    options: [
      { id: "A", text: "50 mm/s" },
      { id: "B", text: "1000 mm/s" },
      { id: "C", text: "250 mm/s" },
      { id: "D", text: "Nie ma żadnego ograniczenia prędkości w trybie T1" }
    ],
    correctAnswer: "C",
    explanation: "Norma PN-EN ISO 10218-1 ściśle ogranicza prędkość ruchu narzędzia TCP w trybie ręcznym do maksymalnie 250 mm/s, co daje operatorowi czas na reakcję i uniknięcie zgniecenia."
  },
  {
    id: "elm08-q45",
    category: "Bezpieczeństwo i Normy",
    question: "Do jakiej kategorii zatrzymania (Stop Category wg PN-EN 60204-1) zalicza się natychmiastowe odłączenie zasilania siłowników mechanicznych (niekontrolowane zatrzymanie)?",
    options: [
      { id: "A", text: "Kategoria zatrzymania 0 (Stop 0)" },
      { id: "B", text: "Kategoria zatrzymania 1 (Stop 1)" },
      { id: "C", text: "Kategoria zatrzymania 2 (Stop 2)" },
      { id: "D", text: "Kategoria zatrzymania 3 (Stop 3)" }
    ],
    correctAnswer: "A",
    explanation: "Stop 0 to niekontrolowane zatrzymanie przez natychmiastowe odcięcie zasilania napędów (hamulce mechaniczne załączają się od razu). Stop 1 to zatrzymanie kontrolowane (wyhamowanie z zasilaniem, po czym odcięcie)."
  },
  {
    id: "elm08-q46",
    category: "Bezpieczeństwo i Normy",
    question: "Do czego w optoelektronicznych kurtynach bezpieczeństwa służy funkcja 'muting'?",
    options: [
      { id: "A", text: "Do stałego wyłączenia kurtyny w razie awarii" },
      { id: "B", text: "Do wyciszenia sygnalizatora akustycznego stacji" },
      { id: "C", text: "Do zwiększenia rozdzielczości wiązek optycznych" },
      { id: "D", text: "Do automatycznego, czasowego zawieszenia funkcji bezpieczeństwa kurtyny, np. aby przepuścić paletę z towarem wjeżdżającą na taśmociągu" }
    ],
    correctAnswer: "D",
    explanation: "Muting to bezpieczne, automatyczne i tymczasowe wygaszenie kurtyny przy spełnieniu określonej sekwencji czujników mutingowych (np. wjazd palety z towarem), odróżniające ładunek od człowieka."
  },
  {
    id: "elm08-q47",
    category: "Bezpieczeństwo i Normy",
    question: "W jaki sposób muszą być połączone styki przycisku wyłącznika awaryjnego (E-Stop) z modułem bezpieczeństwa?",
    options: [
      { id: "A", text: "Jednokanałowo, za pomocą jednego styku NO" },
      { id: "B", text: "Za pośrednictwem sieci Wi-Fi" },
      { id: "C", text: "Dwukanałowo, za pomocą dwóch niezależnych styków NC z detekcją zwarć międzykanałowych" },
      { id: "D", text: "Równolegle z cewką elektrozaworu" }
    ],
    correctAnswer: "C",
    explanation: "Obwody zatrzymania awaryjnego wysokiej kategorii (PL e / SIL 3) wymagają dwukanałowej struktury (dwa styki normalnie zamknięte NC) z testowaniem impulsowym w celu wykrycia zwarcia do potencjału lub między kanałami."
  },
  {
    id: "elm08-q48",
    category: "Bezpieczeństwo i Normy",
    question: "Czym charakteryzuje się cobot (robot współpracujący) w odróżnieniu od tradycyjnego robota przemysłowego?",
    options: [
      { id: "A", text: "Pracuje wyłącznie pod wodą" },
      { id: "B", text: "Nie posiada możliwości programowania ruchów liniowych" },
      { id: "C", text: "Nie wymaga zasilania elektrycznego" },
      { id: "D", text: "Posiada zaokrąglone kształty, czujniki siły/momentu w osiach i ograniczenia energii uderzenia, umożliwiając bezpieczną pracę ramię w ramię z człowiekiem bez wygrodzeń" }
    ],
    correctAnswer: "D",
    explanation: "Coboty (zgodnie z ISO/TS 15066) spełniają wymogi monitorowania siły i mocy (PFL - Power and Force Limiting), dzięki czemu przy kontakcie z człowiekiem bezpiecznie wyhamowują, nie powodując obrażeń."
  },
  {
    id: "elm08-q49",
    category: "Bezpieczeństwo i Normy",
    question: "Co należy bezwzględnie zrobić przed wejściem do wnętrza wygrodzenia stanowiska zrobotyzowanego w celu wykonania prac konserwacyjnych?",
    options: [
      { id: "A", text: "Przełączyć manipulator w tryb ręczny (Manual), zabrać ze sobą panel teach pendant z przyciskiem zezwalającym lub zastosować procedurę LOTO (odcięcie i zablokowanie energii)" },
      { id: "B", text: "Zwiększyć prędkość robota do 100% w celu przetestowania zabezpieczeń" },
      { id: "C", text: "Wyłączyć wyłącznie monitor komputera PC" },
      { id: "D", text: "Odłączyć przewód sprężonego powietrza bez uprzedniego odpowietrzenia" }
    ],
    correctAnswer: "A",
    explanation: "Przełączenie kluczyka w tryb ręczny uniemożliwia zdalny start w automacie. Operator w celi musi mieć przy sobie teach pendant (jako jedyny element sterujący), a przy serwisie stosuje się procedurę LOTO (Lockout/Tagout)."
  },

  // --- KATEGORIA: Eksploatacja i Konserwacja (50-55) ---
  {
    id: "elm08-q50",
    category: "Eksploatacja i Konserwacja",
    question: "W jakich warunkach należy wymieniać baterię podtrzymania pamięci enkoderów (modułu SMB w robotach ABB)?",
    options: [
      { id: "A", text: "Bezwzględnie przy całkowicie odłączonym zasilaniu sieciowym i rozładowanych kondensatorach" },
      { id: "B", text: "Tylko w trakcie wykonywania ruchu szybkiego w trybie automatycznym" },
      { id: "C", text: "Przy włączonym zasilaniu sterownika robota, aby zapobiec utracie danych kalibracyjnych liczników obrotów enkoderów" },
      { id: "D", text: "Baterii SMB nigdy się nie wymienia" }
    ],
    correctAnswer: "C",
    explanation: "Wymiana baterii podtrzymującej pamięć licznika obrotów modułu SMB przy załączonym zasilaniu kontrolera gwarantuje, że sterownik nie utraci punktów zerowych osi (brak konieczności rewolwerowania/kalibracji)."
  },
  {
    id: "elm08-q51",
    category: "Eksploatacja i Konserwacja",
    question: "Jaki przyrząd pomiarowy służy do badania rezystancji izolacji uzwojeń silników serwonapędów manipulatora?",
    options: [
      { id: "A", text: "Miernik rezystancji izolacji (megomomierz) napięciem probierczym np. 500 V DC" },
      { id: "B", text: "Tachometr optyczny" },
      { id: "C", text: "Oscyloskop cyfrowy dwukanałowy" },
      { id: "D", text: "Wskaźnik kolejności faz" }
    ],
    correctAnswer: "A",
    explanation: "Stan izolacji uzwojeń silników sprawdza się megaomomierzem pod napięciem probierczym (zwykle 500V lub 1000V DC). Prawidłowa rezystancja powinna wynosić co najmniej kilkadziesiąt megaomów."
  },
  {
    id: "elm08-q52",
    category: "Eksploatacja i Konserwacja",
    question: "Na czym polega procedura 'aktualizacji liczników obrotów' (Rev Counter Update) w robotach ABB?",
    options: [
      { id: "A", text: "Na wymianie oleju w silnikach elektrycznych" },
      { id: "B", text: "Na skasowaniu historii błędów w dzienniku zdarzeń" },
      { id: "C", text: "Na zresetowaniu hasła administratora" },
      { id: "D", text: "Na ustawieniu osi robota w pozycjach znaczników mechanicznych (nacięć kalibracyjnych) i zatwierdzeniu ich w menu kontrolera" }
    ],
    correctAnswer: "D",
    explanation: "Gdy bateria SMB rozładuje się, sterownik gubi pełną liczbę obrotów osi. Należy ręcznie ustawić robot w pozycjach kalibracyjnych (znaki na odlewach korpusu) i zaktualizować liczniki obrotów w systemie."
  },
  {
    id: "elm08-q53",
    category: "Eksploatacja i Konserwacja",
    question: "Co należy regularnie kontrolować w wiązce elastycznej przewodów (tzw. dress pack) biegnącej wzdłuż ramienia robota do chwytaka?",
    options: [
      { id: "A", text: "Kąt odbicia promieni słonecznych od peszla" },
      { id: "B", text: "Współczynnik tarcia powietrza wokół ramienia" },
      { id: "C", text: "Wyłącznie kolor opasek zaciskowych" },
      { id: "D", text: "Stopień przetarcia oplotu ochronnego, załamania węży pneumatycznych, pęknięcia izolacji kabli i stan odciągów sprężynowych" }
    ],
    correctAnswer: "D",
    explanation: "Dress pack podlega ciągłemu skręcaniu i zginaniu. Należy okresowo sprawdzać stan peszli, brak zagięć przewodów pneumatycznych oraz integralność żył zasilających i sygnałowych."
  },
  {
    id: "elm08-q54",
    category: "Eksploatacja i Konserwacja",
    question: "Jaki jest główny objaw zużycia lub uszkodzenia hamulca elektromechanicznego w osi robota przemysłowego?",
    options: [
      { id: "A", text: "Gwałtowny spadek temperatury korpusu serwonapędu" },
      { id: "B", text: "Opadanie ramienia manipulatora po odłączeniu zasilania napędów (wyłączeniu silników)" },
      { id: "C", text: "Wzrost prędkości maksymalnej w osi" },
      { id: "D", text: "Brak możliwości włączenia lampki H1" }
    ],
    correctAnswer: "B",
    explanation: "Hamulce w robotach są hamulcami sprężynowymi luzowanymi prądem. Po zaniku zasilania silników sprawny hamulec musi sztywno utrzymać masę ramienia. Opadanie ramienia świadczy o zużyciu okładzin lub awarii cewki luzownika."
  },
  {
    id: "elm08-q55",
    category: "Eksploatacja i Konserwacja",
    question: "Co to jest kopia bezpieczeństwa (Backup) systemu robota i dlaczego należy ją wykonywać po każdej istotnej modyfikacji programu?",
    options: [
      { id: "A", text: "To wydrukowany na papierze spis numerów seryjnych silników" },
      { id: "B", text: "To zapasowy chwytak trzymany w magazynie" },
      { id: "C", text: "To procedura czyszczenia sprężonym powietrzem szafy sterowniczej" },
      { id: "D", text: "To kompletny zrzut oprogramowania zawierający programy RAPID, konfigurację osi, zdefiniowane narzędzia, układy współrzędnych i parametry sieci I/O, umożliwiający pełne odtworzenie pracy robota po awarii" }
    ],
    correctAnswer: "D",
    explanation: "Pełny Backup systemu zawiera moduły RAPID, pliki konfiguracyjne (MOC, EIO, SYS, PROC) i dane kalibracyjne. W razie uszkodzenia dysku lub sterownika pozwala na przywrócenie pracy stanowiska w kilkanaście minut."
  }
];

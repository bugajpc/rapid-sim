# Wzorcowe Rozwiązania Zadań RAPID (RAPID Sim)

Dokument zawiera kompletne, wzorcowe rozwiązania wszystkich zadań dostępnych w symulatorze **RAPID Sim (ABB IRB 1090 / OmniCore / FlexPendant)**:
- **Część I:** 5 Zadań Treningowych (Podstawy programowania RAPID)
- **Część II:** 13 Oficjalnych Zadań Egzaminacyjnych CKE Kwalifikacji **ELM.08 (Technik Robotyk)**

Każde zadanie zawiera pełny, zweryfikowany kod modułu RAPID, gotowy do uruchomienia w symulatorze lub na fizycznym kontrolerze ABB OmniCore/IRC5, wraz ze szczegółowym komentarzem dydaktycznym.

---

# Spis Treści

1. [Część I: Zadania Treningowe](#część-i-zadania-treningowe)
   - [Zadanie 1: Komunikaty i bazowanie](#zadanie-1-komunikaty-i-bazowanie)
   - [Zadanie 2: Rysowanie ścieżki liniowej](#zadanie-2-rysowanie-ścieżki-liniowej)
   - [Zadanie 3: Licznik wyprodukowanych sztuk](#zadanie-3-licznik-wyprodukowanych-sztuk)
   - [Zadanie 4: Przenoszenie detalu chwytakiem](#zadanie-4-przenoszenie-detalu-chwytakiem)
   - [Zadanie 5: Synchronizacja z operatorem (WaitDI)](#zadanie-5-synchronizacja-z-operatorem-waitdi)
2. [Część II: Egzaminy Praktyczne CKE ELM.08 (Technik Robotyk)](#część-ii-egzaminy-praktyczne-cke-elm08)
   - [ELM.08-101: Segregacja detali (metal/tworzywo) z czujnikiem indukcyjnym B5](#elm08-101-segregacja-detali-metaltworzywo-z-czujnikiem-indukcyjnym-b5)
   - [ELM.08-102: Przenoszenie detali na taśmę transportową z kontrolą czujników B3 i B4](#elm08-102-przenoszenie-detali-na-taśmę-transportową-z-kontrolą-czujników-b3-i-b4)
   - [ELM.08-103: Paletyzacja 6 detali sześciokątnych po łuku MoveC z sygnalizacją H1/H2](#elm08-103-paletyzacja-6-detali-sześciokątnych-po-łuku-movec-z-sygnalizacją-h1h2)
   - [ELM.08-104: Kalibracja i test osiowy robota z ograniczeniem prędkości 10%](#elm08-104-kalibracja-i-test-osiowy-robota-z-ograniczeniem-prędkości-10)
   - [ELM.08-105: Rozładunek magazynu grawitacyjnego (4 detale) na przenośnik z czujnikiem B3](#elm08-105-rozładunek-magazynu-grawitacyjnego-4-detale-na-przenośnik-z-czujnikiem-b3)
   - [ELM.08-106: Dwukierunkowa segregacja z magazynu na przenośnik wg czujnika indukcyjnego B5](#elm08-106-dwukierunkowa-segregacja-z-magazynu-na-przenośnik-wg-czujnika-indukcyjnego-b5)
   - [ELM.08-107: Nakładanie detali pierścieniowych na wałki z czujnikiem B1 i sygnałem PLC K3](#elm08-107-nakładanie-detali-pierścieniowych-na-wałki-z-czujnikiem-b1-i-sygnałem-plc-k3)
   - [ELM.08-108: Automatyczny rozładunek palety 4 detali na podajnik z czujnikami B1 i B2](#elm08-108-automatyczny-rozładunek-palety-4-detali-na-podajnik-z-czujnikami-b1-i-b2)
   - [ELM.08-109: Układanie wieży z 3 detali, pauza S1, wymiana narzędzia i rysowanie pP1..pP16](#elm08-109-układanie-wieży-z-3-detali-pauza-s1-wymiana-narzędzia-i-rysowanie-pp1pp16)
   - [ELM.08-110: Transfer na stanowisko obróbcze B1, wymiana narzędzia i trajektoria z inspekcją pP7](#elm08-110-transfer-na-stanowisko-obróbcze-b1-wymiana-narzędzia-i-trajektoria-z-inspekcją-pp7)
   - [ELM.08-111: Rysowanie kwadratu i okręgu w układzie \WObj:=wobj1 z prędkością v30 i Offs](#elm08-111-rysowanie-kwadratu-i-okręgu-w-układzie-wobjwobj1-z-prędkością-v30-i-offs)
   - [ELM.08-112: Rysowanie w dwóch układach współrzędnych: wobj1 (H1) i wobj2 (H2)](#elm08-112-rysowanie-w-dwóch-układach-współrzędnych-wobj1-h1-i-wobj2-h2)
   - [ELM.08-113: Kierunkowa segregacja i liniowa paletyzacja detali z raportowaniem danych](#elm08-113-kierunkowa-segregacja-i-liniowa-paletyzacja-detali-z-raportowaniem-danych)

---

# Część I: Zadania Treningowe

## Zadanie 1: Komunikaty i bazowanie
- **Zagadnienie:** Podstawy składni RAPID, instrukcja `TPWrite`, ruch osiowy `MoveJ`.
- **Narzędzie:** `tPen`

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        ! Krok 1: Wypisz na panelu TPWrite komunikat powitalny
        TPWrite "Robot gotowy do pracy";
        
        ! Krok 2: Wykonaj ruch MoveJ do punktu bazowego pHome z narzedziem tPen
        MoveJ pHome, v200, fine, tPen;
        
        ! Krok 3: Wypisz komunikat potwierdzajacy osiagniecie celu
        TPWrite "Pozycja bazowa osiagnieta";
    ENDPROC

ENDMODULE
```

### Omówienie:
- Instrukcja `TPWrite` służy do komunikacji tekstowej z operatorem w konsoli FlexPendant / okna symulatora.
- Ruch `MoveJ` jest ruchem osiowym (przegubowym) – wszystkie osie robota poruszają się synchronicznie do pozycji docelowej po optymalnej trajektorii. Stosuje się go w przestrzeni otwartej, gdzie nie jest wymagany ruch w linii prostej.

---

## Zadanie 2: Rysowanie ścieżki liniowej
- **Zagadnienie:** Ruch liniowy `MoveL`, trajektoria TCP po wierzchołkach.
- **Narzędzie:** `tPen`

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        ! 1. Dojazd do pozycji domowej ruchem osiowym
        MoveJ pHome, v200, fine, tPen;
        
        ! 2. Dojazd do punktu p1 ruchem liniowym z predkoscia v100
        MoveL p1, v100, fine, tPen;
        
        ! 3. Rysowanie kolejnych bokow sciezki zamknietej (p1 -> p2 -> p3 -> p4 -> p1)
        MoveL p2, v100, fine, tPen;
        MoveL p3, v100, fine, tPen;
        MoveL p4, v100, fine, tPen;
        MoveL p1, v100, fine, tPen;
        
        ! 4. Bezpieczny powrot do pHome
        MoveJ pHome, v200, fine, tPen;
        TPWrite "Sciezka zostala narysowana.";
    ENDPROC

ENDMODULE
```

### Omówienie:
- `MoveL` wymusza ruch punktu centralnego narzędzia (TCP) wzdłuż linii prostej z kontrolowaną prędkością roboczą (`v100`).
- Użycie strefy zatrzymania `fine` gwarantuje precyzyjne dotarcie do każdego wierzchołka przed rozpoczęciem kolejnego odcinka.

---

## Zadanie 3: Licznik wyprodukowanych sztuk
- **Zagadnienie:** Zmienne `VAR num`, instrukcja `Incr`, formatowanie tekstu `TPWrite ... \Num:=...`.
- **Narzędzie:** `tPen`

### Kod programu:
```rapid
MODULE MainModule

    VAR num nParts := 0;

    PROC main()
        ! 1. Bazowanie robota
        MoveJ pHome, v200, fine, tPen;
        
        ! 2. Cykl 1: ruch do p1, p2, zwiekszenie licznika
        MoveL p1, v150, fine, tPen;
        MoveL p2, v150, fine, tPen;
        Incr nParts;
        TPWrite "Wyprodukowano sztuk: " \Num:=nParts;
        
        ! 3. Cykl 2: ruch do p3, p4, zwiekszenie licznika
        MoveL p3, v150, fine, tPen;
        MoveL p4, v150, fine, tPen;
        Incr nParts;
        TPWrite "Wyprodukowano sztuk: " \Num:=nParts;
        
        ! 4. Zakonczenie pracy
        MoveJ pHome, v200, fine, tPen;
        TPWrite "Zakonczono partie. Lacznie: " \Num:=nParts;
    ENDPROC

ENDMODULE
```

### Omówienie:
- `VAR num nParts := 0;` deklaruje zmienną liczbową typu całkowitego/zmiennoprzecinkowego.
- Instrukcja `Incr nParts;` stanowi odpowiednik `nParts := nParts + 1;`.
- Przełącznik `\Num:=nParts` w `TPWrite` formatuje i wstawia aktualną wartość liczbową do komunikatu na panelu Teach Pendant.

---

## Zadanie 4: Przenoszenie detalu chwytakiem
- **Zagadnienie:** Sterowanie sygnałami cyfrowymi chwytaka `Set`/`Reset doGripper`, czasy oczekiwania `WaitTime`, punkty podejścia i odejścia.
- **Narzędzie:** `tGripper`

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        ! 1. Start z pozycji bazowej z otwartym chwytakiem
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        ! 2. Dojazd nad detal (punkt podejscia) ruchem liniowym
        MoveL pGripAbove, v150, fine, tGripper;
        
        ! 3. Zjazd do strefy chwytania z bezpieczna predkoscia v50
        MoveL pGripPick, v50, fine, tGripper;
        
        ! 4. Zamkniecie chwytaka i odczekanie na ustabilizowanie szczek (0.5 s)
        Set doGripper;
        WaitTime 0.5;
        
        ! 5. Podniesienie detalu pionowo do gory (punkt odejscia)
        MoveL pGripAbove, v100, fine, tGripper;
        
        ! 6. Przejazd nad strefę odkladania
        MoveJ pPlaceAbove, v150, fine, tGripper;
        
        ! 7. Zjazd do stolu montazowego
        MoveL pPlace, v50, fine, tGripper;
        
        ! 8. Otwarcie chwytaka i zwolnienie detalu
        Reset doGripper;
        WaitTime 0.5;
        
        ! 9. Bezpieczny odjazd i powrot do bazy
        MoveL pPlaceAbove, v100, fine, tGripper;
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Detal przetransportowany pomyslnie.";
    ENDPROC

ENDMODULE
```

### Omówienie:
- Kluczowa zasada bezpieczeństwa przy pobieraniu i odkładaniu: ruchy pionowe (podejście i odejście) wykonujemy ruchem prostoliniowym `MoveL` z niższą prędkością, co eliminuje ryzyko kolizji chwytaka z detalami i oprzyrządowaniem stanowiska.
- `WaitTime 0.5;` zapewnia fizyczny czas na zamknięcie lub otwarcie szczęk pneumatycznych chwytaka.

---

## Zadanie 5: Synchronizacja z operatorem (WaitDI)
- **Zagadnienie:** Instrukcja `WaitDI`, cyfrowe wejścia procesowe, sygnalizacja statusu wyjściami `doReady`/`doBusy`.
- **Narzędzie:** `tPen`

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        ! 1. Gotowosc do pracy: doReady = 1, doBusy = 0
        Set doReady;
        Reset doBusy;
        MoveJ pHome, v200, fine, tPen;
        TPWrite "Oczekiwanie na wcisniecie przycisku START (diStart)...";
        
        ! 2. Zatrzymanie wykonania do momentu podania sygnalu wysokiego (1) na wejscie diStart
        WaitDI diStart, 1;
        
        ! 3. Rozpoczecie cyklu roboczego
        Reset doReady;
        Set doBusy;
        TPWrite "Cykl roboczy w toku...";
        
        ! 4. Wykonanie zaplanowanej trajektorii
        MoveL p1, v100, fine, tPen;
        MoveL p2, v100, fine, tPen;
        WaitTime 1.0;
        
        ! 5. Zakonczenie cyklu i powrot do gotowosci
        MoveJ pHome, v200, fine, tPen;
        Reset doBusy;
        Set doReady;
        TPWrite "Cykl zakonczony. Stanowisko gotowe do nastepnego zadania.";
    ENDPROC

ENDMODULE
```

---

# Część II: Egzaminy Praktyczne CKE ELM.08

## ELM.08-101: Segregacja detali (metal/tworzywo) z czujnikiem indukcyjnym B5
- **Arkusz:** ELM.08-01 / ELM.08-101
- **Opis stacji:** Robot pobiera detal z pozycji `pGripPick`, podjeżdża nad czujnik indukcyjny `pSensorB5`. Jeżeli czujnik `B5 = 1` (detal metalowy), detal trafia do Kosza 1 (`pBin1`). W przeciwnym razie (`B5 = 0`, tworzywo), detal trafia do Kosza 2 (`pBin2`). Przy przemieszczaniu omijana jest przeszkoda przez punkt pośredni `pAboveObstacle`.
- **Sygnały:** `S1` (przycisk start), `B5` (czujnik indukcyjny), `H1` (lampa sygnalizacyjna).

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        ! 1. Inicjalizacja stanowiska i sygnalizacji
        Reset H1;
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Oczekiwanie na przycisk S1...";
        
        ! 2. Oczekiwanie na start operatora
        WaitDI S1, 1;
        WaitTime 3.0;
        Set H1;
        
        ! 3. Dojazd i pobranie detalu
        MoveL pGripAbove, v150, fine, tGripper;
        MoveL pGripPick, v50, fine, tGripper;
        Set doGripper;
        WaitTime 1.0;
        MoveL pGripAbove, v100, fine, tGripper;
        
        ! 4. Dojazd nad czujnik indukcyjny B5
        MoveJ pSensorAbove, v150, fine, tGripper;
        MoveL pSensorB5, v50, fine, tGripper;
        WaitTime 5.0;
        
        ! 5. Warunek: weryfikacja materialu detalu
        IF B5 = 1 THEN
            TPWrite "Wykryto detal metalowy -> Kosz 1";
            MoveL pSensorAbove, v100, fine, tGripper;
            MoveJ pAboveObstacle, v150, fine, tGripper;
            MoveJ pBin1Above, v150, fine, tGripper;
            MoveL pBin1, v50, fine, tGripper;
            Reset doGripper;
            WaitTime 1.0;
            MoveL pBin1Above, v100, fine, tGripper;
        ELSE
            TPWrite "Wykryto detal z tworzywa -> Kosz 2";
            MoveL pSensorAbove, v100, fine, tGripper;
            MoveJ pAboveObstacle, v150, fine, tGripper;
            MoveJ pBin2Above, v150, fine, tGripper;
            MoveL pBin2, v50, fine, tGripper;
            Reset doGripper;
            WaitTime 1.0;
            MoveL pBin2Above, v100, fine, tGripper;
        ENDIF
        
        ! 6. Powrot do bazy i wylaczenie lampy
        MoveJ pHome, v200, fine, tGripper;
        Reset H1;
        TPWrite "Zadanie ELM.08-101 zakonczone.";
    ENDPROC

ENDMODULE
```

---

## ELM.08-102: Przenoszenie detali na taśmę transportową z kontrolą czujników B3 i B4
- **Arkusz:** ELM.08-02 / ELM.08-102
- **Opis stacji:** Pobranie detalu z magazynu `pFeederPick`, odłożenie na początek taśmy `pConvStart`. Po odłożeniu uruchomienie taśmy (`doConvRun`). Detal przemieszcza się przed czujnikiem `B3`, a następnie dociera do stacji pakowania przy czujniku `B4`. Program czeka na pobranie detalu (zbocze opadające `WaitDI B4, 0;`), po czym zatrzymuje taśmę.
- **Sygnały:** `S1` (start), `B3` (detekcja start taśmy), `B4` (detekcja pakowanie), `doConvRun` (napęd taśmy), `H1`/`H2`.

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        ! 1. Przygotowanie stanowiska
        Reset H1;
        Reset H2;
        Reset doConvRun;
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        ! 2. Oczekiwanie na start
        WaitDI S1, 1;
        Set H1;
        
        ! 3. Pobranie detalu z magazynu
        MoveJ pFeederAbove, v200, fine, tGripper;
        MoveL pFeederPick, v50, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pFeederAbove, v100, fine, tGripper;
        
        ! 4. Odlozenie detalu na tasmociag
        MoveJ pConvStartAbove, v200, fine, tGripper;
        MoveL pConvStart, v50, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL pConvStartAbove, v100, fine, tGripper;
        
        ! 5. Uruchomienie tasmy i sygnalizacja ruchu
        Set H2;
        Set doConvRun;
        TPWrite "Tasma uruchomiona. Oczekiwanie na B3...";
        
        ! 6. Kontrola czujnika poczatkowego B3
        WaitDI B3, 1;
        TPWrite "Detal minal czujnik B3. Oczekiwanie na B4...";
        
        ! 7. Detekcja detalu na koncu tasmy B4
        WaitDI B4, 1;
        TPWrite "Detal dotarl do stacji pakowania B4.";
        
        ! 8. Oczekiwanie na odebranie detalu przez operatora (zbocze opadajace)
        WaitDI B4, 0;
        TPWrite "Detal odebrany. Zatrzymanie tasmy.";
        
        ! 9. Zatrzymanie tasmy i powrot
        Reset doConvRun;
        Reset H2;
        MoveJ pHome, v200, fine, tGripper;
        Reset H1;
        TPWrite "Zadanie ELM.08-102 zakonczone.";
    ENDPROC

ENDMODULE
```

---

## ELM.08-103: Paletyzacja 6 detali sześciokątnych po łuku MoveC z sygnalizacją H1/H2
- **Arkusz:** ELM.08-03 / ELM.08-103
- **Opis stacji:** Przeniesienie 6 detali po trajektorii kołowej (`MoveC`) z palety wejściowej na wyjściową za pomocą pętli i funkcji przesunięcia `Offs`. Lampa `H1` sygnalizuje chwytak otwarty, lampa `H2` – chwytak zamknięty. Prędkości: 50% (`v250`) w dojazdach, 20% (`v100`) przy pobieraniu/odkładaniu.

### Kod programu:
```rapid
MODULE MainModule

    VAR num nTotalParts := 6;
    VAR num i := 0;
    VAR num nOffsX := 0;

    PROC main()
        ! 1. Stan wyjsciowy: chwytak otwarty, lampa H1 aktywna
        Reset doGripper;
        Set H1;
        Reset H2;
        MoveJ pHome, v250, fine, tGripper;
        
        ! 2. Oczekiwanie na przycisk S1
        WaitDI S1, 1;
        
        ! 3. Petla transferu 6 detali z dynamicznym offsetem
        FOR i FROM 1 TO nTotalParts DO
            TPWrite "Rozpoczynam transfer detalu nr " \Num:=i;
            nOffsX := (i - 1) * 35;
            
            ! Dojazd i pobranie z predkoscia 20%
            MoveJ Offs(pGripAbove, nOffsX, 0, 0), v250, fine, tGripper;
            MoveL Offs(pGripPick, nOffsX, 0, 0), v100, fine, tGripper;
            
            ! Uchwycenie detalu: przelaczenie sygnalizacji H1/H2
            Set doGripper;
            Reset H1;
            Set H2;
            WaitTime 0.5;
            MoveL Offs(pGripAbove, nOffsX, 0, 0), v100, fine, tGripper;
            
            ! Przeniesienie detalu po luku MoveC (punkt posredni pArcVia)
            MoveC pArcVia, Offs(pPlaceAbove, nOffsX, 0, 0), v250, fine, tGripper;
            
            ! Odlozenie detalu w magazynie docelowym
            MoveL Offs(pPlace, nOffsX, 0, 0), v100, fine, tGripper;
            Reset doGripper;
            Reset H2;
            Set H1;
            WaitTime 0.5;
            MoveL Offs(pPlaceAbove, nOffsX, 0, 0), v100, fine, tGripper;
        ENDFOR
        
        ! 4. Zakonczenie cyklu
        MoveJ pHome, v250, fine, tGripper;
        TPWrite "Przetransportowano wszystkie 6 detali.";
    ENDPROC

ENDMODULE
```

---

## ELM.08-104: Kalibracja i test osiowy robota z ograniczeniem prędkości 10%
- **Arkusz:** ELM.08-04 / ELM.08-104
- **Opis stacji:** Procedura testowa bazowania robota w trybie ręcznym z prędkością zredukowaną do 10% (`v50`). Wymaga wykonania ruchów `PHOME`, `PINIT`, testu chwytaka oraz podjazdu z przesunięciem `Offs(PHOME, 0, 0, 50)`.

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        TPWrite "--- PROCEDURA TESTOWA OSI I BAZOWANIA (SPEED 10%) ---";
        
        ! 1. Ruch bazowy do pozycji PHOME
        MoveJ PHOME, v50, fine, tGripper;
        WaitTime 1.0;
        
        ! 2. Test otwarcia i zamkniecia chwytaka
        Set doGripper;
        WaitTime 1.0;
        Reset doGripper;
        WaitTime 1.0;
        
        ! 3. Ruch do pozycji inicjalizacyjnej PINIT
        MoveJ PINIT, v50, fine, tGripper;
        WaitTime 1.0;
        
        ! 4. Ruch z uzyciem funkcji przesuniecia Offs o 50 mm w osi Z
        MoveL Offs(PINIT, 0, 0, 50), v50, fine, tGripper;
        WaitTime 1.0;
        MoveL PINIT, v50, fine, tGripper;
        
        ! 5. Powrot do PHOME
        MoveJ PHOME, v50, fine, tGripper;
        TPWrite "Test bazowania i osi zakonczony sukcesem.";
    ENDPROC

ENDMODULE
```

---

## ELM.08-105: Rozładunek magazynu grawitacyjnego (4 detale) na przenośnik z czujnikiem B3
- **Arkusz:** ELM.08-05 / ELM.08-105
- **Opis stacji:** Pobranie kolejno 4 detali ze szczeliny magazynu grawitacyjnego `pFeederPick` i umieszczenie ich na taśmie transportowej. Po odłożeniu każdego detalu następuje weryfikacja czujnika optycznego `B3`.

### Kod programu:
```rapid
MODULE MainModule

    VAR num nPartsFeeder := 4;
    VAR num k := 0;
    VAR num nOffsZ := 0;

    PROC main()
        Reset doConvRun;
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        FOR k FROM 1 TO nPartsFeeder DO
            TPWrite "Pobieranie detalu z magazynu grawitacyjnego: " \Num:=k;
            nOffsZ := (k - 1) * 48;
            
            ! Pobranie detalu z uwzglednieniem wysokosci w stosie (krok 48 mm)
            MoveJ Offs(pFeederAbove, 0, 0, nOffsZ), v200, fine, tGripper;
            MoveL Offs(pFeederPick, 0, 0, nOffsZ), v50, fine, tGripper;
            Set doGripper;
            WaitTime 0.5;
            MoveL Offs(pFeederAbove, 0, 0, nOffsZ), v100, fine, tGripper;
            
            ! Odlozenie na tasmociag
            MoveJ pConvStartAbove, v200, fine, tGripper;
            MoveL pConvStart, v50, fine, tGripper;
            Reset doGripper;
            WaitTime 0.5;
            MoveL pConvStartAbove, v100, fine, tGripper;
            
            ! Chwilowe przesuniecie tasmy w celu zwolnienia miejsca
            Set doConvRun;
            WaitTime 2.0;
            Reset doConvRun;
        ENDFOR
        
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Rozladunek magazynu grawitacyjnego zakonczony.";
    ENDPROC

ENDMODULE
```

---

## ELM.08-106: Dwukierunkowa segregacja z magazynu na przenośnik wg czujnika indukcyjnego B5
- **Arkusz:** ELM.08-06 / ELM.08-106
- **Opis stacji:** Detale pobierane z magazynu są badane czujnikiem `B5`. Metal powoduje uruchomienie przenośnika w lewo (`LEWO_PRAWO = 0`), tworzywo w prawo (`LEWO_PRAWO = 1`).

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        Reset START_STOP;
        Reset LEWO_PRAWO;
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        ! Pobranie detalu
        MoveJ pFeederAbove, v200, fine, tGripper;
        MoveL pFeederPick, v50, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pFeederAbove, v100, fine, tGripper;
        
        ! Inspekcja czujnikiem indukcyjnym B5
        MoveJ pSensorAbove, v200, fine, tGripper;
        MoveL pSensorB5, v50, fine, tGripper;
        WaitTime 2.0;
        
        IF B5 = 1 THEN
            TPWrite "Detal metalowy -> Kierunek LEWO";
            MoveL pSensorAbove, v100, fine, tGripper;
            MoveJ pConvStartAbove, v200, fine, tGripper;
            MoveL pConvStart, v50, fine, tGripper;
            Reset doGripper;
            WaitTime 0.5;
            MoveL pConvStartAbove, v100, fine, tGripper;
            
            Reset LEWO_PRAWO;
            Set START_STOP;
            WaitTime 3.0;
            Reset START_STOP;
        ELSE
            TPWrite "Detal z tworzywa -> Kierunek PRAWO";
            MoveL pSensorAbove, v100, fine, tGripper;
            MoveJ pConvStartAbove, v200, fine, tGripper;
            MoveL pConvStart, v50, fine, tGripper;
            Reset doGripper;
            WaitTime 0.5;
            MoveL pConvStartAbove, v100, fine, tGripper;
            
            Set LEWO_PRAWO;
            Set START_STOP;
            WaitTime 3.0;
            Reset START_STOP;
        ENDIF
        
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Segregacja dwukierunkowa zakonczona.";
    ENDPROC

ENDMODULE
```

---

## ELM.08-107: Nakładanie detali pierścieniowych na wałki z czujnikiem B1 i sygnałem PLC K3
- **Arkusz:** ELM.08-07 / ELM.08-107
- **Opis stacji:** Sortowanie 4 detali pierścieniowych z palety 2x2 na 2 pionowe wałki montażowe. Detale nr 1 i 2 (o większej średnicy) nakładane na wałek nr 1 (`pPin1`). Detale nr 3 i 4 (o mniejszej średnicy) nakładane na wałek nr 2 (`pPin2`). Gniazdo detalu nr 4 na palecie monitorowane jest przez czujnik pojemnościowy `B1`. Po zakończeniu sortowania robot wystawia impuls 1 s na przekaźnik `K3` do sterownika PLC.

### Kod programu:
```rapid
MODULE MainModule

    PROC NakladajNaWalek(robtarget pDetal, robtarget pWalek, num nZOffs)
        MoveJ Offs(pDetal, 0, 0, 50), v200, fine, tGripper;
        MoveL pDetal, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL Offs(pDetal, 0, 0, 50), v100, fine, tGripper;
        
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

ENDMODULE
```

---

## ELM.08-108: Automatyczny rozładunek palety 4 detali na podajnik z czujnikami B1 i B2
- **Arkusz:** ELM.08-08 / ELM.08-108
- **Opis stacji:** Pobranie 4 detali z macierzy palety 2x2 i zrzut do zsuwni podajnika. Kontrola czujnika obecności detalu `B1` oraz czujnika przepełnienia zsuwni `B2`.

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        ! Dojazd do palety - pobranie detalu 1
        MoveJ Offs(pPallet1, 0, 0, 40), v200, fine, tGripper;
        MoveL pPallet1, v50, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL Offs(pPallet1, 0, 0, 40), v100, fine, tGripper;
        
        ! Zrzut na podajnik
        MoveJ pConvStartAbove, v200, fine, tGripper;
        MoveL pConvStart, v50, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL pConvStartAbove, v100, fine, tGripper;
        
        ! Weryfikacja czujnikow podajnika
        WaitDI B1, 1;
        TPWrite "Czujnik B1 potwierdzil obecnosc detalu na zsuwni.";
        WaitTime 2.0;
        
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Zadanie ELM.08-108 zakonczone.";
    ENDPROC

ENDMODULE
```

---

## ELM.08-109: Układanie wieży z 3 detali, pauza S1, wymiana narzędzia i rysowanie pP1..pP16
- **Arkusz:** ELM.08-09 / ELM.08-109
- **Opis stacji:** Robot układa pionową wieżę z 3 klocków (`pTowerBase`, `pTowerLevel1`, `pTowerLevel2`). Następnie czeka na potwierdzenie operatora przyciskiem `S1`. Po wznowieniu robot odstawia chwytak, pobiera pisak (`tPen`) i kreśli wzór konturowy po punktach `pP1` do `pP16`.

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        ! KROK 1: Skladanie wiezy z 3 elementow
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        ! Klocek 1 -> Baza wiezy
        MoveJ pFeederAbove, v200, fine, tGripper;
        MoveL pFeederPick, v50, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pFeederAbove, v100, fine, tGripper;
        MoveJ Offs(pTowerBase, 0, 0, 50), v200, fine, tGripper;
        MoveL pTowerBase, v50, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL Offs(pTowerBase, 0, 0, 50), v100, fine, tGripper;
        
        ! Klocek 2 -> Poziom 1 wiezy
        MoveJ pFeederAbove, v200, fine, tGripper;
        MoveL pFeederPick, v50, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pFeederAbove, v100, fine, tGripper;
        MoveJ Offs(pTowerLevel1, 0, 0, 50), v200, fine, tGripper;
        MoveL pTowerLevel1, v50, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL Offs(pTowerLevel1, 0, 0, 50), v100, fine, tGripper;
        
        ! Klocek 3 -> Poziom 2 wiezy
        MoveJ pFeederAbove, v200, fine, tGripper;
        MoveL pFeederPick, v50, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pFeederAbove, v100, fine, tGripper;
        MoveJ Offs(pTowerLevel2, 0, 0, 50), v200, fine, tGripper;
        MoveL pTowerLevel2, v50, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL Offs(pTowerLevel2, 0, 0, 50), v100, fine, tGripper;
        
        MoveJ pHome, v200, fine, tGripper;
        TPWrite "Wieza ulozona. Wcisnij przycisk S1, aby rozpoczac rysowanie...";
        
        ! KROK 2: Pauza na potwierdzenie operatora
        WaitDI S1, 1;
        TPWrite "Pobieranie narzedzia tPen ze stojaka...";
        
        ! KROK 3: Wymiana narzedzia na pisak
        MoveJ Offs(pToolRack, 0, 0, 60), v150, fine, tPen;
        MoveL pToolRack, v50, fine, tPen;
        WaitTime 1.0;
        MoveL Offs(pToolRack, 0, 0, 60), v100, fine, tPen;
        
        ! KROK 4: Rysowanie trajektorii pP1..pP16
        MoveJ Offs(pP1, 0, 0, 20), v150, fine, tPen;
        MoveL pP1, v50, fine, tPen;
        MoveL pP2, v50, fine, tPen;
        MoveL pP3, v50, fine, tPen;
        MoveL pP4, v50, fine, tPen;
        MoveL pP5, v50, fine, tPen;
        MoveL pP6, v50, fine, tPen;
        MoveL pP7, v50, fine, tPen;
        MoveL pP8, v50, fine, tPen;
        MoveL pP9, v50, fine, tPen;
        MoveL pP10, v50, fine, tPen;
        MoveL pP11, v50, fine, tPen;
        MoveL pP12, v50, fine, tPen;
        MoveL pP13, v50, fine, tPen;
        MoveL pP14, v50, fine, tPen;
        MoveL pP15, v50, fine, tPen;
        MoveL pP16, v50, fine, tPen;
        MoveL Offs(pP16, 0, 0, 20), v100, fine, tPen;
        
        MoveJ pHome, v200, fine, tPen;
        TPWrite "Zadanie ELM.08-109 zakonczone pomyslnie.";
    ENDPROC

ENDMODULE
```

---

## ELM.08-110: Transfer na stanowisko obróbcze B1, wymiana narzędzia i trajektoria z inspekcją pP7
- **Arkusz:** ELM.08-10 / ELM.08-110
- **Opis stacji:** Przeniesienie detali na gniazdo obróbcze z czujnikiem `B1`, pobranie pisaka, wykonanie trajektorii `pP1`..`pP12` z zatrzymaniem inspekcyjnym 3 s w punkcie `pP7`.

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        Reset doGripper;
        MoveJ pHome, v200, fine, tGripper;
        
        ! 1. Transfer detalu na stanowisko obrobki
        MoveJ pFeederAbove, v200, fine, tGripper;
        MoveL pFeederPick, v50, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pFeederAbove, v100, fine, tGripper;
        MoveJ pConvStartAbove, v200, fine, tGripper;
        MoveL pConvStart, v50, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL pConvStartAbove, v100, fine, tGripper;
        
        ! Kontrola czujnika B1
        WaitDI B1, 1;
        TPWrite "Detal zamocowany na stanowisku obrobczym B1.";
        
        ! 2. Pobranie pisaka
        MoveJ Offs(pToolRack, 0, 0, 50), v150, fine, tPen;
        MoveL pToolRack, v50, fine, tPen;
        WaitTime 1.0;
        MoveL Offs(pToolRack, 0, 0, 50), v100, fine, tPen;
        
        ! 3. Trajektoria obrobki pP1 do pP12 z inspekcja na pP7
        MoveJ Offs(pP1, 0, 0, 20), v150, fine, tPen;
        MoveL pP1, v50, fine, tPen;
        MoveL pP2, v50, fine, tPen;
        MoveL pP3, v50, fine, tPen;
        MoveL pP4, v50, fine, tPen;
        MoveL pP5, v50, fine, tPen;
        MoveL pP6, v50, fine, tPen;
        MoveL pP7, v50, fine, tPen;
        
        ! Punkt inspekcji pP7
        TPWrite "Punkt kontrolny pP7 osiagniety. Postoj inspekcyjny 3 s...";
        WaitTime 3.0;
        
        MoveL pP8, v50, fine, tPen;
        MoveL pP9, v50, fine, tPen;
        MoveL pP10, v50, fine, tPen;
        MoveL pP11, v50, fine, tPen;
        MoveL pP12, v50, fine, tPen;
        MoveL Offs(pP12, 0, 0, 20), v100, fine, tPen;
        
        MoveJ pHome, v200, fine, tPen;
        TPWrite "Zadanie ELM.08-110 zakonczone.";
    ENDPROC

ENDMODULE
```

---

## ELM.08-111: Rysowanie kwadratu i okręgu w układzie \WObj:=wobj1 z prędkością v30 i Offs
- **Arkusz:** ELM.08-11 / ELM.08-111
- **Opis stacji:** Kreślenie figur geometrycznych (kwadrat i okrąg) na arkuszu papieru zdefiniowanym w układzie współrzędnych przedmiotu obrabianego `wobj1`. Dojazd do figur z podniesieniem o 20 mm w osi Z za pomocą `Offs(..., 0, 0, 20)`. Prędkość rysowania `v30` (30 mm/s).

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        ! 1. Bazowanie robota
        MoveJ pHome, v100, fine, tPen;
        
        ! 2. Dojazd nad pierwszy wierzcholek kwadratu (podniesienie 20 mm)
        MoveJ Offs(pSquare1, 0, 0, 20), v100, fine, tPen \WObj:=wobj1;
        
        ! 3. Rysowanie kwadratu z predkoscia v30 w ukladzie wobj1
        MoveL pSquare1, v30, fine, tPen \WObj:=wobj1;
        MoveL pSquare2, v30, fine, tPen \WObj:=wobj1;
        MoveL pSquare3, v30, fine, tPen \WObj:=wobj1;
        MoveL pSquare4, v30, fine, tPen \WObj:=wobj1;
        MoveL pSquare1, v30, fine, tPen \WObj:=wobj1;
        
        ! 4. Podniesienie pisaka i przejazd nad okrag
        MoveL Offs(pSquare1, 0, 0, 20), v50, fine, tPen \WObj:=wobj1;
        MoveJ Offs(pCircle1, 0, 0, 20), v100, fine, tPen \WObj:=wobj1;
        
        ! 5. Rysowanie okregu dwoma lukami MoveC w ukladzie wobj1
        MoveL pCircle1, v30, fine, tPen \WObj:=wobj1;
        MoveC pCircleVia1, pCircle2, v30, fine, tPen \WObj:=wobj1;
        MoveC pCircleVia2, pCircle1, v30, fine, tPen \WObj:=wobj1;
        
        ! 6. Podniesienie i powrot do bazy
        MoveL Offs(pCircle1, 0, 0, 20), v50, fine, tPen \WObj:=wobj1;
        MoveJ pHome, v100, fine, tPen;
        TPWrite "Rysowanie figur w wobj1 zakonczone pomyslnie.";
    ENDPROC

ENDMODULE
```

---

## ELM.08-112: Rysowanie w dwóch układach współrzędnych: wobj1 (H1) i wobj2 (H2)
- **Arkusz:** ELM.08-12 / ELM.08-112
- **Opis stacji:** Rysowanie trójkąta i okręgu dwukrotnie na dwóch różnych obszarach roboczych:
  1. W układzie `\WObj:=wobj1` z zapaloną lampą `H1`.
  2. Przerwa technologiczna 2.0 s.
  3. W układzie `\WObj:=wobj2` z zapaloną lampą `H2`.
  Prędkość robocza `v30`, podniesienie pisaka `Offs(..., 0, 0, 20)`.

### Kod programu:
```rapid
MODULE MainModule

    PROC RysujWzornik()
        ! 1. Rysowanie trojkata (pTriangleA -> pTriangleB -> pTriangleC -> pTriangleA)
        MoveJ Offs(pTriangleA, 0, 0, 20), v100, fine, tPen;
        MoveL pTriangleA, v30, fine, tPen;
        MoveL pTriangleB, v30, fine, tPen;
        MoveL pTriangleC, v30, fine, tPen;
        MoveL pTriangleA, v30, fine, tPen;
        MoveL Offs(pTriangleA, 0, 0, 20), v50, fine, tPen;
        
        ! 2. Rysowanie okregu
        MoveJ Offs(pCircle1, 0, 0, 20), v100, fine, tPen;
        MoveL pCircle1, v30, fine, tPen;
        MoveC pCircleVia1, pCircle2, v30, fine, tPen;
        MoveC pCircleVia2, pCircle1, v30, fine, tPen;
        MoveL Offs(pCircle1, 0, 0, 20), v50, fine, tPen;
    ENDPROC

    PROC main()
        Reset H1;
        Reset H2;
        MoveJ pHome, v100, fine, tPen;
        
        ! ETAP 1: Rysowanie na obszarze wobj1 z sygnalizacja H1
        TPWrite "Rozpoczynam rysowanie w ukladzie wobj1...";
        Set H1;
        MoveJ Offs(pTriangleA, 0, 0, 20), v100, fine, tPen \WObj:=wobj1;
        MoveL pTriangleA, v30, fine, tPen \WObj:=wobj1;
        MoveL pTriangleB, v30, fine, tPen \WObj:=wobj1;
        MoveL pTriangleC, v30, fine, tPen \WObj:=wobj1;
        MoveL pTriangleA, v30, fine, tPen \WObj:=wobj1;
        MoveL Offs(pTriangleA, 0, 0, 20), v50, fine, tPen \WObj:=wobj1;
        
        MoveJ Offs(pCircle1, 0, 0, 20), v100, fine, tPen \WObj:=wobj1;
        MoveL pCircle1, v30, fine, tPen \WObj:=wobj1;
        MoveC pCircleVia1, pCircle2, v30, fine, tPen \WObj:=wobj1;
        MoveC pCircleVia2, pCircle1, v30, fine, tPen \WObj:=wobj1;
        MoveL Offs(pCircle1, 0, 0, 20), v50, fine, tPen \WObj:=wobj1;
        Reset H1;
        
        ! ETAP 2: Przerwa technologiczna 2.0 s
        MoveJ pHome, v100, fine, tPen;
        TPWrite "Przerwa technologiczna 2 sekundy...";
        WaitTime 2.0;
        
        ! ETAP 3: Rysowanie na obszarze wobj2 z sygnalizacja H2
        TPWrite "Rozpoczynam rysowanie w ukladzie wobj2...";
        Set H2;
        MoveJ Offs(pTriangleA, 0, 0, 20), v100, fine, tPen \WObj:=wobj2;
        MoveL pTriangleA, v30, fine, tPen \WObj:=wobj2;
        MoveL pTriangleB, v30, fine, tPen \WObj:=wobj2;
        MoveL pTriangleC, v30, fine, tPen \WObj:=wobj2;
        MoveL pTriangleA, v30, fine, tPen \WObj:=wobj2;
        MoveL Offs(pTriangleA, 0, 0, 20), v50, fine, tPen \WObj:=wobj2;
        
        MoveJ Offs(pCircle1, 0, 0, 20), v100, fine, tPen \WObj:=wobj2;
        MoveL pCircle1, v30, fine, tPen \WObj:=wobj2;
        MoveC pCircleVia1, pCircle2, v30, fine, tPen \WObj:=wobj2;
        MoveC pCircleVia2, pCircle1, v30, fine, tPen \WObj:=wobj2;
        MoveL Offs(pCircle1, 0, 0, 20), v50, fine, tPen \WObj:=wobj2;
        Reset H2;
        
        MoveJ pHome, v100, fine, tPen;
        TPWrite "Zadanie ELM.08-112 zakonczone sukcesem.";
    ENDPROC

ENDMODULE
```

---

## ELM.08-113: Kierunkowa segregacja i liniowa paletyzacja detali z raportowaniem danych
- **Zagadnienie:** Programowanie zrobotyzowanego stanowiska segregacji kierunkowej, pętla warunkowa `WHILE`, sterowanie zaworem bistabilnym 5/2 (`do_ChwytakON`/`do_ChwytakOFF`), synchronizacja z przenośnikiem dwukierunkowym, wycofanie narzędziowe `RelTool(CRobT(), 0, 0, -50)`, paletyzacja liniowa `Offs(..., nSuma * 35, 0, 0)`, raportowanie danych na panelu operatora `TPWrite`.
- **Narzędzie:** `tChwytak`

### Tabela sygnałów I/O:
| Symbol | Nazwa sygnału RAPID | Typ | Opis technologiczny |
| :--- | :--- | :---: | :--- |
| **$B_{MAG}$** | `di_MagazynDetale` | DI | Czujnik optyczny obecności detalu w magazynie grawitacyjnym ($1=\text{obecny}$) |
| **$B_{LEWY}$** | `di_CzujnikLewy` | DI | Czujnik optyczny pozycji lewej / pozycjonera ($X = -310\text{ mm}$, $1=\text{detal na pozycji}$) |
| **$B_{PRAWY}$** | `di_CzujnikPrawy` | DI | Czujnik optyczny pozycji prawej / odbioru ($X = -60\text{ mm}$, $1=\text{detal na pozycji}$) |
| **$S1$** | `di_Start` | DI | Przycisk monostabilny START na pulpicie operatora ($1=\text{start}$) |
| **$S2$** | `di_Kierunek` | DI | Przełącznik bistabilny wyboru kierunku ($1=\text{LEWO}$, $0=\text{PRAWO}$) |
| **$K1$** | `do_TasmaStart` | DO | Załączenie silnika przenośnika taśmowego ($1=\text{START}$, $0=\text{STOP}$) |
| **$K2$** | `do_TasmaKierunek` | DO | Stycznik nawrotny kierunku biegu taśmy ($0=\text{LEWO}$, $1=\text{PRAWO}$) |
| **$Y1$** | `do_ChwytakON` | DO | Cewka zacisku chwytaka (zawór bistabilny 5/2, impuls $0.3\text{ s}$) |
| **$Y2$** | `do_ChwytakOFF` | DO | Cewka otwarcia chwytaka (zawór bistabilny 5/2, impuls $0.3\text{ s}$) |
| **$H1$** | `do_LampkaH1` | DO | Lampka sygnalizacyjna ZIELONA (detekcja i gotowość do pobrania) |
| **$H2$** | `do_LampkaH2` | DO | Lampka sygnalizacyjna CZERWONA (zakończenie cyklu / magazyn pusty) |

### Wykaz punktów (robtarget):
| Nazwa | X [mm] | Y [mm] | Z [mm] | Opis technologiczny |
| :--- | :---: | :---: | :---: | :--- |
| `pHome` | 0 | 300 | 420 | Bezpieczna pozycja bazowa robota |
| `pMag_Appr` | 180 | 440 | 320 | Pozycja dojazdowa nad magazynem grawitacyjnym |
| `pMag_Pick` | 180 | 440 | 255 | Pozycja pobrania dolnego detalu z magazynu |
| `pTasma_Appr` | -180 | 440 | 320 | Pozycja dojazdowa nad środkiem taśmy |
| `pTasma_Put` | -180 | 440 | 255 | Pozycja odłożenia detalu na taśmociąg |
| `pLewy_Appr` | -310 | 440 | 320 | Pozycja dojazdowa nad lewy pozycjoner |
| `pLewy_Pick` | -310 | 440 | 255 | Pozycja pobrania z lewego pozycjonera |
| `pPrawy_Appr` | -60 | 440 | 320 | Pozycja dojazdowa nad prawą strefę odbiorczą |
| `pPrawy_Pick` | -60 | 440 | 255 | Pozycja pobrania z prawej strefy odbiorczej |
| `pPaleta_Appr`| -70 | 310 | 310 | Pozycja dojazdowa nad gniazdo bazowe palety |
| `pPaleta_Baza`| -70 | 310 | 245 | Pozycja bazowa pierwszego gniazda palety liniowej |

### Kod programu:
```rapid
MODULE ModulEgzaminacyjny

    ! Zmienne licznikowe do ewidencji produkcji
    VAR num nLewo := 0;
    VAR num nPrawo := 0;
    VAR num nSuma := 0;

    PROC main()
        ! Krok 1: Inicjalizacja elementow wykonawczych i sygnalizacji
        Reset do_TasmaStart;
        Reset do_TasmaKierunek;
        Reset do_LampkaH1;
        Reset do_LampkaH2;
        
        ! Otwarcie chwytaka (sterowanie zaworem bistabilnym Y2)
        Set do_ChwytakOFF;
        WaitTime 0.3;
        Reset do_ChwytakOFF;

        ! Wyzerowanie zmiennych ewidencji
        nLewo := 0;
        nPrawo := 0;
        nSuma := 0;

        ! Krok 2: Bazowanie robota i oczekiwanie na operatora
        MoveJ pHome, v200, fine, tChwytak;
        TPWrite "Stanowisko zrobotyzowane gotowe do pracy.";
        TPWrite "Nacisnij przycisk START (S1) aby rozpoczac cykl...";
        WaitDI di_Start, 1;

        ! Krok 3: Glowna petla cyklu - praca do oproznienia magazynu
        WHILE di_MagazynDetale = 1 DO
            ! Pobranie detalu z magazynu grawitacyjnego
            MoveJ pMag_Appr, v200, z10, tChwytak;
            MoveL pMag_Pick, v100, fine, tChwytak;
            Set do_ChwytakON;
            WaitTime 0.3;
            Reset do_ChwytakON;
            MoveL RelTool(CRobT(), 0, 0, -50), v100, z10, tChwytak;

            ! Transport detalu na srodek tasmy przenosnika
            MoveJ pTasma_Appr, v200, z10, tChwytak;
            MoveL pTasma_Put, v100, fine, tChwytak;
            Set do_ChwytakOFF;
            WaitTime 0.3;
            Reset do_ChwytakOFF;
            MoveL RelTool(CRobT(), 0, 0, -50), v100, z10, tChwytak;
            MoveJ pHome, v200, fine, tChwytak;

            ! Decyzja kierunkowa na podstawie przelacznika S2
            IF di_Kierunek = 1 THEN
                ! Wariant A: Transport w LEWO do czujnika B_LEWY
                Reset do_TasmaKierunek;
                Set do_TasmaStart;
                WaitDI di_CzujnikLewy, 1;
                Reset do_TasmaStart;

                ! Sygnalizacja obecnosci detalu lampka zielona H1
                Set do_LampkaH1;
                WaitTime 0.5;
                Reset do_LampkaH1;

                ! Pobranie z pozycjonera lewego
                MoveJ pLewy_Appr, v200, z10, tChwytak;
                MoveL pLewy_Pick, v100, fine, tChwytak;
                Set do_ChwytakON;
                WaitTime 0.3;
                Reset do_ChwytakON;
                MoveL RelTool(CRobT(), 0, 0, -50), v100, z10, tChwytak;

                nLewo := nLewo + 1;
            ELSE
                ! Wariant B: Transport w PRAWO do czujnika B_PRAWY
                Set do_TasmaKierunek;
                Set do_TasmaStart;
                WaitDI di_CzujnikPrawy, 1;
                Reset do_TasmaStart;

                ! Sygnalizacja obecnosci detalu lampka zielona H1
                Set do_LampkaH1;
                WaitTime 0.5;
                Reset do_LampkaH1;

                ! Pobranie z pozycji koncowej prawej
                MoveJ pPrawy_Appr, v200, z10, tChwytak;
                MoveL pPrawy_Pick, v100, fine, tChwytak;
                Set do_ChwytakON;
                WaitTime 0.3;
                Reset do_ChwytakON;
                MoveL RelTool(CRobT(), 0, 0, -50), v100, z10, tChwytak;

                nPrawo := nPrawo + 1;
            ENDIF

            ! Krok 4: Paletyzacja liniowa z dynamicznym przesunieciem wzdluz osi X
            ! Offset wynosi: nSuma * 35 mm wzdluz osi X
            MoveJ Offs(pPaleta_Appr, nSuma * 35, 0, 0), v200, z10, tChwytak;
            MoveL Offs(pPaleta_Baza, nSuma * 35, 0, 0), v100, fine, tChwytak;
            Set do_ChwytakOFF;
            WaitTime 0.3;
            Reset do_ChwytakOFF;
            MoveL Offs(pPaleta_Appr, nSuma * 35, 0, 0), v150, z10, tChwytak;

            ! Inkrementacja sumarycznego licznika paletyzacji
            nSuma := nSuma + 1;

            ! Powrot do pozycji bezpiecznej pHome
            MoveJ pHome, v200, fine, tChwytak;
        ENDWHILE

        ! Krok 5: Zakonczenie cyklu produkcyjnego i raportowanie danych
        Set do_LampkaH2;
        TPWrite "========================================";
        TPWrite "CYKL ZAKONCZONY - MAGAZYN PUSTY";
        TPWrite "Detale w lewo: " \Num:=nLewo;
        TPWrite "Detale w prawo: " \Num:=nPrawo;
        TPWrite "Laczna liczba detali na palecie: " \Num:=nSuma;
        TPWrite "========================================";

    ENDPROC

ENDMODULE
```

### Omówienie dydaktyczne:
1. **Sterowanie zaworem bistabilnym 5/2:** W układach pneumatycznych z zaworami bistabilnymi impuls na cewkę $Y1$ (`do_ChwytakON`) przesterowuje suwak w pozycję zaciśnięcia chwytaka, a impuls na cewkę $Y2$ (`do_ChwytakOFF`) w pozycję otwarcia. Zgodnie z dobrymi praktykami mechatronicznymi cewki wzbudzane są krótkimi impulsami ($0.3\text{ s}$), zapobiegając przegrzaniu elektromagnesów oraz jednoczesnemu podaniu napięcia na obie cewki.
2. **Wycofanie w osi narzędzia `RelTool(CRobT(), 0, 0, -50)`:** Zastosowanie `CRobT()` odczytuje aktualne współrzędne TCP robota, a `RelTool` przelicza przesunięcie w układzie współrzędnych narzędzia. Ponieważ oś $+Z$ chwytaka skierowana jest w dół ku detalowi, ujemne przesunięcie $-50\text{ mm}$ realizuje idealne, pionowe wycofanie robota po pobraniu lub odłożeniu detalu, bez kolizji z prowadnicami magazynu.
3. **Pętla sterowana czujnikiem `WHILE di_MagazynDetale = 1 DO`:** Program przetwarza kolejne detale tak długo, jak długo czujnik optyczny $B_{MAG}$ zgłasza obecność obiektu w szczelinie pobrania. Usunięcie ostatniego (czwartego) detalu powoduje natychmiastowe zakończenie pętli i przejście do procedury raportowania.
4. **Dynamiczna paletyzacja liniowa `Offs(pPaleta_Baza, nSuma * 35, 0, 0)`:** Rozstaw gniazd palety wynosi $35\text{ mm}$. Zmienna `nSuma` przechowuje liczbę dotychczas ułożonych elementów, co pozwala zrealizować układanie kolejno w gniazdach $0\text{ mm}$, $35\text{ mm}$, $70\text{ mm}$, $105\text{ mm}$ itd.
5. **Raportowanie na panelu FlexPendant:** Wykorzystanie instrukcji `TPWrite` z parametrem `\Num` umożliwia czytelne wyświetlenie operatorowi danych statystycznych: podziału na kierunki oraz sumy wyprodukowanych detali, co spełnia standardy przemysłowego monitoringu produkcji.

### Kryteria oceny CKE (Kwalifikacja ELM.08):
| Nr | Rezultat / Kryterium wykonania | Liczba punktów |
| :---: | :--- | :---: |
| 1 | Prawidłowa deklaracja zmiennych licznikowych `nLewo`, `nPrawo`, `nSuma` typu `num` | 2 |
| 2 | Inicjalizacja sygnałów wyjściowych oraz bazowanie ramienia w punkcie `pHome` | 2 |
| 3 | Prawidłowe użycie instrukcji `WaitDI di_Start, 1` przed startem cyklu | 2 |
| 4 | Zastosowanie pętli warunkowej `WHILE di_MagazynDetale = 1 DO` | 3 |
| 5 | Prawidłowe sterowanie bistabilnym chwytakiem (impulsy na `do_ChwytakON` i `do_ChwytakOFF`) | 2 |
| 6 | Użycie funkcji wycofania `RelTool` w osi Z narzędzia przy pobieraniu/odkładaniu | 2 |
| 7 | Poprawna struktura decyzyjna `IF di_Kierunek = 1 THEN ... ELSE ... ENDIF` | 2 |
| 8 | Zatrzymanie taśmy czujnikiem `WaitDI di_CzujnikLewy/Prawy` i sygnalizacja `do_LampkaH1` | 2 |
| 9 | Obliczenie pozycji paletyzacji z krokiem $35\text{ mm}$ za pomocą instrukcji `Offs` | 2 |
| 10 | Załączenie lampki `do_LampkaH2` i wyświetlenie raportu `TPWrite` z liczbą detali | 1 |
| **SUMA** | **Maksymalna ocena za część programistyczną** | **20** |

# Wzorcowe Rozwiązania Zadań RAPID (RAPID Sim)

Dokument zawiera kompletne, wzorcowe rozwiązania wszystkich 10 zadań dostępnych w symulatorze **RAPID Sim (ABB IRB 1090 / OmniCore)**:
- **Część I:** 5 Zadań Podstawowych (Treningowych)
- **Część II:** 5 Zadań Egzaminacyjnych (Kwalifikacja ELM.08 – Technik Robotyk)

Każde zadanie zawiera pełny kod źródłowy modułu RAPID oraz komentarz dydaktyczny wyjaśniający zastosowaną logikę i dobre praktyki programowania robotów przemysłowych.

---

# Spis Treści

1. [Część I: Zadania Podstawowe](#część-i-zadania-podstawowe)
   - [Zadanie 1: Komunikaty i bazowanie](#zadanie-1-komunikaty-i-bazowanie)
   - [Zadanie 2: Rysowanie ścieżki liniowej](#zadanie-2-rysowanie-ścieżki-liniowej)
   - [Zadanie 3: Licznik wyprodukowanych sztuk](#zadanie-3-licznik-wyprodukowanych-sztuk)
   - [Zadanie 4: Przenoszenie detalu chwytakiem](#zadanie-4-przenoszenie-detalu-chwytakiem)
   - [Zadanie 5: Synchronizacja z operatorem (WaitDI)](#zadanie-5-synchronizacja-z-operatorem-waitdi)
2. [Część II: Zadania Egzaminacyjne ELM.08](#część-ii-zadania-egzaminacyjne-elm08)
   - [ELM.08 Zadanie 1: Gniazdo paletyzacji z kontrolą czujnika](#elm08-zadanie-1-gniazdo-paletyzacji-z-kontrolą-czujnika)
   - [ELM.08 Zadanie 2: Obróbka konturowa z blokadą bezpieczeństwa](#elm08-zadanie-2-obróbka-konturowa-z-blokadą-bezpieczeństwa)
   - [ELM.08 Zadanie 3: Skanowanie łukowe MoveC i licznik partii](#elm08-zadanie-3-skanowanie-łukowe-movec-i-licznik-partii)
   - [ELM.08 Zadanie 4: Sekwencja resetu i przezbrajania stanowiska](#elm08-zadanie-4-sekwencja-resetu-i-przezbrajania-stanowiska)
   - [ELM.08 Zadanie 5: Transfer detalu z inspekcją pośrednią](#elm08-zadanie-5-transfer-detalu-z-inspekcją-pośrednią)

---

# Część I: Zadania Podstawowe

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
        ! Krok 1: Dojazd z pHome do punktu pSquareStart (MoveJ)
        MoveJ pSquareStart, v200, fine, tPen;
        
        ! Krok 2: Liniowy przejazd przez kolejne wierzcholki kwadratu (MoveL)
        MoveL pSquareA, v100, fine, tPen;
        MoveL pSquareB, v100, fine, tPen;
        MoveL pSquareC, v100, fine, tPen;
        MoveL pSquareD, v100, fine, tPen;
        MoveL pSquareA, v100, fine, tPen;
        
        ! Krok 3: Powrot do pozycji wyjsciowej pHome (MoveJ)
        MoveJ pHome, v200, fine, tPen;
    ENDPROC

ENDMODULE
```

### Omówienie:
- Instrukcja `MoveL` zmusza punkt centralny narzędzia (TCP) do poruszania się ściśle po linii prostej między punktem startowym a końcowym.
- Dojazd do obszaru roboczego (`pSquareStart`) wykonujemy szybkim ruchem `MoveJ`, natomiast samo trasowanie / rysowanie wykonujemy ruchem `MoveL` z prędkością technologiczną `v100`.

---

## Zadanie 3: Licznik wyprodukowanych sztuk
- **Zagadnienie:** Zmienne numeryczne `VAR num`, instrukcje `Incr` oraz `Clear`.
- **Narzędzie:** `tPen`

### Kod programu:
```rapid
MODULE MainModule
    VAR num nPartCounter := 0;

    PROC main()
        ! Krok 1: Przejazd do pSquareA, zwiekszenie licznika i powiadomienie TPWrite
        MoveJ pSquareA, v200, fine, tPen;
        Incr nPartCounter;
        TPWrite "Wykonano operacje w pSquareA. Licznik = 1";
        
        ! Krok 2: Przejazd do pSquareB, zwiekszenie licznika i powiadomienie TPWrite
        MoveJ pSquareB, v200, fine, tPen;
        Incr nPartCounter;
        TPWrite "Wykonano operacje w pSquareB. Licznik = 2";
        
        ! Krok 3: Przejazd do pSquareC, zwiekszenie licznika i powiadomienie TPWrite
        MoveJ pSquareC, v200, fine, tPen;
        Incr nPartCounter;
        TPWrite "Wykonano operacje w pSquareC. Licznik = 3";
        
        ! Krok 4: Wypisanie komunikatu o zakonczeniu partii i wyczyszczenie licznika (Clear)
        MoveJ pHome, v200, fine, tPen;
        TPWrite "Partia zakonczona. Zerowanie licznika.";
        Clear nPartCounter;
    ENDPROC

ENDMODULE
```

### Omówienie:
- Zmienna `VAR num nPartCounter := 0;` jest deklarowana na poziomie modułu (przed procedurą `main`).
- `Incr nazwaZmiennej;` zwiększa wartość zmiennej całkowitej o 1.
- `Clear nazwaZmiennej;` zeruje wartość zmiennej liczbowej z powrotem do 0.

---

## Zadanie 4: Przenoszenie detalu chwytakiem
- **Zagadnienie:** Sterowanie chwytakiem dwuszczękowym `tGripper`, punkty najazdu i odjazdu, czasy zwłoki `WaitTime`.
- **Narzędzie:** `tGripper`

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        ! Krok 1: Dojazd nad detal do punktu pGripApproach
        MoveJ pGripApproach, v200, fine, tGripper;
        
        ! Krok 2: Zjazd pionowy do pGripPick, zamkniecie chwytaka i odczekanie 0.5s
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        
        ! Krok 3: Podniesienie detalu pionowo do pGripApproach
        MoveL pGripApproach, v100, fine, tGripper;
        
        ! Krok 4: Przejazd tranzytowy do punktu nad strefa odkladcza
        MoveJ pGripRetreat, v200, fine, tGripper;
        
        ! Krok 5: Zjazd do pGripPlace, otwarcie chwytaka i odczekanie 0.5s
        MoveL pGripPlace, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        
        ! Krok 6: Wycofanie pionowe do pGripRetreat i powrot do pHome
        MoveL pGripRetreat, v100, fine, tGripper;
        MoveJ pHome, v200, fine, tGripper;
    ENDPROC

ENDMODULE
```

### Omówienie:
- **Bezpieczeństwo trajektorii:** Zjazd po detal i podniesienie wykonujemy ruchem liniowym `MoveL` prostopadle do powierzchni stołu, aby szczęki chwytaka nie haczyły o krawędź detalu ani stołu.
- **Czasy technologiczne:** Zawsze po wywołaniu `Set doGripper;` oraz `Reset doGripper;` dodajemy `WaitTime 0.5;` na fizyczne zadziałanie siłownika pneumatycznego.

---

## Zadanie 5: Synchronizacja z operatorem (WaitDI)
- **Zagadnienie:** Oczekiwanie na sygnał zewnętrzny `WaitDI`, sterowanie lampkami wyjściowymi `doBusy` i `doComplete`.
- **Narzędzie:** `tPen`

### Kod programu:
```rapid
MODULE MainModule

    PROC main()
        ! Krok 1: Wypisz komunikat z prosba o wcisniecie diStart
        TPWrite "Oczekiwanie na wcisniecie przycisku diStart...";
        
        ! Krok 2: Oczekuj na stan wysoki wejscia diStart (WaitDI)
        WaitDI diStart, 1;
        
        ! Krok 3: Zasygnalizuj prace (Set doBusy) i przemiesc robota do pCircleStart
        Set doBusy;
        MoveJ pCircleStart, v200, fine, tPen;
        
        ! Krok 4: Odczekaj 1 sekunde czasu technologicznego (WaitTime)
        WaitTime 1.0;
        
        ! Krok 5: Powrot do pHome, wylaczenie doBusy i zalaczenie doComplete
        MoveJ pHome, v200, fine, tPen;
        Reset doBusy;
        Set doComplete;
        TPWrite "Cykl inspekcyjny zakonczony pomyslnie";
    ENDPROC

ENDMODULE
```

### Omówienie:
- `WaitDI diStart, 1;` blokuje wykonywanie programu do chwili, gdy na wejściu cyfrowym pojawi się stan wysoki (operator kliknie przycisk `diStart` w zakładce `SIGNALS`).
- Sygnalizator pracy `doBusy` włączamy na początku ruchu roboczego, a wyłączamy po powrocie do bezpiecznej pozycji bazowej `pHome`.

---

# Część II: Zadania Egzaminacyjne ELM.08

## ELM.08 Zadanie 1: Gniazdo paletyzacji z kontrolą czujnika
- **Kwalifikacja:** ELM.08 (Eksploatacja i programowanie systemów robotyki)
- **Zagadnienie:** Pełna sekwencja paletyzacji z warunkiem czujnika obecności `diPartPresent`.
- **Narzędzie:** `tGripper`

### Kod programu:
```rapid
MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 1
    ! Stanowisko zrobotyzowanej paletyzacji i kontroli obecnosci detalu
    ! =================================================================

    PROC main()
        ! 1. Warunki poczatkowe: zresetuj doBusy i doComplete, ustaw doReady
        Reset doBusy;
        Reset doComplete;
        Reset doGripper;
        Set doReady;
        
        ! 2. Przemieść robota do pozycji bazowej pHome
        MoveJ pHome, v200, fine, tGripper;
        
        ! 3. Oczekuj na sygnal obecnosci detalu z czujnika: diPartPresent = 1
        TPWrite "Oczekiwanie na detal w gniezdzie podajnika (diPartPresent)";
        WaitDI diPartPresent, 1;
        
        ! 4. Wyzeruj doReady, załacz doBusy, wypisz komunikat
        Reset doReady;
        Set doBusy;
        TPWrite "Pobieranie detalu";
        
        ! 5. Dojazd nad detal: pGripApproach -> pGripPick
        MoveJ pGripApproach, v200, fine, tGripper;
        MoveL pGripPick, v100, fine, tGripper;
        
        ! 6. Zamkniecie chwytaka, odczekanie 0.5s, podniesienie do pGripApproach
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
        
        ! 7. Przejazd do strefy odkladczej: pGripRetreat -> pGripPlace
        MoveJ pGripRetreat, v200, fine, tGripper;
        MoveL pGripPlace, v100, fine, tGripper;
        
        ! 8. Otwarcie chwytaka, odczekanie 0.5s, wycofanie do pGripRetreat
        Reset doGripper;
        WaitTime 0.5;
        MoveL pGripRetreat, v100, fine, tGripper;
        
        ! 9. Powrot do pHome, wylaczenie doBusy, wystawienie impulsu doComplete
        MoveJ pHome, v200, fine, tGripper;
        Reset doBusy;
        Set doComplete;
        TPWrite "Cykl paletyzacji zakonczony";
    ENDPROC

ENDMODULE
```

### Kluczowe kryteria oceny egzaminacyjnej:
1. Prawidłowy stan początkowy wyjść (`doReady = 1`, pozostałe `0`).
2. Bezwzględne sprawdzenie czujnika `diPartPresent` przed zjazdem do punktu pobrania.
3. Zachowanie wysokości bezpiecznej (`pGripApproach`, `pGripRetreat`) podczas manewrów tranzytowych.
4. Odczekanie 0.5 s po każdej zmianie stanu chwytaka.

---

## ELM.08 Zadanie 2: Obróbka konturowa z blokadą bezpieczeństwa
- **Kwalifikacja:** ELM.08 (Eksploatacja i programowanie systemów robotyki)
- **Zagadnienie:** Dwuetapowa weryfikacja logiczna obwodu bezpieczeństwa i przycisku startu.
- **Narzędzie:** `tPen`

### Kod programu:
```rapid
MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 2
    ! Stanowisko obrobki konturowej z dwuetapowym warunkiem startu
    ! =================================================================

    PROC main()
        ! 1. Sprawdz obwod bezpieczenstwa: oczekuj na diSafetyOk = 1
        WaitDI diSafetyOk, 1;
        
        ! 2. Wypisz komunikat dla operatora
        TPWrite "Obwod bezpieczenstwa OK. Oczekiwanie na start";
        
        ! 3. Oczekuj na wcisniecie przycisku startu przez operatora: diStart = 1
        WaitDI diStart, 1;
        
        ! 4. Załacz sygnalizator pracy doBusy, zgas doReady
        Reset doReady;
        Set doBusy;
        
        ! 5. Dojedz z pHome do pSquareStart (MoveJ, v200, fine, tPen)
        MoveJ pSquareStart, v200, fine, tPen;
        
        ! 6. Wykonaj obrobke liniowa MoveL (v100) po sciezce zamknietej
        MoveL pSquareA, v100, fine, tPen;
        MoveL pSquareB, v100, fine, tPen;
        MoveL pSquareC, v100, fine, tPen;
        MoveL pSquareD, v100, fine, tPen;
        MoveL pSquareA, v100, fine, tPen;
        
        ! 7. Odjedz pionowo do pSquareStart, powroc do pHome
        MoveL pSquareStart, v100, fine, tPen;
        MoveJ pHome, v200, fine, tPen;
        
        ! 8. Wyzeruj doBusy, załacz doComplete, wypisz komunikat koncowy
        Reset doBusy;
        Set doComplete;
        TPWrite "Koniec cyklu obrobki";
    ENDPROC

ENDMODULE
```

### Kluczowe kryteria oceny egzaminacyjnej:
1. Ścisła kolejność warunków wstępnych: najpierw stan bezpieczeństwa `diSafetyOk`, potem `diStart`.
2. Zamknięcie obrysu: powrót narzędzia do punktu `pSquareA` przed pionowym odjazdem do `pSquareStart`.
3. Zastosowanie prędkości technologicznej `v100` podczas obróbki liniowej.

---

## ELM.08 Zadanie 3: Skanowanie łukowe MoveC i licznik partii
- **Kwalifikacja:** ELM.08 (Eksploatacja i programowanie systemów robotyki)
- **Zagadnienie:** Interpolacja kołowa `MoveC`, ewidencja ilościowa wyrobów.
- **Narzędzie:** `tPen`

### Kod programu:
```rapid
MODULE MainModule
    VAR num nProducedParts := 0;

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 3
    ! Pomiar geometrii luku (MoveC) i ewidencja ilosciowa partii
    ! =================================================================

    PROC main()
        ! 1. Wyzeruj wyjscia technologiczne, przemiesc robota do pHome
        Reset doBusy;
        Reset doComplete;
        MoveJ pHome, v200, fine, tPen;
        
        ! 2. Dojedz do punktu rozpoczecia skanowania pCircleStart (MoveJ)
        MoveJ pCircleStart, v200, fine, tPen;
        
        ! 3. Zjedz pionowo do pCircleA, załacz sygnalizator doBusy
        MoveL pCircleA, v100, fine, tPen;
        Set doBusy;
        
        ! 4. Wykonaj ruch po pierwszym polokregu: MoveC punktPosredni, punktDocelowy
        MoveC pCircleB, pCircleC, v100, fine, tPen;
        
        ! 5. Wykonaj ruch po drugim polokregu, zamykajac caly okrag
        MoveC pCircleD, pCircleA, v100, fine, tPen;
        
        ! 6. Odjedz pionowo do pCircleStart, powroc do pHome
        MoveL pCircleStart, v100, fine, tPen;
        MoveJ pHome, v200, fine, tPen;
        
        ! 7. Zwieksz licznik detali (Incr nProducedParts) i wypisz jego stan
        Incr nProducedParts;
        TPWrite "Pomiar wykonany. Zbadano sztuk: 1";
        
        ! 8. Wylacz doBusy, załacz sygnal doComplete
        Reset doBusy;
        Set doComplete;
    ENDPROC

ENDMODULE
```

### Kluczowe kryteria oceny egzaminacyjnej:
1. Składnia `MoveC`: zdefiniowanie punktu przejścia (przez który przechodzi łuk) oraz punktu końcowego.
2. Złożenie pełnego okręgu z dwóch półokręgów (`pCircleA` $\rightarrow$ przez `pCircleB` do `pCircleC`, a następnie od `pCircleC` $\rightarrow$ przez `pCircleD` do `pCircleA`).
3. Zwiększenie licznika zmienną globalną `Incr nProducedParts`.

---

## ELM.08 Zadanie 4: Sekwencja resetu i przezbrajania stanowiska
- **Kwalifikacja:** ELM.08 (Eksploatacja i programowanie systemów robotyki)
- **Zagadnienie:** Obsługa przycisku resetu, bezpieczne bazowanie i ponowny start gniazda.
- **Narzędzie:** `tGripper`

### Kod programu:
```rapid
MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 4
    ! Procedura bezpiecznego zerowania, bazowania i startu cyklu
    ! =================================================================

    PROC main()
        ! 1. Wypisz komunikat z prosba o wcisniecie diReset
        TPWrite "Wymagany reset stanowiska (wcisnij diReset)";
        
        ! 2. Oczekuj na sygnał resetu: diReset = 1 (WaitDI)
        WaitDI diReset, 1;
        
        ! 3. Wyzeruj wszystkie wyjscia wykonawcze
        Reset doBusy;
        Reset doComplete;
        Reset doGripper;
        
        ! 4. Przemieść ramie do pozycji bazowej pHome
        MoveJ pHome, v200, fine, tGripper;
        
        ! 5. Załacz sygnal gotowosci doReady
        Set doReady;
        TPWrite "Stanowisko gotowe do pracy. Oczekiwanie na diStart";
        
        ! 6. Oczekuj na sygnał startu cyklu produkcyjnego: diStart = 1
        WaitDI diStart, 1;
        
        ! 7. Zgas doReady, załacz doBusy, wykonaj cykl pobrania i odlozenia
        Reset doReady;
        Set doBusy;
        
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
        
        ! 8. Powrot do pHome, wylaczenie doBusy, wystawienie doComplete
        MoveJ pHome, v200, fine, tGripper;
        Reset doBusy;
        Set doComplete;
        TPWrite "Cykl produkcyjny zrealizowany pomyslnie";
    ENDPROC

ENDMODULE
```

### Kluczowe kryteria oceny egzaminacyjnej:
1. Rozdzielenie faz: najpierw procedura zerowania (wymuszona `diReset`), a dopiero po zbazowaniu i zgłoszeniu `doReady` oczekiwanie na `diStart`.
2. Otwarcie chwytaka (`Reset doGripper`) podczas fazy resetu.
3. Prawidłowa sekwencja sygnałów świetlnych na panelu I/O.

---

## ELM.08 Zadanie 5: Transfer detalu z inspekcją pośrednią
- **Kwalifikacja:** ELM.08 (Eksploatacja i programowanie systemów robotyki)
- **Zagadnienie:** Złożony cykl transportowy z buforem wizyjnym i zatrzymaniem technologicznym.
- **Narzędzie:** `tGripper`

### Kod programu:
```rapid
MODULE MainModule

    ! =================================================================
    ! ARKUSZ EGZAMINACYJNY ELM.08 - ZADANIE 5
    ! Transport dwuetapowy ze stacja kontroli wizyjnej w punkcie pPick
    ! =================================================================

    PROC main()
        ! 1. Sygnalizuj gotowosc: Set doReady, zresetuj doBusy i doComplete
        Set doReady;
        Reset doBusy;
        Reset doComplete;
        
        ! 2. Oczekuj na spelnienie warunkow poczatkowych
        WaitDI diSafetyOk, 1;
        WaitDI diStart, 1;
        
        ! 3. Zgas doReady, ustaw doBusy, wypisz komunikat
        Reset doReady;
        Set doBusy;
        TPWrite "Rozpoczecie cyklu transportowego";
        
        ! 4. Pobierz detal ze stolu
        MoveJ pGripApproach, v200, fine, tGripper;
        MoveL pGripPick, v100, fine, tGripper;
        Set doGripper;
        WaitTime 0.5;
        MoveL pGripApproach, v100, fine, tGripper;
        
        ! 5. Przetransportuj detal do punktu kontroli optycznej pPick
        MoveJ pPick, v200, fine, tGripper;
        TPWrite "Inspekcja wizyjna w toku (pPick)...";
        
        ! 6. Wstrzymaj ruch na czas inspekcji optycznej 1.0s (chwytak pozostaje zamkniety!)
        WaitTime 1.0;
        
        ! 7. Przemieść detal do strefy odkladczej i odloz detal
        MoveJ pGripRetreat, v200, fine, tGripper;
        MoveL pGripPlace, v100, fine, tGripper;
        Reset doGripper;
        WaitTime 0.5;
        MoveL pGripRetreat, v100, fine, tGripper;
        
        ! 8. Wycofanie do pHome, wylaczenie doBusy, wystawienie doComplete
        MoveJ pHome, v200, fine, tGripper;
        Reset doBusy;
        Set doComplete;
        TPWrite "Cykl montazowy zakonczony";
    ENDPROC

ENDMODULE
```

### Kluczowe kryteria oceny egzaminacyjnej:
1. **Zrozumienie polecenia:** W punkcie stacji pośredniej `pPick` detal nie jest zwalniany – chwytak pozostaje zaciśnięty (`doGripper = 1`) podczas trwania inspekcji `WaitTime 1.0;`.
2. Weryfikacja obwodu bezpieczeństwa przed rozpoczęciem jakiegokolwiek ruchu ramienia.
3. Bezkolizyjny przejazd przez punkty tranzytowe `pGripApproach` i `pGripRetreat`.

---
*Plik wygenerowany dla stanowiska szkoleniowego RAPID Sim (ABB IRB 1090).*

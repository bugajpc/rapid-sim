Na podstawie dostarczonego podręcznika, poniżej znajduje się zestawienie wszystkich instrukcji i przykładów związanych z programowaniem w języku RAPID. Przykłady zostały podzielone na kategorie wraz z opisem najważniejszych elementów.

### 1. Instrukcje ruchu (Poruszanie robotem)
Służą do fizycznego przemieszczania robota (TCP - punktu środkowego narzędzia) do określonych pozycji (robtarget).

*   **MoveJ** (Ruch osiowy / Joint) - Robot przemieszcza się najszybszą ścieżką z punktu A do punktu B.
*   **MoveL** (Ruch liniowy / Linear) - Robot przemieszcza się po linii prostej.
*   **MoveC** (Ruch po okręgu / Circular) - Robot porusza się po łuku określonym przez punkt pośredni i punkt docelowy.

**Budowa instrukcji ruchu:**
```rapid
MoveJ pTarget_10, v1000, z50, tPen;
MoveL pTarget_20, v1000, z50, tPen;
```
**Najważniejsze argumenty:**
*   **Typ ruchu:** Określa charakter ruchu (np. `MoveJ`, `MoveL`).
*   **Pozycja (robtarget):** Miejsce docelowe, np. `pTarget_10` (pozycja zdefiniowana) lub wpisana bezpośrednio np. `[,,...]`.
*   **Prędkość (speeddata):** Prędkość przemieszczania TCP, np. `v1000` (1000 mm/s).
*   **Strefa (zonedata):** Dokładność dojazdu do punktu. `z50` oznacza, że robot zacznie zaokrąglać ruch 50 mm przed celem. Użycie strefy `fine` oznacza dokładny punkt zatrzymania.
*   **Narzędzie (tooldata):** Aktywne narzędzie używane do ruchu, np. `tPen`.
*   **Obiekt roboczy (wobjdata):** Opcjonalny argument podawany na końcu, np. `\WObj:=wobj1`.

**Przykład ruchu po okręgu (MoveC):**
```rapid
PROC Path_Circle()
    MoveJ pDrawCircle_10, v200, fine, tPen;
    MoveL pDrawCircle_20, v200, fine, tPen;
    MoveC pDrawCircle_30, pDrawCircle_40, v200, fine, tPen;
    MoveC pDrawCircle_50, pDrawCircle_20, v200, fine, tPen;
ENDPROC
```

---

### 2. Deklaracje i typy danych
Dane to informacje przechowywane w pamięci kontrolera. 

**Kategorie deklaracji:**
*   **CONST (Dane stałe):** Nie mogą być zmieniane przez program. Sposobem na ich zmianę jest edycja deklaracji.
*   **PERS (Dane trwałe):** Mogą być zmieniane przez program, a ich wartość nie resetuje się po restarcie (np. liczniki sztuk).
*   **VAR (Dane zmienne):** Zmieniane przez program, ale powracają do pierwotnie zadeklarowanej wartości w przypadku zresetowania wskaźnika programu do `main`.

**Przykłady zadeklarowanych danych:**
```rapid
CONST robtarget pMyRobtarget:=[,,,[9E9,9E9,9E9,9E9,9E9,9E9]];
PERS num nProducedParts:=0;
VAR string sCurrentPartType:="";
```

---

### 3. Struktura programu i procedury
Kod RAPID zamknięty jest w modułach (`MODULE`), a same instrukcje muszą znajdować się wewnątrz procedur (`PROC`). 

**Przykład struktury i wywoływania procedur:**
```rapid
MODULE MainModule
  CONST num ExampleVariable:=0;

  PROC main()
    ! Procedura główna, program zaczyna się tutaj
    DrawCircle; ! Wywołanie innej procedury
  ENDPROC

  PROC DrawCircle()
    ! Instrukcje do narysowania okręgu
    MoveJ pDrawCircle_10,v1000,z50,tPen\WObj:=wPaper;
  ENDPROC
ENDMODULE
```
*(Uwaga: w kodzie RAPID znakiem komentarza jest wykrzyknik `!`).*

---

### 4. Instrukcje wyboru (Warunkowe)
Zarządzają logiką programu w zależności od wartości zmiennych.

**Instrukcja IF / ELSEIF / ELSE:**
Sprawdza warunki. Wykonywany jest ten blok instrukcji, którego warunek zostanie spełniony jako pierwszy.
```rapid
IF nProducedParts > 5 THEN
    GoHome;
ELSEIF nAvailableMaterial < 1 THEN
    RefillMaterial;
ELSE
    ProducePart;
ENDIF
```

**Kompaktowy IF:**
Służy do wykonania tylko jednej instrukcji bez użycia struktury z `ENDIF`.
```rapid
IF DOutput(do7)=1 Reset do5;
```

**Instrukcja TEST:**
Używana, gdy chcemy wykonać różne działania w zależności od jednej konkretnej wartości.
```rapid
TEST sArticleNr
  CASE "701":
      CreateArticle701;
  CASE "850":
      CreateArticle850;
  CASE "L25","R25":
      CreateArticleL25;
      CreateArticleR25;
  DEFAULT:
      TPWrite "nArticleNr is not 701, 850, L25 or R25";
ENDTEST
```

---

### 5. Instrukcje zapętlania
Powtarzają blok kodu przez określoną liczbę razy lub tak długo, jak spełniony jest warunek.

**Pętla WHILE:**
Wykonuje się, dopóki zdefiniowany warunek (np. wartość licznika) jest prawdziwy.
```rapid
VAR num nCount:=0;
PROC main()
    WHILE nCount < 10 DO
        TPWrite "Producing part...";
        ProducePart;
        TPErase;
        GoHome;
    ENDWHILE
ENDPROC
```

**Pętla FOR:**
Wykonuje blok kodu określoną liczbę razy, inkrementując zmienną lokalną (tutaj `i`).
```rapid
FOR i FROM 1 TO nPartsToProduce DO
    ProducePart;
    Incr nCountParts;
ENDFOR
```

---

### 6. Instrukcje wejścia / wyjścia (I/O) i manipulacja danymi
Instrukcje te sterują przepływem prądu z/do kontrolera (np. załączanie chwytaka) oraz modyfikują zmienne.

**Sygnały I/O:**
*   **Set:** Ustawia sygnał wyjścia cyfrowego na logiczne 1.
*   **Reset:** Resetuje sygnał wyjścia cyfrowego na logiczne 0.
*   **WaitDI:** Zatrzymuje program, dopóki wybrane wejście cyfrowe (Digital Input) nie osiągnie żądanego stanu.
```rapid
Set do5;
Reset do5;
WaitDI diStart, 1;
```

**Manipulacja zmiennymi / Inne:**
*   **Incr:** Zwiększa wartość zmiennej numerycznej o 1.
*   **Clear:** Zeruje zmienną (ustawia na 0).
*   **WaitTime:** Usypia program na zdefiniowany czas (w sekundach).
*   **Stop:** Zatrzymuje wykonywanie programu.
*   **:= (Przypisanie):** Przypisuje wartość po prawej stronie znaku do zmiennej po lewej stronie.

```rapid
Incr nMyNum;
Clear nPartCount;
WaitTime 3;
nCycleTime := ClkRead(ckCycleTimer);
```

---

### 7. Komunikacja z operatorem
Instrukcje pozwalające na wyświetlanie komunikatów na ekranie FlexPendant.

*   **TPWrite:** Wypisuje komunikat w logu operatora.
*   **TPErase:** Czyści okno komunikatów.
*   **UIMsgWrite:** Wyświetla tzw. oknodialogowe operatora (nie przerywa programu).
*   **UIMsgWriteAbort:** Anuluje wysłany wcześniej komunikat `UIMsgWrite`.

```rapid
TPWrite "Message 1";
TPErase;
UIMsgWrite "My Header", "Printed with UIMsgWrite...";
```

---

### 8. Wybrane Funkcje RAPID
Funkcje, w przeciwieństwie do standardowych instrukcji, **zwracają wartość** i muszą zostać poprawnie użyte (np. przypisane do zmiennej lub użyte jako parametr).

*   **ValToStr:** Konwertuje wartość z dowolnego typu danych na ciąg znaków (`string`).
```rapid
VAR pos p:=;
VAR string str;
str:= ValToStr(p);
```
*   **ClkRead:** Odczytuje wartość ze zmiennej zegara (`clock`). Do obsługi zegara służą także instrukcje **ClkStart**, **ClkStop** i **ClkReset**.
```rapid
ClkReset ckCycleTimer;
ClkStart ckCycleTimer;
! ... kod procesu ...
nCycleTime := ClkRead(ckCycleTimer);
```
*   **Offs, RelTool, CRobT():** Funkcje matematyczne i pozycjonujące, których składni plik tylko zdawkowo wymienia w celu ostrzeżenia o sposobie ich użycia jako argumentów zwracających wartość, nie stanowiących samych w sobie pełnych instrukcji linii kodu. (Np. `Offs(pMyRobtarget,0,0,100);` wpisane samoistnie jest niepoprawne).
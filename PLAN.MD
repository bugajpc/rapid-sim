# RAPID Sim — Complete Architectural Blueprint & Replication Plan

> **Target Audience**: AI Agents and Autonomous Coding Systems.  
> **Goal**: Provide an exhaustive, turnkey specification to recreate the **RAPID Sim** web application (ABB IRB 1090 / OmniCore robot simulator and vocational education platform) in a single pass without missing any feature, formula, data structure, or UI component.

---

## 1. Project Overview & Architecture

**RAPID Sim** is a zero-backend, client-side Single Page Application (SPA) designed for vocational training (ELM.08 exam standard), technical colleges, and automation engineers. It provides a real-time 3D kinematic simulation of an **ABB IRB 1090** industrial robot, a Monaco code editor for the **ABB RAPID** programming language with custom syntax highlighting and multi-procedure compilation, an interactive digital I/O board, pick-and-place workpiece physics, a CNC training table, and a built-in educational curriculum (6 Lessons + 10 Practical Tasks).

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ RAPID Sim Architectural Overview (Zero-Backend Client-Side SPA)                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Top Navigation Header: Brand, Undo/Redo, Tool Switcher, Status Pill, Controls  │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
│   ┌───────────────┬───────────────────────────────┬─┬──────────────────────────────┐   │
│   │ Sidebar (212) │ Monaco Code Editor (50%)      │ │ 3D Simulation Panel (50%)    │   │
│   │ - Projects    │ - Custom RAPID Monarch tokens │S│ - Three.js / React Three Fiber│  │
│   │ - Lessons (6) │ - Multi-procedure syntax      │P│ - ABB IRB 1090 3D Mesh Model │   │
│   │ - Tasks (10)  │ - Real-time line highlight    │L│ - Analytical IK Solver       │   │
│   │ - Saved Local │ - Diagnostic error markers    │I│ - Pen & Gripper End-Effectors│   │
│   │               │ - 2-Pass AST Compiler         │T│ - Pick-and-Place Workpieces  │   │
│   │               │                               │ │ - CNC Training Table         │   │
│   ├───────────────┴───────────────────────────────┼─┴──────────────────────────────┤   │
│   │ Resizable Bottom Dock (Console Output Log + Interactive Digital I/O Board)     │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack & Dependencies
- **Framework**: React 18 (`react`, `react-dom`) + TypeScript 5
- **Build Tool**: Vite 6 (`@vitejs/plugin-react`)
- **Code Editor**: `@monaco-editor/react` (Monaco Editor)
- **3D Engine**: Three.js (`three`), `@react-three/fiber`, `@react-three/drei`
- **State Management**: React `useState` / `useRef` + `zustand`
- **Deployment**: Static build (`dist/`), Nginx on Alpine, Docker & Docker Compose

---

## 2. Directory Structure & Root Files

```
rapid-sim/
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── solutions.md
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── RobotScene.tsx
│   ├── rapid.ts
│   ├── robotConfig.ts
│   ├── motion.ts
│   └── styles.css
```

### `package.json`
```json
{
  "name": "rapid-sim",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@monaco-editor/react": "^4.7.0",
    "@react-three/drei": "^9.122.0",
    "@react-three/fiber": "^8.18.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "three": "^0.173.0",
    "zustand": "^5.0.3"
  },
  "devDependencies": {
    "@types/react": "^18.3.18",
    "@types/react-dom": "^18.3.5",
    "@types/three": "^0.173.0",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.3",
    "vite": "^6.1.0"
  }
}
```

### `vite.config.ts`
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0" },
});
```

### `Dockerfile` & `docker-compose.yml`
```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```
```yaml
services:
  rapid-sim:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

### `nginx.conf`
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 3. Robot Kinematics & Geometric Models (`robotConfig.ts` & `motion.ts`)

### Robot Dimensions & Kinematic Parameters
The model reflects the real-world ABB IRB 1090 industrial robot arm with educational proportions (all dimensions in millimetres):

- $H_{\text{shoulder}} = 350\text{ mm}$ (Axis 2 shoulder pivot above base)
- $L_{\text{upperArm}} = 360\text{ mm}$ (Axis 2 to Axis 3 link)
- $L_{\text{forearm}} = 280\text{ mm}$ (Axis 3 to Axis 4 wrist)
- $L_{\text{wristAndTool}} = 150\text{ mm}$ (Wrist center to TCP endpoint)

Reach Envelopes:
- $R_{\text{min}} = |L_{\text{upperArm}} - L_{\text{forearm}}| + L_{\text{wristAndTool}} = 80 + 150 = 230\text{ mm}$
- $R_{\text{max}} = L_{\text{upperArm}} + L_{\text{forearm}} + L_{\text{wristAndTool}} = 360 + 280 + 150 = 790\text{ mm}$
- $R_{\text{comfortableMin}} = 260\text{ mm}, \quad R_{\text{comfortableMax}} = 740\text{ mm}$

### Analytical General Inverse Kinematics with Tool Pitch Angle $\alpha$
To position the Tool Center Point at $(x, y, z)$ with a commanded tool pitch angle $\alpha$ (e.g. $\alpha = -90^\circ$ for vertical-down, $-45^\circ$ tilted, $0^\circ$ horizontal):

1. **Base Yaw Angle (Axis 1)**:
   $$\theta_1 = \text{atan2}(y, x)$$

2. **Wrist Center Coordinates**:
   $$h_{\text{tcp}} = \sqrt{x^2 + y^2}, \quad z_{\text{tcp}} = z$$
   $$h_{\text{wrist}} = h_{\text{tcp}} - L_{\text{wristAndTool}} \cdot \cos(\alpha)$$
   $$z_{\text{wrist}} = z_{\text{tcp}} - L_{\text{wristAndTool}} \cdot \sin(\alpha)$$

3. **Two-Link Planar Arm Solution**:
   $$dx = h_{\text{wrist}}, \quad dy = z_{\text{wrist}} - H_{\text{shoulder}}$$
   $$D = \sqrt{dx^2 + dy^2}$$
   
   If $D > L_1 + L_2$ or $D < |L_1 - L_2|$ (unreachable target under pitch $\alpha$), the solver falls back smoothly to radial tool orientation.

4. **Elbow and Shoulder Angles (Industrial Elbow-Up Posture)**:
   $$\cos(\beta) = \frac{L_1^2 + L_2^2 - D^2}{2 L_1 L_2} \implies \beta = \arccos(\text{clamp}(\cos(\beta), -1, 1))$$
   $$\theta_{\text{elbow}} = \pi - \beta$$
   $$\gamma = \text{atan2}(dy, dx), \quad \cos(\phi) = \frac{L_1^2 + D^2 - L_2^2}{2 L_1 D}$$
   $$\theta_{\text{shoulder}} = \gamma + \arccos(\text{clamp}(\cos(\phi), -1, 1))$$
   $$\theta_{\text{wrist}} = \alpha - (\theta_{\text{shoulder}} - \theta_{\text{elbow}})$$

### Circular Path Interpolation (`motion.ts`)
The `moveCPosition(start, via, end, ratio)` function calculates the unique circle passing through 3D points $\mathbf{A}, \mathbf{B}, \mathbf{C}$:
1. Compute normal: $\mathbf{n} = (\mathbf{B} - \mathbf{A}) \times (\mathbf{C} - \mathbf{A})$. If $\|\mathbf{n}\|^2 < 10^{-4}$, points are collinear; fall back to linear lerp.
2. Circumcenter $\mathbf{O} = \mathbf{A} + \frac{\|\mathbf{C}-\mathbf{A}\|^2 ((\mathbf{B}-\mathbf{A}) \times \mathbf{n}) + \|\mathbf{B}-\mathbf{A}\|^2 (\mathbf{n} \times (\mathbf{C}-\mathbf{A}))}{2 \|\mathbf{n}\|^2}$.
3. Project angular positions $\theta_{\text{via}}$ and $\theta_{\text{end}}$, compute angular sweep $\Delta \theta$, and interpolate:
   $$\mathbf{P}(t) = \mathbf{O} + \cos(t \cdot \Delta \theta) \mathbf{u} + \sin(t \cdot \Delta \theta) (\hat{\mathbf{n}} \times \mathbf{u}), \quad \mathbf{u} = \mathbf{A} - \mathbf{O}$$

---

## 4. RAPID Compiler & Multi-Procedure Engine (`rapid.ts`)

The compiler implements a 2-pass recursive procedure compiler and tokenizer for ABB RAPID code.

### Supported Language Elements
1. **Module Structure**: `MODULE name ... ENDMODULE`
2. **Subroutines / Procedures**:
   - Declaration: `PROC name() ... ENDPROC` or `PROC name ... ENDPROC`
   - Invocation: `name;` or `name();`
   - Cycle & Recursion detection: Detects `main -> procA -> procB -> procA` and halts with descriptive diagnostic `Wykryto zapętlenie wywołań procedur (rekurencja): ...`. Max call stack depth = 50.
3. **Variables & Persistence**:
   - `VAR num count := 0;`
   - `PERS robtarget pCustom := [...];`
   - `CONST num maxParts := 10;`
4. **Motion Commands**:
   - `MoveJ target, speed, zone, tool;` (Joint rapid interpolation)
   - `MoveL target, speed, zone, tool;` (Linear interpolation)
   - `MoveC viaTarget, endTarget, speed, zone, tool;` (Circular arc interpolation)
5. **Digital I/O Instructions**:
   - `Set doSignal;` / `SetDO doSignal, 1;`
   - `Reset doSignal;` / `ResetDO doSignal;`
   - `WaitDI diSignal, 1;` (Halts simulation until input is toggled by user)
6. **Program Flow & Time**:
   - `WaitTime seconds;`
   - `Incr variable;` / `Clear variable;`
   - `Stop;` (Halts program with status Paused)
   - `TPWrite "Message string";` (Logs to console)
7. **Control Structures**:
   - `IF condition THEN ... [ELSE ...] ENDIF`
   - `WHILE condition DO ... ENDWHILE`
   - `FOR i FROM 1 TO N DO ... ENDFOR`

### Command AST Types
```ts
export type MoveCommand = {
  type: "move";
  kind: "MoveJ" | "MoveL" | "MoveC";
  target: string;
  via?: string;
  speed?: string;
  zone?: string;
  tool?: string;
  line: number;
};
export type OutputCommand = { type: "output"; signal: string; value: boolean; line: number };
export type WaitInputCommand = { type: "waitInput"; signal: string; value: boolean; line: number };
export type WaitTimeCommand = { type: "wait"; seconds: number; line: number };
export type TPWriteCommand = { type: "log"; message: string; line: number };
export type IncrCommand = { type: "increment"; variable: string; line: number };
export type ClearCommand = { type: "clear"; variable: string; line: number };
export type StopCommand = { type: "stop"; line: number };

export type Command =
  | MoveCommand
  | OutputCommand
  | WaitInputCommand
  | WaitTimeCommand
  | TPWriteCommand
  | IncrCommand
  | ClearCommand
  | StopCommand;
```

---

## 5. 3D Scene Visualization Engine (`RobotScene.tsx`)

### ABB IRB 1090 Authentic Visual Model
- **Materials & Palette**:
  - ABB Light Gray (`#e1e6ec`, roughness: 0.35, metalness: 0.15) for main cast links.
  - Dark Graphite (`#1e2428`, roughness: 0.45, metalness: 0.8) for motor hubs, risers, base trims.
  - Machined Stainless Steel (`#8ea0ad`, roughness: 0.2, metalness: 0.9) for flange rings, joint bolts, anchor plates.
- **Pedestal Base**:
  - Steel mounting base plate ($340\times 340\times 24\text{ mm}$) at $Y = 0$, with 4 anchor bolts and bevelled collar ($Y = 24\text{--}80\text{ mm}$).
  - Rotating turntable (Axis 1) at $Y = 80\text{--}160\text{ mm}$.
- **Axis 2 Shoulder Joint**:
  - Shoulder column ($Y = 160\text{--}350\text{ mm}$).
  - Solid spherical knuckle housing (`sphereGeometry args={[0.062, 32, 24]}`) at $Y = 350\text{ mm}$ rotation center.
  - Inner spherical cap ($r = 58\text{ mm}$) on upper arm link to eliminate hollow gaps during rotation.
  - Symmetrical servo hub medallions at $Z = \pm 62\text{ mm}$.
- **Slender Upper Arm & Forearm**:
  - Upper arm: $68\times 76\text{ mm}$ cross section, $360\text{ mm}$ length.
  - Forearm: $56\times 62\text{ mm}$ cross section, $280\text{ mm}$ length.
- **End-Effectors**:
  - **Pen Tool (`tPen`)**: Stainless steel mount plate ($48\times 48\times 8\text{ mm}$), cylindrical barrel ($\varnothing 14\text{ mm}$), cone nozzle and brass drawing nib.
  - **ABB Parallel Gripper (`tGripper`)**: Graphite actuator body ($52\times 48\times 60\text{ mm}$), stainless steel guide rails, dual parallel sliding jaws with polyurethane grip pads that animate smoothly when `gripperClosed` changes.

### CNC Training Table & Workpiece Blocks
- **Training Table (`TrainingTable`)**:
  - Dimensions: $680\text{ mm}$ (width) $\times 400\text{ mm}$ (depth) $\times 200\text{ mm}$ (top height), $20\text{ mm}$ plate thickness.
  - $4\times 7$ grid of CNC-bored fixture holes ($\varnothing 28\text{ mm}$).
  - 4 heavy-duty steel square legs with levelling foot plates.
  - Interactive repositioning with `TransformControls` and collision boundary clamping.
- **Workpiece Blocks (`Workpiece`)**:
  - Dimensions: $50\times 50\times 50\text{ mm}$ aluminum-styled cubes with chamfered top handles.
  - Multi-block management: Add/Remove blocks via UI.
  - Dynamic collision detection: Block rests on tabletop ($Z = 235\text{ mm}$) when positioned over the table, or on floor ($Z = 35\text{ mm}$) otherwise.
  - Pick-and-Place snapping: If gripper closes within $70\text{ mm}$ of block, the block latches to the TCP and moves with the robot until `Reset doGripper`.

### Target Markers & TCP Indicator
- **Target Points (`Marker`)**:
  - Inactive: Proportional gray spheres (`#5d718a`, $30\text{ mm}$ diameter / $15\text{ mm}$ radius) with billboard labels (`#a7b9c5`).
  - Active / Selected: Amber spheres (`#f9b33d`, $36\text{ mm}$ diameter) with `TransformControls` gizmos for 3D repositioning.
  - Deselection: Clicking anywhere in empty space or the floor grid triggers `onClearSelection`, deselecting all targets, TCP, blocks, and tables.
  - Right-Click Context Menu: Shows point name, coordinates, "Usuń punkt" (Remove point) button, and "Anuluj" button, with outside click and Escape key dismissal.
- **TCP Endpoint**:
  - Precision glowing tip ($12\text{--}18\text{ mm}$ diameter) with discrete activity ring when in manual jog mode.

---

## 6. Educational Curriculum & Built-In Content

### 6 Built-In Lessons (`examples`)
1. **Rysowanie kwadratu**: Basic MoveJ approach and MoveL continuous linear path forming a square with constant speed.
2. **Rysowanie okręgu (MoveC)**: Circular arc interpolation with via-points and complete circles.
3. **Obsługa wejść/wyjść**: Digital I/O synchronization (`Set doReady`, `WaitDI diStart, 1`).
4. **Licznik części**: RAPID variables (`VAR num nProducedParts`), `Incr`, and operator messages.
5. **Pick and place chwytakiem**: Full industrial handling cycle with approach, pick, lift, transfer, place, retreat, and workpiece holding.
6. **Podprogramy i procedury**: Modular architecture with sub-procedures `PobierzDetal()`, `OdlozDetal()`, called sequentially from `main()`.

### 10 Practical Student Tasks (`tasks`)
- **5 Zadań Podstawowych**:
  1. *Komunikaty i bazowanie* (TPWrite, MoveJ pHome)
  2. *Ścieżka prostoliniowa konturu* (MoveL continuous square path)
  3. *Synchronizacja z czujnikiem podajnika* (WaitDI diPartPresent, 1)
  4. *Licznik zrealizowanych detali* (VAR num, Incr, TPWrite)
  5. *Procedura odkładania detalu* (PROC OdlozDetal, main)
- **5 Zadań Egzaminacyjnych ELM.08**:
  6. *ELM.08 Zadanie 1: Paletyzacja jednorzędowa 3 detali* (Array math / loop indexing)
  7. *ELM.08 Zadanie 2: Spawanie ściegiem przerywanym z sygnalizacją* (MoveL + digital output arc control)
  8. *ELM.08 Zadanie 3: Kontrola jakości i sortowanie dwuklasowe* (IF/ELSE branching based on diDefect)
  9. *ELM.08 Zadanie 4: Frezowanie łuku z punktem pośrednim (MoveC)* (Circular arc interpolation)
  10. *ELM.08 Zadanie 5: Kompletna stacja Pick & Place z obsługą błędów* (Production cell simulation with cycle counter)

*(Full verified model solutions for all 10 tasks are preserved in `solutions.md`)*.

---

## 7. Application UI & Layout Specification (`App.tsx` & `styles.css`)

### Main Grid Layout (50% / 50% Equal Split on Initial Load)
```css
main {
  display: grid;
  grid-template-rows: 52px minmax(0, 1fr) 6px 235px;
  height: 100vh;
  width: 100vw;
  background: #14171a;
  color: #e2e8eb;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
}

.workspace {
  display: grid;
  grid-template-columns: var(--sidebar-width) 6px minmax(300px, 1fr) 6px var(--sim-width);
}
```

- **Initial Load Split**:
  $$\text{simulationWidth} = \max\left(320, \left\lfloor\frac{\text{window.innerWidth} - 250\text{ (sidebar)} - 12\text{ (splitters)}}{2}\right\rfloor\right)$$
- **Draggable Splitters**:
  - Vertical splitter between Left Sidebar (Lessons & Tasks) and Editor (`.sidebar-resize-handle`).
  - Vertical splitter between Editor and 3D Simulation scene (`.resize-handle`).
  - Horizontal splitter between Workspace and Bottom Dock (`.bottom-resize-handle`).
  - Monaco editor dynamically triggers `editor.layout()` on window resize and splitter drag.

### Header Bar (52px)
- **Brand**: Gold badge `R` (`#edaa3a`), "RAPID Sim", subtitle "ABB IRB 1090 · OmniCore learning simulator".
- **Undo / Redo**: `↺ Undo` (`Cmd+Z`/`Ctrl+Z`), `↻ Redo` (`Cmd+Shift+Z`/`Ctrl+Y`) with deep `SceneSnapshot` history stack.
- **Tool Switcher**: Segmented toggle `[ Pen | Gripper ]`.
- **Status Badge**: Ready (gray), Running (green `#1c3a27`), Waiting for DI (amber `#473717`), Paused (amber), Error (red `#482223`).
- **Execution Buttons**: `Run` (primary gold `#e9a932`), `Pause`, `Reset`.

### Simulation Header Actions
- `[ + Punkt przy TCP ]`: Opens dialog to create new `robtarget` at current TCP coordinates.
- `[ ⬇ Pion ]`, `[ ↘ 45° ]`, `[ ➡ Poziom ]`: Sets commanded tool pitch angle $\alpha \in \{-90^\circ, -45^\circ, 0^\circ\}$.
- `[ ▦ Stół ]`: Toggles CNC training table in the workspace.
- `[ ➕ Blok ]`: Adds new movable workpiece cube (in Gripper mode).

### Bottom Dock
- **Console (Left)**: Real-time execution logs, `TPWrite` outputs, and error diagnostics formatted in red (`.error-text`).
- **Signals Board (Right)**:
  - Digital Inputs: `diStart`, `diPartPresent`, `diQualityOK`, `diSafetyGate`, `diFeederEmpty`.
  - Digital Outputs: `doGripper`, `doWeldOn`, `doCycleCompleted`, `doStationReady`, `doAlarm`.
  - Waiting Indicator: Active `WAITING: diSignal` banner when execution is paused by `WaitDI`.

---

## 8. Step-by-Step Implementation Guide for AI Agents

1. **Scaffold Project**:
   ```bash
   npm create vite@latest rapid-sim -- --template react-ts
   cd rapid-sim
   npm install @monaco-editor/react three @react-three/fiber @react-three/drei zustand
   npm install -D typescript vite @vitejs/plugin-react @types/three @types/react @types/react-dom
   ```
2. **Implement `src/robotConfig.ts`**: Define `robotGeometry`, reach envelopes, `clampToReach`, `tableConfig`, `isOverTable`, `getFloorZ`, and types `BlockItem`, `SceneSnapshot`.
3. **Implement `src/motion.ts`**: Implement 3D vector algebra (`Point`, `add`, `subtract`, `scale`, `dot`, `cross`) and `moveCPosition` for circular interpolation.
4. **Implement `src/rapid.ts`**:
   - Define Monarch syntax provider for Monaco RAPID language.
   - Implement `compile(code, targets)` with 2-pass recursive procedure compiler, call-stack recursion detection, and diagnostic marker generators.
   - Populate built-in `examples` (6 lessons) and `tasks` (10 tasks).
5. **Implement `src/RobotScene.tsx`**:
   - Build complete ABB IRB 1090 3D mesh model with Axis 2 spherical knuckle, turntable, upper arm, forearm, and wrist.
   - Implement general analytical IK solver supporting arbitrary TCP pitch angle $\alpha$.
   - Build `PenTool`, `GripperTool`, `TrainingTable`, `Workpiece`, and `Marker`.
   - Add Canvas `onPointerMissed` and ground plane click receiver to deselect on empty clicks.
6. **Implement `src/App.tsx`**:
   - Wire application state: `code`, `targetPositions`, `tcp`, `tcpPitch`, `tool`, `blocks`, `tablePosition`, `inputs`, `outputs`, `history`.
   - Implement execution loop `execute(command)` with `requestAnimationFrame` interpolation.
   - Implement project Save/Load/Export/Import via `localStorage` and JSON files.
   - Connect Undo/Redo stack across code, targets, blocks, and tool settings.
7. **Implement `src/styles.css`**: Dark industrial aesthetic, responsive splitters, Monaco styling, scrollbars, status pills, and context menus.
8. **Verify & Test**:
   ```bash
   npm run build
   ```
   Verify 0 TypeScript errors and test all 6 lessons and 10 tasks.

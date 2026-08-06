# rapidsim — Single-Prompt AI Replication Plan

Build an identical RAPID Sim application (ABB IRB 1090 learning simulator) from scratch inside a new project directory. Follow every detail below exactly. This repo is a Vite + React + TypeScript SPA with zero backend; it deploys statically behind nginx on port 80 via Docker Compose with host port forwarding to 8080.

---

## 1. Scaffolding / dependencies (must-install list)

Run inside an empty project directory:
```bash
npm create vite@latest rapidsim -- --template react-ts && cd rapidsim
npm install
npm install @monaco-editor/react three @react-three/fiber @react-three/drei zustand
npm install -D typescript vite ts-node @vitejs/plugin-react
```

### package.json shape (only the scripts block matters; versions can differ)

```json
{
  "name": "rapidsim",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

---

## 2. Project root files to create (verbatim contents)

### index.html — minimal HTML entry point with Polish locale

Contents: `<html lang="pl">`, viewport meta, theme-color `#151515`. Head contains meta charset + viewport + theme-color + title "RAPID Sim". Body has `<div id="root"></div>` and a module script pointing to `/src/main.tsx`. No other pages — the app is single-page.

### vite.config.ts
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({ plugins: [react()], server: { host: "0.0.0.0" } });
```

The `server.host = '0.0.0.0'` is critical for LAN access; it lets other devices on the same network reach the app via the machine's IP.

### TypeScript configs — three files (use a Vite-React preset equivalent)

Create `tsconfig.app.json`, `tsconfig.node.json`, and `tsconfig.json` that merges them together per standard Vite convention (tsc -b uses the merge form). The ts build runs before vite build; output goes to `dist/`.

### Dockerfile
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

Two stages: (1) node/alpine install + ts build, (2) nginx serves the static dist output on port 80.

### docker-compose.yml
```yaml
services:
  rapidsim:
    build: .
    ports:
      - "8080:80"
    restart: unless-stopped
```

Host `8080` maps to container `80`. Browser open `http://<teacher-computer-LAN-IP>:8080` after `docker compose up --build -d`. If needed, open TCP 8080 in the host firewall.

### nginx.conf — default config is fine (empty file or system default)

Do not write a custom nginx.conf unless you want to; just drop the stock one at `/etc/nginx/conf.d/default.conf` and serve from `/usr/share/nginx/html/`. Make sure it points root to HTML with try_files fallback for SPA routing.

---

## 3. Application layout (single page — no router, no routes)

```
┌ Header ──────────── 52 px tall (brand + tool switcher, status pill, primary controls)   ┐
│                                                                                        │
│  <aside> lessons sidebar (~212 px wide / collapsed → ~38 px with collapse toggle)      │
│     project-name input + New/Save buttons                                              │
│     Export/Import (JSON file I/O — localStorage under key "rapid-sim-student-projects") │
│     LESSONS title (with count), three selectable lesson buttons                          │
│     ZAPISANE section for saved projects with date labels                                 │
│     "Symulacja edukacyjna" notice box                                                  │
│                                                                                        │
├─ editor panel  <──────────── Monaco Editor ───────────>                              │
├ resizable sidebar/editor divider (300–860 px range)                                  │
├─ sim panel ────────────────────── 3D canvas via VRay / Three.js                         │
│     Panel head: "3D SIMULATION" label, Add point at TCP button, live TCP readout       │
│     Canvas (full inside height): three axes orbit controls + ground grid +              │
│        robot 6-axis kinematic visual + markers on each target name +                    │
│        animated trail line in amber + optional workpiece block                          │
│     Simulation footer row: Tool, Target, Line#, Reach range                            │
├ resizable sim-panel / bottom dock divider                                              │
└ Bottom dock ─────────────── 235 px tall default height (draggable)                      ┘
       left half  Console log   right half  I/O board toggle panel
```

Layout is pure flexbox/grid, all responsive from desktop down to mobile phones. Use the exact breakpoints documented in CSS section below. All resize handles use pointer-events listeners — no drag library needed. The `lessons` sidebar collapses via the `<` / `›` button and its width goes between ~38 px (collapsed) → 212 px (full).

---

## 4. Dark palette + UI design language (verbatim colors)

- Base background: `#151515`. Header bg `#1b1d20`. Panel interiors `#1c1f22` / `#1e2328`. Borders `#36393e`.
- Accent gold (everything interactive-on hover, selected states, brand): `#edaa3a`; primary button bg: `#eeb849`. Hover on controls pushes to slightly lighter tint.
- Text colors: Primary `rgba(255,255,255,.87)`, secondary (labels/metadata/secondary info) is `rgba(255,255,255,.6)`; muted / disabled is `#687079`.
- Status pill colors:
  - Ready → no background special highlight; just a dark muted `.status` pill.
  - Running → light green `.status-running { color:#3abf4e }` or matching variant used elsewhere in styles.css (the class name for running state is `".status-running"`).
  - Pause / Waiting-for-DI → amber warning color.
  - Error → red text `.error-text`.
- All buttons are borderless by default via `button { border:0; cursor:pointer }` in CSS reset, then restyle individually per group.
- All font-family chains start with Inter for UI and fall back to ui-monospace for code/data displays.

---

## 5. Robot kinematic model (robotConfig.ts) — MUST MATCH these constants

```ts
export const robotGeometry = {
  shoulderHeight: 320,   // mm from base plate center up through the shoulder joint
  upperArm:       250,   // mm (Axis-2→Axis-3 link length)
  forearm:        180,   // mm (Axis-3 distal segment — end of forearm to first wrist-axis centre)
  waistOffset:    49,
  elbowOffset:    5,
  wristLength:    67,
  baseLength:     32.5,  // not the same as shoulderHeight — base plate length
  maxRotY:        Math.PI * 3,
  maxRotX:        Math.PI / 0.95,
  maxRotZ:        4.712388980*180,  // ~471 deg expressed as radians (note: 180 is a literal — keep it)
};

export const robotReach = { minimum: number; maximum: number };  // distance from shoulder axis; both computed in mm

export const defaultTcp: [number, number, number] = [220, 340, 530];

// All helper functions use metric — keep them in mm.
export function clampToReach([x,y,z]): [x,y,z];
export function isReachable([x,y,z]): boolean;
```

The kinematics are a simplified visual approximation, not an ABB-safety-grade pose solver. The 3D scene rotates every frame to solve inverse-kinematics from the commanded TCP using these link lengths and `shoulderHeight = 0.32 m` as a real-world pivot point (the scene stores this in metres — see the Robot.tsx section below).

The robot reaches:
```
minimum reachable distance from shoulder axis ≈ abs(upperArm - forearm) + wristLength + base
maximum reachable distance from shoulder axis       =  upperArm         + forearm + wristLength+base
```

Comfortable workspace (what should be highlighted for new lessons): x ∈ [-200, 250], y ∈ [260, 400], z ∈ [420, 490] mm. Targets outside the safe reach show a warning message in Polish.

The default TCP `[220, 340, 530]` is shown as `Tool: [220, 560, 530]` (note y offset from shoulderHeight when computing screen position).

---

## 6. Three.js scene setup — robot visualisation (`Robot.tsx`)

A single exported component `<Robot tcp={...} editing={...} ... />`. It is built entirely from `mesh` nodes in a three-component tree that approximates the IRB-1090 geometry:

### Scene contents
- Background color = black. `DirectionalLight` at `[2, 3, 2]`, intensity high enough to cast clear shadows on the floor grid; ambient light adds diffuse fill so no part is completely dark. `OrbitControls` enabled by default with min zoom = "40" (note: not in metres — it's a camera-distance unit), max ~6× further out.
- 3 m × 5.8 m floor-grid at y ≈ -0.9 m below the robot, colored near-grey/white to show scale; rendered as a `Line` of small segments with rounded joint markers.
- A "tool tip" marker (small amber sphere) and visible workpiece block (`<WorkpieceBox />`) when gripper mode is active — both sit on top of their respective points in 3D space.

### The robot geometry tree (inside Robot.tsx)

```tsx
// all lengths are *1000 → metres here; scene uses metres everywhere except kinematic math which keeps mm
<RobotBase position={[0, 0, 0]}>
  {/* Axis One: turntable */}
  <g name="base">                       // base plate at bottom of model
    <boxGeometry />                        mesh colour near white/reflective for contrast; castShadow=true.
    <mesh>...</mesh>
  </g>

  {/* Axis Two: shoulder rotation */ }
  <g position={[0, geometry.shoulderHeight*1000, 0]}>   // rotated by current baseAngle about y
    <cylinderGeometry />                 // "upper arm link" in red-ish plastic colour #e54a28 (brushed)
    <mesh> ... </mesh>                    // upper-arm segment; rotate around z = elbowOffset*1000 along local x
  </g>

  {/* Axis Three: arm */ }
  <group position={[ geometry.wristLength/1_000, geometry.shoulderHeight / 1_000, 0 ]}>   // positioned just above the top of link
    ...                                   // elbowOffset*1000 added for visual realism at pivot. Mesh colours shift through #c54b28 → black (#23292b).
    <boxGeometry />                       // forearm segment — thinner and shorter than upper arm; length ≈ (geometry.forearm - 67) / 1000 in metres here
    ...                                   // "shoulder offset" for Axis-2 axis alignment is added back inside this group's parent matrix, so when rotating about shoulder the forearm sweeps with it like a real robot.
  </group>

  {/* Spherical wrist - Axes Four/Five/Six */ }
  <mesh><sphereGeometry> ...</mesh>      // visible joint centre ball; emissive amber for contrast (color #ed7a36) when idle, darkens to #352014 when in motion (see below).
  ...                                     // A couple more cylinder / link mesh segments at end of tool segment (representing the pen grip or gripper jaw pivot — they're rendered as thin boxes near y=geometry.defaultTcp[2]).

  {/* Visible tool - either "pen tip" or open/closed "gripper claw" */ }
  { tool === 'pen' ? <PenTool/> : <GripperTool closed={gripperClosed} /> }  // Pen is just a thin orange cylinder pointing downward with rounded ball at bottom. Gripper has two curved jaw segments.

  {/* TCP glow marker (always visible) */ }
  <mesh>                                      // bright amber/white emissive sphere positioned at current tcp*1000 converted into scene metres
    <sphereGeometry args={[0.005, 24, 24]}/><meshBasicMaterial color="#f5c54a" />
  </mesh>                                     // radius and material stay fixed regardless of motion/interactivity state; tooltip shown on hover with current coords
</RobotBase>
```

### Kinematic inverse solvers (run inside useFrame)

There is no pre-built IK here; each frame the robot recomputes its joint angles from:
- current TCP world position `[tx, ty, tz]` (in mm), and
- current base yaw `baseAngle = Math.atan2(ty, tx)` for Axis 1.

Use law-of-cosines to derive elbow angle and shoulder elevation. The visible joints then re-stack the segments in order: base → arm → forearm → wrist → TCP marker, by computing their local translation and rotation using the solved angles plus `geometry.{elbowOffset, waistOffset, baseLength}` applied as constants at each joint. This is a **visual** kinematic solver; do not expect ABB-real pose precision — it's purely for showing roughly-accurate motion for teaching purposes.

### Frame-by-frame behaviour while running
Inside the `useFrame()` hook (or equivalent per-rAF update):
1. Clamp any interpolated TCP coordinates inside `[minimum, maximum]` mm reachable range using `clampToReach`.
2. Rebuild the geometry matrix stack with current joint angles from inverse kinematics (see above).
3. Update the visible tool colour: amber glow when idle (`#ed7a36`) becomes muted brown-ish dark red while running — specifically, emissive changes to a darker shade like `#c0602f` on motion so users notice "this side is hot" visually. (In this codebase that means updating the same `<meshStandardMaterial>` color prop inside useFrame via ref.)
4. Show a tool trail: append each frame's TCP point and render it as an amber `Line`.
5. If gripper is in close state, animate the jaw segments to be more closed (use a small interpolation value).

### Workpiece box placement when gripper active
Draws `<WorkpieceBox />` positioned at `{workpiece.position}` — default `[240, 360, 380]`. The box is ~1 cm cubed in 3D space scaled to appear visible at the scene scale; uses `boxGeometry args: [0.04, 0.04, 0.04]` and has a slight emissive glow when held so users easily spot it in motion. When gripper closes on it (`outputs.doGripper === true`), the box visually follows the TCP by translating with every new position rather than staying at its original location.

### Markers for targets shown on screen
For each entry inside `targets`, render a small glowing sphere (orange) plus label text above it showing target name (e.g., 'pPick'). When a user clicks one, that target is selected and highlighted brighter in amber color (hover glow + thicker border via a custom material). When the simulation runs against that target (i.e. `if target === x then add dot trail`), the active target also gets a small pulsing halo effect on frame so it's obvious which waypoint was just commanded next.

---

## 7. Editor panel — Monaco code editor integration

The left half of the app is an instance of `<Editor>` from `@monaco-editor/react`. The surrounding wrapper (inside App.tsx) shows a header bar "MainModule.mod" and language tag "RAPID". The file tab label uses an orange dot indicator (same amber used elsewhere as brand accent). The editor itself has theme `"vs-dark"` with font-family stack `SFMono-Regular, Consolas, monospace`, fontSize 14 px. Minimap is off; automatic layout is on. Padding-top is set to 14 px so first line sits a bit lower than visual edge of the panel.

### The custom RAPID language registration (inside `editorMount`)
```ts
monaco.languages.register({ id: "rapid" });
monaco.languages.setMonarchTokensProvider("rapid", {
  keywords: [
    "MODULE","ENDMODULE","PROC","ENDPROC",
    "VAR","PERS","CONST",
    "IF","THEN","ELSE","ENDIF",
    "WHILE","DO","ENDWHILE",
    "FOR","FROM","TO","ENDFOR"
  ],
  instructions: [
    "MoveJ","MoveL","MoveC",
    "Set","Reset","WaitDI","WaitTime",
    "Incr","Clear","Stop","TPWrite"
  ],
  tokenizer: { root: [ ... ] }   // (see below in §9)
});
monaco.editor.setModelLanguage(editor.getModel(), 'rapid');
```

The tokenizer's root rule uses three regex entries — the comment pattern `/!.*/`, string pattern `/".*?"/`, identifier pattern `[a-zA-Z_][\w]*` mapped to keywords/instructions by case-sensitive name-match (so keywords like MODULE become `keyword`, instructions such as MoveJ get class `type`). Numbers matched via `/\d+/`.

---

## 8. Simulation controls UI — status / speed controls / Run/Pause etc.

Located in `<header>` across from the RAPID Sim title, these are the interactive controls:
- A **Tool Switcher** (two buttons side-by-side): "Pen" default active (gold bg), click switches to "Gripper". Active = `.active` class with accent color gold background & dark text; inactive gets subtle border. State lives in React state and forwards into `<Robot>` component as `tool={...}` prop.
- A **Status Pill** inside the header bar — a small rounded box that shows current simulation status: Ready (default), Running, Paused, Completed, Error (shows red `.error-text`). Uses `className={`status ${status.toLowerCase()}`}  // note the exact class name here: lowercase with dash or space replaced by nothing`.
- **Run / Pause / Reset** buttons: `primary` class applied to Run (gold background `#e9a640` etc.), others get plain grey outline styles. Clicking "Reset" calls component's reset flow (see §12 below) which clears simulation state, resets all signals back to their initial values and empties the console log buffer in-place with a new leading text.
- **Speed control** (the ± buttons for speed): these show or hide depending on whether a lesson requires a fixed timestep — mostly hidden by default; they are only exposed if user presses the "speed" icon button shown at right of header (it's an optional feature). When active it shows current step size in ms next to +/- buttons. Step-size changes propagate into animation duration calculations during MoveJ/MoveL animations: `duration = 650 * speedScale` instead of raw fixed values shown below.
- **Record / Export / Import** buttons (lower section): Export writes a Blob JSON of current `<code>`, `<targetsMap>`, and `<name>` to the user's downloads folder. Import reads one back using an invisible `<input type="file" accept="application/json">` — on load it merges imported targets into local state if no name collision; otherwise appends as new lesson.

---

## 9. RAPID interpreter (RapidsimCompiler.ts, plus `types.d.ts`)

This is the core logic in this app. Exports are:
- `compile(sourceCode, currentTargets): { error?: string; commands: Command[] }|{error, commands}` — pure-function entry point that parses the source and emits an array of typed command objects ready to be dispatched one-by-one by React's execution loop. Also exports other utilities: a list of target-names referenced in code (targetNamesInCode), a blankProjectCode template used for `New` button state; plus type enums used elsewhere like ToolKind | "pen"|"gripper", SignalMap, StudentProject shape etc.

### Language surface the parser accepts (verbatim — implement exactly this minimum feature set)
- Comments: any line or line-trailing sequence starting with `!` is ignored (the tokenizer already does `/![^\n]*/`).
- Declarations (`VAR`, `PERS`): form inside a PROC, parsed by keyword scan and stored in compiler state map. Types supported for this teaching subset — **only** these four primitives/aggregate types: `string`, `num`, `bool`, `pTarget`. The pTarget type is an explicit array `[x, y, z]`; other shapes are not allowed (the parser will reject any declaration where it can't convert the declared initial value to one of those forms).
- Assignments (`:=`) and expressions — evaluated at parse time for numeric/string/boolean literals; no runtime function evaluation supported in this subset. No arrays beyond explicit `[1,2,3]`. The compiler should evaluate arithmetic using +,-,*,/,() operator precedence.
- Statements (each on its own line):
  - `MoveJ|MoveL|MoveC <name>, [optional args] ;` → emits an action {op: 'move', motionType, pointRef, targetArgs}. For MoveC also expects a via-point as argument.
  - `Set reset WaitDI WaitTime TPWrite Incr Clear Stop <PROC_NAME>;` — each maps to its own op type inside Command structure used by App.tsx's execute function in runtime dispatch:
    - Set/Reset → `output`. Value is true/false (determined directly from instruction name). Signal is the first argument.
    - WaitDI → emit `{ type:'waitInput', signal, expectedValue:true/*1*/ }`; if current state does not match then React pauses execution with "Waiting for DI" status pill until user manually toggles it back on inside UI using a checkbox in I/O panel (see §10).
    - WaitTime `<seconds>;` → `{ type:'wait', seconds: float }`.
    - TPWrite `"text";` → emits a log line string; logged into console.
    - Incr/ Clear → emit `{type:'increment'|'clear', variable}` — increments by 1 or resets to zero in RAPID variable state map tracked inside interpreter.
    - Stop `;` — halts execution without advancing PC; App.tsx's execute function shows a "Program stopped" notice at bottom status bar with Completed variant of the pill (no error color).
- IF ... THEN … ENDIF, WHILE / DO…ENDWHILE, FOR..TO/DO…ENDFOR are all **nested** structures in RAPID so the parser must track them; each iteration body gets pushed into a sub-stack list that is later flattened during execution. The `targetNamesInCode` helper simply scans lines for the word matching after any motion instruction (MoveJ/L/C).

### Command types used by the runtime dispatch (`execute()`)
```ts
type CommandType = "log" | "output" | "increment" | "clear" | "stop" | "waitInput" | "wait" | "move";

interface MoveCommand { type: 'move'; kind: 'MoveJ'|"MoveL"|"MoveC"; target: string; via?: string; line: number }
// other command variants share a `line` field (1-indexed) for active line highlight
```

---

## 10. Simulation flow inside App.tsx — lifecycle & execute/next loop

The actual motion execution of compiled commands happens entirely in `App.tsx`. The state machine looks like:

- `idle → (click Run) → compiling` where the compiler is invoked with current editor text + target positions map
- if compile produces errors, pill turns red and console logs `BLAD: <err>`; no further action taken.
- else: clear animation timers (`clearTimer()`), flip status to "Running", reset PC to 0, populate commands ref array from compiled output, call `next()`.
- `execute(command)` reads current command by type (dispatch chain in if/elseif style) and runs one of the branches described below. After a non-blocking branch it calls `await waitNextTick()`; otherwise falls through immediately with `next()`:
  - Type "log" → append to console, advance.
  - Type "output" → update outputs state, log set/reset message in Polish like `"Set doReady"` or `Reset <signal>;`, advance.
  - Type "increment", "clear" — mutate RAPID variable scope (tracked internally); log message and advance.
  - Type "stop" — flip status to "Paused" with appropriate color pill, stop advancing further; leave active line visible for inspection.
  - Type "waitInput" — check current `inputs` map: if already matches required signal/value pair, run next() directly instead of blocking (this lets simulation auto-advance when expected state has been reached); else push awaiting status and log Polish text like `"Oczekiwanie: diStart = 1"`; pause until user flips the corresponding input switch in I/O panel (which triggers re-evaluation via useEffect).
  - Type "wait" — fire `setTimeout` with `commands.seconds * 1000` ms, then call next() from within.
  - Type "move" → this is where animation happens.

### Move animation runtime logic (inside App.tsx) for each MoveJ/MoveL/MoveC:
- Read current TCP position from state, determine destination by name lookup in targets map (`targetPositions[command.target]`).
- Pick an interpolation curve based on movement kind: `moveCPosition()` is used only during arc moves; `lerp` (linear) for MoveJ/MoveL — the actual formula is a cubic ease-out so motion looks smooth visually, not robotic. Duration = 650 ms * speed multiplier for MoveJ/L and 950 ms multiplied similarly for MoveC.
- Each rAF step computes `ratio = Math.min((now-started)/duration,1)` then uses either linear lerp or via-point cubic path depending on command.kind (MoveL uses direct lerp between start+end; MoveC uses moveCPosition(start, target.viaPoint, destination, ratio) which is imported from `./motion.ts`).
- TCP state is updated every tick so both 3D scene and bottom-dock readouts stay live (live update is why the sim footer shows current position coordinates).
- When finished animation (`ratio==1`) log "MoveJ pTarget_X" or similar message in Polish, advance PC via `next()`.

### Active line highlight + console log integration
During execution, every time a command begins running it sets activeLine state which highlights the corresponding row inside Monaco editor (useful during debugging). Console shows each executed step prefixed with ">".

Bottom dock always mirrors live status via:
- `<StatusText>` showing current status pill text in same colours as header.
- Last instruction line shown like `"MoveJ pPick"` below the status.
- I/O panel showing all inputs (left column) and outputs (right); each input can be toggled interactively by the user — clicking a di* switch flips its value false↔true; clicking doGripper (the only output that's interactive) closes/openes the gripper tool inside `<Robot>`.
- When simulation is in WaitingForDI state, top of signals panel shows `WAITING: <signal>` so teachers can see which DI is paused.

---

## 11. Project save / load / export workflow (localStorage + file I/O)

Project snapshot structure at the JSON layer:
```ts
interface StudentProject { name string; code string }
```
`version`, `targetsMap`, and other fields may or may not be present depending on versioning changes — just accept what's there.

- localStorage key = `"rapid-sim-student-projects"` (exact). Stored as JSON array of projects, sorted so most-recent is first. On app mount the list loads into state; reloaded every time.
- When user clicks "Save" on an existing-named lesson: it's pushed to front of list if new name or replaced in place.
- Each saved project button shows `<date>` (formatted via locale `'pl-PL'`) above its title inside sidebar — same order displayed as stored. The date label uses `toLocaleDateString("pl-PL")` for Polish format so days first etc.
- Export downloads a `.rapid-sim.json` file with name derived from current project Name (replacing non-alphanumeric chars with `_`).
- Import validates JSON has shape of `StudentProject = {version, name string, code string}; targetsMap, customTargets optional — if present merge into target positions map as well as keep any user-added points.` If wrong shape throw error shown in console log with Polish message `"Nieprawidlowy plik projektu."`.
- There is only ever one save location — you do not need multiple files or separate workspace storage.

---

## 12. Lessons sidebar / example programs (the three built-in lessons)

The project ships **three default lessons** loaded on startup into `examples[]`. Each lesson has id, topic, title + code body:
- **"Draw Square"** — a MoveJ+MoveL path that traces an axis-aligned square in RAPID using named targets pSquare1/2/3/4 and shows how MoveL with constant speed follows straight line.
- **"Pick & Place"** — demonstration of a typical pick-and-place cycle. Uses MoveJ for fast approach, then MoveL at slow velocity to touch the workpiece down below before gripping and retracting again; it toggles doGripper output and ends in home pose via MoveJ back to origin coordinates. Has some `WaitTime` between cycles too so user can see I/O state changes while code runs step-by-step.
- **"Draw Circle"** — shows arc motion with MoveC and a circular path built up from 6 intermediate steps; also demonstrates variables (counter, currentAngle) being updated inside loop body via Incr, showing RAPID's for-loop syntax `FOR i FROM 1 TO 6 DO ... ENDFOR`.

Each lesson has its own targets dictionary that contains only the points used in it. The built-in default position at `[pHome = [250, 380, ~470]]` (roughly above & slightly ahead of robot) is shared across all lessons because every lesson starts / ends there.

---

## 13. Target point management UI

User-facing controls for points in the sim view:
- Right-clicking any marker opens a context menu (a fixed z-index popup div) with two options depending on whether it's a custom or built-in target:
  - If user-created/custom → shows "Remove" action; clicking removes that entry from targets map and re-renders markers without it. Shows in log message `"Usunieto punkt <name>."`.
  - Built-in targets (from initial `targets` object) don't have a remove menu item — just show the tooltip-style label for inspection.
- "Add point at TCP" button on sim panel header triggers an inline dialog that:
  - Grabs current tcpRef.current as starting position.
  - Shows small input prompting user to name and confirm; validate regex `/^[A-Za-z_][\w]*$/`. Reject otherwise with Polish error message `Nazwa punktu musi zaczynac sie ...` ("Name must start...") logged into console.
  - If name already exists, reject + log `"Punkt <name> juz istnieje."`.
- New points are added into target positions map under a `customTargets: string[]` list tracking which ones they add to the dictionary of names so they don't clash with the built-ins.

---

## 14. Responsive breakpoints — exact values to use (verbatim CSS)

From the existing stylesheet's @media rules:
- `<900px`: `.sim-edit, .legend { display: none; }` — hide sim info tags for Edit/Reach etc. on smaller viewports.
- `<1024px`: main layout switches from `grid-template-columns: 2 columns` to stacked layout with `.lessons { width: 38px /* collapsed */ only if open else hidden }; .resize-handle { display:none }`. Also `.sim-panel` takes full width; sets `.bottom` to min-height "260 px".
- `<650px`: single column stack. `.editor` collapses into fixed row above sim-view canvas (no longer floating beside). `.panel-head` labels hidden inside mobile mode using absolute positioning + translate tricks. `lessons` becomes a scrollable horizontal bar at top of left column — not full sidebar anymore, just buttons in a flow row with gaps "5 px". Bottom dock stacks vertically with both halves having min-height 190 px instead of side by side (`.signals` goes below the `.console`).

---

## 15. Polish language strings to include verbatim (verbatim UI text — do NOT translate these)

- Brand label / nav: `RAPID Sim`
- Robot-label on header: `ABB IRB 1090 — OmniCore learning simulator` (use real em-dash here, not a simple hyphen).
- Initial console messages when app starts and resets state: `"Rapidsim gotowy. Wybierz lekcje i uruchom program."`, `"RAPID Sim gotowe. Stan symulacji zresetowany."`.
- Status pill text: `Ready` (default), `Running`, `Waiting for DI` (when paused for a digital input), `Completed`, `Error` and `Paused`. Use exactly these strings — translated versions should not be shown since the app is deliberately bilingual but uses Polish defaults.
- Console log entries use Polish messages like `"Set doReady"` (the Set command itself stays in English so teachers can match RAPID syntax visually; only surrounding context text becomes Polish): example from source code reads something like `"Oczekiwanie: diStart = 1"`, `"Wybrano narzedzie: tPen."` (tool-change log), and `<command> <target>` style for move logging.
- Error messages use `BLAD:` prefix followed by the error reason, so they appear red in console via `.error-text`. Example: when invalid file is imported → `Nieprawidlowy plik projektu.` When user tries to drag an out-of-reach point beyond robot's max reach then app logs `"Point <name> nie zostal zmieniony — poza zasiegiem robota."`.
- Project name default value string literal `"Moj program"`. File-save prompt placeholder `pCustom` is English-language but the rest of dialog stays Polish.

---

## 16. MotionStateStore file (the tiny zustand store)

File: `MotionStateStore.ts` (about 35 lines total in this project). It's a tiny single-store that holds just three primitives:
- `tcp: [x,y,z]`, default value `[220, 340, 480]`; setter exposed as `setTcp`.
- `blockPosition: [x,y,z],` also defaulted to same starting target coords; setter `setBlockAt`.
- `target?: string | undefined` — tracks last target set during animation for use in sim footer display. Setter exposes via `setTarget <string>`.

Plus a handful of related helpers (`setCurrentTarget`, etc). Use zustand's `create()` helper to expose these. Import and use it wherever state needs to flow between App.tsx, Editor.tsx and SimView.tsx (the 3D viewport).

Note that this store only tracks runtime simulation state — anything to do with RAPID variable evaluation or the compiler lives inside RapidsimCompiler.ts, not here. Keep state concerns cleanly separate between:
- `MotionStateStore.ts` for what's visible (robot pose etc.),
- `RapidsimCompiler.ts` which is read-only once compiled for the runtime execution loop in App, and
- Component-level React state in App.tsx for UI state like sidebar-expanded/contracted, file dialogs, lesson selection highlight.

---

## 17. Prompt.md — built-in teaching reference document (verbatim text)

Ship a `prompt.md` markdown file inside `/src/prompt.md` of the project containing an English-language RAPID language tutorial with examples for students reading during lessons:
- Section "Motion Instructions": MoveJ vs MoveL vs MoveC, what each does, sample code including MoveC with via-point.
- Section "Declarations and Data Types": VAR/PERS/CONST categories explained; show example robtarget/pTarget assignments inline.
- Section "Sub-procedures / Call Graph": PROC/ENDPROC + calling one from another — show the `!` comment syntax once used here (e.g. `! Wywolanie innej procedury`). End with ENDMODULE tag for a MODULE.
- Section "Conditional Statements" including IF … THEN/ELSIF/ELSE/ENDIF, the compact single-instruction form with `[0/1]` literal boolean checks and how you can compare numeric strings booleans etc., each operator `<`, `<=`, `==`, `/=`, `>`, `>=` demonstrated with code snippet.
- Section "Selection statement TEST" showing CASE / DEFAULT syntax (brief, not mandatory).
- Section "Looping Statements": WHILE loops plus FOR <var> FROM x TO y DO ... ENDFOR loop examples, also show Incr/Counter inside a simple for body. IF blocks embedded as conditional inside loops to show nesting.
- I/O section: Set/Reset / WaitDI and how digital signals get used during pick-place tasks; brief on TPWrite message printing.
- Functions mention: e.g. `ValToStr`, clock family (`ClkRead`, `ClkReset`) — mention they return values rather than being statements, so use only on the right side of assignments like `nCycleTime := ClkRead(ckCycleTimer);`.

The whole file in English explains RAPID syntax as a quick reference card. It should read naturally and contain all the same Polish example messages used by the app (e.g., `"Skonczono program."` inside TPWrite output) so students recognise what they see during runtime too. Place this markdown next to README.md at root of project; it's just informational for users — not loaded into any UI or compiled anywhere else.

---

## 18. Implementation order (recommended sequence for agent)

1. Scaffold: run `npm init` + install dependencies as in §1, set up three TypeScript config files.
2. Write index.html + vite.config.ts + minimal src/main.tsx entry point with StrictMode mounting App into #root div (import the global styles file first).
3. Create `src/robotConfig.ts`, `src/prompt.md` from verbatim contents above in §5 and §17 sections respectively — these are small and deterministic.
4. Write MotionStateStore.ts for three-tuple tcp/block position + target string state (zustand minimal implementation ~30 lines).
5. Scaffold the main layout: header with brand dot, tool switcher buttons; sidebar/lessons panel (collapsible) with project name input and New/Save/Export/Import plus lessons list rendered from examples array of 3 items hardcoded in App.tsx; right side split between resizable editor + sim-view (with placeholder text "Loading 3D…" while the scene mounts); bottom dock row with output log, status pill + last instruction readout + I/O board toggles. Use flexbox with all border/responsive classes written to `src/styles.css`.
6. Add RAPID Monaco language configuration in App.tsx via `editorMount` callback (see §8). Don't forget the RAPID `.mod` label header and orange dot in editor panel head bar.
7. Implement RapidsimCompiler with its parse loop — start with MoveJ/MoveL/Set/WaitTime/TPWrite first, then add IF/WHILE/FOR nesting, Incr/Clear. Test by calling compile() against one of the 3 built-in lessons and make sure it returns `{ commands: [...] }` with zero errors before moving on.
8. Wire up App.tsx's execute() chain to dispatch each of those five op-types plus the move type; inside `move()` branch use `requestAnimationFrame` + easing curve (cubic or whatever `ratio*t*(3-2t)` style formula) over 650ms for MoveJ/MoveL and 950 ms with arc interpolation via `./motion.ts` helper imported from that file (the import is literally `import { moveCPosition } from './motion'`). Update status pill, console log and active line highlight as commands execute. Pause flow when WaitDI hits.
9. Implement Robot.tsx: the geometry tree, inverse kinematics useFrame computation, TCP trail Line renderer with amber `#efad3a`, workpiece <WorkpieceBox /> conditional rendering in gripper mode (gripperClosed state passed through App→Robot props via zustand store), orbit camera controls at default yaw~50deg / pitch ~28 deg and distance=1.8 m from origin when idle, plus the visible marker labels with billboard text above each target sphere; implement right-click context-menu handler that toggles remove action (with custom-target check).
10. Polish all of user-facing strings in Polish verbatim — verify header label "ABB IRB 1090 · OmniCore learning simulator" matches exactly, brand logo reads just R with square yellow background (#edaa38), the console top-line says `RAPID Sim gotowy...` after app init and again after reset.
11. Add project save / load / file I/O using localStorage + the `<input type="file">` for imports; make sure export filename format is `"$(projectName).rapid-sim.json"`. Verify with a roundtrip test — save, refresh page (reload the page from browser), re-open and confirm all points appear in sidebar list.
12. Implement responsive CSS: breakpoints at `<900`, `<1024`, `<650` pixels (these are exactly the values shown — do NOT pick other numbers).
13. Finish Dockerfile, nginx.conf and docker-compose.yml from §2 above verbatim; test `docker compose up --build -d`. Confirm localhost:8080 loads the same UI as npm run dev.

---

## 19. Pitfalls / things to remember (DO NOT skip these)

- **No backend**: zero API calls, no fetch(), no Express/Node server — everything lives client-side and renders synchronously in React state machine.
- All RAPID variable evaluation happens inside the compiler; once compiled the App just walks a list of typed commands without re-parsing anything on every animation frame.
- The `prompt.md` teaching document is **informational only** (not part of runtime) — it exists at the project root beside README.md and users can read it from github.com but nothing fetches or embeds it into UI during execution. Keep English-only text for that file to match the source wording above exactly if possible.
- All RAPID commands are case-insensitive in input (so `movej` = `MoveJ`). The parser uppercases before matching keywords.
- Kinematics use an inverse-solve approximating spherical wrist with three axes; don't try to be ABB-real — this is for teaching only, as stated everywhere in the README ("not a safety or production-code validation system"). Use the hardcoded `shoulderHeight`, `upperArm`, `forearm`, `wristLength` constants and do not import any kinematic library.
- Target-position map is keyed by name (string) with value `[x,y,z] mm tuple`; this is shared between compiler resolution during compile and runtime state — always refer to target names, never raw arrays outside the compiler itself.
- The default TCP start point for new projects is exactly `[220, 340, 530]` (matches robotConfig.exports). Don't change that constant without also updating every reference in App.tsx initial state declaration.
- The `examples[0].code` lesson runs first on load; its targets are the minimal set needed for drawing a small rectangle. Make sure they're all reachable from `<minimum, maximum>` mm bounds (use `isReachable` helper to verify before allowing users to add their own points). If any target is outside comfortable reach `[280..550]`, log an error message on compile and refuse to load it into the sim.
- Keep status-pill color classes in sync: `.status-running`, `.status-waiting`, `.status-paused` (matching whatever Polish label is shown inside — if your running-state pill text says e.g. `Runuj…` then class should reflect that actual label instead of just "Running" etc.). The exact class name depends which English/Latin/Polski word appears, but in the reference implementation it's exactly:
  - `.status-ready` (for Ready/Initial state) — no visible background;
  - `.status-running` (green text + light green bg for active run);
  - `.status-complete`, `.status-pause` and `.status-error` (red text + red bg); when waiting for a digital input it uses `.status-waiting`. Note that `.error-text` is the CSS selector applied to individual Console log rows, not the status pill itself.

---

## 20. Verification plan — what "identical" means in tests

After building run these three checks to confirm correctness:
1. `npm run dev -- --host 0.0.0.0` should open the same layout described at §3 above at any desktop resolution ≥ 1024 px wide.
2. Select each of the three built-in lessons one-by-one, press Run (pill becomes `.status-running`) and confirm: Draw Square animates in a square path with 950 ms per segment, Pick&Place does gripper close/wait/open cycle as expected with I/O panel reflecting on/off changes, Draw Circle shows arc interpolation between via-points using moveCPosition. Reset back to Ready state after each lesson finishes.
3. Create a new project (click New → change name to anything non-blank), write any valid RAPID code in the editor — verify compiler accepts it if syntax clean OR reports error via `BLAD: <reason>` red text log row with Polish wording when invalid, then save+export/import round-trip preserves exact same targets map and code string as before.

If all three pass, the app matches the repository identically at every visible/interactive level described in this prompt. Any discrepancies should be re-corrected against the originals until behavior converges — no new features worth adding beyond that scope without rewriting this document too. The final deliverable is a working rapidsim app identical to the source repo with all three example lessons, kinematic visualizer working correctly and I/O panel interacting properly during simulation.

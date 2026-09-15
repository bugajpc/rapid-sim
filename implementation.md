# RAPID Sim — Autonomous AI Recreation Specification & Implementation Blueprint

> **Target Audience**: AI Agents, Autonomous Coding Systems, and Automation Software Engineers.  
> **Goal**: Provide an exhaustive, turnkey technical specification and architectural blueprint to recreate the **RAPID Sim** web application (ABB IRB 1090 / OmniCore industrial robot simulator, Monaco RAPID IDE, 3D simulation engine, debugger, digital I/O board, and interactive project management system) in a single pass without any missing dependencies, mathematical formulas, data structures, or UI components.  
> **Scope Boundary**: This specification focuses strictly on the standalone application platform: code editor, project/file management, 3D kinematic simulation, ABB FlexPendant debugger, digital I/O board, dynamic physics, and interactive scene tools (targets, blocks, table, conveyor, feeder, sensors). Pre-baked curriculum lessons and exam practice exercises are deliberately excluded to provide a clean, production-grade development platform.

---

## 1. System Overview & Technology Stack

**RAPID Sim** is a zero-backend, client-side Single Page Application (SPA) designed to simulate the programming, kinematics, and execution environment of an **ABB IRB 1090** industrial robot arm controlled via the **ABB RAPID** programming language and OmniCore / FlexPendant controller paradigms.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ RAPID Sim Architectural Overview (Zero-Backend Client-Side SPA)                        │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Top Header (52px): Brand, Undo/Redo, Speed Override, Tool Toggle, Status, Runs │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
│   ┌───────────────┬───────────────────────────────┬─┬──────────────────────────────┐   │
│   │ Sidebar (250) │ Monaco Code Editor (Flex 1)   │ │ 3D Simulation Panel (Flex 1) │   │
│   │ - Project Name│ - Custom RAPID Monarch tokens │S│ - Three.js / R3F / Drei      │   │
│   │ - New / Save  │ - Diagnostic error markers    │P│ - ABB IRB 1090 3D Mesh Model │   │
│   │ - Import/Exp. │ - Program Pointer (PP) glyph  │L│ - Analytical IK Solver       │   │
│   │ - Saved Projs │ - "PP do Main", "PP do kursora"│I│ - Pen & Gripper Tools        │   │
│   │ - Collapsible │ - 2-Pass Recursive Compiler   │T│ - Pick-and-Place Physics     │   │
│   │               │ - Offs() / WObj Support       │ │ - CNC Table & Workpieces     │   │
│   ├───────────────┴───────────────────────────────┼─┴──────────────────────────────┤   │
│   │ Resizable Bottom Dock (Console Output Log + Interactive Digital I/O Board)     │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Technology Stack & Versions

| Package | Version | Purpose |
| :--- | :--- | :--- |
| **`react`** / **`react-dom`** | `^18.3.1` | Component lifecycle, UI rendering, reactive hooks (`useState`, `useRef`, `useEffect`) |
| **`typescript`** | `^5.7.3` | Strict static typing, interfaces, and compile-time correctness |
| **`vite`** / **`@vitejs/plugin-react`** | `^6.1.0` / `^4.3.4` | Ultra-fast HMR development server and ESNext production bundler |
| **`@monaco-editor/react`** | `^4.7.0` | In-browser VS Code editor embedding with custom Monarch language grammar |
| **`three`** / **`@types/three`** | `^0.173.0` | 3D scene graph, WebGL rendering, mesh geometry, lights, raycasting, vectors |
| **`@react-three/fiber`** | `^8.18.0` | Declarative Three.js scene graph binding for React with 60fps render loop |
| **`@react-three/drei`** | `^9.122.0` | Camera controls (`OrbitControls`), 3D gizmos (`TransformControls`), billboards, grid |
| **`zustand`** | `^5.0.3` | Lightweight state management helper (or React state / refs) |

---

## 2. Directory Structure & Complete Root Files

```
rapid-sim/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
└── src/
    ├── main.tsx             # React DOM root bootstrapping
    ├── App.tsx              # Main UI layout, splitters, execution loop, debugger, state
    ├── RobotScene.tsx       # Three.js 3D viewport, IRB 1090 mesh, tools, markers, gizmos
    ├── motion.ts            # 3D vector math and circular arc (MoveC) interpolation
    ├── rapid.ts             # Lexer, 2-pass AST compiler, expression evaluator, types
    ├── robotConfig.ts       # Kinematic link dimensions, reach limits, collision, snapshots
    └── styles.css           # Complete dark industrial CSS theme, layout grid, splitters
```

### 2.1 `package.json`
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

### 2.2 `vite.config.ts`
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0" },
});
```

### 2.3 `tsconfig.app.json`
```json
{
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### 2.4 `index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#151515" />
    <title>RAPID Sim</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 2.5 `Dockerfile` & `nginx.conf`
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

## 3. Robot Kinematic Model & Mathematical Foundations

### 3.1 Kinematic Parameters (`src/robotConfig.ts`)

The geometric model reflects an **ABB IRB 1090**-inspired 6-axis articulated robot with educational proportions. All physical dimensions are expressed in millimetres (mm) and converted to Three.js metres via scale factor $S = 0.001$.

```ts
export const robotGeometry = {
  shoulderHeight: 350, // Height of Axis 2 shoulder pivot above base (Y = 0)
  upperArm: 360,       // Axis 2 shoulder to Axis 3 elbow link length
  forearm: 280,        // Axis 3 elbow to Axis 4 wrist centre link length
  wristAndTool: 150,   // Axis 4 wrist centre to commanded Tool Center Point (TCP)
} as const;

export const robotReach = {
  minimum: Math.abs(robotGeometry.upperArm - robotGeometry.forearm) + robotGeometry.wristAndTool, // 80 + 150 = 230 mm
  maximum: robotGeometry.upperArm + robotGeometry.forearm + robotGeometry.wristAndTool,           // 360 + 280 + 150 = 790 mm
  comfortableMinimum: 260,
  comfortableMaximum: 740,
} as const;

export const defaultTcp: [number, number, number] = [220, 340, 480];
```

### 3.2 Coordinate System Mapping
- **RAPID Coordinate Frame**: Right-handed industrial coordinate frame where $+X$ is robot forward, $+Y$ is robot left, and $+Z$ is upward vertical.
- **Three.js World Coordinate Frame**: $+x_{\text{three}}$ is right, $+y_{\text{three}}$ is vertical up, $+z_{\text{three}}$ is forward toward the camera.
- **Coordinate Conversion**:
  $$x_{\text{three}} = \frac{X_{\text{rapid}}}{1000}, \quad y_{\text{three}} = \frac{Z_{\text{rapid}}}{1000}, \quad z_{\text{three}} = -\frac{Y_{\text{rapid}}}{1000}$$

### 3.3 Analytical Inverse Kinematics with Commanded Pitch Angle $\alpha$

Given a commanded Cartesian TCP position $(X, Y, Z)$ in millimetres and a tool pitch angle $\alpha \in [-90^\circ, 0^\circ]$ (where $-90^\circ = -\pi/2$ radians points vertically downward, $-45^\circ$ is tilted, and $0^\circ$ is horizontal):

```
                       O (Elbow Axis 3)
                      / \
         L_upperArm  /   \  L_forearm
                    /     \
    (Shoulder A2)  O       O (Wrist A4)
                   |        \
    H_shoulder     |         \  L_wristAndTool (Pitch angle alpha)
                   |          \
    (Base A1) ====[=]==========* TCP (X, Y, Z)
```

1. **Base Yaw Angle (Axis 1)**:
   $$\theta_1 = \text{atan2}(Y, X)$$

2. **Cylindrical Horizontal Distance & Height**:
   $$h_{\text{tcp}} = \sqrt{X^2 + Y^2}, \quad z_{\text{tcp}} = Z$$

3. **Wrist Center Position**:
   $$h_{\text{wrist}} = h_{\text{tcp}} - L_{\text{wristAndTool}} \cdot \cos(\alpha)$$
   $$z_{\text{wrist}} = z_{\text{tcp}} - L_{\text{wristAndTool}} \cdot \sin(\alpha)$$

4. **Planar Vector from Shoulder Axis 2 to Wrist Center**:
   $$H = h_{\text{wrist}}, \quad V = z_{\text{wrist}} - H_{\text{shoulder}}$$
   $$D = \sqrt{H^2 + V^2}$$
   $$D_{\text{min}} = |L_1 - L_2| + 5\text{ mm}, \quad D_{\text{max}} = L_1 + L_2 - 5\text{ mm}$$

5. **Graceful Fallback on Pitch Angle Violation**:
   If the commanded pitch angle $\alpha$ causes $D > D_{\text{max}}$ or $D < D_{\text{min}}$ (wrist out of physical reach), fall back to radial pointing orientation:
   $$\alpha_{\text{fallback}} = \text{atan2}(z_{\text{tcp}} - H_{\text{shoulder}},\, h_{\text{tcp}})$$
   $$H = h_{\text{tcp}} - L_{\text{wristAndTool}} \cdot \cos(\alpha_{\text{fallback}})$$
   $$V = z_{\text{tcp}} - L_{\text{wristAndTool}} \cdot \sin(\alpha_{\text{fallback}}) - H_{\text{shoulder}}$$
   $$D = \text{clamp}\left(\sqrt{H^2 + V^2},\, D_{\text{min}},\, D_{\text{max}}\right)$$
   $$\alpha = \alpha_{\text{fallback}}$$

6. **Shoulder and Elbow Angles (Industrial Elbow-Up Posture)**:
   Using the Law of Cosines on the triangle formed by $L_1$, $L_2$, and $D$:
   $$\beta = \text{atan2}(V, H)$$
   $$\cos(\psi) = \text{clamp}\left(\frac{D^2 + L_1^2 - L_2^2}{2 D L_1},\, -1,\, 1\right) \implies \psi = \arccos(\cos(\psi))$$
   $$\theta_{\text{shoulder}} = \beta + \psi$$
   
   $$\cos(\theta) = \text{clamp}\left(\frac{D^2 - L_1^2 - L_2^2}{2 L_1 L_2},\, -1,\, 1\right) \implies \theta_{\text{elbow}} = -\arccos(\cos(\theta))$$

7. **Forearm Angle & Wrist Pitch**:
   $$\theta_{\text{forearm}} = \theta_{\text{shoulder}} + \theta_{\text{elbow}}$$
   $$\theta_{\text{wristPitch}} = \alpha - \theta_{\text{forearm}}$$
   $$\theta_{\text{wristRoll}} = \sin(\theta_1 \cdot 1.8) \cdot 0.5$$

### 3.4 3D Circular Arc Path Interpolation (`src/motion.ts`)

ABB RAPID's `MoveC` instruction interpolates an exact circular arc defined by three points: Start $\mathbf{A}$, Via $\mathbf{B}$, and End $\mathbf{C}$.

```ts
export type Point = [number, number, number];

const add = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const subtract = (a: Point, b: Point): Point => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (point: Point, value: number): Point => [point[0] * value, point[1] * value, point[2] * value];
const dot = (a: Point, b: Point): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Point, b: Point): Point => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export function moveCPosition(start: Point, via: Point, end: Point, ratio: number): Point {
  const ab = subtract(via, start);
  const ac = subtract(end, start);
  const normal = cross(ab, ac);
  const normalSquared = dot(normal, normal);
  
  // Collinear fallback: if normal length is near zero, points lie on a line
  if (normalSquared < 0.0001) {
    return add(start, scale(ac, ratio));
  }

  // Exact circumcenter offset vector:
  const centerOffset = scale(
    add(scale(cross(ac, normal), dot(ab, ab)), scale(cross(normal, ab), dot(ac, ac))),
    1 / (2 * normalSquared)
  );
  const center = add(start, centerOffset);
  const fromStart = subtract(start, center);
  const fromVia = subtract(via, center);
  const fromEnd = subtract(end, center);
  
  const unitNormal = scale(normal, 1 / Math.sqrt(normalSquared));
  const signedAngle = (p: Point) => Math.atan2(dot(unitNormal, cross(fromStart, p)), dot(fromStart, p));
  const positiveAngle = (p: Point) => (signedAngle(p) + Math.PI * 2) % (Math.PI * 2);
  
  const endAngle = positiveAngle(fromEnd);
  const viaAngle = positiveAngle(fromVia);
  const sweep = viaAngle <= endAngle ? endAngle : endAngle - Math.PI * 2;
  const angle = sweep * ratio;
  const tangent = cross(unitNormal, fromStart);
  
  return add(center, add(scale(fromStart, Math.cos(angle)), scale(tangent, Math.sin(angle))));
}
```

---

## 4. RAPID Compiler & Virtual Machine Architecture (`src/rapid.ts`)

The compiler implements a complete 2-pass recursive procedure compiler, lexer, and recursive-descent expression evaluator for ABB RAPID code.

### 4.1 Command AST Specification
```ts
export type MoveCommand = {
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
};

export type OutputCommand = { type: "output"; signal: string; value: boolean; line: number };
export type PulseCommand = { type: "pulse"; signal: string; length: number; line: number };
export type WaitInputCommand = { type: "waitInput"; signal: string; value: boolean; line: number };
export type WaitOutputCommand = { type: "waitOutput"; signal: string; value: boolean; line: number };
export type WaitTimeCommand = { type: "wait"; seconds: number; line: number };
export type IncrCommand = { type: "increment"; variable: string; stepExpr?: string; line: number };
export type DecrCommand = { type: "decrement"; variable: string; stepExpr?: string; line: number };
export type ClearCommand = { type: "clear"; variable: string; line: number };
export type AssignCommand = { type: "assign"; variable: string; expr: string; line: number };
export type AddCommand = { type: "add"; variable: string; expr: string; line: number };
export type JumpCommand = { type: "jump"; targetIndex: number; line: number };
export type JumpIfFalseCommand = { type: "jumpIfFalse"; expr: string; targetIndex: number; line: number };
export type TPWriteCommand = {
  type: "log";
  text?: string;
  textExpr?: string;
  params?: Array<{ kind: "num" | "dnum" | "bool" | "pos" | "orient"; expr: string }>;
  line: number;
};
export type TPEraseCommand = { type: "tpErase"; line: number };
export type StopCommand = { type: "stop"; line: number };

export type Command =
  | MoveCommand
  | OutputCommand
  | PulseCommand
  | WaitInputCommand
  | WaitOutputCommand
  | WaitTimeCommand
  | IncrCommand
  | DecrCommand
  | ClearCommand
  | AssignCommand
  | AddCommand
  | JumpCommand
  | JumpIfFalseCommand
  | TPWriteCommand
  | TPEraseCommand
  | StopCommand;
```

### 4.2 Recursive-Descent Expression Parser
The `evaluateExpression(expr, context)` function handles arithmetic, logical, relational, string, array, and IO function operations with true operator precedence:
1. `parseOr()`: `OR`, `XOR`
2. `parseAnd()`: `AND`
3. `parseEquality()`: `=`, `<>`
4. `parseRelational()`: `<`, `<=`, `>`, `>=`
5. `parseAdditive()`: `+`, `-` (supports numeric addition and string concatenation)
6. `parseMultiplicative()`: `*`, `/`, `DIV` (integer division), `MOD` (remainder)
7. `parseUnary()`: unary `+`, `-`, `NOT`
8. `parsePrimary()`:
   - Numbers: `42`, `3.1415`
   - Strings: `"Hello world"`
   - Booleans: `TRUE`, `FALSE`
   - Grouping: `( expr )`
   - Coordinate / Vector Literals: `[x, y, z]`
   - IO Built-in Functions: `DInput(signalName)` (returns `1` or `0`), `DOutput(signalName)`
   - Variables & Target lookups

### 4.3 Two-Pass Compiler Workflow
- **Pass 1: Module Structure & Procedure Cataloging**:
  - Validates `MODULE ... ENDMODULE` boundaries.
  - Parses global declarations (`VAR`, `PERS`, `CONST`).
  - Extracts all procedures: `PROC name(params) ... ENDPROC`.
  - Prohibits nested procedures and duplicate procedure names.
  - Locates the main entry point: `PROC main()` (or `PROC EGZAMIN()`).
- **Pass 2: Recursive Procedure Expansion & Jump Backpatching**:
  - Starts execution compilation from `main()`.
  - Supports procedure invocations: `subProc;` or `subProc(arg1, arg2);` with argument parameter binding.
  - Maintains a call stack with cycle detection: halts with `Wykryto zapętlenie wywołań procedur (rekurencja): A -> B -> A`. Enforces max stack depth = 50.
  - Compiles control structures using jump backpatching:
    - `IF ... THEN` -> `jumpIfFalse` (target patched by subsequent `ELSEIF`, `ELSE`, or `ENDIF`).
    - `WHILE cond DO` -> `jumpIfFalse` at loop head, `jump` back to head at `ENDWHILE`.
    - `FOR i FROM start TO end [STEP s] DO` -> assigns start value, checks condition `i <= end`, increments by step and loops back at `ENDFOR`.

### 4.4 Default Blank Project Code
```rapid
MODULE MainModule

    PROC main()
        TPWrite "Moj program RAPID";
    ENDPROC

ENDMODULE
```

---

## 5. 3D Scene Visualization Engine (`src/RobotScene.tsx`)

### 5.1 ABB IRB 1090 Visual Mesh Hierarchy
The robot is constructed from modular Three.js primitives with realistic industrial textures:
- **Materials**:
  - ABB Light Gray: `#e1e6ec`, roughness 0.35, metalness 0.15 (main cast robot arms).
  - Dark Graphite: `#1e2428`, roughness 0.45, metalness 0.8 (motor hubs, risers, base collar).
  - Machined Stainless Steel: `#8ea0ad`, roughness 0.2, metalness 0.9 (mounting plates, flange).
- **Structure**:
  1. **Base Plate & Turntable**:
     - Steel base ($340 \times 340 \times 24\text{ mm}$) at $Y = 0$ with 4 corner anchor bolts.
     - Axis 1 rotating turntable ($Y = 80\text{--}160\text{ mm}$) driven by $\theta_1$.
  2. **Shoulder & Knuckle (Axis 2)**:
     - Shoulder column reaching $Y = 350\text{ mm}$.
     - Solid spherical knuckle housing (`sphereGeometry args={[0.062, 32, 24]}`) at rotation center.
     - Dual symmetrical servo motor medallions at $Z = \pm 62\text{ mm}$.
  3. **Upper Arm Link (Axis 2 to Axis 3)**:
     - $68 \times 76\text{ mm}$ cross section, length $360\text{ mm}$, rotating by $\theta_{\text{shoulder}}$.
  4. **Elbow Joint & Forearm Link (Axis 3 to Axis 4)**:
     - Cylindrical elbow hub with machined face.
     - $56 \times 62\text{ mm}$ cross section, length $280\text{ mm}$, rotating by $\theta_{\text{elbow}}$.
  5. **Wrist Flange & End-Effector Mount (Axis 4)**:
     - Rotating wrist housing with tool mounting flange plate ($48 \times 48 \times 8\text{ mm}$).
- **Occlusion Auto-Fade**:
  - While running, a raycaster casts from camera to inspected points. If the robot meshes occlude the line of sight, material opacity drops to `0.28` with `transparent = true` and `depthWrite = false`.

### 5.2 End-Effectors (`tPen` and `tGripper`)
- **Drawing Pen (`tPen`)**:
  - Cylindrical barrel ($\varnothing 14\text{ mm}$, length $85\text{ mm}$).
  - Conical nozzle narrowing to brass writing tip ($150\text{ mm}$ extension from wrist).
- **Parallel Gripper (`tGripper`)**:
  - Graphite pneumatic actuator body ($52 \times 48 \times 60\text{ mm}$).
  - Dual ground steel guide rails.
  - Left and right sliding jaws with black polyurethane grip pads.
  - Animated jaw stroke: shifts inward by $12\text{ mm}$ when `outputs.doGripper = true`.

### 5.3 Workpieces & Dynamic Physics
- **Workpiece Cubes**:
  - $50 \times 50 \times 50\text{ mm}$ aluminum-styled blocks with chamfered top handles.
  - Multi-block management: stepper button allows 1 to 28 blocks, placed in indexed grid patterns.
  - Material options: Aluminum/Metal (reflective silver) or Plastic (colored).
- **Collision & Floor Detection (`getFloorZ`)**:
  ```ts
  export function getFloorZ(
    x: number,
    y: number,
    hasTable: boolean,
    tableCenter: [number, number] = defaultTablePosition,
    blocks: BlockItem[] = [],
    ignoreBlockId: string | null = null
  ): number {
    let baseZ = 35; // Floor level
    if (hasTable && isOverTable(x, y, tableCenter)) {
      baseZ = tableConfig.topZ + 35; // 235 mm (table top surface)
    }
    if (hasTable && isOverConveyor(x, y)) {
      baseZ = Math.max(baseZ, conveyorConfig.beltZ + 25); // 241 mm
    }
    // Block-on-block stacking detection:
    let maxStackedZ = baseZ;
    for (const block of blocks) {
      if (block.id === ignoreBlockId) continue;
      const dist = Math.hypot(block.position[0] - x, block.position[1] - y);
      if (dist < 42) {
        const topOfBlock = block.position[2] + 48;
        if (topOfBlock > maxStackedZ) maxStackedZ = topOfBlock;
      }
    }
    return maxStackedZ;
  }
  ```
- **Gravity Drop & Restitution Bouncing**:
  - When released or spawned, a block falls under gravity $g = 9810\text{ mm/s}^2$ with restitution coefficient $e = 0.2$.
  - When vertical velocity exceeds $200\text{ mm/s}$ upon hitting floor $Z$, it bounces ($v_z \gets -v_z \cdot 0.2$). Otherwise, velocity zeros and drops timer cancels.
- **Pick-and-Place Magnetic Snapping**:
  - When `outputs.doGripper` transitions to `true`, the system scans all blocks for the closest one to TCP:
    $$\text{dist} = \sqrt{(X_{\text{tcp}} - X_b)^2 + (Y_{\text{tcp}} - Y_b)^2 + (Z_{\text{tcp}} - Z_b)^2}$$
  - If $\text{dist} \le 70\text{ mm}$, the block latches to TCP (`heldBlockId = closest.id`) and follows TCP motion smoothly until `Reset doGripper`.

### 5.4 CNC Training Table & Auxiliary Equipment
- **CNC Training Table**:
  - Dimensions: $680\text{ mm}$ width $\times 400\text{ mm}$ depth $\times 200\text{ mm}$ height, plate thickness $20\text{ mm}$.
  - $4 \times 7$ grid of CNC fixture holes ($\varnothing 28\text{ mm}$).
  - Movable in 3D using `TransformControls`, clamped within reach boundaries. Toggleable on/off.
- **Conveyor Belt System**:
  - Frame length $370\text{ mm}$, width $120\text{ mm}$, belt height $216\text{ mm}$.
  - Motorized motion: when `doConvRun` or `START_STOP` is true, resting blocks move along $X$ at $5\text{ mm/frame}$ in direction given by `doConvDir` or `LEWO_PRAWO`.
  - Drop chute bin at $X < -370\text{ mm}$ ($Z \to 85\text{ mm}$).
- **Sensors**:
  - Optical sensors B1/B3 (infeed) and B2/B4 (discharge).
  - Inductive sensor B5 (metal detector at $[110, 310]$): detects blocks with `material === "metal"`, illuminated by active LED ring.

### 5.5 Target Markers (`robtarget`) & Interactive 3D Jogging
- **Target Points (`Marker`)**:
  - Rendered as 3D spheres ($30\text{ mm}$ diameter, `#5d718a`) with billboard text labels.
  - Active/Selected: Amber glowing sphere ($36\text{ mm}$ diameter, `#f9b33d`) equipped with Drei `TransformControls` gizmo for direct 3D translational manipulation.
  - Coordinate Clamping: Repositioning automatically clamps coordinates within robot reach envelope.
- **ModPos (Teach Position)**:
  - Header button `ModPos`: Instantly copies current TCP coordinates $[X, Y, Z]$ into the currently selected `robtarget`.
- **Add Point at TCP**:
  - Opens a modal dialog allowing the user to specify a name (e.g. `pPick2`) and stores current TCP coordinates.
- **TCP Jogging**:
  - Dedicated interactive TCP marker with 3D gizmo to manually drag the robot arm in Cartesian space.
- **Right-Click Context Menus**:
  - Right-clicking any custom point or workpiece block opens a floating context menu displaying its exact $[X, Y, Z]$ coordinates and an option to delete it.
- **Deselection on Empty Click**:
  - Clicking on the ground grid plane or background canvas (`onPointerMissed`) clears selection of targets, TCP, blocks, and tables.
- **Motion Trail**:
  - Three.js Line displaying the continuous history of TCP movement with distance-based point decimation ($\ge 8\text{ mm}$ apart, max 500 points).

---

## 6. Monaco Code Editor & ABB FlexPendant Debugger

### 6.1 Monaco Configuration & Monarch RAPID Lexer
The editor embeds Monaco via `@monaco-editor/react` with a custom Monarch token provider registered for the `"rapid"` language:

```ts
monaco.languages.register({ id: "rapid" });
monaco.languages.setMonarchTokensProvider("rapid", {
  keywords: [
    "MODULE", "ENDMODULE", "PROC", "ENDPROC", "VAR", "PERS", "CONST",
    "IF", "THEN", "ELSE", "ELSEIF", "ENDIF", "WHILE", "DO", "ENDWHILE",
    "FOR", "FROM", "TO", "STEP", "ENDFOR", "num", "dnum", "bool",
    "string", "pos", "orient", "robtarget", "TRUE", "FALSE", "DIV",
    "MOD", "AND", "OR", "XOR", "NOT"
  ],
  instructions: [
    "MoveJ", "MoveL", "MoveC", "MoveAbsJ", "Set", "Reset", "SetDO",
    "ResetDO", "PulseDO", "WaitDI", "WaitDO", "WaitTime", "TPWrite",
    "TPErase", "Incr", "Decr", "Clear", "Add", "Stop"
  ],
  tokenizer: {
    root: [
      [/!.*$/, "comment"],
      [/".*?"/, "string"],
      [/\\[a-zA-Z_]\w*/, "tag"],
      [/[a-zA-Z_][\w]*/, {
        cases: {
          "@keywords": "keyword",
          "@instructions": "type",
          "@default": "identifier",
        },
      }],
      [/\d+(?:\.\d+)?/, "number"],
    ],
  },
});
```

### 6.2 Program Pointer (PP) & Diagnostic Line Markers
- **Program Pointer (PP)**:
  - Arrow glyph rendered in Monaco's glyph margin (`pp-glyph-margin` with CSS clip-path polygon) pointing to the active execution line.
  - Whole-line amber background tint (`pp-line-highlight`, `rgba(233, 169, 50, 0.16)`).
  - Gold marker in Monaco's overview ruler.
  - Auto-scrolls viewport to keep PP centered: `editor.revealLineInCenterIfOutsideViewport(line)`.
- **Diagnostic Error Markers**:
  - Syntax and compilation errors generate inline red squiggles and hover tooltips via `monaco.editor.setModelMarkers(model, "rapid", markers)`.
- **PP Navigation Actions**:
  - `PP do Main`: Compiles code and moves Program Pointer to the first instruction of `PROC main()`.
  - `PP do kursora`: Compiles code, inspects editor cursor position, and moves Program Pointer to the instruction matching the current cursor line.

### 6.3 Debugger Controls & State Machine

```
         ┌──────────┐
         │  Ready   │ ◄────────────────────────────────────┐
         └────┬─────┘                                      │
              │ Run / Step                                 │
              ▼                                            │ Reset
         ┌──────────┐      WaitDI / WaitDO     ┌───────────┴──────────┐
   ┌────►│ Running  ├─────────────────────────►│    Waiting for DI    │
   │     └────┬─────┘                          └───────────┬──────────┘
   │          │                                            │
   │ Pause    │ Step completes / Pause                     │ Signal Condition Met
   │          ▼                                            │
   │     ┌──────────┐                                      │
   └─────┤  Paused  │                                      │
         └────┬─────┘                                      │
              │ Stop instruction / All commands done       │
              ▼                                            │
         ┌──────────┐                                      │
         │Completed │ ─────────────────────────────────────┘
         └──────────┘
```

- **Execution Controls**:
  - `Run`: Compiles code, resets PC, starts 60fps animation loop.
  - `Krok` (Step): Executes a single instruction and pauses immediately after completion.
  - `Pause`: Halts animation and freezes program counter.
  - `Reset`: Restores initial pose, resets blocks, resets signals, clears trail and console.
- **Speed Override**:
  - Real-time slider (10% to 100%) and quick buttons (10%, 20%, 50%, 100%) scaling trajectory speeds without altering programmed code values.

---

## 7. Digital I/O Signals Board & Event Synchronization

### 7.1 Signal Groups & UI
The bottom right panel houses the interactive I/O board split into two groups:
- **Digital Inputs (DI)**: e.g. `diStart`, `diPartPresent`, `diReset`, `diSafetyOk`, `S1`..`S9`, `B1`..`B5`.
- **Digital Outputs (DO)**: e.g. `doReady`, `doGripper`, `doBusy`, `doComplete`, `H1`..`H9`, `doConvRun`, `doConvDir`.
- Each signal features an LED indicator (green glow when `1`, dark when `0`) and is interactively clickable by the user to toggle values in real time.

### 7.2 Automatic Signal Discovery
The compiler scans the code text on change using regular expressions to automatically populate signals without manual configuration:
- Inputs: `\bWaitDI\s+(\w+)`, `\bDInput\s*\(\s*(\w+)\s*\)`, `\b([SB]\d+)\s*=`.
- Outputs: `\b(?:Set|Reset)\s+(\w+)`, `\bSetDO\s+(\w+)`, `\bPulseDO\b[^;]*\b(\w+)`, `\bWaitDO\s+(\w+)`, `\bDOutput\s*\(\s*(\w+)\s*\)`.

### 7.3 `WaitDI` Execution Synchronization
When the virtual machine encounters `WaitDI signal, value`:
1. If the current signal value matches, execution advances immediately.
2. Otherwise, status transitions to `"Waiting for DI"`.
3. The awaited signal in the I/O board receives a pulsating gold outline (`animation: pulse-waiting 1s infinite alternate`).
4. An event listener on the `inputs` state wakes up the execution loop the instant the user clicks the signal or an automated sensor detects a workpiece.

---

## 8. Project / File Explorer & History State Architecture

### 8.1 Project Schema & Versioning
Projects are serialized as self-contained JSON files adhering to version 2 schema:

```ts
export type StudentProject = {
  version: 2;
  name: string;
  code: string;
  targets: Record<string, [number, number, number]>;
  customTargets: string[];
  savedAt: string; // ISO 8601 string
  tool: "pen" | "gripper";
  showTable: boolean;
  tablePosition: [number, number];
  blocks: BlockItem[];
  tcp: [number, number, number];
  tcpPitch: number;
};
```

### 8.2 Project Actions
- **New Project**: Resets simulation state, clears custom targets, resets blocks, and loads the standard blank `MODULE MainModule ... ENDMODULE` template.
- **Save Project**: Persists current code, targets, blocks, tool, and table positions to browser `localStorage` under key `rapid-sim-student-projects`.
- **Export Project**: Serializes project snapshot to JSON and triggers browser download: `<project-name>.rapid-sim.json`.
- **Import Project**: File input parser reads uploaded `.rapid-sim.json` file, validates schema version, and restores complete scene state.
- **Saved Projects List**: Sidebar displays saved projects with Polish date formatting; clicking loads the project instantly.

### 8.3 Deep Scene Undo / Redo System (`SceneSnapshot`)
Any user mutation (moving a target, moving a block, moving the table, jogging TCP, adding/removing blocks, switching tools) pushes a deep snapshot to `undoStackRef` (up to 50 states).
- Keyboard shortcuts: `Cmd+Z` / `Ctrl+Z` (Undo), `Cmd+Shift+Z` / `Ctrl+Y` (Redo).
- Input focus guard: Ignored when Monaco editor or input fields have text focus to avoid interfering with code editing undo.

---

## 9. Application UI Layout & CSS Specifications (`src/styles.css`)

### 9.1 CSS Grid Layout
```css
main {
  display: grid;
  grid-template-rows: 52px minmax(0, 1fr) 6px var(--bottom-height, 235px);
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: #111416;
  color: #d9e0e5;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
}

.workspace {
  display: grid;
  grid-template-columns: var(--sidebar-width, 250px) 6px minmax(300px, 1fr) 6px var(--sim-width, 50%);
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.bottom {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}
```

### 9.2 Splitter Drag Handlers
- **Left Splitter (`.sidebar-resize-handle`)**: Resizes project sidebar between $180\text{ mm}$ and window limits.
- **Center Splitter (`.resize-handle`)**: Dynamically adjusts editor vs 3D simulation width. Triggers `monacoEditorRef.current.layout()` on drag.
- **Bottom Splitter (`.bottom-resize-handle`)**: Resizes bottom dock (Console & Signals) between $180\text{ px}$ and window height limits.

### 9.3 Color Tokens & Styling Aesthetics
- Background Base: `#111416` (Deep Obsidian)
- Panels & Headers: `#171b1e` / `#1c2023`
- Borders & Separators: `#30363a` / `#3b4247`
- ABB Industrial Gold Accent: `#e9a932` / `#f2b746` (Brand dot, primary buttons, active tabs, PP glyph)
- Terminal Background: `#111416` with font `12px/1.7 ui-monospace, Menlo, Consolas`
- Error Text: `#ff8582` / Status Error: `#ff9a96` on `#482223`
- Status Green (Running/Completed): `#a5dbae` on `#1c3a27`
- Status Amber (Waiting/Paused): `#f2c466` on `#473717`

---

## 10. Step-by-Step AI Recreation Plan

To recreate RAPID Sim cleanly in one go without errors:

1. **Scaffold Project**:
   ```bash
   npm create vite@latest rapid-sim -- --template react-ts
   cd rapid-sim
   npm install @monaco-editor/react three @react-three/fiber @react-three/drei zustand
   npm install -D typescript vite @vitejs/plugin-react @types/three @types/react @types/react-dom
   ```

2. **Implement `src/robotConfig.ts`**:
   - Export `robotGeometry`, `robotReach`, `tableConfig`, `conveyorConfig`, `defaultWorkObjects`, `defaultTcp`.
   - Implement `isOverTable`, `isOverConveyor`, `getFloorZ` (with multi-block stacking logic).
   - Implement `clampToReach`, `isReachable`, `shoulderDistance`.
   - Export types `BlockItem`, `BlockMaterial`, `SceneSnapshot`.

3. **Implement `src/motion.ts`**:
   - Implement 3D vector algebra: `add`, `subtract`, `scale`, `dot`, `cross`.
   - Implement `moveCPosition(start, via, end, ratio)` with circumcenter formulation and collinear fallback.

4. **Implement `src/rapid.ts`**:
   - Define command AST types (`MoveCommand`, `OutputCommand`, `WaitInputCommand`, etc.).
   - Define targets library (`pHome`, `pInit`, etc.) and `blankProjectCode`.
   - Implement `evaluateExpression(expr, context)` recursive descent parser with operators and `DInput`/`DOutput`.
   - Implement `parseDeclaration`, `parseTPWriteArgs`, `formatTPWrite`, `splitTopLevelArgs`.
   - Implement `compile(code, targetLibrary)` with 2-pass parser, recursive procedure compiler, call-stack recursion detection, and control flow jumps (`IF`, `WHILE`, `FOR`).

5. **Implement `src/RobotScene.tsx`**:
   - Construct Three.js ABB IRB 1090 mesh: Base plate, Turntable Axis 1, Knuckle Axis 2, Upper Arm, Elbow Axis 3, Forearm, Wrist Axis 4.
   - Implement analytical IK solver supporting arbitrary pitch angle $\alpha$ and radial fallback.
   - Build `Pen` and `Gripper` end-effectors with animated jaws.
   - Build `TrainingTable`, `ConveyorBelt`, `Workpiece` (with collision and drop animation), `Marker` (spheres with labels and `TransformControls`), and TCP jog marker.
   - Implement background/ground plane click raycasting to clear selection on pointer missed.

6. **Implement `src/App.tsx`**:
   - Wire application state: `code`, `targetPositions`, `customTargets`, `tcp`, `tcpPitch`, `tool`, `blocks`, `tablePosition`, `inputs`, `outputs`, `status`, `speedOverride`.
   - Setup Monaco Editor with Monarch tokens provider for RAPID, error markers, and Program Pointer glyph margin decorations.
   - Implement execution engine (`execute`, `next`, `run`, `step`, `stop`, `reset`) with `requestAnimationFrame` interpolation.
   - Implement Program Pointer actions (`updateProgramPointer`, `resetPPToMain`, `movePPToCursor`).
   - Implement automatic physics loop (conveyor transport, optical sensors B1-B4, inductive sensor B5).
   - Implement project management (New, Save, Export, Import, LocalStorage persistence).
   - Wire Undo / Redo history snapshot system.
   - Build layout with draggable horizontal and vertical splitters.

7. **Implement `src/styles.css`**:
   - Define dark industrial color scheme, CSS Grid layout, splitters, terminal, signals board, context menus, and status badges.

8. **Build & Verify**:
   ```bash
   npm run build
   ```
   Verify 0 TypeScript compiler errors and test all features: code compilation, multi-procedure calls, 3D motion, gripper pick-and-place, digital I/O synchronization, project export/import, and undo/redo.

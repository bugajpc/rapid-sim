// Dimensions in millimetres for the educational IRB 1090-inspired visual model.
// They define a teaching workspace, not an ABB-certified kinematic specification.
export const robotGeometry = {
  shoulderHeight: 350,
  upperArm: 360,
  forearm: 280,
  // Axis 4 wrist centre to the rendered pen tip. This must match the scene
  // geometry so the visible tool endpoint and commanded TCP coincide.
  wristAndTool: 150,
} as const;

export const robotReach = {
  // Tool-tip distance measured from the shoulder axis. The minimum follows from
  // the two-link fold limit plus the fixed wrist/tool extension.
  minimum: Math.abs(robotGeometry.upperArm - robotGeometry.forearm) + robotGeometry.wristAndTool,
  maximum: robotGeometry.upperArm + robotGeometry.forearm + robotGeometry.wristAndTool,
  // Keep lesson targets away from singular, folded, and fully stretched poses.
  comfortableMinimum: 260,
  comfortableMaximum: 740,
} as const;

export const defaultTablePosition: [number, number] = [0, 440];

export type BlockMaterial = "metal" | "plastic";

export type BlockItem = {
  id: string;
  position: [number, number, number];
  material?: BlockMaterial;
  color?: string;
};

export type SceneSnapshot = {
  targets: Record<string, [number, number, number]>;
  customTargets: string[];
  tcp: [number, number, number];
  tcpPitch?: number;
  tool: "pen" | "gripper";
  showTable: boolean;
  tablePosition: [number, number];
  blocks: BlockItem[];
};

export const tableConfig = {
  width: 680,
  depth: 400,
  minX: -340,
  maxX: 340,
  minY: 240,
  maxY: 640,
  topZ: 200,
  plateThickness: 20,
  rows: 4,
  cols: 7,
  holeRadius: 14,
} as const;

export const conveyorConfig = {
  centerX: -195,
  centerY: 440,
  width: 120,
  length: 370,
  beltZ: 216,
  binX: -430,
  binY: 440,
  binZ: 85,
} as const;

export type WorkObjectDef = {
  name: string;
  uframe: [number, number, number]; // [x, y, z] translation
  rotZ?: number; // rotation around Z in degrees
};

export const defaultWorkObjects: Record<string, WorkObjectDef> = {
  wobj0: { name: "wobj0", uframe: [0, 0, 0], rotZ: 0 },
  wobj1: { name: "wobj1", uframe: [-90, 420, 220], rotZ: 0 },
  wobj2: { name: "wobj2", uframe: [110, 420, 220], rotZ: 0 },
};

export function isOverTable(x: number, y: number, tableCenter: [number, number] = defaultTablePosition): boolean {
  const halfWidth = tableConfig.width / 2;
  const halfDepth = tableConfig.depth / 2;
  return (
    x >= tableCenter[0] - halfWidth &&
    x <= tableCenter[0] + halfWidth &&
    y >= tableCenter[1] - halfDepth &&
    y <= tableCenter[1] + halfDepth
  );
}

export function isOverConveyor(x: number, y: number): boolean {
  const halfL = conveyorConfig.length / 2;
  const halfW = conveyorConfig.width / 2;
  return (
    x >= conveyorConfig.centerX - halfL - 10 &&
    x <= conveyorConfig.centerX + halfL + 10 &&
    y >= conveyorConfig.centerY - halfW - 10 &&
    y <= conveyorConfig.centerY + halfW + 10
  );
}

export function getFloorZ(
  x: number,
  y: number,
  hasTable: boolean,
  tableCenter: [number, number] = defaultTablePosition,
  blocks: BlockItem[] = [],
  ignoreBlockId: string | null = null
): number {
  // Base surface height
  let baseZ = 35;
  if (hasTable && isOverTable(x, y, tableCenter)) {
    baseZ = tableConfig.topZ + 35; // 235
  }

  // Check if resting on conveyor
  if (hasTable && isOverConveyor(x, y)) {
    baseZ = Math.max(baseZ, conveyorConfig.beltZ + 25);
  }

  // Check stacking on other blocks (within 42mm horizontal radius)
  let maxStackedZ = baseZ;
  for (const block of blocks) {
    if (block.id === ignoreBlockId) continue;
    const dist = Math.hypot(block.position[0] - x, block.position[1] - y);
    if (dist < 42) {
      const blockHeight = block.id.startsWith("ring") ? 28 : 48;
      const topOfBlock = block.position[2] + blockHeight;
      if (topOfBlock > maxStackedZ) {
        maxStackedZ = topOfBlock;
      }
    }
  }

  return maxStackedZ;
}

export const defaultTcp: [number, number, number] = [220, 340, 480];

export function shoulderDistance([x, y, z]: [number, number, number]) {
  return Math.hypot(Math.hypot(x, y), z - robotGeometry.shoulderHeight);
}

export function isComfortablyReachable(target: [number, number, number]) {
  const distance = shoulderDistance(target);
  return distance >= robotReach.comfortableMinimum && distance <= robotReach.comfortableMaximum;
}

export function isReachable(target: [number, number, number]) {
  const distance = shoulderDistance(target);
  return distance >= robotReach.minimum && distance <= robotReach.maximum;
}

export function clampToReach([x, y, z]: [number, number, number]): [number, number, number] {
  const offsetX = x;
  const offsetY = y;
  const offsetZ = z - robotGeometry.shoulderHeight;
  const distance = Math.hypot(offsetX, offsetY, offsetZ);
  const clampedDistance = Math.min(robotReach.maximum, Math.max(robotReach.minimum, distance));
  if (distance === 0) return [clampedDistance, 0, robotGeometry.shoulderHeight];
  const scale = clampedDistance / distance;
  return [offsetX * scale, offsetY * scale, robotGeometry.shoulderHeight + offsetZ * scale];
}


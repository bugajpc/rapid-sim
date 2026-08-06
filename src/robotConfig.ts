// Dimensions in millimetres for the educational IRB 1090-inspired visual model.
// They define a teaching workspace, not an ABB-certified kinematic specification.
export const robotGeometry = {
  shoulderHeight: 320,
  upperArm: 250,
  forearm: 180,
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
  comfortableMinimum: 280,
  comfortableMaximum: 550,
} as const;

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

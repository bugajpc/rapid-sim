export type Point = [number, number, number];

const add = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const subtract = (a: Point, b: Point): Point => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (point: Point, value: number): Point => [point[0] * value, point[1] * value, point[2] * value];
const dot = (a: Point, b: Point) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Point, b: Point): Point => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

/** Returns the circular path through start, via, and end, or a linear fallback for collinear targets. */
export function moveCPosition(start: Point, via: Point, end: Point, ratio: number): Point {
  const ab = subtract(via, start);
  const ac = subtract(end, start);
  const normal = cross(ab, ac);
  const normalSquared = dot(normal, normal);
  if (normalSquared < 0.0001) return add(start, scale(ac, ratio));

  const centerOffset = scale(add(scale(cross(ac, normal), dot(ab, ab)), scale(cross(normal, ab), dot(ac, ac))), 1 / (2 * normalSquared));
  const center = add(start, centerOffset);
  const fromStart = subtract(start, center);
  const fromVia = subtract(via, center);
  const fromEnd = subtract(end, center);
  const radius = Math.sqrt(dot(fromStart, fromStart));
  const unitNormal = scale(normal, 1 / Math.sqrt(normalSquared));
  const signedAngle = (point: Point) => Math.atan2(dot(unitNormal, cross(fromStart, point)), dot(fromStart, point));
  const positiveAngle = (point: Point) => (signedAngle(point) + Math.PI * 2) % (Math.PI * 2);
  const endAngle = positiveAngle(fromEnd);
  const viaAngle = positiveAngle(fromVia);
  const sweep = viaAngle <= endAngle ? endAngle : endAngle - Math.PI * 2;
  const angle = sweep * ratio;
  const tangent = cross(unitNormal, fromStart);
  return add(center, add(scale(fromStart, Math.cos(angle)), scale(tangent, Math.sin(angle))));
}

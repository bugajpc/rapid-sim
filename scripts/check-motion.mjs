import { moveCPosition } from "../src/motion.ts";

const start = [0, 0, 0];
const via = [1, 1, 0];
const end = [2, 0, 0];
const midpoint = moveCPosition(start, via, end, 0.5);

if (Math.abs(midpoint[0] - 1) > 0.001 || Math.abs(midpoint[1] - 1) > 0.001) {
  throw new Error(`MoveC midpoint does not pass through via target: ${midpoint}`);
}
console.log("MoveC arc interpolation passes through the via target.");

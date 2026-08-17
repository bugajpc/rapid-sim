import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Grid, Line, OrbitControls, Text, TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Raycaster, Vector3 } from "three";
import type { Group } from "three";
import type { ToolKind } from "./rapid";
import { clampToReach, getFloorZ, robotGeometry, tableConfig, type BlockItem } from "./robotConfig";

type Props = {
  tcp: [number, number, number];
  tcpPitch?: number;
  target?: string;
  trail: [number, number, number][];
  targets: Record<string, [number, number, number]>;
  visibleTargets: string[];
  selectedTarget?: string;
  tcpEditing: boolean;
  onSelectTarget: (name: string) => void;
  onSelectTcp: () => void;
  onMoveTarget: (name: string, position: [number, number, number]) => void;
  onMoveTcp: (position: [number, number, number]) => void;
  onDragStart: () => void;
  tool: ToolKind;
  gripperClosed: boolean;
  fadeWhileRunning: boolean;
  blocks: BlockItem[];
  heldBlockId: string | null;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onMoveBlock: (id: string, position: [number, number, number]) => void;
  onBlockContextMenu: (screenPosition: { x: number; y: number }, id: string) => void;
  onTargetContextMenu: (screenPosition: { x: number; y: number }, name: string) => void;
  showTable: boolean;
  tablePosition: [number, number];
  tableEditing: boolean;
  onSelectTable: () => void;
  onMoveTable: (position: [number, number]) => void;
  onClearSelection?: () => void;
};

function Robot({
  tcp,
  tcpPitch = -90,
  editing,
  onSelectTcp,
  onMoveTcp,
  onDragStart,
  tool,
  gripperClosed,
  inspectPoints,
  fadeWhileRunning,
}: {
  tcp: [number, number, number];
  tcpPitch?: number;
  editing: boolean;
  onSelectTcp: () => void;
  onMoveTcp: (position: [number, number, number]) => void;
  onDragStart: () => void;
  tool: ToolKind;
  gripperClosed: boolean;
  inspectPoints: [number, number, number][];
  fadeWhileRunning: boolean;
}) {
  const [tcpObject, setTcpObject] = useState<Group>();
  const model = useRef<Group>(null);
  const raycaster = useRef(new Raycaster());
  const target = useRef(new Vector3());
  const rayDirection = useRef(new Vector3());
  const faded = useRef(false);
  const scale = 1 / 1000;
  const [x, y, z] = tcp.map((value) => value * scale);
  // RAPID coordinates are rendered as world [x, z, -y]. This is a visual six-axis
  // approximation, with the first three axes solved in the same frame as the TCP.
  const baseAngle = Math.atan2(y, x);
  const shoulderHeight = robotGeometry.shoulderHeight * scale;
  const upperArm = robotGeometry.upperArm * scale;
  const forearm = robotGeometry.forearm * scale;
  const wristReach = robotGeometry.wristAndTool * scale;

  const hTcp = Math.hypot(x, y);
  const zTcp = z;
  const targetDir = Math.atan2(zTcp - shoulderHeight, hTcp);
  const targetPitchRad = (tcpPitch * Math.PI) / 180;

  let alpha = targetPitchRad;
  let hWrist = hTcp - wristReach * Math.cos(alpha);
  let zWrist = zTcp - wristReach * Math.sin(alpha);

  let H = hWrist;
  let V = zWrist - shoulderHeight;
  let rawDist = Math.hypot(H, V);
  const minD = Math.abs(upperArm - forearm) + 0.005;
  const maxD = upperArm + forearm - 0.005;

  if (rawDist > maxD || rawDist < minD) {
    // If the requested pitch angle pushes the wrist outside physical reach, fall back gracefully to radial
    alpha = targetDir;
    H = hTcp - wristReach * Math.cos(alpha);
    V = zTcp - wristReach * Math.sin(alpha) - shoulderHeight;
    rawDist = Math.min(Math.max(Math.hypot(H, V), minD), maxD);
  }

  const distance = Math.min(Math.max(rawDist, minD), maxD);
  const beta = Math.atan2(V, H);

  const cosShoulder = Math.min(1, Math.max(-1, (distance ** 2 + upperArm ** 2 - forearm ** 2) / (2 * distance * upperArm)));
  const psiShoulder = Math.acos(cosShoulder);

  const cosElbow = Math.min(1, Math.max(-1, (distance ** 2 - upperArm ** 2 - forearm ** 2) / (2 * upperArm * forearm)));
  const thetaElbow = Math.acos(cosElbow);

  // Standard industrial "Elbow-Up" posture
  const shoulderAngle = beta + psiShoulder;
  const elbowAngle = -thetaElbow;
  const forearmAngle = shoulderAngle + elbowAngle;
  // Align tool with target pitch angle alpha
  const wristPitch = alpha - forearmAngle;
  const wristRoll = Math.sin(baseAngle * 1.8) * 0.5;

  useFrame(({ camera }) => {
    if (!model.current) return;
    const isOccluding = fadeWhileRunning && inspectPoints.some(([pointX, pointY, pointZ]) => {
      target.current.set(pointX / 1000, pointZ / 1000, -pointY / 1000);
      rayDirection.current.subVectors(target.current, camera.position);
      const distanceToPoint = rayDirection.current.length();
      raycaster.current.set(camera.position, rayDirection.current.normalize());
      const hit = raycaster.current.intersectObject(model.current!, true)[0];
      return hit !== undefined && hit.distance < distanceToPoint - 0.015;
    });
    if (isOccluding === faded.current) return;
    faded.current = isOccluding;
    model.current.traverse((child) => {
      if (!("material" in child)) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        material.transparent = isOccluding;
        material.opacity = isOccluding ? 0.28 : 1;
        material.depthWrite = !isOccluding;
        material.needsUpdate = true;
      });
    });
  });
  return (
    <group>
      <group ref={model}>
        {/* 1. Low Industrial Base Pedestal (Podest montażowy robota) */}
        <group position={[0, 0, 0]}>
          {/* Heavy steel floor mounting plate */}
          <mesh position={[0, 0.012, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.34, 0.024, 0.34]} />
            <meshStandardMaterial color="#191e22" roughness={0.45} metalness={0.55} />
          </mesh>
          {/* Steel beveled edge trim */}
          <mesh position={[0, 0.012, 0]}>
            <boxGeometry args={[0.348, 0.018, 0.348]} />
            <meshStandardMaterial color="#3c4852" roughness={0.3} metalness={0.7} />
          </mesh>

          {/* 4 Heavy Anchor Bolt Assemblies */}
          {[
            [-0.138, -0.138],
            [0.138, -0.138],
            [-0.138, 0.138],
            [0.138, 0.138],
          ].map(([bx, bz], idx) => (
            <group key={idx} position={[bx, 0.024, bz]}>
              <mesh position={[0, 0.002, 0]}>
                <cylinderGeometry args={[0.018, 0.018, 0.004, 16]} />
                <meshStandardMaterial color="#738592" metalness={0.8} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.008, 0]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.008, 6]} />
                <meshStandardMaterial color="#55636f" metalness={0.85} roughness={0.25} />
              </mesh>
            </group>
          ))}

          {/* Heavy Riser Stand Column */}
          <mesh position={[0, 0.038, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[0.152, 0.165, 0.028, 36]} />
            <meshStandardMaterial color="#14181b" roughness={0.5} metalness={0.4} />
          </mesh>
          {/* Precision machined top mounting interface flange */}
          <mesh position={[0, 0.054, 0]} castShadow>
            <cylinderGeometry args={[0.144, 0.144, 0.006, 36]} />
            <meshStandardMaterial color="#5d6f7c" metalness={0.75} roughness={0.25} />
          </mesh>

          {/* Rear industrial controller harness connector box */}
          <mesh position={[0, 0.028, 0.165]} castShadow>
            <boxGeometry args={[0.08, 0.036, 0.03]} />
            <meshStandardMaterial color="#21272b" roughness={0.4} metalness={0.5} />
          </mesh>
          <mesh position={[0, 0.028, 0.181]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.006, 16]} />
            <meshStandardMaterial color="#0f1214" roughness={0.8} />
          </mesh>

          {/* Industrial rating tag (machined aluminum) */}
          <mesh position={[0.168, 0.012, 0]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.08, 0.014]} />
            <meshStandardMaterial color="#6a7a88" roughness={0.3} metalness={0.7} />
          </mesh>
        </group>

        {/* 2. ABB IRB 1090 Base and Turntable (Axis 1) - Sleek ABB Light Gray Body */}
        {/* Flared Base Housing Casting */}
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.118, 0.136, 0.05, 48]} />
          <meshStandardMaterial color="#e1e6ec" roughness={0.3} metalness={0.12} />
        </mesh>
        {/* Graphite seal groove & bearing ring */}
        <mesh position={[0, 0.108, 0]} castShadow>
          <cylinderGeometry args={[0.108, 0.116, 0.012, 48]} />
          <meshStandardMaterial color="#1f2529" roughness={0.45} metalness={0.35} />
        </mesh>
        {/* Stainless steel calibration index ring */}
        <mesh position={[0, 0.115, 0]}>
          <cylinderGeometry args={[0.104, 0.104, 0.004, 48]} />
          <meshStandardMaterial color="#8ea0ad" metalness={0.85} roughness={0.18} />
        </mesh>

        {/* Swivel Turntable & Axis 1 Rotation */}
        <group rotation={[0, baseAngle, 0]}>
          {/* Axis 1 Swivel Turntable */}
          <mesh position={[0, 0.142, 0]} castShadow>
            <cylinderGeometry args={[0.096, 0.106, 0.05, 48]} />
            <meshStandardMaterial color="#e1e6ec" roughness={0.3} metalness={0.12} />
          </mesh>
          {/* Rear motor housing casing in graphite */}
          <mesh position={[0, 0.15, 0.068]} castShadow>
            <boxGeometry args={[0.082, 0.06, 0.06]} />
            <meshStandardMaterial color="#1e2428" roughness={0.4} metalness={0.25} />
          </mesh>
          {/* Stainless steel accent ring on base */}
          <mesh position={[0, 0.168, 0]}>
            <cylinderGeometry args={[0.092, 0.092, 0.004, 48]} />
            <meshStandardMaterial color="#8ea0ad" metalness={0.85} roughness={0.18} />
          </mesh>

          {/* Axis 2 Shoulder Pillar Post (Connecting Turntable to Shoulder Joint) */}
          <mesh position={[0, 0.255, 0]} castShadow>
            <cylinderGeometry args={[0.072, 0.088, 0.19, 32]} />
            <meshStandardMaterial color="#e1e6ec" roughness={0.3} metalness={0.12} />
          </mesh>

          {/* Shoulder Joint (Axis 2) Assembly */}
          <group position={[0, shoulderHeight, 0]}>
            {/* Solid Spherical Shoulder Knuckle on Axis 2 */}
            <mesh castShadow receiveShadow>
              <sphereGeometry args={[0.062, 32, 24]} />
              <meshStandardMaterial color="#e1e6ec" roughness={0.3} metalness={0.12} />
            </mesh>

            {/* Axis 2 Servo Hub Medallions (Aligned on rotation axis Z = ±0.062) */}
            {[-0.062, 0.062].map((sideZ, idx) => (
              <group key={idx} position={[0, 0, sideZ]} rotation={[Math.PI / 2, 0, 0]}>
                {/* Outer graphite housing */}
                <mesh castShadow>
                  <cylinderGeometry args={[0.052, 0.052, 0.016, 32]} />
                  <meshStandardMaterial color="#1f2529" roughness={0.4} metalness={0.3} />
                </mesh>
                {/* Stainless steel machined bevel ring */}
                <mesh position={[0, sideZ > 0 ? 0.009 : -0.009, 0]}>
                  <cylinderGeometry args={[0.042, 0.042, 0.003, 32]} />
                  <meshStandardMaterial color="#8ea0ad" metalness={0.85} roughness={0.18} />
                </mesh>
                {/* Center Medallion (Graphite / Steel finish) */}
                <mesh position={[0, sideZ > 0 ? 0.01 : -0.01, 0]}>
                  <cylinderGeometry args={[0.026, 0.026, 0.003, 24]} />
                  <meshStandardMaterial color="#2d363c" metalness={0.6} roughness={0.3} />
                </mesh>
              </group>
            ))}

            {/* Rotating Upper Arm Link (around Axis 2) */}
            <group rotation={[0, 0, shoulderAngle]}>
              {/* Inner joint spherical cap */}
              <mesh castShadow>
                <sphereGeometry args={[0.058, 28, 20]} />
                <meshStandardMaterial color="#e1e6ec" roughness={0.3} metalness={0.12} />
              </mesh>

              {/* Upper Arm Slender Main Cast Beam */}
              <mesh position={[upperArm / 2, 0, 0]} castShadow>
                <boxGeometry args={[upperArm, 0.068, 0.076]} />
                <meshStandardMaterial color="#e1e6ec" roughness={0.3} metalness={0.12} />
              </mesh>

            {/* Upper Arm Recessed Side Cable Trays (Dark Graphite) */}
            <mesh position={[upperArm * 0.5, 0, 0.039]} castShadow>
              <boxGeometry args={[upperArm * 0.74, 0.034, 0.008]} />
              <meshStandardMaterial color="#1e2428" roughness={0.45} metalness={0.25} />
            </mesh>
            <mesh position={[upperArm * 0.5, 0, -0.039]} castShadow>
              <boxGeometry args={[upperArm * 0.74, 0.034, 0.008]} />
              <meshStandardMaterial color="#1e2428" roughness={0.45} metalness={0.25} />
            </mesh>

            {/* ABB Brand Emblem Plate on Upper Arm (Graphite & Metallic) */}
            <mesh position={[upperArm * 0.5, 0.035, 0]}>
              <boxGeometry args={[0.07, 0.002, 0.032]} />
              <meshStandardMaterial color="#2a333a" roughness={0.3} metalness={0.4} />
            </mesh>
            <mesh position={[upperArm * 0.5, 0.036, 0]}>
              <boxGeometry args={[0.058, 0.002, 0.02]} />
              <meshStandardMaterial color="#8ea0ad" metalness={0.8} roughness={0.2} />
            </mesh>

            {/* Axis 3 Elbow Joint Spherical Housing */}
            <mesh position={[upperArm, 0, 0]} castShadow>
              <sphereGeometry args={[0.056, 28, 20]} />
              <meshStandardMaterial color="#e1e6ec" roughness={0.3} metalness={0.12} />
            </mesh>
            {/* Elbow side pivot hubs */}
            {[-0.058, 0.058].map((sideZ, idx) => (
              <group key={idx} position={[upperArm, 0, sideZ]} rotation={[Math.PI / 2, 0, 0]}>
                <mesh castShadow>
                  <cylinderGeometry args={[0.044, 0.044, 0.014, 24]} />
                  <meshStandardMaterial color="#1f2529" roughness={0.4} metalness={0.3} />
                </mesh>
                <mesh position={[0, sideZ > 0 ? 0.008 : -0.008, 0]}>
                  <cylinderGeometry args={[0.034, 0.034, 0.003, 24]} />
                  <meshStandardMaterial color="#8ea0ad" metalness={0.85} roughness={0.18} />
                </mesh>
              </group>
            ))}

            {/* Elbow Joint (Axis 3) & Forearm Link */}
            <group position={[upperArm, 0, 0]} rotation={[0, 0, elbowAngle]}>
              {/* Forearm Slender Tapered Cast Beam */}
              <mesh position={[forearm / 2, 0, 0]} castShadow>
                <boxGeometry args={[forearm, 0.056, 0.062]} />
                <meshStandardMaterial color="#e1e6ec" roughness={0.3} metalness={0.12} />
              </mesh>

              {/* Forearm Top Cable Channel Cover with Machined Steel Pinstripe */}
              <mesh position={[forearm * 0.52, 0.03, 0]} castShadow>
                <boxGeometry args={[forearm * 0.68, 0.008, 0.038]} />
                <meshStandardMaterial color="#1e2428" roughness={0.45} metalness={0.3} />
              </mesh>
              <mesh position={[forearm * 0.52, 0.035, 0]}>
                <boxGeometry args={[forearm * 0.55, 0.002, 0.008]} />
                <meshStandardMaterial color="#8ea0ad" metalness={0.8} roughness={0.2} />
              </mesh>

              {/* Wrist Knuckle & Axes (Axis 4, 5, 6) */}
              <group position={[forearm, 0, 0]} rotation={[0, 0, wristPitch]}>
                {/* Compact spherical wrist knuckle in ABB Light Gray */}
                <mesh castShadow>
                  <sphereGeometry args={[0.044, 28, 20]} />
                  <meshStandardMaterial color="#e1e6ec" roughness={0.3} metalness={0.12} />
                </mesh>

                {/* Rotating Axis 4 Collar */}
                <group rotation={[wristRoll, 0, 0]}>
                  <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
                    <cylinderGeometry args={[0.036, 0.036, 0.078, 24]} />
                    <meshStandardMaterial color="#1f2529" roughness={0.4} metalness={0.3} />
                  </mesh>
                  <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.038, 0.038, 0.01, 24]} />
                    <meshStandardMaterial color="#8ea0ad" metalness={0.85} roughness={0.18} />
                  </mesh>
                </group>

                {/* ISO 9409-1 Tool Mounting Flange (Axis 6) */}
                <mesh position={[0.02, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                  <cylinderGeometry args={[0.034, 0.034, 0.008, 24]} />
                  <meshStandardMaterial color="#2d353b" metalness={0.7} roughness={0.25} />
                </mesh>
                <mesh position={[0.025, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.028, 0.028, 0.003, 24]} />
                  <meshStandardMaterial color="#8ea0ad" metalness={0.9} roughness={0.15} />
                </mesh>

                {/* Tool Rendering (Pen or Gripper) */}
                {tool === "pen" ? (
                  <>
                    <mesh position={[0.048, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                      <cylinderGeometry args={[0.026, 0.032, 0.045, 24]} />
                      <meshStandardMaterial color="#e1e6ec" roughness={0.3} metalness={0.12} />
                    </mesh>
                    <mesh position={[0.088, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                      <cylinderGeometry args={[0.02, 0.02, 0.035, 24]} />
                      <meshStandardMaterial color="#1e2428" metalness={0.6} roughness={0.3} />
                    </mesh>
                    <mesh position={[0.124, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                      <cylinderGeometry args={[0.009, 0.009, 0.035, 16]} />
                      <meshStandardMaterial color="#d8e0e5" metalness={0.85} roughness={0.15} />
                    </mesh>
                  </>
                ) : (
                  <Gripper closed={gripperClosed} />
                )}
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
      {/* Precision TCP indicator point */}
      <group ref={(node) => setTcpObject(node ?? undefined)} position={[x, z, -y]} onClick={(event) => { event.stopPropagation(); onSelectTcp(); }}>
        <mesh castShadow>
          <sphereGeometry args={[editing ? 0.009 : 0.006, 20, 20]} />
          <meshStandardMaterial emissive="#f3ad35" emissiveIntensity={editing ? 1.4 : 0.8} color="#fff2b8" />
        </mesh>
        {editing && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.012, 0.015, 24]} />
            <meshBasicMaterial color="#f3ad35" transparent opacity={0.8} />
          </mesh>
        )}
      </group>
      {editing && tcpObject && <TransformControls object={tcpObject} mode="translate" size={0.5} onMouseDown={onDragStart} onObjectChange={() => {
        const constrained = clampToReach([tcpObject.position.x * 1000, -tcpObject.position.z * 1000, tcpObject.position.y * 1000]);
        tcpObject.position.set(constrained[0] / 1000, constrained[2] / 1000, -constrained[1] / 1000);
        onMoveTcp(constrained);
      }} />}
    </group>
  );
}

function Gripper({ closed }: { closed: boolean }) {
  const jawOffset = closed ? 0.026 : 0.044;
  return (
    <group>
      {/* 1. Wrist ISO mounting adapter flange */}
      <mesh position={[0.012, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.038, 0.042, 0.024, 24]} />
        <meshStandardMaterial color="#252b2f" metalness={0.65} roughness={0.3} />
      </mesh>

      {/* 2. Compact actuator body housing in ABB Light Gray */}
      <mesh position={[0.044, 0, 0]} castShadow>
        <boxGeometry args={[0.042, 0.05, 0.048]} />
        <meshStandardMaterial color="#e1e6ec" metalness={0.15} roughness={0.3} />
      </mesh>

      {/* Graphite & steel accent plate */}
      <mesh position={[0.044, 0, 0.0245]}>
        <boxGeometry args={[0.034, 0.03, 0.002]} />
        <meshStandardMaterial color="#283238" roughness={0.35} metalness={0.5} />
      </mesh>
      {/* Status LED */}
      <mesh position={[0.044, 0, -0.0245]}>
        <boxGeometry args={[0.016, 0.006, 0.002]} />
        <meshBasicMaterial color={closed ? "#5cdb95" : "#78909c"} />
      </mesh>

      {/* 3. Linear slide rail plate */}
      <mesh position={[0.068, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.008, 20]} />
        <meshStandardMaterial color="#7a8b96" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.071, 0, 0]} castShadow>
        <boxGeometry args={[0.005, 0.072, 0.026]} />
        <meshStandardMaterial color="#4f5960" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* 4. Upper Finger (+Y) */}
      <group position={[0.074, jawOffset, 0]}>
        {/* Finger base carriage slider */}
        <mesh position={[0.012, 0, 0]} castShadow>
          <boxGeometry args={[0.02, 0.01, 0.022]} />
          <meshStandardMaterial color="#1e2326" metalness={0.5} roughness={0.35} />
        </mesh>
        {/* Precision finger blade */}
        <mesh position={[0.04, -0.002, 0]} castShadow>
          <boxGeometry args={[0.044, 0.007, 0.018]} />
          <meshStandardMaterial color="#b2bec5" metalness={0.75} roughness={0.2} />
        </mesh>
        {/* Rubberized grip pad on inner face */}
        <mesh position={[0.042, -0.006, 0]}>
          <boxGeometry args={[0.034, 0.003, 0.016]} />
          <meshStandardMaterial color="#14181a" roughness={0.9} />
        </mesh>
      </group>

      {/* 5. Lower Finger (-Y) */}
      <group position={[0.074, -jawOffset, 0]}>
        {/* Finger base carriage slider */}
        <mesh position={[0.012, 0, 0]} castShadow>
          <boxGeometry args={[0.02, 0.01, 0.022]} />
          <meshStandardMaterial color="#1e2326" metalness={0.5} roughness={0.35} />
        </mesh>
        {/* Precision finger blade */}
        <mesh position={[0.04, 0.002, 0]} castShadow>
          <boxGeometry args={[0.044, 0.007, 0.018]} />
          <meshStandardMaterial color="#b2bec5" metalness={0.75} roughness={0.2} />
        </mesh>
        {/* Rubberized grip pad on inner face */}
        <mesh position={[0.042, 0.006, 0]}>
          <boxGeometry args={[0.034, 0.003, 0.016]} />
          <meshStandardMaterial color="#14181a" roughness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

function TargetLabel({ name, active }: { name: string; active: boolean }) {
  const label = useRef<Group>(null);
  const worldPosition = useRef(new Vector3());

  useFrame(({ camera }) => {
    if (!label.current) return;
    label.current.getWorldPosition(worldPosition.current);
    // Keep labels approximately constant in screen space as the camera zooms.
    const scale = Math.min(1.4, Math.max(0.38, camera.position.distanceTo(worldPosition.current) / 2.1));
    label.current.scale.setScalar(scale);
  });

  return (
    <group ref={label} position={[0, 0.045, 0]}>
      <Billboard follow>
        <Text fontSize={0.026} color={active ? "#f4bc54" : "#a7b9c5"}>
          {name}
        </Text>
      </Billboard>
    </group>
  );
}

function Marker({
  name,
  position,
  active,
  editable,
  onSelect,
  onMove,
  onDragStart,
  onContextMenu,
}: {
  name: string;
  position: [number, number, number];
  active: boolean;
  editable: boolean;
  onSelect: () => void;
  onMove: (position: [number, number, number]) => void;
  onDragStart: () => void;
  onContextMenu: (screenPosition: { x: number; y: number }) => void;
}) {
  const [markerObject, setMarkerObject] = useState<Group>();
  const [x, y, z] = position.map((value) => value / 1000);
  return (
    <>
      <group
        ref={(node) => setMarkerObject(node ?? undefined)}
        position={[x, z, -y]}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
        onContextMenu={(event) => {
          event.stopPropagation();
          onContextMenu({ x: event.nativeEvent.clientX, y: event.nativeEvent.clientY });
        }}
      >
        <mesh castShadow>
          <sphereGeometry args={[active ? 0.018 : 0.015, 20, 20]} />
          <meshBasicMaterial color={active ? "#f9b33d" : "#5d718a"} />
        </mesh>
        <TargetLabel name={name} active={active} />
      </group>
      {editable && markerObject && (
        <TransformControls
          object={markerObject}
          mode="translate"
          size={0.5}
          onMouseDown={onDragStart}
          onObjectChange={() => {
            const moved = markerObject.position;
            const constrained = clampToReach([moved.x * 1000, -moved.z * 1000, moved.y * 1000]);
            const clampedZ = Math.max(10, constrained[2]);
            markerObject.position.set(constrained[0] / 1000, clampedZ / 1000, -constrained[1] / 1000);
            onMove([constrained[0], constrained[1], clampedZ]);
          }}
        />
      )}
    </>
  );
}

function TrainingTable({
  position,
  editing,
  onSelect,
  onMove,
  onDragStart,
}: {
  position: [number, number];
  editing: boolean;
  onSelect: () => void;
  onMove: (position: [number, number]) => void;
  onDragStart: () => void;
}) {
  const [tableObject, setTableObject] = useState<Group>();
  const width = tableConfig.width / 1000;
  const depth = tableConfig.depth / 1000;
  const topY = tableConfig.topZ / 1000;
  const plateThickness = tableConfig.plateThickness / 1000;
  const plateCenterY = topY - plateThickness / 2;

  const legHeight = topY - plateThickness;
  const legCenterY = legHeight / 2;
  const legOffsetX = width / 2 - 0.032;
  const legFrontZ = -(depth / 2 - 0.032);
  const legBackZ = depth / 2 - 0.032;

  const holeCols = [-0.27, -0.18, -0.09, 0, 0.09, 0.18, 0.27];
  const holeRows = [-0.135, -0.045, 0.045, 0.135];

  const [tx, ty] = position;
  const worldX = tx / 1000;
  const worldZ = -ty / 1000;

  return (
    <>
      <group
        ref={(node) => setTableObject(node ?? undefined)}
        position={[worldX, 0, worldZ]}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        {/* Tabletop plate */}
        <mesh position={[0, plateCenterY, 0]} castShadow receiveShadow>
          <boxGeometry args={[width, plateThickness, depth]} />
          <meshStandardMaterial color={editing ? "#2b363f" : "#242c33"} roughness={0.32} metalness={0.35} />
        </mesh>
        {/* Tabletop metallic edge trim */}
        <mesh position={[0, plateCenterY, 0]}>
          <boxGeometry args={[width + 0.008, plateThickness * 0.9, depth + 0.008]} />
          <meshStandardMaterial color={editing ? "#82a8c8" : "#4f5e6b"} roughness={0.25} metalness={0.75} />
        </mesh>

        {/* Fixture holes grid */}
        {holeRows.map((hz, rowIndex) =>
          holeCols.map((hx, colIndex) => (
            <group key={`${rowIndex}-${colIndex}`} position={[hx, topY, hz]}>
              {/* Recessed hole socket */}
              <mesh position={[0, -plateThickness / 2, 0]}>
                <cylinderGeometry args={[0.014, 0.014, plateThickness + 0.002, 20]} />
                <meshBasicMaterial color="#0f1316" />
              </mesh>
              {/* Metallic chamfer rim ring */}
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.0006, 0]}>
                <ringGeometry args={[0.014, 0.0185, 24]} />
                <meshStandardMaterial color="#8294a2" metalness={0.8} roughness={0.2} />
              </mesh>
            </group>
          ))
        )}

        {/* 4 table legs */}
        {[
          [-legOffsetX, legFrontZ],
          [legOffsetX, legFrontZ],
          [-legOffsetX, legBackZ],
          [legOffsetX, legBackZ],
        ].map(([lx, lz], idx) => (
          <group key={idx} position={[lx, 0, lz]}>
            {/* Leg column */}
            <mesh position={[0, legCenterY, 0]} castShadow>
              <boxGeometry args={[0.036, legHeight, 0.036]} />
              <meshStandardMaterial color="#1e252a" roughness={0.5} metalness={0.4} />
            </mesh>
            {/* Floor foot pad */}
            <mesh position={[0, 0.004, 0]}>
              <boxGeometry args={[0.046, 0.008, 0.046]} />
              <meshStandardMaterial color="#111518" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Under-table support crossbars */}
        <mesh position={[0, legHeight - 0.02, legFrontZ]} castShadow>
          <boxGeometry args={[width - 0.06, 0.024, 0.018]} />
          <meshStandardMaterial color="#21282e" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, legHeight - 0.02, legBackZ]} castShadow>
          <boxGeometry args={[width - 0.06, 0.024, 0.018]} />
          <meshStandardMaterial color="#21282e" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[-legOffsetX, legHeight - 0.02, 0]} castShadow>
          <boxGeometry args={[0.018, 0.024, depth - 0.06]} />
          <meshStandardMaterial color="#21282e" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[legOffsetX, legHeight - 0.02, 0]} castShadow>
          <boxGeometry args={[0.018, 0.024, depth - 0.06]} />
          <meshStandardMaterial color="#21282e" metalness={0.4} roughness={0.4} />
        </mesh>
      </group>
      {editing && tableObject && (
        <TransformControls
          object={tableObject}
          mode="translate"
          showX
          showY={false}
          showZ
          size={0.65}
          onMouseDown={onDragStart}
          onObjectChange={() => {
            let movedX = Math.round(tableObject.position.x * 1000);
            let movedY = Math.round(-tableObject.position.z * 1000);
            movedX = Math.max(-380, Math.min(380, movedX));
            movedY = Math.max(180, Math.min(680, movedY));
            tableObject.position.set(movedX / 1000, 0, -movedY / 1000);
            onMove([movedX, movedY]);
          }}
        />
      )}
    </>
  );
}

function Workpiece({
  position,
  held,
  editing,
  onSelect,
  onMove,
  onDragStart,
  onContextMenu,
  showTable,
  tablePosition,
}: {
  position: [number, number, number];
  held: boolean;
  editing: boolean;
  onSelect: () => void;
  onMove: (position: [number, number, number]) => void;
  onDragStart: () => void;
  onContextMenu: (screenPosition: { x: number; y: number }) => void;
  showTable: boolean;
  tablePosition: [number, number];
}) {
  const [blockObject, setBlockObject] = useState<Group>();
  const [x, y, z] = position.map((value) => value / 1000);
  return (
    <>
      <group
        ref={(node) => setBlockObject(node ?? undefined)}
        position={[x, z, -y]}
        onClick={(event) => {
          event.stopPropagation();
          if (!held) onSelect();
        }}
        onContextMenu={(event) => {
          event.stopPropagation();
          onContextMenu({ x: event.nativeEvent.clientX, y: event.nativeEvent.clientY });
        }}
      >
        <mesh castShadow>
          <boxGeometry args={[0.07, 0.07, 0.07]} />
          <meshStandardMaterial
            color={held ? "#78a8c8" : editing ? "#f0b64b" : "#4d7fba"}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
      </group>
      {editing && !held && blockObject && (
        <TransformControls
          object={blockObject}
          mode="translate"
          size={0.55}
          onMouseDown={onDragStart}
          onObjectChange={() => {
            const movedX = blockObject.position.x * 1000;
            const movedY = -blockObject.position.z * 1000;
            const minZ = getFloorZ(movedX, movedY, showTable, tablePosition);
            const rawZ = Math.max(minZ, blockObject.position.y * 1000);
            const constrained = clampToReach([movedX, movedY, rawZ]);
            const finalZ = Math.max(minZ, constrained[2]);
            blockObject.position.set(constrained[0] / 1000, finalZ / 1000, -constrained[1] / 1000);
            onMove([constrained[0], constrained[1], finalZ]);
          }}
        />
      )}
    </>
  );
}

export function RobotScene({
  tcp,
  tcpPitch = -90,
  target,
  trail,
  targets,
  visibleTargets,
  selectedTarget,
  tcpEditing,
  onSelectTarget,
  onSelectTcp,
  onMoveTarget,
  onMoveTcp,
  onDragStart,
  tool,
  gripperClosed,
  fadeWhileRunning,
  blocks,
  heldBlockId,
  selectedBlockId,
  onSelectBlock,
  onMoveBlock,
  onBlockContextMenu,
  onTargetContextMenu,
  showTable,
  tablePosition,
  tableEditing,
  onSelectTable,
  onMoveTable,
  onClearSelection,
}: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const handleDragStart = () => {
    setIsDragging(true);
    onDragStart();
  };

  useEffect(() => {
    const handlePointerUp = () => setIsDragging(false);
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, []);

  const inspectPoints = [
    ...visibleTargets.map((name) => targets[name]),
    ...(tool === "gripper" ? blocks.map((b) => b.position) : []),
  ];
  return (
    <Canvas
      shadows
      camera={{ position: [1.25, 1.05, 1.35], fov: 42 }}
      onPointerMissed={() => {
        if (!isDragging) onClearSelection?.();
      }}
    >
      <color attach="background" args={["#10151a"]} />
      <ambientLight intensity={1.1} />
      <directionalLight castShadow position={[2, 3, 2]} intensity={2.2} shadow-mapSize={[1024, 1024]} />
      {/* Invisible ground plane to capture floor clicks and deselect active elements */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, 0]}
        onClick={(event) => {
          event.stopPropagation();
          onClearSelection?.();
        }}
      >
        <planeGeometry args={[12, 12]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <Grid args={[4, 4]} cellSize={0.1} cellThickness={0.6} sectionSize={0.5} sectionThickness={1} cellColor="#263541" sectionColor="#3d5967" fadeDistance={3} position={[0, 0, 0]} />
      {showTable && <TrainingTable position={tablePosition} editing={tableEditing} onSelect={onSelectTable} onMove={onMoveTable} onDragStart={handleDragStart} />}
      <Robot tcp={tcp} tcpPitch={tcpPitch} editing={tcpEditing} onSelectTcp={onSelectTcp} onMoveTcp={onMoveTcp} onDragStart={handleDragStart} tool={tool} gripperClosed={gripperClosed} inspectPoints={inspectPoints} fadeWhileRunning={fadeWhileRunning} />
      {tool === "gripper" &&
        blocks.map((block) => (
          <Workpiece
            key={block.id}
            position={block.position}
            held={heldBlockId === block.id}
            editing={selectedBlockId === block.id}
            onSelect={() => onSelectBlock(block.id)}
            onMove={(position) => onMoveBlock(block.id, position)}
            onDragStart={handleDragStart}
            onContextMenu={(screenPosition) => onBlockContextMenu(screenPosition, block.id)}
            showTable={showTable}
            tablePosition={tablePosition}
          />
        ))}
      {visibleTargets.map((name) => (
        <Marker
          key={name}
          name={name}
          position={targets[name]}
          active={name === target || name === selectedTarget}
          editable={name === selectedTarget}
          onSelect={() => onSelectTarget(name)}
          onMove={(position) => onMoveTarget(name, position)}
          onDragStart={handleDragStart}
          onContextMenu={(screenPosition) => onTargetContextMenu(screenPosition, name)}
        />
      ))}
      {trail.length > 1 && <Line points={trail.map(([x, y, z]) => [x / 1000, z / 1000, -y / 1000])} color="#e3a13c" lineWidth={1.6} transparent opacity={0.9} />}
      <OrbitControls makeDefault enabled={!isDragging} minDistance={0.6} maxDistance={3.5} maxPolarAngle={Math.PI / 2.05} />
    </Canvas>
  );
}

import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Grid, Line, OrbitControls, Text, TransformControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import { ExtrudeGeometry, Path, Raycaster, Shape, Vector3 } from "three";
import type { Group } from "three";
import type { ToolKind } from "./rapid";
import { clampToReach, conveyorConfig, defaultWorkObjects, getFloorZ, robotGeometry, tableConfig, type BlockItem } from "./robotConfig";
import { targets } from "./rapid";

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
  showConveyor?: boolean;
  conveyorRunning?: boolean;
  conveyorDir?: boolean;
  activeWObj?: string;
  sensorsActive?: Record<string, boolean>;
  showPaper?: boolean;
  showToolRack?: boolean;
  showGravityFeeder?: boolean;
  showSorterBins?: boolean;
  showMountingPins?: boolean;
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


function ConveyorBelt({
  running,
  dir,
  sensorsActive = {},
}: {
  running?: boolean;
  dir?: boolean;
  sensorsActive?: Record<string, boolean>;
}) {
  const { centerX, centerY, width, length, beltZ } = conveyorConfig;
  const cx = centerX / 1000;
  const cz = -centerY / 1000;
  const cw = width / 1000;
  const cl = length / 1000;
  const cy = beltZ / 1000;

  // Animation refs for moving belt ribs and spinning drums
  const ribsGroupRef = useRef<Group>(null);
  const leftDrumRef = useRef<Group>(null);
  const rightDrumRef = useRef<Group>(null);
  const motorFanRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (!running) return;
    const speed = (dir ? 1 : -1) * 0.12; // 120 mm/s linear belt speed
    
    // Rotate rollers & motor fan
    const rotDelta = (speed / 0.022) * delta;
    if (leftDrumRef.current) leftDrumRef.current.rotation.x += rotDelta;
    if (rightDrumRef.current) rightDrumRef.current.rotation.x += rotDelta;
    if (motorFanRef.current) motorFanRef.current.rotation.z += rotDelta * 3;

    // Advance belt tread ribs seamlessly
    if (ribsGroupRef.current) {
      ribsGroupRef.current.children.forEach((child) => {
        child.position.x += speed * delta;
        const halfL = cl / 2;
        if (child.position.x < -halfL) {
          child.position.x += cl;
        } else if (child.position.x > halfL) {
          child.position.x -= cl;
        }
      });
    }
  });

  const ribCount = 16;
  const ribSpacing = cl / ribCount;

  return (
    <group position={[cx, 0, cz]}>
      {/* 1. Extruded Aluminum T-Slot Side Beams */}
      {/* Front Beam */}
      <group position={[0, cy - 0.024, cw / 2 + 0.012]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[cl + 0.04, 0.044, 0.024]} />
          <meshStandardMaterial color="#8898a6" metalness={0.88} roughness={0.22} />
        </mesh>
        {/* Longitudinal T-Slot Inset Groove */}
        <mesh position={[0, 0, 0.0125]}>
          <boxGeometry args={[cl + 0.04, 0.008, 0.002]} />
          <meshStandardMaterial color="#2d3741" roughness={0.6} />
        </mesh>
      </group>
      {/* Rear Beam */}
      <group position={[0, cy - 0.024, -cw / 2 - 0.012]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[cl + 0.04, 0.044, 0.024]} />
          <meshStandardMaterial color="#8898a6" metalness={0.88} roughness={0.22} />
        </mesh>
        {/* Longitudinal T-Slot Inset Groove */}
        <mesh position={[0, 0, -0.0125]}>
          <boxGeometry args={[cl + 0.04, 0.008, 0.002]} />
          <meshStandardMaterial color="#2d3741" roughness={0.6} />
        </mesh>
      </group>

      {/* Under-Belt Stainless Slider Bed Plate */}
      <mesh position={[0, cy - 0.004, 0]} receiveShadow>
        <boxGeometry args={[cl, 0.005, cw]} />
        <meshStandardMaterial color="#556471" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 2. Stainless Steel Crowned End Rollers / Drums with Bearings */}
      {/* Left Drum (Discharge / Drive) */}
      <group ref={leftDrumRef} position={[-cl / 2, cy - 0.008, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, cw, 24]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.12} />
        </mesh>
        <mesh position={[0, 0, cw / 2 + 0.014]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.009, 0.009, 0.03, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      {/* Right Drum (Infeed / Idler) */}
      <group ref={rightDrumRef} position={[cl / 2, cy - 0.008, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.022, 0.022, cw, 24]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.95} roughness={0.12} />
        </mesh>
        <mesh position={[0, 0, cw / 2 + 0.014]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.009, 0.009, 0.03, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* 3. Continuous Industrial Rubber Belt with Moving Ribs */}
      {/* Main Top Belt Deck */}
      <mesh position={[0, cy, 0]} receiveShadow>
        <boxGeometry args={[cl, 0.004, cw]} />
        <meshStandardMaterial color="#161a1d" roughness={0.8} metalness={0.12} />
      </mesh>
      {/* Bottom Return Belt */}
      <mesh position={[0, cy - 0.044, 0]} receiveShadow>
        <boxGeometry args={[cl, 0.003, cw]} />
        <meshStandardMaterial color="#14181a" roughness={0.85} metalness={0.1} />
      </mesh>
      {/* Animated Transverse Tread Cleats / Ribs */}
      <group ref={ribsGroupRef}>
        {Array.from({ length: ribCount }).map((_, i) => (
          <mesh key={i} position={[-cl / 2 + i * ribSpacing, cy + 0.0025, 0]}>
            <boxGeometry args={[0.005, 0.002, cw * 0.94]} />
            <meshStandardMaterial color={running ? "#2a343c" : "#1e2428"} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* 4. Industrial Geared Motor Unit (Mounted on Left Drive Drum) */}
      <group position={[-cl / 2 - 0.01, cy - 0.012, cw / 2 + 0.055]}>
        {/* Cast Aluminum Reduction Gearbox */}
        <mesh castShadow>
          <boxGeometry args={[0.055, 0.065, 0.045]} />
          <meshStandardMaterial color="#1e3a5f" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Electric Motor Body with Cooling Fins */}
        <mesh position={[0, 0, 0.042]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.024, 0.024, 0.065, 20]} />
          <meshStandardMaterial color="#1b2530" roughness={0.4} metalness={0.6} />
        </mesh>
        {/* Cooling Fan Cowl & Grille */}
        <mesh position={[0, 0, 0.078]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.022, 0.015, 20]} />
          <meshStandardMaterial color="#0f172a" roughness={0.7} />
        </mesh>
        <group ref={motorFanRef} position={[0, 0, 0.083]}>
          <mesh>
            <boxGeometry args={[0.035, 0.004, 0.002]} />
            <meshBasicMaterial color="#475569" />
          </mesh>
        </group>
        {/* Terminal Junction Box on Top */}
        <mesh position={[0, 0.038, 0.038]}>
          <boxGeometry args={[0.032, 0.02, 0.032]} />
          <meshStandardMaterial color="#2d3748" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Power Cable Gland */}
        <mesh position={[0.018, 0.038, 0.038]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.005, 0.005, 0.008, 12]} />
          <meshStandardMaterial color="#000000" roughness={0.5} />
        </mesh>
      </group>

      {/* 5. Stainless Steel Side Guide Rails with Flared Entry */}
      {/* Front Guide Rail */}
      <group position={[0, cy + 0.022, cw / 2 + 0.004]}>
        <mesh position={[-0.015, 0, 0]}>
          <boxGeometry args={[cl - 0.03, 0.032, 0.004]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Infeed Flared Out Angle on Right */}
        <mesh position={[cl / 2 - 0.015, 0, 0.008]} rotation={[0, -0.4, 0]}>
          <boxGeometry args={[0.035, 0.032, 0.004]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>
      {/* Rear Guide Rail */}
      <group position={[0, cy + 0.022, -cw / 2 - 0.004]}>
        <mesh position={[-0.015, 0, 0]}>
          <boxGeometry args={[cl - 0.03, 0.032, 0.004]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Infeed Flared Out Angle on Right */}
        <mesh position={[cl / 2 - 0.015, 0, -0.008]} rotation={[0, 0.4, 0]}>
          <boxGeometry args={[0.035, 0.032, 0.004]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* 6. Heavy-Duty Support H-Frame Legs with Articulated Feet */}
      {/* Left Legs Stand */}
      <group position={[-cl / 2 + 0.06, 0, 0]}>
        {/* Front Leg */}
        <mesh position={[0, cy / 2 - 0.02, cw / 2 + 0.012]} castShadow>
          <boxGeometry args={[0.028, cy - 0.04, 0.028]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.008, cw / 2 + 0.012]}>
          <cylinderGeometry args={[0.024, 0.024, 0.016, 20]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        {/* Rear Leg */}
        <mesh position={[0, cy / 2 - 0.02, -cw / 2 - 0.012]} castShadow>
          <boxGeometry args={[0.028, cy - 0.04, 0.028]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.008, -cw / 2 - 0.012]}>
          <cylinderGeometry args={[0.024, 0.024, 0.016, 20]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        {/* Cross Bar */}
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[0.024, 0.024, cw + 0.02]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* Right Legs Stand */}
      <group position={[cl / 2 - 0.06, 0, 0]}>
        {/* Front Leg */}
        <mesh position={[0, cy / 2 - 0.02, cw / 2 + 0.012]} castShadow>
          <boxGeometry args={[0.028, cy - 0.04, 0.028]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.008, cw / 2 + 0.012]}>
          <cylinderGeometry args={[0.024, 0.024, 0.016, 20]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        {/* Rear Leg */}
        <mesh position={[0, cy / 2 - 0.02, -cw / 2 - 0.012]} castShadow>
          <boxGeometry args={[0.028, cy - 0.04, 0.028]} />
          <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.008, -cw / 2 - 0.012]}>
          <cylinderGeometry args={[0.024, 0.024, 0.016, 20]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
        {/* Cross Bar */}
        <mesh position={[0, 0.07, 0]}>
          <boxGeometry args={[0.024, 0.024, cw + 0.02]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
        </mesh>
      </group>

      {/* 7. Industrial Optical Sensors B1/B3 and B2/B4 */}
      {/* Infeed Sensor B1 / B3 at X = -60 mm */}
      <group position={[cl / 2 - 0.05, cy + 0.045, -cw / 2 - 0.028]}>
        {/* Stainless Sensor Rod & Clamp */}
        <mesh position={[0, -0.025, 0.012]}>
          <cylinderGeometry args={[0.004, 0.004, 0.05, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Rectangular Sensor Housing (Sick/Omron Style) */}
        <mesh castShadow>
          <boxGeometry args={[0.014, 0.034, 0.022]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.35} />
        </mesh>
        {/* Optical Lens */}
        <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.003, 16]} />
          <meshBasicMaterial color={sensorsActive["B1"] || sensorsActive["B3"] ? "#f59e0b" : "#3b82f6"} />
        </mesh>
        {/* Power LED (Green) */}
        <mesh position={[-0.004, 0.014, -0.007]}>
          <sphereGeometry args={[0.002, 10, 10]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        {/* Signal Active LED (Amber) */}
        <mesh position={[0.004, 0.014, -0.007]}>
          <sphereGeometry args={[0.0022, 10, 10]} />
          <meshBasicMaterial color={sensorsActive["B1"] || sensorsActive["B3"] ? "#eab308" : "#475569"} />
        </mesh>
        <Billboard position={[0, 0.038, 0]}>
          <Text fontSize={0.019} color={sensorsActive["B1"] || sensorsActive["B3"] ? "#fbbf24" : "#94a3b8"} anchorX="center" anchorY="bottom">
            B1 / B3
          </Text>
        </Billboard>
        {/* Retroreflector on opposite side of conveyor */}
        <mesh position={[0, 0, cw + 0.056]}>
          <boxGeometry args={[0.012, 0.022, 0.006]} />
          <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Optical Sensor Beam across conveyor */}
        {!(sensorsActive["B1"] || sensorsActive["B3"]) && (
          <Line
            points={[
              [0, 0, 0.014],
              [0, 0, cw + 0.053],
            ]}
            color="#ef4444"
            lineWidth={1.2}
            transparent
            opacity={0.65}
          />
        )}
      </group>

      {/* Discharge / Packaging Sensor B2 / B4 exactly at X = -310 mm (-195 - 115 = -310) */}
      <group position={[-0.115, cy + 0.045, -cw / 2 - 0.028]}>
        <mesh position={[0, -0.025, 0.012]}>
          <cylinderGeometry args={[0.004, 0.004, 0.05, 12]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[0.014, 0.034, 0.022]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.003, 16]} />
          <meshBasicMaterial color={sensorsActive["B2"] || sensorsActive["B4"] ? "#f59e0b" : "#3b82f6"} />
        </mesh>
        <mesh position={[-0.004, 0.014, -0.007]}>
          <sphereGeometry args={[0.002, 10, 10]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        <mesh position={[0.004, 0.014, -0.007]}>
          <sphereGeometry args={[0.0022, 10, 10]} />
          <meshBasicMaterial color={sensorsActive["B2"] || sensorsActive["B4"] ? "#eab308" : "#475569"} />
        </mesh>
        <Billboard position={[0, 0.038, 0]}>
          <Text fontSize={0.019} color={sensorsActive["B2"] || sensorsActive["B4"] ? "#fbbf24" : "#94a3b8"} anchorX="center" anchorY="bottom">
            B2 / B4
          </Text>
        </Billboard>
        {/* Retroreflector on opposite side of conveyor */}
        <mesh position={[0, 0, cw + 0.056]}>
          <boxGeometry args={[0.012, 0.022, 0.006]} />
          <meshStandardMaterial color="#f97316" roughness={0.3} metalness={0.2} />
        </mesh>
        {/* Optical Sensor Beam across conveyor */}
        {!(sensorsActive["B2"] || sensorsActive["B4"]) && (
          <Line
            points={[
              [0, 0, 0.014],
              [0, 0, cw + 0.053],
            ]}
            color="#ef4444"
            lineWidth={1.2}
            transparent
            opacity={0.65}
          />
        )}
      </group>

      {/* 8. Sloping Discharge Chute & Compact Transparent Waste Storage Area */}
      {/* Compact Sloping Guide Chute */}
      <group position={[-cl / 2 - 0.024, cy - 0.024, 0]}>
        <mesh rotation={[0, 0, -Math.PI / 5.5]} receiveShadow>
          <boxGeometry args={[0.055, 0.003, cw * 0.92]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.2} />
        </mesh>
      </group>

      {/* Transparent Minimalist Waste Drop Zone */}
      <group position={[-cl / 2 - 0.065, -0.125, 0]}>
        {/* Semi-transparent receiver volume */}
        <mesh receiveShadow>
          <boxGeometry args={[0.085, 0.07, cw * 0.92]} />
          <meshStandardMaterial
            color="#38bdf8"
            metalness={0.1}
            roughness={0.15}
            transparent
            opacity={0.18}
            depthWrite={false}
          />
        </mesh>

        {/* Outline contour edges */}
        <Line
          points={[
            [-0.0425, 0.035, -cw * 0.46],
            [0.0425, 0.035, -cw * 0.46],
            [0.0425, 0.035, cw * 0.46],
            [-0.0425, 0.035, cw * 0.46],
            [-0.0425, 0.035, -cw * 0.46],
          ]}
          color="#38bdf8"
          lineWidth={1.2}
          transparent
          opacity={0.55}
        />

        {/* Base outline on floor */}
        <Line
          points={[
            [-0.0425, -0.035, -cw * 0.46],
            [0.0425, -0.035, -cw * 0.46],
            [0.0425, -0.035, cw * 0.46],
            [-0.0425, -0.035, cw * 0.46],
            [-0.0425, -0.035, -cw * 0.46],
          ]}
          color="#0284c7"
          lineWidth={1}
          transparent
          opacity={0.3}
        />

        {/* Minimalist 3D Label */}
        <Billboard position={[0, 0.05, 0]}>
          <Text fontSize={0.014} color="#7dd3fc" anchorX="center" anchorY="bottom">
            Magazyn odpadowy detali
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

function InductiveSensorB5({ active }: { active?: boolean }) {
  const [sx, sy, sz] = targets.pSensorB5;
  const worldX = sx / 1000;
  const worldY = (sz - 25) / 1000;
  const worldZ = -sy / 1000;

  return (
    <group position={[worldX, worldY, worldZ]}>
      <mesh position={[0, -0.02, 0]} castShadow>
        <boxGeometry args={[0.03, 0.04, 0.03]} />
        <meshStandardMaterial color="#334155" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.015, 0]} castShadow>
        <cylinderGeometry args={[0.009, 0.009, 0.035, 24]} />
        <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.034, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.004, 24]} />
        <meshStandardMaterial color={active ? "#38bdf8" : "#0284c7"} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.005, 0.01]}>
        <sphereGeometry args={[0.0025, 12, 12]} />
        <meshBasicMaterial color={active ? "#ef4444" : "#475569"} />
      </mesh>
      <Billboard position={[0, 0.045, 0]}>
        <Text fontSize={0.02} color={active ? "#f59e0b" : "#94a3b8"} anchorX="center" anchorY="bottom">
          B5 (Indukcyjny)
        </Text>
      </Billboard>
    </group>
  );
}

function DrawingPaperSheet({ activeWObj }: { activeWObj?: string }) {
  return (
    <group position={[0, 0.2005, -0.42]}>
      {/* Semi-transparent drawing sheet resting flush on tabletop */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.42, 0.297]} />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.9}
          metalness={0.05}
          transparent
          opacity={0.32}
          depthWrite={false}
        />
      </mesh>

      {/* Subtle outer sheet contour border */}
      <Line
        points={[
          [-0.205, 0.0006, -0.145],
          [0.205, 0.0006, -0.145],
          [0.205, 0.0006, 0.145],
          [-0.205, 0.0006, 0.145],
          [-0.205, 0.0006, -0.145],
        ]}
        color="#94a3b8"
        lineWidth={1}
        transparent
        opacity={0.5}
      />

      {/* Middle divider line separating wobj1 and wobj2 paper sheets */}
      <Line
        points={[
          [0.01, 0.0006, -0.14],
          [0.01, 0.0006, 0.14],
        ]}
        color="#cbd5e1"
        lineWidth={1}
        transparent
        opacity={0.35}
      />

      {/* wobj1 sheet indicator and fiducial origin */}
      <group position={[-0.09, 0.001, 0]}>
        <Billboard position={[0, 0.022, 0]}>
          <Text
            fontSize={0.02}
            color={activeWObj === "wobj1" ? "#eab308" : "#94a3b8"}
            anchorX="center"
            anchorY="bottom"
          >
            wobj1
          </Text>
        </Billboard>
        {/* Origin fiducial ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.004, 0.007, 16]} />
          <meshBasicMaterial color={activeWObj === "wobj1" ? "#eab308" : "#94a3b8"} transparent opacity={0.8} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.003, 12, 12]} />
          <meshBasicMaterial color={activeWObj === "wobj1" ? "#eab308" : "#64748b"} />
        </mesh>
      </group>

      {/* wobj2 sheet indicator and fiducial origin */}
      <group position={[0.11, 0.001, 0]}>
        <Billboard position={[0, 0.022, 0]}>
          <Text
            fontSize={0.02}
            color={activeWObj === "wobj2" ? "#eab308" : "#94a3b8"}
            anchorX="center"
            anchorY="bottom"
          >
            wobj2
          </Text>
        </Billboard>
        {/* Origin fiducial ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.004, 0.007, 16]} />
          <meshBasicMaterial color={activeWObj === "wobj2" ? "#eab308" : "#94a3b8"} transparent opacity={0.8} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.003, 12, 12]} />
          <meshBasicMaterial color={activeWObj === "wobj2" ? "#eab308" : "#64748b"} />
        </mesh>
      </group>
    </group>
  );
}

function GravityFeeder() {
  const [fx, fy] = targets.pFeederPick;
  const worldX = fx / 1000;
  const worldY = 0.2005; // Resting flush on table top (Z=200 mm)
  const worldZ = -fy / 1000;
  const size = 0.07; // Compact 70mm x 70mm zone

  return (
    <group position={[worldX, worldY, worldZ]}>
      {/* 1. Flat semi-transparent pickup zone on table surface */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[size, size]} />
        <meshStandardMaterial
          color="#38bdf8"
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.22}
          depthWrite={false}
        />
      </mesh>

      {/* 2. Delicate perimeter border lines */}
      <Line
        points={[
          [-size / 2, 0.0005, -size / 2],
          [size / 2, 0.0005, -size / 2],
          [size / 2, 0.0005, size / 2],
          [-size / 2, 0.0005, size / 2],
          [-size / 2, 0.0005, -size / 2],
        ]}
        color="#38bdf8"
        lineWidth={1.2}
        transparent
        opacity={0.6}
      />

      {/* 3. Subtle corner registration marks */}
      {[
        [-size / 2, -size / 2],
        [size / 2, -size / 2],
        [size / 2, size / 2],
        [-size / 2, size / 2],
      ].map(([cx, cz], i) => (
        <mesh key={i} position={[cx, 0.0008, cz]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.003, 0.005, 12]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.7} />
        </mesh>
      ))}

      {/* 4. Center crosshair */}
      <Line
        points={[
          [-0.012, 0.0005, 0],
          [0.012, 0.0005, 0],
        ]}
        color="#7dd3fc"
        lineWidth={1}
        transparent
        opacity={0.5}
      />
      <Line
        points={[
          [0, 0.0005, -0.012],
          [0, 0.0005, 0.012],
        ]}
        color="#7dd3fc"
        lineWidth={1}
        transparent
        opacity={0.5}
      />

      {/* 5. Clean, low-profile label */}
      <Billboard position={[0, 0.022, 0]}>
        <Text fontSize={0.014} color="#7dd3fc" anchorX="center" anchorY="bottom">
          Magazyn detali
        </Text>
      </Billboard>
    </group>
  );
}

function SorterBins() {
  const [b1x, b1y, b1z] = targets.pBin1;
  const [b2x, b2y, b2z] = targets.pBin2;
  const [ox, oy] = targets.pAboveObstacle;

  return (
    <group>
      {/* Pojemnik 1 (Tworzywo) */}
      <group position={[b1x / 1000, 0.200, -b1y / 1000]}>
        <mesh position={[0, 0.035, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.095, 0.07, 0.095]} />
          <meshStandardMaterial color="#0284c7" metalness={0.4} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.071, 0]}>
          <boxGeometry args={[0.082, 0.002, 0.082]} />
          <meshBasicMaterial color="#082f49" />
        </mesh>
        <Billboard position={[0, 0.095, 0]}>
          <Text fontSize={0.017} color="#38bdf8" anchorX="center" anchorY="bottom">
            Pojemnik 1 (Tworzywo)
          </Text>
        </Billboard>
      </group>

      {/* Pojemnik 2 (Metal) */}
      <group position={[b2x / 1000, 0.200, -b2y / 1000]}>
        <mesh position={[0, 0.035, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.095, 0.07, 0.095]} />
          <meshStandardMaterial color="#eab308" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.071, 0]}>
          <boxGeometry args={[0.082, 0.002, 0.082]} />
          <meshBasicMaterial color="#451a03" />
        </mesh>
        <Billboard position={[0, 0.095, 0]}>
          <Text fontSize={0.017} color="#facc15" anchorX="center" anchorY="bottom">
            Pojemnik 2 (Metal)
          </Text>
        </Billboard>
      </group>

      {/* Przeszkoda technologiczna pomiędzy strefami */}
      <group position={[ox / 1000, 0.200, -oy / 1000]}>
        <mesh position={[0, 0.09, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.18, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
        <Billboard position={[0, 0.19, 0]}>
          <Text fontSize={0.016} color="#f87171" anchorX="center" anchorY="bottom">
            Przeszkoda
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

function ToolStand() {
  const [rx, ry, rz] = targets.pToolRack;
  return (
    <group position={[rx / 1000, rz / 1000, -ry / 1000]}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.022, 0.06, 24]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      <Billboard position={[0, 0.05, 0]}>
        <Text fontSize={0.018} color="#94a3b8" anchorX="center" anchorY="bottom">
          Stojak narzedzi
        </Text>
      </Billboard>
    </group>
  );
}

function MountingPins({
  targets: targetLib = targets,
  b1Active = false,
}: {
  targets?: Record<string, [number, number, number]>;
  b1Active?: boolean;
}) {
  const [p1x, p1y] = targetLib.pPin1 || targets.pPin1;
  const [p2x, p2y] = targetLib.pPin2 || targets.pPin2;
  const [p4x, p4y] = targetLib.pPallet4 || targets.pPallet4;
  const tableZ = 0.200; // Poziom blatu stołu

  return (
    <group>
      {/* Wałek montażowy nr 1 (większa średnica) */}
      <group position={[p1x / 1000, tableZ, -p1y / 1000]}>
        <mesh position={[0, 0.003, 0]}>
          <cylinderGeometry args={[0.026, 0.028, 0.006, 24]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.055, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.11, 28]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.113, 0]}>
          <cylinderGeometry args={[0.012, 0.016, 0.006, 28]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <Billboard position={[0, 0.13, 0]}>
          <Text fontSize={0.017} color="#38bdf8" anchorX="center" anchorY="bottom">
            Wałek nr 1 (Ø32)
          </Text>
        </Billboard>
      </group>

      {/* Wałek montażowy nr 2 (mniejsza średnica) */}
      <group position={[p2x / 1000, tableZ, -p2y / 1000]}>
        <mesh position={[0, 0.003, 0]}>
          <cylinderGeometry args={[0.022, 0.024, 0.006, 24]} />
          <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.055, 0]} castShadow>
          <cylinderGeometry args={[0.011, 0.011, 0.11, 28]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.15} />
        </mesh>
        <mesh position={[0, 0.113, 0]}>
          <cylinderGeometry args={[0.008, 0.011, 0.006, 28]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
        </mesh>
        <Billboard position={[0, 0.13, 0]}>
          <Text fontSize={0.017} color="#c084fc" anchorX="center" anchorY="bottom">
            Wałek nr 2 (Ø22)
          </Text>
        </Billboard>
      </group>

      {/* Paleta detali 2x2 */}
      <group position={[0.145, tableZ + 0.004, -0.285]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[0.11, 0.008, 0.11]} />
          <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.3} />
        </mesh>
        <Billboard position={[0, 0.025, 0]}>
          <Text fontSize={0.015} color="#94a3b8" anchorX="center" anchorY="bottom">
            Paleta 2x2
          </Text>
        </Billboard>
      </group>

      {/* Czujnik pojemnościowy B1 przy gnieździe 4 */}
      <group position={[(p4x + 28) / 1000, tableZ + 0.022, -p4y / 1000]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.007, 0.007, 0.035, 16]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[-0.018, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.0065, 0.0065, 0.002, 16]} />
          <meshBasicMaterial color={b1Active ? "#10b981" : "#3b82f6"} />
        </mesh>
        <mesh position={[0.016, 0.006, 0]}>
          <sphereGeometry args={[0.002, 10, 10]} />
          <meshBasicMaterial color={b1Active ? "#10b981" : "#475569"} />
        </mesh>
        <Billboard position={[0, 0.025, 0]}>
          <Text fontSize={0.015} color={b1Active ? "#34d399" : "#64748b"} anchorX="center" anchorY="bottom">
            Czujnik B1
          </Text>
        </Billboard>
      </group>
    </group>
  );
}

function Workpiece({
  id,
  position,
  material = "plastic",
  color,
  held,
  editing,
  onSelect,
  onMove,
  onDragStart,
  onContextMenu,
  showTable,
  tablePosition,
  allBlocks = [],
}: {
  id: string;
  position: [number, number, number];
  material?: "metal" | "plastic";
  color?: string;
  held: boolean;
  editing: boolean;
  onSelect: () => void;
  onMove: (position: [number, number, number]) => void;
  onDragStart: () => void;
  onContextMenu: (screenPosition: { x: number; y: number }) => void;
  showTable: boolean;
  tablePosition: [number, number];
  allBlocks?: BlockItem[];
}) {
  const [blockObject, setBlockObject] = useState<Group>();
  const [x, y, z] = position.map((value) => value / 1000);
  const isMetal = material === "metal";

  const ringGeometry = useMemo(() => {
    if (!id.startsWith("ring")) return null;
    const isLarge = id === "ring-1" || id === "ring-2";
    const outerR = isLarge ? 0.034 : 0.024;
    const innerR = isLarge ? 0.0175 : 0.0125;
    const shape = new Shape();
    shape.absarc(0, 0, outerR, 0, Math.PI * 2, false);
    const hole = new Path();
    hole.absarc(0, 0, innerR, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const geom = new ExtrudeGeometry(shape, {
      depth: 0.026,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.0015,
      bevelThickness: 0.0015,
    });
    geom.center();
    return geom;
  }, [id]);

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
        {ringGeometry ? (
          <group>
            {/* Prawdziwy pierścień z otworem przelotowym na wałek */}
            <mesh geometry={ringGeometry} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
              <meshStandardMaterial
                color={
                  held
                    ? "#78a8c8"
                    : editing
                    ? "#f0b64b"
                    : color
                    ? color
                    : id === "ring-1" || id === "ring-2"
                    ? "#38bdf8"
                    : "#a855f7"
                }
                roughness={0.3}
                metalness={0.4}
              />
            </mesh>
            <Billboard position={[0, 0.028, 0]}>
              <Text fontSize={0.014} color="#e2e8f0" anchorX="center" anchorY="bottom">
                {id === "ring-1"
                  ? "Detal 1 (Duży)"
                  : id === "ring-2"
                  ? "Detal 2 (Duży)"
                  : id === "ring-3"
                  ? "Detal 3 (Mały)"
                  : "Detal 4 (Mały / B1)"}
              </Text>
            </Billboard>
          </group>
        ) : (
          <mesh castShadow>
            <boxGeometry args={[0.07, 0.07, 0.07]} />
            <meshStandardMaterial
              color={
                held
                  ? "#78a8c8"
                  : editing
                  ? "#f0b64b"
                  : color
                  ? color
                  : isMetal
                  ? "#cbd5e1"
                  : "#3b82f6"
              }
              roughness={isMetal ? 0.2 : 0.45}
              metalness={isMetal ? 0.85 : 0.1}
            />
          </mesh>
        )}
        {isMetal && !id.startsWith("ring") && (
          <Billboard position={[0, 0.045, 0]}>
            <Text fontSize={0.016} color="#94a3b8" anchorX="center" anchorY="bottom">
              metal
            </Text>
          </Billboard>
        )}
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
            const minZ = getFloorZ(movedX, movedY, showTable, tablePosition, allBlocks, id);
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
  showConveyor = true,
  conveyorRunning = false,
  conveyorDir = false,
  activeWObj,
  sensorsActive = {},
  showPaper = false,
  showToolRack = true,
  showGravityFeeder = true,
  showSorterBins = false,
  showMountingPins = false,
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
      {showTable && showConveyor && (
        <ConveyorBelt running={conveyorRunning} dir={conveyorDir} sensorsActive={sensorsActive} />
      )}
      {showTable && <InductiveSensorB5 active={sensorsActive["B5"]} />}
      {showTable && (tool === "pen" || showPaper) && <DrawingPaperSheet activeWObj={activeWObj} />}
      {showTable && showGravityFeeder && <GravityFeeder />}
      {showTable && showSorterBins && <SorterBins />}
      {showTable && showMountingPins && <MountingPins targets={targets} b1Active={Boolean(sensorsActive["B1"])} />}
      {showTable && showToolRack && <ToolStand />}
      <Robot tcp={tcp} tcpPitch={tcpPitch} editing={tcpEditing} onSelectTcp={onSelectTcp} onMoveTcp={onMoveTcp} onDragStart={handleDragStart} tool={tool} gripperClosed={gripperClosed} inspectPoints={inspectPoints} fadeWhileRunning={fadeWhileRunning} />
      {blocks.map((block) => (
        <Workpiece
          key={block.id}
          id={block.id}
          position={block.position}
          material={block.material}
          color={block.color}
          held={heldBlockId === block.id}
          editing={selectedBlockId === block.id}
          onSelect={() => onSelectBlock(block.id)}
          onMove={(position) => onMoveBlock(block.id, position)}
          onDragStart={handleDragStart}
          onContextMenu={(screenPosition) => onBlockContextMenu(screenPosition, block.id)}
          showTable={showTable}
          tablePosition={tablePosition}
          allBlocks={blocks}
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

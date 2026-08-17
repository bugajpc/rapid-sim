import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, Grid, Line, OrbitControls, Text, TransformControls } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import { Raycaster, Vector3 } from "three";
import type { Group } from "three";
import type { ToolKind } from "./rapid";
import { clampToReach, getFloorZ, robotGeometry, tableConfig, type BlockItem } from "./robotConfig";

type Props = {
  tcp: [number, number, number];
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
};

function Robot({ tcp, editing, onSelectTcp, onMoveTcp, onDragStart, tool, gripperClosed, inspectPoints, fadeWhileRunning }: { tcp: [number, number, number]; editing: boolean; onSelectTcp: () => void; onMoveTcp: (position: [number, number, number]) => void; onDragStart: () => void; tool: ToolKind; gripperClosed: boolean; inspectPoints: [number, number, number][]; fadeWhileRunning: boolean }) {
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
  const horizontal = Math.hypot(x, y);
  const vertical = z - shoulderHeight;
  const targetDistance = Math.hypot(horizontal, vertical);
  const wristDistance = targetDistance - wristReach;
  const distance = Math.min(Math.max(wristDistance, Math.abs(upperArm - forearm) + 0.01), upperArm + forearm - 0.01);
  const direction = Math.atan2(vertical, horizontal);
  const shoulderOffset = Math.acos(Math.min(1, Math.max(-1, (distance ** 2 + upperArm ** 2 - forearm ** 2) / (2 * distance * upperArm))));
  const elbowInterior = Math.acos(Math.min(1, Math.max(-1, (distance ** 2 - upperArm ** 2 - forearm ** 2) / (2 * upperArm * forearm))));
  const shoulderAngle = direction - shoulderOffset;
  const elbowAngle = elbowInterior;
  // The wrist aligns the final 150 mm tool segment with the wrist-to-TCP line.
  const wristPitch = direction - shoulderAngle - elbowAngle;
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
        {/* Compact IRB 1090-inspired base and Axis 1 turntable. */}
        <mesh position={[0, 0.04, 0]} castShadow receiveShadow><cylinderGeometry args={[0.15, 0.18, 0.08, 48]} /><meshStandardMaterial color="#d95b2d" roughness={0.34} metalness={0.1} /></mesh>
        <mesh position={[0, 0.083, 0]} castShadow><cylinderGeometry args={[0.115, 0.14, 0.038, 48]} /><meshStandardMaterial color="#252b2d" roughness={0.5} /></mesh>
        <group rotation={[0, baseAngle, 0]}>
        {/* Axis 2 housing */}
        <mesh position={[0, 0.205, 0]} castShadow><cylinderGeometry args={[0.082, 0.103, 0.19, 32]} /><meshStandardMaterial color="#e86a32" roughness={0.31} metalness={0.08} /></mesh>
        <mesh position={[0, 0.29, 0.078]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.056, 0.056, 0.025, 24]} /><meshStandardMaterial color="#252b2d" /></mesh>
        <mesh position={[0, 0.29, -0.078]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.056, 0.056, 0.025, 24]} /><meshStandardMaterial color="#252b2d" /></mesh>
        <group position={[0, shoulderHeight, 0]} rotation={[0, 0, shoulderAngle]}>
          {/* Axis 2 to Axis 3 upper arm */}
          <mesh position={[upperArm / 2, 0, 0]} castShadow><boxGeometry args={[upperArm, 0.095, 0.12]} /><meshStandardMaterial color="#ed7038" roughness={0.3} metalness={0.06} /></mesh>
          <mesh position={[upperArm * 0.48, 0, 0.064]} castShadow><boxGeometry args={[upperArm * 0.64, 0.038, 0.018]} /><meshStandardMaterial color="#c84c28" roughness={0.42} /></mesh>
          <mesh position={[upperArm, 0, 0]} castShadow><sphereGeometry args={[0.076, 28, 20]} /><meshStandardMaterial color="#d85a2f" roughness={0.31} /></mesh>
          <mesh position={[upperArm, 0, 0.078]} rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.052, 0.052, 0.022, 24]} /><meshStandardMaterial color="#242a2d" /></mesh>
          <group position={[upperArm, 0, 0]} rotation={[0, 0, elbowAngle]}>
            {/* Axis 3 forearm */}
            <mesh position={[forearm / 2, 0, 0]} castShadow><boxGeometry args={[forearm, 0.078, 0.098]} /><meshStandardMaterial color="#e76834" roughness={0.3} metalness={0.06} /></mesh>
            <mesh position={[forearm * 0.52, 0.045, 0]} castShadow><boxGeometry args={[forearm * 0.58, 0.018, 0.064]} /><meshStandardMaterial color="#c54b28" roughness={0.43} /></mesh>
            <group position={[forearm, 0, 0]} rotation={[0, 0, wristPitch]}>
              {/* Spherical wrist: axes 4, 5, and 6. */}
              <mesh castShadow><sphereGeometry args={[0.062, 28, 20]} /><meshStandardMaterial color="#dc602f" roughness={0.29} metalness={0.08} /></mesh>
              <group rotation={[wristRoll, 0, 0]}>
                <mesh rotation={[Math.PI / 2, 0, 0]} castShadow><cylinderGeometry args={[0.046, 0.046, 0.12, 24]} /><meshStandardMaterial color="#242a2d" /></mesh>
              </group>
              {tool === "pen" ? <>
                <mesh position={[0.042, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.038, 0.038, 0.084, 24]} /><meshStandardMaterial color="#e56a35" roughness={0.3} /></mesh>
                <mesh position={[0.095, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.031, 0.031, 0.045, 24]} /><meshStandardMaterial color="#30383a" metalness={0.45} roughness={0.3} /></mesh>
                <mesh position={[0.13, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.013, 0.013, 0.04, 16]} /><meshStandardMaterial color="#d3dad9" metalness={0.7} roughness={0.2} /></mesh>
              </> : <Gripper closed={gripperClosed} />}
            </group>
          </group>
        </group>
        </group>
      </group>
      {/* The glowing marker is the commanded TCP; click it to move the robot manually. */}
      <group ref={(node) => setTcpObject(node ?? undefined)} position={[x, z, -y]} onClick={(event) => { event.stopPropagation(); onSelectTcp(); }}>
        <mesh castShadow><sphereGeometry args={[editing ? 0.018 : 0.012, 16, 16]} /><meshStandardMaterial emissive="#f3ad35" emissiveIntensity={1.8} color="#fff0b0" /></mesh>
        <mesh><sphereGeometry args={[editing ? 0.04 : 0.026, 16, 16]} /><meshBasicMaterial color="#efad35" transparent opacity={0.12} /></mesh>
      </group>
      {editing && tcpObject && <TransformControls object={tcpObject} mode="translate" size={0.6} onMouseDown={onDragStart} onObjectChange={() => {
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

      {/* 2. Compact actuator body housing */}
      <mesh position={[0.044, 0, 0]} castShadow>
        <boxGeometry args={[0.042, 0.05, 0.048]} />
        <meshStandardMaterial color="#2a3237" metalness={0.5} roughness={0.35} />
      </mesh>

      {/* ABB orange accent plate */}
      <mesh position={[0.044, 0, 0.0245]}>
        <boxGeometry args={[0.034, 0.03, 0.002]} />
        <meshStandardMaterial color="#d85a2f" roughness={0.32} metalness={0.1} />
      </mesh>
      {/* Status LED */}
      <mesh position={[0.044, 0, -0.0245]}>
        <boxGeometry args={[0.016, 0.006, 0.002]} />
        <meshBasicMaterial color={closed ? "#5cdb95" : "#f4bc54"} />
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
    const scale = Math.min(1.45, Math.max(0.38, camera.position.distanceTo(worldPosition.current) / 2.1));
    label.current.scale.setScalar(scale);
  });

  return <group ref={label} position={[0, 0.065, 0]}>
    <Billboard follow>
      <Text fontSize={0.03} color={active ? "#f4bc54" : "#a7b9c5"}>{name}</Text>
    </Billboard>
  </group>;
}

function Marker({ name, position, active, editable, onSelect, onMove, onDragStart, onContextMenu }: { name: string; position: [number, number, number]; active: boolean; editable: boolean; onSelect: () => void; onMove: (position: [number, number, number]) => void; onDragStart: () => void; onContextMenu: (screenPosition: { x: number; y: number }) => void }) {
  const [markerObject, setMarkerObject] = useState<Group>();
  const [x, y, z] = position.map((value) => value / 1000);
  return <>
    <group ref={(node) => setMarkerObject(node ?? undefined)} position={[x, z, -y]} onClick={(event) => { event.stopPropagation(); onSelect(); }} onContextMenu={(event) => { event.stopPropagation(); onContextMenu({ x: event.nativeEvent.clientX, y: event.nativeEvent.clientY }); }}>
      <mesh><sphereGeometry args={[active ? 0.03 : 0.021, 16, 16]} /><meshBasicMaterial color={active ? "#f9b33d" : "#5d718a"} /></mesh>
      <TargetLabel name={name} active={active} />
    </group>
    {editable && markerObject && <TransformControls object={markerObject} mode="translate" size={0.55} onMouseDown={onDragStart} onObjectChange={() => {
      const moved = markerObject.position;
      const constrained = clampToReach([moved.x * 1000, -moved.z * 1000, moved.y * 1000]);
      const clampedZ = Math.max(10, constrained[2]);
      markerObject.position.set(constrained[0] / 1000, clampedZ / 1000, -constrained[1] / 1000);
      onMove([constrained[0], constrained[1], clampedZ]);
    }} />}
  </>;
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
    <Canvas shadows camera={{ position: [1.25, 1.05, 1.35], fov: 42 }}>
      <color attach="background" args={["#10151a"]} />
      <ambientLight intensity={1.1} />
      <directionalLight castShadow position={[2, 3, 2]} intensity={2.2} shadow-mapSize={[1024, 1024]} />
      <Grid args={[4, 4]} cellSize={0.1} cellThickness={0.6} sectionSize={0.5} sectionThickness={1} cellColor="#263541" sectionColor="#3d5967" fadeDistance={3} position={[0, 0, 0]} />
      {showTable && <TrainingTable position={tablePosition} editing={tableEditing} onSelect={onSelectTable} onMove={onMoveTable} onDragStart={handleDragStart} />}
      <Robot tcp={tcp} editing={tcpEditing} onSelectTcp={onSelectTcp} onMoveTcp={onMoveTcp} onDragStart={handleDragStart} tool={tool} gripperClosed={gripperClosed} inspectPoints={inspectPoints} fadeWhileRunning={fadeWhileRunning} />
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

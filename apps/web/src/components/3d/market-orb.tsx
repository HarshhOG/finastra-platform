"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Stars } from "@react-three/drei";
import type { Group, Mesh } from "three";

function OrbitalCore() {
  const group = useRef<Group>(null);
  const ring = useRef<Mesh>(null);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.18;
      group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.22) * 0.15;
    }

    if (ring.current) {
      ring.current.rotation.z = state.clock.elapsedTime * 0.32;
    }
  });

  const chartPoints = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => ({
        x: -2.4 + index * 0.37,
        y: Math.sin(index * 0.7) * 0.4 - 1.6
      })),
    []
  );

  return (
    <group ref={group}>
      <Float speed={1.6} rotationIntensity={0.6} floatIntensity={0.8}>
        <mesh>
          <icosahedronGeometry args={[1.3, 8]} />
          <MeshDistortMaterial
            color="#2fffd6"
            emissive="#6ee7ff"
            emissiveIntensity={1.2}
            roughness={0.18}
            metalness={0.6}
            distort={0.42}
            speed={2.2}
          />
        </mesh>
      </Float>

      <mesh ref={ring} rotation={[Math.PI / 2.8, 0, 0]}>
        <torusGeometry args={[2.15, 0.03, 16, 220]} />
        <meshStandardMaterial color="#f8fafc" emissive="#6ee7ff" emissiveIntensity={1.2} />
      </mesh>

      {chartPoints.map((point, index) => (
        <mesh key={index} position={[point.x, point.y, -0.4]}>
          <sphereGeometry args={[0.04, 24, 24]} />
          <meshBasicMaterial color={index % 2 === 0 ? "#2fffd6" : "#ffbf6e"} />
        </mesh>
      ))}
    </group>
  );
}

export function MarketOrb() {
  return (
    <div className="h-[360px] w-full rounded-[32px] border border-white/8 bg-[radial-gradient(circle_at_top,#0f172a,rgba(3,7,18,0.9))] md:h-[520px]">
      <Canvas
        camera={{ position: [0, 0, 5.8], fov: 45 }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: "high-performance", antialias: true }}
      >
        <ambientLight intensity={1.3} />
        <directionalLight intensity={2.2} position={[4, 4, 6]} color="#6ee7ff" />
        <pointLight intensity={1.6} position={[-4, -2, 4]} color="#ffbf6e" />
        <Stars radius={60} depth={40} count={1400} factor={2.4} fade speed={0.7} />
        <OrbitalCore />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.4} />
      </Canvas>
    </div>
  );
}

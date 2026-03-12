"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshTransmissionMaterial, Environment, Sphere } from "@react-three/drei";
import { useRef, Suspense } from "react";
import * as THREE from "three";

function GoldCore() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.x = state.clock.elapsedTime * 0.15;
    ref.current.rotation.y = state.clock.elapsedTime * 0.2;
  });
  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[1.6, 1]} />
        <MeshDistortMaterial color="#D4A843" emissive="#A37E2C" emissiveIntensity={0.6} roughness={0.2} metalness={0.9} distort={0.25} speed={2} />
      </mesh>
    </Float>
  );
}

function GlassShell() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.rotation.x = -state.clock.elapsedTime * 0.08;
    ref.current.rotation.z = state.clock.elapsedTime * 0.12;
  });
  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={ref}>
        <icosahedronGeometry args={[2.4, 2]} />
        <meshPhysicalMaterial color="#1a1a2e" transparent opacity={0.15} roughness={0.1} metalness={0.1} side={THREE.DoubleSide} wireframe />
      </mesh>
    </Float>
  );
}

function OrbitSpheres() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.1;
  });

  const positions: [number, number, number][] = [
    [3, 0.5, 0], [-2.5, 1.5, 1], [1, -2.5, -1.5],
    [-1, 2.8, -0.5], [2.2, -1, 2], [-3, -1.2, -1],
  ];

  return (
    <group ref={groupRef}>
      {positions.map((pos, i) => (
        <Float key={i} speed={2 + i * 0.3} floatIntensity={0.4}>
          <mesh position={pos}>
            <sphereGeometry args={[0.12 + i * 0.03, 16, 16]} />
            <meshStandardMaterial color="#D4A843" emissive="#D4A843" emissiveIntensity={1.5} />
          </mesh>
          {/* Connection line */}
          <mesh position={[pos[0] * 0.5, pos[1] * 0.5, pos[2] * 0.5]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#D4A843" emissive="#D4A843" emissiveIntensity={2} transparent opacity={0.4} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

function Particles() {
  const ref = useRef<THREE.Points>(null!);
  const count = 200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count * 3; i++) positions[i] = (Math.random() - 0.5) * 12;

  useFrame((state) => {
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry>
      <pointsMaterial size={0.015} color="#D4A843" transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

export default function HeroScene() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[5, 5, 5]} intensity={1} color="#D4A843" />
          <pointLight position={[-5, -3, 3]} intensity={0.5} color="#7B61FF" />
          <pointLight position={[0, 3, -5]} intensity={0.3} color="#FF61D8" />
          <GoldCore />
          <GlassShell />
          <OrbitSpheres />
          <Particles />
        </Suspense>
      </Canvas>
    </div>
  );
}

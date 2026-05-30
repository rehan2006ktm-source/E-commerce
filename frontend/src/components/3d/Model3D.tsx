import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Model3DProps {
  mouse: React.MutableRefObject<[number, number]>;
}

export const Model3D = ({ mouse }: Model3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Smooth auto-rotation
    meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
    meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;

    // Follow mouse with interpolation (lerp)
    const targetX = (mouse.current[0] * Math.PI) / 6;
    const targetY = (mouse.current[1] * Math.PI) / 6;

    meshRef.current.rotation.x += (targetY - meshRef.current.rotation.x) * 0.05;
    meshRef.current.rotation.y += (targetX - meshRef.current.rotation.y) * 0.05;
  });

  return (
    <group>
      {/* Dynamic sphere shape with metallic organic glass distortion */}
      <Sphere ref={meshRef} args={[1.5, 64, 64]} scale={1.2}>
        <MeshDistortMaterial
          color="#aa3bff"
          attach="material"
          distort={0.4}
          speed={2}
          roughness={0.1}
          metalness={0.9}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </Sphere>

      {/* Embedded orbiting wireframe toruses for sci-fi look */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.0, 0.04, 16, 100]} />
        <meshBasicMaterial color="#6366f1" opacity={0.3} transparent />
      </mesh>
      <mesh rotation={[0, Math.PI / 4, 0]}>
        <torusGeometry args={[2.3, 0.02, 16, 100]} />
        <meshBasicMaterial color="#3b82f6" opacity={0.2} transparent />
      </mesh>
    </group>
  );
};
export default Model3D;

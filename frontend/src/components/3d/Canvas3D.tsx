import { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Model3D } from './Model3D';

export const Canvas3D = () => {
  const mouse = useRef<[number, number]>([0, 0]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates to [-1, 1] range
      mouse.current = [
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      ];
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="w-full h-[500px] md:h-[600px] lg:h-[700px] relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        <spotLight position={[5, 15, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />

        <Model3D mouse={mouse} />

        {/* Adds realistic shadow underneath the product */}
        <ContactShadows
          position={[0, -2, 0]}
          opacity={0.6}
          scale={10}
          blur={1.5}
          far={4}
        />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.5}
        />
      </Canvas>
      {/* Visual instructions overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-500 bg-gray-950/65 px-4 py-2 rounded-full border border-gray-800/80 backdrop-blur pointer-events-none">
        Move your mouse to tilt, drag to rotate
      </div>
    </div>
  );
};

export default Canvas3D;


import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  PerspectiveCamera, 
  Stars, 
  Float, 
  Environment, 
  ContactShadows, 
  Html 
} from '@react-three/drei';
import * as THREE from 'three';

const COMPONENT_DETAILS: Record<string, { title: string; desc: string; specs: string }> = {
  stator: { title: "Stator Shell", desc: "Heat-dissipating external housing. Subject to environmental thermal stress.", specs: "Material: Grade 30 Cast Iron" },
  shaft: { title: "Main Shaft", desc: "Rotational core transmitting torque from electrical to mechanical load.", specs: "RPM Max: 4500, Material: SCM440" },
  bearing: { title: "Bearing Hub", desc: "The primary friction point. Highly susceptible to vibrational fatigue.", specs: "Type: SKF Explorer, Tolerances: ABEC-7" },
  fan: { title: "Cooling Impeller", desc: "Self-driven ventilation system. Critical for thermal stability.", specs: "Flow: 240 m³/h, Material: Polymer PA66" },
  core: { title: "Induction Core", desc: "Electromagnetic hub where primary energy conversion occurs.", specs: "Insulation: Class H, Copper Purity: 99.99%" }
};

const Annotation = ({ position, label, sublabel, isActive, onClick }: { position: [number, number, number], label: string, sublabel?: string, isActive?: boolean, onClick?: () => void }) => (
  <Html position={position} distanceFactor={10}>
    <div 
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      className={`pointer-events-auto cursor-pointer select-none backdrop-blur-md border p-2 rounded-lg shadow-2xl whitespace-nowrap transition-all duration-300 ${
        isActive 
          ? 'bg-blue-600 border-blue-400 scale-110 -translate-y-2' 
          : 'bg-slate-900/80 border-slate-700 hover:border-blue-500'
      }`}
    >
      <div className="flex items-center space-x-2">
        <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-blue-500'} shadow-[0_0_8px_rgba(59,130,246,0.5)]`} />
        <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-white' : 'text-slate-200'}`}>{label}</span>
      </div>
      {sublabel && !isActive && <div className="text-[8px] text-slate-400 mt-0.5 ml-3.5 uppercase">{sublabel}</div>}
    </div>
  </Html>
);

const MotorModel = ({ rpm, stress, xray, selectedPart, onPartClick }: { rpm: number; stress: number; xray: boolean; selectedPart: string | null; onPartClick: (id: string) => void }) => {
  const rotorRef = useRef<THREE.Group>(null);
  const statorMat = useRef<THREE.MeshStandardMaterial>(null);
  const bearingMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((state, delta) => {
    if (rotorRef.current) {
      rotorRef.current.rotation.z += (rpm / 600) * delta;
    }

    // Dynamic Stress Color Mapping: Interpolate Green -> Yellow -> Red
    const stressFactor = Math.min(1, stress / 100);
    const stressColor = new THREE.Color().lerpColors(
      new THREE.Color('#10b981'), // Optimal (Green)
      new THREE.Color('#ef4444'), // Critical (Red)
      stressFactor
    );

    if (statorMat.current) {
      statorMat.current.emissive.copy(stressColor);
      statorMat.current.emissiveIntensity = xray ? 0.05 : stressFactor * 0.7;
      statorMat.current.opacity = xray ? 0.15 : 1.0;
    }
    
    if (bearingMat.current) {
      bearingMat.current.emissive.copy(stressColor);
      bearingMat.current.emissiveIntensity = stressFactor * 2.0;
    }
  });

  return (
    <group>
      {/* Outer Stator Case */}
      <mesh 
        rotation={[0, 0, Math.PI / 2]}
        onClick={(e) => { e.stopPropagation(); onPartClick('stator'); }}
      >
        <cylinderGeometry args={[1.8, 1.8, 4.2, 32]} />
        <meshStandardMaterial 
          ref={statorMat}
          color={selectedPart === 'stator' ? '#3b82f6' : '#273549'}
          metalness={0.9}
          roughness={0.1}
          transparent
          side={THREE.DoubleSide}
        />
      </mesh>

      <group ref={rotorRef}>
        {/* Shaft */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 6, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0} />
        </mesh>
        {/* Core Hub */}
        <mesh onClick={(e) => { e.stopPropagation(); onPartClick('core'); }}>
          <sphereGeometry args={[1.4, 32, 16]} />
          <meshStandardMaterial 
            color="#3b82f6" 
            wireframe={xray} 
            transparent 
            opacity={xray ? 0.6 : 0.1} 
            emissive="#3b82f6" 
            emissiveIntensity={0.5} 
          />
        </mesh>
      </group>

      {/* Critical Bearing Component */}
      <mesh 
        position={[2.3, 0, 0]} 
        rotation={[0, 0, Math.PI / 2]}
        onClick={(e) => { e.stopPropagation(); onPartClick('bearing'); }}
      >
        <cylinderGeometry args={[0.6, 0.6, 0.5, 16]} />
        <meshStandardMaterial ref={bearingMat} color="#475569" metalness={1} />
      </mesh>

      <Annotation isActive={selectedPart === 'stator'} onClick={() => onPartClick('stator')} position={[0, 2, 0]} label="Stator" sublabel="Case Integrity" />
      <Annotation isActive={selectedPart === 'bearing'} onClick={() => onPartClick('bearing')} position={[2.5, 1, 0]} label="Bearing" sublabel="Friction Point" />
      <Annotation isActive={selectedPart === 'core'} onClick={() => onPartClick('core')} position={[0, -1, 1.5]} label="Hub" sublabel="Internal State" />
    </group>
  );
};

const DigitalTwinCanvas: React.FC<{ rpm: number; vibration: number; stress: number }> = ({ rpm, vibration, stress }) => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [xray, setXray] = useState(false);

  return (
    <div className="w-full h-full bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 shadow-2xl">
      <div className="absolute top-6 right-6 z-20">
         <button 
           onClick={() => setXray(!xray)}
           className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
             xray ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
           }`}
         >
           {xray ? 'Normal View' : 'X-Ray Stress Mode'}
         </button>
      </div>

      {selectedPart && (
        <div className="absolute top-24 left-6 z-20 w-64 bg-slate-900/95 backdrop-blur-2xl border border-blue-500/50 p-6 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-left-4">
           <div className="flex justify-between items-start mb-4">
              <h4 className="text-blue-400 text-xs font-black uppercase tracking-widest">{COMPONENT_DETAILS[selectedPart].title}</h4>
              <button onClick={() => setSelectedPart(null)} className="text-slate-500 hover:text-white transition-colors">✕</button>
           </div>
           <p className="text-[11px] text-slate-300 leading-relaxed mb-4">{COMPONENT_DETAILS[selectedPart].desc}</p>
           <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <p className="text-[9px] font-mono text-emerald-500">{COMPONENT_DETAILS[selectedPart].specs}</p>
           </div>
        </div>
      )}

      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[12, 8, 12]} fov={35} />
        <OrbitControls enablePan={false} autoRotate={!selectedPart && rpm < 50} autoRotateSpeed={0.5} />
        <Environment preset="night" />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3b82f6" />
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <MotorModel rpm={rpm} stress={stress} xray={xray} selectedPart={selectedPart} onPartClick={setSelectedPart} />
        </Float>
        <ContactShadows position={[0, -2.5, 0]} opacity={0.4} scale={15} blur={2.5} far={4.5} />
        <gridHelper args={[40, 40, 0x1e293b, 0x0f172a]} position={[0, -2.5, 0]} />
      </Canvas>
    </div>
  );
};

export default DigitalTwinCanvas;

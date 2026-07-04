"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Environment, Float, MeshTransmissionMaterial } from '@react-three/drei';

// --- ETHEREAL GLASS RIBBON ---
// Inspired by the flowing glass ribbon from "Evoke Studio" and the surreal dispersion art.
const FlowingRibbon = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (meshRef.current) {
      // Very slow, majestic rotation
      meshRef.current.rotation.y = time * 0.05;
      meshRef.current.rotation.x = time * 0.03;
      meshRef.current.rotation.z = Math.sin(time * 0.05) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} scale={1.5}>
        {/* A complex torus knot acts as an organic, flowing ribbon when heavily refracted */}
        <torusKnotGeometry args={[1.5, 0.4, 256, 32, 2, 3]} />
        <MeshTransmissionMaterial 
          backside={true}
          samples={4}
          thickness={1.5}
          roughness={0.05}
          ior={1.4}
          chromaticAberration={0.06}
          anisotropy={0.3}
          distortion={0.5}
          distortionScale={0.2}
          temporalDistortion={0.1}
          clearcoat={1}
          attenuationDistance={0.5}
          attenuationColor="#ffffff"
          color="#d0d0ff"
        />
      </mesh>
    </Float>
  );
};

// --- FLOATING CRYSTAL SHARDS ---
// Inspired by the "shattering glass face" and "infinite creativity" cross.
const CrystalShards = () => {
  const groupRef = useRef<THREE.Group>(null);
  
  const shards = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 5
      );
      const rotation = new THREE.Euler(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      const scale = Math.random() * 0.4 + 0.1;
      return { position, rotation, scale, offset: Math.random() * 10 };
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.02;
      groupRef.current.children.forEach((child, i) => {
        child.rotation.x += 0.005;
        child.rotation.y += 0.005;
        child.position.y += Math.sin(time + shards[i].offset) * 0.002;
      });
    }
  });

  return (
    <group ref={groupRef}>
      {shards.map((props, i) => (
        <mesh key={i} position={props.position} rotation={props.rotation} scale={props.scale}>
          <octahedronGeometry args={[1, 0]} />
          <MeshTransmissionMaterial 
            thickness={0.5}
            roughness={0.1}
            ior={1.5}
            chromaticAberration={0.1}
            color="#ffffff"
          />
        </mesh>
      ))}
    </group>
  );
};

// --- CINEMATIC POST-PROCESSING ---
const CinematicPostProcessing = () => {
  const { gl, scene, camera, size } = useThree();
  const composer = useRef<any>(null);
  
  useEffect(() => {
    const comp = new EffectComposer(gl);
    
    const renderPass = new RenderPass(scene, camera);
    comp.addPass(renderPass);
    
    // Very subtle, elegant bloom to make the glass highlights glow
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height), 
      0.6,  // subtle strength
      0.8,  // soft wide radius
      0.5   // high threshold so only bright reflections bloom
    );
    comp.addPass(bloomPass);
    
    composer.current = comp;
    
    return () => {
      composer.current = null;
    };
  }, [gl, scene, camera, size]);

  useEffect(() => {
    if (composer.current) {
      composer.current.setSize(size.width, size.height);
    }
  }, [size]);

  useFrame(() => {
    if (composer.current) {
      composer.current.render();
    }
  }, 1);

  return null;
};

interface Props {
  alignmentScore?: number;
  theme?: 'light' | 'dark';
}

export default function AdvancedRealityEngine({ theme = 'dark' }: Props) {
  return (
    <Canvas 
      camera={{ position: [0, 0, 7], fov: 45 }} 
      className="absolute inset-0 w-full h-full pointer-events-auto" 
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} 
    >
      <Environment preset="city" />
      {/* Dynamic lighting to catch the glass edges */}
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} intensity={2} angle={0.2} penumbra={1} color="#e0e0ff" />
      <pointLight position={[-10, -10, -5]} intensity={1} color="#6020ff" />
      
      <FlowingRibbon />
      <CrystalShards />
      
      <CinematicPostProcessing />
    </Canvas>
  );
}

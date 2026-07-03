import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 3D Simplex Noise function for the vertex shader
const NOISE_GLSL = `
// GLSL textureless classic 3D noise "cnoise",
// with an RSL-style periodic variant "pnoise".
// Author:  Stefan Gustavson (stefan.gustavson@liu.se)
// Version: 2011-10-11
//
// Many thanks to Ian McEwan of Ashima Arts for the
// ideas for permutation and gradient selection.
//
// Copyright (c) 2011 Stefan Gustavson. All rights reserved.
// Distributed under the MIT license. See LICENSE file.
// https://github.com/stegu/webgl-noise
//

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

  // First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 = v - i + dot(i, C.xxx) ;

  // Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

  // Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

  // Gradients: 7x7 points over a square, mapped onto an octahedron.
  // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

  //Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

  // Mix final noise value
  vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;

const vertexShader = `
uniform float uTime;
uniform float uDistortionFrequency;
uniform float uDistortionStrength;
uniform float uDisplacementFrequency;
uniform float uDisplacementStrength;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

${NOISE_GLSL}

void main() {
  vUv = uv;
  
  // Create flowing displacement based on noise and time
  float noiseValue = snoise(position * uDistortionFrequency + uTime * 0.2) * uDistortionStrength;
  float displacementValue = snoise(position * uDisplacementFrequency - uTime * 0.3) * uDisplacementStrength;
  
  vec3 displacedPosition = position + normal * (noiseValue + displacementValue);
  
  // Recalculate normal for the displaced surface
  // This is a simplified approximation. For perfect lighting, we'd need to calculate the actual derivative.
  vec3 displacedNormal = normalize(normal + vec3(noiseValue * 0.5));
  vNormal = normalMatrix * displacedNormal;
  
  vec4 mvPosition = modelViewMatrix * vec4(displacedPosition, 1.0);
  vViewPosition = -mvPosition.xyz;
  
  gl_Position = projectionMatrix * mvPosition;
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uFresnelPower;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 viewDir = normalize(vViewPosition);
  
  // Calculate Fresnel effect (iridescence mapped to viewing angle)
  float fresnelTerm = dot(viewDir, normal);
  fresnelTerm = clamp(1.0 - fresnelTerm, 0.0, 1.0);
  fresnelTerm = pow(fresnelTerm, uFresnelPower);
  
  // Dynamic color mixing based on UVs, time, and Fresnel
  float mix1 = sin(vUv.x * 10.0 + uTime * 0.5) * 0.5 + 0.5;
  float mix2 = cos(vUv.y * 10.0 - uTime * 0.3) * 0.5 + 0.5;
  
  // Iridescent blending
  vec3 baseColor = mix(uColor1, uColor2, mix1);
  vec3 iridescentColor = mix(baseColor, uColor3, fresnelTerm);
  
  // Add some fake specular highlights
  float specular = pow(max(dot(normal, normalize(vec3(1.0, 1.0, 1.0))), 0.0), 32.0);
  
  vec3 finalColor = iridescentColor + specular * 0.3;
  
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

interface Props {
  theme: 'light' | 'dark';
}

export default function WebGLFluidPrism({ theme }: Props) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Define colors based on theme
  const colors = useMemo(() => {
    if (theme === 'light') {
      return {
        c1: new THREE.Color('#ffffff'), // Pure white
        c2: new THREE.Color('#e0f2fe'), // Soft cyan
        c3: new THREE.Color('#fdf4ff'), // Soft pink iridescent edge
      };
    } else {
      return {
        c1: new THREE.Color('#1e1b4b'), // Deep indigo
        c2: new THREE.Color('#4c1d95'), // Vibrant violet
        c3: new THREE.Color('#00f2fe'), // Neon cyan iridescent edge
      };
    }
  }, [theme]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor1: { value: colors.c1 },
      uColor2: { value: colors.c2 },
      uColor3: { value: colors.c3 },
      uDistortionFrequency: { value: 1.5 },
      uDistortionStrength: { value: 0.6 },
      uDisplacementFrequency: { value: 2.5 },
      uDisplacementStrength: { value: 0.3 },
      uFresnelPower: { value: 2.5 },
    }),
    []
  );

  // Update uniforms when theme changes
  useMemo(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor1.value = colors.c1;
      materialRef.current.uniforms.uColor2.value = colors.c2;
      materialRef.current.uniforms.uColor3.value = colors.c3;
    }
  }, [colors]);

  useFrame((state) => {
    const { clock } = state;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.getElapsedTime() * 0.5;
    }
    if (meshRef.current) {
      // Very slow, majestic rotation
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.1;
      meshRef.current.rotation.z = clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} scale={2.5}>
      <icosahedronGeometry args={[1, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  );
}

// src/components/common/HeroAnimation.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Beautiful Three.js animation showing rotating delivery vehicles and network nodes
// Creates a modern, animated hero scene that captures RightRoute's essence
// Optimized for performance on lower-end devices common in Uganda

export default function HeroAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0x0f172a); // Dark slate background

    // Camera setup
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup with antialiasing for smooth edges
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x60a5fa, 1);
    pointLight.position.set(5, 5, 5);
    pointLight.castShadow = true;
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0x06b6d4, 0.8);
    pointLight2.position.set(-5, 3, 3);
    scene.add(pointLight2);

    // Create central rotating cube (represents the RightRoute hub)
    const cubeGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const cubeMaterial = new THREE.MeshPhongMaterial({
      color: 0x3b82f6,
      shininess: 100,
      emissive: 0x1e40af,
    });
    const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    // Create orbiting spheres (represent drivers/orders)
    const sphereGeometry = new THREE.IcosahedronGeometry(0.3, 4);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x06b6d4,
      shininess: 100,
      emissive: 0x0891b2,
    });

    const orbitingSpheres = [];
    const sphereCount = 6;

    for (let i = 0; i < sphereCount; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      scene.add(sphere);
      orbitingSpheres.push({
        mesh: sphere,
        angle: (i / sphereCount) * Math.PI * 2,
        radius: 3,
        speed: 0.005 + Math.random() * 0.005,
      });
    }

    // Create connecting lines (represent network/connections)
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = [];

    orbitingSpheres.forEach((sphere, index) => {
      const nextIndex = (index + 1) % orbitingSpheres.length;
      linePositions.push(0, 0, 0); // Center
      linePositions.push(0, 0, 0); // To sphere

      linePositions.push(0, 0, 0); // Sphere to next
      linePositions.push(0, 0, 0); // Next sphere
    });

    lineGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x06b6d4, transparent: true, opacity: 0.3 });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);

    // Animation loop
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);

      // Rotate central cube
      cube.rotation.x += 0.005;
      cube.rotation.y += 0.008;
      cube.rotation.z += 0.003;

      // Update orbiting spheres
      const positions = lineGeometry.attributes.position.array as Float32Array;
      let posIndex = 0;

      orbitingSpheres.forEach((sphere, index) => {
        sphere.angle += sphere.speed;

        const x = Math.cos(sphere.angle) * sphere.radius;
        const y = Math.sin(sphere.angle) * sphere.radius * 0.5;
        const z = Math.sin(sphere.angle * 0.5) * sphere.radius * 0.3;

        sphere.mesh.position.set(x, y, z);

        // Update line positions (from center to sphere)
        positions[posIndex++] = 0;
        positions[posIndex++] = 0;
        positions[posIndex++] = 0;
        positions[posIndex++] = x;
        positions[posIndex++] = y;
        positions[posIndex++] = z;

        // Line to next sphere
        const nextIndex = (index + 1) % orbitingSpheres.length;
        const nextSphere = orbitingSpheres[nextIndex];
        positions[posIndex++] = x;
        positions[posIndex++] = y;
        positions[posIndex++] = z;
        positions[posIndex++] = nextSphere.mesh.position.x;
        positions[posIndex++] = nextSphere.mesh.position.y;
        positions[posIndex++] = nextSphere.mesh.position.z;
      });

      lineGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };

    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;

      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      renderer.dispose();
      cubeGeometry.dispose();
      cubeMaterial.dispose();
      sphereGeometry.dispose();
      sphereMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
}

'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Eye, Volume2, Mic, Activity } from 'lucide-react';

interface GeminiLiveAvatar3DProps {
  isListening: boolean;
  isSpeaking: boolean;
  isThinking: boolean;
  audioLevel?: number; // 0 ~ 100 실시간 음량
  emotion?: 'neutral' | 'happy' | 'thoughtful' | 'empathetic';
}

export default function GeminiLiveAvatar3D({
  isListening,
  isSpeaking,
  isThinking,
  audioLevel = 0,
  emotion = 'empathetic'
}: GeminiLiveAvatar3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const avatarGroupRef = useRef<THREE.Group | null>(null);

  // 애니메이션 제어용 참조
  const headMeshRef = useRef<THREE.Mesh | null>(null);
  const leftEyeRef = useRef<THREE.Mesh | null>(null);
  const rightEyeRef = useRef<THREE.Mesh | null>(null);
  const mouthRef = useRef<THREE.Mesh | null>(null);
  const ring1Ref = useRef<THREE.Mesh | null>(null);
  const ring2Ref = useRef<THREE.Mesh | null>(null);
  const ring3Ref = useRef<THREE.Mesh | null>(null);
  const coreRef = useRef<THREE.Mesh | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  // 마우스 시선 추적 상태
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const manualRotation = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight || 340;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0.3, 3.8);
    cameraRef.current = camera;

    // 2. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Lighting (미래형 네온 사이버 조명)
    const ambientLight = new THREE.AmbientLight(0x221133, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x9966ff, 2.5); // 보라빛 키라이트
    keyLight.position.set(2, 3, 2);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x00ffcc, 3.0); // 틸/에메랄드 림라이트
    rimLight.position.set(-2, -1, -2);
    scene.add(rimLight);

    const frontLight = new THREE.PointLight(0xffffff, 1.5, 10);
    frontLight.position.set(0, 0, 3);
    scene.add(frontLight);

    // 4. Avatar Main Group
    const avatarGroup = new THREE.Group();
    scene.add(avatarGroup);
    avatarGroupRef.current = avatarGroup;

    // (A) Head Geometry & Material (반투명 사이버 글래스 페이스)
    const headGeo = new THREE.SphereGeometry(0.72, 32, 32);
    headGeo.scale(0.9, 1.15, 0.95); // 유기적인 두상 비율
    const headMat = new THREE.MeshPhysicalMaterial({
      color: 0x181530,
      metalness: 0.2,
      roughness: 0.15,
      transmission: 0.6, // 글래스 느낌
      thickness: 0.5,
      ior: 1.4,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 0.3;
    avatarGroup.add(headMesh);
    headMeshRef.current = headMesh;

    // (B) Inner Neural Core (두뇌 내부에서 빛나는 지능 코어)
    const brainGeo = new THREE.IcosahedronGeometry(0.45, 2);
    const brainMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    const brainMesh = new THREE.Mesh(brainGeo, brainMat);
    headMesh.add(brainMesh);

    // (C) Eyes (빛나는 바이오닉 눈)
    const eyeGeo = new THREE.CapsuleGeometry(0.065, 0.14, 8, 16);
    eyeGeo.rotateZ(Math.PI / 2);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x60a5fa });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.25, 0.38, 0.65);
    avatarGroup.add(leftEye);
    leftEyeRef.current = leftEye;

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.25, 0.38, 0.65);
    avatarGroup.add(rightEye);
    rightEyeRef.current = rightEye;

    // (D) Mouth (말할 때 유기적으로 움직이는 입술 메쉬)
    const mouthGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.22, 16);
    mouthGeo.rotateZ(Math.PI / 2);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0xc084fc, transparent: true, opacity: 0.9 });
    const mouth = new THREE.Mesh(mouthGeo, mouthMat);
    mouth.position.set(0, 0.05, 0.67);
    avatarGroup.add(mouth);
    mouthRef.current = mouth;

    // (E) Orbital Halo Rings (머리 주변을 회전하는 3중 크로노스 링)
    const ringMat1 = new THREE.MeshBasicMaterial({ color: 0xa855f7, wireframe: true, transparent: true, opacity: 0.35 });
    const ringGeo1 = new THREE.TorusGeometry(1.2, 0.015, 8, 48);
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    avatarGroup.add(ring1);
    ring1Ref.current = ring1;

    const ringMat2 = new THREE.MeshBasicMaterial({ color: 0x38bdf8, wireframe: true, transparent: true, opacity: 0.3 });
    const ringGeo2 = new THREE.TorusGeometry(1.35, 0.012, 8, 48);
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    avatarGroup.add(ring2);
    ring2Ref.current = ring2;

    const ringMat3 = new THREE.MeshBasicMaterial({ color: 0x34d399, wireframe: true, transparent: true, opacity: 0.25 });
    const ringGeo3 = new THREE.TorusGeometry(1.5, 0.01, 8, 48);
    const ring3 = new THREE.Mesh(ringGeo3, ringMat3);
    ring3.rotation.z = Math.PI / 6;
    avatarGroup.add(ring3);
    ring3Ref.current = ring3;

    // (F) Chest / Neck & Arc Reactor (가슴 코어)
    const neckGeo = new THREE.CylinderGeometry(0.18, 0.26, 0.45, 16);
    const neckMat = new THREE.MeshStandardMaterial({ color: 0x110f22, roughness: 0.4, metalness: 0.7 });
    const neck = new THREE.Mesh(neckGeo, neckMat);
    neck.position.set(0, -0.42, 0.05);
    avatarGroup.add(neck);

    const chestGeo = new THREE.CylinderGeometry(0.35, 0.55, 0.6, 16);
    chestGeo.scale(1.2, 1, 0.7);
    const chestMat = new THREE.MeshStandardMaterial({ color: 0x0c0a1a, roughness: 0.3, metalness: 0.8 });
    const chest = new THREE.Mesh(chestGeo, chestMat);
    chest.position.set(0, -0.85, 0.05);
    avatarGroup.add(chest);

    // 심장 아크 코어 (Life Arc Core)
    const coreGeo = new THREE.SphereGeometry(0.14, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x818cf8 });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(0, -0.75, 0.28);
    avatarGroup.add(coreMesh);
    coreRef.current = coreMesh;

    // (G) Ambient Particles (스타더스트 파티클)
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 5;
      particlePos[i + 1] = (Math.random() - 0.5) * 4;
      particlePos[i + 2] = (Math.random() - 0.5) * 4;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 0.045,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);
    particlesRef.current = particles;

    // 5. 마우스 인터랙션 이벤트 리스너
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      mousePos.current.targetX = x * 0.35;
      mousePos.current.targetY = y * 0.25;

      if (isDragging.current) {
        const deltaX = e.clientX - previousMousePosition.current.x;
        const deltaY = e.clientY - previousMousePosition.current.y;
        manualRotation.current.y += deltaX * 0.008;
        manualRotation.current.x += deltaY * 0.008;
        previousMousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      previousMousePosition.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // 6. 리사이즈 핸들러
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 340;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 7. 애니메이션 루프 (Render Loop)
    let animationFrameId: number;
    let clock = new THREE.Clock();
    let blinkTimer = 0;
    let isBlinking = false;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // 마우스 시선 Lerp 보간
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.05;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.05;

      if (avatarGroupRef.current) {
        // 기본 공중 부유(Floating levitation)
        avatarGroupRef.current.position.y = Math.sin(time * 1.5) * 0.06;

        // 회전: 수동 회전값 + 마우스 시선 추적
        avatarGroupRef.current.rotation.y = manualRotation.current.y + mousePos.current.x;
        avatarGroupRef.current.rotation.x = manualRotation.current.x - mousePos.current.y * 0.8;
      }

      // 오비탈 링 회전
      if (ring1Ref.current) ring1Ref.current.rotation.z += 0.008;
      if (ring2Ref.current) ring2Ref.current.rotation.x += 0.006;
      if (ring3Ref.current) ring3Ref.current.rotation.y += 0.01;

      // 눈 깜빡임 주기 계산 (3~5초마다 한 번)
      blinkTimer += delta;
      if (blinkTimer > 3.8) {
        isBlinking = true;
        if (blinkTimer > 4.0) {
          isBlinking = false;
          blinkTimer = 0;
        }
      }

      const blinkScaleY = isBlinking ? 0.08 : 1.0;
      if (leftEyeRef.current) leftEyeRef.current.scale.y = blinkScaleY;
      if (rightEyeRef.current) rightEyeRef.current.scale.y = blinkScaleY;

      // 파티클 부유
      if (particlesRef.current) {
        particlesRef.current.rotation.y = time * 0.03;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mouseup', handleMouseUp);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mousedown', handleMouseDown);
      }
      renderer.dispose();
    };
  }, []);

  // 상태 변경에 따른 실시간 립싱크 & 색상/빛 인터랙션 동기화
  useEffect(() => {
    // 1. 말하기(Speaking) 중 실시간 립싱크
    let mouthInterval: any = null;
    if (isSpeaking && mouthRef.current) {
      mouthInterval = setInterval(() => {
        if (!mouthRef.current) return;
        // 음성 레벨 또는 랜덤 립싱크 주기에 맞춰 입술 개폐
        const openScale = 1.0 + Math.random() * 2.8;
        const widthScale = 0.85 + Math.random() * 0.3;
        mouthRef.current.scale.set(widthScale, openScale, openScale);
        mouthRef.current.position.y = 0.05 - (openScale * 0.015);
      }, 70);
    } else if (mouthRef.current) {
      mouthRef.current.scale.set(1, 1, 1);
      mouthRef.current.position.y = 0.05;
    }

    // 2. 상태별 눈동자 및 코어 색상 전환
    let eyeColor = 0x60a5fa; // 기본 블루
    let coreColor = 0x818cf8;

    if (isListening) {
      eyeColor = 0x34d399; // 경청 중: 생동감 있는 에메랄드 그린
      coreColor = 0x10b981;
    } else if (isThinking) {
      eyeColor = 0xf59e0b; // 생각 중: 집중하는 앰버 골드
      coreColor = 0xd97706;
    } else if (isSpeaking) {
      eyeColor = 0xc084fc; // 발화 중: 부드러운 바이올렛 퍼플
      coreColor = 0xa855f7;
    }

    if (leftEyeRef.current) (leftEyeRef.current.material as THREE.MeshBasicMaterial).color.setHex(eyeColor);
    if (rightEyeRef.current) (rightEyeRef.current.material as THREE.MeshBasicMaterial).color.setHex(eyeColor);
    if (coreRef.current) (coreRef.current.material as THREE.MeshBasicMaterial).color.setHex(coreColor);

    return () => {
      if (mouthInterval) clearInterval(mouthInterval);
    };
  }, [isSpeaking, isListening, isThinking, audioLevel]);

  return (
    <div className="relative w-full h-[320px] md:h-[360px] flex items-center justify-center overflow-hidden select-none">
      {/* 3D WebGL 캔버스 컨테이너 */}
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
        title="마우스로 드래그하여 3D 아바타를 360도 회전해 볼 수 있습니다"
      />

      {/* 홀로그래픽 원형 플로어 그림자 링 */}
      <div className="absolute bottom-2 w-48 h-6 rounded-full bg-purple-500/15 blur-xl pointer-events-none" />

      {/* 상태 표시 오버레이 뱃지 (상단 좌측) */}
      <div className="absolute top-3 left-4 flex items-center gap-2 pointer-events-none z-10">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border shadow-lg ${
          isListening 
            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-emerald-500/20' 
            : isSpeaking 
            ? 'bg-purple-950/80 text-purple-300 border-purple-500/50 shadow-purple-500/20'
            : isThinking
            ? 'bg-amber-950/80 text-amber-300 border-amber-500/50 shadow-amber-500/20'
            : 'bg-slate-900/80 text-slate-300 border-slate-700/50'
        }`}>
          <span className={`w-2 h-2 rounded-full ${
            isListening ? 'bg-emerald-400 animate-ping' :
            isSpeaking ? 'bg-purple-400 animate-pulse' :
            isThinking ? 'bg-amber-400 animate-spin' :
            'bg-slate-400'
          }`} />
          <span>
            {isListening ? '👂 경청 중 (Listening)' :
             isSpeaking ? '🗣️ 음성 발화 중 (Speaking)' :
             isThinking ? '🧠 헌법 조율 중 (Thinking)' :
             '✨ 대기 중 (Active)'}
          </span>
        </div>
      </div>

      {/* 3D 뷰 조작 힌트 (우측 하단) */}
      <div className="absolute bottom-2 right-4 text-[10px] text-slate-500 font-mono pointer-events-none bg-slate-950/50 px-2 py-0.5 rounded-md border border-slate-800">
        🖱️ Drag to rotate 3D view
      </div>
    </div>
  );
}

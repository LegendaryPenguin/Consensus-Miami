"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { stage402, stagePayment, stageReceipt } from "./beatTimeline";
import { useLandingScrollProgress } from "./scrollContext";

export function LandingScrollScene() {
  const progress = useLandingScrollProgress();
  const cardRootRef = useRef<THREE.Group>(null);
  const cardMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const gateRef = useRef<THREE.Group>(null);
  const lockRef = useRef<THREE.Group>(null);
  const payRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);
  const buyerRef = useRef<THREE.Mesh>(null);
  const sellerRef = useRef<THREE.Mesh>(null);
  const labelDefaultRef = useRef<THREE.Group>(null);
  const labelVerifiedRef = useRef<THREE.Group>(null);

  const buyerLocal = useMemo(() => new THREE.Vector3(-0.82, 0.58, 0.06), []);
  const sellerLocal = useMemo(() => new THREE.Vector3(0.82, 0.58, 0.06), []);
  const payMid = useMemo(() => buyerLocal.clone().add(sellerLocal).multiplyScalar(0.5), [buyerLocal, sellerLocal]);
  const payDir = useMemo(() => new THREE.Vector3().subVectors(sellerLocal, buyerLocal).normalize(), [buyerLocal, sellerLocal]);
  const payDist = useMemo(() => buyerLocal.distanceTo(sellerLocal), [buyerLocal, sellerLocal]);
  const beamQuat = useMemo(() => {
    const up = new THREE.Vector3(0, 1, 0);
    return new THREE.Quaternion().setFromUnitVectors(up, payDir);
  }, [payDir]);

  useFrame((state) => {
    const t = progress.current;
    const s402 = stage402(t);
    const sPay = stagePayment(t);
    const sRec = stageReceipt(t);
    const bob = Math.sin(state.clock.elapsedTime * 1.5) * 0.035;

    if (cardRootRef.current) {
      cardRootRef.current.position.y = bob;
      cardRootRef.current.rotation.y = t * 0.22;
      cardRootRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.65) * 0.03;
    }

    if (cardMatRef.current) {
      const mat = cardMatRef.current;
      const white = new THREE.Color("#ffffff");
      const mint = new THREE.Color("#ecfdf5");
      mat.color.copy(white).lerp(mint, sRec * 0.85);
      mat.emissive.set("#10b981");
      mat.emissiveIntensity = sRec * 0.18;
    }

    if (gateRef.current) {
      gateRef.current.visible = s402 > 0.02;
      gateRef.current.scale.setScalar(0.4 + s402 * 0.85);
      gateRef.current.children.forEach((ch) => {
        const m = (ch as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
        if (m && "opacity" in m) {
          m.transparent = true;
          m.opacity = 0.08 + s402 * 0.55;
        }
      });
    }

    if (lockRef.current) {
      lockRef.current.visible = s402 > 0.04;
      lockRef.current.scale.setScalar(0.75 + s402 * 0.35);
      lockRef.current.rotation.y = state.clock.elapsedTime * 0.4 * s402;
    }

    if (payRef.current) {
      payRef.current.visible = sPay > 0.02;
    }
    if (buyerRef.current) {
      buyerRef.current.scale.setScalar(0.5 + 0.35 * sPay);
    }
    if (sellerRef.current) {
      sellerRef.current.scale.setScalar(0.5 + 0.35 * sPay);
    }
    if (beamRef.current) {
      beamRef.current.position.copy(payMid);
      beamRef.current.quaternion.copy(beamQuat);
      beamRef.current.scale.set(1, Math.max(0.002, sPay * payDist), 1);
    }

    if (labelDefaultRef.current) {
      labelDefaultRef.current.visible = sRec < 0.45;
    }
    if (labelVerifiedRef.current) {
      labelVerifiedRef.current.visible = sRec >= 0.08;
      labelVerifiedRef.current.scale.setScalar(Math.max(0.001, sRec));
    }

  });

  return (
    <>
      <ambientLight intensity={0.62} />
      <hemisphereLight args={["#f8fafc", "#cbd5e1", 0.45]} />
      <directionalLight position={[3.5, 6, 4]} intensity={0.95} />

      <group ref={cardRootRef}>
        <RoundedBox args={[1.75, 0.95, 0.1]} radius={0.06} smoothness={4} castShadow={false}>
          <meshStandardMaterial ref={cardMatRef} color="#ffffff" roughness={0.36} metalness={0.06} />
        </RoundedBox>

        <group ref={labelDefaultRef} position={[0, 0.02, 0.056]}>
          <mesh position={[0, 0.2, 0]}>
            <planeGeometry args={[0.42, 0.04]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0, 0.1, 0]}>
            <planeGeometry args={[1.12, 0.07]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <planeGeometry args={[1.35, 0.055]} />
            <meshStandardMaterial color="#334155" />
          </mesh>
          <mesh position={[0, -0.14, 0]}>
            <planeGeometry args={[0.82, 0.045]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        </group>

        <group ref={labelVerifiedRef} position={[0, 0.02, 0.058]}>
          <mesh position={[0, 0.13, 0]}>
            <planeGeometry args={[0.44, 0.1]} />
            <meshStandardMaterial color="#10b981" />
          </mesh>
          <mesh position={[0, -0.02, 0]}>
            <planeGeometry args={[1.05, 0.07]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          <mesh position={[0, -0.16, 0]}>
            <planeGeometry args={[0.88, 0.045]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
        </group>

        <group ref={gateRef} position={[0, 0, 0.055]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.52, 0.038, 16, 64]} />
            <meshStandardMaterial color="#7c3aed" emissive="#4c1d95" emissiveIntensity={0.2} transparent opacity={0.45} depthWrite={false} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[1.25, 0.5]} />
            <meshStandardMaterial color="#2563eb" transparent opacity={0.1} depthWrite={false} />
          </mesh>
        </group>

        <group ref={lockRef} position={[0, 0.12, 0.075]}>
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.18, 0.14, 0.1]} />
            <meshStandardMaterial color="#0f172a" roughness={0.35} metalness={0.12} />
          </mesh>
          <mesh position={[0, 0.06, 0]} rotation={[0, 0, Math.PI / 4]}>
            <torusGeometry args={[0.075, 0.018, 12, 32]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.28} metalness={0.3} />
          </mesh>
        </group>

        <group ref={payRef}>
          <mesh ref={buyerRef} position={buyerLocal}>
            <sphereGeometry args={[0.07, 20, 20]} />
            <meshStandardMaterial color="#2563eb" roughness={0.25} metalness={0.18} />
          </mesh>
          <mesh ref={sellerRef} position={sellerLocal}>
            <sphereGeometry args={[0.07, 20, 20]} />
            <meshStandardMaterial color="#06b6d4" roughness={0.25} metalness={0.18} />
          </mesh>
          <mesh ref={beamRef}>
            <cylinderGeometry args={[0.022, 0.022, 1, 14]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive="#0ea5e9"
              emissiveIntensity={0.45}
              transparent
              opacity={0.82}
              depthWrite={false}
            />
          </mesh>
        </group>
      </group>
    </>
  );
}

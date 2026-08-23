import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const GLOBE_RADIUS = 1.52;
const SCREEN_LIFT = 0.09;
const skipRaycast = () => {};

const atmosVert = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vView = normalize(cameraPosition - world.xyz);
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const atmosFrag = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  void main() {
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), uPower);
    gl_FragColor = vec4(uColor, clamp(fresnel * uIntensity, 0.0, 0.5));
  }
`;

function cloudinaryPoster(videoUrl) {
  if (!videoUrl || !videoUrl.includes('/video/upload/')) return null;
  return videoUrl
    .replace('/video/upload/', '/video/upload/so_1,w_720,h_405,c_fill,q_auto,f_jpg/')
    .replace(/\.mp4(\?.*)?$/i, '.jpg');
}

function localThumb(edit) {
  if (!edit?.thumb) return null;
  return `images/thumbnails/${encodeURIComponent(edit.category)}/${encodeURIComponent(edit.thumb)}`;
}

function collectProjects() {
  const media = window.PortfolioMedia;
  if (!media?.edits) return [];
  return media.edits.map((edit) => {
    const src = media.getVideoUrl(edit);
    return {
      src,
      title: media.formatTitle(edit.file),
      category: edit.category.replace(' Content', ''),
      thumb: localThumb(edit),
      poster: cloudinaryPoster(src)
    };
  });
}

function placeOnSphere(count, radius) {
  const rings = [
    { y: 0.46, weight: 0.28 },
    { y: 0.06, weight: 0.44 },
    { y: -0.4, weight: 0.28 }
  ];
  const counts = rings.map((ring, i) => (
    i === rings.length - 1
      ? count - rings.slice(0, -1).reduce((sum, r) => sum + Math.round(count * r.weight), 0)
      : Math.round(count * ring.weight)
  ));
  const points = [];
  rings.forEach((ring, ri) => {
    const n = Math.max(0, counts[ri]);
    const xz = Math.sqrt(Math.max(0.2, 1 - ring.y * ring.y));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + ri * 0.42 + 0.18;
      points.push(new THREE.Vector3(
        Math.cos(a) * xz * radius,
        ring.y * radius,
        Math.sin(a) * xz * radius
      ));
    }
  });
  return points;
}

function useLoadedTexture(primary, fallback) {
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    let disposed = false;
    let current = null;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';

    const apply = (tex) => {
      if (disposed) {
        tex.dispose();
        return;
      }
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.minFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      current = tex;
      setTexture(tex);
    };

    const load = (url, next) => {
      if (!url) {
        next?.();
        return;
      }
      loader.load(url, apply, undefined, () => next?.());
    };

    load(primary, () => load(fallback));

    return () => {
      disposed = true;
      current?.dispose();
    };
  }, [primary, fallback]);

  return texture;
}

function makeLabelTexture(line) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 128);
  ctx.font = '600 36px Outfit, Manrope, sans-serif';
  ctx.fillStyle = 'rgba(214, 236, 246, 0.92)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(line, 256, 64);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function GlobeCore() {
  const inner = useMemo(() => ({
    uColor: { value: new THREE.Color('#6ec8e0') },
    uPower: { value: 2.8 },
    uIntensity: { value: 0.26 }
  }), []);
  const outer = useMemo(() => ({
    uColor: { value: new THREE.Color('#5aa8c4') },
    uPower: { value: 3.6 },
    uIntensity: { value: 0.15 }
  }), []);

  return (
    <group>
      <mesh receiveShadow>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 48]} />
        <meshPhysicalMaterial
          color="#07090c"
          roughness={0.42}
          metalness={0.72}
          clearcoat={0.32}
          clearcoatRoughness={0.48}
          envMapIntensity={0.35}
          reflectivity={0.48}
        />
      </mesh>

      <mesh raycast={skipRaycast}>
        <sphereGeometry args={[GLOBE_RADIUS + 0.004, 36, 18]} />
        <meshBasicMaterial
          color="#7ebed4"
          wireframe
          transparent
          opacity={0.05}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.085} raycast={skipRaycast}>
        <sphereGeometry args={[GLOBE_RADIUS, 48, 32]} />
        <shaderMaterial
          vertexShader={atmosVert}
          fragmentShader={atmosFrag}
          uniforms={outer}
          transparent
          depthWrite={false}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>

      <mesh raycast={skipRaycast}>
        <sphereGeometry args={[GLOBE_RADIUS + 0.02, 48, 32]} />
        <shaderMaterial
          vertexShader={atmosVert}
          fragmentShader={atmosFrag}
          uniforms={inner}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Dust() {
  const ref = useRef();
  const positions = useMemo(() => {
    const n = 240;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = GLOBE_RADIUS + 0.22 + Math.random() * 0.95;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = r * Math.cos(phi);
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);

  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.018;
  });

  return (
    <points ref={ref} raycast={skipRaycast}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#c5e4f2"
        size={0.014}
        transparent
        opacity={0.3}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function ScreenMesh({ point, tilt, width, height, texture, labelTex, hoverRef }) {
  const root = useRef();
  const label = useRef();

  useLayoutEffect(() => {
    if (!root.current) return;
    root.current.lookAt(0, 0, 0);
    root.current.rotateY(Math.PI);
    root.current.rotateX(tilt.x);
    root.current.rotateZ(tilt.z);
  }, [point, tilt]);

  useFrame(() => {
    if (label.current) label.current.material.opacity = hoverRef.current * 0.92;
  });

  return (
    <group ref={root}>
      <mesh position={[0, 0, -0.018]} castShadow>
        <boxGeometry args={[width + 0.028, height + 0.028, 0.026]} />
        <meshStandardMaterial
          color="#101418"
          metalness={0.7}
          roughness={0.32}
          emissive="#0a1820"
          emissiveIntensity={0.22}
        />
      </mesh>
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          color={texture ? '#ffffff' : '#15191e'}
          roughness={0.28}
          metalness={0.12}
          emissive="#152028"
          emissiveIntensity={0.1}
        />
      </mesh>
      <mesh ref={label} position={[0, -height * 0.7, 0.04]} raycast={skipRaycast}>
        <planeGeometry args={[width * 0.98, 0.078]} />
        <meshBasicMaterial
          map={labelTex}
          transparent
          opacity={0}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function Thumbnail({ project, point, controls, index }) {
  const group = useRef();
  const hover = useRef(0);
  const texture = useLoadedTexture(project.thumb, project.poster);
  const labelTex = useMemo(
    () => makeLabelTexture(`${project.category.toUpperCase()}  ·  PLAY`),
    [project.category]
  );

  const { base, outward, width, height, tilt } = useMemo(() => {
    const outward = point.clone().normalize();
    const seed = index * 1.37;
    return {
      base: outward.clone().multiplyScalar(GLOBE_RADIUS + SCREEN_LIFT),
      outward,
      width: 0.5 + Math.sin(seed) * 0.035,
      height: 0.28 + Math.cos(seed * 1.2) * 0.016,
      tilt: {
        x: Math.sin(seed) * 0.12,
        z: Math.cos(seed * 0.8) * 0.1
      }
    };
  }, [point, index]);

  useEffect(() => () => labelTex.dispose(), [labelTex]);

  useFrame((_, dt) => {
    if (!group.current) return;
    hover.current = THREE.MathUtils.damp(
      hover.current,
      controls.hoverId.current === index ? 1 : 0,
      8,
      dt
    );
    group.current.position.copy(base).addScaledVector(outward, hover.current * 0.18);
    group.current.scale.setScalar(1 + hover.current * 0.12);
  });

  return (
    <group
      ref={group}
      position={base}
      onPointerOver={(e) => {
        e.stopPropagation();
        controls.hoverId.current = index;
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (controls.hoverId.current === index) controls.hoverId.current = -1;
        document.body.style.cursor = '';
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
        if (controls.drag.current.moved > 8) return;
        if (typeof window.openPortfolioVideo === 'function' && project.src) {
          window.openPortfolioVideo(project.src);
        }
      }}
    >
      <ScreenMesh
        point={point}
        tilt={tilt}
        width={width}
        height={height}
        texture={texture}
        labelTex={labelTex}
        hoverRef={hover}
      />
    </group>
  );
}

function useGlobeControls() {
  const group = useRef();
  const hoverId = useRef(-1);
  const drag = useRef({ active: false, moved: 0, lastX: 0, lastY: 0 });
  const vel = useRef({ x: 0, y: 0.004 });
  const rot = useRef({ x: 0.16, y: 0.55 });
  const { gl } = useThree();

  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = 'none';

    const onDown = (e) => {
      el.setPointerCapture?.(e.pointerId);
      drag.current = { active: true, moved: 0, lastX: e.clientX, lastY: e.clientY };
    };

    const applyMove = (e, dragging) => {
      const dx = e.clientX - drag.current.lastX;
      const dy = e.clientY - drag.current.lastY;
      const slow = hoverId.current >= 0 ? 0.32 : 1;
      if (dragging) {
        drag.current.moved += Math.abs(dx) + Math.abs(dy);
        vel.current.y += dx * 0.0065 * slow;
        vel.current.x += dy * 0.0048 * slow;
      } else {
        vel.current.y += dx * 0.0022 * slow;
        vel.current.x += dy * 0.0014 * slow;
      }
      drag.current.lastX = e.clientX;
      drag.current.lastY = e.clientY;
    };

    const onMove = (e) => {
      if (!drag.current.active) applyMove(e, false);
    };

    const onWindowMove = (e) => {
      if (drag.current.active) applyMove(e, true);
    };

    const onUp = (e) => {
      drag.current.active = false;
      try { el.releasePointerCapture?.(e.pointerId); } catch { /* ignore */ }
    };

    const onEnter = (e) => {
      drag.current.lastX = e.clientX;
      drag.current.lastY = e.clientY;
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerenter', onEnter);
    window.addEventListener('pointermove', onWindowMove);
    window.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerenter', onEnter);
      window.removeEventListener('pointermove', onWindowMove);
      window.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [gl]);

  useFrame((_, dt) => {
    if (!group.current) return;
    const slow = hoverId.current >= 0 ? 0.28 : 1;
    const damp = Math.exp(-dt * (hoverId.current >= 0 ? 5.2 : 3.4));

    vel.current.y *= damp;
    vel.current.x *= damp;
    vel.current.y += 0.00115 * slow * dt * 60;

    rot.current.y += vel.current.y * slow;
    rot.current.x = THREE.MathUtils.clamp(rot.current.x + vel.current.x * slow, -0.48, 0.5);

    group.current.rotation.y = rot.current.y;
    group.current.rotation.x = rot.current.x;
  });

  return { group, hoverId, drag };
}

function GlobeRig({ projects }) {
  const controls = useGlobeControls();
  const points = useMemo(
    () => placeOnSphere(projects.length, GLOBE_RADIUS),
    [projects.length]
  );

  return (
    <group ref={controls.group} rotation={[0.16, 0.55, 0]}>
      <GlobeCore />
      <Dust />
      {projects.map((project, i) => (
        <Thumbnail
          key={`${project.src}-${i}`}
          project={project}
          point={points[i] || new THREE.Vector3(0, 0, GLOBE_RADIUS)}
          controls={controls}
          index={i}
        />
      ))}
    </group>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.22} color="#9bb4c2" />
      <hemisphereLight args={['#8ebfd0', '#05070a', 0.35]} />
      <directionalLight
        position={[3.2, 2.4, 4.2]}
        intensity={1.15}
        color="#d7eef6"
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-2.6, -0.4, 2.2]} intensity={0.45} color="#3a8eaa" distance={12} />
      <pointLight position={[0.4, 3.2, -1.2]} intensity={0.28} color="#6aa8bc" distance={10} />
      <spotLight
        position={[-1.5, 2.8, 3.5]}
        angle={0.55}
        penumbra={0.8}
        intensity={0.35}
        color="#b7dce8"
      />
    </>
  );
}

export function HeroGlobe() {
  const [visible, setVisible] = useState(true);
  const wrap = useRef(null);
  const projects = useMemo(collectProjects, []);

  useEffect(() => {
    const node = wrap.current;
    if (!node || !('IntersectionObserver' in window)) return undefined;
    const io = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
    }, { threshold: 0.08 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="hero-globe-canvas">
      <Canvas
        frameloop={visible ? 'always' : 'demand'}
        dpr={[1, 1.75]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05
        }}
        shadows
        camera={{ position: [0.15, 0.12, 4.55], fov: 36, near: 0.1, far: 40 }}
        onCreated={({ gl, scene }) => {
          gl.setClearColor(0x000000, 0);
          scene.background = null;
        }}
        style={{ background: 'transparent', width: '100%', height: '100%' }}
      >
        <Lights />
        <GlobeRig projects={projects} />
      </Canvas>
    </div>
  );
}

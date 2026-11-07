import * as THREE from "three";
import type { LayerName, OrganName } from "./chapters";

// A stylised human built from simple shapes. Units are metres: feet at y = 0,
// the body faces +z, and the body's left side is +x.

type V3 = THREE.Vector3;
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const UP = v(0, 1, 0);

export type Layer = {
  group: THREE.Group;
  materials: { mat: THREE.Material & { opacity: number }; base: number }[];
  current: number;
  target: number;
};

export type Organ = {
  materials: { mat: THREE.Material & { opacity: number }; base: number }[];
  current: number;
  target: number;
};

export type Body = {
  root: THREE.Group;
  layers: Record<LayerName, Layer>;
  organs: Record<OrganName, Organ>;
  update: (time: number) => void;
  dispose: () => void;
};

// ---------- shape helpers ----------

const sphereGeo = new THREE.SphereGeometry(1, 32, 20);

function ellipsoid(
  pos: V3,
  scale: [number, number, number],
  mat: THREE.Material,
  rot: [number, number, number] = [0, 0, 0],
) {
  const m = new THREE.Mesh(sphereGeo, mat);
  m.position.copy(pos);
  m.scale.set(...scale);
  m.rotation.set(...rot);
  return m;
}

/** Ellipsoid stretched along the line a→b (rx across, rz in depth). */
function spindle(a: V3, b: V3, rx: number, rz: number, mat: THREE.Material, offset = v(0, 0, 0)) {
  const dir = b.clone().sub(a);
  const m = new THREE.Mesh(sphereGeo, mat);
  m.position.copy(a).add(b).multiplyScalar(0.5).add(offset);
  m.quaternion.setFromUnitVectors(UP, dir.clone().normalize());
  m.scale.set(rx, dir.length() / 2, rz);
  return m;
}

/** Tapered cylinder from a (radius r1) to b (radius r2). */
function segment(a: V3, b: V3, r1: number, r2: number, mat: THREE.Material, radial = 20) {
  const dir = b.clone().sub(a);
  const geo = new THREE.CylinderGeometry(r2, r1, dir.length(), radial, 1, true);
  const m = new THREE.Mesh(geo, mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(UP, dir.normalize());
  return m;
}

function ball(pos: V3, r: number, mat: THREE.Material) {
  return ellipsoid(pos, [r, r, r], mat);
}

function tube(points: V3[], radius: number, mat: THREE.Material, segments = 64) {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, segments, radius, 8, false), mat);
}

/** Bone: shaft with rounded knobs at both ends. */
function bone(a: V3, b: V3, r: number, mat: THREE.Material, knob = 1.6) {
  const g = new THREE.Group();
  g.add(segment(a, b, r, r * 0.9, mat, 12), ball(a, r * knob, mat), ball(b, r * knob, mat));
  return g;
}

/** Points that fan out across a hand or foot, from a base toward an end. */
function fan(base: V3, end: V3, count: number, spread: number, perp: V3) {
  const out: [V3, V3][] = [];
  for (let i = 0; i < count; i++) {
    const k = i - (count - 1) / 2;
    out.push([
      base.clone().addScaledVector(perp, k * spread * 0.45),
      end.clone().addScaledVector(perp, k * spread),
    ]);
  }
  return out;
}

function stripeTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 16;
  const ctx = c.getContext("2d")!;
  for (let x = 0; x < 256; x += 4) {
    const shade = 150 + Math.round(Math.random() * 50);
    ctx.fillStyle = `rgb(${shade + 40},${Math.round(shade * 0.28)},${Math.round(shade * 0.24)})`;
    ctx.fillRect(x, 0, 4, 16);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Bumpy sphere geometry used for the brain's folds. */
function foldedGeo() {
  const g = new THREE.SphereGeometry(1, 96, 64);
  const p = g.attributes.position;
  const n = v(0, 0, 0);
  for (let i = 0; i < p.count; i++) {
    n.fromBufferAttribute(p, i);
    const f =
      Math.sin(n.x * 17 + Math.sin(n.y * 9) * 2) * Math.sin(n.y * 15 + n.z * 6) * 0.5 +
      Math.sin(n.z * 21 + n.x * 5) * 0.5;
    n.multiplyScalar(1 + 0.045 * f);
    p.setXYZ(i, n.x, n.y, n.z);
  }
  g.computeVertexNormals();
  return g;
}

// ---------- the body ----------

export function buildBody(): Body {
  const root = new THREE.Group();
  const disposables: { dispose: () => void }[] = [];

  const layers = {} as Record<LayerName, Layer>;
  const makeLayer = (name: LayerName, renderOrder: number) => {
    const group = new THREE.Group();
    group.name = name;
    group.renderOrder = renderOrder;
    root.add(group);
    layers[name] = { group, materials: [], current: 0, target: 0 };
    return group;
  };

  const mat = <M extends THREE.Material & { opacity: number }>(layer: LayerName, m: M, base = 1) => {
    m.transparent = true;
    layers[layer].materials.push({ mat: m, base });
    disposables.push(m);
    return m;
  };

  // Joint positions shared by every layer.
  const sides = [-1, 1] as const;
  const J = (s: number) => ({
    shoulder: v(s * 0.205, 1.4, -0.005),
    elbow: v(s * 0.285, 1.12, -0.02),
    wrist: v(s * 0.345, 0.86, 0.02),
    hand: v(s * 0.375, 0.69, 0.035),
    hip: v(s * 0.09, 0.86, 0),
    knee: v(s * 0.1, 0.48, 0.012),
    ankle: v(s * 0.1, 0.08, -0.01),
    heel: v(s * 0.1, 0.03, -0.045),
    toe: v(s * 0.115, 0.025, 0.17),
  });

  // ===== Organs (drawn first, deepest) =====
  const organGroup = makeLayer("organs", 1);
  const organs = {} as Record<OrganName, Organ>;
  const organMat = (name: OrganName, color: string, extra: THREE.MeshStandardMaterialParameters = {}) => {
    const m = mat(
      "organs",
      new THREE.MeshStandardMaterial({ color, roughness: 0.45, metalness: 0.05, ...extra }),
    );
    (organs[name] ??= { materials: [], current: 1, target: 1 }).materials.push({ mat: m, base: 1 });
    return m;
  };

  const brainGeo = foldedGeo();
  disposables.push(brainGeo);
  const brainM = organMat("brain", "#e7a1a8", { roughness: 0.6 });
  for (const s of sides) {
    const h = new THREE.Mesh(brainGeo, brainM);
    h.position.set(s * 0.036, 1.668, -0.008);
    h.scale.set(0.036, 0.062, 0.086);
    organGroup.add(h);
  }
  organGroup.add(ellipsoid(v(0, 1.6, -0.058), [0.05, 0.026, 0.032], organMat("brain", "#d98d96")));
  organGroup.add(segment(v(0, 1.62, -0.03), v(0, 1.5, -0.04), 0.012, 0.01, brainM));

  const lungM = organMat("lungs", "#e58f99", { roughness: 0.75 });
  const lungs = [
    ellipsoid(v(-0.072, 1.255, 0.0), [0.066, 0.115, 0.07], lungM, [0, 0, 0.08]),
    ellipsoid(v(0.074, 1.265, -0.005), [0.058, 0.105, 0.066], lungM, [0, 0, -0.08]),
  ];
  organGroup.add(...lungs);
  const tracheaM = organMat("lungs", "#e9c9c4");
  organGroup.add(segment(v(0, 1.47, 0.02), v(0, 1.35, 0.015), 0.011, 0.011, tracheaM));
  for (const s of sides) organGroup.add(segment(v(0, 1.35, 0.015), v(s * 0.05, 1.31, 0.01), 0.009, 0.008, tracheaM));

  const heartCenter = v(0.022, 1.195, 0.045);
  const heart = new THREE.Group();
  heart.position.copy(heartCenter);
  heart.rotation.set(0.2, 0, -0.45);
  const heartM = organMat("heart", "#c3242d", { roughness: 0.35, emissive: "#3a0000" });
  heart.add(ellipsoid(v(0, 0, 0), [0.042, 0.055, 0.038], heartM));
  heart.add(ellipsoid(v(0.012, 0.03, -0.005), [0.03, 0.03, 0.03], organMat("heart", "#a51d27")));
  organGroup.add(heart);

  const liverM = organMat("liver", "#7f2a22");
  organGroup.add(ellipsoid(v(-0.055, 1.07, 0.03), [0.1, 0.048, 0.07], liverM, [0, 0, 0.28]));
  organGroup.add(
    ellipsoid(v(0.058, 1.065, 0.045), [0.055, 0.04, 0.038], organMat("stomach", "#d78a7c"), [0, 0, -0.55]),
  );

  const gutM = organMat("intestines", "#e0a294", { roughness: 0.55 });
  const gut: V3[] = [];
  for (let r = 0; r < 5; r++) {
    const y = 1.0 - r * 0.026;
    for (let i = 0; i <= 8; i++) {
      const t = i / 8;
      const x = (r % 2 === 0 ? -1 : 1) * (0.075 - t * 0.15);
      gut.push(v(x, y + Math.sin(t * Math.PI * 4) * 0.008, 0.05 + Math.cos(t * Math.PI * 4) * 0.012));
    }
  }
  organGroup.add(tube(gut, 0.012, gutM, 400));
  organGroup.add(
    tube(
      [v(-0.04, 0.9, 0.04), v(-0.1, 0.9, 0.035), v(-0.105, 1.02, 0.04), v(0, 1.035, 0.055), v(0.105, 1.02, 0.04), v(0.1, 0.9, 0.035), v(0.04, 0.86, 0.02)],
      0.019,
      organMat("intestines", "#c9806c"),
      120,
    ),
  );
  const kidneyM = organMat("kidneys", "#8b2d2d");
  for (const s of sides) organGroup.add(ellipsoid(v(s * 0.068, 1.03, -0.062), [0.024, 0.04, 0.02], kidneyM, [0, 0, s * -0.2]));

  // ===== Skeleton =====
  const skel = makeLayer("skeleton", 2);
  const boneM = mat("skeleton", new THREE.MeshStandardMaterial({ color: "#efe6d2", roughness: 0.55 }));
  const darkM = mat("skeleton", new THREE.MeshStandardMaterial({ color: "#2a2420", roughness: 0.9 }));

  skel.add(ellipsoid(v(0, 1.645, -0.005), [0.086, 0.1, 0.102], boneM));
  skel.add(ellipsoid(v(0, 1.555, 0.045), [0.058, 0.03, 0.052], boneM));
  for (const s of sides) skel.add(ellipsoid(v(s * 0.033, 1.63, 0.085), [0.02, 0.017, 0.012], darkM));
  skel.add(ellipsoid(v(0, 1.595, 0.096), [0.012, 0.016, 0.008], darkM));

  const spine = new THREE.CatmullRomCurve3([
    v(0, 1.54, -0.03), v(0, 1.42, -0.05), v(0, 1.26, -0.078), v(0, 1.1, -0.062), v(0, 0.98, -0.045), v(0, 0.9, -0.065),
  ]);
  const vertGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.013, 14);
  disposables.push(vertGeo);
  for (let i = 0; i < 24; i++) {
    const t = i / 23;
    const p = spine.getPointAt(t);
    const tan = spine.getTangentAt(t);
    const vert = new THREE.Mesh(vertGeo, boneM);
    vert.position.copy(p);
    vert.quaternion.setFromUnitVectors(UP, tan.clone().negate());
    vert.scale.setScalar(0.8 + t * 0.6);
    skel.add(vert);
    skel.add(ellipsoid(p.clone().add(v(0, -0.004, -0.022)), [0.006, 0.006, 0.014], boneM));
  }

  for (let i = 0; i < 12; i++) {
    const y = 1.4 - i * 0.026;
    const rx = 0.075 + 0.07 * Math.sin(Math.min(1, (i + 1.5) / 8) * Math.PI * 0.5);
    const rz = rx * 0.55 + 0.02;
    const end = i < 7 ? 0.42 : i < 10 ? 0.32 : 0.05;
    for (const s of sides) {
      const pts: V3[] = [];
      for (let k = 0; k <= 10; k++) {
        const phi = -Math.PI / 2 + (k / 10) * (end + 0.5) * Math.PI;
        pts.push(v(s * rx * Math.cos(phi), y - 0.075 * (k / 10) ** 1.4, -0.005 + rz * Math.sin(phi)));
      }
      skel.add(tube(pts, 0.0065, boneM, 24));
    }
  }
  skel.add(ellipsoid(v(0, 1.255, 0.098), [0.02, 0.105, 0.01], boneM));

  for (const s of sides) {
    const j = J(s);
    skel.add(bone(v(s * 0.02, 1.43, 0.065), v(s * 0.18, 1.43, 0.0), 0.008, boneM));
    skel.add(ellipsoid(v(s * 0.1, 1.31, -0.09), [0.055, 0.075, 0.008], boneM, [0.2, s * 0.35, 0]));
    skel.add(bone(j.shoulder, j.elbow, 0.013, boneM));
    const across = v(s, 0, 0).multiplyScalar(0.011);
    skel.add(bone(j.elbow.clone().sub(across), j.wrist.clone().sub(across), 0.008, boneM));
    skel.add(bone(j.elbow.clone().add(across), j.wrist.clone().add(across), 0.008, boneM));
    const handDir = j.hand.clone().sub(j.wrist).normalize();
    const handPerp = v(handDir.y, -handDir.x, 0).normalize();
    for (const [a, b] of fan(j.wrist, j.hand, 5, 0.018, handPerp)) skel.add(bone(a, b, 0.0035, boneM, 1.5));

    skel.add(ellipsoid(v(s * 0.085, 0.94, -0.03), [0.06, 0.055, 0.01], boneM, [0.15, s * 0.9, s * -0.3]));
    skel.add(ball(j.hip, 0.024, boneM));
    skel.add(bone(j.hip, j.knee, 0.015, boneM));
    skel.add(ellipsoid(j.knee.clone().add(v(0, 0, 0.038)), [0.018, 0.022, 0.01], boneM));
    skel.add(bone(j.knee, j.ankle, 0.014, boneM));
    skel.add(bone(j.knee.clone().add(v(s * 0.022, -0.03, -0.01)), j.ankle.clone().add(v(s * 0.022, 0.0, -0.005)), 0.006, boneM));
    for (const [a, b] of fan(j.heel.clone().add(v(0, 0, 0.06)), j.toe, 5, 0.017, v(1, 0, 0))) skel.add(bone(a, b, 0.004, boneM, 1.5));
    skel.add(ellipsoid(j.heel, [0.02, 0.02, 0.03], boneM));
  }
  const pubis = new THREE.Mesh(new THREE.TorusGeometry(0.058, 0.012, 10, 32), boneM);
  pubis.position.set(0, 0.86, 0.0);
  pubis.rotation.set(Math.PI / 2 - 0.5, 0, 0);
  disposables.push(pubis.geometry);
  skel.add(pubis, ellipsoid(v(0, 0.9, -0.07), [0.035, 0.05, 0.02], boneM, [-0.4, 0, 0]));

  // ===== Blood vessels =====
  const vessels = makeLayer("vessels", 3);
  const artM = mat("vessels", new THREE.MeshStandardMaterial({ color: "#d42a2a", emissive: "#5a0000", roughness: 0.4 }));
  const veinM = mat("vessels", new THREE.MeshStandardMaterial({ color: "#2f4fc4", emissive: "#081a55", roughness: 0.4 }));

  const flows: { curve: THREE.CatmullRomCurve3; mesh: THREE.InstancedMesh; speed: number; reverse: boolean }[] = [];
  const dummy = new THREE.Object3D();
  const addFlow = (curve: THREE.CatmullRomCurve3, layer: LayerName, color: string, count: number, size: number, speed: number, reverse: boolean) => {
    const m = mat(layer, new THREE.MeshBasicMaterial({ color, blending: THREE.AdditiveBlending, depthWrite: false }));
    const geo = new THREE.SphereGeometry(size, 8, 6);
    disposables.push(geo);
    const mesh = new THREE.InstancedMesh(geo, m, count);
    layers[layer].group.add(mesh);
    flows.push({ curve, mesh, speed, reverse });
  };

  const aortaArch = [heartCenter.clone(), v(0.01, 1.29, 0.01), v(0.0, 1.33, -0.035)];
  const vesselPaths: V3[][] = [];
  for (const s of sides) {
    const j = J(s);
    vesselPaths.push([...aortaArch, v(0, 1.18, -0.05), v(0, 0.97, -0.035), v(s * 0.07, 0.86, 0.015), v(s * 0.095, 0.68, 0.025), j.knee.clone().add(v(0, 0, -0.03)), v(s * 0.1, 0.27, -0.015), j.ankle.clone().add(v(0, 0, 0.02)), j.toe.clone().add(v(0, 0.01, -0.02))]);
    vesselPaths.push([heartCenter.clone(), v(0.01, 1.3, 0.01), v(s * 0.06, 1.4, 0.0), v(s * 0.17, 1.385, 0.0), j.shoulder.clone().add(v(s * 0.02, -0.05, 0.015)), j.elbow.clone().add(v(0, 0, 0.02)), j.wrist.clone().add(v(0, 0, 0.01)), j.hand.clone().add(v(0, 0.01, 0))]);
    vesselPaths.push([heartCenter.clone(), v(s * 0.015, 1.31, 0.015), v(s * 0.03, 1.46, 0.025), v(s * 0.035, 1.56, 0.03), v(s * 0.03, 1.66, 0.02), v(s * 0.01, 1.72, -0.02)]);
  }
  for (const path of vesselPaths) {
    const art = new THREE.CatmullRomCurve3(path);
    const s = Math.sign(path[path.length - 1].x) || 1;
    const vein = new THREE.CatmullRomCurve3(path.map((p, i) => (i === 0 ? p.clone() : p.clone().add(v(s * 0.012, 0, 0.012)))));
    vessels.add(new THREE.Mesh(new THREE.TubeGeometry(art, 120, 0.0055, 8), artM));
    vessels.add(new THREE.Mesh(new THREE.TubeGeometry(vein, 120, 0.005, 8), veinM));
    addFlow(art, "vessels", "#ff5a4a", 16, 0.007, 0.16, false);
    addFlow(vein, "vessels", "#5b86ff", 16, 0.0065, 0.12, true);
  }

  // ===== Nerves =====
  const nerves = makeLayer("nerves", 4);
  const nerveM = mat("nerves", new THREE.MeshStandardMaterial({ color: "#f2cf3a", emissive: "#5a4500", roughness: 0.4 }));
  const cord = spine.points.map((p) => p.clone().add(v(0, 0, 0.012)));
  const nervePaths: V3[][] = [[v(0, 1.62, -0.02), ...cord]];
  for (const s of sides) {
    const j = J(s);
    nervePaths.push([v(0, 1.62, -0.02), v(0, 1.45, -0.04), v(s * 0.08, 1.4, -0.03), j.shoulder.clone().add(v(0, -0.04, -0.01)), j.elbow.clone().add(v(0, 0, -0.012)), j.wrist, j.hand]);
    nervePaths.push([v(0, 1.62, -0.02), ...cord.slice(1, 5), v(s * 0.07, 0.85, -0.06), j.knee.clone().add(v(0, 0, -0.035)), j.ankle.clone().add(v(0, 0.02, -0.02)), j.toe.clone().add(v(0, 0.012, -0.02))]);
    for (const i of [2, 5, 8]) {
      const y = 1.375 - i * 0.027;
      const pts: V3[] = [];
      for (let k = 0; k <= 8; k++) {
        const phi = -Math.PI / 2 + (k / 8) * 0.8 * Math.PI;
        pts.push(v(s * 0.13 * Math.cos(phi), y - 0.04 * (k / 8) - 0.01, -0.005 + 0.09 * Math.sin(phi)));
      }
      nervePaths.push(pts);
    }
  }
  for (const path of nervePaths) {
    const curve = new THREE.CatmullRomCurve3(path);
    nerves.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 100, path.length > 9 ? 0.006 : 0.0035, 8), nerveM));
    addFlow(curve, "nerves", "#fff3a0", 6, 0.0075, 0.45, false);
  }
  nerves.traverse((o) => o instanceof THREE.Mesh && !(o instanceof THREE.InstancedMesh) && disposables.push(o.geometry));
  vessels.traverse((o) => o instanceof THREE.Mesh && !(o instanceof THREE.InstancedMesh) && disposables.push(o.geometry));

  // ===== Muscles =====
  const muscles = makeLayer("muscles", 5);
  const stripes = stripeTexture();
  disposables.push(stripes);
  const muscleM = mat("muscles", new THREE.MeshStandardMaterial({ color: "#ffffff", map: stripes, roughness: 0.5 }));
  const tendonM = mat("muscles", new THREE.MeshStandardMaterial({ color: "#e8d9cf", roughness: 0.5 }));
  muscles.add(ellipsoid(v(0, 1.385, -0.07), [0.15, 0.07, 0.03], muscleM));
  muscles.add(ellipsoid(v(0, 1.67, 0.0), [0.09, 0.09, 0.1], muscleM));
  for (const s of sides) muscles.add(ellipsoid(v(s * 0.05, 1.575, 0.05), [0.03, 0.04, 0.035], muscleM));
  for (let r = 0; r < 3; r++) for (const s of sides) muscles.add(ellipsoid(v(s * 0.03, 1.13 - r * 0.068, 0.084 - r * 0.002), [0.027, 0.03, 0.014], muscleM));
  muscles.add(ellipsoid(v(0, 1.06, 0.09), [0.003, 0.11, 0.004], tendonM));
  for (const s of sides) {
    const j = J(s);
    muscles.add(ellipsoid(v(s * 0.075, 1.3, 0.075), [0.075, 0.055, 0.03], muscleM, [0, 0, s * 0.25]));
    muscles.add(ellipsoid(v(s * 0.118, 1.05, 0.03), [0.04, 0.085, 0.05], muscleM));
    muscles.add(ellipsoid(v(s * 0.11, 1.2, -0.07), [0.07, 0.12, 0.03], muscleM, [0, 0, s * 0.2]));
    muscles.add(ellipsoid(j.shoulder.clone().add(v(s * 0.012, -0.015, 0)), [0.06, 0.075, 0.064], muscleM));
    muscles.add(spindle(v(s * 0.025, 1.44, 0.04), v(s * 0.05, 1.56, -0.015), 0.014, 0.014, muscleM));
    muscles.add(spindle(j.shoulder.clone().lerp(j.elbow, 0.15), j.elbow, 0.032, 0.028, muscleM, v(0, 0, 0.022)));
    muscles.add(spindle(j.shoulder.clone().lerp(j.elbow, 0.1), j.elbow, 0.034, 0.03, muscleM, v(0, 0, -0.02)));
    muscles.add(spindle(j.elbow, j.elbow.clone().lerp(j.wrist, 0.8), 0.036, 0.032, muscleM));
    muscles.add(spindle(j.wrist, j.hand, 0.038, 0.016, tendonM));
    muscles.add(ellipsoid(v(s * 0.08, 0.86, -0.08), [0.085, 0.095, 0.06], muscleM));
    muscles.add(spindle(j.hip.clone().add(v(0, 0.04, 0)), j.knee.clone().add(v(0, 0.02, 0)), 0.065, 0.06, muscleM, v(0, 0, 0.02)));
    muscles.add(spindle(j.hip, j.knee, 0.055, 0.05, muscleM, v(0, 0, -0.028)));
    muscles.add(spindle(j.knee, j.knee.clone().lerp(j.ankle, 0.6), 0.048, 0.045, muscleM, v(0, 0, -0.03)));
    muscles.add(spindle(j.knee, j.ankle, 0.022, 0.02, muscleM, v(s * -0.005, 0, 0.025)));
    muscles.add(spindle(j.heel.clone().add(v(0, 0.02, 0)), j.toe, 0.042, 0.022, tendonM));
  }

  // ===== Skin =====
  const skin = makeLayer("skin", 6);
  const skinM = mat(
    "skin",
    new THREE.MeshPhysicalMaterial({ color: "#e3ae8c", roughness: 0.55, sheen: 0.6, sheenColor: new THREE.Color("#ffd2b8"), clearcoat: 0.15 }),
  );
  skin.add(ellipsoid(v(0, 1.635, 0.0), [0.096, 0.122, 0.112], skinM));
  for (const s of sides) skin.add(ellipsoid(v(s * 0.096, 1.63, -0.005), [0.012, 0.025, 0.015], skinM));
  skin.add(ellipsoid(v(0, 1.62, 0.11), [0.013, 0.02, 0.014], skinM));
  skin.add(segment(v(0, 1.44, -0.01), v(0, 1.57, -0.01), 0.055, 0.05, skinM));
  const torsoProfile = [
    [0.0, 0.8], [0.13, 0.805], [0.165, 0.86], [0.165, 0.93], [0.145, 1.02], [0.138, 1.1],
    [0.158, 1.22], [0.178, 1.33], [0.19, 1.39], [0.15, 1.44], [0.06, 1.465], [0.0, 1.47],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const torso = new THREE.Mesh(new THREE.LatheGeometry(torsoProfile, 48), skinM);
  disposables.push(torso.geometry);
  torso.scale.set(1.12, 1, 0.64);
  skin.add(torso);
  for (const s of sides) {
    const j = J(s);
    skin.add(ball(j.shoulder.clone().add(v(s * 0.005, -0.01, 0)), 0.062, skinM));
    skin.add(segment(j.shoulder, j.elbow, 0.055, 0.044, skinM));
    skin.add(ball(j.elbow, 0.044, skinM));
    skin.add(segment(j.elbow, j.wrist, 0.044, 0.031, skinM));
    skin.add(ball(j.wrist, 0.031, skinM));
    skin.add(spindle(j.wrist, j.hand, 0.042, 0.018, skinM));
    skin.add(segment(j.hip, j.knee, 0.088, 0.054, skinM));
    skin.add(ball(j.knee, 0.054, skinM));
    skin.add(spindle(j.knee, j.knee.clone().lerp(j.ankle, 0.65), 0.058, 0.058, skinM, v(0, 0, -0.012)));
    skin.add(segment(j.knee, j.ankle, 0.052, 0.035, skinM));
    skin.add(ball(j.ankle, 0.036, skinM));
    skin.add(spindle(j.heel, j.toe, 0.046, 0.032, skinM));
  }
  skin.add(ellipsoid(v(0, 0.86, -0.01), [0.175, 0.085, 0.115], skinM));
  for (const s of sides) skin.add(ellipsoid(v(s * 0.075, 0.86, -0.06), [0.09, 0.1, 0.065], skinM));

  for (const g of [skel, muscles, skin, organGroup]) {
    g.traverse((o) => {
      if (o instanceof THREE.Mesh && o.geometry !== sphereGeo && o.geometry !== vertGeo && o.geometry !== brainGeo) disposables.push(o.geometry);
    });
  }
  disposables.push(sphereGeo);

  const update = (time: number) => {
    // Heartbeat: a quick double pulse about once a second.
    const beatT = (time * 1.15) % 1;
    const beat = Math.exp(-((beatT - 0.1) ** 2) / 0.002) * 0.16 + Math.exp(-((beatT - 0.3) ** 2) / 0.003) * 0.08;
    heart.scale.setScalar(1 + beat);
    // Breathing.
    const breath = 1 + 0.045 * Math.sin(time * 1.4);
    for (const l of lungs) l.scale.y = (l === lungs[0] ? 0.115 : 0.105) * breath;
    // Particles moving through vessels and nerves.
    for (const f of flows) {
      if (!f.mesh.parent?.visible) continue;
      const n = f.mesh.count;
      for (let i = 0; i < n; i++) {
        let u = (time * f.speed + i / n) % 1;
        if (f.reverse) u = 1 - u;
        dummy.position.copy(f.curve.getPointAt(u));
        dummy.updateMatrix();
        f.mesh.setMatrixAt(i, dummy.matrix);
      }
      f.mesh.instanceMatrix.needsUpdate = true;
    }
  };

  return {
    root,
    layers,
    organs,
    update,
    dispose: () => {
      for (const d of new Set(disposables)) d.dispose();
    },
  };
}

/** Ease each layer and organ toward its target opacity. */
export function applyOpacity(body: Body, dt: number) {
  const k = 1 - Math.exp(-dt * 3.5);
  for (const organ of Object.values(body.organs)) organ.current += (organ.target - organ.current) * k;
  const organFactor = new Map<THREE.Material, number>();
  for (const organ of Object.values(body.organs)) for (const m of organ.materials) organFactor.set(m.mat, organ.current);

  for (const layer of Object.values(body.layers)) {
    layer.current += (layer.target - layer.current) * k;
    if (Math.abs(layer.target - layer.current) < 0.002) layer.current = layer.target;
    layer.group.visible = layer.current > 0.01;
    for (const { mat, base } of layer.materials) {
      const o = base * layer.current * (organFactor.get(mat) ?? 1);
      mat.opacity = o;
      mat.depthWrite = o > 0.97;
    }
  }
}

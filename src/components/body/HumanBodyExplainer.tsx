"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { applyOpacity, buildBody, type Body } from "./buildBody";
import { CHAPTERS, LAYERS, type LayerName, type OrganName } from "./chapters";
import "@fontsource/bebas-neue/400.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import styles from "./explainer.module.css";

type Mode = "tour" | "explore";

type CaptureApi = {
  chapters: { title: string; text: string }[];
  setDurations: (d: number[]) => void;
  totalDuration: () => number;
  step: (dt: number) => void;
  /** Fast-forward without drawing intermediate frames. */
  advance: (seconds: number) => void;
};

declare global {
  interface Window {
    __bodyCapture?: CaptureApi;
  }
}

const ALL_ORGANS: OrganName[] = ["brain", "lungs", "heart", "liver", "stomach", "intestines", "kidneys"];

export default function HumanBodyExplainer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<Body | null>(null);

  // Timeline state lives in refs so the render loop can read it without re-subscribing.
  const chapterRef = useRef(0);
  const chapterTimeRef = useRef(0);
  const playingRef = useRef(true);
  const modeRef = useRef<Mode>("tour");
  const narrateRef = useRef(false);
  const speakingRef = useRef(false);
  const durationsRef = useRef(CHAPTERS.map((c) => c.duration));
  const captureRef = useRef(false);

  const [chapter, setChapter] = useState(0);
  const [progress, setProgress] = useState(0);
  const [captionAlpha, setCaptionAlpha] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [mode, setMode] = useState<Mode>("tour");
  const [narrate, setNarrate] = useState(false);
  const [durations, setDurations] = useState(() => CHAPTERS.map((c) => c.duration));
  // "?capture" in the URL hides the controls and lets a script drive time frame by frame.
  const capture = useSyncExternalStore(
    () => () => {},
    () => new URLSearchParams(window.location.search).has("capture"),
    () => false,
  );
  const [manualLayers, setManualLayers] = useState<Record<LayerName, boolean>>({
    skin: true,
    muscles: false,
    skeleton: false,
    organs: false,
    vessels: false,
    nerves: false,
  });

  const speakChapter = useCallback((i: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    speakingRef.current = false;
    if (!narrateRef.current || captureRef.current) return;
    const c = CHAPTERS[i];
    const u = new SpeechSynthesisUtterance(`${c.title}. ${c.text}`);
    u.rate = 0.98;
    u.onend = u.onerror = () => {
      speakingRef.current = false;
    };
    speakingRef.current = true;
    window.speechSynthesis.speak(u);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const next = (i + CHAPTERS.length) % CHAPTERS.length;
      chapterRef.current = next;
      chapterTimeRef.current = 0;
      setChapter(next);
      if (playingRef.current && modeRef.current === "tour") speakChapter(next);
    },
    [speakChapter],
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const isCapture = new URLSearchParams(window.location.search).has("capture");
    captureRef.current = isCapture;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#07070a");
    scene.fog = new THREE.Fog("#07070a", 4, 9);

    const camera = new THREE.PerspectiveCamera(38, 1, 0.02, 50);
    camera.position.set(0, 1.0, 3.1);

    scene.add(new THREE.HemisphereLight("#ffffff", "#2a1a14", 1.1));
    const key = new THREE.DirectionalLight("#ffffff", 2.2);
    key.position.set(1.5, 2.5, 2.5);
    scene.add(key);
    const rim = new THREE.DirectionalLight("#ff6a3d", 1.6);
    rim.position.set(-2, 1.5, -2);
    scene.add(rim);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(0.7, 64),
      new THREE.MeshBasicMaterial({ color: "#ff3d00", transparent: true, opacity: 0.08 }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.68, 0.7, 96),
      new THREE.MeshBasicMaterial({ color: "#ff3d00", transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.002;
    scene.add(ring);

    const body = buildBody();
    bodyRef.current = body;
    scene.add(body.root);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 0.4;
    controls.maxDistance = 5;
    controls.target.set(0, 0.95, 0);

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      // Shift the body away from the caption: to the right on wide screens,
      // upward on tall ones (where the caption sits at the bottom).
      if (w >= h) {
        camera.aspect = (w * 1.35) / h;
        camera.setViewOffset(w * 1.35, h, 0, 0, w, h);
        camera.zoom = 1;
      } else {
        camera.aspect = w / (h * 1.45);
        camera.setViewOffset(w, h * 1.45, 0, h * 0.45, w, h);
        camera.zoom = Math.min(1, (w / h) * 0.7);
      }
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let time = 0;
    const camPos = new THREE.Vector3();
    const camTarget = new THREE.Vector3();

    const step = (dt: number, render = true) => {
      time += dt;
      const inTour = modeRef.current === "tour";

      if (inTour && playingRef.current) {
        chapterTimeRef.current += dt;
        const dur = durationsRef.current[chapterRef.current];
        const waiting = speakingRef.current && chapterTimeRef.current < dur + 25;
        if (chapterTimeRef.current >= dur && !waiting) {
          if (captureRef.current && chapterRef.current === CHAPTERS.length - 1) {
            chapterTimeRef.current = dur;
          } else {
            goTo(chapterRef.current + 1);
          }
        }
      }

      const c = CHAPTERS[chapterRef.current];
      if (inTour) {
        for (const l of LAYERS) body.layers[l.id].target = c.layers[l.id] ?? 0;
        for (const o of ALL_ORGANS) body.organs[o].target = !c.focus || c.focus.includes(o) ? 1 : 0.18;
      }

      if (inTour && playingRef.current) {
        const dur = durationsRef.current[chapterRef.current];
        const t = Math.min(1, chapterTimeRef.current / dur);
        const angle = (t - 0.5) * c.orbit;
        camTarget.set(...c.camera.target);
        camPos.set(...c.camera.pos).sub(camTarget).applyAxisAngle(new THREE.Vector3(0, 1, 0), angle).add(camTarget);
        const k = 1 - Math.exp(-dt * 1.8);
        camera.position.lerp(camPos, k);
        controls.target.lerp(camTarget, k);
        camera.lookAt(controls.target);
      } else {
        controls.update();
      }

      applyOpacity(body, dt);
      if (!render) return;
      body.update(time);
      renderer.render(scene, camera);

      const dur = durationsRef.current[chapterRef.current];
      const ct = chapterTimeRef.current;
      setProgress(
        (durationsRef.current.slice(0, chapterRef.current).reduce((a, b) => a + b, 0) + Math.min(ct, dur)) /
          durationsRef.current.reduce((a, b) => a + b, 0),
      );
      setCaptionAlpha(inTour ? Math.min(1, ct / 0.7, Math.max(0, (dur + 0.2 - ct) / 0.5)) : 1);
    };

    const clock = new THREE.Clock();
    if (isCapture) {
      window.__bodyCapture = {
        chapters: CHAPTERS.map((c) => ({ title: c.title, text: c.text })),
        setDurations: (d) => {
          durationsRef.current = d;
          setDurations(d);
        },
        totalDuration: () => durationsRef.current.reduce((a, b) => a + b, 0),
        step: (dt) => step(dt),
        advance: (seconds) => {
          for (let t = 0; t < seconds; t += 1 / 30) step(1 / 30, false);
          step(0);
        },
      };
      step(0);
    } else {
      renderer.setAnimationLoop(() => step(Math.min(clock.getDelta(), 0.1)));
      speakChapter(0);
    }

    return () => {
      renderer.setAnimationLoop(null);
      observer.disconnect();
      controls.dispose();
      body.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      delete window.__bodyCapture;
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, [goTo, speakChapter]);

  // Explore mode: layers follow the checkboxes.
  useEffect(() => {
    const body = bodyRef.current;
    if (!body || mode !== "explore") return;
    for (const l of LAYERS) body.layers[l.id].target = manualLayers[l.id] ? 1 : 0;
    for (const o of ALL_ORGANS) body.organs[o].target = 1;
    // Make outer layers see-through when something under them is shown.
    const order: LayerName[] = ["skin", "muscles", "skeleton", "organs"];
    order.forEach((id, i) => {
      const covered = [...order.slice(i + 1), "vessels", "nerves"].some((x) => manualLayers[x as LayerName]);
      if (manualLayers[id] && covered) body.layers[id].target = id === "skeleton" ? 0.45 : 0.15;
    });
  }, [manualLayers, mode]);

  const togglePlay = () => {
    const next = !playingRef.current;
    playingRef.current = next;
    setPlaying(next);
    if (next) {
      modeRef.current = "tour";
      setMode("tour");
      speakChapter(chapterRef.current);
    } else if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      speakingRef.current = false;
    }
  };

  const toggleNarrate = () => {
    const next = !narrateRef.current;
    narrateRef.current = next;
    setNarrate(next);
    if (next && playingRef.current && modeRef.current === "tour") speakChapter(chapterRef.current);
    else if (!next && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      speakingRef.current = false;
    }
  };

  const enterExplore = () => {
    modeRef.current = "explore";
    playingRef.current = false;
    setMode("explore");
    setPlaying(false);
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    speakingRef.current = false;
    // Start explore mode from whatever the tour was showing.
    const c = CHAPTERS[chapterRef.current];
    setManualLayers(
      Object.fromEntries(LAYERS.map((l) => [l.id, (c.layers[l.id] ?? 0) > 0.3])) as Record<LayerName, boolean>,
    );
  };

  const c = CHAPTERS[chapter];

  return (
    <div className={styles.wrap}>
      <div ref={mountRef} className={styles.canvas} />

      <header className={styles.header}>
        <span className={styles.brand}>Inside the Human Body</span>
        {!capture && (
          <div className={styles.modeSwitch}>
            <button className={mode === "tour" ? styles.active : ""} onClick={() => mode !== "tour" && togglePlay()}>
              Guided tour
            </button>
            <button className={mode === "explore" ? styles.active : ""} onClick={enterExplore}>
              Explore
            </button>
          </div>
        )}
      </header>

      {mode === "tour" ? (
        <section className={styles.caption} style={{ opacity: captionAlpha, transform: `translateY(${(1 - captionAlpha) * 12}px)` }}>
          <div className={styles.kicker}>{c.kicker}</div>
          <h2 className={styles.title}>{c.title}</h2>
          <div className={styles.stat}>
            <span className={styles.statValue}>{c.stat.value}</span>
            <span className={styles.statLabel}>{c.stat.label}</span>
          </div>
          <p className={styles.text}>{c.text}</p>
        </section>
      ) : (
        <section className={styles.layerPanel}>
          <div className={styles.kicker}>Layers</div>
          {LAYERS.map((l) => (
            <label key={l.id} className={styles.layerRow}>
              <input
                type="checkbox"
                checked={manualLayers[l.id]}
                onChange={(e) => setManualLayers((m) => ({ ...m, [l.id]: e.target.checked }))}
              />
              <span className={styles.swatch} style={{ background: l.color }} />
              {l.label}
            </label>
          ))}
          <p className={styles.hint}>Drag to rotate · pinch or scroll to zoom</p>
        </section>
      )}

      <footer className={styles.footer}>
        <div className={styles.segments}>
          {CHAPTERS.map((ch, i) => {
            const before = durations.slice(0, i).reduce((a, b) => a + b, 0);
            const total = durations.reduce((a, b) => a + b, 0);
            const fill = Math.max(0, Math.min(1, (progress * total - before) / durations[i]));
            return (
              <button
                key={ch.id}
                className={styles.segment}
                style={{ flexGrow: durations[i] }}
                onClick={() => {
                  if (mode !== "tour") togglePlay();
                  goTo(i);
                }}
                aria-label={ch.title}
                title={ch.title}
              >
                <span style={{ width: `${(mode === "tour" ? fill : i === chapter ? 1 : 0) * 100}%` }} />
              </button>
            );
          })}
        </div>
        {!capture && (
          <div className={styles.controls}>
            <button onClick={() => goTo(chapter - 1)} aria-label="Previous">⏮</button>
            <button className={styles.play} onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
              {playing ? "❚❚" : "▶"}
            </button>
            <button onClick={() => goTo(chapter + 1)} aria-label="Next">⏭</button>
            <button className={narrate ? styles.on : ""} onClick={toggleNarrate}>
              {narrate ? "🔊 Narration on" : "🔈 Narration off"}
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}

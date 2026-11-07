export type LayerName =
  | "skin"
  | "muscles"
  | "skeleton"
  | "organs"
  | "vessels"
  | "nerves";

export const LAYERS: { id: LayerName; label: string; color: string }[] = [
  { id: "skin", label: "Skin", color: "#e3ae8c" },
  { id: "muscles", label: "Muscles", color: "#c0392b" },
  { id: "skeleton", label: "Skeleton", color: "#efe6d2" },
  { id: "organs", label: "Organs", color: "#e8909a" },
  { id: "vessels", label: "Blood vessels", color: "#e53935" },
  { id: "nerves", label: "Nerves", color: "#f5d442" },
];

export type OrganName =
  | "brain"
  | "lungs"
  | "heart"
  | "liver"
  | "stomach"
  | "intestines"
  | "kidneys";

export type Chapter = {
  id: string;
  kicker: string;
  title: string;
  text: string;
  stat: { value: string; label: string };
  /** Opacity of each layer, 0 (hidden) to 1. Missing layers are hidden. */
  layers: Partial<Record<LayerName, number>>;
  /** When set, other organs are dimmed. */
  focus?: OrganName[];
  camera: { pos: [number, number, number]; target: [number, number, number] };
  /** How far (radians) the camera drifts around the body during the chapter. */
  orbit: number;
  /** Seconds to show the chapter when there is no narration to wait for. */
  duration: number;
};

const FULL = { pos: [0, 1.0, 3.1], target: [0, 0.95, 0] } as Chapter["camera"];

export const CHAPTERS: Chapter[] = [
  {
    id: "intro",
    kicker: "An amazing machine",
    title: "The Human Body",
    text: "Around 37 trillion cells, working together every second of your life. Let's peel it back, one layer at a time.",
    stat: { value: "37 trillion", label: "cells" },
    layers: { skin: 1 },
    camera: FULL,
    orbit: 0.9,
    duration: 9,
  },
  {
    id: "skin",
    kicker: "Layer 1",
    title: "Skin",
    text: "Your skin is your largest organ. Stretched out, it would cover nearly two square metres. You shed tens of thousands of skin cells every minute, and the outer layer is completely replaced every month or two.",
    stat: { value: "≈ 2 m²", label: "of living armour" },
    layers: { skin: 1 },
    camera: { pos: [0.9, 1.25, 1.9], target: [0, 1.15, 0] },
    orbit: 0.6,
    duration: 13,
  },
  {
    id: "muscles",
    kicker: "Layer 2",
    title: "Muscles",
    text: "Beneath the skin are more than six hundred muscles. They can only pull, never push, so they work in pairs: when your biceps pulls, your triceps relaxes. The biggest is in your buttocks, the smallest is inside your ear.",
    stat: { value: "600+", label: "muscles" },
    layers: { skin: 0.12, muscles: 1, skeleton: 0.15 },
    camera: { pos: [-1.1, 1.1, 2.0], target: [0, 1.0, 0] },
    orbit: 0.8,
    duration: 14,
  },
  {
    id: "skeleton",
    kicker: "Layer 3",
    title: "Skeleton",
    text: "An adult skeleton has two hundred and six bones, and more than half of them are in your hands and feet. Bone is living tissue: your skeleton slowly rebuilds itself, renewing roughly every ten years.",
    stat: { value: "206", label: "bones" },
    layers: { skin: 0.06, muscles: 0.08, skeleton: 1 },
    camera: { pos: [0.4, 1.0, 2.6], target: [0, 0.95, 0] },
    orbit: 1.0,
    duration: 14,
  },
  {
    id: "brain",
    kicker: "Layer 4 · Organs",
    title: "The Brain",
    text: "Your brain weighs about one and a half kilograms, yet it uses around twenty percent of your body's energy. Inside, roughly eighty-six billion neurons send signals to each other.",
    stat: { value: "86 billion", label: "neurons" },
    layers: { skin: 0.08, skeleton: 0.25, organs: 1 },
    focus: ["brain"],
    camera: { pos: [0.45, 1.72, 0.75], target: [0, 1.64, 0] },
    orbit: 0.7,
    duration: 13,
  },
  {
    id: "heart-lungs",
    kicker: "Layer 4 · Organs",
    title: "Heart & Lungs",
    text: "Your heart beats about one hundred thousand times a day, pumping more than seven thousand litres of blood. Your lungs breathe around twenty thousand times a day, and their tiny air sacs would cover about seventy square metres.",
    stat: { value: "100,000", label: "heartbeats a day" },
    layers: { skin: 0.06, skeleton: 0.3, organs: 1 },
    focus: ["heart", "lungs"],
    camera: { pos: [0.55, 1.28, 1.05], target: [0, 1.2, 0] },
    orbit: 0.6,
    duration: 15,
  },
  {
    id: "digestion",
    kicker: "Layer 4 · Organs",
    title: "Digestion",
    text: "Your small intestine is several metres long, folded up to fit inside your belly. Your liver handles hundreds of jobs, and it can even regrow when part of it is removed.",
    stat: { value: "500+", label: "jobs done by the liver" },
    layers: { skin: 0.06, skeleton: 0.2, organs: 1 },
    focus: ["liver", "stomach", "intestines", "kidneys"],
    camera: { pos: [-0.55, 1.05, 1.05], target: [0, 0.98, 0] },
    orbit: 0.6,
    duration: 13,
  },
  {
    id: "vessels",
    kicker: "Layer 5",
    title: "Blood Vessels",
    text: "Your heart pushes blood through a network of vessels so long it could circle the Earth more than twice. Red arteries carry oxygen out to every cell, and blue veins bring the blood back.",
    stat: { value: "≈ 100,000 km", label: "of blood vessels" },
    layers: { skin: 0.07, skeleton: 0.15, organs: 0.35, vessels: 1 },
    focus: ["heart"],
    camera: { pos: [0.7, 1.05, 2.4], target: [0, 0.95, 0] },
    orbit: 0.8,
    duration: 14,
  },
  {
    id: "nerves",
    kicker: "Layer 6",
    title: "Nerves",
    text: "Your nervous system is your body's wiring. Signals race from your brain, down your spinal cord and out to your fingers and toes at up to one hundred and twenty metres per second.",
    stat: { value: "430 km/h", label: "top nerve signal speed" },
    layers: { skin: 0.07, skeleton: 0.2, organs: 0.25, nerves: 1 },
    focus: ["brain"],
    camera: { pos: [-0.7, 1.1, 2.3], target: [0, 1.0, 0] },
    orbit: 0.8,
    duration: 13,
  },
  {
    id: "outro",
    kicker: "All together",
    title: "Your Body Is Amazing",
    text: "Every layer, every system, working together without you even thinking about it. Look after it. It's the only one you get.",
    stat: { value: "1", label: "body. Take care of it." },
    layers: {
      skin: 0.14,
      muscles: 0.1,
      skeleton: 0.45,
      organs: 1,
      vessels: 0.8,
      nerves: 0.7,
    },
    camera: FULL,
    orbit: 1.4,
    duration: 11,
  },
];

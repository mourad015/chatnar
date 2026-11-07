import type { Metadata } from "next";
import HumanBodyExplainer from "@/components/body/HumanBodyExplainer";

export const metadata: Metadata = {
  title: "Inside the Human Body — ChatNar",
  description: "A layer-by-layer 3D tour of the human body: skin, muscles, skeleton, organs, blood vessels and nerves.",
};

export default function BodyPage() {
  return <HumanBodyExplainer />;
}

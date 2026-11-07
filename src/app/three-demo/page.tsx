import ThreeScene from "@/components/ThreeScene";

export default function ThreeDemoPage() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        padding: 32,
      }}
    >
      <h1 style={{ fontSize: 24, fontWeight: 600 }}>three.js demo</h1>
      <ThreeScene
        style={{
          width: "100%",
          maxWidth: 576,
          height: 320,
          borderRadius: 12,
          overflow: "hidden",
          background: "#18181b",
        }}
      />
    </main>
  );
}

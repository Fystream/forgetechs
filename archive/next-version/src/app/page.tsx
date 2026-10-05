import Hero from "@/components/hero/Hero";

export default function Home() {
  return (
    <main className="relative">
      <Hero />

      {/* Step 2 will mount here: "Where things stand" → "What I do" →
          "What it costs" → "Selected work" → "Next step".
          The spacer exists so you can test the hero's scroll-driven WebGL
          response before those sections are built. */}
      <section className="relative h-screen" aria-hidden="true" />
    </main>
  );
}

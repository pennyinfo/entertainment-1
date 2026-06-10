import { createFileRoute } from "@tanstack/react-router";
import { SplashScreen } from "@/components/SplashScreen";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "fun-time" },
      { name: "description", content: "Welcome to fun-time — where the good vibes live." },
      { property: "og:title", content: "fun-time" },
      { property: "og:description", content: "Welcome to fun-time — where the good vibes live." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <SplashScreen />
      <main className="relative min-h-screen overflow-hidden bg-[#0a0a0f] text-white">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#00f0ff] opacity-10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#ff00e5] opacity-10 blur-3xl" />

        <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <h1
            className="text-5xl md:text-7xl font-black tracking-tight bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(90deg, #00f0ff, #ff00e5)",
              filter: "drop-shadow(0 0 24px rgba(0, 240, 255, 0.4))",
            }}
          >
            fun-time
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/70">
            Welcome in. The party starts here.
          </p>
        </div>
      </main>
    </>
  );
}

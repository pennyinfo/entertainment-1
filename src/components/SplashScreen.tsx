import { useEffect, useState } from "react";

export function SplashScreen() {
  const [hidden, setHidden] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2500);
    const hideTimer = setTimeout(() => setHidden(true), 3200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#0a0a0f] transition-all duration-700 ${
        fadeOut ? "opacity-0 scale-110 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      {/* Animated gradient orbs */}
      <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-[#00f0ff] opacity-20 blur-3xl animate-pulse" />
      <div
        className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-[#ff00e5] opacity-20 blur-3xl animate-pulse"
        style={{ animationDelay: "0.8s" }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#a855f7] opacity-10 blur-3xl animate-pulse"
        style={{ animationDelay: "0.4s" }}
      />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-white animate-particle-float"
          style={{
            left: `${(i * 53) % 100}%`,
            top: `${(i * 37) % 100}%`,
            animationDelay: `${(i * 0.3) % 3}s`,
            animationDuration: `${3 + (i % 4)}s`,
            boxShadow: "0 0 8px #00f0ff, 0 0 16px #00f0ff",
          }}
        />
      ))}

      {/* Neon logo */}
      <div className="relative z-10 text-center animate-splash-enter">
        <h1
          className="text-6xl md:text-8xl font-black tracking-tight bg-clip-text text-transparent animate-neon-pulse"
          style={{
            backgroundImage: "linear-gradient(90deg, #00f0ff, #ff00e5, #00f0ff)",
            backgroundSize: "200% 100%",
            filter: "drop-shadow(0 0 20px rgba(0, 240, 255, 0.6)) drop-shadow(0 0 40px rgba(255, 0, 229, 0.4))",
          }}
        >
          fun-time
        </h1>
        <div
          className="mt-6 mx-auto h-px w-32 bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent"
          style={{ boxShadow: "0 0 12px #00f0ff" }}
        />
        <p className="mt-4 text-sm uppercase tracking-[0.4em] text-white/60">
          Loading the vibes
        </p>
      </div>
    </div>
  );
}

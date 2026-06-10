import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { Landing } from "@/components/Landing";

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
  const [showLanding, setShowLanding] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setShowLanding(true), 3200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <SplashScreen />
      {showLanding ? <Landing /> : <div className="min-h-screen bg-[#0a0a0f]" />}
    </>
  );
}

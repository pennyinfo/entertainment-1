import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { userSession } from "@/lib/session";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — fun-time" }] }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const s = userSession.get();
    if (!s) navigate({ to: "/" });
    else setName(s.name);
  }, [navigate]);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-5xl md:text-6xl font-black bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#00f0ff,#ff00e5)" }}>
        Hey {name} 👋
      </h1>
      <p className="mt-4 text-white/70">You're in. The fun starts here.</p>
      <button
        onClick={() => { userSession.clear(); navigate({ to: "/" }); }}
        className="mt-8 px-6 py-2 rounded-md border border-white/20 hover:bg-white/10"
      >
        Sign out
      </button>
    </main>
  );
}

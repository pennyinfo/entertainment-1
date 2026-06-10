import { Link } from "@tanstack/react-router";

export function Landing() {
  return (
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
        <p className="mt-4 text-lg text-white/70">Welcome in. The party starts here.</p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            to="/signin"
            className="px-8 py-3 rounded-md font-semibold text-black bg-[#00f0ff] hover:bg-[#00f0ff]/90 transition"
            style={{ boxShadow: "0 0 24px rgba(0,240,255,0.5)" }}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-8 py-3 rounded-md font-semibold text-white bg-[#ff00e5] hover:bg-[#ff00e5]/90 transition"
            style={{ boxShadow: "0 0 24px rgba(255,0,229,0.5)" }}
          >
            Sign Up
          </Link>
        </div>

        <div className="mt-12 flex gap-4 text-xs text-white/40">
          <Link to="/admin" className="hover:text-white/70">Admin</Link>
          <span>·</span>
          <Link to="/super-admin" className="hover:text-white/70">Super Admin</Link>
        </div>
      </div>
    </main>
  );
}

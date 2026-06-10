import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { userSession } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/signin")({
  head: () => ({ meta: [{ title: "Sign In — fun-time" }] }),
  component: SignInPage,
});

function SignInPage() {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Mobile number must be 10 digits");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("id,name")
      .eq("mobile", mobile)
      .maybeSingle();
    setLoading(false);
    if (error) return toast.error(error.message);
    if (!data) return toast.error("Not registered. Please sign up.");
    userSession.set({ userId: data.id, name: data.name });
    toast.success("Welcome back, " + data.name);
    navigate({ to: "/welcome" });
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 backdrop-blur p-8 space-y-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#00f0ff,#ff00e5)" }}>
          Sign In
        </h1>
        <label className="block">
          <span className="text-sm text-white/70">Mobile number</span>
          <input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10 digits" className="mt-1 w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-[#00f0ff]" />
        </label>
        <button disabled={loading} className="w-full py-3 rounded-md font-semibold text-black bg-[#00f0ff] hover:bg-[#00f0ff]/90 disabled:opacity-60">
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <p className="text-sm text-white/60 text-center">
          New here? <Link to="/signup" className="text-[#ff00e5] hover:underline">Create an account</Link>
        </p>
      </form>
    </main>
  );
}

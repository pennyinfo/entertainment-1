import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { userSession } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign Up — fun-time" }] }),
  component: SignUpPage,
});

type Panchayath = { id: string; name: string };
type Ward = { id: string; panchayath_id: string; name: string };

function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [panchayathId, setPanchayathId] = useState("");
  const [wardId, setWardId] = useState("");
  const [panchayaths, setPanchayaths] = useState<Panchayath[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("panchayaths").select("id,name").order("name");
      const { data: w } = await supabase.from("wards").select("id,panchayath_id,name").order("name");
      setPanchayaths(p ?? []);
      setWards(w ?? []);
    })();
  }, []);

  const filteredWards = useMemo(
    () => wards.filter((w) => w.panchayath_id === panchayathId),
    [wards, panchayathId],
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Mobile number must be 10 digits");
      return;
    }
    if (!name.trim() || !panchayathId || !wardId) {
      toast.error("Please fill all fields");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .insert({ name: name.trim(), mobile, panchayath_id: panchayathId, ward_id: wardId })
      .select("id,name")
      .single();
    setLoading(false);
    if (error) {
      if (error.code === "23505") toast.error("Mobile already registered. Please sign in.");
      else toast.error(error.message);
      return;
    }
    userSession.set({ userId: data.id, name: data.name });
    toast.success("Welcome, " + data.name);
    navigate({ to: "/welcome" });
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 backdrop-blur p-8 space-y-4"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent" style={{ backgroundImage: "linear-gradient(90deg,#00f0ff,#ff00e5)" }}>
          Sign Up
        </h1>
        <label className="block">
          <span className="text-sm text-white/70">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-[#00f0ff]" />
        </label>
        <label className="block">
          <span className="text-sm text-white/70">Mobile number</span>
          <input value={mobile} onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))} placeholder="10 digits" className="mt-1 w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-[#00f0ff]" />
        </label>
        <label className="block">
          <span className="text-sm text-white/70">Panchayath</span>
          <select value={panchayathId} onChange={(e) => { setPanchayathId(e.target.value); setWardId(""); }} className="mt-1 w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-[#00f0ff]">
            <option value="">Select panchayath</option>
            {panchayaths.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {panchayaths.length === 0 && <p className="text-xs text-white/40 mt-1">No panchayaths yet — ask super admin to add them.</p>}
        </label>
        <label className="block">
          <span className="text-sm text-white/70">Ward</span>
          <select value={wardId} onChange={(e) => setWardId(e.target.value)} disabled={!panchayathId} className="mt-1 w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-[#00f0ff] disabled:opacity-50">
            <option value="">Select ward</option>
            {filteredWards.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </label>
        <button disabled={loading} className="w-full py-3 rounded-md font-semibold text-black bg-[#00f0ff] hover:bg-[#00f0ff]/90 disabled:opacity-60">
          {loading ? "Signing up…" : "Sign Up"}
        </button>
        <p className="text-sm text-white/60 text-center">
          Already have an account? <Link to="/signin" className="text-[#00f0ff] hover:underline">Sign in</Link>
        </p>
      </form>
    </main>
  );
}

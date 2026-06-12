import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { superAdminSession, type SuperAdminSession } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/super-admin")({
  head: () => ({ meta: [{ title: "Super Admin — fun-time" }] }),
  component: SuperAdminPage,
});

function SuperAdminPage() {
  const [session, setSession] = useState<SuperAdminSession | null>(null);
  useEffect(() => { setSession(superAdminSession.get()); }, []);
  if (!session) return <SuperLogin onLogin={setSession} />;
  return <SuperDashboard session={session} onSignOut={() => { superAdminSession.clear(); setSession(null); }} />;
}

function SuperLogin({ onLogin }: { onLogin: (s: SuperAdminSession) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from("super_admins").select("id,email,password").eq("email", email).maybeSingle();
    setLoading(false);
    if (error) return toast.error(error.message);
    if (!data || data.password !== password) return toast.error("Invalid credentials");
    const s = { superAdminId: data.id, email: data.email };
    superAdminSession.set(s);
    onLogin(s);
    toast.success("Signed in as super admin");
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 backdrop-blur p-8 space-y-4">
        <h1 className="text-3xl font-bold">Super Admin Login</h1>
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2" />
        <button disabled={loading} className="w-full py-3 rounded-md font-semibold text-white bg-[#ff00e5]">{loading ? "…" : "Login"}</button>
        <p className="text-xs text-white/40 text-center">Default: superadmin@funtime.local / changeme123</p>
      </form>
    </main>
  );
}

type Panchayath = { id: string; name: string };
type Ward = { id: string; panchayath_id: string; name: string };
type Admin = { id: string; mobile: string; created_at: string };
type UserRow = {
  id: string; name: string; mobile: string; created_at: string;
  panchayaths: { name: string } | null; wards: { name: string } | null;
};

function SuperDashboard({ session, onSignOut }: { session: SuperAdminSession; onSignOut: () => void }) {
  const [tab, setTab] = useState<"admins" | "places" | "users">("admins");

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Super Admin</h1>
            <p className="text-white/60 text-sm">{session.email}</p>
          </div>
          <button onClick={onSignOut} className="px-4 py-2 rounded-md border border-white/20 hover:bg-white/10">Sign out</button>
        </div>
        <div className="flex gap-2 mb-6">
          {(["admins", "places", "users"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md capitalize ${tab === t ? "bg-[#ff00e5] text-white" : "bg-white/5 hover:bg-white/10"}`}>
              {t === "places" ? "Panchayaths & Wards" : t}
            </button>
          ))}
        </div>
        {tab === "admins" && <AdminsTab />}
        {tab === "places" && <PlacesTab />}
        {tab === "users" && <UsersTab />}
      </div>
    </main>
  );
}

function AdminsTab() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  async function reload() {
    const { data } = await supabase.from("admins").select("id,mobile,created_at").order("created_at", { ascending: false });
    setAdmins(data ?? []);
  }
  useEffect(() => { reload(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!mobile || !password) return toast.error("Fill mobile and password");
    const { error } = await supabase.from("admins").insert({ mobile, password });
    if (error) return toast.error(error.code === "23505" ? "Admin with this mobile already exists" : error.message);
    setMobile(""); setPassword("");
    toast.success("Admin added");
    reload();
  }

  async function remove(id: string) {
    if (!confirm("Delete this admin?")) return;
    const { error } = await supabase.from("admins").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={add} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-wrap gap-2">
        <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Admin mobile" className="flex-1 min-w-[160px] rounded-md bg-black/40 border border-white/10 px-3 py-2" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="flex-1 min-w-[160px] rounded-md bg-black/40 border border-white/10 px-3 py-2" />
        <button className="px-4 py-2 rounded-md font-semibold text-white bg-[#ff00e5]">Add admin</button>
      </form>
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left"><tr><th className="p-3">Mobile</th><th className="p-3">Created</th><th className="p-3"></th></tr></thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.id} className="border-t border-white/10">
                <td className="p-3">{a.mobile}</td>
                <td className="p-3 text-white/50">{new Date(a.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right"><button onClick={() => remove(a.id)} className="text-red-400 hover:underline">Delete</button></td>
              </tr>
            ))}
            {admins.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-white/50">No admins yet</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlacesTab() {
  const [panchayaths, setPanchayaths] = useState<Panchayath[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [pName, setPName] = useState("");
  const [wardInputs, setWardInputs] = useState<Record<string, string>>({});

  async function reload() {
    const { data: p } = await supabase.from("panchayaths").select("id,name").order("name");
    const { data: w } = await supabase.from("wards").select("id,panchayath_id,name").order("name");
    setPanchayaths(p ?? []);
    setWards(w ?? []);
  }
  useEffect(() => { reload(); }, []);

  async function addPanchayath(e: React.FormEvent) {
    e.preventDefault();
    if (!pName.trim()) return;
    const { error } = await supabase.from("panchayaths").insert({ name: pName.trim() });
    if (error) return toast.error(error.code === "23505" ? "Already exists" : error.message);
    setPName(""); reload();
  }
  async function deletePanchayath(id: string) {
    if (!confirm("Delete this panchayath and its wards?")) return;
    await supabase.from("panchayaths").delete().eq("id", id);
    reload();
  }
  async function addWard(panchayathId: string) {
    const raw = (wardInputs[panchayathId] ?? "").trim();
    if (!raw) return;
    const count = parseInt(raw, 10);
    if (!Number.isInteger(count) || count < 1 || count > 500) {
      return toast.error("Enter a number between 1 and 500");
    }
    const existing = new Set(
      wards.filter((w) => w.panchayath_id === panchayathId).map((w) => w.name)
    );
    const rows = Array.from({ length: count }, (_, i) => ({
      panchayath_id: panchayathId,
      name: String(i + 1),
    })).filter((r) => !existing.has(r.name));
    if (rows.length === 0) {
      toast.message("All wards already exist");
      setWardInputs((s) => ({ ...s, [panchayathId]: "" }));
      return;
    }
    const { error } = await supabase.from("wards").insert(rows);
    if (error) return toast.error(error.message);
    toast.success(`Added ${rows.length} ward(s)`);
    setWardInputs((s) => ({ ...s, [panchayathId]: "" }));
    reload();
  }
  async function deleteWard(id: string) {
    await supabase.from("wards").delete().eq("id", id);
    reload();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={addPanchayath} className="rounded-xl border border-white/10 bg-white/5 p-4 flex gap-2">
        <input value={pName} onChange={(e) => setPName(e.target.value)} placeholder="New panchayath name" className="flex-1 rounded-md bg-black/40 border border-white/10 px-3 py-2" />
        <button className="px-4 py-2 rounded-md font-semibold text-white bg-[#ff00e5]">Add</button>
      </form>
      <div className="space-y-4">
        {panchayaths.map((p) => {
          const ws = wards.filter((w) => w.panchayath_id === p.id);
          return (
            <div key={p.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                <button onClick={() => deletePanchayath(p.id)} className="text-xs text-red-400 hover:underline">Delete panchayath</button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {ws.map((w) => (
                  <span key={w.id} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-sm">
                    {w.name}
                    <button onClick={() => deleteWard(w.id)} className="text-red-400">×</button>
                  </span>
                ))}
                {ws.length === 0 && <span className="text-white/40 text-sm">No wards</span>}
              </div>
              <div className="flex gap-2">
                <input
                  value={wardInputs[p.id] ?? ""}
                  onChange={(e) => setWardInputs((s) => ({ ...s, [p.id]: e.target.value }))}
                  placeholder="Add ward"
                  className="flex-1 rounded-md bg-black/40 border border-white/10 px-3 py-2 text-sm"
                />
                <button onClick={() => addWard(p.id)} className="px-3 py-2 rounded-md bg-[#00f0ff] text-black text-sm font-semibold">Add ward</button>
              </div>
            </div>
          );
        })}
        {panchayaths.length === 0 && <p className="text-white/50 text-center py-8">No panchayaths yet. Add one above.</p>}
      </div>
    </div>
  );
}

function UsersTab() {
  const [users, setUsers] = useState<UserRow[]>([]);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("users")
        .select("id,name,mobile,created_at,panchayaths(name),wards(name)")
        .order("created_at", { ascending: false });
      setUsers((data ?? []) as unknown as UserRow[]);
    })();
  }, []);
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-left">
          <tr><th className="p-3">Name</th><th className="p-3">Mobile</th><th className="p-3">Panchayath</th><th className="p-3">Ward</th><th className="p-3">Registered</th></tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t border-white/10">
              <td className="p-3">{u.name}</td>
              <td className="p-3">{u.mobile}</td>
              <td className="p-3">{u.panchayaths?.name ?? "—"}</td>
              <td className="p-3">{u.wards?.name ?? "—"}</td>
              <td className="p-3 text-white/50">{new Date(u.created_at).toLocaleDateString()}</td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-white/50">No users yet</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

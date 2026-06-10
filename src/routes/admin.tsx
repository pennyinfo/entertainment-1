import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminSession, type AdminSession } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — fun-time" }] }),
  component: AdminPage,
});

type UserRow = {
  id: string;
  name: string;
  mobile: string;
  created_at: string;
  panchayaths: { name: string } | null;
  wards: { name: string } | null;
};

function AdminPage() {
  const [session, setSession] = useState<AdminSession | null>(null);

  useEffect(() => {
    setSession(adminSession.get());
  }, []);

  if (!session) return <AdminLogin onLogin={setSession} />;
  return <AdminDashboard session={session} onSignOut={() => { adminSession.clear(); setSession(null); }} />;
}

function AdminLogin({ onLogin }: { onLogin: (s: AdminSession) => void }) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase
      .from("admins").select("id,mobile,password").eq("mobile", mobile).maybeSingle();
    setLoading(false);
    if (error) return toast.error(error.message);
    if (!data || data.password !== password) return toast.error("Invalid credentials");
    const s = { adminId: data.id, mobile: data.mobile };
    adminSession.set(s);
    onLogin(s);
    toast.success("Signed in as admin");
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-6">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 backdrop-blur p-8 space-y-4">
        <h1 className="text-3xl font-bold">Admin Login</h1>
        <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="Mobile" className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-[#00f0ff]" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 outline-none focus:border-[#00f0ff]" />
        <button disabled={loading} className="w-full py-3 rounded-md font-semibold text-black bg-[#00f0ff]">{loading ? "…" : "Login"}</button>
      </form>
    </main>
  );
}

function AdminDashboard({ session, onSignOut }: { session: AdminSession; onSignOut: () => void }) {
  const [users, setUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("users")
        .select("id,name,mobile,created_at,panchayaths(name),wards(name)")
        .order("created_at", { ascending: false });
      setUsers((data ?? []) as unknown as UserRow[]);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-white/60 text-sm">Logged in as {session.mobile}</p>
          </div>
          <button onClick={onSignOut} className="px-4 py-2 rounded-md border border-white/20 hover:bg-white/10">Sign out</button>
        </div>
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-white/5 text-left">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Mobile</th>
                <th className="p-3">Panchayath</th>
                <th className="p-3">Ward</th>
                <th className="p-3">Registered</th>
              </tr>
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
              {users.length === 0 && (
                <tr><td colSpan={5} className="p-6 text-center text-white/50">No users yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

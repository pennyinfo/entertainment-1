import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { userSession } from "@/lib/session";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/welcome")({
  head: () => ({ meta: [{ title: "Welcome — fun-time" }] }),
  component: WelcomePage,
});

type Program = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  seconds_per_question: number;
};

type ProgramRow = Program & { attempted: boolean; questionCount: number };

function WelcomePage() {
  const navigate = useNavigate();
  const [name, setName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [programs, setPrograms] = useState<ProgramRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = userSession.get();
    if (!s) {
      navigate({ to: "/" });
      return;
    }
    setName(s.name);
    setUserId(s.userId);
  }, [navigate]);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      const [{ data: progs }, { data: attempts }] = await Promise.all([
        supabase
          .from("programs")
          .select("id, slug, title, description, seconds_per_question, questions(count)")
          .eq("is_active", true)
          .order("created_at", { ascending: false }),
        supabase.from("attempts").select("program_id").eq("user_id", userId),
      ]);
      const attemptedSet = new Set((attempts ?? []).map((a: any) => a.program_id));
      const rows: ProgramRow[] = (progs ?? []).map((p: any) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        description: p.description,
        seconds_per_question: p.seconds_per_question,
        attempted: attemptedSet.has(p.id),
        questionCount: p.questions?.[0]?.count ?? 0,
      }));
      setPrograms(rows);
      setLoading(false);
    })();
  }, [userId]);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div>
            <h1
              className="text-3xl md:text-4xl font-black bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(90deg,#00f0ff,#ff00e5)" }}
            >
              Hey {name} 👋
            </h1>
            <p className="mt-1 text-white/60 text-sm">Pick a quiz below to get started.</p>
          </div>
          <button
            onClick={() => {
              userSession.clear();
              navigate({ to: "/" });
            }}
            className="px-4 py-2 rounded-md border border-white/20 hover:bg-white/10 text-sm"
          >
            Sign out
          </button>
        </header>

        <h2 className="text-xl font-bold mb-4">Available Programs</h2>

        {loading ? (
          <p className="text-white/60">Loading…</p>
        ) : programs.length === 0 ? (
          <p className="text-white/60">No quizzes available right now. Check back soon.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {programs.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-white/10 bg-white/5 p-5 flex flex-col"
              >
                <h3 className="text-lg font-semibold">{p.title}</h3>
                {p.description && (
                  <p className="mt-1 text-white/60 text-sm line-clamp-2">{p.description}</p>
                )}
                <div className="mt-3 flex gap-3 text-xs text-white/50">
                  <span>{p.questionCount} questions</span>
                  <span>•</span>
                  <span>{p.seconds_per_question}s per question</span>
                </div>
                <div className="mt-5">
                  {p.attempted ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-md bg-white/10 text-white/50 text-sm cursor-not-allowed"
                    >
                      Already attempted
                    </button>
                  ) : p.questionCount === 0 ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-md bg-white/10 text-white/50 text-sm cursor-not-allowed"
                    >
                      Coming soon
                    </button>
                  ) : (
                    <Link
                      to="/quiz/$slug"
                      params={{ slug: p.slug }}
                      className="inline-block px-4 py-2 rounded-md font-semibold text-black"
                      style={{ backgroundImage: "linear-gradient(90deg,#00f0ff,#ff00e5)" }}
                    >
                      Start Quiz →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

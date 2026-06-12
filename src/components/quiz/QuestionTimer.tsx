import { useEffect, useState } from "react";

export function QuestionTimer({ seconds, resetKey, onExpire }: { seconds: number; resetKey: number; onExpire: () => void }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => { setLeft(seconds); }, [seconds, resetKey]);
  useEffect(() => {
    if (left <= 0) { onExpire(); return; }
    const timer = window.setTimeout(() => setLeft((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [left, onExpire]);
  const pct = Math.max(0, (left / seconds) * 100);
  return <div className="relative grid size-16 place-items-center rounded-full" style={{ background: `conic-gradient(var(--primary) ${pct}%, var(--muted) 0)` }}><div className="grid size-12 place-items-center rounded-full bg-background text-lg font-bold">{left}</div></div>;
}
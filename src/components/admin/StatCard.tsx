type StatCardProps = { label: string; value: number; note: string; tone: "blue" | "orange" | "cyan" };

const tones = { blue: "text-chart-3 bg-chart-3/10", orange: "text-chart-1 bg-chart-1/10", cyan: "text-chart-2 bg-chart-2/10" };

export function StatCard({ label, value, note, tone }: StatCardProps) {
  return (
    <article className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{note}</span>
      </div>
      <svg className="mt-5 h-10 w-full text-primary/25" viewBox="0 0 200 40" fill="none" aria-hidden="true"><path d="M0 34 C25 30 25 17 50 23 S80 35 100 17 S140 7 160 14 S180 22 200 3" stroke="currentColor" strokeWidth="3" /></svg>
    </article>
  );
}
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin_/program/$id")({ component: QuestionEditor });
type Question = { id: string; text: string; option_a: string; option_b: string; option_c: string; option_d: string; correct_option: string; position: number };

function QuestionEditor() {
  const { id } = Route.useParams();
  const [title, setTitle] = useState("Program");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [form, setForm] = useState({ text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "a" });
  async function load() {
    const [{ data: program }, { data }] = await Promise.all([supabase.from("programs").select("title").eq("id", id).single(), supabase.from("questions").select("*").eq("program_id", id).order("position")]);
    setTitle(program?.title ?? "Program"); setQuestions((data ?? []) as Question[]);
  }
  useEffect(() => { void load(); }, [id]);
  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (Object.values(form).some((v) => !v.trim())) return toast.error("Complete the question and all four options");
    const { error } = await supabase.from("questions").insert({ ...form, program_id: id, position: questions.length + 1 });
    if (error) return toast.error(error.message); setForm({ text: "", option_a: "", option_b: "", option_c: "", option_d: "", correct_option: "a" }); toast.success("Question added"); void load();
  }
  async function remove(questionId: string) { await supabase.from("questions").delete().eq("id", questionId); void load(); }
  return <main className="min-h-screen bg-muted/40 p-6"><div className="mx-auto max-w-4xl"><Link to="/admin" className="text-sm text-muted-foreground">← Back to programs</Link><h1 className="mt-4 text-3xl font-bold">{title}</h1><p className="text-muted-foreground">Add 4-option questions and mark the correct answer.</p>
    <form onSubmit={add} className="my-7 space-y-4 rounded-2xl border bg-card p-6"><input required maxLength={500} className="w-full rounded-lg border bg-background px-4 py-3" placeholder="Question" value={form.text} onChange={(e)=>setForm({...form,text:e.target.value})}/><div className="grid gap-3 sm:grid-cols-2">{(["a","b","c","d"] as const).map((key)=><label key={key} className="flex items-center gap-3 rounded-lg border p-3"><input type="radio" name="correct" checked={form.correct_option===key} onChange={()=>setForm({...form,correct_option:key})}/><input required maxLength={300} className="w-full bg-transparent outline-none" placeholder={`Option ${key.toUpperCase()}`} value={form[`option_${key}`]} onChange={(e)=>setForm({...form,[`option_${key}`]:e.target.value})}/></label>)}</div><Button type="submit">Add question</Button></form>
    <div className="space-y-3">{questions.map((q,i)=><article key={q.id} className="flex items-start justify-between rounded-xl border bg-card p-4"><div><p className="font-semibold">{i+1}. {q.text}</p><p className="mt-1 text-sm text-muted-foreground">Correct: {q.correct_option.toUpperCase()} — {q[`option_${q.correct_option}` as keyof Question]}</p></div><Button variant="ghost" onClick={()=>void remove(q.id)}>Remove</Button></article>)}{questions.length===0&&<p className="py-10 text-center text-muted-foreground">No questions yet.</p>}</div></div></main>;
}
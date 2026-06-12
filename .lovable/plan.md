## Plan: Quiz Competition Programs

### Flow
1. Admin creates a **Program** (quiz) in `/admin` → adds MCQ questions (4 options, 1 correct, per-question time limit in seconds).
2. Admin copies a WhatsApp share link → opens `wa.me/?text=…/quiz/{slug}`.
3. Candidate clicks link → if not signed in, redirected to `/signin` (mobile only) → returns to `/quiz/{slug}`.
4. Questions shown one-by-one in random order; each auto-advances when its countdown hits 0 or user picks an option.
5. One attempt only (locked by `user_id + program_id` unique row).
6. On submit, total score + total elapsed ms stored. Leaderboard ranks by `score DESC, total_ms ASC`.
7. Admin dashboard shows analytics cards (Total Users, Active Programs, Total Attempts) styled to match the uploaded mockup, plus per-program results with rank, name, mobile, score, time.

### New Admin Dashboard (matches mockup)
- Top row: 3 light analytics cards (Total Users, Programs, Attempts) with subtle sparkline + "+N New" delta.
- Tabs: **Dashboard** | **Programs** | **Users**.
- Programs tab: list with status (active/closed), "Add program", per-row actions: Edit questions, Copy WhatsApp link, View results.
- Program editor: title, description, per-question time (default 20s) → list of questions, each with 4 options and "correct" radio.
- Results view: leaderboard table (Rank, Name, Mobile, Panchayath/Ward, Score, Time, Submitted at).

### Candidate quiz page `/quiz/$slug`
- Pre-start screen: program title, number of questions, time per question, "Start" button.
- Start → shuffle question order client-side (seeded by attempt id so refresh keeps order), show one at a time with a circular countdown.
- Auto-advance on timeout (records no answer); manual advance on select.
- On finish: server fn grades, inserts attempt row, returns score + rank.
- If user already attempted → show their result + leaderboard read-only.

### Database (migration)
- `programs` — `id`, `slug` (unique), `title`, `description`, `seconds_per_question` (int, default 20), `is_active` (bool), `created_at`.
- `questions` — `id`, `program_id` (FK CASCADE), `text`, `option_a`, `option_b`, `option_c`, `option_d`, `correct_option` (char a–d), `position` (int), `created_at`.
- `attempts` — `id`, `program_id` (FK), `user_id` (FK), `score` (int), `total_ms` (int), `submitted_at`. Unique `(program_id, user_id)`.
- `attempt_answers` — `id`, `attempt_id` (FK CASCADE), `question_id` (FK), `selected_option` (nullable char a–d), `time_ms` (int).
- All tables: GRANT to anon + authenticated + service_role; RLS enabled with permissive policies (matches current no-auth-check architecture per earlier explicit request).

### Server functions (`src/lib/quiz.functions.ts`)
- `startAttempt({ slug, userId })` → returns program, shuffled questions **without** `correct_option`, and any existing attempt.
- `submitAttempt({ slug, userId, answers: [{questionId, selectedOption, timeMs}] })` → grades server-side, inserts attempt + answers, returns `{ score, totalMs, rank }`.
- `getLeaderboard({ programId })` → joins users for admin results view.

Grading and rank computation happen server-side so the client never sees correct answers.

### Files
**New**
- `src/routes/admin.tsx` — extended (tabs, analytics cards, programs CRUD, results).
- `src/routes/admin.program.$id.tsx` — question editor.
- `src/routes/admin.program.$id.results.tsx` — leaderboard.
- `src/routes/quiz.$slug.tsx` — candidate quiz runner.
- `src/lib/quiz.functions.ts` — server fns above.
- `src/components/admin/StatCard.tsx` — analytics card matching mockup.
- `src/components/quiz/QuestionTimer.tsx` — circular countdown.

**Modified**
- `src/integrations/supabase/types.ts` — regenerated after migration.
- `src/routes/signin.tsx` — accept `?next=/quiz/{slug}` to return after sign-in.

### Open items / assumptions
- WhatsApp share = `https://wa.me/?text=<encoded message + link>` (generic share, not a number-targeted send). If you want it sent from a Twilio number to specific candidates, that's a follow-up using the Twilio connector.
- Per-question timer default **20s**, admin-editable per program. If you'd rather set time per question individually, say so and I'll add it to the schema.
- "One attempt only" enforced by DB unique constraint; refresh during quiz resumes the same attempt (timer continues from where they left). If you want refresh to forfeit, tell me.

### Security note
Same as before: permissive RLS + plain text passwords elsewhere are intentional per your earlier request. Correct answers are kept server-side so candidates can't inspect them in network responses.

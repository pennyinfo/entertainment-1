CREATE TABLE public.programs (id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, slug text NOT NULL UNIQUE, title text NOT NULL, description text, seconds_per_question integer NOT NULL DEFAULT 20, is_active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.programs TO anon, authenticated;
GRANT ALL ON public.programs TO service_role;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all programs" ON public.programs FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.questions (id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE, text text NOT NULL, option_a text NOT NULL, option_b text NOT NULL, option_c text NOT NULL, option_d text NOT NULL, correct_option char(1) NOT NULL CHECK (correct_option IN ('a','b','c','d')), position integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.questions TO anon, authenticated;
GRANT ALL ON public.questions TO service_role;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all questions" ON public.questions FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.attempts (id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, program_id uuid NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE, user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE, score integer NOT NULL DEFAULT 0, total_ms integer NOT NULL DEFAULT 0, submitted_at timestamptz NOT NULL DEFAULT now(), UNIQUE (program_id, user_id));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attempts TO anon, authenticated;
GRANT ALL ON public.attempts TO service_role;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all attempts" ON public.attempts FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE public.attempt_answers (id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY, attempt_id uuid NOT NULL REFERENCES public.attempts(id) ON DELETE CASCADE, question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE, selected_option char(1) CHECK (selected_option IN ('a','b','c','d')), is_correct boolean NOT NULL DEFAULT false, time_ms integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.attempt_answers TO anon, authenticated;
GRANT ALL ON public.attempt_answers TO service_role;
ALTER TABLE public.attempt_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public all attempt answers" ON public.attempt_answers FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.get_quiz_questions(p_slug text)
RETURNS TABLE (question_id uuid, question_text text, option_a text, option_b text, option_c text, option_d text, question_position integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
SELECT q.id, q.text, q.option_a, q.option_b, q.option_c, q.option_d, q.position FROM public.questions q JOIN public.programs p ON p.id = q.program_id WHERE p.slug = p_slug AND p.is_active = true ORDER BY q.position;
$$;
GRANT EXECUTE ON FUNCTION public.get_quiz_questions(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(p_program_id uuid, p_user_id uuid, p_answers jsonb, p_total_ms integer)
RETURNS TABLE (attempt_id uuid, final_score integer, final_total_ms integer, final_rank bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_attempt_id uuid; v_score integer := 0; v_rank bigint; v_answer jsonb; v_qid uuid; v_sel char(1); v_tms integer; v_correct char(1); v_is_correct boolean;
BEGIN
IF EXISTS (SELECT 1 FROM public.attempts WHERE program_id=p_program_id AND user_id=p_user_id) THEN RAISE EXCEPTION 'Already attempted'; END IF;
INSERT INTO public.attempts(program_id,user_id,score,total_ms) VALUES(p_program_id,p_user_id,0,GREATEST(p_total_ms,0)) RETURNING id INTO v_attempt_id;
FOR v_answer IN SELECT * FROM jsonb_array_elements(p_answers) LOOP
v_qid := (v_answer->>'questionId')::uuid; v_sel := NULLIF(v_answer->>'selectedOption',''); v_tms := GREATEST(COALESCE((v_answer->>'timeMs')::int,0),0);
SELECT q.correct_option INTO v_correct FROM public.questions q WHERE q.id=v_qid AND q.program_id=p_program_id;
IF v_correct IS NULL THEN RAISE EXCEPTION 'Invalid question'; END IF;
v_is_correct := (v_sel IS NOT NULL AND v_sel=v_correct); IF v_is_correct THEN v_score:=v_score+1; END IF;
INSERT INTO public.attempt_answers(attempt_id,question_id,selected_option,is_correct,time_ms) VALUES(v_attempt_id,v_qid,v_sel,v_is_correct,v_tms);
END LOOP;
UPDATE public.attempts SET score=v_score WHERE id=v_attempt_id;
SELECT 1+COUNT(*) INTO v_rank FROM public.attempts a WHERE a.program_id=p_program_id AND (a.score>v_score OR (a.score=v_score AND a.total_ms<GREATEST(p_total_ms,0))) AND a.id<>v_attempt_id;
RETURN QUERY SELECT v_attempt_id,v_score,GREATEST(p_total_ms,0),v_rank;
END; $$;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid,uuid,jsonb,integer) TO anon, authenticated;
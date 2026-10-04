ALTER TABLE public.totems
  ADD COLUMN bairro text,
  ADD COLUMN parada text,
  ADD COLUMN status_manual text NOT NULL DEFAULT 'automatico',
  ADD COLUMN last_seen_at timestamptz,
  ADD COLUMN is_demo boolean NOT NULL DEFAULT false,
  ADD CONSTRAINT totems_status_manual_check CHECK (status_manual IN ('automatico','manutencao'));

ALTER TABLE public.feedbacks
  ADD COLUMN is_demo boolean NOT NULL DEFAULT false;

ALTER TABLE public.feedback_categories
  ADD COLUMN cor text NOT NULL DEFAULT '#6B7280';

UPDATE public.feedback_categories SET nome = 'Atraso de Linha', cor = '#1D6A96' WHERE id = 'atraso';
UPDATE public.feedback_categories SET nome = 'Superlotação', cor = '#E8622C' WHERE id = 'superlotacao';
UPDATE public.feedback_categories SET nome = 'Elogios', cor = '#3A9A47' WHERE id = 'elogio';

INSERT INTO public.feedback_categories (id, nome, ordem, cor)
VALUES ('vandalismo', 'Vandalismo/Avaria', 8, '#E03A4E')
ON CONFLICT (id) DO UPDATE SET nome = excluded.nome, ordem = excluded.ordem, cor = excluded.cor;

INSERT INTO public.feedback_messages (category_id, texto, ordem)
VALUES
  ('vandalismo', 'Abrigo da parada com vidro quebrado.', 1),
  ('vandalismo', 'Banco ou assento danificado.', 2),
  ('vandalismo', 'Pichação ou sujeira intensa no ponto.', 3),
  ('vandalismo', 'Painel ou totem danificado.', 4),
  ('vandalismo', 'Iluminação do ponto queimada.', 5)
ON CONFLICT (category_id, texto) DO UPDATE SET ordem = excluded.ordem;

CREATE TABLE public.totem_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  totem_id text NOT NULL REFERENCES public.totems(id),
  started_at timestamptz NOT NULL DEFAULT now(),
  is_demo boolean NOT NULL DEFAULT false
);
GRANT INSERT ON public.totem_sessions TO anon, authenticated;
GRANT ALL ON public.totem_sessions TO service_role;
ALTER TABLE public.totem_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can start valid real sessions"
  ON public.totem_sessions FOR INSERT TO anon, authenticated
  WITH CHECK (
    is_demo = false
    AND EXISTS (SELECT 1 FROM public.totems t WHERE t.id = totem_id AND t.ativo = true)
  );
CREATE INDEX totem_sessions_totem_started_idx ON public.totem_sessions (totem_id, started_at);

CREATE OR REPLACE FUNCTION public.totem_heartbeat(p_totem_id text)
RETURNS void
LANGUAGE sql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.totems SET last_seen_at = now() WHERE id = p_totem_id AND ativo = true;
$$;
REVOKE ALL ON FUNCTION public.totem_heartbeat(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.totem_heartbeat(text) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.dashboard_kpis(p_inicio timestamptz, p_fim timestamptz)
RETURNS TABLE (
  acessos_periodo bigint,
  acessos_periodo_anterior bigint,
  variacao_pct numeric,
  feedbacks_total bigint,
  nota_media numeric,
  totens_online bigint,
  totens_manutencao bigint,
  totens_offline bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH metricas AS (
    SELECT
      (SELECT count(*) FROM public.totem_sessions WHERE started_at >= p_inicio AND started_at < p_fim) AS atual,
      (SELECT count(*) FROM public.totem_sessions WHERE started_at >= p_inicio - (p_fim - p_inicio) AND started_at < p_inicio) AS anterior,
      (SELECT count(*) FROM public.feedbacks WHERE created_at >= p_inicio AND created_at < p_fim) AS feedbacks,
      (SELECT round(avg(nota)::numeric, 1) FROM public.feedbacks WHERE created_at >= p_inicio AND created_at < p_fim) AS media
  ), estados AS (
    SELECT
      count(*) FILTER (WHERE status_manual = 'automatico' AND last_seen_at > now() - interval '3 minutes') AS online,
      count(*) FILTER (WHERE status_manual = 'manutencao') AS manutencao,
      count(*) FILTER (WHERE status_manual = 'automatico' AND (last_seen_at IS NULL OR last_seen_at <= now() - interval '3 minutes')) AS offline
    FROM public.totems WHERE ativo = true
  )
  SELECT m.atual, m.anterior,
    CASE WHEN m.anterior = 0 THEN NULL ELSE round(((m.atual - m.anterior)::numeric / m.anterior) * 100, 1) END,
    m.feedbacks, m.media, e.online, e.manutencao, e.offline
  FROM metricas m CROSS JOIN estados e;
$$;
REVOKE ALL ON FUNCTION public.dashboard_kpis(timestamptz,timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dashboard_kpis(timestamptz,timestamptz) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.dashboard_feedbacks_por_categoria(p_inicio timestamptz, p_fim timestamptz)
RETURNS TABLE (categoria_id text, nome text, cor text, total bigint, percentual numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH contagens AS (
    SELECT c.id, c.nome, c.cor, count(*)::bigint AS total
    FROM public.feedbacks f
    JOIN public.feedback_categories c ON c.id = f.categoria_id
    WHERE f.created_at >= p_inicio AND f.created_at < p_fim
    GROUP BY c.id, c.nome, c.cor
  ), calculado AS (
    SELECT *, round(total::numeric * 100 / sum(total) OVER (), 2) AS pct,
      row_number() OVER (ORDER BY total DESC, id) AS pos
    FROM contagens WHERE total > 0
  ), ajuste AS (
    SELECT 100 - sum(pct) AS diferenca FROM calculado
  )
  SELECT c.id, c.nome, c.cor, c.total,
    c.pct + CASE WHEN c.pos = 1 THEN a.diferenca ELSE 0 END
  FROM calculado c CROSS JOIN ajuste a
  ORDER BY c.total DESC, c.id;
$$;
REVOKE ALL ON FUNCTION public.dashboard_feedbacks_por_categoria(timestamptz,timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dashboard_feedbacks_por_categoria(timestamptz,timestamptz) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.dashboard_totens_reclamacoes(p_inicio timestamptz, p_fim timestamptz, p_limite int DEFAULT 5)
RETURNS TABLE (totem_id text, totem_nome text, total bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.nome, count(*)::bigint
  FROM public.feedbacks f
  JOIN public.totems t ON t.id = f.totem_id
  WHERE f.created_at >= p_inicio AND f.created_at < p_fim AND f.categoria_id <> 'elogio'
  GROUP BY t.id, t.nome
  ORDER BY count(*) DESC, t.nome
  LIMIT LEAST(GREATEST(p_limite, 0), 1000);
$$;
REVOKE ALL ON FUNCTION public.dashboard_totens_reclamacoes(timestamptz,timestamptz,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dashboard_totens_reclamacoes(timestamptz,timestamptz,int) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.dashboard_recomendacao(p_inicio timestamptz, p_fim timestamptz)
RETURNS TABLE (
  linha_codigo text,
  linha_nome text,
  categoria_id text,
  categoria_nome text,
  hora_inicio int,
  total bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.linha_codigo, l.nome, f.categoria_id, c.nome,
    extract(hour from f.created_at AT TIME ZONE 'America/Sao_Paulo')::int AS hora_inicio,
    count(*)::bigint AS total
  FROM public.feedbacks f
  JOIN public.bus_lines l ON l.codigo = f.linha_codigo
  JOIN public.feedback_categories c ON c.id = f.categoria_id
  WHERE f.created_at >= p_inicio AND f.created_at < p_fim
    AND f.categoria_id IN ('superlotacao','atraso')
    AND f.linha_codigo IS NOT NULL
  GROUP BY f.linha_codigo, l.nome, f.categoria_id, c.nome,
    extract(hour from f.created_at AT TIME ZONE 'America/Sao_Paulo')
  HAVING count(*) >= 3
  ORDER BY total DESC, f.linha_codigo, f.categoria_id, hora_inicio
  LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.dashboard_recomendacao(timestamptz,timestamptz) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dashboard_recomendacao(timestamptz,timestamptz) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.ultimos_feedbacks(p_inicio timestamptz, p_fim timestamptz, p_limite int DEFAULT 20, p_offset int DEFAULT 0)
RETURNS TABLE (
  created_at timestamptz,
  nota smallint,
  mensagem text,
  categoria_id text,
  categoria_nome text,
  categoria_cor text,
  totem_nome text,
  totem_bairro text,
  linha_codigo text,
  linha_nome text,
  dia_semana text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT f.created_at, f.nota, f.mensagem, f.categoria_id, c.nome, c.cor,
    t.nome, t.bairro, f.linha_codigo, l.nome, f.dia_semana
  FROM public.feedbacks f
  JOIN public.feedback_categories c ON c.id = f.categoria_id
  JOIN public.totems t ON t.id = f.totem_id
  LEFT JOIN public.bus_lines l ON l.codigo = f.linha_codigo
  WHERE f.created_at >= p_inicio AND f.created_at < p_fim
  ORDER BY f.created_at DESC
  LIMIT LEAST(GREATEST(p_limite, 0), 1000)
  OFFSET GREATEST(p_offset, 0);
$$;
REVOKE ALL ON FUNCTION public.ultimos_feedbacks(timestamptz,timestamptz,int,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ultimos_feedbacks(timestamptz,timestamptz,int,int) TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION public.painel_totens()
RETURNS TABLE (id text, nome text, bairro text, lat double precision, lng double precision, status text, last_seen_at timestamptz)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT t.id, t.nome, t.bairro, t.lat, t.lng,
    CASE
      WHEN t.status_manual = 'manutencao' THEN 'manutencao'
      WHEN t.last_seen_at > now() - interval '3 minutes' THEN 'online'
      ELSE 'offline'
    END,
    t.last_seen_at
  FROM public.totems t
  WHERE t.ativo = true
  ORDER BY t.nome;
$$;
REVOKE ALL ON FUNCTION public.painel_totens() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.painel_totens() TO anon, authenticated, service_role;
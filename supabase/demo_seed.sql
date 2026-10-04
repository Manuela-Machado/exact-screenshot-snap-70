-- Dados de demonstração do painel OnTime.
-- Execute manualmente no SQL Editor do Supabase. Este arquivo não faz parte das migrations.

BEGIN;

DELETE FROM public.feedbacks WHERE is_demo = true;
DELETE FROM public.totem_sessions WHERE is_demo = true;
DELETE FROM public.totems WHERE is_demo = true;

INSERT INTO public.totems
  (id, nome, endereco, bairro, parada, lat, lng, ativo, status_manual, last_seen_at, is_demo)
VALUES
  ('demo-parada-72', 'Parada 72 – Morada do Vale I', 'Av. Alexandrino de Alencar, Gravataí, RS', 'Morada do Vale I', 'Parada 72', -29.9249, -50.9918, true, 'automatico', now() - interval '1 minute', true),
  ('demo-terminal-centro', 'Terminal Centro', 'Centro, Gravataí, RS', 'Centro', 'Terminal Centro', -29.9447, -50.9916, true, 'automatico', now() - interval '1 minute', true),
  ('demo-parque-anjos', 'Parque dos Anjos', 'Parque dos Anjos, Gravataí, RS', 'Parque dos Anjos', 'Parada Parque dos Anjos', -29.9131, -50.9821, true, 'automatico', now() - interval '2 minutes', true),
  ('demo-salgado-filho', 'Av. Salgado Filho', 'Av. Salgado Filho, Gravataí, RS', 'São Vicente', 'Parada Av. Salgado Filho', -29.9383, -50.9995, true, 'automatico', now() - interval '1 minute', true),
  ('demo-rs020', 'RS-020 São Jerônimo', 'RS-020, Gravataí, RS', 'São Jerônimo', 'Parada RS-020', -29.9014, -50.9648, true, 'automatico', now() - interval '2 minutes', true),
  ('demo-morungava', 'Morungava', 'Morungava, Gravataí, RS', 'Morungava', 'Parada Morungava', -29.8507, -50.9162, true, 'automatico', now() - interval '1 minute', true),
  ('demo-costa-ipiranga', 'Costa do Ipiranga', 'Costa do Ipiranga, Gravataí, RS', 'Costa do Ipiranga', 'Parada Costa do Ipiranga', -29.8736, -50.9589, true, 'manutencao', now() - interval '10 minutes', true),
  ('demo-parada-59', 'Parada 59', 'Morada do Vale, Gravataí, RS', 'Morada do Vale II', 'Parada 59', -29.9202, -50.9793, true, 'manutencao', now() - interval '10 minutes', true),
  ('demo-distrito-industrial', 'Distrito Industrial', 'Distrito Industrial, Gravataí, RS', 'Distrito Industrial', 'Parada Distrito Industrial', -29.9652, -51.0412, true, 'automatico', now() - interval '30 minutes', true);

WITH demo_totens AS (
  SELECT id, row_number() OVER (ORDER BY id) AS n FROM public.totems WHERE is_demo = true
), gerados AS (
  SELECT g,
    CASE WHEN g <= 43 THEN 'atraso' WHEN g <= 78 THEN 'superlotacao' WHEN g <= 101 THEN 'elogio' ELSE 'vandalismo' END AS categoria_id,
    CASE WHEN g <= 22 THEN 5 ELSE 4 END::smallint AS nota
  FROM generate_series(1, 112) g
), preparados AS (
  SELECT g.*, t.id AS totem_id,
    CASE WHEN g.categoria_id = 'superlotacao' THEN 'MV2' ELSE (ARRAY['CI','MA1','MG1','MG2','MV1','MV2','P107','S4','T2','TP'])[((g.g - 1) % 10) + 1] END AS linha_codigo,
    CASE g.categoria_id
      WHEN 'atraso' THEN 'Ônibus atrasou mais de 15 minutos'
      WHEN 'superlotacao' THEN 'Ônibus muito cheio'
      WHEN 'elogio' THEN 'Chegou no horário'
      ELSE 'Painel ou totem danificado.'
    END AS mensagem
  FROM gerados g JOIN demo_totens t ON t.n = ((g.g - 1) % 9) + 1
)
INSERT INTO public.feedbacks
  (created_at, totem_id, nota, categoria_id, linha_codigo, dia_semana, horario, mensagem, is_demo)
SELECT
  date_trunc('day', now()) - ((g - 1) % 7) * interval '1 day'
    + CASE WHEN categoria_id = 'superlotacao' THEN interval '18 hours' ELSE (((g * 7) % 15) + 6) * interval '1 hour' END,
  totem_id, nota, categoria_id, linha_codigo,
  (ARRAY['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'])[((g - 1) % 7) + 1],
  CASE WHEN categoria_id = 'superlotacao' THEN time '18:00' ELSE make_time(((g * 7) % 15) + 6, 0, 0) END,
  mensagem, true
FROM preparados;

WITH demo_totens AS (
  SELECT id, row_number() OVER (ORDER BY id) AS n FROM public.totems WHERE is_demo = true
)
INSERT INTO public.totem_sessions (totem_id, started_at, is_demo)
SELECT t.id,
  now() - ((g - 1) % 7) * interval '1 day' - ((g * 13) % 1440) * interval '1 minute',
  true
FROM generate_series(1, 1240) g
JOIN demo_totens t ON t.n = ((g - 1) % 9) + 1;

COMMIT;

-- Para apagar os dados de demonstração:
-- DELETE FROM public.feedbacks WHERE is_demo = true; DELETE FROM public.totem_sessions WHERE is_demo = true; DELETE FROM public.totems WHERE is_demo = true;
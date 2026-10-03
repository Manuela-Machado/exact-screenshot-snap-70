CREATE TABLE public.bus_lines (
  codigo text PRIMARY KEY,
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.bus_lines TO anon, authenticated;
GRANT ALL ON public.bus_lines TO service_role;
ALTER TABLE public.bus_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active bus lines" ON public.bus_lines FOR SELECT TO anon, authenticated USING (ativo = true);

CREATE TABLE public.bus_schedules (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  linha_codigo text NOT NULL REFERENCES public.bus_lines(codigo) ON UPDATE CASCADE ON DELETE CASCADE,
  sentido_origem text NOT NULL,
  dia_tipo text NOT NULL CHECK (dia_tipo IN ('Dia útil','Sábado','Domingo')),
  plano_operacional text NOT NULL,
  horario time NOT NULL,
  variante_num integer NOT NULL,
  variante_itinerario text NOT NULL,
  UNIQUE (linha_codigo, sentido_origem, dia_tipo, plano_operacional, horario, variante_num)
);
GRANT SELECT ON public.bus_schedules TO anon, authenticated;
GRANT ALL ON public.bus_schedules TO service_role;
GRANT ALL ON SEQUENCE public.bus_schedules_id_seq TO service_role;
CREATE INDEX bus_schedules_line_day_time_idx ON public.bus_schedules (linha_codigo, dia_tipo, horario);
CREATE INDEX bus_schedules_day_time_idx ON public.bus_schedules (dia_tipo, horario);
ALTER TABLE public.bus_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read schedules for active lines" ON public.bus_schedules FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.bus_lines l WHERE l.codigo = linha_codigo AND l.ativo = true));

CREATE TABLE public.totems (
  id text PRIMARY KEY,
  nome text NOT NULL,
  endereco text NOT NULL,
  lat double precision NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng double precision NOT NULL CHECK (lng BETWEEN -180 AND 180),
  ativo boolean NOT NULL DEFAULT true
);
GRANT SELECT ON public.totems TO anon, authenticated;
GRANT ALL ON public.totems TO service_role;
ALTER TABLE public.totems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active totems" ON public.totems FOR SELECT TO anon, authenticated USING (ativo = true);

CREATE TABLE public.fare_groups (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL,
  ordem integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.fare_groups TO anon, authenticated;
GRANT ALL ON public.fare_groups TO service_role;
GRANT ALL ON SEQUENCE public.fare_groups_id_seq TO service_role;
ALTER TABLE public.fare_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read fare groups" ON public.fare_groups FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.fares (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  group_id bigint NOT NULL REFERENCES public.fare_groups(id) ON DELETE CASCADE,
  descricao text NOT NULL,
  valor numeric(6,2) NOT NULL CHECK (valor >= 0),
  ordem integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.fares TO anon, authenticated;
GRANT ALL ON public.fares TO service_role;
GRANT ALL ON SEQUENCE public.fares_id_seq TO service_role;
CREATE INDEX fares_group_order_idx ON public.fares (group_id, ordem);
ALTER TABLE public.fares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read fares" ON public.fares FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.app_settings (
  chave text PRIMARY KEY,
  valor text NOT NULL
);
GRANT SELECT ON public.app_settings TO anon, authenticated;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read app settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.notices (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  texto text NOT NULL,
  fonte text,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.notices TO anon, authenticated;
GRANT ALL ON public.notices TO service_role;
GRANT ALL ON SEQUENCE public.notices_id_seq TO service_role;
CREATE INDEX notices_active_created_idx ON public.notices (ativo, created_at DESC);
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active notices" ON public.notices FOR SELECT TO anon, authenticated USING (ativo = true);

CREATE TABLE public.feedback_categories (
  id text PRIMARY KEY,
  nome text NOT NULL,
  ordem integer NOT NULL DEFAULT 0
);
GRANT SELECT ON public.feedback_categories TO anon, authenticated;
GRANT ALL ON public.feedback_categories TO service_role;
ALTER TABLE public.feedback_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read feedback categories" ON public.feedback_categories FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.feedback_messages (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  category_id text NOT NULL REFERENCES public.feedback_categories(id) ON DELETE CASCADE,
  texto text NOT NULL,
  ordem integer NOT NULL DEFAULT 0,
  UNIQUE (category_id, texto)
);
GRANT SELECT ON public.feedback_messages TO anon, authenticated;
GRANT ALL ON public.feedback_messages TO service_role;
GRANT ALL ON SEQUENCE public.feedback_messages_id_seq TO service_role;
CREATE INDEX feedback_messages_category_order_idx ON public.feedback_messages (category_id, ordem);
ALTER TABLE public.feedback_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read feedback messages" ON public.feedback_messages FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  totem_id text NOT NULL DEFAULT 'gravatai-parada-1' REFERENCES public.totems(id),
  nota smallint NOT NULL CHECK (nota BETWEEN 1 AND 5),
  categoria_id text NOT NULL REFERENCES public.feedback_categories(id),
  linha_codigo text REFERENCES public.bus_lines(codigo),
  dia_semana text CHECK (dia_semana IS NULL OR dia_semana IN ('Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo')),
  horario time,
  mensagem text NOT NULL CHECK (char_length(mensagem) BETWEEN 1 AND 200)
);
GRANT INSERT ON public.feedbacks TO anon, authenticated;
GRANT ALL ON public.feedbacks TO service_role;
CREATE INDEX feedbacks_created_idx ON public.feedbacks (created_at DESC);
CREATE INDEX feedbacks_category_idx ON public.feedbacks (categoria_id);
CREATE INDEX feedbacks_line_idx ON public.feedbacks (linha_codigo);
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can submit valid feedback" ON public.feedbacks FOR INSERT TO anon, authenticated WITH CHECK (
  nota BETWEEN 1 AND 5
  AND char_length(mensagem) BETWEEN 1 AND 200
  AND (dia_semana IS NULL OR dia_semana IN ('Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'))
);

CREATE TABLE public.geocode_cache (
  query text PRIMARY KEY,
  display_name text,
  lat double precision NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng double precision NOT NULL CHECK (lng BETWEEN -180 AND 180),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.geocode_cache TO anon, authenticated;
GRANT ALL ON public.geocode_cache TO service_role;
ALTER TABLE public.geocode_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read geocode cache" ON public.geocode_cache FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can add valid geocode cache entries" ON public.geocode_cache FOR INSERT TO anon, authenticated WITH CHECK (query = lower(trim(query)) AND char_length(query) BETWEEN 1 AND 240 AND lat BETWEEN -90 AND 90 AND lng BETWEEN -180 AND 180);

CREATE TABLE public.route_cache (
  cache_key text PRIMARY KEY,
  geometry jsonb NOT NULL CHECK (geometry ->> 'type' = 'LineString'),
  duration_s integer NOT NULL CHECK (duration_s >= 0),
  distance_m integer NOT NULL CHECK (distance_m >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.route_cache TO anon, authenticated;
GRANT ALL ON public.route_cache TO service_role;
ALTER TABLE public.route_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read route cache" ON public.route_cache FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public can add valid route cache entries" ON public.route_cache FOR INSERT TO anon, authenticated WITH CHECK (char_length(cache_key) BETWEEN 1 AND 160 AND duration_s >= 0 AND distance_m >= 0 AND geometry ->> 'type' = 'LineString');

CREATE TABLE public.search_logs (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now(),
  totem_id text NOT NULL DEFAULT 'gravatai-parada-1' REFERENCES public.totems(id),
  tipo text NOT NULL CHECK (tipo IN ('linha','destino')),
  termo text CHECK (termo IS NULL OR char_length(termo) <= 120),
  linha_codigo text REFERENCES public.bus_lines(codigo),
  resultados integer CHECK (resultados IS NULL OR resultados >= 0)
);
GRANT INSERT ON public.search_logs TO anon, authenticated;
GRANT ALL ON public.search_logs TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.search_logs_id_seq TO anon, authenticated;
GRANT ALL ON SEQUENCE public.search_logs_id_seq TO service_role;
CREATE INDEX search_logs_created_idx ON public.search_logs (created_at DESC);
CREATE INDEX search_logs_type_idx ON public.search_logs (tipo);
ALTER TABLE public.search_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can add anonymous search logs" ON public.search_logs FOR INSERT TO anon, authenticated WITH CHECK (tipo IN ('linha','destino') AND (termo IS NULL OR char_length(termo) <= 120) AND (resultados IS NULL OR resultados >= 0));
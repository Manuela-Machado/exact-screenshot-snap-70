REVOKE EXECUTE ON FUNCTION public.totem_heartbeat(text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.dashboard_kpis(timestamptz,timestamptz) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.dashboard_feedbacks_por_categoria(timestamptz,timestamptz) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.dashboard_totens_reclamacoes(timestamptz,timestamptz,int) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.dashboard_recomendacao(timestamptz,timestamptz) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.ultimos_feedbacks(timestamptz,timestamptz,int,int) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.painel_totens() FROM authenticated;
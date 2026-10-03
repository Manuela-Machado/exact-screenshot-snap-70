# Plano: banco completo do OnTime

## Resultado
O totem continuará visualmente idêntico, mas passará a ler e registrar dados no Supabase. Se o banco ou a internet falhar, horários, tarifas, avisos, localização e opções de feedback continuarão disponíveis pelos dados locais atuais.

## Banco e dados iniciais
- Criar as 10 tabelas solicitadas: linhas, horários, totens, grupos de tarifas, tarifas, configurações, avisos, categorias/mensagens de feedback, feedbacks, caches de geocodificação/rotas e registros de busca.
- Aplicar chaves, relacionamentos, validações, índices, permissões explícitas e RLS em todas as tabelas.
- Permitir leitura pública apenas dos catálogos; feedbacks e registros de busca poderão ser enviados, mas nunca listados, alterados ou apagados pelo público.
- Importar uma única vez as 19 linhas e os 696 horários do CSV, preservando registros que diferem pelo plano operacional.
- Inserir exatamente a localização, tarifas, aviso e opções de feedback já existentes no aplicativo, sem inventar conteúdo.

## Integração do totem
- Criar uma camada de dados com cache temporário que carregue linhas/horários, tarifas/avisos, localização e feedback do Supabase.
- Manter o CSV e as constantes atuais como fallback automático e tentar atualizar novamente em segundo plano.
- Consultar primeiro o cache compartilhado de geocodificação e rotas; gravar apenas resultados externos válidos e preservar o cache local como fallback.
- Registrar buscas concluídas silenciosamente, sem dados pessoais e sem bloquear a experiência em caso de falha.
- Enviar feedback real ao banco; só mostrar agradecimento após sucesso e preservar o formulário preenchido se houver erro.

## Validação
- Confirmar 19 linhas, 696 horários e a distribuição: 451 em dia útil, 156 no sábado e 89 no domingo.
- Verificar que todas as tabelas têm RLS e que um visitante não consegue listar feedbacks nem registros privados.
- Testar o fluxo completo do totem, incluindo fallback offline, cache reutilizado e envio de feedback.
- Rodar a verificação de segurança e corrigir problemas relacionados a esta implementação.
- Confirmar por comparação visual que layout, anúncios e comportamento visível não mudaram.

## Detalhes técnicos
- Alterações de estrutura serão feitas por migration; a carga inicial será idempotente e executada em lotes, sem duplicação.
- O aplicativo usará o cliente público do Supabase; nenhuma chave administrativa será enviada ao navegador.
- Os tipos TypeScript gerados pelo Supabase serão usados após a migration.
- Para a mensagem de falha do feedback, será mantido o telefone já exibido no totem: **(51) 3484-8000**.

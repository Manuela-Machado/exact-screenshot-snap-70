# OnTime — Totem Urbano Vertical (Gravataí)

Totem interativo de parada de ônibus, em tela vertical (estilo kiosk), com cor principal azul e linguagem simples para o passageiro.

## Estrutura da tela

```text
+-----------------------------+
|                             |
|   ÁREA INTERATIVA (2/3)     |
|   telas e abas do totem     |
|                             |
+-----------------------------+
|   FAIXA DE ANÚNCIOS (1/3)   |
|   mídia rotativa contínua   |
+-----------------------------+
```

A faixa de anúncios fica sempre visível e troca as peças automaticamente, com exemplos de utilidade pública por enquanto.

## Telas

**Tela inicial** — saudação, relógio/data, as 4 instruções de uso numeradas e um botão grande "Iniciar".

**Menu** — três botões grandes: "Onde está meu ônibus?", "Alterações e tarifas", "Feedback". Botão de voltar sempre presente e retorno automático à tela inicial após inatividade.

**Onde está meu ônibus?**
- Busca por nome da linha ou por destino/endereço, com teclado na tela.
- Lista completa das linhas para filtragem rápida.
- Ao escolher uma linha: mapa Mapbox centrado em Gravataí com o traçado da linha, a parada atual e a posição do ônibus, além do tempo estimado de chegada.
- Até a fonte de dados real ser conectada, as posições vêm de dados de demonstração claramente marcados como estimativa; a tela já é montada para receber os dados reais sem redesenho.

**Alterações e tarifas**
- Tarifa municipal R$ 8,50 em destaque.
- Tabelas: Linhas Comuns, Linhas Executivas e Transversais Metropolitanas (R$ 9,35), com todos os valores enviados.
- Bloco de avisos de alterações de itinerário/frequência, com a referência à SOGIL.

**Feedback**
- Avaliação por estrelas de 1 a 5.
- Seleções (sem digitação): Categoria (Elogio, Superlotação, Atraso, etc.), Linha, Dia da semana, Horário e a mensagem de feedback pronta.
- Linha, Dia da semana e Horário incluem "Nenhum(a)/Não sei".
- Tela de agradecimento ao final. O envio fica pronto para ser ligado a um banco de dados depois.
- Rodapé de suporte: (51) 3484-8000 e sac@sogil.com.br.

## Detalhes técnicos

- Rota única `/` com máquina de estados de telas; componentes separados por aba.
- Mapbox GL JS carregado apenas no navegador (import dinâmico após a hidratação) para não quebrar a renderização no servidor.
- A chave `pk.` do Mapbox é publicável e vai no código; recomenda-se restringi-la ao domínio do app no painel da Mapbox.
- Linhas, tarifas, avisos e peças de anúncio ficam em arquivos de dados isolados, fáceis de substituir pelos arquivos reais.
- Camada de acesso a dados dos ônibus isolada atrás de uma única função, para trocar demonstração por fonte real em um lugar só.
- Tokens de cor azul definidos no design system; layout ancorado em proporção vertical de totem.

## Pendências suas

- Arquivo com a lista real de linhas e horários (uso exemplos de Gravataí até chegar).
- Link/API da fonte de posição dos ônibus em tempo real.
- Banco de dados para guardar os feedbacks (posso ativar quando quiser).

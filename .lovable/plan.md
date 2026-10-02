# Ajustes do totem OnTime (pacote completo)

## O que fica igual
- A tela inicial, o cabeçalho azul (logo, relógio, data), as cores, as fontes e os cantos arredondados.
- A faixa de anúncios embaixo (conteúdo, carrossel, posição e proporção). A divisão atual (3/4 interface, 1/4 anúncios, como você pediu antes) não muda. Seu documento fala em 2/3 e 1/3, mas também diz que a divisão não deve ser alterada, então mantenho a atual.

## 1. "O que você precisa?"
- Card principal "Onde está meu ônibus?" com largura total e cerca de 45% da altura. Embaixo, "Alterações e tarifas" e "Feedback" lado a lado.
- Ícone dentro de um quadrado azul-claro, acima do título, tudo centralizado. Nenhum texto extra.
- Botão de início (casinha) maior, no canto superior direito.

## 2. Tamanhos nas três abas
- Tudo cabe sem rolagem e preenche o espaço disponível. Margens laterais menores (cerca de 16 px).
- Tamanhos mínimos: texto 20 px, seções 28 px, títulos 36 px, botões 64 px de altura, abas 60 px de altura com texto de 18 px.

## 3. Localização fixa do totem
- Novo arquivo de configuração com nome, endereço e coordenadas de "Rua Coronel Sarmento, 1555 – Parada 1, Gravataí, RS", buscadas no Nominatim/Photon. Se o número exato não for encontrado, uso o ponto mais próximo da rua e deixo um comentário para você confirmar.
- Todas as distâncias e tempos são calculados a partir desse ponto. No mapa aparece o marcador "Você está aqui".

## 4. Dados dos ônibus
- O CSV completo vai para o projeto e é lido inteiro (19 linhas, todos os horários e variantes), com filtro pelo dia de hoje.
- O horário do CSV é sempre tratado como **saída da origem**, nunca como chegada no totem.

## 5. "Onde está meu ônibus?"
- A grade de linhas da direita sai.
- Seletor grande no topo com dois modos:
  - **Escolher a linha:** lista própria para toque (itens de 64 px, com busca) mostrando "CÓDIGO – Nome".
  - **Buscar o destino:** campo com teclado na tela maior, com números 0–9, Ç, Espaço, Apagar e Limpar. Mostra até 5 sugestões de endereços de Gravataí (espera de 500 ms entre buscas, mensagem amigável em caso de erro).
- **Sugestão de linhas para um destino:** os bairros do itinerário são localizados (com cache e intervalo de 1 s entre buscas). Só entram linhas que funcionam hoje e passam a até ~800 m do destino. As opções são ordenadas por espera mais caminhada (80 m/min). Mostro até 3 cards ("Melhor opção", "Chega aqui em ~X min", "Desça em", "Depois caminhe ~Y m"). Se nenhuma linha servir, aparece uma mensagem clara.
- **Resultado de uma linha:** card "Chega nesta parada em ~X min", 4 próximas saídas com a origem (ou "Amanhã"), escolha do sentido quando houver mais de um, aviso "Posição estimada (simulação)" e botão "Trocar linha" maior.
- **Estimativa de chegada:** saída + tempo de trajeto da origem até o totem pelas ruas × 1,3. Do Centro, entre 3 e 10 min. Sempre a próxima saída viável, mostrada como "~X min" ou "1h12". Atualização a cada 30 s.

## 6. Mapa
- Trajeto por ruas reais (OSRM), com cache. Se o serviço falhar, aparece um aviso discreto e nunca uma linha reta.
- Rota azul (espessura 6), início e fim marcados, totem destacado, destino e ponto de descida em outra cor, e ônibus simulado sobre a rota.
- O mapa ocupa todo o espaço restante, enquadra tudo automaticamente e tem botões de zoom grandes.

## 7. Alterações e tarifas
- Mesmo conteúdo e valores. Card azul da tarifa municipal em largura total, com o valor em 64 px ou mais. Os três grupos preenchem a altura com linhas de 20 px. O aviso fica no final, com texto de 18 px ou mais.

## 8. Feedback
- Estrelas de 72 px. Campos de 64 px com listas próprias para toque (sem lista nativa). "Não sei / Nenhuma" em Linha, Dia e Horário.
- Tipos: Elogio, Atraso, Superlotação, Limpeza, Segurança, Acessibilidade e Outro, cada um com mensagens prontas.
- Botão de envio de 72 px, contatos da SOGIL maiores, agradecimento grande e volta automática ao início após alguns segundos.

## 9. Comportamento geral
- Depois de 60 s sem toque, o totem volta ao início e limpa buscas e seleções. Nada depende de passar o mouse.

## Detalhes técnicos
- `src/config/totem.ts` (TOTEM_LOCATION). Os dados ficam em `src/data/*.csv`, carregados com PapaParse via `?raw` (BOM removido).
- `src/lib/geo.ts`: Photon/Nominatim com viewbox de Gravataí, cache no localStorage, fila de 1 req/s e distância haversine. `src/lib/routing.ts`: OSRM com cache.
- `src/lib/buses.ts` é reescrito para chegada = saída + duração OSRM × 1,3 até o totem. Os pontos da rota são extraídos de `variante_itinerario`.
- Novo componente `TouchSelect` (modal com busca), reutilizado na seleção de linha e no Feedback.
- O mapa continua com Mapbox GL, carregado só no navegador.
- A validação é feita com Playwright em 1440×2304 e na prévia reduzida, sem rolagem nem cortes, e com a faixa de anúncios intacta.

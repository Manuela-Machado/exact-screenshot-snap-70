# Correção definitiva de encaixe do totem

## Diagnóstico confirmado
A tela mantém a proporção 5:8, porém o conteúdo interno usa textos, botões e espaçamentos com tamanhos fixos. Quando a pré-visualização reduz o totem para cerca de 370 px de largura, esses elementos continuam grandes, causando sobreposição e cortes. Isso foi reproduzido na tela inicial, menu, busca de ônibus, mapa e tarifas; o formulário de Feedback segue o mesmo padrão de dimensões fixas.

## Implementação

1. **Escalar o totem como uma peça única**
   - Construir a interface sobre uma área lógica fixa de `1440 × 2304 px`.
   - Redimensionar essa área inteira proporcionalmente para caber em qualquer pré-visualização, sem reorganizar ou esmagar elementos individualmente.
   - Manter, no equipamento real de 1440 × 2304, a escala nativa e a divisão exata de 3/4 para interação e 1/4 para anúncios.

2. **Tela inicial**
   - Reequilibrar título, quatro instruções e botão para ocuparem confortavelmente a área disponível.
   - Garantir altura de linha e espaço mínimo entre textos, números e botão.
   - Exibir a tela inteira e o anúncio simultaneamente, sem cortes ou sobreposição.

3. **Menu principal**
   - Manter o estilo minimalista, com três opções completas e bem separadas.
   - Fixar dimensões internas estáveis para impedir que ícones ou textos invadam outras opções.

4. **Navegação das abas**
   - Organizar “Voltar” e as três abas em uma linha estável, com largura suficiente para todos os nomes.
   - Impedir cortes laterais e mudanças de altura causadas pela quebra dos textos.

5. **Onde está meu ônibus?**
   - Exibir seleção, campo de busca, teclado e lista de linhas simultaneamente no estado de busca.
   - Exibir cabeçalho da linha, previsão, próximos horários e mapa completo simultaneamente no estado de acompanhamento.
   - Manter o anúncio sempre abaixo, sem cobrir o conteúdo.

6. **Alterações e tarifas**
   - Exibir tarifa municipal, grupos metropolitanos/intermunicipais, transversais e aviso na mesma tela.
   - Preservar a identificação explícita das linhas comuns e executivas metropolitanas.

7. **Feedback**
   - Reorganizar avaliação, seletores, envio e contatos em uma composição compacta de duas colunas.
   - Fazer o formulário completo aparecer de uma vez, sem rolagem interna.

8. **Validação**
   - Conferir todos os estados no tamanho real `1440 × 2304` e na pré-visualização atual reduzida.
   - Medir cortes, sobreposições e estouros em cada tela.
   - Confirmar que nenhuma parte interativa invade o quarto reservado aos anúncios e que não há erros no projeto.

## Detalhes técnicos
- A escala será calculada pela menor razão entre largura e altura disponíveis, preservando a tela lógica inteira sem deformação.
- O conteúdo manterá dimensões previsíveis em pixels lógicos; somente o conjunto completo será escalado.
- A simulação dos ônibus, dados, tarifas e comportamento permanecerão inalterados.

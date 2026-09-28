# Ajuste do totem OnTime para 1440 × 2304 px

## Objetivo
Reorganizar o totem no formato vertical solicitado, mantendo a área interativa inteira visível nos 3/4 superiores e os anúncios permanentemente nos 1/4 inferiores.

## Alterações

1. **Proporção e divisão da tela**
   - Fixar a composição do totem na proporção `1440 × 2304` (5:8), adaptando-a proporcionalmente quando a pré-visualização for menor.
   - Reservar exatamente 75% da altura para cabeçalho e conteúdo interativo.
   - Reservar exatamente 25% da altura para os anúncios, sem que o conteúdo superior os empurre para fora da tela.

2. **Primeira tela**
   - Compactar cabeçalho, título, instruções e botão “Iniciar” para que todos apareçam simultaneamente acima dos anúncios.
   - Corrigir alturas de linha, espaçamentos e limites dos blocos para impedir sobreposição de textos.
   - Manter os quatro passos legíveis, com hierarquia clara e áreas de toque adequadas.

3. **Tela “O que você precisa?”**
   - Aplicar um visual mais minimalista: menos volume, sombras discretas, contornos leves e ícones menores.
   - Preservar as três opções atuais e torná-las fáceis de identificar e tocar, sem grandes blocos visuais pesados.

4. **Tela “Onde está meu ônibus?”**
   - Reorganizar seleção, busca, teclado, resultados, informações da linha e mapa para caberem integralmente na área interativa.
   - Reduzir espaços e dimensões excessivas sem comprometer a leitura no totem.
   - Garantir que o mapa receba uma altura estável e seja recalculado corretamente ao aparecer, evitando o aviso atual de enquadramento.
   - Manter os anúncios visíveis no quarto inferior em todos os estados dessa aba.

5. **Tela “Alterações e tarifas”**
   - Alterar o título do grupo para **“Linhas Executivas Metropolitanas (Intermunicipais)”**.
   - Manter **“Linhas Comuns Metropolitanas (Intermunicipais)”** igualmente explícito para deixar clara a classificação das duas categorias.
   - Ajustar a densidade da lista para funcionar dentro da nova área disponível, mantendo rolagem apenas quando necessária.

6. **Validação visual**
   - Conferir a tela inicial, menu, busca sem linha selecionada, linha selecionada com mapa e tarifas na proporção 1440 × 2304.
   - Verificar que não há textos sobrepostos, conteúdo cortado ou anúncios ocultos.
   - Confirmar que o projeto continua sem erros após os ajustes.

## Detalhes técnicos
- A moldura principal usará a proporção 5:8 e limites responsivos para preservar o formato em diferentes tamanhos de pré-visualização.
- A divisão vertical será baseada em faixas estáveis de 3fr/1fr, com `min-height: 0` nas áreas internas para impedir estouro.
- As mudanças serão somente visuais e textuais; a simulação dos ônibus, os dados das linhas e o funcionamento sem banco de dados permanecerão iguais.

# Matriz de conteúdo — Bloco 6

Esta matriz consolida o primeiro recorte pedagógico jogável do LBRLibras. Ela transforma os módulos definidos na pesquisa e no protótipo original em 16 atividades persistidas no SQLite e consumidas dinamicamente pelo frontend.

## Escopo dos módulos

| Ordem | Módulo | Recorte da aula | Questões | Pré-requisito | Recompensa de conclusão |
| ---: | --- | --- | ---: | --- | ---: |
| 1 | Cumprimentos | Olá, bom dia, boa tarde e tchau | 4 | Nenhum | 250 XP |
| 3 | Alfabeto A–F | Primeiras seis letras do alfabeto manual | 6 | Cumprimentos | 300 XP |
| 5 | Números | Números de zero a cinco | 6 | Alfabeto A–F | 300 XP |

Os tópicos Expressões e Soletração continuam no catálogo como expansões planejadas, mas não fazem parte do recorte pedagógico validável deste bloco.

## Frases enviadas ao VLibras

| Módulo | Identificadores | Frases-alvo |
| --- | --- | --- |
| Cumprimentos | `ola`, `bom-dia`, `boa-tarde`, `tchau` | “Olá”, “Bom dia”, “Boa tarde”, “Tchau” |
| Alfabeto A–F | `alfabeto-a` a `alfabeto-f` | “Letra A” a “Letra F” |
| Números | `numero-zero` a `numero-cinco` | “Zero”, “Um”, “Dois”, “Três”, “Quatro”, “Cinco” |

Cada questão possui quatro alternativas, uma única resposta correta e posição ordenada dentro do módulo. As alternativas são embaralhadas no seed para evitar que o gabarito permaneça sempre na mesma posição visual.

## Critérios pedagógicos do recorte

- Uma habilidade de reconhecimento por questão.
- Conteúdo introdutório e progressivo.
- Enunciados curtos e consistentes.
- Feedback imediato de acerto ou erro.
- Repetição do avatar disponível durante a atividade.
- XP por primeiro acerto e recompensa idempotente por conclusão.

## Validação obrigatória antes do uso educacional definitivo

O funcionamento técnico das frases é coberto pelos testes automatizados da API, mas isso não equivale a uma validação linguística. Antes da avaliação final do TCC, as 16 sinalizações devem ser revisadas por professor, intérprete ou pessoa especialista em Libras, considerando configuração de mão, orientação, ponto de articulação, movimento, expressão não manual e possíveis variações regionais.

Status atual: **conteúdo implementado tecnicamente; revisão linguística especializada pendente**.

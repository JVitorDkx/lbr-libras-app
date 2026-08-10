# Guia de Avaliação Formativa, Usabilidade e Libras

## 1. Finalidade

Este protocolo organiza uma avaliação prática do LBRLibras com usuários e uma
revisão linguística separada com especialista em Libras. Ele foi preparado para
produzir evidências auditáveis para o TCC sem transformar opiniões em resultados
pedagógicos que ainda não foram medidos.

Os objetivos são verificar:

- eficácia: se a pessoa conclui as tarefas propostas;
- eficiência: tempo, erros, repetições e ajuda necessária;
- satisfação: percepção registrada pelo questionário SUS;
- clareza da interface mobile-first e dos feedbacks de gamificação;
- adequação linguística dos sinais apresentados pelo avatar do VLibras;
- coerência entre sinal, enunciado, alternativas e resposta correta.

As dimensões de eficácia, eficiência e satisfação seguem os conceitos de
usabilidade da ISO 9241-11:2018. O instrumento SUS segue a estrutura de dez itens
de Brooke, com escala de concordância de cinco pontos.

## 2. Cuidados éticos e organização

Antes da coleta, o pesquisador deve confirmar com o orientador as exigências do
IFRO e a eventual necessidade de avaliação por comitê de ética. A participação
deve ser voluntária, com explicação do objetivo, duração, dados coletados e
direito de desistir. Para menores de idade, devem ser seguidas as autorizações
institucionais e do responsável legal.

- Identificar participantes por códigos como `P01`, nunca pelo nome na planilha.
- Não gravar voz, imagem ou tela sem consentimento específico.
- Não coletar senha, diagnóstico, CPF ou outro dado desnecessário.
- Guardar o termo de consentimento separado das respostas.
- Informar que o VLibras é uma tradução automática externa e pode apresentar
  variações ou indisponibilidade.
- Não ensinar previamente onde clicar; ajudar somente quando a tarefa travar e
  registrar a ajuda prestada.

## 3. Perfis e papéis

### Participantes de usabilidade

Registrar apenas dados relevantes ao contexto:

- código do participante;
- faixa etária;
- experiência com aplicativos de aprendizagem: nenhuma, baixa, média ou alta;
- conhecimento prévio de Libras: nenhum, iniciante, intermediário ou avançado;
- dispositivo e navegador usados;
- uso ou não de tecnologia assistiva durante o teste.

### Especialista em Libras

A revisão linguística deve ser feita por profissional com qualificação ou
experiência documentável em Libras. Registrar formação/atuação de forma resumida,
data da avaliação, versão do app e região linguística considerada. O especialista
não deve ser substituído pela pontuação SUS dos usuários.

### Moderador e observador

O moderador apresenta o termo inicial e as tarefas. O observador registra tempo,
erros, pedidos de ajuda, comentários espontâneos e eventos técnicos sem orientar
a resposta.

## 4. Preparação da sessão

1. Executar a verificação pré-banca descrita ao final deste documento.
2. Abrir o sistema no viewport de celular e confirmar a API e o VLibras.
3. Redefinir o progresso pelo modal Configurações somente se a sessão exigir um
   usuário novo.
4. Anotar commit, data, dispositivo, navegador e condição da rede.
5. Preparar cronômetro e ficha de observação.
6. Explicar: "Estamos avaliando o aplicativo, não você".
7. Pedir que a pessoa pense em voz alta, sem revelar respostas do quiz.

## 5. Roteiro de tarefas

| ID | Tarefa entregue ao participante | Critério de sucesso | Dados observados |
| --- | --- | --- | --- |
| T1 | Identifique seu nível, XP e sequência no Menu. | Localiza os três dados sem ajuda. | Tempo, dúvida e ajuda. |
| T2 | Inicie e conclua a aula de Cumprimentos. | Responde as quatro questões e chega ao resumo. | Acertos, erros, repetições do avatar e tempo. |
| T3 | Explique o feedback recebido após um erro. | Reconhece a alternativa escolhida e a correta. | Compreensão e comentário. |
| T4 | Volte ao Menu e encontre o próximo módulo liberado. | Identifica Alfabeto A–F como disponível. | Tempo, erro de navegação e ajuda. |
| T5 | Interaja com ao menos duas questões de Alfabeto. | Abre o módulo e responde sem falha de fluxo. | Acertos, legibilidade do avatar e tempo. |
| T6 | Abra o Perfil e consulte seu histórico de aprendizagem. | Localiza XP, aulas, combo e desempenho por categoria. | Interpretação das métricas e ajuda. |
| T7 | Desative e reative sons nas Configurações. | Altera a preferência e fecha o modal. | Descoberta, retorno visual e tempo. |
| T8 | Diante da simulação "Avatar indisponível", tente recuperar o sinal. | Encontra "Tentar novamente" e entende a mensagem. | Clareza, confiança e resultado. |

Para cada tarefa, marcar: `concluiu sem ajuda`, `concluiu com ajuda`, `não
concluiu` ou `falha técnica`. Falha do VLibras ou da rede não deve ser registrada
como erro de compreensão do participante.

## 6. Ficha de observação por participante

| Tarefa | Resultado | Tempo (s) | Erros de navegação | Ajudas | Observação objetiva |
| --- | --- | ---: | ---: | ---: | --- |
| T1 |  |  |  |  |  |
| T2 |  |  |  |  |  |
| T3 |  |  |  |  |  |
| T4 |  |  |  |  |  |
| T5 |  |  |  |  |  |
| T6 |  |  |  |  |  |
| T7 |  |  |  |  |  |
| T8 |  |  |  |  |  |

Perguntas abertas ao final:

1. O que foi mais fácil no aplicativo?
2. O que causou dúvida ou demorou mais?
3. Os feedbacks de acerto e erro foram claros? Por quê?
4. O avatar ajudou a compreender o sinal? Em quais momentos não ajudou?
5. O que você mudaria antes de usar o aplicativo novamente?

## 7. Questionário System Usability Scale (SUS)

Aplicar depois das tarefas. Para cada afirmação, marcar de 1 a 5:

`1 = Discordo totalmente`, `2 = Discordo`, `3 = Neutro`, `4 = Concordo`,
`5 = Concordo totalmente`.

1. Eu gostaria de usar o LBRLibras com frequência.
2. Eu achei o LBRLibras desnecessariamente complexo.
3. Eu achei o LBRLibras fácil de usar.
4. Eu precisaria de ajuda de uma pessoa com conhecimento técnico para usar o LBRLibras.
5. Eu achei que as funções do LBRLibras estavam bem integradas.
6. Eu achei que havia muita inconsistência no LBRLibras.
7. Eu imagino que a maioria das pessoas aprenderia a usar o LBRLibras rapidamente.
8. Eu achei o LBRLibras confuso ou trabalhoso de usar.
9. Eu me senti confiante usando o LBRLibras.
10. Eu precisei aprender muitas coisas antes de conseguir usar o LBRLibras.

### Cálculo da pontuação

- Itens ímpares: subtrair 1 da resposta.
- Itens pares: subtrair a resposta de 5.
- Somar as dez contribuições e multiplicar por 2,5.
- Resultado final: escala de 0 a 100. O SUS não é uma porcentagem de acertos.

Registrar respostas individuais e apresentar média, mediana, mínimo, máximo e
número de participantes. Não declarar melhoria de aprendizagem a partir do SUS:
ele mede percepção de usabilidade, não domínio de Libras. Para este TCC, uma meta
interna de `SUS >= 70` pode ser adotada como critério de projeto, desde que seja
descrita como meta definida pela equipe, não como aprovação universal da escala.

## 8. Ficha de validação linguística e pedagógica

O especialista deve observar cada uma das 16 atividades registradas em
`docs/MATRIZ_CONTEUDO.md`, na mesma versão que será demonstrada.

Escala sugerida: `1 = inadequado`, `2 = requer revisão`, `3 = adequado com
ressalva`, `4 = adequado` e `N/A = não avaliável por falha técnica`.

| Critério | Nota | Comentário obrigatório quando menor que 4 |
| --- | ---: | --- |
| Correspondência entre frase-alvo e sinal apresentado |  |  |
| Configuração de mão |  |  |
| Ponto de articulação/localização |  |  |
| Movimento |  |  |
| Orientação da palma |  |  |
| Expressões não manuais |  |  |
| Enquadramento de mãos, braços, tronco e rosto |  |  |
| Coerência do enunciado e das alternativas |  |  |
| Adequação ao público iniciante |  |  |
| Variação regional ou ambiguidade relevante |  |  |

Decisão por atividade: `aprovada`, `aprovada com ressalva`, `corrigir e
reavaliar` ou `rejeitada`. Uma atividade marcada para correção não deve ser
apresentada como conteúdo linguisticamente validado.

## 9. Indicadores para o capítulo de resultados

- Taxa de conclusão por tarefa = conclusões / participantes elegíveis.
- Taxa de conclusão sem ajuda.
- Tempo mediano por tarefa; evitar somente a média quando houver valores extremos.
- Quantidade de erros de navegação e pedidos de ajuda por tarefa.
- Pontuação SUS individual e resumo do grupo.
- Quantidade de sinais aprovados, com ressalva e rejeitados pelo especialista.
- Frequência de falhas externas do VLibras separada dos problemas da interface.
- Principais temas das respostas abertas, com exemplos anonimizados.

Resultados devem informar tamanho da amostra e contexto. Não generalizar para
toda a população surda ou para eficácia pedagógica sem desenho de pesquisa e
evidências apropriadas.

## 10. Critérios de aceite antes da banca

- 100% das atividades demonstradas revisadas por especialista em Libras.
- Nenhum problema crítico que impeça iniciar, responder ou concluir uma aula.
- Relatório separando falhas da interface e indisponibilidade do VLibras.
- Evidências anonimizadas e consentimento organizados.
- Métricas calculadas com os dados coletados, sem preencher resultados fictícios.
- Commit e ambiente de teste registrados para permitir reprodução.

## 11. Verificação automatizada pré-banca

Na raiz do repositório, com as dependências já instaladas:

```powershell
backend\.venv\Scripts\python.exe scripts\pre_banca.py
```

O comando executa testes do backend e frontend, lint, TypeScript, build Vite e
sobe uma API isolada para conferir health check, contratos, bloqueios e o seed
com XP/tentativas zerados. Ele usa bancos SQLite temporários e não modifica o
progresso local real. Para zerar o usuário da demonstração, use conscientemente
o botão **Resetar progresso** no modal Configurações do aplicativo.

## 12. Referências do instrumento

- ISO. *ISO 9241-11:2018 — Ergonomics of human-system interaction — Part 11:
  Usability: Definitions and concepts*. https://www.iso.org/standard/63500.html
- Brooke, J. *SUS: A quick and dirty usability scale*. 1996.
- U.S. Department of Health and Human Services. *System Usability Scale (SUS)*.
  https://www.usability.gov/how-to-and-tools/methods/system-usability-scale.html

# LBRLibras

Protótipo full stack gamificado para o ensino introdutório de Libras, desenvolvido como Trabalho de Conclusão do Curso de Sistemas para Internet do IFRO.

## Arquitetura

- `backend/`: API Python com FastAPI, responsável pelo catálogo de níveis, perguntas e validação das respostas.
- `frontend/`: aplicação React, TypeScript, Vite, Tailwind CSS e Framer Motion, com interface mobile-first.

## Executar o backend

```bash
cd backend
python -m venv .venv
.venv/Scripts/activate
python -m pip install -e ".[dev]"
uvicorn app.main:app --reload
```

A API ficará disponível em `http://localhost:8000`. A documentação interativa estará em `http://localhost:8000/docs`.

## Executar o frontend

```bash
cd frontend
pnpm install
pnpm dev
```

O frontend ficará disponível em `http://localhost:5173`.

## Blocos do protótipo

1. ✅ Fundação full stack e design system.
2. ✅ Menu principal, trilha dinâmica, XP e desbloqueio local.
3. ✅ Área de jogo com quatro questões, mídia visual e feedback imediato.
4. ✅ Conclusão idempotente, +250 XP e persistência de progresso.

## Progresso local do protótipo

O menu consulta `GET /api/game/levels` e aplica os pré-requisitos informados pela API. O Nível 1 carrega as questões por `GET /api/game/levels/{level_id}/questions`, valida cada escolha por `POST /api/game/levels/{level_id}/questions/{question_id}/answer` e registra a conclusão por `POST /api/game/levels/{level_id}/complete`.

O progresso fica sincronizado com a API em memória e com o `LocalStorage` do navegador. A conclusão é idempotente: repetir uma aula não concede XP duplicado.

## Mídia de Libras

O componente de mídia aceita imagem, GIF e vídeo. Enquanto os sinais reais não forem gravados e validados por um profissional de Libras, o jogo exibe um estado visual de demonstração claramente identificado, evitando apresentar gestos inventados como conteúdo pedagógico.

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
3. Área de jogo e feedback imediato.
4. Conclusão, XP e persistência de progresso.

## Progresso local do protótipo

O menu consulta `GET /api/game/levels` e aplica os pré-requisitos informados pela API. Durante o Bloco 2, o painel "Modo de validação do protótipo" permite simular a conclusão de Cumprimentos, adicionar 250 XP e desbloquear Alfabeto. O resultado é salvo no `LocalStorage` do navegador.

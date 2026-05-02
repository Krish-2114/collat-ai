# Collat.AI v3 — Desktop frontend

Production-oriented **React 18 + TypeScript + Vite** UI for the Collat.AI FastAPI backend, packaged for Windows with **Electron** + **electron-builder** (NSIS).

## Stack

- React 19, React Router 7 (hash routing for `file://` in packaged Electron)
- Tailwind CSS v4 (`@tailwindcss/vite`)
- shadcn-style primitives (Radix UI + CVA)
- Zustand, Axios, React Hook Form + Zod, Recharts, Framer Motion, Sonner, Lucide

## Prerequisites

1. **Node.js** 20+ and npm  
2. **Backend** running with models loaded:

```bash
cd ../
# from repo root Collat_AI
.\venv\Scripts\activate   # or your env
pip install -r requirements.txt
uvicorn src.api:app --host 0.0.0.0 --port 8000
```

The UI targets `http://localhost:8000` by default (`src/services/api.ts`).

## Scripts

| Command | Purpose |
|--------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Vite dev server (http://localhost:5173) |
| `npm run build` | Typecheck + production `dist/` |
| `npm run build:electron` | Compile `electron/*.ts` → `dist-electron/` |
| `npm run electron:dev` | Vite + Electron (waits on port 5173) |
| `npm run electron:build:win` | Web build + Electron compile + NSIS installer → `release/` |

## Windows installer

```bash
npm run electron:build:win
```

Artifact (name may vary slightly with version): `release/Collat.AI Setup 3.0.0.exe`

First run: start the Python API, then open the desktop app. A banner appears if `/health` is unreachable.

## Troubleshooting

- **API offline**: Confirm `http://localhost:8000/health` in a browser; check firewall.  
- **503 on `/valuate`**: Models not loaded — ensure `models/*.joblib` exist under the backend `models/` directory and restart uvicorn.  
- **Blank window in packaged app**: Routing uses hash URLs (`#/valuate`). Reload if needed.

## Project layout

- `src/pages` — Landing, Valuation, Liquidity, Fraud  
- `src/components/forms` — Accordion property form (shared across engines)  
- `src/components/outputs` — Cards, SHAP charts, fraud tables  
- `src/services` — Axios client + valuation/reference APIs  
- `electron/` — Main process + preload  

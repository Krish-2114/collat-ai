/**
 * Start FastAPI with the same Python that has API deps (lightgbm, xgboost, …).
 * Prefers: COLLAT_PYTHON → ./venv → ./.venv → PYTHON → "python"
 */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const srcDir = path.join(root, 'src')
const isWin = process.platform === 'win32'

const venvPythons = isWin
  ? [
      path.join(root, 'venv', 'Scripts', 'python.exe'),
      path.join(root, '.venv', 'Scripts', 'python.exe'),
    ]
  : [
      path.join(root, 'venv', 'bin', 'python'),
      path.join(root, 'venv', 'bin', 'python3'),
      path.join(root, '.venv', 'bin', 'python'),
      path.join(root, '.venv', 'bin', 'python3'),
    ]

function resolvePython() {
  const fromEnv = process.env.COLLAT_PYTHON?.trim()
  if (fromEnv && fs.existsSync(fromEnv)) return fromEnv
  for (const p of venvPythons) {
    if (fs.existsSync(p)) return p
  }
  const py = process.env.PYTHON?.trim()
  if (py && fs.existsSync(py)) return py
  return isWin ? 'python' : 'python3'
}

const py = resolvePython()
if (!venvPythons.some((p) => fs.existsSync(p)) && !process.env.COLLAT_PYTHON?.trim()) {
  console.warn(
    '[start-api] No ./venv (or COLLAT_PYTHON). Using PATH Python. If you see ModuleNotFoundError: create venv and pip install -r requirements-api.txt',
  )
}

const child = spawn(
  py,
  ['-m', 'uvicorn', 'api:app', '--host', '0.0.0.0', '--port', '8000', '--reload'],
  {
    cwd: srcDir,
    stdio: 'inherit',
    shell: false,
    env: { ...process.env },
  },
)

child.on('error', (err) => {
  console.error(`[start-api] Failed to spawn ${JSON.stringify(py)}:`, err.message)
  process.exit(1)
})

child.on('exit', (code, signal) => {
  if (signal) process.exit(1)
  process.exit(code ?? 0)
})

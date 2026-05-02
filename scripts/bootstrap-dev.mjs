/**
 * One-shot local dev: venv (if needed) → pip API deps (if needed) → npm install (if needed) → npm run dev
 * Usage from repo root: npm start
 */
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const isWin = process.platform === 'win32'

function venvPythonExe() {
  const candidates = isWin
    ? [path.join(root, 'venv', 'Scripts', 'python.exe')]
    : [
        path.join(root, 'venv', 'bin', 'python3'),
        path.join(root, 'venv', 'bin', 'python'),
      ]
  for (const p of candidates) {
    if (fs.existsSync(p)) return p
  }
  return null
}

const reqFile = path.join(root, 'requirements-api.txt')

/** Windows: cannot spawn npm.cmd directly with shell:false (EINVAL); use cmd.exe /c. */
function runNpmSync(argsLine) {
  console.log(`\n[bootstrap] npm ${argsLine}`)
  const r = isWin
    ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `npm ${argsLine}`], {
        cwd: root,
        stdio: 'inherit',
        shell: false,
      })
    : spawnSync('npm', argsLine.trim().split(/\s+/), { cwd: root, stdio: 'inherit', shell: false })
  if (r.status !== 0 && r.status !== null) {
    console.error(`[bootstrap] npm failed (exit ${r.status})`)
    process.exit(r.status ?? 1)
  }
}

function spawnNpmDev() {
  return isWin
    ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm run dev'], {
        cwd: root,
        stdio: 'inherit',
        shell: false,
        env: { ...process.env },
      })
    : spawn('npm', ['run', 'dev'], {
        cwd: root,
        stdio: 'inherit',
        shell: false,
        env: { ...process.env },
      })
}

function run(label, cmd, args, opts = {}) {
  console.log(`\n[bootstrap] ${label}`)
  // Never use shell: true on Windows with paths that contain spaces (e.g. C:\Users\Krish Shah\...).
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: 'inherit',
    ...opts,
    shell: false,
  })
  if (r.status !== 0 && r.status !== null) {
    console.error(`[bootstrap] Failed: ${label} (exit ${r.status})`)
    process.exit(r.status ?? 1)
  }
}

function ensureVenv() {
  if (venvPythonExe()) return
  console.log('\n[bootstrap] Creating Python venv at ./venv …')
  const attempts = isWin
    ? [
        ['py', ['-3.12', '-m', 'venv', 'venv']],
        ['py', ['-3', '-m', 'venv', 'venv']],
        ['python', ['-m', 'venv', 'venv']],
      ]
    : [
        ['python3', ['-m', 'venv', 'venv']],
        ['python', ['-m', 'venv', 'venv']],
      ]
  for (const [cmd, args] of attempts) {
    const r = spawnSync(cmd, args, { cwd: root, stdio: 'inherit', shell: false })
    if (r.status === 0 && venvPythonExe()) return
  }
  console.error(
    '[bootstrap] Could not create venv. Install Python 3.11+ (64-bit), then retry, or set COLLAT_PYTHON to an existing interpreter.',
  )
  process.exit(1)
}

function needsPipInstall() {
  const vpy = venvPythonExe()
  if (!vpy) return true
  const chk = spawnSync(vpy, ['-c', 'import lightgbm, xgboost, fastapi'], {
    cwd: root,
    encoding: 'utf8',
    shell: false,
  })
  return chk.status !== 0
}

function ensureNodeDeps() {
  if (fs.existsSync(path.join(root, 'node_modules'))) return
  runNpmSync('install')
}

function main() {
  console.log('[bootstrap] Collat.AI — repo root:', root)
  ensureVenv()
  const vpy = venvPythonExe()
  if (!vpy) {
    console.error('[bootstrap] venv Python not found after create')
    process.exit(1)
  }
  if (!fs.existsSync(reqFile)) {
    console.error('[bootstrap] Missing', reqFile)
    process.exit(1)
  }
  if (needsPipInstall()) {
    run('pip install API dependencies', vpy, ['-m', 'pip', 'install', '-U', 'pip'])
    run('pip install -r requirements-api.txt', vpy, [
      '-m',
      'pip',
      'install',
      '-r',
      'requirements-api.txt',
    ])
  } else {
    console.log('\n[bootstrap] Python API deps already OK (skipped pip)')
  }
  ensureNodeDeps()
  console.log('\n[bootstrap] Starting API + Vite (Ctrl+C to stop)…\n')
  const child = spawnNpmDev()
  child.on('error', (err) => {
    console.error('[bootstrap]', err.message)
    process.exit(1)
  })
  child.on('exit', (code, signal) => {
    if (signal) process.exit(1)
    process.exit(code ?? 0)
  })
}

main()

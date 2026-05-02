<# 
  Collat.AI — one command from repo root (same as: npm start)
  Creates venv if needed, pip installs requirements-api.txt if needed,
  npm install if needed, then starts FastAPI + Vite.
#>
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot
npm start

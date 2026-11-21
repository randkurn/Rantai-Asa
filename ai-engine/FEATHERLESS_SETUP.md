# Pakai Kimi K3.1 Pro lewat Featherless (OpenAI-compatible)
Base URL: https://api.featherless.ai/v1 | Model ID: moonshotai/Kimi-K3.1-Pro | Konteks tersedia ±256K
JANGAN tulis API key di repo/chat; simpan di environment variable.

## Windows PowerShell
$env:FEATHERLESS_API_KEY="fl-xxxx"
curl.exe https://api.featherless.ai/v1/chat/completions -H "Authorization: Bearer $env:FEATHERLESS_API_KEY" -H "Content-Type: application/json" -d '{\"model\":\"moonshotai/Kimi-K3.1-Pro\",\"messages\":[{\"role\":\"user\",\"content\":\"halo\"}]}'

## Agen koding (pilih satu)
Aider (pip install aider-chat), di root repo:
  $env:OPENAI_API_BASE="https://api.featherless.ai/v1"; $env:OPENAI_API_KEY=$env:FEATHERLESS_API_KEY
  aider --model openai/moonshotai/Kimi-K3.1-Pro
  lalu: /read AGENTS.md  /read STATUS.md  /read ai-engine/API_CONTRACT.md  lalu tempel isi PROMPT_FEATHERLESS.md
OpenCode / Cline / Roo / Continue: Base URL, API key, Model ID di atas; context window 262144.

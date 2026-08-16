#!/usr/bin/env bash
# pnpm dev の前に自動実行され、ローカル開発用 Postgres を確実に起動する。
# Docker デーモンが落ちていれば Docker Desktop を起動して待機する(macOS 前提)。
# 開発憲法 §6「クローンして pnpm dev 一発で全部動く」に沿うためのもの。
set -euo pipefail

# 1. Docker デーモンが動いていなければ Docker Desktop を起動して待つ
if ! docker info >/dev/null 2>&1; then
  echo "🐳 Docker デーモンが起動していません。Docker Desktop を起動します…"
  open -a Docker
  printf "   起動を待機中"
  until docker info >/dev/null 2>&1; do
    printf "."
    sleep 1
  done
  echo " 起動しました"
fi

# 2. Postgres コンテナを起動(既に起動済みなら何もしない)
docker compose up -d

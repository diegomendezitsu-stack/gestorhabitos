#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"

echo "Configurando proyecto..."
cmake -S "$SCRIPT_DIR" -B "$BUILD_DIR" -DCMAKE_BUILD_TYPE=Release

echo "Compilando..."
cmake --build "$BUILD_DIR" --parallel

echo "Compilación finalizada. Ejecutable en: $BUILD_DIR"
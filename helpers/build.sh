#!/bin/bash

set -e

MODE=${1:-serial}  # Default to serial if no argument
LAMBDA_DIR="./lambda"
MAX_PARALLEL=20

if [[ "$MODE" != "serial" && "$MODE" != "parallel" ]]; then
  echo "❌ Invalid mode: '$MODE'"
  echo "Usage: $0 [serial|parallel]"
  exit 1
fi

echo "🔍 Searching for Lambda index.js files in '$LAMBDA_DIR'..."
readarray -t FILES < <(
  find "$LAMBDA_DIR" -mindepth 3 -maxdepth 3 -type f -path "$LAMBDA_DIR/*/src/index.js"
)

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "⚠️  No Lambda index.js files found."
  exit 0
fi

echo "🚀 Bundling in '$MODE' mode..."
START_TIME=$(date +%s%3N)  # Millisecond precision

bundle_lambda() {
  ENTRY="$1"
  LAMBDA_SRC_DIR="${ENTRY%/*}"
  LAMBDA_DIR_NAME="${LAMBDA_SRC_DIR%/*}"
  LAMBDA_DIR_NAME="${LAMBDA_DIR_NAME##*/}"
  DIST_DIR="./dist/lambda/$LAMBDA_DIR_NAME/src"

  echo "📦 Bundling $ENTRY -> $DIST_DIR/index.js"

  mkdir -p "$DIST_DIR"

  LAMBDA_START=$(date +%s%3N)

  if ! esbuild "$ENTRY" \
    --bundle \
    --platform=node \
    --target=node18 \
    --external:@aws-sdk/* \
    --outfile="$DIST_DIR/index.js"; then
      echo "❌ Failed to bundle $LAMBDA_DIR_NAME" >&2
      return 1
  fi

  LAMBDA_END=$(date +%s%3N)
  echo "⏱️  Finished $LAMBDA_DIR_NAME in $((LAMBDA_END - LAMBDA_START)) ms"
}

export -f bundle_lambda

if [[ "$MODE" == "parallel" ]]; then
  printf "%s\n" "${FILES[@]}" | xargs -P $MAX_PARALLEL -n 1 -I{} bash -c 'bundle_lambda "$@"' _ {}
else
  for file in "${FILES[@]}"; do
    bundle_lambda "$file"
  done
fi

END_TIME=$(date +%s%3N)
DURATION=$((END_TIME - START_TIME))

echo "✅ All Lambda functions bundled in ${DURATION} ms."

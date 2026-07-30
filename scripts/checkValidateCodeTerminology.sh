#!/bin/bash
#
# Enforces validateCode terminology across the codebase:
#   - User-facing copy (src/languages) must use "security code" / "security link", not "magic code"
#   - Internal identifiers (src, tests) must use validateCode, not magicCode / MagicCode / MAGIC_CODE

set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly ROOT_DIR

# grep output format: path:line:content — filter lines whose content is a pure comment
filter_comments() {
    grep -v ":[0-9]*:[[:space:]]*//" | grep -v ":[0-9]*:[[:space:]]*\*"
}

LANG_HITS=$(grep -rni --include="*.ts" "magic.code\|magic code" "$ROOT_DIR/src/languages" 2>/dev/null | filter_comments || true)
CODE_HITS=$(grep -rn  --include="*.ts" --include="*.tsx" "magicCode\|MagicCode\|MAGIC_CODE" "$ROOT_DIR/src" "$ROOT_DIR/tests" 2>/dev/null | filter_comments || true)

if [[ -z "$LANG_HITS" && -z "$CODE_HITS" ]]; then
    echo "✅  Validate code terminology check passed."
    exit 0
fi

echo "❌  Validate code terminology violations found."
echo "    User-facing copy: use 'security code' / 'security link'."
echo "    Internal identifiers: use 'validateCode'."
echo ""
[[ -n "$LANG_HITS" ]] && echo "$LANG_HITS"
[[ -n "$CODE_HITS" ]] && echo "$CODE_HITS"
exit 1

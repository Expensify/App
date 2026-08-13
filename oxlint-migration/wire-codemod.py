#!/usr/bin/env python3
"""One-shot codemod for the oxlint wiring (see OXLINT_MIGRATION_INVESTIGATION.md).

Compares the wired oxlint run (/tmp/oxlint-wired.json) against the ESLint baseline
(/tmp/eslint-full.json) and, for every oxlint-only finding of the newly wired rules:

- core/no-restricted-syntax + rh/* : locates the existing eslint-disable comment that
  suppresses the ESLint twin and prepends a same-line `/* oxlint-disable-next-line ... */`
  combo (verified: both linters honor it; line numbers are preserved).
- typescript/no-deprecated : splits files into "write-only" (no ESLint findings at all ->
  emitted as a config override list) and "mixed" (trailing oxlint-disable-line comments).

Run with --apply to write changes; default is a dry run.
"""

import json
import os
import sys
from collections import defaultdict

APPLY = '--apply' in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

OX_TO_ES = {
    'core(no-restricted-syntax)': 'no-restricted-syntax',
    'rh(refs)': 'react-hooks/refs',
    'rh(set-state-in-effect)': 'react-hooks/set-state-in-effect',
    'rh(preserve-manual-memoization)': 'react-hooks/preserve-manual-memoization',
    'rh(immutability)': 'react-hooks/immutability',
    'rh(static-components)': 'react-hooks/static-components',
    'rh(exhaustive-deps)': 'react-hooks/exhaustive-deps',
}
OX_ID = {  # oxlint rule id to use in the suppression comment
    'core(no-restricted-syntax)': 'core/no-restricted-syntax',
    'rh(refs)': 'rh/refs',
    'rh(set-state-in-effect)': 'rh/set-state-in-effect',
    'rh(preserve-manual-memoization)': 'rh/preserve-manual-memoization',
    'rh(immutability)': 'rh/immutability',
    'rh(static-components)': 'rh/static-components',
    'rh(exhaustive-deps)': 'rh/exhaustive-deps',
}

eslint = json.load(open('/tmp/eslint-full.json'))
es = defaultdict(set)  # unified eslint rule -> {(file, line)}
for f in eslint:
    rel = os.path.relpath(f['filePath'], ROOT)
    for m in f['messages']:
        rid = m.get('ruleId') or ''
        if rid.startswith('@typescript-eslint/no-deprecated'):
            rid = '@typescript-eslint/no-deprecated'
        es[rid].add((rel, m['line']))

ox = defaultdict(set)
for d in json.load(open('/tmp/oxlint-wired.json'))['diagnostics']:
    code = d['code']
    sp = d['labels'][0]['span']
    if code in OX_TO_ES:
        ox[code].add((d['filename'], sp['line']))
    elif code == 'typescript(no-deprecated)':
        ox[code].add((d['filename'], sp['line']))

# ---- core + rh: same-line combo insertion at existing eslint-disable comments ----
edits = defaultdict(lambda: defaultdict(set))  # file -> comment_line_idx(0-based) -> {ox ids}
leftovers = []
missing = []
for code, es_rule in OX_TO_ES.items():
    extras = ox[code] - es[es_rule]
    missing += [(es_rule, k) for k in sorted(es[es_rule] - ox[code])]
    for rel, line in sorted(extras):
        try:
            lines = open(os.path.join(ROOT, rel)).read().split('\n')
        except OSError:
            leftovers.append((code, rel, line, 'unreadable'))
            continue
        above = lines[line - 2] if line >= 2 else ''
        same = lines[line - 1]
        bare = es_rule == 'no-restricted-syntax'
        mentioned = (es_rule in above) or (bare and 'no-restricted-syntax' in above)
        if 'eslint-disable-next-line' in above and mentioned:
            edits[rel][line - 2].add(OX_ID[code])
        elif 'eslint-disable-line' in same and (es_rule in same or (bare and 'no-restricted-syntax' in same)):
            edits[rel][line - 1].add(OX_ID[code])
        else:
            leftovers.append((code, rel, line, above.strip()[:80] or same.strip()[:80]))

# ---- typescript/no-deprecated: override list + trailing comments in mixed files ----
dep_extras = ox['typescript(no-deprecated)'] - es['@typescript-eslint/no-deprecated']
dep_missing = es['@typescript-eslint/no-deprecated'] - ox['typescript(no-deprecated)']
es_dep_files = {f for f, _ in es['@typescript-eslint/no-deprecated']}
by_file = defaultdict(list)
for rel, line in sorted(dep_extras):
    by_file[rel].append(line)
override_files = sorted(f for f in by_file if f not in es_dep_files)
mixed = {f: ls for f, ls in by_file.items() if f in es_dep_files}

DEP_COMMENT = ' // oxlint-disable-line typescript/no-deprecated -- write to a deprecated field; typescript-eslint misses writes (typescript-eslint#10643)'

print(f'core+rh: comment edits in {len(edits)} files, {sum(len(v) for v in edits.values())} lines; leftovers {len(leftovers)}; missing-from-oxlint {len(missing)}')
for item in leftovers:
    print('  LEFTOVER', *item)
for item in missing[:20]:
    print('  MISSING', *item)
print(f'no-deprecated: override-off files {len(override_files)} (covering {sum(len(by_file[f]) for f in override_files)} findings), mixed files {len(mixed)} with {sum(len(v) for v in mixed.values())} trailing comments; missing {len(dep_missing)}')
for f, ls in mixed.items():
    print('  MIXED', f, ls)

if not APPLY:
    print('dry run — pass --apply to write')
    sys.exit(0)

for rel, per_line in edits.items():
    path = os.path.join(ROOT, rel)
    lines = open(path).read().split('\n')
    for idx, ids in per_line.items():
        combo = f"/* oxlint-disable-next-line {', '.join(sorted(ids))} */ "
        text = lines[idx]
        pos = text.find('// eslint-disable-next-line')
        if pos < 0:
            pos = text.find('/* eslint-disable-next-line')
        if pos < 0:
            pos = text.find('// eslint-disable-line')
            combo = combo.replace('oxlint-disable-next-line', 'oxlint-disable-line')
        if pos < 0:
            print('SKIP (no anchor)', rel, idx + 1)
            continue
        lines[idx] = text[:pos] + combo + text[pos:]
    open(path, 'w').write('\n'.join(lines))

for rel, ls in mixed.items():
    path = os.path.join(ROOT, rel)
    lines = open(path).read().split('\n')
    for line in ls:
        lines[line - 1] += DEP_COMMENT
    open(path, 'w').write('\n'.join(lines))

json.dump(override_files, open(os.path.join(ROOT, 'oxlint-migration', 'dep-override-files.json'), 'w'), indent=4)
print('applied; override file list written to oxlint-migration/dep-override-files.json')

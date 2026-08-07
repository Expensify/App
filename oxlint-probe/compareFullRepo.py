"""Full-repository finding-by-finding comparison between ESLint and Oxlint.

Usage (see OXLINT_MIGRATION_INVESTIGATION.md appendix for the generation commands):
    python3 oxlint-probe/compareFullRepo.py [/tmp/oxlint-full.json] [/tmp/eslint-full.json]

Normalizes both tools' rule names to ESLint's naming, prints a per-rule count
table, and flags every rule where the two tools disagree.
"""

import collections
import json
import re
import sys


def norm_ox(code):
    m = re.match(r'^([\w@/.-]+)\((.+)\)$', code)
    if not m:
        return code
    plugin, rule = m.groups()
    if plugin == 'eslint':
        return rule
    if plugin == 'typescript':
        return f'@typescript-eslint/{rule}'
    if plugin == 'react' and rule == 'exhaustive-deps':
        return f'react-hooks/{rule}'
    if plugin == 'jsx_a11y':
        return f'jsx-a11y/{rule}'
    return f'{plugin}/{rule}'


def norm_es(rid):
    if rid is None:
        return '<fatal>'
    # the stratify processor splits no-deprecated into per-API synthetic IDs
    if rid.startswith('@typescript-eslint/no-deprecated/'):
        return '@typescript-eslint/no-deprecated'
    return rid


ox_file = sys.argv[1] if len(sys.argv) > 1 else '/tmp/oxlint-full.json'
es_file = sys.argv[2] if len(sys.argv) > 2 else '/tmp/eslint-full.json'
ox = json.load(open(ox_file))
es = json.load(open(es_file))
cox = collections.Counter(norm_ox(x.get('code', '')) for x in ox['diagnostics'])
ces = collections.Counter(norm_es(m.get('ruleId')) for r in es for m in r['messages'])
print(f'{"rule":62} {"eslint":>7} {"oxlint":>7}')
for r in sorted(set(cox) | set(ces), key=lambda r: -(ces.get(r, 0) + cox.get(r, 0))):
    a, b = ces.get(r, 0), cox.get(r, 0)
    flag = '' if a == b else ('  <-- DIFF' if min(a, b) > 0 else ('  <-- ESLINT-ONLY' if b == 0 else '  <-- OXLINT-ONLY'))
    print(f'{r:62} {a:7} {b:7}{flag}')
print('totals:', sum(ces.values()), sum(cox.values()))

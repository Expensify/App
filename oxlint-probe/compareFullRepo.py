"""Full-repository finding-by-finding comparison between ESLint and Oxlint.

Usage (see OXLINT_MIGRATION_INVESTIGATION.md appendix for the generation commands):
    python3 oxlint-probe/compareFullRepo.py [/tmp/oxlint-full.json] [/tmp/eslint-full.json]

Normalizes both tools' rule names to ESLint's naming, prints the full per-rule
count table, each linter's run time (when the shell wrapper recorded it in a
sibling `<report>.time` file), and a summary listing only the rules where the
two tools disagree.

Then runs a config-level coverage check, which catches gaps the findings table
cannot see: a rule enabled in ESLint but missing from the Oxlint config looks
like parity until the first violation is written. Rule metadata and the port plan
for every ESLint-only rule live in oxlint-probe/ruleMap.py; for the full rule
inventory (including rules with no findings) use oxlint-probe/listAllRules.py.
"""

import collections
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import ruleMap
from ruleMap import KNOWN_NOT_IMPLEMENTED_LOW_VALUE, PORT_PLAN, norm_es, norm_ox


def read_time(report_path):
    try:
        return float(open(f'{report_path}.time').read().strip())
    except (OSError, ValueError):
        return None


def findings_table(ox_file, es_file):
    ox = json.load(open(ox_file))
    es = json.load(open(es_file))
    cox = collections.Counter(norm_ox(x.get('code', '')) for x in ox['diagnostics'])
    ces = collections.Counter(norm_es(m.get('ruleId')) for r in es for m in r['messages'])

    print(f'{"rule":62} {"eslint":>7} {"oxlint":>7}')
    diffs = []
    for rule in sorted(set(cox) | set(ces), key=lambda r: -(ces.get(r, 0) + cox.get(r, 0))):
        a, b = ces.get(rule, 0), cox.get(rule, 0)
        print(f'{rule:62} {a:7} {b:7}')
        if a != b:
            diffs.append((rule, a, b))
    print(f'{"totals":62} {sum(ces.values()):7} {sum(cox.values()):7}')

    print()
    print('Timing:')
    for name, path in (('eslint', es_file), ('oxlint', ox_file)):
        seconds = read_time(path)
        if seconds is None:
            print(f'  {name:7} unknown (cached report or generated outside the wrapper -- rerun with `npm run compare-oxlint -- --fresh`)')
        else:
            print(f'  {name:7} {seconds:8.1f} s')

    print()
    if not diffs:
        print('Differences: none -- full parity on every rule.')
    else:
        print(f'Differences ({len(diffs)} rules):')
        for rule, a, b in diffs:
            side = 'ESLINT-ONLY' if b == 0 else ('OXLINT-ONLY' if a == 0 else 'DIFF')
            print(f'  {rule:60} eslint={a:<6} oxlint={b:<6} {side}')


def config_coverage_check():
    ox_rules = ruleMap.oxlint_enabled_rules()
    es_rules = ruleMap.eslint_enabled_rules()

    gaps = sorted(es_rules - ox_rules)
    extras = sorted(ox_rules - es_rules)
    print()
    print(f'Config coverage (enabled rules, union across scopes): eslint={len(es_rules)}, oxlint={len(ox_rules)}, shared={len(es_rules & ox_rules)}')
    planned = [r for r in gaps if r in PORT_PLAN]
    low_value = [r for r in gaps if r in KNOWN_NOT_IMPLEMENTED_LOW_VALUE]
    unexplained = [r for r in gaps if r not in PORT_PLAN and r not in KNOWN_NOT_IMPLEMENTED_LOW_VALUE]
    if planned:
        print(f'  ESLint-only with a port plan ({len(planned)}) -- effort / mechanism:')
        for rule in planned:
            plan = PORT_PLAN[rule]
            print(f'    {rule:56} [{plan["effort"]:22}] {plan["mechanism"]}')
    if low_value:
        print(f'  ESLint-only, not implemented in oxlint + low value ({len(low_value)}): {", ".join(low_value)}')
    if unexplained:
        print(f'  ESLint-only, UNEXPLAINED ({len(unexplained)}) -- each is a silent coverage gap:')
        for rule in unexplained:
            print(f'    {rule}')
    else:
        print('  No unexplained ESLint-only rules.')
    if extras:
        print(f'  Oxlint-only extras ({len(extras)}, informational): {", ".join(extras[:10])}{" ..." if len(extras) > 10 else ""}')


if __name__ == '__main__':
    findings_table(
        sys.argv[1] if len(sys.argv) > 1 else '/tmp/oxlint-full.json',
        sys.argv[2] if len(sys.argv) > 2 else '/tmp/eslint-full.json',
    )
    config_coverage_check()

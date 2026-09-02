"""Full-repository finding-by-finding comparison between ESLint and Oxlint.

Usage (see OXLINT_MIGRATION_INVESTIGATION.md appendix for the generation commands):
    python3 oxlint-migration/compareFullRepo.py [/tmp/oxlint-full.json] [/tmp/eslint-full.json]

Normalizes both tools' rule names to ESLint's naming, then checks parity three ways:

  counts     per-rule totals, the table
  locations  the (file, line) set per rule -- equal counts are not equal findings,
             and a rule whose port anchors reports one line off would otherwise pass
  errors     Oxlint diagnostics with no rule code, which is how a crashing JS-plugin
             rule shows up. These have to be loud: they are silent coverage loss
             (the rule ran on nothing) that no count comparison can catch.

Then a config-level coverage check, which catches gaps the findings table cannot see:
a rule enabled in ESLint but missing from the Oxlint config looks like parity until
the first violation is written. Rule metadata and the port plan for every ESLint-only
rule live in oxlint-migration/ruleMap.py; for the full rule inventory (including rules
with no findings) use oxlint-migration/listAllRules.py.
"""

import collections
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import ruleMap
from ruleMap import PORT_PLAN, ROOT, norm_es, norm_ox


def read_time(report_path):
    try:
        return float(open(f'{report_path}.time').read().strip())
    except (OSError, ValueError):
        return None


def relative(path):
    """Both tools name the same file differently: oxlint repo-relative, ESLint absolute."""
    return os.path.relpath(path, ROOT) if os.path.isabs(path) else path


def oxlint_locations(diagnostics):
    """rule -> {(file, line)}, plus the diagnostics that carry no rule at all."""
    per_rule = collections.defaultdict(set)
    errors = []
    for diagnostic in diagnostics:
        code = diagnostic.get('code')
        if not code:
            errors.append(diagnostic)
            continue
        labels = diagnostic.get('labels') or []
        line = labels[0]['span']['line'] if labels else 0
        per_rule[norm_ox(code)].add((relative(diagnostic['filename']), line))
    return per_rule, errors


def eslint_locations(report):
    per_rule = collections.defaultdict(set)
    for result in report:
        rel = relative(result['filePath'])
        for message in result['messages']:
            per_rule[norm_es(message.get('ruleId'))].add((rel, message['line']))
    return per_rule


def findings_table(ox_file, es_file):
    ox = json.load(open(ox_file))
    es = json.load(open(es_file))
    diagnostics = ox['diagnostics']
    ox_at, ox_errors = oxlint_locations(diagnostics)
    es_at = eslint_locations(es)
    cox = collections.Counter(norm_ox(x['code']) for x in diagnostics if x.get('code'))
    ces = collections.Counter(norm_es(m.get('ruleId')) for r in es for m in r['messages'])

    print(f'{"rule":62} {"eslint":>7} {"oxlint":>7}')
    diffs, misplaced = [], []
    for rule in sorted(set(cox) | set(ces), key=lambda r: -(ces.get(r, 0) + cox.get(r, 0))):
        a, b = ces.get(rule, 0), cox.get(rule, 0)
        print(f'{rule:62} {a:7} {b:7}')
        if a != b:
            diffs.append((rule, a, b))
        elif a and es_at[rule] != ox_at[rule]:
            misplaced.append((rule, sorted(es_at[rule] - ox_at[rule]), sorted(ox_at[rule] - es_at[rule])))
    print(f'{"totals":62} {sum(ces.values()):7} {sum(cox.values()):7}')

    print()
    print('Timing (single cold run each, not a benchmark -- a busy machine moves these by 10%+):')
    for name, path in (('eslint', es_file), ('oxlint', ox_file)):
        seconds = read_time(path)
        if seconds is None:
            print(f'  {name:7} unknown (cached report or generated outside the wrapper -- rerun with `npm run compare-oxlint -- --fresh`)')
        else:
            print(f'  {name:7} {seconds:8.1f} s')

    print()
    if ox_errors:
        print(f'OXLINT RULE ERRORS ({len(ox_errors)}) -- a rule threw, so it checked nothing in these files:')
        by_message = collections.Counter()
        for diagnostic in ox_errors:
            message = diagnostic.get('message', '')
            first = next((line for line in message.split('\n') if line.startswith('Error') or line.startswith('TypeError')), message[:80])
            by_message[first.strip()] += 1
        for message, count in by_message.most_common():
            print(f'  {count:5} {message[:150]}')
        print('  (a JS-plugin rule that throws produces no findings and no diff -- fix it or take it out of the config)')
        print()

    if not diffs and not misplaced:
        print('Differences: none -- full parity on every rule, counts and locations.')
    if diffs:
        print(f'Differences ({len(diffs)} rules):')
        for rule, a, b in diffs:
            side = 'ESLINT-ONLY' if b == 0 else ('OXLINT-ONLY' if a == 0 else 'DIFF')
            print(f'  {rule:60} eslint={a:<6} oxlint={b:<6} {side}')
    if misplaced:
        print(f'Same count, different locations ({len(misplaced)} rules) -- equal totals hiding a real disagreement:')
        for rule, es_only, ox_only in misplaced:
            print(f'  {rule}')
            for where in es_only[:3]:
                print(f'    eslint only: {where[0]}:{where[1]}')
            for where in ox_only[:3]:
                print(f'    oxlint only: {where[0]}:{where[1]}')


def config_coverage_check():
    ox_rules = ruleMap.oxlint_enabled_rules()
    es_rules = ruleMap.eslint_enabled_rules()

    gaps = sorted(es_rules - ox_rules)
    extras = sorted(ox_rules - es_rules)
    print()
    print(f'Config coverage (enabled rules, union across scopes): eslint={len(es_rules)}, oxlint={len(ox_rules)}, shared={len(es_rules & ox_rules)}')
    print(f'  (union taken over {len(ruleMap.REPRESENTATIVE_FILES)} representative files, one per config scope: {", ".join(ruleMap.REPRESENTATIVE_FILES)})')
    planned = [r for r in gaps if r in PORT_PLAN]
    unexplained = [r for r in gaps if r not in PORT_PLAN]
    if planned:
        print(f'  ESLint-only with a port plan ({len(planned)}) -- effort / mechanism:')
        for rule in planned:
            plan = PORT_PLAN[rule]
            print(f'    {rule:56} [{plan["effort"]:22}] {plan["mechanism"]}')
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

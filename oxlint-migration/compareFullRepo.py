"""Full-repository finding-by-finding comparison between ESLint and Oxlint.

Usage (see OXLINT_MIGRATION_INVESTIGATION.md appendix for the generation commands):
    python3 oxlint-migration/compareFullRepo.py [/tmp/oxlint-full.json] [/tmp/eslint-full.json]

Both reports come from `scripts/lint/index.ts --format json`, one per linter, so both have
passed the same processors. Running one leg raw would compare a React-Compiler-filtered
report against an unfiltered one and every react-hooks row would be meaningless.

Checks parity three ways:

  counts     per-rule totals, the table
  locations  the (file, line) set per rule -- equal counts are not equal findings,
             and a rule whose port anchors reports one line off would otherwise pass
  ruleless   messages carrying no rule id. Under the pipeline a crashing JS-plugin rule
             never reaches here at all: OxlintLinter promotes a codeless diagnostic to a
             fatal exit 2 and writes no report, so the run dies instead of silently
             reporting a rule that checked nothing. What is left is ESLint's own
             ruleId-less output, such as an unused disable directive.

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
from ruleMap import PORT_PLAN, ROOT, norm_es_folded

# What norm_es returns for a message with no ruleId.
RULELESS = '<fatal/unused-directive>'


def read_time(report_path):
    try:
        return float(open(f'{report_path}.time').read().strip())
    except (OSError, ValueError):
        return None


def relative(path):
    """Both tools name the same file differently: oxlint repo-relative, ESLint absolute."""
    return os.path.relpath(path, ROOT) if os.path.isabs(path) else path


def read_messages(report_path, linter):
    """The flat LintMessage list `scripts/lint --format json` writes."""
    try:
        return json.load(open(report_path))['messages']
    except (json.JSONDecodeError, KeyError):
        sys.exit(
            f'{report_path} is not a lint report. The {linter} leg exited fatally and wrote nothing '
            f'usable; rerun it on its own to see the error.'
        )


def locations(messages):
    """rule -> {(file, line)}. Both legs are already normalized to ESLint rule ids."""
    per_rule = collections.defaultdict(set)
    for message in messages:
        per_rule[norm_es_folded(message.get('ruleID'))].add((relative(message['filePath']), message['line']))
    return per_rule


def findings_table(ox_file, es_file):
    ox = read_messages(ox_file, 'oxlint')
    es = read_messages(es_file, 'eslint')
    ox_at, es_at = locations(ox), locations(es)
    cox = collections.Counter(norm_es_folded(m.get('ruleID')) for m in ox)
    ces = collections.Counter(norm_es_folded(m.get('ruleID')) for m in es)

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
    ruleless = {'oxlint': ox_at.get(RULELESS, set()), 'eslint': es_at.get(RULELESS, set())}
    if any(ruleless.values()):
        print('MESSAGES WITH NO RULE ID -- not a rule finding, so no count comparison covers them:')
        for linter, where in ruleless.items():
            for path, line in sorted(where)[:5]:
                print(f'  {linter:7} {path}:{line}')
            if len(where) > 5:
                print(f'  {linter:7} ... and {len(where) - 5} more')
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
    print(f'  (union taken over every tracked lintable file, {len(ruleMap.tracked_lintable_files())} of them)')
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

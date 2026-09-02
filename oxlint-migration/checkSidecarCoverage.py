"""Every rule oxlint runs in its Node sidecar, and the evidence that it really runs.

    python3 oxlint-migration/checkSidecarCoverage.py [--json <path>]

Full-repo parity cannot answer this question. Only 13 of the enabled rules have violations in this
repository, so for every other rule "0 = 0" is indistinguishable from a rule that loads, runs against
a bridged AST it does not understand, and silently reports nothing. That risk is concentrated in the
sidecar rules, because oxlint does not reimplement them: it loads the same JavaScript modules ESLint
loads and feeds them a syntax tree it built itself.

Evidence is one of three kinds, all of which run both linters and compare:

    fixture  a file in oxlint-migration/port-probe that violates the rule
    replay   a RuleTester case, upstream or repo-owned, materialized as a real file
    probe    a bespoke script, for the rules neither of those can express

The run fails if an enabled sidecar rule has none of the three, or if the fixture manifest names a
rule that is not an enabled sidecar rule, since a stale entry proves nothing.
"""

import argparse
import json
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)

sys.path.insert(0, HERE)
sys.path.insert(0, os.path.join(HERE, 'rule-tester'))
from compareRuleTester import TREE, build_tree, enabled_custom_rules
from ruleMap import is_on, js_plugin_rules, load_jsonc

MANIFEST = os.path.join(HERE, 'port-probe', 'fixtures.manifest.json')

HAND_HOSTED = {'core', 'hosted', 'rulesdir'}

PROBE_EVIDENCE = {
    'rulesdir/prefer-locale-compare-from-context': (
        'npm run oxlint-locale-compare-port',
        'ESLint runs a type-aware rule here and oxlint runs a type-free rewrite, so the probe asserts them receiver shape by receiver shape inside src/, where types exist',
    ),
    'rulesdir/no-inline-useOnyx-selector': (
        'npm run oxlint-react-compiler-gate',
        'the fixture proves the rule; this proves the React Compiler gate wrapped around it, which is what decides whether a finding survives',
    ),
    'hosted/jsx-no-constructed-context-values': (
        'npm run oxlint-react-compiler-gate',
        'same gate, same reason',
    ),
    'hosted/jsx-uses-react': (
        'npm run oxlint-jsx-uses-port',
        'the rule cannot report: it only marks identifiers as used for no-unused-vars, so the probe asserts the outcome it exists to produce, and measures that switching it off changes nothing on either tool',
    ),
    'hosted/jsx-uses-vars': (
        'npm run oxlint-jsx-uses-port',
        'same, for JSX-only variables rather than the React import',
    ),
}

EXEMPT = {}


def enabled_sidecar_rules():
    """oxlint rule id -> alias, for every rule the config turns on under a jsPlugin alias.

    Keyed on the id the config writes, not on "some rule of that name is enabled somewhere": an alias
    may host a rule that production runs natively instead, and covering the aliased id would test
    something the shipped config never runs.
    """
    aliases = set(js_plugin_rules().values())
    config = load_jsonc(os.path.join(ROOT, '.oxlintrc.json'))
    scopes = [config.get('rules', {})] + [override.get('rules', {}) for override in config.get('overrides', [])]
    rules = {}
    for scope in scopes:
        for rule_id, value in scope.items():
            alias = rule_id.split('/')[0] if '/' in rule_id else None
            if alias in aliases and is_on(value):
                rules[rule_id] = alias
    return dict(sorted(rules.items()))


def fixture_evidence():
    """oxlint rule id -> the fixture that violates it."""
    manifest = json.load(open(MANIFEST))
    return {entry['oxlintRule']: entry['fixture'] for entry in manifest.values()}


def replay_evidence(custom_rules):
    """Custom rule names with at least one RuleTester case, from a real harvest."""
    summary = build_tree(custom_rules)
    shutil.rmtree(TREE, ignore_errors=True)
    return {f'rulesdir/{rule}' for rule in custom_rules if rule not in summary['rulesWithoutTests']}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--json', help='write the coverage table to this path')
    args = parser.parse_args()

    sidecar = enabled_sidecar_rules()
    fixtures = fixture_evidence()
    replays = replay_evidence(enabled_custom_rules())

    rows = []
    for oxlint_id, alias in sidecar.items():
        evidence = []
        if oxlint_id in fixtures:
            evidence.append(('fixture', fixtures[oxlint_id]))
        if oxlint_id in replays:
            evidence.append(('replay', 'oxlint-migration/rule-tester'))
        if oxlint_id in PROBE_EVIDENCE:
            evidence.append(('probe', PROBE_EVIDENCE[oxlint_id][0]))
        rows.append({'oxlintRule': oxlint_id, 'alias': alias, 'evidence': evidence})
    rows.sort(key=lambda row: (row['alias'], row['oxlintRule']))

    uncovered = [row for row in rows if not row['evidence'] and row['alias'] in HAND_HOSTED and row['oxlintRule'] not in EXEMPT]
    exempted = [row for row in rows if not row['evidence'] and row['oxlintRule'] in EXEMPT]
    plugin_hosted = [row for row in rows if not row['evidence'] and row['alias'] not in HAND_HOSTED]
    stray = sorted(rule for rule in fixtures if rule.split('/')[0] in set(sidecar.values()) and rule not in sidecar)

    print(f'{"oxlint rule id":48} evidence')
    for row in rows:
        kinds = ', '.join(f'{kind} ({where})' for kind, where in row['evidence']) or 'NONE'
        print(f'{row["oxlintRule"]:48} {kinds}')

    by_alias = {}
    for row in rows:
        covered, total = by_alias.get(row['alias'], (0, 0))
        by_alias[row['alias']] = (covered + (1 if row['evidence'] else 0), total + 1)
    print()
    for alias in sorted(alias for alias in by_alias if alias in HAND_HOSTED):
        covered, total = by_alias[alias]
        print(f'{alias + "/":18} {covered}/{total} covered')
    hand_covered = sum(covered for alias, (covered, _) in by_alias.items() if alias in HAND_HOSTED)
    hand_total = sum(total for alias, (_, total) in by_alias.items() if alias in HAND_HOSTED)
    print(f'{"hand-hosted":18} {hand_covered}/{hand_total} covered')
    if plugin_hosted:
        print(f'\n{len(plugin_hosted)} rule(s) come from whole npm plugins loaded by package name, where one')
        print('fixture per plugin proves the plugin loads and reports. Listed, not required:')
        for row in plugin_hosted:
            print(f'  {row["oxlintRule"]}')

    if exempted:
        print(f'\nExempt ({len(exempted)}), each by an explicit decision:')
        for row in exempted:
            print(f'  {row["oxlintRule"]}: {EXEMPT[row["oxlintRule"]]}')

    if args.json:
        with open(args.json, 'w') as handle:
            json.dump({'rules': rows, 'uncovered': [row['oxlintRule'] for row in uncovered]}, handle, indent=1)
            handle.write('\n')

    print()
    if stray:
        print(f'{len(stray)} fixture manifest entries name a sidecar rule the config does not enable: {", ".join(stray)}')
    if uncovered:
        print(f'{len(uncovered)} sidecar rule(s) have no evidence they run:')
        for row in uncovered:
            print(f'  {row["oxlintRule"]}')
    if stray or uncovered:
        sys.exit(1)
    print(f'All {len(rows)} enabled sidecar rules are covered by a fixture, a replayed case or a probe.')


if __name__ == '__main__':
    main()

"""Inventory of every lint rule this repo runs, on either tool.

    python3 oxlint-probe/listAllRules.py [--json oxlint-probe/rule-inventory.json]

Unlike compareFullRepo.py, which can only see rules that currently produce findings,
this walks both configs and lists every enabled rule -- shared, ESLint-only and
oxlint-only -- with the data needed to build a per-rule fixture suite:

    status      shared / eslint-only / oxlint-only
    native      does oxlint implement the rule itself (vs. hosting ESLint's via jsPlugins)
    type-aware  does the rule need TypeScript types (tsgolint), and does tsgolint have it
    findings    current violation counts from the cached full-repo reports, when present
    fixture     the example file that proves the rule behaves the same on both tools

The JSON dump is the machine-readable input for the fixture harness in
oxlint-probe/port-probe (see compareFixtures.py).
"""

import collections
import json
import os
import sys

import ruleMap
from ruleMap import ROOT

FIXTURE_MANIFEST = os.path.join(ROOT, 'oxlint-probe/port-probe/fixtures.manifest.json')


def load_findings():
    """Per-rule finding counts from the cached full-repo reports (empty when absent)."""
    counts = {}
    ox_path, es_path = '/tmp/oxlint-full.json', '/tmp/eslint-full.json'
    if os.path.exists(ox_path):
        ox = json.load(open(ox_path))
        counts['oxlint'] = collections.Counter(ruleMap.norm_ox(d.get('code', '')) for d in ox['diagnostics'])
    if os.path.exists(es_path):
        es = json.load(open(es_path))
        counts['eslint'] = collections.Counter(ruleMap.norm_es(m.get('ruleId')) for r in es for m in r['messages'])
    return counts


def load_fixtures():
    if not os.path.exists(FIXTURE_MANIFEST):
        return {}
    return json.load(open(FIXTURE_MANIFEST))


def build():
    es_rules = ruleMap.eslint_enabled_rules()
    ox_rules = ruleMap.oxlint_enabled_rules()
    catalogue = ruleMap.oxlint_catalogue()
    hosted = ruleMap.js_plugin_rules()
    type_aware = ruleMap.tsgolint_rules()
    findings = load_findings()
    fixtures = load_fixtures()

    inventory = {}
    for rule in sorted(es_rules | ox_rules):
        in_es, in_ox = rule in es_rules, rule in ox_rules
        status = 'shared' if in_es and in_ox else ('eslint-only' if in_es else 'oxlint-only')
        inventory[rule] = {
            'status': status,
            'eslint': in_es,
            'oxlint': in_ox,
            'jsPlugin': hosted.get(rule),
            'inOxlintSchema': rule in catalogue,
            'typeAware': rule in type_aware,
            'typeAwareImplemented': type_aware.get(rule),
            'lowValue': rule in ruleMap.KNOWN_NOT_IMPLEMENTED_LOW_VALUE,
            'findingsEslint': findings.get('eslint', {}).get(rule, 0),
            'findingsOxlint': findings.get('oxlint', {}).get(rule, 0),
            'fixture': fixtures.get(rule, {}).get('fixture'),
            'portPlan': ruleMap.PORT_PLAN.get(rule),
        }
    return inventory


def flag(entry):
    """How the rule runs on the oxlint side (or what it would take to get it there)."""
    if entry['status'] == 'eslint-only':
        plan = entry['portPlan']
        return plan['effort'] if plan else ('low-value' if entry['lowValue'] else 'UNPLANNED')
    if entry['jsPlugin']:
        return f'js:{entry["jsPlugin"]}'
    # a schema miss is not proof of absence -- oxlint 1.77's schema omits whole working plugins
    return 'native' if entry['inOxlintSchema'] else 'native?'


def main():
    inventory = build()
    by_status = collections.Counter(e['status'] for e in inventory.values())

    header = f'{"rule":58} {"status":12} {"impl":12} {"type?":6} {"eslint":>7} {"oxlint":>7}  fixture'
    print(header)
    print('-' * len(header))
    for rule, entry in inventory.items():
        type_col = '' if not entry['typeAware'] else ('type' if entry['typeAwareImplemented'] else 'type!')
        print(
            f'{rule:58} {entry["status"]:12} {flag(entry):12} {type_col:6} '
            f'{entry["findingsEslint"]:7} {entry["findingsOxlint"]:7}  {entry["fixture"] or ""}'
        )

    print()
    print(f'Totals: {len(inventory)} rules -- ' + ', '.join(f'{k}={v}' for k, v in sorted(by_status.items())))
    by_impl = collections.Counter(flag(e) for e in inventory.values() if e['status'] != 'eslint-only')
    print('Oxlint side: ' + ', '.join(f'{k}={v}' for k, v in sorted(by_impl.items())))
    covered = sum(1 for e in inventory.values() if e['fixture'])
    unproven = sum(1 for e in inventory.values() if flag(e) == 'native?' and not e['fixture'])
    print(f'Fixture coverage: {covered}/{len(inventory)} rules have an example file')
    print(f"Rules missing from oxlint's schema and without a fixture (unproven, not necessarily broken): {unproven}")
    unplanned = [r for r, e in inventory.items() if flag(e) == 'UNPLANNED']
    if unplanned:
        print(f'ESLint-only rules with no port plan ({len(unplanned)}): {", ".join(unplanned)}')
    else:
        print('Every ESLint-only rule has a port plan or is classified low-value.')

    out = None
    if '--json' in sys.argv:
        idx = sys.argv.index('--json')
        out = sys.argv[idx + 1] if len(sys.argv) > idx + 1 else os.path.join(ROOT, 'oxlint-probe/rule-inventory.json')
    if out:
        json.dump(inventory, open(out, 'w'), indent=2, sort_keys=True)
        print(f'Wrote {out}')


if __name__ == '__main__':
    main()

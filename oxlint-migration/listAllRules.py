"""Inventory of every lint rule this repo runs, on either tool.

    python3 oxlint-migration/listAllRules.py [--json oxlint-migration/rule-inventory.json]
    python3 oxlint-migration/listAllRules.py --available [--all] [--json <path>]

Default mode: rules this repo *enables*, per tool. Unlike compareFullRepo.py, which can
only see rules that currently produce findings, this walks both configs and lists every
enabled rule -- shared, ESLint-only and oxlint-only -- with the data needed to build a
per-rule fixture suite:

    status      shared / eslint-only / oxlint-only
    native      does oxlint implement the rule itself (vs. hosting ESLint's via jsPlugins)
    type-aware  does the rule need TypeScript types (tsgolint), and does tsgolint have it
    findings    current violation counts from the cached full-repo reports, when present
    fixture     the example file that proves the rule behaves the same on both tools

`--available` mode answers a different question: for the rules ESLint enforces, does
oxlint even have a rule for it? ESLint's side is read from the real flat config's registered
plugins plus its core rules; oxlint's side is its native catalogue plus everything its
jsPlugins host. Rules ESLint has installed but switched off are hidden -- they need no
migration decision -- so the interesting output is the "available in oxlint but not enabled
there yet" list. Pass `--all` to see everything, including oxlint-only rules.

The JSON dump is the machine-readable input for the fixture harness in
oxlint-migration/port-probe (see compareFixtures.py).
"""

import collections
import json
import os
import sys

import ruleMap
from ruleMap import ROOT

FIXTURE_MANIFEST = os.path.join(ROOT, 'oxlint-migration/port-probe/fixtures.manifest.json')


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


def dump_json(inventory, default_name='rule-inventory.json'):
    """Writes the inventory when --json is passed (with an optional explicit path)."""
    if '--json' not in sys.argv:
        return
    index = sys.argv.index('--json')
    candidate = sys.argv[index + 1] if len(sys.argv) > index + 1 else None
    out = candidate if candidate and not candidate.startswith('-') else os.path.join(ROOT, 'oxlint-migration', default_name)
    json.dump(inventory, open(out, 'w'), indent=2, sort_keys=True)
    print(f'Wrote {out}')


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


def build_available():
    """Installed-rule inventory: what each tool *has*, independent of the repo's configs."""
    es_installed = ruleMap.eslint_installed_rules()
    ox_available = ruleMap.oxlint_available_rules()
    es_enabled = ruleMap.eslint_enabled_rules(fold_extension_rules=False)
    ox_enabled = ruleMap.oxlint_enabled_rules()
    ox_disabled = ruleMap.oxlint_disabled_rules()

    def counterpart(rule):
        if rule in ox_available:
            return rule
        if rule.startswith('@typescript-eslint/'):
            base = rule.split('/', 1)[1]
            if base in ruleMap.TS_EXTENSION_RULES and base in ox_available:
                return base
        return None

    inventory = {}
    for rule, source in sorted(es_installed.items()):
        match = counterpart(rule)
        inventory[rule] = {
            'eslintSource': source,
            'oxlintRule': match,
            'oxlintSource': ox_available.get(match) if match else None,
            'eslintEnabled': rule in es_enabled,
            'oxlintEnabled': (match in ox_enabled) if match else False,
            'oxlintOffIn': ox_disabled.get(match) if match else None,
            'portPlan': ruleMap.PORT_PLAN.get(rule),
        }
    matched = {entry['oxlintRule'] for entry in inventory.values() if entry['oxlintRule']}
    for rule, source in sorted(ox_available.items()):
        if rule in matched or rule in inventory:
            continue
        inventory[rule] = {
            'eslintSource': None,
            'oxlintRule': rule,
            'oxlintSource': source,
            'eslintEnabled': False,
            'oxlintEnabled': rule in ox_enabled,
            'oxlintOffIn': ox_disabled.get(rule),
            'portPlan': None,
        }
    return inventory


def print_available(inventory, show_all=False):
    """Prints the availability comparison.

    By default only rules ESLint actually enables are listed: a rule ESLint has installed
    but switched off needs no migration decision at all. `--all` restores the full list
    (adds the switched-off ESLint rules and the oxlint rules ESLint has no equivalent for).
    """
    hidden = 0 if show_all else sum(1 for e in inventory.values() if not e['eslintEnabled'])
    rows = {rule: entry for rule, entry in sorted(inventory.items()) if show_all or entry['eslintEnabled']}

    header = f'{"rule":58} {"eslint has":14} {"oxlint has":22} {"oxlint enabled":14}'
    print(header)
    print('-' * len(header))
    for rule, entry in rows.items():
        state = 'yes' if entry['oxlintEnabled'] else ('available' if entry['oxlintSource'] else 'no rule')
        print(f'{rule:58} {entry["eslintSource"] or "-":14} {entry["oxlintSource"] or "-":22} {state:14}')

    both = [r for r, e in rows.items() if e['eslintSource'] and e['oxlintSource']]
    es_only = [r for r, e in rows.items() if e['eslintSource'] and not e['oxlintSource']]
    ox_only = [r for r, e in rows.items() if not e['eslintSource'] and e['oxlintSource']]
    print()
    scope = 'installed' if show_all else 'rules ESLint enables'
    print(f'{scope.capitalize()}: {len(rows)} total -- oxlint has {len(both)}, oxlint has no counterpart for {len(es_only)}')
    if ox_only:
        print(f'  Oxlint-only (oxlint can run, ESLint has no such rule): {len(ox_only)}')
    if hidden:
        print(f'  Hidden: {hidden} rules ESLint has installed but does not enable (pass --all to show them)')

    available_not_on = [r for r, e in rows.items() if e['eslintEnabled'] and e['oxlintSource'] and not e['oxlintEnabled']]
    if available_not_on:
        print(f'  Enabled in ESLint, available in oxlint, NOT enabled there yet ({len(available_not_on)}) -- the actionable list.')
        print('  Each is off for a specific reason, never because it currently reports nothing:')
        for rule in available_not_on:
            entry = inventory[rule]
            plan = entry['portPlan'] or {}
            marked = f'off in {entry["oxlintOffIn"]}' if entry['oxlintOffIn'] else 'NOT IN CONFIG'
            print(f'    {rule:50} {entry["oxlintSource"]:12} {marked:16} [{plan.get("effort", "?")}] {plan.get("mechanism", "no PORT_PLAN entry")}')
    if es_only:
        by_prefix = collections.Counter(r.split('/')[0] if '/' in r else '<core>' for r in es_only)
        print('  No oxlint counterpart, grouped by plugin:')
        for prefix, count in by_prefix.most_common():
            print(f'    {prefix:36} {count}')
    return rows


def main():
    if '--available' in sys.argv:
        inventory = build_available()
        rows = print_available(inventory, show_all='--all' in sys.argv)
        dump_json(rows, default_name='rule-availability.json')
        return
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

    dump_json(inventory)


if __name__ == '__main__':
    main()

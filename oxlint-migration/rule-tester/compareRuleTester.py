"""Replays the upstream RuleTester cases for every custom rule through BOTH linters.

    python3 oxlint-migration/rule-tester/compareRuleTester.py [--keep] [--rule <name>]

Oxlint runs the repo's custom rules by loading the real ESLint rule modules into a Node sidecar.
The rule code is shared; the AST it runs against is not, because oxlint builds its own tree and
bridges it to the ESLint rule API. A rule can therefore load, run, report nothing, and look fine.

Nothing else in the probe suite closes that gap: compare-oxlint proves parity only for the rules
that have violations in src/ (3 of the 35 custom rules), oxlint-rule-availability proves a rule is
configured, and the fixture harness covers 1 custom rule. This replays ~400 upstream cases instead.

Three assertions per case, in this order, because the order is what makes a failure diagnosable:

  1. MATERIALIZATION -- ESLint reports what the upstream case says it should. Catches this harness
     writing a case out wrongly, e.g. dropping a `filename` a rule branches on.
  2. BRIDGE          -- oxlint reports the same (file, line) set as ESLint. This is the real check.
  3. MESSAGE         -- oxlint's text matches ESLint's after normalization. Reworded is fine, vaguer
     is not: a difference needs an EXPECTED_MESSAGE_DIFFS entry, and even then the message must be
     non-empty and still name every piece of code ESLint's names, so it points at the same problem.

A rule that reports nothing across all of its invalid cases fails as SILENT, on either tool. Valid
cases must stay clean on both, so a bridge false positive fails too.

Scope: rule behavior on the bridge. Config scope, severity and ignores belong to
oxlint-rule-availability and compare-oxlint and are deliberately not re-tested here.

The materialized tree is deliberately NOT in .gitignore, and the reason is worth knowing: oxlint
1.78 honors .gitignore even under --no-ignore, so a gitignore entry for the tree makes oxlint
report "No files found to lint" and the whole harness silently pass on nothing. The tree is deleted
at the end of every run instead, in a finally.
"""

import argparse
import collections
import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
TREE = os.path.join(HERE, 'tree')

sys.path.insert(0, os.path.join(ROOT, 'oxlint-migration'))
from ruleMap import is_on, load_jsonc

EXPECTED_MESSAGE_DIFFS = {
}

EXPECTED_BRIDGE_DIFFS = {
    ('prefer-locale-compare-from-context', 'valid-1'): (
        'the receiver is an object literal with no localeCompare of its own. ESLint asks the type '
        'checker and stays silent; the type-free rewrite oxlint runs cannot, so it reports. Measured '
        'divergence, asserted in full by oxlint-migration/checkLocaleComparePort.py'
    ),
}

CODE_TOKEN = re.compile(r"[`'\"]([A-Za-z_$][\w$.]*)[`'\"]|\b([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+(?:\(\))?|[A-Za-z_$][\w$]*\(\))")


def code_tokens(text):
    return {quoted or bare for quoted, bare in CODE_TOKEN.findall(text or '')}


def enabled_custom_rules():
    """Custom rules enabled anywhere in .oxlintrc.json, with the option value used there.

    Rules that are `off` everywhere are out of scope on purpose: they are off because they are
    blocked upstream, and testing a rule the config does not run would prove nothing.
    """
    config = load_jsonc(os.path.join(ROOT, '.oxlintrc.json'))
    scopes = [config.get('rules', {})] + [override.get('rules', {}) for override in config.get('overrides', [])]
    rules = {}
    for scope in scopes:
        for rule_id, value in scope.items():
            if rule_id.startswith('rulesdir/') and is_on(value):
                rules[rule_id.split('/', 1)[1]] = value
    return dict(sorted(rules.items()))


def build_tree(rules):
    if os.path.exists(TREE):
        shutil.rmtree(TREE)
    os.makedirs(TREE)
    rules_path = os.path.join(TREE, 'wanted.json')
    with open(rules_path, 'w') as handle:
        json.dump(rules, handle)
    out = subprocess.run(['node', os.path.join(HERE, 'buildTree.mjs'), TREE, rules_path], capture_output=True, text=True, cwd=ROOT)
    if out.returncode != 0:
        sys.exit(f'harvest failed:\n{out.stdout[-3000:]}{out.stderr[-3000:]}')
    os.remove(rules_path)
    return json.loads(out.stdout.strip().splitlines()[-1])


def oxlint_findings():
    out = subprocess.run(
        ['npx', 'oxlint', '-c', 'oxlint.json', '--no-ignore', '--format', 'json', '.'],
        capture_output=True,
        text=True,
        cwd=TREE,
    )
    try:
        diagnostics = json.loads(out.stdout)['diagnostics']
    except (json.JSONDecodeError, KeyError):
        sys.exit(f'oxlint run failed:\n{out.stdout[:1500]}{out.stderr[:1500]}')
    findings, crashes = [], []
    for diagnostic in diagnostics:
        code = diagnostic.get('code') or ''
        path = os.path.relpath(os.path.join(TREE, diagnostic['filename']), TREE).replace(os.sep, '/')
        # A diagnostic with no rule code is how a crashing JS plugin, or a parse error, surfaces.
        if not code:
            crashes.append((path, diagnostic.get('message', '')))
            continue
        match = re.match(r'^rulesdir\((.+)\)$', code)
        if not match:
            continue
        labels = diagnostic.get('labels') or []
        findings.append((path, labels[0]['span']['line'] if labels else 0, match.group(1), diagnostic.get('message', '')))
    return findings, crashes


def eslint_findings():
    out = subprocess.run(
        ['npx', 'eslint', '--no-config-lookup', '-c', os.path.join(HERE, 'eslint.ruleTester.config.mjs'), '--no-ignore', '--format', 'json', '.'],
        capture_output=True,
        text=True,
        cwd=TREE,
        env={**os.environ, 'RULE_TESTER_TREE': TREE, 'NODE_OPTIONS': '--max-old-space-size=8192'},
    )
    try:
        report = json.loads(out.stdout)
    except json.JSONDecodeError:
        sys.exit(f'eslint run failed:\n{out.stdout[:1500]}{out.stderr[:1500]}')
    findings, fatal_errors = [], []
    for result in report:
        path = os.path.relpath(result['filePath'], TREE).replace(os.sep, '/')
        for message in result['messages']:
            if message.get('fatal') or not message.get('ruleId'):
                fatal_errors.append((path, message.get('message', '')))
                continue
            findings.append((path, message['line'], message['ruleId'].split('/', 1)[1], message['message']))
    return findings, fatal_errors


def normalize(text):
    """Whitespace and quote style are not part of what a message says."""
    return re.sub(r'\s+', ' ', (text or '').replace('`', "'").replace('"', "'")).strip()


def message_verdict(rule, es_message, ox_message):
    """(ok, note) for one pair of messages."""
    if normalize(es_message) == normalize(ox_message):
        return True, None
    if rule not in EXPECTED_MESSAGE_DIFFS:
        return False, f'message differs and is not in EXPECTED_MESSAGE_DIFFS\n        eslint: {es_message}\n        oxlint: {ox_message}'
    if not normalize(ox_message):
        return False, 'oxlint reported an empty message'
    dropped = sorted(token for token in code_tokens(es_message) if token not in ox_message)
    if dropped:
        return False, f'oxlint message drops the code ESLint names, so it points at less: {dropped}\n        oxlint: {ox_message}'
    return True, f'wording differs, allowed: {EXPECTED_MESSAGE_DIFFS[rule]}'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--keep', action='store_true', help='leave the materialized tree in place for inspection')
    parser.add_argument('--rule', help='restrict the run to one rule, for iterating on a single failure')
    args = parser.parse_args()

    rules = enabled_custom_rules()
    if args.rule:
        if args.rule not in rules:
            sys.exit(f'{args.rule} is not an enabled custom rule. Enabled: {", ".join(rules)}')
        rules = {args.rule: rules[args.rule]}

    summary = build_tree(rules)
    print(f'Harvested {summary["rulesHarvested"]}/{summary["rulesWanted"]} enabled custom rules into {summary["files"]} files ({summary["invalid"]} invalid, {summary["valid"]} valid cases).')
    if summary['rulesWithoutTests']:
        print(f'  No upstream test, so untested here ({len(summary["rulesWithoutTests"])}): {", ".join(summary["rulesWithoutTests"])}')
    for missing in summary['missingTestDirs']:
        print(f'  No tests directory at {missing}, so its rules contribute no cases')
    if not summary['files']:
        shutil.rmtree(TREE, ignore_errors=True)
        sys.exit('nothing was harvested, so this run proves nothing')

    try:
        cases = json.load(open(os.path.join(TREE, 'cases.json')))
        ox, crashes = oxlint_findings()
        es, fatal_errors = eslint_findings()
    finally:
        if not args.keep:
            shutil.rmtree(TREE, ignore_errors=True)

    ox_by_file = collections.defaultdict(list)
    es_by_file = collections.defaultdict(list)
    for path, line, rule, message in ox:
        ox_by_file[path].append((line, rule, message))
    for path, line, rule, message in es:
        es_by_file[path].append((line, rule, message))

    failures = collections.defaultdict(list)
    notes = []
    counts = collections.defaultdict(lambda: {'cases': 0, 'es': 0, 'ox': 0})

    for case in cases:
        rule, path, expected = case['rule'], case['file'], case['expected']
        es_hits = sorted(hit for hit in es_by_file[path] if hit[1] == rule)
        ox_hits = sorted(hit for hit in ox_by_file[path] if hit[1] == rule)
        label = f'{rule} {case["kind"]}-{case["position"]}'
        counts[rule]['cases'] += 1
        counts[rule]['es'] += len(es_hits)
        counts[rule]['ox'] += len(ox_hits)

        if expected['count'] is not None and len(es_hits) != expected['count']:
            gated = case['memoizedByBoth'] and not es_hits and not ox_hits
            if gated:
                notes.append(f'{label}: suppressed on both tools, both React Compilers memoize this case (upstream expects {expected["count"]}, and did before the processor existed)')
            else:
                failures['MATERIALIZATION'].append(f'{label}: upstream expects {expected["count"]} error(s), ESLint reported {len(es_hits)} ({case["testFile"]})')
            continue
        for position, wanted_message in enumerate(expected['messages']):
            if wanted_message and position < len(es_hits) and normalize(wanted_message) != normalize(es_hits[position][2]):
                failures['MATERIALIZATION'].append(f'{label}: upstream expects "{wanted_message}", ESLint reported "{es_hits[position][2]}"')

        if [line for line, _, _ in es_hits] != [line for line, _, _ in ox_hits]:
            key = (rule, f'{case["kind"]}-{case["position"]}')
            if key in EXPECTED_BRIDGE_DIFFS:
                notes.append(f'{label}: eslint {[h[0] for h in es_hits]} vs oxlint {[h[0] for h in ox_hits]}, accepted -- {EXPECTED_BRIDGE_DIFFS[key]}')
            else:
                failures['BRIDGE'].append(f'{label}: eslint lines {[h[0] for h in es_hits]} vs oxlint lines {[h[0] for h in ox_hits]}')
            continue

        for (_, _, es_message), (_, _, ox_message) in zip(es_hits, ox_hits):
            ok, note = message_verdict(rule, es_message, ox_message)
            if not ok:
                failures['MESSAGE'].append(f'{label}: {note}')
            elif note:
                notes.append(f'{label}: {note}')

    for path, message in crashes:
        failures['OXLINT-CRASH'].append(f'{path}: {message.splitlines()[0] if message else "(no message)"}')
    for path, message in fatal_errors:
        failures['ESLINT-FATAL'].append(f'{path}: {message.splitlines()[0] if message else "(no message)"}')

    print(f'\n{"rule":58} {"cases":>5} {"eslint":>7} {"oxlint":>7}  verdict')
    for rule in sorted(counts):
        row = counts[rule]
        if row['es'] == 0:
            verdict = 'SILENT on ESLint too -- the cases or this harness are wrong'
            failures['SILENT'].append(f'{rule}: no ESLint findings across {row["cases"]} cases')
        elif row['ox'] == 0:
            verdict = 'SILENT on oxlint -- the rule does not run on the bridge'
            failures['SILENT'].append(f'{rule}: ESLint {row["es"]} findings, oxlint 0')
        elif row['es'] == row['ox']:
            verdict = 'parity'
        elif any(key[0] == rule for key in EXPECTED_BRIDGE_DIFFS):
            verdict = 'differs only where EXPECTED_BRIDGE_DIFFS says it may'
        else:
            verdict = 'counts differ'
        print(f'{rule:58} {row["cases"]:5} {row["es"]:7} {row["ox"]:7}  {verdict}')

    if notes:
        print(f'\nAllowed differences ({len(notes)}):')
        for note in notes:
            print(f'  {note}')

    print()
    if failures:
        total = sum(len(items) for items in failures.values())
        print(f'{total} failure(s):')
        for bucket in sorted(failures):
            print(f'  {bucket} ({len(failures[bucket])}):')
            for item in failures[bucket]:
                print(f'    {item}')
        sys.exit(1)
    print(f'All {len(counts)} custom rules behave identically on both tools across {len(cases)} harvested cases.')


if __name__ == '__main__':
    main()

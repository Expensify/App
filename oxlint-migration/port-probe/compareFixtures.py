"""Per-rule parity harness: one example file per rule, linted by both tools.

    python3 oxlint-migration/port-probe/compareFixtures.py

The full-repo comparison (oxlint-migration/compareFullRepo.py) can only prove parity for
rules that currently have violations, and the config coverage check can only prove a
rule is *configured*. Neither can tell whether a configured rule actually runs: oxlint
silently accepts unknown rules inside `overrides`, and its JSON schema omits plugins
the binary does implement. A fixture answers that directly.

Each entry in fixtures.manifest.json names the rule, the file that violates it, the id
oxlint reports it under, and how many findings to expect. The run fails if a rule is
silent on either side or if the two tools disagree on (file, line, rule).
"""

import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
MANIFEST = json.load(open(os.path.join(HERE, 'fixtures.manifest.json')))


def oxlint_findings():
    out = subprocess.run(
        ['npx', 'oxlint', '-c', 'oxlint.fixtures.json', '--no-ignore', '--format', 'json', 'fixtures'],
        capture_output=True, text=True, cwd=HERE,
    )
    try:
        diagnostics = json.loads(out.stdout)['diagnostics']
    except (json.JSONDecodeError, KeyError):
        sys.exit(f'oxlint run failed:\n{out.stdout[:500]}{out.stderr[:500]}')
    findings = set()
    for diagnostic in diagnostics:
        match = re.match(r'^([\w@/.-]+)\((.+)\)$', diagnostic.get('code', ''))
        rule = f'{match.group(1)}/{match.group(2)}' if match else diagnostic.get('code', '')
        line = diagnostic['labels'][0]['span']['line'] if diagnostic.get('labels') else 0
        findings.add((os.path.basename(diagnostic['filename']), line, rule))
    return findings


def eslint_findings():
    out = subprocess.run(
        ['npx', 'eslint', '--no-config-lookup', '-c', 'eslint.fixtures.config.mjs', '--no-ignore', '--format', 'json', 'fixtures'],
        capture_output=True, text=True, cwd=HERE,
    )
    try:
        report = json.loads(out.stdout)
    except json.JSONDecodeError:
        sys.exit(f'eslint run failed:\n{out.stdout[:500]}{out.stderr[:500]}')
    return {(os.path.basename(f['filePath']), m['line'], m['ruleId']) for f in report for m in f['messages']}


def main():
    ox = oxlint_findings()
    es = eslint_findings()

    failures = []
    print(f'{"rule":56} {"eslint":>7} {"oxlint":>7} {"expected":>9}  verdict')
    for rule, entry in MANIFEST.items():
        fixture = os.path.basename(entry['fixture'])
        es_hits = {f for f in es if f[0] == fixture and f[2] == rule}
        ox_hits = {f for f in ox if f[0] == fixture and f[2] == entry['oxlintRule']}
        expected = entry['expected']
        es_lines = sorted(line for _, line, _ in es_hits)
        ox_lines = sorted(line for _, line, _ in ox_hits)
        accepted_ox_lines = entry.get('oxlintLines')
        if len(es_hits) != expected:
            verdict, ok = f'FAIL: eslint found {len(es_hits)}, fixture claims {expected}', False
        elif accepted_ox_lines is not None and not entry.get('whyOxlintLines'):
            verdict, ok = 'FAIL: oxlintLines needs a whyOxlintLines saying why the anchors differ', False
        elif accepted_ox_lines is not None:
            if ox_lines != sorted(accepted_ox_lines):
                verdict, ok = f'FAIL: oxlint {ox_lines}, manifest accepts {sorted(accepted_ox_lines)}', False
            else:
                verdict, ok = f'parity, anchor differs (eslint {es_lines})', True
        elif es_lines != ox_lines:
            verdict, ok = f'FAIL: lines differ (eslint {es_lines} vs oxlint {ox_lines})', False
        else:
            verdict, ok = 'parity', True
        if not ok:
            failures.append(rule)
        print(f'{rule:56} {len(es_hits):7} {len(ox_hits):7} {expected:9}  {verdict}')

    print()
    stray_ox = {f for f in ox if f[2] not in {e['oxlintRule'] for e in MANIFEST.values()}}
    stray_es = {f for f in es if f[2] not in MANIFEST}
    if stray_ox or stray_es:
        print(f'Findings outside the manifest (harmless, but review): oxlint={len(stray_ox)}, eslint={len(stray_es)}')
    if failures:
        print(f'{len(failures)}/{len(MANIFEST)} rules FAILED: {", ".join(failures)}')
        sys.exit(1)
    print(f'All {len(MANIFEST)} rules behave identically on both tools.')


if __name__ == '__main__':
    main()

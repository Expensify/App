"""Per-rule parity harness: one example file per rule, linted by both tools.

    python3 oxlint-migration/port-probe/compareFixtures.py [--filter=<substr>] [--bless]

The full-repo comparison (oxlint-migration/compareFullRepo.py) can only prove parity for
rules that currently have violations, and the config coverage check can only prove a
rule is *configured*. Neither can tell whether a configured rule actually runs: oxlint
silently accepts unknown rules inside `overrides`, and its JSON schema omits plugins
the binary does implement. A fixture answers that directly.

Each entry in fixtures.manifest.json names the rule, the file that violates it, the id
oxlint reports it under, and how many findings to expect. The run fails if a rule is
silent on either side or if the two tools disagree on (file, line, rule).

Fixtures can also arrive as shards under fragments/: every <batch>.manifest.json merges
into the manifest (duplicate keys fail the run), every <batch>.eslint.mjs exports an
array of ESLint flat-config objects appended to the probe config, and every
<batch>.oxlint.json contributes {"rules", "jsPlugins", "overrides", "flags"} to a
generated oxlint.fixtures.merged.json. Shards are how batches land without two authors
editing one shared config.

--filter selects manifest entries whose rule id or fixture name contains the substring,
and restricts both tools to just those fixture files. --bless fills an entry whose
"expected" is null with the ESLint finding count and writes the shard that owns it;
expected counts must come from ESLint while ESLint still exists as the oracle.
"""

import argparse
import glob
import json
import os
import re
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
FRAGMENT_DIR = os.path.join(HERE, 'fragments')
# OXPROBE_TAG lets a concurrent batch write its own merged config instead of racing another batch
# for the shared generated file. The real path (no tag) is what compareFullRepo and CI read.
MERGED_OXLINT_CONFIG = os.path.join(HERE, f"oxlint.fixtures.merged{os.environ.get('OXPROBE_TAG', '')}.json")

sys.path.insert(0, os.path.join(HERE, '..'))
from ruleMap import load_jsonc  # noqa: E402


def load_manifest():
    """fixtures.manifest.json plus every fragments/*.manifest.json, with per-entry origin."""
    manifest, origin = {}, {}

    def absorb(entries, path):
        for rule, entry in entries.items():
            if rule in manifest:
                sys.exit(f'duplicate manifest entry "{rule}": {origin[rule]} and {path}')
            manifest[rule], origin[rule] = entry, path
        return entries

    absorb(json.load(open(os.path.join(HERE, 'fixtures.manifest.json'))), os.path.join(HERE, 'fixtures.manifest.json'))
    for path in sorted(glob.glob(os.path.join(FRAGMENT_DIR, '*.manifest.json'))):
        with open(path) as handle:
            absorb(json.load(handle), path)
    return manifest, origin


def build_oxlint_config():
    """Merge the base probe config with every fragments/*.oxlint.json into one real file."""
    base = load_jsonc(os.path.join(HERE, 'oxlint.fixtures.json'))
    base.pop('$schema', None)
    flags = set()
    for path in sorted(glob.glob(os.path.join(FRAGMENT_DIR, '*.oxlint.json'))):
        with open(path) as handle:
            fragment = json.load(handle)
        base.setdefault('rules', {}).update(fragment.get('rules', {}))
        base['jsPlugins'] = base.get('jsPlugins', []) + fragment.get('jsPlugins', [])
        base['overrides'] = base.get('overrides', []) + fragment.get('overrides', [])
        flags.update(fragment.get('flags', []))
    if '--type-aware' in flags:
        base.setdefault('options', {})['typeAware'] = True
    with open(MERGED_OXLINT_CONFIG, 'w') as handle:
        json.dump(base, handle, indent=4)
        handle.write('\n')
    return MERGED_OXLINT_CONFIG, sorted(flags)


def oxlint_findings(config, flags, targets):
    out = subprocess.run(
        ['npx', 'oxlint', '-c', os.path.basename(config), *flags, '--no-ignore', '--format', 'json', *targets],
        capture_output=True, text=True, cwd=HERE,
    )
    try:
        diagnostics = json.loads(out.stdout)['diagnostics']
    except (json.JSONDecodeError, KeyError):
        sys.exit(f'oxlint run failed:\n{out.stdout[:2000]}\n{out.stderr[:2000]}')
    findings = set()
    for diagnostic in diagnostics:
        match = re.match(r'^([\w@/.-]+)\((.+)\)$', diagnostic.get('code', ''))
        rule = f'{match.group(1)}/{match.group(2)}' if match else diagnostic.get('code', '')
        line = diagnostic['labels'][0]['span']['line'] if diagnostic.get('labels') else 0
        findings.add((os.path.basename(diagnostic['filename']), line, rule))
    return findings


def eslint_findings(targets):
    out = subprocess.run(
        ['npx', 'eslint', '--no-config-lookup', '-c', 'eslint.fixtures.config.mjs', '--no-ignore', '--format', 'json', *targets],
        capture_output=True, text=True, cwd=HERE,
    )
    try:
        report = json.loads(out.stdout)
    except json.JSONDecodeError:
        sys.exit(f'eslint run failed:\n{out.stdout[:2000]}\n{out.stderr[:2000]}')
    return {(os.path.basename(f['filePath']), m['line'], m['ruleId']) for f in report for m in f['messages']}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--filter', help='only entries whose rule id or fixture name contains this substring')
    parser.add_argument('--bless', action='store_true', help='fill expected=null from the ESLint count and rewrite the owning file')
    args = parser.parse_args()

    manifest, origin = load_manifest()
    if args.filter:
        manifest = {rule: entry for rule, entry in manifest.items() if args.filter in rule or args.filter in entry['fixture']}
    if not manifest:
        sys.exit(f'no manifest entries selected (filter={args.filter!r}) -- refusing to pass on zero fixtures')

    targets = sorted({f'fixtures/{os.path.basename(entry["fixture"])}' for entry in manifest.values()})
    missing = [t for t in targets if not os.path.isfile(os.path.join(HERE, t))]
    if missing:
        sys.exit(f'manifest names fixture files that do not exist: {", ".join(missing)}')

    config, flags = build_oxlint_config()
    ox = oxlint_findings(config, flags, targets)
    es = eslint_findings(targets)
    linter_files = {os.path.basename(t) for t in targets}
    if not ox and not es and all(entry.get('expected') == 0 for entry in manifest.values()):
        print(f'warning: neither tool reported anything across {len(linter_files)} fixture files')

    failures, blessed = [], {}
    print(f'{"rule":56} {"eslint":>7} {"oxlint":>7} {"expected":>9}  verdict')
    for rule, entry in manifest.items():
        fixture = os.path.basename(entry['fixture'])
        es_hits = {f for f in es if f[0] == fixture and f[2] == rule}
        ox_hits = {f for f in ox if f[0] == fixture and f[2] == entry['oxlintRule']}
        expected = entry['expected']
        if expected is None:
            if args.bless and not es_hits and not entry.get('oxlintOnly'):
                # Blessing 0 would pin "ESLint found nothing" as the oracle, and 0-vs-0 then reads as
                # parity forever: the fixture proves the rule runs on neither tool. Every way of ending
                # up here is a bug to fix rather than record -- a fixture whose shape no longer violates
                # the rule, or a manifest keyed by the oxlint id so the ESLint side matches nothing.
                failures.append(rule)
                print(f'{rule:56} {len(es_hits):7} {len(ox_hits):7} {"null":>9}  FAIL: refusing to bless 0 -- ESLint is silent, so this fixture proves nothing')
                continue
            if args.bless:
                expected = entry['expected'] = len(es_hits)
                blessed.setdefault(origin[rule], {})[rule] = entry
            else:
                failures.append(rule)
                print(f'{rule:56} {len(es_hits):7} {len(ox_hits):7} {"null":>9}  FAIL: expected is null, run with --bless')
                continue
        es_lines = sorted(line for _, line, _ in es_hits)
        ox_lines = sorted(line for _, line, _ in ox_hits)
        accepted_ox_lines = entry.get('oxlintLines')
        divergence = entry.get('expectedOxlint') is not None or entry.get('oxlintOnly')
        if len(es_hits) != expected:
            verdict, ok = f'FAIL: eslint found {len(es_hits)}, fixture claims {expected}', False
        elif entry.get('blockedUpstream'):
            # The fixture still proves ESLint reports (checked above); oxlint cannot, for a reason
            # written down in the entry. Asserted as zero rather than skipped, so this flips to a
            # failure the day upstream makes it reportable, which is the signal to act.
            if ox_hits:
                verdict, ok = f'FAIL: oxlint now reports {ox_lines} -- upstream fixed it, drop blockedUpstream and re-enable the rule', False
            else:
                verdict, ok = 'blocked upstream, oxlint silent as recorded', True
        elif divergence:
            # An intentional one-sided rule: oxlintOnly pins ESLint at 0, or expectedOxlint pins any
            # count. Deliberate strictness stays a pinned divergence, so drift on EITHER side trips.
            if not entry.get('whyOxlintDivergence'):
                verdict, ok = 'FAIL: expectedOxlint/oxlintOnly needs a whyOxlintDivergence', False
            elif entry.get('oxlintOnly') and entry['expected'] != 0:
                verdict, ok = 'FAIL: oxlintOnly means eslint expected 0', False
            else:
                want = len(es_hits) if entry.get('oxlintOnly') and entry.get('expectedOxlint') is None else entry['expectedOxlint']
                if want is None:
                    verdict, ok = 'FAIL: oxlintOnly needs expectedOxlint (from the oxlint column of a first run)', False
                elif len(ox_hits) != want:
                    verdict, ok = f'FAIL: oxlint found {len(ox_hits)} ({ox_lines}), fixture claims {want}', False
                else:
                    verdict, ok = f'intentional divergence, oxlint {ox_lines} vs eslint {es_lines}', True
        elif accepted_ox_lines is not None and not entry.get('whyOxlintLines'):
            verdict, ok = 'FAIL: oxlintLines needs a whyOxlintLines saying why the anchors differ', False
        elif accepted_ox_lines is not None:
            if ox_lines != sorted(accepted_ox_lines):
                verdict, ok = f'FAIL: oxlint {ox_lines}, manifest accepts {sorted(accepted_ox_lines)}', False
            else:
                verdict, ok = 'parity, anchor differs (eslint {es_lines})'.replace('{es_lines}', str(es_lines)), True
        elif es_lines != ox_lines:
            verdict, ok = f'FAIL: lines differ (eslint {es_lines} vs oxlint {ox_lines})', False
        else:
            verdict, ok = 'parity', True
        if not ok:
            failures.append(rule)
        print(f'{rule:56} {len(es_hits):7} {len(ox_hits):7} {expected:9}  {verdict}')

    if args.bless and blessed:
        for path, entries in blessed.items():
            doc = json.load(open(path))
            doc.update(entries)
            with open(path, 'w') as handle:
                json.dump(doc, handle, indent=4, sort_keys=False)
                handle.write('\n')
        count = sum(len(v) for v in blessed.values())
        print(f'\nblessed {count} entries from the ESLint run into {len(blessed)} file(s).')

    print()
    claimed = {e['oxlintRule'] for e in manifest.values()} | set(manifest)
    stray_ox = {f for f in ox if f[0] in linter_files and f[2] not in claimed}
    stray_es = {f for f in es if f[0] in linter_files and f[2] not in claimed}
    if stray_ox or stray_es:
        print(f'Findings outside the manifest (harmless, but review): oxlint={len(stray_ox)}, eslint={len(stray_es)}')
    if failures:
        print(f'{len(failures)}/{len(manifest)} rules FAILED: {", ".join(failures)}')
        sys.exit(1)
    blocked = [rule for rule, entry in manifest.items() if entry.get('blockedUpstream')]
    divergent = [rule for rule, entry in manifest.items() if entry.get('expectedOxlint') is not None or entry.get('oxlintOnly')]
    if blocked or divergent:
        print(f'{len(manifest) - len(blocked) - len(divergent)} rules behave identically on both tools.')
        if divergent:
            print(f'{len(divergent)} pinned intentional divergences: {", ".join(divergent)}')
        if blocked:
            print(f'{len(blocked)} blocked upstream, oxlint silent by known cause: {", ".join(blocked)}')
    else:
        print(f'All {len(manifest)} rules behave identically on both tools.')


if __name__ == '__main__':
    main()

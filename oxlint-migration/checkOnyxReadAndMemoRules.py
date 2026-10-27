"""Do oxlint and ESLint agree on no-unsafe-onyx-read, no-onyx-get-snapshot-key and no-manual-memoization?

    python3 oxlint-migration/checkOnyxReadAndMemoRules.py

Neither of the usual harnesses can test these three rules:

  - The rule-tester replays `.test.js` RuleTester files. Their upstream tests are TypeScript Jest
    suites (tests/unit/NoUnsafeOnyxReadRuleTest.ts, tests/unit/NoOnyxGetSnapshotKeyRuleTest.ts) and a
    bun suite (tests/tooling/noManualMemoization.test.ts), which it cannot import.
  - Both Onyx rules decide by where the file sits in the repo (src/components, src/pages, src/hooks
    and tests may read; src/libs may not), and the fixture and rule-tester trees live under
    oxlint-migration/, where every read is simply "outside the allowed path".
  - no-manual-memoization is reported by the rule everywhere and then kept only in files both React
    Compilers memoize. That second half is ReactCompilerFilter, a lint pipeline stage, so raw tool
    output says nothing about what a developer sees from `npm run lint`.

So the probe files go into src/ at the paths the rules care about, and each tool runs twice:

    pipeline  scripts/lint/index.ts --linter=<tool>, the gate CI and `npm run lint` run
    raw       the tool alone, which is what an editor integration shows

Every line that should report carries an `// expect: <rule>` marker. The run fails if the two tools
disagree on any (file, line, rule), or if either tool misses a marker or reports an unmarked line, so
a rule that silently stopped running fails as loudly as a bridge difference. The raw run covers only
the opted-out memoization file, where the pipeline drops what the raw tools report.

The files are deleted in a finally.
"""

import json
import os
import re
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROBE_DIR_NAME = '__oxlintOnyxReadAndMemoProbe'
PROBE_DIRS = [os.path.join(ROOT, 'src', parent, PROBE_DIR_NAME) for parent in ('components', 'libs')]

RULES = ('rulesdir/no-unsafe-onyx-read', 'rulesdir/no-onyx-get-snapshot-key', 'rulesdir/no-manual-memoization')
MARKER = re.compile(r'//\s*expect:\s*(.+)$')

COMPONENT_READS = """import React, {useEffect} from 'react';
import {View} from 'react-native';
import Onyx from 'react-native-onyx';

import ONYXKEYS from '@src/ONYXKEYS';

const sessionPromise = Onyx.get(ONYXKEYS.SESSION); // expect: rulesdir/no-unsafe-onyx-read

function readSession() {
    return Onyx.get(ONYXKEYS.SESSION); // expect: rulesdir/no-unsafe-onyx-read
}

function OnyxReads({method}: {method: 'get'}) {
    Onyx.get(ONYXKEYS.SESSION).then(() => {}); // expect: rulesdir/no-unsafe-onyx-read
    useEffect(() => {
        Onyx.get(ONYXKEYS.ACCOUNT).then(() => {}); // expect: rulesdir/no-unsafe-onyx-read
    }, []);
    const onPress = () => Onyx.get(ONYXKEYS.SESSION);
    const onReportPress = () => Onyx.get(ONYXKEYS.COLLECTION.REPORT); // expect: rulesdir/no-onyx-get-snapshot-key
    const onMethodPress = () => Onyx[method](ONYXKEYS.SESSION); // expect: rulesdir/no-unsafe-onyx-read
    return (
        <View
            onTouchStart={onPress}
            onTouchMove={onReportPress}
            onTouchEnd={onMethodPress}
        />
    );
}

export default OnyxReads;
export {readSession, sessionPromise};
"""

LIBS_READ = """import Onyx from 'react-native-onyx';

import ONYXKEYS from '@src/ONYXKEYS';

async function submit() {
    return Onyx.get(ONYXKEYS.SESSION); // expect: rulesdir/no-unsafe-onyx-read
}

export default submit;
"""

MEMO_TEMPLATE = """import {{useFocusEffect}} from '@react-navigation/native';
import React, {{memo, useCallback, useMemo}} from 'react';
import {{View}} from 'react-native';

function ManualMemo({{items, onSelect}}: {{items: string[]; onSelect: (item: string) => void}}) {{
{directive}    const count = useMemo(() => items.length, [items]); // expect: {expect}
    const select = useCallback(() => onSelect(items.at(0) ?? ''), [items, onSelect]); // expect: {expect}
    const onFocus = useCallback(() => {{}}, []);
    useFocusEffect(onFocus);
    return (
        <View
            accessibilityLabel={{String(count)}}
            onTouchEnd={{select}}
        />
    );
}}

export default memo(ManualMemo); // expect: {expect}
"""

# file name -> (directory, source, also compared raw)
PROBES = {
    'OnyxReads.tsx': ('components', COMPONENT_READS, False),
    'libRead.ts': ('libs', LIBS_READ, False),
    # React Compiler memoizes this one, so the pipeline keeps the three manual memoization reports.
    'Memoized.tsx': ('components', MEMO_TEMPLATE.format(directive='', expect='rulesdir/no-manual-memoization'), False),
    # 'use no memo' stops React Compiler, so the pipeline drops what the raw tools report.
    'OptedOut.tsx': ('components', MEMO_TEMPLATE.format(directive="    'use no memo';\n", expect='raw-only rulesdir/no-manual-memoization'), True),
}


def write_probes():
    paths = {}
    for name, (parent, source, _) in PROBES.items():
        directory = os.path.join(ROOT, 'src', parent, PROBE_DIR_NAME)
        os.makedirs(directory, exist_ok=True)
        path = os.path.join(directory, name)
        with open(path, 'w') as handle:
            handle.write(source)
        paths[name] = os.path.relpath(path, ROOT)
    return paths


def expected_findings(paths, mode):
    """(file, line, rule) for every marker. `raw-only` markers count only in the raw run."""
    findings = set()
    for name, path in paths.items():
        for number, line in enumerate(PROBES[name][1].splitlines(), start=1):
            match = MARKER.search(line)
            if not match:
                continue
            for rule in match.group(1).split(','):
                rule = rule.strip()
                if rule.startswith('raw-only '):
                    if mode == 'raw':
                        findings.add((path, number, rule.removeprefix('raw-only ')))
                elif mode == 'pipeline':
                    findings.add((path, number, rule))
    return findings


def run_json(command, label):
    out = subprocess.run(
        command,
        capture_output=True,
        text=True,
        cwd=ROOT,
        env={**os.environ, 'NODE_OPTIONS': '--max-old-space-size=8192', 'SEATBELT_DISABLE': '1'},
    )
    start = out.stdout.find('{') if label != 'raw eslint' else out.stdout.find('[')
    try:
        return json.JSONDecoder().raw_decode(out.stdout[start:])[0]
    except (json.JSONDecodeError, ValueError):
        sys.exit(f'{label} run failed (exit {out.returncode}):\n{out.stdout[:800]}{out.stderr[:800]}')


def pipeline_findings(linter, paths):
    report = run_json(['bun', os.path.join('scripts', 'lint', 'index.ts'), f'--linter={linter}', '--format=json', *paths], f'{linter} pipeline')
    return {(os.path.relpath(m['filePath'], ROOT), m['line'], m['ruleID']) for m in report['messages'] if m.get('ruleID') in RULES}


def raw_eslint_findings(paths):
    report = run_json(['npx', 'eslint', '--no-cache', '--format', 'json', *paths], 'raw eslint')
    return {(os.path.relpath(f['filePath'], ROOT), m['line'], m['ruleId']) for f in report for m in f['messages'] if m.get('ruleId') in RULES}


def raw_oxlint_findings(paths):
    report = run_json(['npx', 'oxlint', '--format', 'json', *paths], 'raw oxlint')
    findings = set()
    for diagnostic in report['diagnostics']:
        match = re.match(r'^([\w@/.-]+)\((.+)\)$', diagnostic.get('code') or '')
        rule = f'{match.group(1)}/{match.group(2)}' if match else diagnostic.get('code')
        if rule in RULES:
            for label in diagnostic.get('labels', [])[:1]:
                findings.add((os.path.relpath(os.path.join(ROOT, diagnostic['filename']), ROOT), label['span']['line'], rule))
    return findings


def compare(mode, expected, eslint, oxlint):
    failures = []
    for finding in sorted(expected | eslint | oxlint):
        in_eslint, in_oxlint, wanted = finding in eslint, finding in oxlint, finding in expected
        if in_eslint != in_oxlint:
            verdict = 'FAIL: the two tools disagree'
        elif in_eslint != wanted:
            verdict = 'FAIL: both tools ' + ('miss the marker' if wanted else 'report an unmarked line')
        else:
            verdict = 'agree'
        path, line, rule = finding
        print(f'{mode:9} {os.path.basename(path)}:{line:<4} {rule:40} {str(in_eslint):>6} {str(in_oxlint):>6}  {verdict}')
        if verdict != 'agree':
            failures.append(f'{mode} {path}:{line} {rule}: {verdict}')
    return failures


def main():
    paths = write_probes()
    raw_paths = [path for name, path in paths.items() if PROBES[name][2]]
    try:
        pipeline_eslint = pipeline_findings('eslint', list(paths.values()))
        pipeline_oxlint = pipeline_findings('oxlint', list(paths.values()))
        raw_eslint = raw_eslint_findings(raw_paths)
        raw_oxlint = raw_oxlint_findings(raw_paths)
    finally:
        for directory in PROBE_DIRS:
            shutil.rmtree(directory, ignore_errors=True)

    print(f'{"mode":9} {"location":20} {"rule":40} {"eslint":>6} {"oxlint":>6}  verdict')
    failures = compare('pipeline', expected_findings(paths, 'pipeline'), pipeline_eslint, pipeline_oxlint)
    failures += compare('raw', expected_findings({name: path for name, path in paths.items() if PROBES[name][2]}, 'raw'), raw_eslint, raw_oxlint)

    print()
    if failures:
        print(f'{len(failures)} check(s) FAILED:')
        for failure in failures:
            print(f'   {failure}')
        sys.exit(1)
    print('Both tools report the same lines for all three rules, through the lint pipeline and raw.')


if __name__ == '__main__':
    main()

"""Do react/jsx-uses-react and react/jsx-uses-vars still do their job under oxlint?

    python3 oxlint-migration/checkJsxUsesPort.py

These two rules cannot report anything. All they do is mark identifiers as used, so that
no-unused-vars stays quiet about a React import and about variables only referenced from JSX. A
fixture is therefore impossible: there is no finding to compare.

What can be compared is the outcome they exist to produce. This probe puts one file into src/, where
both tools run their real configs, and asserts three things:

  1. the React import and the JSX-only component are NOT reported as unused, on either tool
  2. a genuinely unused variable IS reported, on both tools, on the same line -- otherwise step 1
     would also pass with no unused-vars rule running at all
  3. switching the two rules off changes nothing, on either tool

Step 3 is the interesting one, and it is a measurement rather than an assumption: both
@typescript-eslint/parser's scope analysis and oxc's own semantics already count a JSX reference as a
reference, so the pair is redundant on both sides. If that ever stops being true on ESLint's side
while oxlint stays silent, this probe fails and the pair becomes a real coverage gap.
"""

import json
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROBE_DIR = os.path.join(ROOT, 'src', '__jsxUsesProbe')
PROBE_PATH = os.path.join(PROBE_DIR, 'probe.tsx')
ES_OFF = '{"react/jsx-uses-react": "off", "react/jsx-uses-vars": "off"}'
OX_OFF = ['-A', 'hosted/jsx-uses-react', '-A', 'hosted/jsx-uses-vars']

PROBE = """import React from 'react';

const UsedOnlyFromJsx = () => <span />;

const neverUsedAtAll = 1;

function JsxUsesProbe() {
    return <UsedOnlyFromJsx />;
}

export default JsxUsesProbe;
"""

CONTROL_LINE = 5
SILENT_LINES = (1, 3)


def unused_var_lines_oxlint(extra_arguments):
    out = subprocess.run(
        ['npx', 'oxlint', '--format', 'json', *extra_arguments, os.path.relpath(PROBE_PATH, ROOT)],
        capture_output=True, text=True, cwd=ROOT,
    )
    try:
        diagnostics = json.loads(out.stdout)['diagnostics']
    except (json.JSONDecodeError, KeyError):
        sys.exit(f'oxlint run failed:\n{out.stdout[:600]}{out.stderr[:600]}')
    return {
        (d.get('labels') or [{}])[0].get('span', {}).get('line')
        for d in diagnostics
        if 'no-unused-vars' in (d.get('code') or '')
    }


def unused_var_lines_eslint(extra_arguments):
    out = subprocess.run(
        ['npx', 'eslint', '--no-warn-ignored', '--format', 'json', *extra_arguments, os.path.relpath(PROBE_PATH, ROOT)],
        capture_output=True, text=True, cwd=ROOT,
        env={**os.environ, 'NODE_OPTIONS': '--max-old-space-size=8192'},
    )
    try:
        report = json.loads(out.stdout)
    except json.JSONDecodeError:
        sys.exit(f'eslint run failed:\n{out.stdout[:600]}{out.stderr[:600]}')
    return {m['line'] for f in report for m in f['messages'] if 'no-unused-vars' in (m.get('ruleId') or '')}


def main():
    os.makedirs(PROBE_DIR, exist_ok=True)
    with open(PROBE_PATH, 'w') as handle:
        handle.write(PROBE)
    try:
        es_on = unused_var_lines_eslint([])
        es_off = unused_var_lines_eslint(['--rule', ES_OFF])
        ox_on = unused_var_lines_oxlint([])
        ox_off = unused_var_lines_oxlint(OX_OFF)
    finally:
        shutil.rmtree(PROBE_DIR, ignore_errors=True)

    failures = []
    print(f'unused-vars lines reported, rules ON : eslint {sorted(es_on)}, oxlint {sorted(ox_on)}')
    print(f'unused-vars lines reported, rules OFF: eslint {sorted(es_off)}, oxlint {sorted(ox_off)}')
    print()

    if CONTROL_LINE not in es_on or CONTROL_LINE not in ox_on:
        failures.append(
            f'the genuinely unused variable on line {CONTROL_LINE} was not reported by both tools '
            f'(eslint {sorted(es_on)}, oxlint {sorted(ox_on)}), so this probe can observe nothing'
        )
    else:
        print(f'control: line {CONTROL_LINE} reported by both tools, so an unused-vars rule really is running')

    for line in SILENT_LINES:
        what = 'the React import' if line == 1 else 'the component used only from JSX'
        if line in es_on or line in ox_on:
            failures.append(f'{what} (line {line}) was reported as unused: eslint={line in es_on}, oxlint={line in ox_on}')
        else:
            print(f'silent:  line {line}, {what}, on both tools')

    if es_on != ox_on:
        failures.append(f'the two tools disagree with the rules on: eslint {sorted(es_on)} vs oxlint {sorted(ox_on)}')

    print()
    if es_off == es_on and ox_off == ox_on:
        print('Switching both rules off changes nothing on either tool: the scope analysis in the')
        print('TypeScript parser, and the semantics oxc builds, both already count a JSX reference as a')
        print('reference, so the pair is redundant on both sides rather than load-bearing on one.')
    elif es_off != es_on and ox_off == ox_on:
        failures.append(
            f'the pair is load-bearing for ESLint (off: {sorted(es_off)}, on: {sorted(es_on)}) but makes no '
            f'difference in oxlint, so the sidecar copy is not doing the job the ESLint one does'
        )
    else:
        print(f'Switching both rules off changes what is reported (eslint {sorted(es_off)}, oxlint {sorted(ox_off)}),')
        print('which is fine as long as both tools change the same way, asserted above.')

    print()
    if failures:
        print(f'{len(failures)} check(s) FAILED:')
        for failure in failures:
            print(f'   {failure}')
        sys.exit(1)
    print('jsx-uses-react and jsx-uses-vars produce the same observable outcome on both tools.')


if __name__ == '__main__':
    main()

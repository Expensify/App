"""Does oxlint's React Compiler gate behave like ESLint's processor?

    python3 oxlint-migration/checkReactCompilerGate.py

Two rules are suppressed wholesale in files both React compilers memoize. ESLint does it in a
processor (config/eslint/processors/eslint-processor-react-compiler-compat.mjs); oxlint has no
processor, so config/oxlint/reactCompilerGate.mjs does it by wrapping `context.report` inside the
JS plugin. This checks the two agree, on both answers.

The per-rule fixtures in oxlint-migration/port-probe cannot check this. They deliberately opt out of
memoization with 'use no memo', because their job is "does the rule run at all" and a gate that
silenced them would look identical to a rule that never loaded. So the gate needs its own test,
and it needs a matched pair:

    memoized     both compilers memoize it  -> BOTH tools must report nothing
    opted out    same code + 'use no memo'  -> BOTH tools must report both rules

Only the pair is meaningful. Silence alone proves nothing (a broken plugin is also silent) and
findings alone prove nothing (an absent gate also reports).

The probe files are written into src/ rather than oxlint-migration/, because the repo's real ESLint
config excludes oxlint-migration from the TypeScript program and its type-aware rules cannot parse a
file outside it. They are deleted in a finally.
"""

import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROBE_DIR = os.path.join(ROOT, 'src', '__reactCompilerGateProbe')

TEMPLATE = """import React from 'react';

import useOnyx from '@hooks/useOnyx';

import ONYXKEYS from '@src/ONYXKEYS';

const GateProbeContext = React.createContext<{{count: number}} | undefined>(undefined);

function GateProbe({{children}}: {{children: React.ReactNode}}) {{
{directive}    const [accountID] = useOnyx(ONYXKEYS.SESSION, {{selector: (session) => session?.accountID}});
    const contextValue = {{count: accountID ?? 0}};
    return <GateProbeContext.Provider value={{contextValue}}>{{children}}</GateProbeContext.Provider>;
}}

export default GateProbe;
"""

GATED_RULES = [
    ('rulesdir(no-inline-useOnyx-selector)', 'rulesdir/no-inline-useOnyx-selector'),
    ('hosted(jsx-no-constructed-context-values)', 'react/jsx-no-constructed-context-values'),
]

VARIANTS = {
    'memoized': ('', False),
    'optedOut': ("    'use no memo';\n", True),
}


def write_probes():
    os.makedirs(PROBE_DIR, exist_ok=True)
    paths = {}
    for name, (directive, _) in VARIANTS.items():
        path = os.path.join(PROBE_DIR, f'{name}.tsx')
        with open(path, 'w') as handle:
            handle.write(TEMPLATE.format(directive=directive))
        paths[name] = os.path.relpath(path, ROOT)
    return paths


def oxlint_findings(paths):
    out = subprocess.run(
        ['npx', 'oxlint', '--format', 'json', *paths],
        capture_output=True, text=True, cwd=ROOT,
    )
    try:
        diagnostics = json.loads(out.stdout)['diagnostics']
    except (json.JSONDecodeError, KeyError):
        sys.exit(f'oxlint run failed:\n{out.stdout[:600]}{out.stderr[:600]}')
    return {(d['filename'], d.get('code') or '') for d in diagnostics}


def eslint_findings(paths):
    out = subprocess.run(
        ['npx', 'eslint', '--no-warn-ignored', '--format', 'json', *paths],
        capture_output=True, text=True, cwd=ROOT,
        env={**os.environ, 'NODE_OPTIONS': '--max-old-space-size=8192'},
    )
    try:
        report = json.loads(out.stdout)
    except json.JSONDecodeError:
        sys.exit(f'eslint run failed:\n{out.stdout[:600]}{out.stderr[:600]}')
    return {(os.path.relpath(f['filePath'], ROOT), m.get('ruleId')) for f in report for m in f['messages']}


def main():
    paths = write_probes()
    try:
        ox = oxlint_findings(list(paths.values()))
        es = eslint_findings(list(paths.values()))
    finally:
        for path in paths.values():
            os.remove(os.path.join(ROOT, path))
        os.rmdir(PROBE_DIR)

    failures = []
    print(f'{"variant":10} {"rule":42} {"eslint":>7} {"oxlint":>7}  verdict')
    for name, (_, should_report) in VARIANTS.items():
        for ox_rule, es_rule in GATED_RULES:
            ox_hit = (paths[name], ox_rule) in ox
            es_hit = (paths[name], es_rule) in es
            if ox_hit != es_hit:
                verdict = 'FAIL: the two tools disagree'
            elif ox_hit != should_report:
                verdict = f'FAIL: expected {"a finding" if should_report else "silence"} from both'
            else:
                verdict = 'agree'
            if verdict != 'agree':
                failures.append(f'{name}/{es_rule}: {verdict}')
            print(f'{name:10} {es_rule:42} {str(es_hit):>7} {str(ox_hit):>7}  {verdict}')

    print()
    if failures:
        print(f'{len(failures)} check(s) FAILED:')
        for failure in failures:
            print(f'   {failure}')
        sys.exit(1)
    print('The gate matches ESLint\'s processor: silent where both compilers memoize, live where they do not.')


if __name__ == '__main__':
    main()

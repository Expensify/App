"""Config variants and per-run bookkeeping for oxlint-migration/measureReactCompilerCost.sh.

    python3 oxlint-migration/reactCompilerVariants.py write
    python3 oxlint-migration/reactCompilerVariants.py record <report.json> <run> <variant> <seconds> <results.tsv>

`write` produces four copies of .oxlintrc.json differing only in the rh/* severities. They are
TEXT patches, not `extends` wrappers: oxlint's `extends` does not inherit ignorePatterns, so a
wrapper lints Mobile-Expensify and node_modules (measured: 426467 findings and 21 min per run
instead of 4629 and 107 s).
"""

import json
import sys

# The 14 React Compiler diagnostic rules our config enables; each maps 1:1 onto an
# ErrorCategory via the plugin's own getRuleForCategory, so the native aggregate could in
# principle stand in for them.
COMPILER = [
    'refs', 'set-state-in-effect', 'preserve-manual-memoization', 'immutability',
    'static-components', 'config', 'error-boundaries', 'gating', 'globals',
    'incompatible-library', 'purity', 'set-state-in-render', 'unsupported-syntax', 'use-memo',
]
# Hand-written rules assigned outside the compiler's allRules map, so no category exists for
# them and the aggregate cannot cover them.
NON_COMPILER = ['exhaustive-deps', 'component-hook-factories']


def switch_off(text, names):
    for name in names:
        needle = f'"rh/{name}": "error"'
        assert text.count(needle) == 1, f'{needle} appears {text.count(needle)} times'
        text = text.replace(needle, f'"rh/{name}": "off"')
    return text


def write_variants():
    base = open('.oxlintrc.json').read()
    variants = {
        'a': base,
        'b': switch_off(base, COMPILER),
        'c': switch_off(base, COMPILER + NON_COMPILER),
        # `rh/use-memo` is the last entry of the root `rules` object, so appending after it
        # keeps the JSON valid without restructuring anything.
        'd': switch_off(base, COMPILER + NON_COMPILER).replace(
            '"rh/use-memo": "off"',
            '"rh/use-memo": "off",\n        "react/react-compiler": "error"',
        ),
    }
    for key, text in variants.items():
        open(f'.oxlintrc.measure-{key}.json', 'w').write(text)
    print(f'wrote 4 variant configs ({len(COMPILER)} compiler rules, {len(NON_COMPILER)} non-compiler)')


def record(report, run_id, variant, seconds, results):
    diagnostics = json.load(open(report))['diagnostics']
    sidecar = sum(1 for d in diagnostics if (d.get('code') or '').startswith('rh('))
    aggregate = sum(1 for d in diagnostics if (d.get('code') or '') == 'react(react-compiler)')
    with open(results, 'a') as handle:
        handle.write(f'{run_id}\t{variant}\t{seconds}\t{len(diagnostics)}\t{sidecar}\t{aggregate}\n')
    print(f'{variant} (run {run_id}): {seconds}s  total={len(diagnostics)} rh={sidecar} react-compiler={aggregate}', flush=True)


if __name__ == '__main__':
    if sys.argv[1] == 'write':
        write_variants()
    else:
        record(*sys.argv[2:7])

"""Config variants and per-run bookkeeping for oxlint-migration/measureReactCompilerCost.sh.

    python3 oxlint-migration/reactCompilerVariants.py write
    python3 oxlint-migration/reactCompilerVariants.py record <report.json> <run> <variant> <seconds> <results.tsv>

`write` produces four copies of .oxlintrc.json differing only in the rh/* severities (variant
`d` additionally turns on the native react/* twins in place of the rules it switches off). They
are TEXT patches, not `extends` wrappers: oxlint's `extends` does not inherit ignorePatterns, so
a wrapper lints Mobile-Expensify and node_modules (measured: 426467 findings and 21 min per run
instead of 4629 and 107 s).
"""

import json
import sys

# The 14 React Compiler diagnostic rules our config enables. Since oxlint 1.79.0 removed the
# single aggregate rule `react/react-compiler` and split it into 22 per-check rules, 12 of these
# 14 have an exact native twin (react/<name>, same kebab-case, verified firing on
# oxlint-migration/port-probe/fixtures/rh*.tsx); `config` and `gating` have no native id at all
# (oxlint refuses to parse a config that names either one).
COMPILER = [
    'refs', 'set-state-in-effect', 'preserve-manual-memoization', 'immutability',
    'static-components', 'config', 'error-boundaries', 'gating', 'globals',
    'incompatible-library', 'purity', 'set-state-in-render', 'unsupported-syntax', 'use-memo',
]
# The 12 entries of COMPILER with a native oxlint twin: everything except `config` and `gating`.
# Variant `d` turns these on (plus `rule-suppression`, see write_variants) in place of the rh/*
# sidecar.
NATIVE_TWINS = [name for name in COMPILER if name not in ('config', 'gating')]
# Hand-written rules assigned outside the compiler's allRules map, so no category (and no native
# id) exists for them.
NON_COMPILER = ['exhaustive-deps', 'component-hook-factories']


def switch_off(text, names):
    for name in names:
        needle = f'"rh/{name}": "error"'
        assert text.count(needle) == 1, f'{needle} appears {text.count(needle)} times'
        text = text.replace(needle, f'"rh/{name}": "off"')
    return text


def write_variants():
    base = open('.oxlintrc.json').read()
    # `rule-suppression` rides along with the 12 twins: it is how a compiler bail-out becomes
    # visible on the native side, and the whole point of variant `d` is to check whether the
    # bail-out survives the per-check split.
    native_rules = ',\n        '.join([f'"react/{name}": "error"' for name in NATIVE_TWINS] + ['"react/rule-suppression": "error"'])
    variants = {
        'a': base,
        'b': switch_off(base, COMPILER),
        'c': switch_off(base, COMPILER + NON_COMPILER),
        # `rh/use-memo` is the last entry of the root `rules` object, so appending after it
        # keeps the JSON valid without restructuring anything.
        'd': switch_off(base, COMPILER + NON_COMPILER).replace(
            '"rh/use-memo": "off"',
            f'"rh/use-memo": "off",\n        {native_rules}',
        ),
    }
    for key, text in variants.items():
        open(f'.oxlintrc.measure-{key}.json', 'w').write(text)
    print(f'wrote 4 variant configs ({len(COMPILER)} compiler rules, {len(NON_COMPILER)} non-compiler)')


def record(report, run_id, variant, seconds, results):
    diagnostics = json.load(open(report))['diagnostics']
    sidecar = sum(1 for d in diagnostics if (d.get('code') or '').startswith('rh('))
    native_codes = {f'react({name})' for name in NATIVE_TWINS}
    native = sum(1 for d in diagnostics if (d.get('code') or '') in native_codes)
    with open(results, 'a') as handle:
        handle.write(f'{run_id}\t{variant}\t{seconds}\t{len(diagnostics)}\t{sidecar}\t{native}\n')
    print(f'{variant} (run {run_id}): {seconds}s  total={len(diagnostics)} rh={sidecar} native={native}', flush=True)


if __name__ == '__main__':
    if sys.argv[1] == 'write':
        write_variants()
    else:
        record(*sys.argv[2:7])

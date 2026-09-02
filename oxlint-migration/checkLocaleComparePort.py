"""Does the type-free prefer-locale-compare-from-context match ESLint's type-aware original?

    python3 oxlint-migration/checkLocaleComparePort.py

ESLint's rule (eslint-config-expensify/eslint-plugin-expensify/prefer-locale-compare-from-context.js)
asks the type checker whether the receiver is a string. oxlint's JS plugins get no types, so
config/oxlint/preferLocaleCompareFromContext.mjs drops the question instead of approximating it:
`localeCompare` lives on exactly one built-in prototype.

This cannot be checked by the port-probe fixture harness, which parses without a TypeScript program
and would make ESLint's rule throw at create() time. So the probe files go into src/, where the
repo's real ESLint config has full type information, and both tools run their real configs.

Every receiver shape in the repo is covered, plus the one shape where the two are KNOWN to differ.
That divergence is asserted rather than hidden: if it ever stops being the only difference, or if a
shape that should agree starts diverging, this fails.
"""

import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROBE_DIR = os.path.join(ROOT, 'src', '__localeCompareProbe')
OX_RULE = 'rulesdir(prefer-locale-compare-from-context)'
ES_RULE = 'rulesdir/prefer-locale-compare-from-context'

PROBE = """type Row = {created?: string};

const LANGUAGE: Record<string, string> = {en: 'English'};

function shapes(a: Row, b: Row, first: string, second: string) {
    const memberAccess = (a.created ?? '').localeCompare(b.created ?? '');
    const plainString = first.localeCompare(second);
    const indexAccess = LANGUAGE[first].localeCompare(LANGUAGE[second]);
    const ownMethod = {localeCompare: (other: string) => other.length};
    const notAString = ownMethod.localeCompare(first);
    return [memberAccess, plainString, indexAccess, notAString];
}

export default shapes;
"""

IN_TEST = """function inTest(first: string, second: string) {
    return first.localeCompare(second);
}

export default inTest;
"""

EXPECTED = {
    6: (True, 'member access on an optional string, as in ReportUtils.ts:9493'),
    7: (True, 'plain string variable'),
    8: (True, 'index access into Record<string, string>, as in LOCALES.ts:73'),
    10: ('divergent', 'object with its OWN localeCompare method -- ESLint sees a non-string receiver and stays silent; the type-free port cannot, so it reports. No such receiver exists in src/'),
}


def write_probes():
    os.makedirs(os.path.join(PROBE_DIR, 'tests'), exist_ok=True)
    paths = {}
    for name, body, relative in (
        ('shapes', PROBE, os.path.join(PROBE_DIR, 'shapes.ts')),
        ('inTest', IN_TEST, os.path.join(PROBE_DIR, 'tests', 'inTest.ts')),
    ):
        with open(relative, 'w') as handle:
            handle.write(body)
        paths[name] = os.path.relpath(relative, ROOT)
    return paths


def remove_probes(paths):
    for path in paths.values():
        os.remove(os.path.join(ROOT, path))
    os.rmdir(os.path.join(PROBE_DIR, 'tests'))
    os.rmdir(PROBE_DIR)


def oxlint_lines(paths):
    out = subprocess.run(['npx', 'oxlint', '--format', 'json', *paths], capture_output=True, text=True, cwd=ROOT)
    try:
        diagnostics = json.loads(out.stdout)['diagnostics']
    except (json.JSONDecodeError, KeyError):
        sys.exit(f'oxlint run failed:\n{out.stdout[:600]}{out.stderr[:600]}')
    return {
        (d['filename'], (d.get('labels') or [{}])[0].get('span', {}).get('line'))
        for d in diagnostics
        if (d.get('code') or '') == OX_RULE
    }


def eslint_lines(paths):
    out = subprocess.run(
        ['npx', 'eslint', '--no-warn-ignored', '--format', 'json', *paths],
        capture_output=True, text=True, cwd=ROOT,
        env={**os.environ, 'NODE_OPTIONS': '--max-old-space-size=8192'},
    )
    try:
        report = json.loads(out.stdout)
    except json.JSONDecodeError:
        sys.exit(f'eslint run failed:\n{out.stdout[:600]}{out.stderr[:600]}')
    return {
        (os.path.relpath(f['filePath'], ROOT), m['line'])
        for f in report
        for m in f['messages']
        if m.get('ruleId') == ES_RULE
    }


def main():
    paths = write_probes()
    try:
        ox = oxlint_lines(list(paths.values()))
        es = eslint_lines(list(paths.values()))
    finally:
        remove_probes(paths)

    failures = []
    print(f'{"line":>5}  {"eslint":>6} {"oxlint":>6}  verdict / case')
    for line, (expectation, description) in sorted(EXPECTED.items()):
        ox_hit = (paths['shapes'], line) in ox
        es_hit = (paths['shapes'], line) in es
        if expectation == 'divergent':
            ok = ox_hit and not es_hit
            verdict = 'known divergence, as expected' if ok else 'FAIL: the known divergence changed shape'
        else:
            ok = ox_hit == es_hit == expectation
            verdict = 'agree' if ok else f'FAIL: expected both to report, got eslint={es_hit} oxlint={ox_hit}'
        if not ok:
            failures.append(f'line {line}: {verdict}')
        print(f'{line:>5}  {str(es_hit):>6} {str(ox_hit):>6}  {verdict}\n        {description}')

    # The rule skips anything under tests/. Both tools must be silent, for the same reason.
    test_ox = {line for path, line in ox if path == paths['inTest']}
    test_es = {line for path, line in es if path == paths['inTest']}
    skip_ok = not test_ox and not test_es
    print(f'\ntest-file skip: eslint={sorted(test_es)} oxlint={sorted(test_ox)}  '
          f'{"both silent, as ESLint does" if skip_ok else "FAIL: one of them reported inside tests/"}')
    if not skip_ok:
        failures.append('the tests/ skip does not match')

    stray = {(path, line) for path, line in ox | es if line not in EXPECTED and path != paths['inTest']}
    if stray:
        failures.append(f'findings on unaccounted lines: {sorted(stray)}')
        print(f'FAIL: findings on lines this probe does not describe: {sorted(stray)}')

    print()
    if failures:
        print(f'{len(failures)} check(s) FAILED:')
        for failure in failures:
            print(f'   {failure}')
        sys.exit(1)
    print('The type-free port matches the type-aware original on every shape in src/, and diverges')
    print('only on a receiver that defines its own localeCompare, which src/ does not contain.')


if __name__ == '__main__':
    main()

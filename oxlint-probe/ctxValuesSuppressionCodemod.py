"""Suppresses every oxlint react/jsx-no-constructed-context-values finding, with a reason.

    python3 oxlint-probe/ctxValuesSuppressionCodemod.py              # dry run, prints every edit
    python3 oxlint-probe/ctxValuesSuppressionCodemod.py --apply       # write the files

Decided 2026-08-12: run oxlint's native Rust rule rather than hosting ESLint's copy behind a
React Compiler gate. The native rule is free (measured: no wall-clock difference) but it cannot
be gated, so ESLint's 0 findings become 115 in oxlint and every one needs a comment. This script
writes them.

Comments are `oxlint-disable-next-line`, never `eslint-disable-next-line`: ESLint keeps its
working per-file gate and must not be blinded too.

Every comment carries a `-- reason`, because the three reasons are not interchangeable and 115
bare directives would be impossible to audit:

  COMPILER   ESLint's processor drops this finding because both React compilers memoize the file.
             The code is correct. This is the suppression that goes stale if the file ever stops
             being memoized (a compiler bump is the uncovered path -- the compliance check only
             looks at files a PR changed). Delete these if the rule ever moves behind the gate.
  ANCHORED   ESLint already has an eslint-disable comment for this, but above the *declaration*.
             oxlint reports on the JSX provider line, so it needs its own comment here.
  NATIVE     oxlint's native port reports where ESLint's rule does not: it does not require the
             value to be declared inside the component that renders it. Upstream bug, not debt.

Placement is by syntax, because a `//` comment in JSX child position becomes rendered text
rather than a directive:

  JSX children    ->  {/* oxlint-disable-next-line ... */}
  anything else   ->  // oxlint-disable-next-line ...

One case cannot take a new line at all: when the target line ALREADY has a disable-next-line
comment above it (2 sites, both `rulesdir/context-provider-split-values`). Inserting there
orphans the existing directive, which then points at our comment instead of at the code
(measured: exactly the 2 findings that took the repo from 4629 to 4631). Those get the repo's
same-line combo on the existing line instead, so both directives keep pointing at the code:

  /* oxlint-disable-next-line A -- reason */ // eslint-disable-next-line B

Three independent checks catch a wrong choice, which is why the heuristic is acceptable:
`react/jsx-no-comment-textnodes` (enabled in both tools) fires on a `//` that became JSX text;
a `{/* */}` in expression position is a syntax error; and re-running oxlint must report 0 for
this rule, which only holds if every comment parsed as a directive.
"""

# cSpell:ignore textnodes
import json
import os
import re
import subprocess
import sys

import compareNativeCtxValues as probe

APPLY = '--apply' in sys.argv
ROOT = probe.ROOT
RULE = probe.RULE
PATH_LIST = '/tmp/ctx-values-files.txt'

REASONS = {
    'COMPILER': 'React Compiler memoizes this file, so ESLint drops this finding via its processor',
    'ANCHORED': "already disabled for ESLint above the declaration; oxlint anchors on the provider",
    'NATIVE': "oxlint's native port reports outside components, where ESLint's rule does not",
}


def memoization(paths):
    with open(PATH_LIST, 'w') as handle:
        handle.write('\n'.join(sorted(paths)) + '\n')
    out = subprocess.run(['node', 'oxlint-probe/memoizedFiles.mjs', PATH_LIST], capture_output=True, text=True, cwd=ROOT)
    if out.returncode != 0:
        sys.exit(f'memoizedFiles.mjs failed:\n{out.stderr[:600]}')
    return json.loads(out.stdout)


def classify(native, eslint, memoized):
    """Why each native finding needs a comment. Anything unexplained is a hard stop."""
    kinds, unexplained = {}, []
    for key in sorted(native):
        path, line = key
        if key not in eslint:
            kinds[key] = 'NATIVE'
        elif probe.is_suppressed(path, eslint[key]):
            kinds[key] = 'ANCHORED'
        elif memoized.get(path):
            kinds[key] = 'COMPILER'
        else:
            unexplained.append(key)
    return kinds, unexplained


def directive_for(path, line, kind):
    """How to suppress `line`, as ('insert' | 'combo', text). 'combo' replaces the line above."""
    text = probe.lines_of(path)
    current = text[line - 1]
    indent = current[: len(current) - len(current.lstrip())]
    body = f'oxlint-disable-next-line {RULE} -- {REASONS[kind]}'
    above = text[line - 2] if line >= 2 else ''

    # A directive already occupies the line above, so a new line would orphan it.
    if re.search(r'(?:eslint|oxlint)-disable-next-line', above):
        if not above.strip().startswith('//'):
            sys.exit(f'STOP {path}:{line}: the line above holds a directive this script cannot'
                     f' combine with, so it would be orphaned. Handle it by hand:\n   {above}')
        existing_indent = above[: len(above) - len(above.lstrip())]
        return 'combo', f'{existing_indent}/* {body} */ {above.strip()}'

    # Inside JSX children the only comment syntax is an expression container. A line that opens a
    # JSX element ends with `>`; a JS expression context ends with `(`, `=`, `{`, `,` or similar.
    previous = next((text[i].strip() for i in range(line - 2, -1, -1) if text[i].strip()), '')
    in_jsx_children = not current.lstrip().startswith('return') and previous.endswith('>')
    return 'insert', (f'{indent}{{/* {body} */}}' if in_jsx_children else f'{indent}// {body}')


def main():
    probe.write_config()
    try:
        native, eslint = probe.collect(probe.run_oxlint(['.']))
    finally:
        os.remove(probe.CONFIG)

    memoized = memoization({path for path, _ in native})
    kinds, unexplained = classify(native, eslint, memoized)

    if unexplained:
        print('STOP. These findings are not explained by any of the three reasons, so a blanket')
        print('comment would be hiding something real. Investigate before re-running:')
        for path, line in unexplained:
            print(f'   {path}:{line}')
        sys.exit(1)

    by_file = {}
    for (path, line), kind in kinds.items():
        by_file.setdefault(path, []).append((line, kind))

    tally, skipped, written, combos = {}, 0, 0, 0
    for path, findings in sorted(by_file.items()):
        text = probe.lines_of(path)
        edits = []
        # Bottom-up so earlier line numbers stay valid as lines are inserted.
        for line, kind in sorted(findings, reverse=True):
            if line >= 2 and f'oxlint-disable-next-line {RULE}' in text[line - 2]:
                skipped += 1
                continue
            how, comment = directive_for(path, line, kind)
            edits.append((line, how, comment))
            tally[kind] = tally.get(kind, 0) + 1

        if not edits:
            continue
        for line, how, comment in edits:
            if how == 'combo':
                text[line - 2] = comment
                combos += 1
            else:
                text.insert(line - 1, comment)
            written += 1
        print(f'\n{path}  (+{len(edits)})')
        for line, how, comment in reversed(edits):
            print(f'   {line:5} {how:6} | {comment.strip()[:112]}')
        if APPLY:
            with open(os.path.join(ROOT, path), 'w') as handle:
                handle.write('\n'.join(text) + '\n')

    print(f'\n{"WROTE" if APPLY else "DRY RUN"}: {written} comments across {len(by_file)} files'
          f'{f", {combos} as a same-line combo" if combos else ""}'
          f'{f", {skipped} already present" if skipped else ""}')
    for kind in ('COMPILER', 'ANCHORED', 'NATIVE'):
        print(f'   {kind:9} {tally.get(kind, 0):4}')
    if not APPLY:
        print('\nRe-run with --apply to write. Then verify, in order:')
        print('   npm run fmt')
        print(f'   npx oxlint --format json . | grep -c "{RULE}"   # must be 0')
        print('   npm run compare-oxlint -- --fresh                # must stay 4629 = 4629')


if __name__ == '__main__':
    main()

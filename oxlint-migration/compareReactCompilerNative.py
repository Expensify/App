"""Is oxlint's native react/<rule> a drop-in for our 12 sidecar rh/<rule> twins?

Targets oxlint 1.79.0, which removed the single aggregate rule `react/react-compiler` and split
it into 22 per-check rules. Twelve of those are exact kebab-case twins of rh/* rules our config
enables (react/refs <-> rh/refs, and so on), so this script joins native and sidecar diagnostics
directly on (file, line, rule name). There is no category translation step any more: the rule id
in the diagnostic already is the identity to compare on.

Usage (normally via oxlint-migration/measureReactCompilerCost.sh, which produces both reports):
    python3 oxlint-migration/compareReactCompilerNative.py /tmp/rc-a-1.json /tmp/rc-d-1.json

Answer as of 2026-08-11, against the old aggregate rule: no, it was not a drop-in. The aggregate
stopped analyzing any component holding an `eslint-disable ... react-hooks/exhaustive-deps`
comment, so files carrying one lost every finding (118 of them) while files without one matched
perfectly. See "The native aggregate, measured" in OXLINT_MIGRATION_INVESTIGATION.md for those
numbers as history.

Re-checked this session on the 1.79.0 per-check split: same answer. A file with `refs` and
`set-state-in-effect` violations reports both natively; add one
`// eslint-disable-next-line react-hooks/exhaustive-deps` comment in the same component and both
native findings disappear, even with `react/rule-suppression` turned off. Delete the comment and
both come back. The split changed the id shape, not the bail-out.
"""

import collections
import json
import re
import sys

# The 12 rh/* rules with an exact native twin (react/<name>, same kebab-case). `config` and
# `gating` have no native id at all: oxlint refuses to parse a config that names either one, so
# they are out of scope for this comparison.
TWIN_RULES = [
    'refs', 'set-state-in-effect', 'preserve-manual-memoization', 'immutability',
    'static-components', 'error-boundaries', 'globals', 'incompatible-library', 'purity',
    'set-state-in-render', 'unsupported-syntax', 'use-memo',
]


def location(diagnostic):
    labels = diagnostic.get('labels') or []
    return diagnostic['filename'], (labels[0]['span']['line'] if labels else 0)


def main(sidecar_report, native_report):
    in_scope = set(TWIN_RULES)

    sidecar = set()
    for diagnostic in json.load(open(sidecar_report))['diagnostics']:
        match = re.fullmatch(r'rh\((.+)\)', diagnostic.get('code') or '')
        if match and match.group(1) in in_scope:
            sidecar.add((*location(diagnostic), match.group(1)))

    native, by_rule = set(), collections.Counter()
    for diagnostic in json.load(open(native_report))['diagnostics']:
        match = re.fullmatch(r'react\((.+)\)', diagnostic.get('code') or '')
        if not match:
            continue
        rule = match.group(1)
        native.add((*location(diagnostic), rule))
        by_rule[rule] += 1

    print('Native findings by rule (oxlint runs every react/* rule enabled, not just our 12 twins):')
    for rule, count in by_rule.most_common():
        print(f'  {rule:28} {count:5}  {"enabled" if rule in in_scope else "NOT IN OUR CONFIG"}')

    comparable = {finding for finding in native if finding[2] in in_scope}
    matched = sidecar & comparable
    missed = sidecar - comparable
    print('\nRestricted to our 12 twin rules, deduped by (file, line, rule):')
    print(f'  sidecar={len(sidecar)}  native={len(comparable)}')
    print(f'  matched={len(matched)}  MISSED BY NATIVE={len(missed)}  native-only={len(comparable - sidecar)}')
    print(f'  missed by rule: {dict(collections.Counter(rule for _, _, rule in missed))}')

    # A `rule-suppression` finding means the compiler gave up on that component, so the file
    # stops being checked entirely. Split the misses by it: the separation is binary, which is
    # what distinguishes "our comments blind it" from "big files have more findings".
    suppression_files = {filename for filename, _, rule in native if rule == 'rule-suppression'}
    print('\nDoes "file has a rule-suppression finding" explain the misses, or is it a proxy for "big file"?')
    for label, predicate in (
        ('files WITH suppression', lambda f: f in suppression_files),
        ('files WITHOUT', lambda f: f not in suppression_files),
    ):
        hit = sum(1 for filename, _, _ in matched if predicate(filename))
        lost = sum(1 for filename, _, _ in missed if predicate(filename))
        rate = 100 * lost / (hit + lost) if hit + lost else 0
        print(f'  {label:24} sidecar={hit + lost:4}  matched={hit:4}  missed={lost:4}  miss rate={rate:.0f}%')

    # Which disabled rule triggers the bail-out. Empirically all of them are exhaustive-deps.
    triggers = collections.Counter()
    for filename, line, rule in native:
        if rule != 'rule-suppression':
            continue
        try:
            text = open(filename).read().splitlines()[line - 1]
        except (OSError, IndexError):
            continue
        triggers.update(re.findall(r'react-hooks/([a-z-]+)', text) or ['<no react-hooks id on that line>'])
    print(f'\n{by_rule["rule-suppression"]} rule-suppression findings across {len(suppression_files)} files, triggered by:')
    for name, count in triggers.most_common():
        print(f'  {count:5}  react-hooks/{name}')


if __name__ == '__main__':
    main(
        sys.argv[1] if len(sys.argv) > 1 else '/tmp/rc-a-1.json',
        sys.argv[2] if len(sys.argv) > 2 else '/tmp/rc-d-1.json',
    )

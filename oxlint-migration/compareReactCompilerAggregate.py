"""Is oxlint's native `react/react-compiler` a drop-in for our 14 sidecar rh/* rules?

Usage (normally via oxlint-migration/measureReactCompilerCost.sh, which produces both reports):
    python3 oxlint-migration/compareReactCompilerAggregate.py /tmp/rc-a-1.json /tmp/rc-d-1.json

The aggregate reports every React Compiler diagnostic under ONE rule id, with the category
only in the message prefix ("Refs: ...", "EffectSetState: ..."), so parity has to be checked
on (file, line, category) after translating rule names to categories. That mapping is read
straight out of the plugin's own getRuleForCategoryImpl rather than guessed, because it is
not a kebab-case transform: rule `set-state-in-effect` is category `EffectSetState`.

Answer as of 2026-08-11: no. The aggregate stops analyzing any component holding an
`eslint-disable ... react-hooks/exhaustive-deps` comment, so files carrying one lose every
finding (118 of them) while files without one match perfectly. See
"The native aggregate, measured" in OXLINT_MIGRATION_INVESTIGATION.md.
"""

import collections
import json
import re
import sys

PLUGIN_BUNDLE = 'node_modules/eslint-config-expensify/node_modules/eslint-plugin-react-hooks/cjs/eslint-plugin-react-hooks.development.js'

# The 14 compiler-diagnostic rules our config enables. `exhaustive-deps` and
# `component-hook-factories` are deliberately absent: they are hand-written rules assigned
# outside the compiler's allRules map, so no category exists for them.
ENABLED_RULES = [
    'refs', 'set-state-in-effect', 'preserve-manual-memoization', 'immutability',
    'static-components', 'config', 'error-boundaries', 'gating', 'globals',
    'incompatible-library', 'purity', 'set-state-in-render', 'unsupported-syntax', 'use-memo',
]


def category_by_rule():
    source = open(PLUGIN_BUNDLE).read()
    start = source.find('function getRuleForCategoryImpl(category)')
    cases = re.findall(r"case ErrorCategory\.(\w+): \{.*?name: '([a-z-]+)'", source[start:start + 20000], re.S)
    return {name: category for category, name in cases}


def location(diagnostic):
    labels = diagnostic.get('labels') or []
    return diagnostic['filename'], (labels[0]['span']['line'] if labels else 0)


def main(sidecar_report, aggregate_report):
    rule_to_category = category_by_rule()
    in_scope = {rule_to_category[rule] for rule in ENABLED_RULES}

    sidecar = set()
    for diagnostic in json.load(open(sidecar_report))['diagnostics']:
        match = re.fullmatch(r'rh\((.+)\)', diagnostic.get('code') or '')
        if match and match.group(1) in rule_to_category:
            sidecar.add((*location(diagnostic), rule_to_category[match.group(1)]))

    aggregate, by_category = set(), collections.Counter()
    for diagnostic in json.load(open(aggregate_report))['diagnostics']:
        if (diagnostic.get('code') or '') != 'react(react-compiler)':
            continue
        category = diagnostic.get('message', '').split(':')[0].strip()
        aggregate.add((*location(diagnostic), category))
        by_category[category] += 1

    print('Aggregate findings by category (it runs every category, not just the 14 we enable):')
    for category, count in by_category.most_common():
        print(f'  {category:28} {count:5}  {"enabled" if category in in_scope else "NOT IN OUR CONFIG"}')

    comparable = {finding for finding in aggregate if finding[2] in in_scope}
    matched = sidecar & comparable
    missed = sidecar - comparable
    print(f'\nRestricted to our 14 categories, deduped by (file, line, category):')
    print(f'  sidecar={len(sidecar)}  aggregate={len(comparable)}')
    print(f'  matched={len(matched)}  MISSED BY AGGREGATE={len(missed)}  aggregate-only={len(comparable - sidecar)}')
    print(f'  missed by category: {dict(collections.Counter(c for _, _, c in missed))}')

    # A `Suppression` diagnostic means the compiler gave up on that component, so the file
    # stops being checked entirely. Split the misses by it: the separation is binary, which
    # is what distinguishes "our comments blind it" from "big files have more findings".
    suppression_files = {filename for filename, _, category in aggregate if category == 'Suppression'}
    print('\nDoes "file has a Suppression" explain the misses, or is it a proxy for "big file"?')
    for label, predicate in (
        ('files WITH Suppression', lambda f: f in suppression_files),
        ('files WITHOUT', lambda f: f not in suppression_files),
    ):
        hit = sum(1 for filename, _, _ in matched if predicate(filename))
        lost = sum(1 for filename, _, _ in missed if predicate(filename))
        rate = 100 * lost / (hit + lost) if hit + lost else 0
        print(f'  {label:24} sidecar={hit + lost:4}  matched={hit:4}  missed={lost:4}  miss rate={rate:.0f}%')

    # Which disabled rule triggers the bail-out. Empirically all of them are exhaustive-deps.
    triggers = collections.Counter()
    for filename, line, category in aggregate:
        if category != 'Suppression':
            continue
        try:
            text = open(filename).read().splitlines()[line - 1]
        except (OSError, IndexError):
            continue
        triggers.update(re.findall(r'react-hooks/([a-z-]+)', text) or ['<no react-hooks id on that line>'])
    print(f'\n{by_category["Suppression"]} Suppression findings across {len(suppression_files)} files, triggered by:')
    for name, count in triggers.most_common():
        print(f'  {count:5}  react-hooks/{name}')


if __name__ == '__main__':
    main(
        sys.argv[1] if len(sys.argv) > 1 else '/tmp/rc-a-1.json',
        sys.argv[2] if len(sys.argv) > 2 else '/tmp/rc-d-1.json',
    )

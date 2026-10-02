"""Which way each whole-repo delta points, at the granularity the seatbelt enforces.

    python3 oxlint-migration/checkParityDirection.py [oxlint.json] [eslint.json]

A finding oxlint adds makes the gate stricter, which the baseline absorbs. A finding ESLint reports
and oxlint does not is a check that stops running the day oxlint goes blocking. The unit is (file,
rule, count) because that is what a seatbelt row is, so a finding anchored at a different column is a
different reading of the same check, not a lost one. Exit is always 0: findings are hidden today, so a
red run would only train people to ignore it.
"""

import collections
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from compareFullRepo import read_messages, relative
from ruleMap import ROOT, norm_es_folded

TOP_DETAIL = 6


def per_file_rule(messages):
    counts = collections.Counter()
    for message in messages:
        counts[(relative(message['filePath']), norm_es_folded(message.get('ruleID')))] += 1
    return counts


def baseline_total(path):
    total = 0
    with open(path) as handle:
        for line in handle:
            if line.strip() and not line.startswith('#'):
                total += int(line.rstrip('\n').split('\t')[-1])
    return total


def main(ox_file, es_file):
    ox = per_file_rule(read_messages(ox_file, 'oxlint'))
    es = per_file_rule(read_messages(es_file, 'eslint'))

    added = collections.Counter()
    hidden = collections.Counter()
    hidden_files = collections.Counter()
    exact = 0
    for key in set(ox) | set(es):
        if ox[key] > es[key]:
            added[key[1]] += ox[key] - es[key]
        elif es[key] > ox[key]:
            hidden[key[1]] += es[key] - ox[key]
            hidden_files[key[1]] += 1
        else:
            exact += 1

    print(f'(file, rule) pairs identical on both tools: {exact} ({sum(es[k] for k in es if ox[k] == es[k])} findings)')
    print(f'findings oxlint adds:   {sum(added.values()):6}   safe: the gate gets stricter and the baseline absorbs it')
    print(f'findings oxlint hides:  {sum(hidden.values()):6}   each is a check an oxlint gate would not run')

    if hidden:
        print('\nhidden, by rule (needs a written reason in OXLINT_MIGRATION_STATE.md section 3.3.1):')
        for rule, count in hidden.most_common():
            print(f'  {rule:56} {count:5}  across {hidden_files[rule]} files')
            worst = sorted(((es[k] - ox[k], k[0], es[k], ox[k]) for k in es if k[1] == rule and ox[k] < es[k]), reverse=True)
            for lost, path, have, reported in worst[:TOP_DETAIL]:
                print(f'      {f"-{lost}":>5}  {path}  eslint {have} -> oxlint {reported}')
            if len(worst) > TOP_DETAIL:
                print(f'      ... {len(worst) - TOP_DETAIL} more files')

    print('\nbaseline totals:')
    for linter, live, path in (('oxlint', ox, 'config/oxlint/oxlint.seatbelt.tsv'), ('eslint', es, 'config/eslint/eslint.seatbelt.tsv')):
        grandfathered = baseline_total(os.path.join(ROOT, path))
        reported = sum(live.values())
        verdict = 'exact, nothing to tighten' if grandfathered == reported else f'{grandfathered - reported} rows would tighten'
        print(f'  {linter:7} baseline {grandfathered:5}, live {reported:5} -- {verdict}')

    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else '/tmp/oxlint-full.json', sys.argv[2] if len(sys.argv) > 2 else '/tmp/eslint-full.json'))

"""Does .oxlintrc.json still say the same thing as ESLint's config?

    python3 oxlint-migration/checkConfigDrift.py [--json <path>] [--files <file> ...]

The mirrored config is maintained by hand, so it drifts silently. The usual way it drifts is not
somebody editing it: it is `eslint-config-expensify` being bumped. That package owns 328 of the 437
rules ESLint enables here, and a bump can change a severity or an option with no diff anywhere in this
repo. This is the check that catches it, and the moment to run it is the bump.

How it works: `resolveConfigs.mjs` resolves both configs for the same file from *authored* values, then
this script compares them rule by rule. Every difference has to be in LEDGER below, with a reason. A
difference that is not there fails the run; a LEDGER entry that no longer differs also fails, because a
stale exemption is worse than none.

Deliberately not `eslint --print-config`: it fills in each rule's schema defaults, so `import/order`
comes back carrying three options nothing authored, and comparing that against a hand-written mirror
reports drift on every rule that has defaults.

Three statuses, and the difference between them matters:

    equivalent  the two configs are spelled differently and behave the same. The reason has to say why,
                against the rule's own default, not from memory.
    accepted    a real difference this repo chose, with the reason it chose it.
    open        a real difference nobody chose. Printed loudly, does not fail the run, because these
                predate the check. Each one needs an owner and then a fix or an `accepted`.
"""

import argparse
import collections
import json
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
from ruleMap import REPRESENTATIVE_FILES, TS_EXTENSION_RULES, norm_ox_config  # noqa: E402

EQUIVALENT, ACCEPTED, OPEN = 'equivalent', 'accepted', 'open'

# rule id -> (status, reason). Keyed on the ESLint rule name, which is what both sides normalize to.
LEDGER = {
    # -- Spelled differently, same behavior. Every claim here is the rule's own default, read out of its
    # -- implementation or schema rather than remembered.
    'curly': (EQUIVALENT, 'oxlint writes ["error", "all"]; "all" is what curly does with no option (eslint/lib/rules/curly.js only branches on "multi", "multi-line", "multi-or-nest")'),
    'no-undef': (EQUIVALENT, 'oxlint writes {typeof: false}, which is defaultOptions in eslint/lib/rules/no-undef.js:31-35'),
    'dot-notation': (EQUIVALENT, 'oxlint writes {allowKeywords: true, allowPattern: ""}, both defaults in eslint/lib/rules/dot-notation.js:30-31'),
    'import/order': (EQUIVALENT, 'oxlint writes distinctGroup, sortTypesGroup, named and warnOnUnassignedImports; all four are `default` in eslint-plugin-import\'s order schema (true, false, false, false)'),
    'jsx-a11y/anchor-has-content': (EQUIVALENT, 'ESLint writes {components: []}; the rule reads `options.components || []` (eslint-plugin-jsx-a11y/lib/rules/anchor-has-content.js:38), so omitting it is the same'),
    # -- Real differences this repo chose.
    'react/jsx-no-duplicate-props': (ACCEPTED, 'ESLint passes {ignoreCase: true}; oxlint\'s native port accepts no options at all and fails the config with "this rule does not accept configuration options", so the option cannot be mirrored. 0 findings on either tool today'),
    'react/jsx-no-undef': (ACCEPTED, 'same: ESLint passes {allowGlobals: true}, oxlint\'s port accepts no options. 0 findings on either tool today'),
    'import/no-cycle': (ACCEPTED, 'ESLint passes {maxDepth: "\u221e"}; oxlint rejects a string there ("invalid type: string, expected u32") and its default already behaves the same way on this repo, measured 748 = 748 over src with the option omitted and with maxDepth at u32::MAX. Enabled on both, and oxlint is the only one that reports: 534 real cycles against ESLint\'s 0'),
    'rulesdir/prefer-at': (ACCEPTED, 'needs typeChecker.isArrayType to tell arrays from records, which a jsPlugin cannot reach. Step 10a proposes unicorn/prefer-at on both linters instead'),
    'rulesdir/boolean-conditional-rendering': (ACCEPTED, 'needs the type of the && left operand, and no syntactic stand-in exists'),
    '@typescript-eslint/no-deprecated': (ACCEPTED, 'off for the 83 files in the write-site override. tsgolint reports writes to deprecated properties that typescript-eslint misses (typescript-eslint#10643), and no option separates reads from writes'),
    'no-invalid-this': (ACCEPTED, 'oxlint\'s plugin bridge throws on sourceCode.getJSDocComment, so the rule cannot run there. TS files are largely covered by noImplicitThis'),
    'eslint-seatbelt/configure': (ACCEPTED, 'pseudo-rule driven by an ESLint processor, not a rule oxlint could run. Dies with the seatbelt counterpart, step 11'),
    'progress/activate': (ACCEPTED, 'progress-bar plugin; oxlint prints its own progress. No behavior to preserve'),
    'react-hooks/config': (ACCEPTED, 'not a compiler-category rule and not ported. Left behind when the rh/ sidecar was deleted'),
    'react-hooks/gating': (ACCEPTED, 'same'),
    'react-hooks/component-hook-factories': (ACCEPTED, 'ships as a deprecated stub upstream: create() returns {}, so it cannot report on either tool'),
    # -- Real differences nobody chose. These need an owner.
    'prefer-const': (OPEN, 'oxlint passes {ignoreReadBeforeAssign: true}; the default is false (eslint/lib/rules/prefer-const.js:343-348). oxlint is the more lenient of the two'),
    'no-redeclare': (OPEN, 'oxlint passes {builtinGlobals: false}; the default is true (eslint/lib/rules/no-redeclare.js:23). oxlint is the more lenient of the two'),
    'prefer-promise-reject-errors': (OPEN, 'oxlint passes {allowEmptyReject: true}; the default is false (eslint/lib/rules/prefer-promise-reject-errors.js:20). oxlint is the more lenient of the two'),
    'no-throw-literal': (OPEN, 'off for scripts/** and .github/** in an .oxlintrc.json override that carries no comment, in a file whose stated convention is that every "off" says why. ESLint has no matching block'),
    '@typescript-eslint/no-unsafe-assignment': (OPEN, 'same unexplained scripts/** and .github/** override'),
    '@typescript-eslint/no-unsafe-argument': (OPEN, 'same unexplained scripts/** and .github/** override'),
    '@typescript-eslint/no-unsafe-return': (OPEN, 'same unexplained scripts/** and .github/** override'),
    '@typescript-eslint/no-unsafe-call': (OPEN, 'same unexplained scripts/** and .github/** override'),
    '@typescript-eslint/no-unsafe-member-access': (OPEN, 'same unexplained scripts/** and .github/** override'),
}


def severity(value):
    raw = value[0] if isinstance(value, list) else value
    return {0: 'off', 1: 'warn', 2: 'error'}.get(raw, raw)


def options(value):
    return value[1:] if isinstance(value, list) else []


def fold_eslint_id(rule_id):
    """A typescript-eslint extension rule is oxlint's base rule, which is already TS-aware."""
    if rule_id.startswith('@typescript-eslint/') and rule_id.split('/', 1)[1] in TS_EXTENSION_RULES:
        return rule_id.split('/', 1)[1]
    return rule_id


def resolve(files):
    out = subprocess.run(['node', os.path.join(HERE, 'resolveConfigs.mjs'), *files], capture_output=True, text=True, cwd=ROOT)
    if out.returncode != 0:
        sys.exit(f'resolveConfigs.mjs failed:\n{out.stderr}')
    return json.loads(out.stdout)


def compare(resolved):
    """rule id -> (kind, one example of the difference, files it shows up in)."""
    findings = {}
    for path, sides in sorted(resolved.items()):
        eslint = {fold_eslint_id(rid): val for rid, val in sides['eslint'].items()}
        oxlint = {norm_ox_config(rid): val for rid, val in sides['oxlint'].items()}
        for rule_id in sorted(set(eslint) | set(oxlint)):
            es, ox = eslint.get(rule_id), oxlint.get(rule_id)
            kind, detail = None, None
            if ox is None:
                if severity(es) != 'off':
                    kind, detail = 'eslint-only', f'ESLint {json.dumps(es)}, absent from oxlint'
            elif es is None:
                if severity(ox) != 'off':
                    kind, detail = 'oxlint-only', f'oxlint {json.dumps(ox)}, absent from ESLint'
            elif severity(es) != severity(ox):
                kind, detail = 'severity', f'ESLint {severity(es)}, oxlint {severity(ox)}'
            elif options(es) != options(ox) and severity(es) != 'off':
                kind, detail = 'options', f'ESLint {json.dumps(es)} vs oxlint {json.dumps(ox)}'
            if kind is None:
                continue
            if rule_id in findings:
                findings[rule_id][2].append(path)
            else:
                findings[rule_id] = (kind, detail, [path])
    return findings


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--json', help='write the full comparison to this path')
    parser.add_argument('--files', nargs='*', help='files to resolve (default: the representative set)')
    args = parser.parse_args()

    files = args.files or REPRESENTATIVE_FILES
    # A representative file that no longer exists is the quietest way for this check to stop checking
    # something: the override it stands for is silently never compared. `svg-loader.mjs` had already
    # gone that way before anyone noticed.
    missing = [f for f in files if not os.path.exists(os.path.join(ROOT, f))]
    if missing:
        sys.exit('representative file(s) missing, so the override(s) they stand for are unchecked:\n  ' + '\n  '.join(missing))
    findings = compare(resolve(files))

    unlisted = {rid: v for rid, v in findings.items() if rid not in LEDGER}
    stale = [rid for rid in LEDGER if rid not in findings]
    by_status = collections.defaultdict(list)
    for rule_id, value in findings.items():
        if rule_id in LEDGER:
            by_status[LEDGER[rule_id][0]].append((rule_id, value))

    print(f'{len(files)} files, {len(findings)} rules differ\n')
    print(f'{len(by_status[EQUIVALENT]):3} spelled differently, same behavior')
    print(f'{len(by_status[ACCEPTED]):3} accepted differences')
    print(f'{len(by_status[OPEN]):3} open differences, nobody chose these')

    if by_status[OPEN]:
        print('\nOPEN, each needs an owner:')
        for rule_id, (kind, detail, paths) in sorted(by_status[OPEN]):
            print(f'  {rule_id} ({kind}, {len(paths)} file(s))')
            print(f'      {detail}')
            print(f'      {LEDGER[rule_id][1]}')

    if unlisted:
        print(f'\n{len(unlisted)} rule(s) differ and are not in LEDGER. This is what a config bump looks like:')
        for rule_id, (kind, detail, paths) in sorted(unlisted.items()):
            print(f'  {rule_id} ({kind}, {len(paths)} file(s)): {detail}')

    if stale:
        print(f'\n{len(stale)} LEDGER entries no longer differ and should be deleted:')
        for rule_id in sorted(stale):
            print(f'  {rule_id}')

    if args.json:
        payload = {rid: {'kind': k, 'detail': d, 'files': p, 'status': LEDGER.get(rid, (None, None))[0], 'reason': LEDGER.get(rid, (None, None))[1]} for rid, (k, d, p) in findings.items()}
        with open(args.json, 'w') as handle:
            json.dump(payload, handle, indent=1, sort_keys=True)
            handle.write('\n')

    if unlisted or stale:
        sys.exit(1)
    print('\nNo unlisted drift. Every difference between the two configs is written down.')


if __name__ == '__main__':
    main()

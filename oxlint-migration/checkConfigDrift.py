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
from ruleMap import REPRESENTATIVE_FILES, TS_EXTENSION_RULES, norm_ox_config

EQUIVALENT, ACCEPTED, OPEN = 'equivalent', 'accepted', 'open'

LEDGER = {
    'curly': (EQUIVALENT, 'oxlint writes ["error", "all"]; "all" is what curly does with no option (eslint/lib/rules/curly.js only branches on "multi", "multi-line", "multi-or-nest")'),
    'no-undef': (EQUIVALENT, 'oxlint writes {typeof: false}, which is defaultOptions in eslint/lib/rules/no-undef.js:31-35'),
    'dot-notation': (EQUIVALENT, 'oxlint writes {allowKeywords: true, allowPattern: ""}, both defaults in eslint/lib/rules/dot-notation.js:30-31'),
    'import/order': (EQUIVALENT, 'oxlint writes distinctGroup, sortTypesGroup, named and warnOnUnassignedImports; all four are `default` in eslint-plugin-import\'s order schema (true, false, false, false)'),
    'jsx-a11y/anchor-has-content': (EQUIVALENT, 'ESLint writes {components: []}; the rule reads `options.components || []` (eslint-plugin-jsx-a11y/lib/rules/anchor-has-content.js:38), so omitting it is the same'),
    'react/jsx-no-duplicate-props': (ACCEPTED, 'ESLint passes {ignoreCase: true}; oxlint\'s native port accepts no options at all and fails the config with "this rule does not accept configuration options", so the option cannot be mirrored. 0 findings on either tool today'),
    'react/jsx-no-undef': (ACCEPTED, 'same: ESLint passes {allowGlobals: true}, oxlint\'s port accepts no options. 0 findings on either tool today'),
    'import/no-cycle': (ACCEPTED, 'ESLint passes {maxDepth: "\u221e"}; oxlint rejects a string there ("invalid type: string, expected u32") and its default already behaves the same way on this repo, measured 748 = 748 over src with the option omitted and with maxDepth at u32::MAX. Enabled on both, and oxlint is the only one that reports: 534 real cycles against ESLint\'s 0'),
    'rulesdir/prefer-at': (ACCEPTED, 'needs typeChecker.isArrayType to tell arrays from records, which a jsPlugin cannot reach. unicorn/prefer-at at default options is enabled instead, and covers the type-free half'),
    'unicorn/prefer-at': (ACCEPTED, 'oxlint-only on purpose: the type-free stand-in for rulesdir/prefer-at, which cannot be ported. Default options only, so it covers the x[x.length - N] family and not plain arr[i]. Measured 2026-09-10: 2 findings, the same 2 lines ESLint\'s own copy of the rule reports'),
    'rulesdir/boolean-conditional-rendering': (ACCEPTED, 'needs the type of the && left operand, and no syntactic stand-in exists'),
    '@typescript-eslint/no-deprecated': (ACCEPTED, 'off for the 91 files in the write-site override. tsgolint reports writes to deprecated properties that typescript-eslint misses (typescript-eslint#10643), and no option separates reads from writes. Measured 2026-09-15 over the full-repo reports, matching on (file, line, column): 225 shared, 174 oxlint-only, 6 ESLint-only. All 174 oxlint-only are write sites -- 164 explicit object-literal properties and 10 shorthand ones, and 172 of the 174 are the single deprecated property originalMessage. All 6 ESLint-only are read sites, calls to the deprecated getReportTransactions (src/libs/ReportUtils.ts:1292-1296), every one of them inside this override: the block that holds back the write-site flood takes the legitimate read findings with it. That is the price of the workaround, 6 lost read-site findings across 91 files'),
    'no-restricted-imports': (ACCEPTED, 'oxlint carries one path ESLint does not: the react-native-onyx/dist/OnyxUtils ban, which ESLint keeps under @typescript-eslint/no-restricted-imports (config/eslint/eslint.config.mjs:696). oxlint has no typescript/no-restricted-imports, and its core rule accepts allowTypeImports, so the path lives there instead. Measured 2026-09-14: 13 findings on both tools, same 13 files, same 13 lines'),
    'no-invalid-this': (ACCEPTED, 'oxlint\'s plugin bridge throws on sourceCode.getJSDocComment, so the rule cannot run there. TS files are largely covered by noImplicitThis'),
    'progress/activate': (ACCEPTED, 'progress-bar plugin; oxlint prints its own progress. No behavior to preserve'),
    'react-hooks/config': (ACCEPTED, 'not a compiler-category rule and not ported. Left behind when the rh/ sidecar was deleted'),
    'react-hooks/gating': (ACCEPTED, 'same'),
    'react-hooks/component-hook-factories': (ACCEPTED, 'ships as a deprecated stub upstream: create() returns {}, so it cannot report on either tool'),
    'react/jsx-filename-extension': (ACCEPTED, 'off in oxlint, warn with [.js, .jsx, .tsx] at ESLint\'s root. Dead config on both: the JS override turns it off for .js/.jsx/.mjs/.cjs, leaving .ts/.mts/.cts as the only live scope, and JSX does not parse there (parse error, not a finding). 0 findings on either tool, no seatbelt row'),
    # Found 2026-09-10, the first run after the probe set widened from 8 representative files to every
    # rule-carrying block. None of these was visible before, because no representative file was a
    # story file, an `.github/actions` source, a `src/types/onyx` type or a `.d.ts`.
    'no-unreachable-loop': (ACCEPTED, 'off for **/*.d.ts on the oxlint side only. ESLint\'s code-path analyzer, which this rule needs, crashes on a `declare module` with no body when fed through oxlint\'s AST bridge (TypeError at CodePathAnalyzer.enterNode). Declaration files contain no loops, so nothing is lost'),
    'prefer-const': (EQUIVALENT, 'not a difference: ESLint authors the identical options in a preset. eslint-config-expensify/configs/private/es6.js:93-96 sets ["error", {destructuring: "any", ignoreReadBeforeAssign: true}], and `eslint --print-config` confirms that is what resolves. resolveConfigs.mjs reads the flat array\'s literal `rules` and never expands an `extends:` key or a legacy preset object, so preset-authored options read as absent'),
    'no-redeclare': (ACCEPTED, 'different rule doing the same job. ESLint turns the core rule off and runs @typescript-eslint/no-redeclare instead, which ignores TypeScript declaration merging (ignoreDeclarationMerge defaults true). oxlint has no typescript/no-redeclare at all, so it runs the core rule with builtinGlobals false, the only lever that stops it firing on TS global augmentation. Measured 2026-09-15: restoring builtinGlobals true adds exactly 2 findings, src/types/global.d.ts:69 and src/types/expo.d.ts:2, both global augmentation that ESLint reports 0 of'),
    'prefer-promise-reject-errors': (EQUIVALENT, 'same as prefer-const: eslint-config-expensify/configs/private/best-practices.js:365 authors ["error", {allowEmptyReject: true}], which is exactly what oxlint mirrors'),
    'no-throw-literal': (ACCEPTED, 'shares the scripts/** and .github/** override with the no-unsafe-* family. ESLint has no matching block, and its seatbelt carries 0 entries for it repo-wide, so nothing is being suppressed that ESLint reports'),
    '@typescript-eslint/no-unsafe-assignment': (ACCEPTED, "off for scripts/** and .github/** because oxlint's tsgolint port of this family is stricter than typescript-eslint's, not because the paths are exempt. Measured 2026-09-15: deleting the override adds 695 findings across scripts/ and .github/ that ESLint reports 0 of. Not a type-info problem -- on the same file with the same program, typescript/no-unsafe-type-assertion agrees exactly (1 = 1 on .github/actions/javascript/proposalPoliceComment/proposalPoliceComment.ts, 8 = 8 on src/libs/memoize/index.ts), while no-unsafe-return is 3 vs 0 on that same memoize file. The divergence is global; the override just puts it where the loosely-typed GitHub Actions glue lives. ESLint's seatbelt carries 0 entries for all six rules repo-wide"),
    '@typescript-eslint/no-unsafe-argument': (ACCEPTED, 'same stricter-tsgolint override as no-unsafe-assignment'),
    '@typescript-eslint/no-unsafe-return': (ACCEPTED, 'same stricter-tsgolint override as no-unsafe-assignment; this is the one measurable outside the override too, 3 vs 0 on src/libs/memoize/index.ts'),
    '@typescript-eslint/no-unsafe-call': (ACCEPTED, 'same stricter-tsgolint override as no-unsafe-assignment'),
    '@typescript-eslint/no-unsafe-member-access': (ACCEPTED, 'same stricter-tsgolint override as no-unsafe-assignment; the largest of the six, 306 of the 695'),
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
            entry = findings.setdefault(rule_id, [None, None, [], []])
            if kind is None:
                entry[3].append(path)
                continue
            entry[0] = entry[0] or kind
            entry[1] = entry[1] or detail
            entry[2].append(path)
    # A rule that differs on some probed files and agrees on others is a SCOPE mismatch: both configs
    # enable it, they just do not enable it over the same files. That is the one shape a findings
    # comparison can never see, because a rule switched off for a file reports nothing there and
    # nothing is what parity looks like.
    for rule_id, entry in list(findings.items()):
        if entry[0] is None:
            del findings[rule_id]
            continue
        if entry[3]:
            entry[1] = f'{entry[1]} (differs on {len(entry[2])} of {len(entry[2]) + len(entry[3])} probed files)'
            entry[0] = 'scope'
    return {rid: tuple(entry) for rid, entry in findings.items()}


def probe_files():
    """Two files per rule-carrying block in either config, plus the blocks nothing matched.

    Delegated to resolveConfigs.mjs because the ESLint side's `files` entries can be predicate
    functions (that is what FlatCompat emits), which only the resolver can evaluate.
    """
    out = subprocess.run(
        ['node', os.path.join(HERE, 'resolveConfigs.mjs'), '--probe-files'],
        cwd=ROOT, capture_output=True, text=True, check=True,
    )
    return json.loads(out.stdout)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--json', help='write the full comparison to this path')
    parser.add_argument('--files', nargs='*', help='files to resolve (default: the representative set)')
    args = parser.parse_args()

    if args.files:
        files, unmatched = args.files, []
    else:
        probes = probe_files()
        files, unmatched = sorted(set(probes['files']) | set(REPRESENTATIVE_FILES)), probes['unmatched']
    missing = [f for f in files if not os.path.exists(os.path.join(ROOT, f))]
    if missing:
        sys.exit('probe file(s) missing, so the override(s) they stand for are unchecked:\n  ' + '\n  '.join(missing))
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
        for rule_id, (kind, detail, paths, _same) in sorted(by_status[OPEN]):
            print(f'  {rule_id} ({kind}, {len(paths)} file(s))')
            print(f'      {detail}')
            print(f'      {LEDGER[rule_id][1]}')

    if unlisted:
        print(f'\n{len(unlisted)} rule(s) differ and are not in LEDGER. This is what a config bump looks like:')
        for rule_id, (kind, detail, paths, _same) in sorted(unlisted.items()):
            print(f'  {rule_id} ({kind}, {len(paths)} file(s)): {detail}')

    if stale:
        print(f'\n{len(stale)} LEDGER entries no longer differ and should be deleted:')
        for rule_id in sorted(stale):
            print(f'  {rule_id}')

    if args.json:
        payload = {rid: {'kind': k, 'detail': d, 'differsOn': p, 'agreesOn': q, 'status': LEDGER.get(rid, (None, None))[0], 'reason': LEDGER.get(rid, (None, None))[1]} for rid, (k, d, p, q) in findings.items()}
        with open(args.json, 'w') as handle:
            json.dump(payload, handle, indent=1, sort_keys=True)
            handle.write('\n')

    if unmatched:
        print(f'\n{len(unmatched)} config block(s) carry rules but match no file in the repo, so every rule they set is dead:')
        for block in unmatched:
            print(f'  {block["linter"]} overrides[{block["index"]}] files={json.dumps(block["files"])}')

    if unlisted or stale or unmatched:
        sys.exit(1)
    print('\nNo unlisted drift. Every difference between the two configs is written down.')


if __name__ == '__main__':
    main()

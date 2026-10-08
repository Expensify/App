"""What is wrong with oxlint's native react/jsx-no-constructed-context-values?

    python3 oxlint-migration/compareNativeCtxValues.py            # whole repo, ~2 min
    python3 oxlint-migration/compareNativeCtxValues.py src/pages  # or a subtree, seconds

Runs oxlint ONCE with two implementations of the same rule enabled, both switched on in a throwaway
copy of the real config:

  react/jsx-no-constructed-context-values   oxlint's native Rust port  (off in production)
  esr/jsx-no-constructed-context-values     ESLint's own rule, hosted through a jsPlugin, ungated

The production config runs neither of these. It runs `hosted/jsx-no-constructed-context-values`,
ESLint's rule behind the React Compiler gate. The `esr` alias here is deliberately ungated, because
the point is to compare rule behaviour, not to reproduce what ships.

and pairs their findings so the differences are readable rather than a wall of counts. ESLint's
message states BOTH lines it cares about ("(at line 53) ... (at line 58)"), so pairing is exact:
its second line is the provider, which is where native reports.

Three things come out of it:

  1. ANCHOR      same finding, different reported line. ESLint points at the declaration and names
                 the variable; native points at the JSX provider with a generic message. This is
                 why the existing eslint-disable comments do not suppress native.
  2. EXTRA       native reports, ESLint does not. ESLint requires the value to be declared inside
                 the component that renders it; native does not check the scope.
  3. SUPPRESSED  ESLint findings that an existing disable comment already silences. Listed
                 separately so they are not read as differences.

Note this rule is NOT at parity even where the two agree: ESLint's processor drops every message
from it in files both React compilers memoize, so ESLint reports 0 repo-wide today. See
"React Compiler checks" in OXLINT_MIGRATION_INVESTIGATION.md.
"""

import collections
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG = os.path.join(ROOT, '.oxlintrc.measure-ctx-values.json')
RULE = 'react/jsx-no-constructed-context-values'
NATIVE_CODE = 'react(jsx-no-constructed-context-values)'
ESLINT_CODE = 'esr(jsx-no-constructed-context-values)'

# Text patch rather than an `extends` wrapper: oxlint's `extends` does not inherit ignorePatterns,
PLUGIN_ANCHOR = '{"name": "rh", "specifier": "./config/oxlint/plugins/rh-plugin.mjs"}'
PLUGIN_ENTRY = PLUGIN_ANCHOR + ',\n        {"name": "esr", "specifier": "./oxlint-migration/eslint-ctx-values-rule.mjs"}'


def write_config():
    text = open(os.path.join(ROOT, '.oxlintrc.json')).read()
    native_off = f'"{RULE}": "off"'
    if text.count(native_off) != 1:
        sys.exit(f'expected exactly one `{native_off}` in .oxlintrc.json, found {text.count(native_off)}')
    text = text.replace(PLUGIN_ANCHOR, PLUGIN_ENTRY)
    text = text.replace(native_off, f'"{RULE}": "error",\n        "esr/jsx-no-constructed-context-values": "error"')
    open(CONFIG, 'w').write(text)


def run_oxlint(targets):
    command = ['npx', 'oxlint', '-c', os.path.basename(CONFIG), '--format', 'json', *targets]
    result = subprocess.run(command, capture_output=True, text=True, cwd=ROOT)
    try:
        return json.loads(result.stdout)['diagnostics']
    except (json.JSONDecodeError, KeyError):
        sys.exit(f'oxlint run failed:\n{result.stdout[:600]}{result.stderr[:600]}')


SOURCE = {}


def lines_of(path):
    if path not in SOURCE:
        try:
            SOURCE[path] = open(os.path.join(ROOT, path)).read().splitlines()
        except OSError:
            SOURCE[path] = []
    return SOURCE[path]


def source(path, line):
    text = lines_of(path)
    return text[line - 1].strip() if 0 < line <= len(text) else '<source unavailable>'


def is_suppressed(path, line):
    """Does an existing eslint-disable comment already silence a finding on this line?"""
    text = lines_of(path)
    if any(re.search(r'/\*\s*eslint-disable\s+' + re.escape(RULE), one) for one in text):
        return True
    return line >= 2 and RULE in text[line - 2] and 'eslint-disable' in text[line - 2]


def declaration_of(path, provider_line):
    """The identifier passed as `value`, and where it is declared. None for inline literals."""
    text = lines_of(path)
    window = ' '.join(text[provider_line - 1:provider_line + 2])
    match = re.search(r'value=\{(\w+)\}', window)
    if not match:
        return None, None
    name = match.group(1)
    pattern = re.compile(r'\b(?:const|let|var|function)\s+' + re.escape(name) + r'\b')
    for index in range(min(provider_line, len(text)) - 1, -1, -1):
        if pattern.search(text[index]):
            return name, index + 1
    return name, None


def enclosing_function(path, line):
    """Nearest function header above `line`, as (name, line). Regex, so treat it as a hint."""
    text = lines_of(path)
    pattern = re.compile(r'^\s*(?:export\s+(?:default\s+)?)?(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:\([^)]*\)|\w+)\s*=>|const\s+(\w+)\s*=\s*function)')
    for index in range(min(line, len(text)) - 1, -1, -1):
        match = pattern.match(text[index])
        if match:
            return next(group for group in match.groups() if group), index + 1
    return None, None


def collect(diagnostics):
    """native: {(file, provider_line)}; eslint: {(file, provider_line): declaration_line}."""
    native, eslint = set(), {}
    for diagnostic in diagnostics:
        code = diagnostic.get('code') or ''
        labels = diagnostic.get('labels') or []
        line = labels[0]['span']['line'] if labels else 0
        path = diagnostic['filename']
        if code == NATIVE_CODE:
            native.add((path, line))
        elif code == ESLINT_CODE:
            # ESLint's message cites the object and the provider ("The 'x' object (at line 53) passed
            # as the value prop to the Context provider (at line 58)"); one `at line` means an inline
            # literal, and then the reported line IS the provider.
            cited = [int(value) for value in re.findall(r'\(at line (\d+)\)', diagnostic.get('message', ''))]
            provider = cited[-1] if cited else line
            eslint[(path, provider)] = line
    return native, eslint


def main(targets):
    write_config()
    try:
        native, eslint = collect(run_oxlint(targets))
    finally:
        os.remove(CONFIG)

    anchor, agree, suppressed, extra = [], [], [], []
    for key in sorted(eslint):
        path, provider = key
        declaration = eslint[key]
        if is_suppressed(path, declaration):
            suppressed.append((path, declaration, provider, key not in native))
        elif key not in native:
            continue
        elif declaration == provider:
            agree.append((path, provider))
        else:
            anchor.append((path, declaration, provider))
    missed = sorted(key for key in eslint if key not in native and not is_suppressed(key[0], eslint[key]))
    extra = sorted(key for key in native if key not in eslint)

    print(f'\nnative {len(native)} findings / {len({f for f, _ in native})} files'
          f'    ESLint rule {len(eslint)} findings / {len({f for f, _ in eslint})} files\n')

    print('=' * 100)
    print(f'1. ANCHOR -- same finding, different line ({len(anchor)})')
    print('   ESLint points at the declaration and names the variable. Native points at the JSX')
    print('   provider. An eslint-disable comment written above the declaration misses native.')
    print('=' * 100)
    for path, declaration, provider in anchor:
        print(f'\n{path}')
        print(f'   eslint {declaration:5} | {source(path, declaration)[:110]}')
        print(f'   native {provider:5} | {source(path, provider)[:110]}')

    print('\n' + '=' * 100)
    print(f'2. EXTRA -- native reports, ESLint does not ({len(extra)} findings, '
          f'{len({f for f, _ in extra})} files)')
    print('   ESLint only reports a value declared INSIDE the component that renders it.')
    print('=' * 100)
    for path, provider in extra:
        name, declared = declaration_of(path, provider)
        function_name, function_line = enclosing_function(path, provider)
        print(f'\n{path}')
        print(f'   native {provider:5} | {source(path, provider)[:110]}')
        if name and declared:
            where = f'declared at line {declared}'
            if function_line and declared < function_line:
                where += f', outside `{function_name}` which starts at line {function_line}'
            print(f'   `{name}` {where}')
            print(f'   {declared:12} | {source(path, declared)[:110]}')
        elif name:
            print(f'   `{name}` is not declared in this file (imported or a parameter)')
        else:
            print('   value is an inline literal here -- both rules should agree, so this one is worth a look')

    if missed:
        print('\n' + '=' * 100)
        print(f'2b. ESLint reports, native does NOT ({len(missed)}) -- there were none when this was written')
        print('=' * 100)
        for path, provider in missed:
            print(f'\n{path}')
            print(f'   eslint {eslint[(path, provider)]:5} | {source(path, eslint[(path, provider)])[:110]}')

    print('\n' + '=' * 100)
    print(f'3. Findings an existing eslint-disable comment already silences ({len(suppressed)})')
    print('   "silences native too" is False wherever the comment sits above the declaration but')
    print('   native reports on the provider line, which is the anchor difference biting.')
    print('=' * 100)
    for path, declaration, provider, silences_native in suppressed:
        print(f'   eslint {declaration:5}  native {provider:5}  silences native too: {str(silences_native):5}  {path}')

    print('\n' + '=' * 100)
    print('Summary')
    print('=' * 100)
    print(f'   agree on file AND line              : {len(agree)}')
    print(f'   agree on the finding, differ on line: {len(anchor)}')
    print(f'   native-only (false positives)       : {len(extra)}')
    print(f'   ESLint-only (native missed)         : {len(missed)}')
    print(f'   already suppressed by a comment     : {len(suppressed)}, of which '
          f'{sum(1 for row in suppressed if not row[3])} do NOT suppress native')
    by_area = collections.Counter('tests/' if f.startswith('tests/') else f.split('/')[0] + '/' for f, _ in extra)
    print(f'   native-only by area                 : {dict(by_area)}')


if __name__ == '__main__':
    main(sys.argv[1:] or ['.'])

"""Shared rule-name mapping and config readers for the ESLint/Oxlint comparison tooling.

Imported by:
    oxlint-migration/compareFullRepo.py   -- finding-by-finding parity on the whole repo
    oxlint-migration/listAllRules.py      -- inventory of every rule either tool enables
    oxlint-migration/rule-tester/compareRuleTester.py -- replays the upstream RuleTester cases on both tools

Nothing here runs a linter; it only reads configs and static catalogues.
"""

import json
import os
import re
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# One file per distinct ESLint config scope, so the union of their `--print-config`
# output covers every rule the repo can apply. Getting this list wrong understates
# ESLint's rule set silently: before the last three entries were added the union missed
# 24 rules, because every file here was TypeScript and typescript-eslint switches a batch
# of core rules off for TS (`no-undef`, `no-unreachable`, `constructor-super`, ...) while
# leaving them on for plain JS. Add a file here whenever a new `files:` block is added
# to config/eslint/eslint.config.mjs.
REPRESENTATIVE_FILES = [
    'src/App.tsx',
    'src/libs/actions/Report/index.ts',
    'tests/ui/ReportActionsListTest.tsx',
    'scripts/utils/OpenAIUtils.ts',
    '.github/scripts/createDocsRoutes.ts',
    'index.js',  # plain JS: core rules typescript-eslint replaces in TS files
    'config/rsbuild/loaders/worklets-loader.mjs',  # the `config/rsbuild/loaders/*-loader.mjs` override
    'src/languages/en.ts',  # the en.ts/es.ts override (rulesdir/use-periods-for-error-messages)
]

# typescript-eslint "extension rules" that oxlint implements as its (TS-aware) base
# rule -- @typescript-eslint/no-shadow is covered by oxlint's plain no-shadow, etc.
TS_EXTENSION_RULES = {
    'default-param-last', 'max-params', 'no-array-constructor', 'no-dupe-class-members',
    'no-empty-function', 'no-loop-func', 'no-loss-of-precision', 'no-redeclare',
    'no-shadow', 'no-unused-expressions', 'no-unused-vars', 'no-use-before-define',
    'no-useless-constructor',
}

# Port plan for every rule ESLint enables and the mirrored oxlint config does not.
# `mechanism` is what closing the gap would take, `effort` is a rough size, and
# `proven` marks the ones demonstrated end-to-end by oxlint-migration/port-probe.
# Keep in sync with the "Porting plan" section of OXLINT_MIGRATION_INVESTIGATION.md.
PORT_PLAN = {
    # -- structural / infrastructure: no oxlint concept, stays on ESLint --
    'eslint-seatbelt/configure': {
        'mechanism': 'none - debt-tracker pseudo-rule driven by an ESLint processor',
        'effort': 'blocker', 'proven': False,
        'notes': 'obstacle #1; needs an oxlint-native baseline or a custom differ over oxlint JSON',
    },
    'progress/activate': {
        'mechanism': 'drop - oxlint prints its own progress',
        'effort': 'none', 'proven': False,
        'notes': 'ESLint progress-bar plugin, no behaviour to preserve',
    },
    # WIRED 2026-08-12, both of the react-compiler-gated rules: react/jsx-no-constructed-context-values
    # (as hosted/, from eslint-plugin-react) and rulesdir/no-inline-useOnyx-selector. ESLint's
    # processor drops every message from either one in a file both React compilers memoize, and
    # config/oxlint/reactCompilerGate.mjs replicates that inside the JS plugin. Native was built and
    # measured for the context rule first and rejected: it cannot be gated, so it needs 115 inline
    # suppressions and one per new context provider forever. Its two divergences from ESLint's rule
    # are recorded in oxlint-migration/compareNativeCtxValues.py.
    # -- dropped 2026-08-21 with the move to the Rust React Compiler (OXLINT_RUST_COMPILER_PLAN.md) --
    # The other 12 compiler rules moved to rc/* over oxc-transform-react. These two could not come
    # along: each needs per-rule options handed to the compiler, and rc/* runs ONE cached analysis per
    # file with a fixed option set, which is what makes it 10x faster than the sidecar. Leaving either
    # one on the sidecar would have kept the entire 52 s JavaScript analysis, i.e. the whole saving.
    'react-hooks/config': {
        'mechanism': 'dropped - validates compiler options, and rc/* passes none from config',
        'effort': 'none', 'proven': False,
        'notes': 'inert in this repo either way: the ESLint plugin only reaches its config validator '
                 'through per-rule options (COMPILER_OPTIONS merged with userOpts, '
                 'eslint-plugin-react-hooks.development.js:51821) and eslint-config-expensify enables it '
                 'with none (configs/public/react.js:448)',
    },
    'react-hooks/gating': {
        'mechanism': 'dropped - needs a gating/dynamicGating source in rule options',
        'effort': 'none', 'proven': False,
        'notes': 'a `use memo if(...)` directive only produces Gating diagnostics when the compiler is '
                 'given a dynamicGating source, which is why the fixture had to supply one in both '
                 'fixture configs; production supplies none, so the rule cannot fire',
    },
    # -- blocked by a missing API in oxlint's JS-plugin bridge, not by types --
    'no-invalid-this': {
        'mechanism': 'blocked - oxlint\'s bridge throws on sourceCode.getJSDocComment',
        'effort': 'blocked', 'proven': False,
        'notes': 'measured: hosting it errors on 36 files (dist/lint.js:5765 is a bare throw, reached '
                 'via astUtils.hasJSDocThisTag), plus 2 more from the code-path analyzer it needs on '
                 '.d.ts files whose `declare module` has no body (same bug as obstacle #5). TS files are '
                 'largely covered anyway by noImplicitThis from tsconfig strict, so the exposure is '
                 'the plain .js/.mjs files',
    },
    # -- need TypeScript type info, which jsPlugins cannot reach --
    # WIRED 2026-08-12: rulesdir/prefer-locale-compare-from-context turned out not to need types at
    # all. Its only type query is "is the receiver a string", and localeCompare exists on exactly one
    # built-in prototype, so config/oxlint/preferLocaleCompareFromContext.mjs drops the query rather
    # than approximating it. The one shape where that differs from ESLint (a receiver defining its own
    # localeCompare) does not occur in src/, and is asserted as an expected divergence by
    # oxlint-migration/checkLocaleComparePort.py.
    'rulesdir/prefer-at': {
        'mechanism': 'blocked - needs typeChecker.isArrayType to tell arrays from records',
        'effort': 'blocked, partial', 'proven': False,
        'notes': 'a syntactic port would fire on every obj[key]: measured 2026-08-13, oxlint\'s '
                 'unicorn/prefer-at with checkAllIndexAccess reports 413 findings in src/ and ESLint\'s '
                 'type-aware rule confirms 0 of the sampled 104 as real array reads. But the same rule '
                 'at DEFAULT options covers the x[x.length - N] family, exists natively in oxlint AND '
                 'upstream in eslint-plugin-unicorn (already a dependency), and the two agree exactly: '
                 '2 findings, same 2 lines, over the whole production file set. Same rule id on both '
                 'tools, so one eslint-disable comment suppresses both and no twin is needed. Enabling '
                 'it recovers everything except plain arr[0]/arr[i]. See step 10a of '
                 'OXLINT_MIGRATION_STEPS.md',
    },
    'rulesdir/boolean-conditional-rendering': {
        'mechanism': 'blocked - needs the type of the && left operand',
        'effort': 'blocked', 'proven': False,
        'notes': 'wait for typed jsPlugins',
    },
    '@typescript-eslint/no-unnecessary-type-assertion': {
        'mechanism': 'implemented in tsgolint, but tsgo (TS7) inference diverges from TS 6.0.2: measured 685 findings vs ESLint 0',
        'effort': 'blocked', 'proven': False,
        'notes': 'revisit when the repo moves to TS 7',
    },
    # -- available in oxlint, held back by a code cleanup rather than tooling --
    'import/no-cycle': {
        'mechanism': "enable oxlint's native import/no-cycle",
        'effort': 'L (cleanup, not porting)', 'proven': False,
        'notes': "ESLint's copy is silently inert; oxlint finds 529 real cycles",
    },
}

# Deliberately empty since 2026-08-11. It used to hold the 28 rules oxlint has no native port
# for, on the argument that they are dead weight. That argument did not survive being tested:
# hosting all 28 at once showed 27 of them run correctly through the jsPlugins the config already
# loads, so they are wired now and the only cost is sidecar time (+6 s for core+import, +13 s for
# the 17 react rules on a 101-second run). The 28th, no-invalid-this, is a coverage gap with a
# named blocker in PORT_PLAN, not dead weight. Kept as a name because listAllRules reads it, and
# because an empty set is the honest answer: no rule here is off for lack of value.
KNOWN_NOT_IMPLEMENTED_LOW_VALUE = set()


# ESLint rules that oxlint only implements under their post-rename name. Without the mapping a
# rename reads as two separate problems -- an ESLint rule with no counterpart, plus an oxlint-only
# rule nobody asked for -- when it is one rule under two spellings.
OXLINT_RENAMES = {
    'no-object-constructor': 'no-new-object',
    'no-new-native-nonconstructor': 'no-new-symbol',
}
ESLINT_RENAMES = {es: ox for ox, es in OXLINT_RENAMES.items()}


# config/oxlint/plugins/hosted-rules.mjs re-exports these under the `hosted/` alias, because oxlint
# reserves the real plugin names (react, import, jsdoc) for its own implementations.
HOSTED_RULE_ORIGIN = {
    'jsx-no-bind': 'react',
    'function-component-definition': 'react',
    # wired 2026-08-12: hosted, not native, because only a JS plugin can hold the React Compiler
    # gate (and the native port diverges twice -- see oxlint-migration/compareNativeCtxValues.py)
    'jsx-no-constructed-context-values': 'react',
    # wired 2026-08-25: hosted for the same reason one level finer. The processor filters this rule
    # per message rather than per rule, and oxlint's native react/exhaustive-deps is a Rust rule that
    # nothing can filter: it reported 49 against ESLint's 1.
    'exhaustive-deps': 'react-hooks',
    'prefer-default-export': 'import',
    'order': 'import',
    'no-types': 'jsdoc',
    'naming-convention': '@typescript-eslint',
    # wired 2026-08-11: no native oxlint port, hosted from the same package ESLint uses
    'no-import-module-exports': 'import',
    'no-relative-packages': 'import',
    'no-useless-path-segments': 'import',
    'default-props-match-prop-types': 'react',
    'forbid-foreign-prop-types': 'react',
    'forbid-prop-types': 'react',
    'jsx-uses-react': 'react',
    'jsx-uses-vars': 'react',
    'no-access-state-in-setstate': 'react',
    'no-arrow-function-lifecycle': 'react',
    'no-deprecated': 'react',
    'no-invalid-html-attribute': 'react',
    'no-typos': 'react',
    'no-unused-class-component-methods': 'react',
    'no-unused-prop-types': 'react',
    'no-unused-state': 'react',
    'prefer-exact-props': 'react',
    'prefer-stateless-function': 'react',
    'sort-comp': 'react',
    'static-property-placement': 'react',
}


def norm_ox(code):
    """Normalize an oxlint diagnostic code -- `plugin(rule)` -- to the ESLint rule name."""
    m = re.match(r'^([\w@/.-]+)\((.+)\)$', code)
    if not m:
        return code
    plugin, rule = m.groups()
    if plugin in ('eslint', 'core'):
        # 'core' is the jsPlugin alias for re-exported ESLint core rules
        return OXLINT_RENAMES.get(rule, rule)
    if plugin == 'typescript':
        return f'@typescript-eslint/{rule}'
    if plugin == 'rc' or (plugin == 'react' and rule in ('exhaustive-deps', 'rules-of-hooks')):
        # 'rc' hosts the 12 React Compiler rules of eslint-plugin-react-hooks, reimplemented over the
        # Rust compiler (config/oxlint/reactCompilerRust.mjs); oxlint's native react/exhaustive-deps
        # and react/rules-of-hooks are the same plugin's other two rules. All normalize to the ESLint
        # names, which is also what their diagnostics and existing disable comments use.
        return f'react-hooks/{rule}'
    if plugin == 'hosted':
        return f'{HOSTED_RULE_ORIGIN[rule]}/{rule}'
    if plugin == 'jsx_a11y':
        return f'jsx-a11y/{rule}'
    return f'{plugin}/{rule}'


def norm_es(rid):
    """Normalize an ESLint message ruleId to a stable rule name."""
    if rid is None:
        # ESLint uses a null rule ID for parse errors AND unused-directive notices
        return '<fatal/unused-directive>'
    # the stratify processor splits no-deprecated into per-API synthetic IDs
    if rid.startswith('@typescript-eslint/no-deprecated/'):
        return '@typescript-eslint/no-deprecated'
    return rid


def norm_ox_config(rule_id):
    """Map an .oxlintrc.json rule key to its ESLint name."""
    if rule_id.startswith('typescript/'):
        return '@typescript-eslint/' + rule_id.split('/', 1)[1]
    if rule_id.startswith('core/'):
        return rule_id.split('/', 1)[1]
    if rule_id.startswith('rc/'):
        return 'react-hooks/' + rule_id.split('/', 1)[1]
    if rule_id.startswith('hosted/'):
        rule = rule_id.split('/', 1)[1]
        return f'{HOSTED_RULE_ORIGIN[rule]}/{rule}'
    if rule_id in ('react/exhaustive-deps', 'react/rules-of-hooks'):
        return 'react-hooks/' + rule_id.split('/', 1)[1]
    return OXLINT_RENAMES.get(rule_id, rule_id)


def is_on(value):
    sev = value[0] if isinstance(value, list) else value
    return sev not in ('off', 'allow', 0, '0')


def load_jsonc(path):
    """json.load for oxlint configs, which are JSONC.

    The comments are not decoration: every `"off"` in .oxlintrc.json carries the reason it is off
    on the line above it, so the parser has to tolerate them.
    """
    text = open(path).read()
    out, index, end = [], 0, len(text)
    while index < end:
        if text[index] == '"':
            close = index + 1
            while close < end and (text[close] != '"' or text[close - 1] == '\\'):
                close += 1
            out.append(text[index : close + 1])
            index = close + 1
        elif text.startswith('//', index):
            while index < end and text[index] != '\n':
                index += 1
        else:
            out.append(text[index])
            index += 1
    return json.loads(''.join(out))


def oxlint_enabled_rules(config_path=None):
    """Rule names (ESLint naming) enabled anywhere in .oxlintrc.json -- root or overrides."""
    path = config_path or os.path.join(ROOT, '.oxlintrc.json')
    config = load_jsonc(path)
    enabled = set()
    for scope in [config.get('rules', {})] + [o.get('rules', {}) for o in config.get('overrides', [])]:
        for rid, val in scope.items():
            if is_on(val):
                enabled.add(norm_ox_config(rid))
    return enabled


def oxlint_disabled_rules(config_path=None):
    """Rule name (ESLint naming) -> where it is switched off, for rules nothing re-enables.

    Separates a deliberate `"off"` (reason in a comment next to it, and in PORT_PLAN) from a rule
    that is merely absent, which reads the same in a diff but means something else entirely.
    """
    path = config_path or os.path.join(ROOT, '.oxlintrc.json')
    config = load_jsonc(path)
    enabled = oxlint_enabled_rules(path)
    disabled = {}
    scopes = [('root', config.get('rules', {}))]
    scopes += [('an override', override.get('rules', {})) for override in config.get('overrides', [])]
    for where, scope in scopes:
        for rid, val in scope.items():
            name = norm_ox_config(rid)
            if not is_on(val) and name not in enabled:
                disabled.setdefault(name, where)
    return disabled


def eslint_enabled_rules(files=None, fold_extension_rules=True):
    """Rule names enabled by the real ESLint config, the union over the representative files.

    With `fold_extension_rules` (the default) a typescript-eslint extension rule is reported
    under its base name, because that is the rule oxlint runs (its base rules are TS-aware).
    Pass False for the ids exactly as ESLint uses them -- needed by callers that list both the
    extension rule and the base rule as separate rows and must not count one rule twice.
    """
    enabled = set()
    for rel in files or REPRESENTATIVE_FILES:
        path = os.path.join(ROOT, rel)
        if not os.path.exists(path):
            continue
        out = subprocess.run(['npx', 'eslint', '--print-config', path], capture_output=True, text=True, cwd=ROOT).stdout
        try:
            config = json.loads(out)
        except json.JSONDecodeError:
            print(f'  (could not read ESLint config for {rel} -- skipped)')
            continue
        for rid, val in (config.get('rules') or {}).items():
            sev = val[0] if isinstance(val, list) else val
            if sev in ('off', 0):
                continue
            rid = norm_es(rid)
            if fold_extension_rules and rid.startswith('@typescript-eslint/') and rid.split('/', 1)[1] in TS_EXTENSION_RULES:
                rid = rid.split('/', 1)[1]
            enabled.add(rid)
    return enabled


def oxlint_catalogue():
    """Rules oxlint implements natively, in ESLint naming, from its JSON schema.

    A miss here does not mean the rule is dead: it may be hosted by a jsPlugin
    instead (see js_plugin_rules). Rules that are in neither set are silently
    inert -- oxlint validates root `rules` against loaded plugins but accepts
    anything inside `overrides`, so only a fixture proves a rule actually runs.
    """
    schema_path = os.path.join(ROOT, 'node_modules/oxlint/configuration_schema.json')
    names = json.load(open(schema_path))['definitions']['DummyRuleMap']['properties']
    catalogue = set()
    for name in names:
        # a rule oxlint only ships under its post-rename name is listed under the name ESLint
        # enables, so it matches instead of showing up as an unrelated oxlint-only rule
        catalogue.add(OXLINT_RENAMES.get(name, name))
        if name.startswith('typescript/'):
            catalogue.add('@typescript-eslint/' + name.split('/', 1)[1])
        elif name.startswith('react/') and name.split('/', 1)[1] in ('exhaustive-deps', 'rules-of-hooks'):
            catalogue.add('react-hooks/' + name.split('/', 1)[1])
    return catalogue


def js_plugin_rules(config_path=None):
    """Rule name (ESLint naming) -> jsPlugin alias, for every rule the configured jsPlugins host.

    Loads the plugin modules the way oxlint does and reads their meta.name + rule keys,
    so this stays correct when a plugin gains or loses rules. Covers both the root
    `jsPlugins` list and the per-override ones -- the migrated config uses overrides to
    host whole ESLint plugins by bare package name (eslint-plugin-testing-library,
    eslint-plugin-react-native-a11y, eslint-plugin-you-dont-need-lodash-underscore,
    eslint-plugin-lodash, @dword-design/eslint-plugin-import-alias).

    An entry may also be oxlint's documented object form, {"name": ..., "specifier": ...},
    which declares the alias in the config instead of leaving it to the plugin's meta.name.
    A declared name wins, exactly as it does in oxlint.
    """
    path = config_path or os.path.join(ROOT, '.oxlintrc.json')
    config_dir = os.path.dirname(os.path.abspath(path))
    config = load_jsonc(path)
    entries = list(config.get('jsPlugins') or [])
    for override in config.get('overrides', []):
        entries.extend(override.get('jsPlugins') or [])
    declared = {}
    plugins = []
    for entry in entries:
        spec = entry['specifier'] if isinstance(entry, dict) else entry
        if isinstance(entry, dict) and entry.get('name'):
            declared[spec] = entry['name']
        if spec not in plugins:
            plugins.append(spec)
    if not plugins:
        return {}
    script = (
        'const out = {};'
        'for (const spec of process.argv.slice(1)) {'
        '  try {'
        '    const mod = await import(spec);'
        '    const plugin = mod.default ?? mod;'
        '    out[spec] = {name: plugin.meta?.name ?? null, rules: Object.keys(plugin.rules ?? {})};'
        '  } catch {'
        '    out[spec] = {name: null, rules: []};'
        '  }'
        '}'
        'console.log(JSON.stringify(out));'
    )
    # relative paths resolve against the config file; bare specifiers are npm packages
    resolved = {spec: (os.path.abspath(os.path.join(config_dir, spec)) if spec.startswith('.') else spec) for spec in plugins}
    declared_by_resolved = {resolved[spec]: name for spec, name in declared.items()}
    out = subprocess.run(['node', '--input-type=module', '-e', script, '--', *resolved.values()], capture_output=True, text=True, cwd=ROOT)
    try:
        hosted = json.loads(out.stdout.strip().splitlines()[-1])
    except (json.JSONDecodeError, IndexError):
        return {}
    mapping = {}
    for spec, plugin in hosted.items():
        # oxlint prefixes rules with the declared name, else the plugin's meta.name (else the
        # package name), always with the eslint-plugin- marker stripped: @scope/eslint-plugin-x -> @scope/x
        raw = declared_by_resolved.get(spec) or plugin['name'] or (os.path.basename(spec) if spec.startswith('/') else spec)
        alias = re.sub(r'(^|/)eslint-plugin-', r'\1', raw)
        for rule in plugin['rules']:
            mapping[norm_ox_config(f'{alias}/{rule}')] = alias
    return mapping


def eslint_installed_rules():
    """Every rule the installed ESLint + its registered plugins *expose*, enabled or not.

    Rule name -> source ('core' or the plugin prefix). Read by loading the real flat config
    and walking each config object's `plugins` map, so it covers exactly what this repo has
    installed -- not what some published rule list claims.
    """
    script = (
        "const mod = await import('./eslint.config.mjs');"
        'const flat = (Array.isArray(mod.default) ? mod.default : [mod.default]).flat(Infinity);'
        'const out = {};'
        "const {builtinRules} = await import('eslint/use-at-your-own-risk');"
        "for (const name of builtinRules.keys()) out[name] = 'core';"
        'for (const config of flat) {'
        '  for (const [prefix, plugin] of Object.entries(config?.plugins ?? {})) {'
        '    for (const rule of Object.keys(plugin?.rules ?? {})) out[`${prefix}/${rule}`] = prefix;'
        '  }'
        '}'
        'console.log(JSON.stringify(out));'
    )
    out = subprocess.run(['node', '--input-type=module', '-e', script], capture_output=True, text=True, cwd=ROOT)
    try:
        return json.loads(out.stdout.strip().splitlines()[-1])
    except (json.JSONDecodeError, IndexError):
        print(f'  (could not enumerate installed ESLint rules: {out.stderr.strip()[:200]})')
        return {}


def oxlint_available_rules():
    """Every rule this oxlint install can run, in ESLint naming.

    Rule name -> source ('native' or 'js:<alias>'). Native rules come from oxlint's JSON
    schema because `oxlint --rules` prints nothing in 1.77; hosted rules come from the
    jsPlugins the config loads, which is where the ESLint plugin rules live.
    """
    available = {name: 'native' for name in oxlint_catalogue()}
    for rule, alias in js_plugin_rules().items():
        available.setdefault(rule, f'js:{alias}')
    return available


def tsgolint_rules():
    """Type-aware rule -> implemented?, parsed from the oxlint-tsgolint README checklist."""
    readme = os.path.join(ROOT, 'node_modules/oxlint-tsgolint/README.md')
    if not os.path.exists(readme):
        return {}
    rows = re.findall(r'^- \[([ x])\] \[([^\]]+)\]', open(readme).read(), re.M)
    return {f'@typescript-eslint/{name}': flag == 'x' for flag, name in rows}

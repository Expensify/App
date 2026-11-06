/**
 * Turns the eslint-config-expensify presets (presets.mjs) into oxlint config each time oxlint loads oxlint.config.mts,
 * so upgrading the presets needs no config edits. Rules oxlint can't run itself run from ESLint's code through the
 * `core` and `hosted` plugins in ./plugins. If a preset rule can't run, loading fails until its plugin is added to
 * HOSTED_PLUGIN_PACKAGES or the rule is listed in DROPPED_RULES or STAND_INS.
 */
import migrate from '@oxlint/migrate';
import {builtinRules} from 'eslint/use-at-your-own-risk';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import presets from './presets.mjs';
import {RULE_BY_CATEGORY} from './reactCompilerRust.mjs';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const expensifyConfigDirectory = path.dirname(require.resolve('eslint-config-expensify', {paths: [repoRoot]}));

/**
 * Resolves a package the presets use. Their ESLint plugins are dependencies of eslint-config-expensify, so they are
 * looked up there first.
 * @param {string} request a package name, like `eslint-plugin-react`
 * @returns {string} the resolved file path
 */
function resolvePackage(request) {
    return require.resolve(request, {paths: [expensifyConfigDirectory, repoRoot]});
}

// ESLint plugins whose rules can run as `hosted/<rule>`. oxlint keeps the names react, import, jsdoc,
// @typescript-eslint and react-hooks for its own rules, so a JS plugin can't use them.
const HOSTED_PLUGIN_PACKAGES = {
    react: 'eslint-plugin-react',
    import: 'eslint-plugin-import',
    jsdoc: 'eslint-plugin-jsdoc',
    '@typescript-eslint': '@typescript-eslint/eslint-plugin',
    'react-hooks': 'eslint-plugin-react-hooks',
    storybook: 'eslint-plugin-storybook',
};

// Rules that run from ESLint's code, as `hosted/<name>`, even though oxlint has its own version.
const ALWAYS_HOSTED = new Set([
    // oxlint's version reports on a different line than ESLint's.
    'import/prefer-default-export',
    // oxlint's version also reports components defined inside `jest.mock()` factories.
    'react/function-component-definition',
    // oxlint's version reports on the JSX provider instead of the value, and reactCompilerGate.mjs only works on JS
    // plugin rules.
    'react/jsx-no-constructed-context-values',
    // reactCompilerGate.mjs needs ESLint's message wording to find the useCallback/useMemo reports.
    'react-hooks/exhaustive-deps',
]);

// Hosted rules that no preset turns on but oxlint.config.mts does. oxlint has no native version of any of them.
const APP_HOSTED_RULES = [
    'jsdoc/require-jsdoc',
    'react/no-unused-prop-types',
    'storybook/await-interactions',
    'storybook/context-in-play-function',
    'storybook/default-exports',
    'storybook/hierarchy-separator',
    'storybook/no-redundant-story-name',
    'storybook/no-renderer-packages',
    'storybook/no-uninstalled-addons',
    'storybook/prefer-pascal-case',
    'storybook/story-exports',
    'storybook/use-storybook-expect',
    'storybook/use-storybook-testing-library',
];

// The App's own rules in the `hosted` plugin, and the ESLint rule ID each one reports as.
const LOCAL_HOSTED_RULES = {
    // tsgolint misses `<MenuItem />`; see noDeprecatedSelfClosingJsx.mjs.
    'no-deprecated-self-closing-jsx': '@typescript-eslint/no-deprecated',
};

// naming-convention is marked as needing type information, which oxlint JS plugins don't get. It only uses types for
// options that set `types`, which the presets don't, so plugins/hosted-rules.mjs gives it empty parser services.
const STUBBED_PARSER_SERVICES = new Set(['@typescript-eslint/naming-convention']);

const DROPPED_RULES = {
    'no-invalid-this': 'calls sourceCode.getJSDocComment, which oxlint JS plugins do not support',
    'react-hooks/component-hook-factories': 'React Compiler check that the Rust port does not report',
    'react-hooks/config': 'React Compiler check that the Rust port does not report',
    'react-hooks/gating': 'React Compiler check that the Rust port does not report',
    'rulesdir/boolean-conditional-rendering': 'needs the type of the `&&` left operand, and JS plugins get no type information',
};

// oxlint rules used instead of preset rules that need type information. unicorn/prefer-at keeps its default options;
// `checkAllIndexAccess` would also flag reads like `result[0]`.
const STAND_INS = {
    'rulesdir/prefer-at': 'unicorn/prefer-at',
};

// oxlint's versions of these accept no options and fail to load when given ESLint's.
const DROP_OPTIONS = new Set(['react/jsx-no-duplicate-props', 'react/jsx-no-undef']);

// ESLint's deprecated core rule names, and the names oxlint runs them under.
const ESLINT_RULE_RENAMES = {
    'no-new-object': 'no-object-constructor',
    'no-new-symbol': 'no-new-native-nonconstructor',
};

// React Compiler rules run as `rc/<name>` (plugins/rc-rules.mjs). oxlint's built-in react/<name> versions are not used:
// an `eslint-disable` comment for react-hooks/exhaustive-deps or react-hooks/rules-of-hooks also hides every compiler
// error in that component (https://github.com/oxc-project/oxc/issues/26277).
const REACT_COMPILER_RULES = new Set(Object.values(RULE_BY_CATEGORY));

// @oxlint/migrate warnings that are safe to ignore: dropped settings this file restores or that keep their defaults,
// the parser, and globals. Any other warning may mean a rule was lost or changed scope, so loading stops.
const EXPECTED_WARNINGS = [/^Settings not migrated/, /^Settings found under a 'files' pattern/, /^special parser detected/, /^react\.version "detect"/, /^Added \d+ globals/];

/**
 * @param {unknown} entry a rule setting, like `'error'` or `['error', {...}]`
 * @returns {unknown} its severity, like `'error'` or `2`
 */
const getSeverity = (entry) => (Array.isArray(entry) ? entry[0] : entry);

/**
 * @param {unknown} entry a rule setting
 * @returns {boolean} whether the setting turns the rule off
 */
const isOff = (entry) => ['off', 0].includes(getSeverity(entry));

/**
 * Splits a rule ID into its plugin prefix and rule name: `react/jsx-no-bind` is `react` and `jsx-no-bind`, and a core
 * rule like `curly` has an empty prefix.
 * @param {string} ruleID
 * @returns {{prefix: string, name: string}}
 */
function splitRuleID(ruleID) {
    const slash = ruleID.lastIndexOf('/');
    return slash === -1 ? {prefix: '', name: ruleID} : {prefix: ruleID.slice(0, slash), name: ruleID.slice(slash + 1)};
}

/**
 * Loads the rules of one ESLint plugin from HOSTED_PLUGIN_PACKAGES, so oxlint runs the same rule code as ESLint.
 * @param {string} prefix an ESLint plugin prefix from HOSTED_PLUGIN_PACKAGES, like `react`
 * @returns {Record<string, import('eslint').Rule.RuleModule>}
 */
function getPluginRules(prefix) {
    const plugin = require(resolvePackage(HOSTED_PLUGIN_PACKAGES[prefix]));
    return plugin.rules ?? plugin.default?.rules ?? {};
}

const REACT_HOOKS_RULE_NAMES = new Set(Object.keys(getPluginRules('react-hooks')));

/**
 * Converts the presets with @oxlint/migrate. It runs twice. With type information it swaps some core rules (like
 * dot-notation) for typescript-eslint versions, which the presets turn off on JS files. The run without type
 * information finds those core rules so they still run on JS files.
 * @returns {Promise<{config: import('oxlint').OxlintConfig, skipped: Set<string>}>} the converted config, and the
 * ESLint IDs of the preset rules it could not convert
 */
async function runMigrate() {
    const skipped = new Set();
    const run = async (typeAware) => {
        const skippedHere = new Set();
        const reporter = {
            addWarning: (warning) => {
                if (EXPECTED_WARNINGS.some((pattern) => pattern.test(warning))) {
                    return;
                }
                throw new Error(`@oxlint/migrate: ${warning}\nCheck what it means for the presets' rules, then handle it in config/oxlint/derive.mjs.`);
            },
            getWarnings: () => [],
            markSkipped: (rule) => skippedHere.add(rule),
            removeSkipped: (rule) => skippedHere.delete(rule),
            getSkippedRulesByCategory: () => ({}),
        };
        const config = await migrate(presets, undefined, {reporter, typeAware, jsPlugins: true, withNursery: true});
        for (const rule of skippedHere) {
            if (typeAware || builtinRules.has(rule)) {
                skipped.add(rule);
            }
        }
        return config;
    };
    const config = await run(true);
    await run(false);
    return {config, skipped};
}

const {config: migrated, skipped} = await runMigrate();

/**
 * Returns the rule that runs a preset rule @oxlint/migrate skipped, or an ALWAYS_HOSTED one: `core/<name>`,
 * `hosted/<name>`, or oxlint's name for a renamed core rule.
 * @param {string} ruleID an ESLint rule ID
 * @returns {string | undefined} undefined for rules in DROPPED_RULES or STAND_INS
 */
function getReplayTarget(ruleID) {
    if (DROPPED_RULES[ruleID] || STAND_INS[ruleID]) {
        return undefined;
    }
    const {prefix, name} = splitRuleID(ruleID);
    if (prefix === 'react-hooks' && !ALWAYS_HOSTED.has(ruleID)) {
        throw new Error(`${ruleID} has no rc/ version. Add it to RULE_BY_CATEGORY in config/oxlint/reactCompilerRust.mjs, or to DROPPED_RULES in config/oxlint/derive.mjs.`);
    }
    if (!prefix && ESLINT_RULE_RENAMES[name]) {
        return ESLINT_RULE_RENAMES[name];
    }
    if (!prefix && builtinRules.has(name)) {
        return `core/${name}`;
    }
    const rule = HOSTED_PLUGIN_PACKAGES[prefix] ? getPluginRules(prefix)[name] : undefined;
    if (rule && (!rule.meta?.docs?.requiresTypeChecking || STUBBED_PARSER_SERVICES.has(ruleID))) {
        return `hosted/${name}`;
    }
    throw new Error(
        `oxlint cannot run ${ruleID} natively or as a JS plugin. If its ESLint plugin can run it, add the plugin to HOSTED_PLUGIN_PACKAGES; otherwise add the rule to DROPPED_RULES or STAND_INS in config/oxlint/derive.mjs.`,
    );
}

const replayedRuleIDs = new Map(
    [...skipped, ...ALWAYS_HOSTED].flatMap((ruleID) => {
        const target = getReplayTarget(ruleID);
        return target ? [[ruleID, target]] : [];
    }),
);

/**
 * Adds back the preset rules @oxlint/migrate skipped, and the ALWAYS_HOSTED ones, on the same files as in the preset.
 * When a later block sets only a severity, the earlier options are kept, as ESLint does.
 * @returns {{rules: Record<string, unknown>, overrides: Array<{files: string[], rules: Record<string, unknown>}>}}
 */
function replaySkippedRules() {
    const rules = {};
    const overrides = [];
    const scopedRules = new Set();
    const lastOptions = new Map();
    const toFilesKey = (files) => JSON.stringify(files ? [...files].sort() : null);
    const addEarlierOptions = (block, target, entry) => {
        const [severity, ...options] = Array.isArray(entry) ? entry : [entry];
        if (options.length) {
            lastOptions.set(target, {files: toFilesKey(block.files), options});
            return entry;
        }
        const earlier = lastOptions.get(target);
        if (!earlier || isOff(severity)) {
            return entry;
        }
        if (earlier.files !== toFilesKey(null) && earlier.files !== toFilesKey(block.files)) {
            throw new Error(`${target} gets options for some files and a bare severity for others; oxlint cannot express ESLint's merge`);
        }
        return [severity, ...earlier.options];
    };
    for (const block of presets) {
        const hits = Object.entries(block.rules ?? {}).flatMap(([ruleID, entry]) => {
            const target = replayedRuleIDs.get(ruleID);
            return target ? [[target, addEarlierOptions(block, target, entry)]] : [];
        });
        if (!hits.length) {
            continue;
        }
        if (block.ignores) {
            throw new Error('A preset block has both rules and ignores; replaying it is not supported');
        }
        if (!block.files) {
            const clash = hits.filter(([rule]) => scopedRules.has(rule)).map(([rule]) => rule);
            if (clash.length) {
                throw new Error(`An unscoped preset block after a scoped one sets ${clash.join(', ')}; oxlint would apply them in a different order`);
            }
            Object.assign(rules, Object.fromEntries(hits));
            continue;
        }
        if (block.files.some((pattern) => typeof pattern !== 'string')) {
            throw new Error('A preset block uses `files` that are not plain globs, which oxlint cannot express');
        }
        for (const [rule] of hits) {
            scopedRules.add(rule);
        }
        overrides.push({files: block.files, rules: Object.fromEntries(hits)});
    }
    return {rules, overrides};
}

const replayed = replaySkippedRules();

// A rule the presets only ever turn off is left out of the `core` and `hosted` plugins.
const enabledReplayTargets = new Set([replayed.rules, ...replayed.overrides.map((override) => override.rules)].flatMap((rules) => Object.keys(rules).filter((rule) => !isOff(rules[rule]))));

/**
 * @param {string} target a rule name as the App's config uses it, like `hosted/jsx-no-bind`
 * @returns {boolean} false for a `core/` or `hosted/` rule the presets only turn off
 */
const isNeeded = (target) => !/^(core|hosted)\//.test(target) || enabledReplayTargets.has(target);

/**
 * @param {Record<string, unknown>} rules
 * @returns {Record<string, unknown>} the rules without the `core/` and `hosted/` ones the presets only turn off
 */
const dropUnneededRules = (rules) => Object.fromEntries(Object.entries(rules).filter(([rule]) => isNeeded(rule)));

const coreRuleNames = [...replayedRuleIDs.values()].filter((target) => target.startsWith('core/') && isNeeded(target)).map((target) => target.slice('core/'.length));
const hostedRuleIDs = [...new Set([...[...replayedRuleIDs].filter(([, target]) => target.startsWith('hosted/') && isNeeded(target)).map(([ruleID]) => ruleID), ...APP_HOSTED_RULES])];

// All hosted rules share the `hosted/` prefix, so loading fails if two plugins bring a rule with the same name.
const hostedNames = [...hostedRuleIDs.map((ruleID) => splitRuleID(ruleID).name), ...Object.keys(LOCAL_HOSTED_RULES)];
const duplicateName = hostedNames.find((name, index) => hostedNames.indexOf(name) !== index);
if (duplicateName) {
    throw new Error(`Two hosted rules would both be named hosted/${duplicateName}`);
}

/**
 * Renames the rules of one block @oxlint/migrate produced to the names the App's oxlint config uses.
 * @param {Record<string, unknown>} rules
 * @returns {Record<string, unknown>}
 */
function translateRules(rules = {}) {
    const out = {};
    for (const [ruleID, entry] of Object.entries(rules)) {
        const {prefix, name} = splitRuleID(ruleID);
        if (prefix === 'react' && REACT_COMPILER_RULES.has(name)) {
            out[`rc/${name}`] = entry;
            continue;
        }
        // @oxlint/migrate writes react-hooks rules under the `react/` prefix.
        const hooksRuleID = prefix === 'react' && REACT_HOOKS_RULE_NAMES.has(name) ? `react-hooks/${name}` : undefined;
        // ALWAYS_HOSTED rules come back as `hosted/` through replaySkippedRules, and DROPPED_RULES don't run at all.
        if (ALWAYS_HOSTED.has(ruleID) || ALWAYS_HOSTED.has(hooksRuleID) || DROPPED_RULES[ruleID] || DROPPED_RULES[hooksRuleID]) {
            continue;
        }
        if (hooksRuleID && name !== 'rules-of-hooks') {
            // Any other react-hooks rule is a React Compiler check and must run as `rc/` like the others (see REACT_COMPILER_RULES).
            throw new Error(`${hooksRuleID} has no rc/ version. Add it to RULE_BY_CATEGORY in config/oxlint/reactCompilerRust.mjs, or to DROPPED_RULES in config/oxlint/derive.mjs.`);
        }
        if (STAND_INS[ruleID]) {
            out[STAND_INS[ruleID]] = getSeverity(entry);
            continue;
        }
        if (DROP_OPTIONS.has(ruleID)) {
            out[ruleID] = getSeverity(entry);
            continue;
        }
        if (ruleID === 'import/no-cycle' && Array.isArray(entry)) {
            // The preset sets maxDepth to the string "∞" (no limit). oxlint takes only a number and has no limit by default.
            const {maxDepth, ...options} = entry[1] ?? {};
            out[ruleID] = maxDepth === '∞' ? [entry[0], options] : entry;
            continue;
        }
        out[ruleID] = entry;
    }
    return out;
}

/**
 * @param {unknown} value
 * @returns {boolean} whether the value is a plain object, not an array
 */
const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

/**
 * Merges oxlint settings. Nested objects are merged key by key; any other value in `extra` replaces the one in `base`.
 * @param {Record<string, unknown>} base
 * @param {Record<string, unknown>} extra
 * @returns {Record<string, unknown>} a new object; neither argument is changed
 */
const mergeSettings = (base, extra) => {
    const merged = {...base};
    for (const [key, value] of Object.entries(extra)) {
        merged[key] = isObject(value) && isObject(merged[key]) ? mergeSettings(merged[key], value) : value;
    }
    return merged;
};

/**
 * Collects the presets' `import/*` settings, which ESLint's import rules read. oxlint has no per-file settings, so all
 * blocks are merged. `import/parsers` is skipped because oxlint parses files itself.
 * @returns {Record<string, unknown>}
 */
function getImportSettings() {
    let settings = {};
    for (const block of presets) {
        const entries = Object.entries(block.settings ?? {}).filter(([key]) => key.startsWith('import/') && key !== 'import/parsers');
        settings = mergeSettings(settings, Object.fromEntries(entries));
    }
    return settings;
}

/**
 * The name oxlint gives a JS plugin package: `eslint-plugin-es` is `es`, `@scope/eslint-plugin-x` is `@scope/x`.
 * @param {string} jsPlugin
 * @returns {string}
 */
function getJsPluginName(jsPlugin) {
    const scoped = /^(@[^/]+)\/eslint-plugin(?:-(.+))?$/.exec(jsPlugin);
    if (scoped) {
        return scoped[2] ? `${scoped[1]}/${scoped[2]}` : scoped[1];
    }
    return jsPlugin.replace(/^eslint-plugin-/, '');
}

/**
 * Lists the ESLint plugins the presets need that oxlint has no version of (today only eslint-plugin-es).
 * eslint-plugin-rulesdir is skipped because plugins/expensify-rules.mjs loads those rules.
 * @returns {Array<{name: string, specifier: string}>} oxlint `jsPlugins` entries
 */
function getPresetJsPlugins() {
    const specifiers = new Set([migrated, ...(migrated.overrides ?? [])].flatMap((block) => block.jsPlugins ?? []));
    specifiers.delete('eslint-plugin-rulesdir');
    return [...specifiers].map((specifier) => ({
        name: getJsPluginName(specifier),
        specifier: resolvePackage(specifier),
    }));
}

/** @type {import('oxlint').OxlintConfig} */
const presetConfig = {
    plugins: migrated.plugins,
    // oxlint reserves its own plugin names (`react`, `import`, `jsdoc`, ...), so these JS plugins use other names.
    jsPlugins: [
        {name: 'rulesdir', specifier: './config/oxlint/plugins/expensify-rules.mjs'},
        {name: 'core', specifier: './config/oxlint/plugins/core-rules.mjs'},
        {name: 'hosted', specifier: './config/oxlint/plugins/hosted-rules.mjs'},
        {name: 'rc', specifier: './config/oxlint/plugins/rc-rules.mjs'},
        ...getPresetJsPlugins(),
    ],
    categories: migrated.categories,
    options: {typeAware: true},
    ignorePatterns: migrated.ignorePatterns,
    env: migrated.env,
    globals: migrated.globals,
    settings: {
        ...migrated.settings,
        ...getImportSettings(),
        // ESLint finds the React version itself; oxlint needs it set.
        react: {...migrated.settings?.react, version: require(resolvePackage('react/package.json')).version},
    },
    rules: {...translateRules(migrated.rules), ...dropUnneededRules(replayed.rules)},
    overrides: [
        // jsPlugins are left out here; getPresetJsPlugins lists them once at the root.
        ...(migrated.overrides ?? []).map(({files, plugins, env, globals, rules}) => ({
            files,
            ...(plugins ? {plugins} : {}),
            ...(env ? {env} : {}),
            ...(globals ? {globals} : {}),
            rules: translateRules(rules),
        })),
        ...replayed.overrides.map(({files, rules}) => ({files, rules: dropUnneededRules(rules)})),
    ],
};

/**
 * Returns the name a rule runs under when the App runs it as hosted/, core/ or rc/ instead of oxlint's built-in version.
 * @param {string} rule a rule name as written in oxlint.config.mts
 * @returns {string | undefined} undefined when the rule runs under the name given
 */
function getRunningName(rule) {
    const {prefix, name} = splitRuleID(rule);
    if (ALWAYS_HOSTED.has(rule) || (prefix === 'react' && ALWAYS_HOSTED.has(`react-hooks/${name}`))) {
        return `hosted/${name}`;
    }
    if (!prefix && coreRuleNames.includes(name)) {
        return `core/${name}`;
    }
    if (prefix === 'react' && REACT_COMPILER_RULES.has(name)) {
        return `rc/${name}`;
    }
    return undefined;
}

/**
 * Throws when oxlint.config.mts sets a rule by its built-in name while it runs as hosted/, core/ or rc/ (like
 * `import/prefer-default-export`). That setting would do nothing or run a second copy. oxlint itself rejects names it
 * doesn't know.
 * @param {string} rule
 */
function checkRuleName(rule) {
    const runningName = getRunningName(rule);
    if (runningName) {
        throw new Error(`oxlint.config.mts sets "${rule}", but this rule runs as "${runningName}". Use that name instead.`);
    }
}

/**
 * Adds the App's own settings and rules to the preset config. App rules go in overrides because an override always
 * beats root `rules`.
 * @param {Pick<import('oxlint').OxlintConfig, 'ignorePatterns' | 'env' | 'globals' | 'settings' | 'jsPlugins' | 'overrides'>} appConfig
 * @returns {import('oxlint').OxlintConfig}
 */
function extendOxlintConfig({ignorePatterns = [], env = {}, globals = {}, settings = {}, jsPlugins = [], overrides = []}) {
    for (const override of overrides) {
        for (const rule of Object.keys(override.rules ?? {})) {
            checkRuleName(rule);
        }
    }
    return {
        ...presetConfig,
        jsPlugins: [...(presetConfig.jsPlugins ?? []), ...jsPlugins],
        env: {...presetConfig.env, ...env},
        globals: {...presetConfig.globals, ...globals},
        settings: mergeSettings(presetConfig.settings, settings),
        ignorePatterns: [...(presetConfig.ignorePatterns ?? []), ...ignorePatterns],
        overrides: [...(presetConfig.overrides ?? []), ...overrides],
    };
}

export {ESLINT_RULE_RENAMES, LOCAL_HOSTED_RULES, STUBBED_PARSER_SERVICES, coreRuleNames, extendOxlintConfig, getPluginRules, hostedRuleIDs, splitRuleID};

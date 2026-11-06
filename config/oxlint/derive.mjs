/**
 * Builds the oxlint config from the eslint-config-expensify presets (presets.mjs) every time oxlint loads
 * oxlint.config.mts, so upgrading eslint-config-expensify needs no copied rules. @oxlint/migrate maps each ESLint rule
 * to oxlint's built-in version. When oxlint has none, the `core` and `hosted` JS plugins in ./plugins run ESLint's own
 * code for the rule, with the preset's options. Those plugins read their rule lists from this module.
 *
 * If a preset rule can't run either way, loading the config throws until someone lists it in DROPPED_RULES or
 * STAND_INS, so no rule disappears silently. oxlint.config.mts adds the App's own settings and rules through
 * extendOxlintConfig, after the presets' rules, so the App's settings win, as they did in ESLint.
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

// The presets' ESLint plugins are dependencies of eslint-config-expensify, so they are looked up there first.
function resolvePackage(request) {
    return require.resolve(request, {paths: [expensifyConfigDirectory, repoRoot]});
}

// ESLint plugins whose rules can run as `hosted/<rule>`. oxlint already uses the first four plugin names for its own
// versions, so the ESLint rules need a different name.
const HOSTED_PLUGIN_PACKAGES = {
    react: 'eslint-plugin-react',
    import: 'eslint-plugin-import',
    jsdoc: 'eslint-plugin-jsdoc',
    '@typescript-eslint': '@typescript-eslint/eslint-plugin',
    'react-hooks': 'eslint-plugin-react-hooks',
    storybook: 'eslint-plugin-storybook',
};

// Rules oxlint has its own version of that still run from ESLint's code, as `hosted/<name>`.
const ALWAYS_HOSTED = new Set([
    // oxlint's version reports on a different line than ESLint's.
    'import/prefer-default-export',
    // oxlint's version also reports components defined inside `jest.mock()` factories.
    'react/function-component-definition',
    // oxlint's version reports on the JSX provider instead of where the value is declared. Also, reactCompilerGate.mjs,
    // which drops these reports in files React Compiler memoizes, only works on JS plugin rules.
    'react/jsx-no-constructed-context-values',
    // reactCompilerGate.mjs finds the "wrap it in useCallback/useMemo" reports by ESLint's wording, which oxlint's
    // version does not use.
    'react-hooks/exhaustive-deps',
]);

// Hosted rules that no preset turns on but oxlint.config.mts does.
const APP_HOSTED_RULES = [
    'jsdoc/require-jsdoc',
    // oxlint has no native version.
    'react/no-unused-prop-types',
    // oxlint has no storybook plugin.
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

// typescript-eslint rules that want type information, which oxlint JS plugins don't get. naming-convention still works
// when given empty stand-ins (plugins/hosted-rules.mjs), as long as no option uses the `types` selector.
const STUBBED_PARSER_SERVICES = new Set(['@typescript-eslint/naming-convention']);

const DROPPED_RULES = {
    'no-invalid-this': 'calls sourceCode.getJSDocComment, which oxlint JS plugins do not support',
    'react-hooks/component-hook-factories': 'React Compiler check that the Rust port does not report',
    'react-hooks/config': 'React Compiler check that the Rust port does not report',
    'react-hooks/gating': 'React Compiler check that the Rust port does not report',
    'rulesdir/boolean-conditional-rendering': 'needs the type of the `&&` left operand, and JS plugins get no type information',
};

// oxlint rules that replace preset rules oxlint can't run. rulesdir/prefer-at needs the type checker. unicorn/prefer-at
// keeps its default options: with `checkAllIndexAccess` it reports tuple reads like `result[0]` that the ESLint rule
// allows.
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

// React Compiler rules run as `rc/<name>` through oxc's Rust port of the compiler (plugins/rc-rules.mjs). oxlint's
// built-in react/<name> versions are not used: an eslint-disable for react/exhaustive-deps or react/rules-of-hooks also
// hides every compiler error in that component (https://github.com/oxc-project/oxc/issues/26277).
const REACT_COMPILER_RULES = new Set(Object.values(RULE_BY_CATEGORY));

// @oxlint/migrate warnings that are safe to ignore. They are about settings this file sets itself, the parser, and
// globals. Any other warning, for example a dropped `sort-imports` or a preset `ignores` list oxlint can't express,
// can mean a rule now covers different files or is gone, so loading stops.
const EXPECTED_WARNINGS = [/^Settings not migrated/, /^Settings found under a 'files' pattern/, /^special parser detected/, /^react\.version "detect"/, /^Added \d+ globals/];

const getSeverity = (entry) => (Array.isArray(entry) ? entry[0] : entry);
const isOff = (entry) => ['off', 0].includes(getSeverity(entry));

function splitRuleID(ruleID) {
    const slash = ruleID.lastIndexOf('/');
    return slash === -1 ? {prefix: '', name: ruleID} : {prefix: ruleID.slice(0, slash), name: ruleID.slice(slash + 1)};
}

/**
 * @param {string} prefix an ESLint plugin prefix from HOSTED_PLUGIN_PACKAGES, like `react`
 * @returns {Record<string, import('eslint').Rule.RuleModule>}
 */
function getPluginRules(prefix) {
    const plugin = require(resolvePackage(HOSTED_PLUGIN_PACKAGES[prefix]));
    return plugin.rules ?? plugin.default?.rules ?? {};
}

const REACT_HOOKS_RULE_NAMES = new Set(Object.keys(getPluginRules('react-hooks')));

// @oxlint/migrate runs twice. With type information on, it swaps core rules like dot-notation for their
// typescript-eslint versions, but the presets turn those off for JS files and use the core rule there. The second run,
// without type information, lists those core rules as unsupported, so the `core` plugin runs them for JS files.
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
 * For a preset rule @oxlint/migrate skipped, returns the name of the rule that runs it instead: `core/<name>`,
 * `hosted/<name>`, or the name oxlint uses for a renamed ESLint core rule.
 * @param {string} ruleID an ESLint rule ID
 * @returns {string | undefined} undefined for rules in DROPPED_RULES or STAND_INS
 */
function getReplayTarget(ruleID) {
    if (DROPPED_RULES[ruleID] || STAND_INS[ruleID]) {
        return undefined;
    }
    const {prefix, name} = splitRuleID(ruleID);
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
    throw new Error(`oxlint cannot run ${ruleID} natively or as a JS plugin. Add it to DROPPED_RULES or STAND_INS in config/oxlint/derive.mjs.`);
}

const replayedRuleIDs = new Map(
    [...skipped, ...ALWAYS_HOSTED].flatMap((ruleID) => {
        const target = getReplayTarget(ruleID);
        return target ? [[ruleID, target]] : [];
    }),
);

/**
 * Adds back the preset rules @oxlint/migrate skipped, for the same files as in the preset, under the name of the rule
 * that runs each one. When a later block sets only a severity, ESLint keeps the earlier block's options and oxlint
 * drops them, so this copies the earlier options in.
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
const isNeeded = (target) => !/^(core|hosted)\//.test(target) || enabledReplayTargets.has(target);
const dropUnneededRules = (rules) => Object.fromEntries(Object.entries(rules).filter(([rule]) => isNeeded(rule)));

const coreRuleNames = [...replayedRuleIDs.values()].filter((target) => target.startsWith('core/') && isNeeded(target)).map((target) => target.slice('core/'.length));
const hostedRuleIDs = [...new Set([...[...replayedRuleIDs].filter(([, target]) => target.startsWith('hosted/') && isNeeded(target)).map(([ruleID]) => ruleID), ...APP_HOSTED_RULES])];

// All hosted rules share the `hosted/` prefix, so two plugins cannot both bring a rule with the same name.
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
        if (ALWAYS_HOSTED.has(ruleID) || ALWAYS_HOSTED.has(hooksRuleID) || DROPPED_RULES[ruleID] || DROPPED_RULES[hooksRuleID]) {
            continue;
        }
        if (hooksRuleID && name !== 'rules-of-hooks') {
            // Any other react-hooks rule is a React Compiler check. It should run as `rc/` like the others, so its reports
            // are dropped in files React Compiler memoizes.
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

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
const mergeSettings = (base, extra) => {
    const merged = {...base};
    for (const [key, value] of Object.entries(extra)) {
        merged[key] = isObject(value) && isObject(merged[key]) ? mergeSettings(merged[key], value) : value;
    }
    return merged;
};

// ESLint's import rules (run as hosted) read these settings. oxlint can't set settings per file pattern, so all blocks
// are merged into one. `import/parsers` is skipped because oxlint parses the files itself.
function getImportSettings() {
    let settings = {};
    for (const block of presets) {
        const entries = Object.entries(block.settings ?? {}).filter(([key]) => key.startsWith('import/') && key !== 'import/parsers');
        settings = mergeSettings(settings, Object.fromEntries(entries));
    }
    return settings;
}

/**
 * The name a JS plugin is given when an override lists it by package: `eslint-plugin-lodash` is `lodash`,
 * `@dword-design/eslint-plugin-import-alias` is `@dword-design/import-alias`.
 * @param {string | {name: string}} jsPlugin
 * @returns {string}
 */
function getJsPluginName(jsPlugin) {
    if (typeof jsPlugin !== 'string') {
        return jsPlugin.name;
    }
    const scoped = /^(@[^/]+)\/eslint-plugin(?:-(.+))?$/.exec(jsPlugin);
    if (scoped) {
        return scoped[2] ? `${scoped[1]}/${scoped[2]}` : scoped[1];
    }
    return jsPlugin.replace(/^eslint-plugin-/, '');
}

// Some preset rules come from ESLint plugins oxlint has no version of (today only eslint-plugin-es), so that plugin has
// to be loaded. @oxlint/migrate lists it on each override; this loads it once for the whole config.
// eslint-plugin-rulesdir is skipped because plugins/expensify-rules.mjs loads those rules.
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
    // oxlint reserves `react`, `import` and `jsdoc` for its native ports, so the JS plugins use these names.
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

const oxlintSchema = require(path.join(path.dirname(require.resolve('oxlint/package.json')), 'configuration_schema.json'));
const BUILT_IN_RULES = new Set(Object.keys(oxlintSchema.definitions.DummyRuleMap.properties));

/**
 * A rule name written by hand must match how oxlint runs that rule here. If a preset update moves a rule between
 * oxlint's built-in version and `hosted/` or `core/`, the old name would be ignored silently, so it throws instead.
 * @param {string} rule
 * @param {Set<string>} jsPluginNames
 */
function checkRuleName(rule, jsPluginNames) {
    const {prefix: plugin, name} = splitRuleID(rule);
    let isKnown;
    if (plugin === 'core') {
        isKnown = coreRuleNames.includes(name);
    } else if (plugin === 'hosted') {
        isKnown = hostedNames.includes(name);
    } else if (plugin === 'rc') {
        isKnown = REACT_COMPILER_RULES.has(name);
    } else if (jsPluginNames.has(plugin)) {
        isKnown = true;
    } else {
        // A built-in name does nothing, or runs a second copy, when the rule runs as hosted/, core/ or rc/ instead.
        const runsElsewhere = ALWAYS_HOSTED.has(rule) || coreRuleNames.includes(rule) || (plugin === 'react' && (REACT_COMPILER_RULES.has(name) || ALWAYS_HOSTED.has(`react-hooks/${name}`)));
        isKnown = BUILT_IN_RULES.has(rule) && !runsElsewhere;
    }
    if (!isKnown) {
        throw new Error(`oxlint.config.mts sets "${rule}", which is not a rule oxlint runs here. Check whether it runs as hosted/, core/ or built in.`);
    }
}

/**
 * Adds the App's own settings and rules, written in oxlint format, to the config built from the presets. The App's
 * rules go in overrides only: an override that matches a file beats the root `rules`, so App rules there could lose
 * to a preset's override.
 * @param {Pick<import('oxlint').OxlintConfig, 'ignorePatterns' | 'env' | 'globals' | 'settings' | 'jsPlugins' | 'overrides'>} appConfig
 * @returns {import('oxlint').OxlintConfig}
 */
function extendOxlintConfig({ignorePatterns = [], env = {}, globals = {}, settings = {}, jsPlugins = [], overrides = []}) {
    const rootJsPlugins = [...(presetConfig.jsPlugins ?? []), ...jsPlugins];
    for (const override of overrides) {
        const jsPluginNames = new Set([...rootJsPlugins, ...(override.jsPlugins ?? [])].map(getJsPluginName));
        for (const rule of Object.keys(override.rules ?? {})) {
            checkRuleName(rule, jsPluginNames);
        }
    }
    return {
        ...presetConfig,
        jsPlugins: rootJsPlugins,
        env: {...presetConfig.env, ...env},
        globals: {...presetConfig.globals, ...globals},
        settings: mergeSettings(presetConfig.settings, settings),
        ignorePatterns: [...(presetConfig.ignorePatterns ?? []), ...ignorePatterns],
        overrides: [...(presetConfig.overrides ?? []), ...overrides],
    };
}

export {ESLINT_RULE_RENAMES, LOCAL_HOSTED_RULES, STUBBED_PARSER_SERVICES, coreRuleNames, extendOxlintConfig, getPluginRules, hostedRuleIDs, splitRuleID};

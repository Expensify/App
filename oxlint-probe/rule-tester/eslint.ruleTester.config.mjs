// Standalone ESLint config for the harvested RuleTester tree.
//
// Only the rules under test are enabled, with the exact severity/options the production
// .oxlintrc.json uses, read from the tree's rules.json (written by buildTree.mjs) so the two
// linters cannot be given different options.
//
// Run with --no-config-lookup: the repo's type-aware config excludes oxlint-probe from the TS
// program and would fail to parse the tree.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import tseslint from 'typescript-eslint';

import reactCompilerCompat from '../../config/eslint/processors/eslint-processor-react-compiler-compat.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const RULE_DIRS = [path.join(REPO, 'node_modules/eslint-config-expensify/eslint-plugin-expensify'), path.join(REPO, 'eslint-plugin-local-rules')];

// The tree lives outside this directory, so its location comes in through the environment.
const treeDir = process.env.RULE_TESTER_TREE;
if (!treeDir) {
    throw new Error('RULE_TESTER_TREE is not set; run this config through oxlint-probe/rule-tester/compareRuleTester.py');
}
const ruleConfig = JSON.parse(fs.readFileSync(path.join(treeDir, 'rules.json'), 'utf8'));

/**
 * Loads the rule modules the same way eslint-plugin-rulesdir does, from the same two directories,
 * so ESLint and oxlint are running the identical module objects.
 */
async function loadRules() {
    const rules = {};
    for (const dir of RULE_DIRS) {
        if (!fs.existsSync(dir)) {
            continue;
        }
        for (const file of fs.readdirSync(dir)) {
            if (!file.endsWith('.js') || file === 'CONST.js') {
                continue;
            }
            const module = await import(pathToFileURL(path.join(dir, file)).href);
            rules[file.replace(/\.js$/, '')] = module.default ?? module;
        }
    }
    return rules;
}

const rules = Object.fromEntries(Object.entries(ruleConfig).map(([name, value]) => [`rulesdir/${name}`, value]));

// Upstream cases pick their own extension when they set a `filename`, and several use `.js`
// (prefer-onyx-connect-in-libs, no-api-in-views). oxlint applies the rules to those too, so leaving
// them out here would read as a bridge divergence when it is only a gap in this config.
const ALL = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'];

// Two of the rules under test are type-aware on the ESLint side (no-object-keys-includes,
// prefer-locale-compare-from-context) and throw at create() time without a program, taking the whole
// run down. buildTree.mjs writes the tsconfig that covers the materialized tree.
const typeAware = {project: path.join(treeDir, 'tsconfig.json'), tsconfigRootDir: treeDir};

export default [
    {
        // JSX is enabled everywhere except plain .ts, where it would reinterpret `<T>(x) => x`.
        files: ['**/*.ts'],
        languageOptions: {parser: tseslint.parser, parserOptions: {sourceType: 'module', ...typeAware}},
    },
    {
        files: ALL.filter((pattern) => pattern !== '**/*.ts'),
        languageOptions: {parser: tseslint.parser, parserOptions: {sourceType: 'module', ecmaFeatures: {jsx: true}, ...typeAware}},
    },
    {
        files: ALL,
        // The cases for require-a11y-disable-justification are made of real eslint-disable comments,
        // naming rules from a plugin this config does not load. ESLint's own report for those carries
        // no ruleId, which the comparer reads as a fatal error rather than a finding, so it is off.
        // oxlint reports unused directives only when asked, and the harness does not ask.
        linterOptions: {reportUnusedDisableDirectives: 'off'},
        plugins: {rulesdir: {rules: await loadRules()}},
        // The same processor the repo attaches. Two of the rules under test are gated on the React
        // Compiler in oxlint; without the processor here, a case that both compilers memoize would
        // look like a bridge divergence when it is really the gate doing its job on one side only.
        processor: reactCompilerCompat,
        rules,
    },
];

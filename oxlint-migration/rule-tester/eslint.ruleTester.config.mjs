import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import tseslint from 'typescript-eslint';

import reactCompilerCompat from '../../config/eslint/processors/eslint-processor-react-compiler-compat.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const RULE_DIRS = [path.join(REPO, 'node_modules/eslint-config-expensify/eslint-plugin-expensify'), path.join(REPO, 'eslint-plugin-local-rules')];

const treeDir = process.env.RULE_TESTER_TREE;
if (!treeDir) {
    throw new Error('RULE_TESTER_TREE is not set; run this config through oxlint-migration/rule-tester/compareRuleTester.py');
}
const ruleConfig = JSON.parse(fs.readFileSync(path.join(treeDir, 'rules.json'), 'utf8'));

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

const ALL = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'];

// Two of the rules under test are type-aware on the ESLint side and throw at create() time without a
// program, taking the whole run down.
const typeAware = {project: path.join(treeDir, 'tsconfig.json'), tsconfigRootDir: treeDir};

export default [
    {
        // JSX is off for plain .ts, where it would reinterpret `<T>(x) => x`.
        files: ['**/*.ts'],
        languageOptions: {parser: tseslint.parser, parserOptions: {sourceType: 'module', ...typeAware}},
    },
    {
        files: ALL.filter((pattern) => pattern !== '**/*.ts'),
        languageOptions: {parser: tseslint.parser, parserOptions: {sourceType: 'module', ecmaFeatures: {jsx: true}, ...typeAware}},
    },
    {
        files: ALL,
        // The require-a11y-disable-justification cases are real eslint-disable comments naming rules
        // this config does not load, and ESLint reports those with no ruleId, which the comparer reads
        // as a fatal error.
        linterOptions: {reportUnusedDisableDirectives: 'off'},
        plugins: {rulesdir: {rules: await loadRules()}},
        processor: reactCompilerCompat,
        rules,
    },
];

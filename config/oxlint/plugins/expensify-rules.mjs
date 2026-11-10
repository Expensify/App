/**
 * The App's `rulesdir` plugin: the rules of eslint-plugin-expensify (from eslint-config-expensify's rulesdir plugin) and
 * of eslint-plugin-local-rules, under the `rulesdir` name ESLint uses. Two rules change: no-inline-useOnyx-selector stays
 * quiet in files React Compiler memoizes, and prefer-locale-compare-from-context is swapped for a copy that needs no type
 * info.
 */
import {rules as expensifyRules} from 'eslint-config-expensify/oxlint/plugins/rulesdir';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {create as preferLocaleCompareCreate, meta as preferLocaleCompareMeta} from '../preferLocaleCompareFromContext.mjs';
import {withFullGating} from '../reactCompilerGate.mjs';

const require = createRequire(import.meta.url);
const localRulesDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../eslint-plugin-local-rules');

const localRules = {};
for (const file of fs.readdirSync(localRulesDirectory)) {
    if (file.endsWith('.js') && file !== 'CONST.js') {
        localRules[file.replace(/\.js$/, '')] = require(path.join(localRulesDirectory, file));
    }
}

const rules = {...expensifyRules, ...localRules};

const plugin = {
    meta: {
        name: 'rulesdir',
        version: '0.0.1',
    },
    rules: {
        ...rules,
        'no-inline-useOnyx-selector': withFullGating(rules['no-inline-useOnyx-selector']),
        // ESLint's copy calls getParserServices in create(), which throws in a jsPlugin.
        'prefer-locale-compare-from-context': {create: preferLocaleCompareCreate, meta: preferLocaleCompareMeta},
    },
};

export default plugin;

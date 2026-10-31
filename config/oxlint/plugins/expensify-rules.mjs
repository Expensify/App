/**
 * Loads every rule from eslint-plugin-expensify and eslint-plugin-local-rules into oxlint, under the
 * `rulesdir` name ESLint uses. Two rules change: no-inline-useOnyx-selector stays quiet in files React
 * Compiler memoizes, and prefer-locale-compare-from-context is swapped for a copy that needs no type info.
 */
import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {create as preferLocaleCompareCreate, meta as preferLocaleCompareMeta} from '../preferLocaleCompareFromContext.mjs';
import {withFullGating} from '../reactCompilerGate.mjs';

const require = createRequire(import.meta.url);
const pluginDir = path.dirname(fileURLToPath(import.meta.url));

const RULE_DIRS = [path.resolve(pluginDir, '../../../node_modules/eslint-config-expensify/eslint-plugin-expensify'), path.resolve(pluginDir, '../../../eslint-plugin-local-rules')];

const HELPER_FILES = new Set(['CONST.js']);

const rules = {};
for (const dir of RULE_DIRS) {
    for (const file of fs.readdirSync(dir)) {
        if (!file.endsWith('.js') || HELPER_FILES.has(file)) {
            continue;
        }
        rules[file.replace(/\.js$/, '')] = require(path.join(dir, file));
    }
}

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

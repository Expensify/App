/**
 * The App's `rulesdir` plugin: the package's rulesdir rules plus the rules in eslint-plugin-local-rules/. It also
 * differs from the package's in two rules: no-inline-useOnyx-selector stays quiet in files React Compiler memoizes, and
 * prefer-locale-compare-from-context is added as a copy that needs no type info (the package leaves it out).
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
    if (file.endsWith('.js')) {
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

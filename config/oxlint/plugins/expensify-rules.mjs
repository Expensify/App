import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import withBypassReporting from '../onyxConnectBypass.mjs';
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
        // ESLint's copy calls getParserServices at create() time, which throws in a jsPlugin, so a
        // type-free rewrite stands in for it.
        'prefer-locale-compare-from-context': {create: preferLocaleCompareCreate, meta: preferLocaleCompareMeta},
        'no-onyx-connect-bypass': withBypassReporting(rules['no-onyx-connect']),
    },
};

export default plugin;

// Exposes Expensify's rulesdir-loaded ESLint rules to oxlint via the JS Plugins
// API (alpha). Enumerates every rule module from the two rule directories used
// by the ESLint config (eslint-plugin-rulesdir points at the same paths), so
// rule IDs match ESLint's `rulesdir/<name>` exactly.
import fs from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {withBypassReporting} from '../onyxConnectBypass.mjs';
import {create as preferLocaleCompareCreate, meta as preferLocaleCompareMeta} from '../preferLocaleCompareFromContext.mjs';
import {withFullGating} from '../reactCompilerGate.mjs';

const require = createRequire(import.meta.url);
const pluginDir = path.dirname(fileURLToPath(import.meta.url));

const RULE_DIRS = [path.resolve(pluginDir, '../../../node_modules/eslint-config-expensify/eslint-plugin-expensify'), path.resolve(pluginDir, '../../../eslint-plugin-local-rules')];

// Helper modules living next to the rules that are not rules themselves
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
        // The ESLint processor lists this rule in RULES_SUPPRESSED_BY_REACT_COMPILER, so every
        // message from it is dropped in a dual-memoized file. Without the gate: 238 findings
        // across 186 files that ESLint never shows.
        'no-inline-useOnyx-selector': withFullGating(rules['no-inline-useOnyx-selector']),
        // ESLint's copy of this one calls getParserServices at create() time, which throws in a
        // jsPlugin. Replaced by a type-free rewrite -- see the module for why dropping the type
        // query is exact rather than approximate, and for the one shape where it is not.
        'prefer-locale-compare-from-context': {create: preferLocaleCompareCreate, meta: preferLocaleCompareMeta},
        // The ban a second time, reporting only what a disable comment hid, which is what
        // scripts/checkOnyxConnectBypass.ts uses a second ESLint boot to find. Registered but
        // deliberately NOT yet enabled in .oxlintrc.json: enabling it is the one line to add when
        // that script is deleted. Proven by `npm run oxlint-onyx-bypass`.
        'no-onyx-connect-bypass': withBypassReporting(rules['no-onyx-connect']),
    },
};

export default plugin;

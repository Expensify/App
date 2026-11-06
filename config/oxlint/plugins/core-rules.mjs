/**
 * ESLint core rules that oxlint has no native version of. They run inside oxlint as a JS plugin under the `core/`
 * prefix, using ESLint's own rule code, so each one behaves as it does under ESLint. config/oxlint/derive.mjs lists
 * them from what the eslint-config-expensify presets turn on, and sets their files and options.
 */
import {builtinRules} from 'eslint/use-at-your-own-risk';

import {coreRuleNames} from '../derive.mjs';
import {withEslintDirectiveIDsFor} from '../eslintDirectives.mjs';

const plugin = {
    meta: {
        name: 'core',
        version: '0.0.1',
    },
    rules: withEslintDirectiveIDsFor(Object.fromEntries(coreRuleNames.map((name) => [name, builtinRules.get(name)])), (name) => name),
};

export default plugin;

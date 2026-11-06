/**
 * ESLint core rules oxlint has no version of, run from ESLint's own code under `core/`. config/oxlint/derive.mjs
 * decides which ones and where they apply.
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

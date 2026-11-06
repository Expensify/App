/**
 * ESLint core rules oxlint has no version of, run from ESLint's own code under `core/`, so each one behaves as it does
 * under ESLint. config/oxlint/derive.mjs decides which ones and where they apply.
 *
 * no-invalid-this is left out even though the presets turn it on. It calls sourceCode.getJSDocComment, which oxlint JS
 * plugins don't support (see DROPPED_RULES in derive.mjs).
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

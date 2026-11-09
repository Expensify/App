/**
 * Runs rules from ESLint plugins (react, import, jsdoc, react-hooks) and syntax-only hosted rules
 * inside oxlint, using the plugins' own code. Each one is here because oxlint has no native version or
 * its native one reports differently. oxlint reserves most of these plugin names for its own ports,
 * so all of them load under `hosted`.
 */
import * as importPlugin from 'eslint-plugin-import';
import * as jsdocPlugin from 'eslint-plugin-jsdoc';
import * as reactPlugin from 'eslint-plugin-react';
import * as reactHooksPlugin from 'eslint-plugin-react-hooks';

import {EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN} from '../../reactCompiler/suppressedRules.mjs';
import {withEslintDirectiveIDs, withEslintDirectiveIDsFor} from '../eslintDirectives.mjs';
import {create as noDeprecatedSelfClosingJsxCreate, meta as noDeprecatedSelfClosingJsxMeta} from '../noDeprecatedSelfClosingJsx.mjs';
import {withFullGating, withMessageGating} from '../reactCompilerGate.mjs';
import {hostedRuleNames} from '../ruleNames.mjs';
import namingConvention from '../vendor/naming-convention.mjs';
import storybookPlugin from '../vendor/storybook.mjs';

const getRules = (plugin) => plugin.rules ?? plugin.default?.rules ?? {};

const react = getRules(reactPlugin);
const imports = getRules(importPlugin);
const jsdoc = getRules(jsdocPlugin);
const storybook = storybookPlugin.rules;
const reactHooks = getRules(reactHooksPlugin);

/**
 * Loads `names` from an ESLint plugin as hosted rules, and makes `eslint-disable` comments that use the
 * ESLint name (`<eslintPrefix>/<name>`) apply to them.
 * @param {Record<string, import('eslint').Rule.RuleModule>} rules
 * @param {string} eslintPrefix
 * @param {string[]} names
 * @returns {Record<string, import('eslint').Rule.RuleModule>}
 */
function hostRules(rules, eslintPrefix, names) {
    return withEslintDirectiveIDsFor(Object.fromEntries(names.map((name) => [name, rules[name]])), (name) => `${eslintPrefix}/${name}`);
}

const SEPARATELY_GATED = new Set(['jsx-no-constructed-context-values', 'exhaustive-deps']);

/**
 * Lists the hosted rules from one ESLint plugin that React Compiler does not gate. The SEPARATELY_GATED
 * ones are added one by one at the end of the file.
 * @param {string} eslintPrefix
 * @returns {string[]}
 */
function plainlyHosted(eslintPrefix) {
    return hostedRuleNames(eslintPrefix).filter((name) => !SEPARATELY_GATED.has(name));
}

const plugin = {
    meta: {
        name: 'hosted',
        version: '0.0.1',
    },
    rules: {
        ...hostRules(react, 'react', plainlyHosted('react')),
        ...hostRules(imports, 'import', plainlyHosted('import')),
        ...hostRules(jsdoc, 'jsdoc', plainlyHosted('jsdoc')),
        ...hostRules(storybook, 'storybook', plainlyHosted('storybook')),
        ...hostRules({'naming-convention': namingConvention}, '@typescript-eslint', plainlyHosted('@typescript-eslint')),
        'jsx-no-constructed-context-values': withFullGating(withEslintDirectiveIDs(react['jsx-no-constructed-context-values'], 'react/jsx-no-constructed-context-values')),
        'no-deprecated-self-closing-jsx': withEslintDirectiveIDs({create: noDeprecatedSelfClosingJsxCreate, meta: noDeprecatedSelfClosingJsxMeta}, '@typescript-eslint/no-deprecated'),
        'exhaustive-deps': withMessageGating(withEslintDirectiveIDs(reactHooks['exhaustive-deps'], 'react-hooks/exhaustive-deps'), EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN),
    },
};

export default plugin;

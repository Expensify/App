import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN} from '../../reactCompiler/suppressedRules.mjs';
import {withEslintDirectiveIDs, withEslintDirectiveIDsFor} from '../eslintDirectives.mjs';
import {create as noDeprecatedSelfClosingJsxCreate, meta as noDeprecatedSelfClosingJsxMeta} from '../noDeprecatedSelfClosingJsx.mjs';
import {withFullGating, withMessageGating} from '../reactCompilerGate.mjs';
import {hostedRuleNames} from '../ruleNames.mjs';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function rulesOf(packageName) {
    let mod;
    try {
        mod = require(path.resolve(repoRoot, 'node_modules', packageName));
    } catch {
        // A directory require ignores `exports`, so a package with no `main` (typescript-eslint) needs
        // the bare specifier.
        mod = require(packageName);
    }
    return mod?.rules ?? mod?.default?.rules ?? {};
}

const react = rulesOf('eslint-plugin-react');
const importPlugin = rulesOf('eslint-plugin-import');
const jsdoc = rulesOf('eslint-plugin-jsdoc');
const storybook = rulesOf('eslint-plugin-storybook');
const typescriptEslint = rulesOf('@typescript-eslint/eslint-plugin');

// eslint-plugin-react-hooks is not a root dependency; ESLint loads the copy nested under
// eslint-config-expensify.
const reactHooks = (() => {
    const configEntry = require.resolve('eslint-config-expensify', {paths: [repoRoot]});
    return rulesOf(require.resolve('eslint-plugin-react-hooks', {paths: [path.dirname(configEntry)]}));
})();

// naming-convention requires parser services, which oxlint's JS plugins lack.
// getParserServices(context, true) tolerates a missing `program` but fails on missing node maps and
// reads context.languageOptions first, so both are stubbed. This repo's selectors never reach the
// type checker (no `types` selector).
const STUB_PARSER_SERVICES = {
    esTreeNodeToTSNodeMap: new Map(),
    tsNodeToESTreeNodeMap: new Map(),
};

function withStubbedParserServices(rule) {
    return {
        ...rule,
        create(context) {
            const sourceCode = context.sourceCode ?? context.getSourceCode();
            // A Proxy cannot do this: oxlint defines `parserServices` as a read-only, non-configurable
            // property, and a get trap may not return a different value for it.
            const stubbedSourceCode = Object.create(sourceCode, {
                parserServices: {value: STUB_PARSER_SERVICES},
            });
            const stubbedContext = Object.create(context, {
                sourceCode: {value: stubbedSourceCode},
                getSourceCode: {value: () => stubbedSourceCode},
                languageOptions: {
                    value: context.languageOptions ?? {parser: {meta: {name: 'oxlint-js-plugin'}}},
                },
            });
            return rule.create(stubbedContext);
        },
    };
}

function hostRules(rules, eslintPrefix, names) {
    return withEslintDirectiveIDsFor(Object.fromEntries(names.map((name) => [name, rules[name]])), (name) => `${eslintPrefix}/${name}`);
}

const SEPARATELY_GATED = new Set(['jsx-no-constructed-context-values', 'exhaustive-deps']);

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
        ...hostRules(importPlugin, 'import', plainlyHosted('import')),
        ...hostRules(jsdoc, 'jsdoc', plainlyHosted('jsdoc')),
        ...hostRules(storybook, 'storybook', plainlyHosted('storybook')),
        ...hostRules({'naming-convention': withStubbedParserServices(typescriptEslint['naming-convention'])}, '@typescript-eslint', plainlyHosted('@typescript-eslint')),
        'jsx-no-constructed-context-values': withFullGating(withEslintDirectiveIDs(react['jsx-no-constructed-context-values'], 'react/jsx-no-constructed-context-values')),
        'no-deprecated-self-closing-jsx': withEslintDirectiveIDs({create: noDeprecatedSelfClosingJsxCreate, meta: noDeprecatedSelfClosingJsxMeta}, '@typescript-eslint/no-deprecated'),
        'exhaustive-deps': withMessageGating(withEslintDirectiveIDs(reactHooks['exhaustive-deps'], 'react-hooks/exhaustive-deps'), EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN),
    },
};

export default plugin;

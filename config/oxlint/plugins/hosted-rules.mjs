import {createRequire} from 'node:module';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN} from '../../eslint/processors/eslint-processor-react-compiler-compat.mjs';
import {withEslintDirectiveIds, withEslintDirectiveIdsFor} from '../eslintDirectives.mjs';
import {withFullGating, withMessageGating} from '../reactCompilerGate.mjs';

const require = createRequire(import.meta.url);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

function rulesOf(packageName) {
    let mod;
    try {
        mod = require(path.resolve(repoRoot, 'node_modules', packageName));
    } catch {
        // A directory require ignores the package's `exports` map, so a package that ships no `main`
        // (typescript-eslint) resolves only by bare specifier.
        mod = require(packageName);
    }
    return mod?.rules ?? mod?.default?.rules ?? {};
}

const react = rulesOf('eslint-plugin-react');
const importPlugin = rulesOf('eslint-plugin-import');
const jsdoc = rulesOf('eslint-plugin-jsdoc');
const typescriptEslint = rulesOf('@typescript-eslint/eslint-plugin');

// eslint-plugin-react-hooks is not a root dependency: it arrives nested under eslint-config-expensify,
// and that nested copy is the one ESLint loads. Resolving by bare specifier would run a second install.
const reactHooks = (() => {
    const configEntry = require.resolve('eslint-config-expensify', {paths: [repoRoot]});
    return rulesOf(require.resolve('eslint-plugin-react-hooks', {paths: [path.dirname(configEntry)]}));
})();

// naming-convention demands parser services at startup, which oxlint's JS plugins cannot provide.
// getParserServices(context, true) tolerates a missing `program` but hard-fails on missing node maps
// and reads context.languageOptions before any check, so both are stubbed. With this repo's selector
// groups the rule never reaches the type checker anyway (no `types` selector).
const STUB_PARSER_SERVICES = {
    esTreeNodeToTSNodeMap: new Map(),
    tsNodeToESTreeNodeMap: new Map(),
};

function withStubbedParserServices(rule) {
    return {
        ...rule,
        create(context) {
            const sourceCode = context.sourceCode ?? context.getSourceCode();
            // Prototype shadowing, not a Proxy: oxlint defines `parserServices` as a read-only,
            // non-configurable data property, which a Proxy get trap may not report a different value for.
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
    return withEslintDirectiveIdsFor(Object.fromEntries(names.map((name) => [name, rules[name]])), (name) => `${eslintPrefix}/${name}`);
}

const IMPORT_PATHS = ['no-import-module-exports', 'no-relative-packages', 'no-useless-path-segments'];

const REACT_LEGACY = [
    'default-props-match-prop-types',
    'forbid-foreign-prop-types',
    'forbid-prop-types',
    'jsx-uses-react',
    'jsx-uses-vars',
    'no-access-state-in-setstate',
    'no-arrow-function-lifecycle',
    'no-deprecated',
    'no-invalid-html-attribute',
    'no-typos',
    'no-unused-class-component-methods',
    'no-unused-prop-types',
    'no-unused-state',
    'prefer-exact-props',
    'prefer-stateless-function',
    'sort-comp',
    'static-property-placement',
];

const plugin = {
    meta: {
        name: 'hosted',
        version: '0.0.1',
    },
    rules: {
        ...hostRules(react, 'react', ['jsx-no-bind', 'function-component-definition', ...REACT_LEGACY]),
        ...hostRules(importPlugin, 'import', ['prefer-default-export', 'order', ...IMPORT_PATHS]),
        ...hostRules(jsdoc, 'jsdoc', ['no-types']),
        ...hostRules({'naming-convention': withStubbedParserServices(typescriptEslint['naming-convention'])}, '@typescript-eslint', ['naming-convention']),
        'jsx-no-constructed-context-values': withFullGating(withEslintDirectiveIds(react['jsx-no-constructed-context-values'], 'react/jsx-no-constructed-context-values')),
        'exhaustive-deps': withMessageGating(withEslintDirectiveIds(reactHooks['exhaustive-deps'], 'react-hooks/exhaustive-deps'), EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN),
    },
};

export default plugin;

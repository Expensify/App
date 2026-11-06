/**
 * ESLint plugin rules run from their own code under `hosted/`, because oxlint has no version of them or its version
 * reports differently. config/oxlint/derive.mjs decides which ones. oxlint reserves these plugin names, so they all
 * share the `hosted` name.
 */
import {EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN} from '../../reactCompiler/suppressedRules.mjs';
import {STUBBED_PARSER_SERVICES, hostedRuleIDs, getPluginRules, splitRuleID} from '../derive.mjs';
import {withEslintDirectiveIDs} from '../eslintDirectives.mjs';
import {create as noDeprecatedSelfClosingJsxCreate, meta as noDeprecatedSelfClosingJsxMeta} from '../noDeprecatedSelfClosingJsx.mjs';
import {withFullGating, withMessageGating} from '../reactCompilerGate.mjs';

// naming-convention requires parser services, which oxlint's JS plugins lack.
// getParserServices(context, true) tolerates a missing `program` but fails on missing node maps and
// reads context.languageOptions first, so both are stubbed. The presets' selectors never reach the
// type checker (no `types` selector).
const STUB_PARSER_SERVICES = {
    esTreeNodeToTSNodeMap: new Map(),
    tsNodeToESTreeNodeMap: new Map(),
};

/**
 * Lets typescript-eslint's naming-convention run in oxlint. The rule fails without TypeScript parser
 * services, which oxlint's JS plugins do not have, so it gets STUB_PARSER_SERVICES instead.
 * @param {import('eslint').Rule.RuleModule} rule
 * @returns {import('eslint').Rule.RuleModule}
 */
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

// In files React Compiler memoizes, reactCompilerGate.mjs drops all jsx-no-constructed-context-values reports and the
// useCallback/useMemo reports of exhaustive-deps.
const GATES = {
    'react/jsx-no-constructed-context-values': withFullGating,
    'react-hooks/exhaustive-deps': (rule) => withMessageGating(rule, EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN),
};

/**
 * Loads one ESLint plugin rule as a hosted rule. `eslint-disable` comments that use its ESLint ID apply to it.
 * @param {string} ruleID the ESLint rule ID, like `react/jsx-no-bind`
 * @returns {import('eslint').Rule.RuleModule}
 */
function hostRule(ruleID) {
    const {prefix, name} = splitRuleID(ruleID);
    const rule = getPluginRules(prefix)[name];
    const runnable = withEslintDirectiveIDs(STUBBED_PARSER_SERVICES.has(ruleID) ? withStubbedParserServices(rule) : rule, ruleID);
    return GATES[ruleID] ? GATES[ruleID](runnable) : runnable;
}

const plugin = {
    meta: {
        name: 'hosted',
        version: '0.0.1',
    },
    rules: {
        ...Object.fromEntries(hostedRuleIDs.map((ruleID) => [splitRuleID(ruleID).name, hostRule(ruleID)])),
        'no-deprecated-self-closing-jsx': withEslintDirectiveIDs({create: noDeprecatedSelfClosingJsxCreate, meta: noDeprecatedSelfClosingJsxMeta}, '@typescript-eslint/no-deprecated'),
    },
};

export default plugin;

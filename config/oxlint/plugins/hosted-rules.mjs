/**
 * The App's `hosted` plugin: the package's hosted rules, the extra ESLint rules listed in appHostedRules.mjs, React
 * Compiler gating (reactCompilerGate.mjs) on two of them, and the App's own no-deprecated-self-closing-jsx.
 */
import {rules as presetRules} from 'eslint-config-expensify/oxlint/plugins/hosted';
import {hostRule, withEslintDirectiveIDs} from 'eslint-config-expensify/oxlint/utils';

import {EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN} from '../../reactCompiler/suppressedRules.mjs';
import {APP_HOSTED_ESLINT_RULE_IDS, APP_LOCAL_HOSTED_RULES} from '../appHostedRules.mjs';
import {create as noDeprecatedSelfClosingJsxCreate, meta as noDeprecatedSelfClosingJsxMeta} from '../noDeprecatedSelfClosingJsx.mjs';
import {withFullGating, withMessageGating} from '../reactCompilerGate.mjs';

const plugin = {
    meta: {
        name: 'hosted',
        version: '0.0.1',
    },
    rules: {
        ...presetRules,
        ...Object.fromEntries(APP_HOSTED_ESLINT_RULE_IDS.map((ruleID) => [ruleID.split('/').at(-1), hostRule(ruleID)])),

        // Gated by reactCompilerGate.mjs.
        'jsx-no-constructed-context-values': withFullGating(presetRules['jsx-no-constructed-context-values']),
        'exhaustive-deps': withMessageGating(presetRules['exhaustive-deps'], EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN),
        'no-deprecated-self-closing-jsx': withEslintDirectiveIDs(
            {create: noDeprecatedSelfClosingJsxCreate, meta: noDeprecatedSelfClosingJsxMeta},
            APP_LOCAL_HOSTED_RULES['no-deprecated-self-closing-jsx'],
        ),
    },
};

export default plugin;

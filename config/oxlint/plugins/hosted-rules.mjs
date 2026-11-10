/**
 * The App's `hosted` plugin: the package's hosted rules (eslint-config-expensify/oxlint/plugins/hosted) plus the
 * rules only the App enables, the React Compiler gates (reactCompilerGate.mjs) and the App's own
 * no-deprecated-self-closing-jsx.
 */
import {rules as presetRules} from 'eslint-config-expensify/oxlint/plugins/hosted';
import {hostRule, withEslintDirectiveIDs} from 'eslint-config-expensify/oxlint/utils';

import {EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN} from '../../reactCompiler/suppressedRules.mjs';
import {APP_HOSTED_RULE_IDS_BY_NAME, APP_LOCAL_HOSTED_RULES} from '../appHostedRules.mjs';
import {create as noDeprecatedSelfClosingJsxCreate, meta as noDeprecatedSelfClosingJsxMeta} from '../noDeprecatedSelfClosingJsx.mjs';
import {withFullGating, withMessageGating} from '../reactCompilerGate.mjs';

const plugin = {
    meta: {
        name: 'hosted',
        version: '0.0.1',
    },
    rules: {
        ...presetRules,
        ...Object.fromEntries(
            Object.entries(APP_HOSTED_RULE_IDS_BY_NAME)
                .filter(([name]) => !(name in APP_LOCAL_HOSTED_RULES))
                .map(([name, ruleID]) => [name, hostRule(ruleID)]),
        ),

        // In files React Compiler memoizes, reactCompilerGate.mjs drops all jsx-no-constructed-context-values reports and
        // the useCallback/useMemo reports of exhaustive-deps.
        'jsx-no-constructed-context-values': withFullGating(presetRules['jsx-no-constructed-context-values']),
        'exhaustive-deps': withMessageGating(presetRules['exhaustive-deps'], EXHAUSTIVE_DEPS_USECALLBACK_USEMEMO_PATTERN),
        'no-deprecated-self-closing-jsx': withEslintDirectiveIDs(
            {create: noDeprecatedSelfClosingJsxCreate, meta: noDeprecatedSelfClosingJsxMeta},
            APP_LOCAL_HOSTED_RULES['no-deprecated-self-closing-jsx'],
        ),
    },
};

export default plugin;

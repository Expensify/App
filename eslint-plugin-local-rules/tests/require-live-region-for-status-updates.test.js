// Cases for the local rule, in the same shape as the upstream eslint-plugin-expensify tests, so
// oxlint-migration/rule-tester replays them through both linters (npm run oxlint-rule-tester).
import {RuleTester} from 'eslint';

// eslint-disable-next-line import/extensions -- Node resolves this file directly when the oxlint-migration harness imports it, so the extension is required
import {create, meta} from '../require-live-region-for-status-updates.js';

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: {ecmaFeatures: {jsx: true}},
    },
});

ruleTester.run(
    'require-live-region-for-status-updates',
    {create, meta},
    {
        valid: [
            {code: 'const element = <View role="alert" accessibilityLiveRegion="polite" />;'},
            {code: 'const element = <View accessibilityRole="status" accessibilityLiveRegion="assertive" />;'},
            // not a status role, so neither attribute is required
            {code: 'const element = <View role="button" />;'},
            {code: 'const element = <View accessibilityRole={CONST.ROLE.PRESENTATION} />;'},
            // an unresolvable role could be a status role, so the live region satisfies the rule
            {code: 'const element = <View role={dynamicRole} accessibilityLiveRegion="polite" />;'},
            // CONST.ROLE.* is resolved, and this one pairs correctly
            {code: 'const element = <View accessibilityRole={CONST.ROLE.ALERT} accessibilityLiveRegion="polite" />;'},
        ],
        invalid: [
            {
                code: 'const element = <View role="alert" />;',
                errors: [{messageId: 'missingLiveRegion'}],
            },
            // the role can come from CONST.ROLE.*
            {
                code: 'const element = <View accessibilityRole={CONST.ROLE.STATUS} />;',
                errors: [{messageId: 'missingLiveRegion'}],
            },
            // a conditional counts if either branch resolves to a status role
            {
                code: 'const element = <View role={hasError ? "alert" : "button"} />;',
                errors: [{messageId: 'missingLiveRegion'}],
            },
            // a live region with no role at all
            {
                code: 'const element = <View accessibilityLiveRegion="polite" />;',
                errors: [{messageId: 'missingStatusRole'}],
            },
            // a live region on a role that resolves to something other than alert/status
            {
                code: 'const element = <View role="button" accessibilityLiveRegion="assertive" />;',
                errors: [{messageId: 'missingStatusRole'}],
            },
            // "none" suppresses the announcement the status role asks for
            {
                code: 'const element = <View role="status" accessibilityLiveRegion="none" />;',
                errors: [{messageId: 'invalidLiveRegion'}],
            },
        ],
    },
);

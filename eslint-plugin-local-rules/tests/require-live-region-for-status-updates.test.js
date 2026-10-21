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
            {code: 'const element = <View role="button" />;'},
            {code: 'const element = <View accessibilityRole={CONST.ROLE.PRESENTATION} />;'},
            {code: 'const element = <View role={dynamicRole} accessibilityLiveRegion="polite" />;'},
            {code: 'const element = <View accessibilityRole={CONST.ROLE.ALERT} accessibilityLiveRegion="polite" />;'},
        ],
        invalid: [
            {
                code: 'const element = <View role="alert" />;',
                errors: [{messageId: 'missingLiveRegion'}],
            },
            {
                code: 'const element = <View accessibilityRole={CONST.ROLE.STATUS} />;',
                errors: [{messageId: 'missingLiveRegion'}],
            },
            {
                code: 'const element = <View role={hasError ? "alert" : "button"} />;',
                errors: [{messageId: 'missingLiveRegion'}],
            },
            {
                code: 'const element = <View accessibilityLiveRegion="polite" />;',
                errors: [{messageId: 'missingStatusRole'}],
            },
            {
                code: 'const element = <View role="button" accessibilityLiveRegion="assertive" />;',
                errors: [{messageId: 'missingStatusRole'}],
            },
            {
                code: 'const element = <View role="status" accessibilityLiveRegion="none" />;',
                errors: [{messageId: 'invalidLiveRegion'}],
            },
        ],
    },
);

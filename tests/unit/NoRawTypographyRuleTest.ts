import type {Rule} from 'eslint';

import {RuleTester} from 'eslint';
import {parser as tsParser} from 'typescript-eslint';

type LocalRuleModule = Rule.RuleModule & {
    name: string;
};

function isLocalRuleModule(ruleModule: unknown): ruleModule is LocalRuleModule {
    if (typeof ruleModule !== 'object' || ruleModule === null) {
        return false;
    }

    const ruleName: unknown = Reflect.get(ruleModule, 'name');
    const create: unknown = Reflect.get(ruleModule, 'create');
    const meta: unknown = Reflect.get(ruleModule, 'meta');

    return typeof ruleName === 'string' && typeof create === 'function' && typeof meta === 'object' && meta !== null;
}

const ruleModule: unknown = require('../../eslint-plugin-local-rules/no-raw-typography');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected no-raw-typography to export an ESLint rule module.');
}

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
});

const tsRuleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: tsParser,
        parserOptions: {
            ecmaFeatures: {
                jsx: true,
            },
        },
    },
});

describe('no-raw-typography', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            'const style = {fontSize: fontScale.text, lineHeight: lineHeightScale.text};',
            'const style = {...textVariants.h1, color: theme.heading};',
            'const style = {lineHeight: undefined};',
            'const style = {lineHeight: getLineHeight(size)};',
            'const style = {[fontSize]: 17};',
            'const style = {fontWeight: 700, height: 20, size: 17};',
            'const jsx = <Text variant="body">hi</Text>;',
            'const jsx = <Icon width={16} height={16} />;',
            'const style = StyleUtils.getFontSizeStyle(fontScale.h2);',
            // `variables` is only the escape hatch for typography names — unrelated keys are untouched.
            'const style = {fontSize: variables.iconSizeNormal};',
            'const style = {padding: variables.fontSizeNormal};',
            'const width = getWidth(variables.fontSizeNormal);',
            // The styles layer opts out of the named-reference check while it finishes migrating.
            {
                code: 'const style = {fontSize: variables.fontSizeNormal};',
                options: [{allowVariablesReferences: true}],
            },
            {
                code: 'const style = StyleUtils.getFontSizeStyle(variables.fontSizeNormal);',
                options: [{allowVariablesReferences: true}],
            },
        ],
        invalid: [
            {
                code: 'const style = {fontSize: variables.fontSizeNormal};',
                errors: [{messageId: 'rawTypographyVariable'}],
            },
            {
                code: 'const style = {lineHeight: variables.lineHeightXLarge};',
                errors: [{messageId: 'rawTypographyVariable'}],
            },
            {
                code: 'const jsx = <Text fontSize={variables.fontSizeNormal}>hi</Text>;',
                errors: [{messageId: 'rawTypographyVariable'}],
            },
            {
                code: 'const style = StyleUtils.getFontSizeStyle(variables.fontSizeNormal);',
                errors: [{messageId: 'rawTypographyVariable'}],
            },
            {
                code: 'const style = getLineHeightStyle(variables.lineHeightXLarge);',
                errors: [{messageId: 'rawTypographyVariable'}],
            },
            {
                code: 'const style = getFontSizeStyle(17);',
                errors: [{messageId: 'rawTypography'}],
            },
            {
                code: 'const style = {fontSize: 17};',
                errors: [{messageId: 'rawTypography'}],
            },
            {
                code: "const style = {'fontSize': 17};",
                errors: [{messageId: 'rawTypography'}],
            },
            {
                code: 'const style = {lineHeight: 20};',
                errors: [{messageId: 'rawTypography'}],
            },
            {
                code: 'const style = {lineHeight: -1};',
                errors: [{messageId: 'rawTypography'}],
            },
            {
                code: 'const style = {fontSize: +17};',
                errors: [{messageId: 'rawTypography'}],
            },
            {
                code: 'const jsx = <Text lineHeight={+20}>hi</Text>;',
                errors: [{messageId: 'rawTypography'}],
            },
            {
                code: 'const style = {fontSize: 17, lineHeight: 20};',
                errors: [{messageId: 'rawTypography'}, {messageId: 'rawTypography'}],
            },
            {
                code: 'const jsx = <Text fontSize={17}>hi</Text>;',
                errors: [{messageId: 'rawTypography'}],
            },
            {
                code: 'const jsx = <CustomText lineHeight={20}>hi</CustomText>;',
                errors: [{messageId: 'rawTypography'}],
            },
        ],
    });

    tsRuleTester.run(`${ruleModule.name} (TS assertions)`, ruleModule, {
        valid: [
            'const style = {fontSize: fontScale.text as number};',
            {
                code: 'const style = {fontSize: variables.fontSizeNormal as number};',
                options: [{allowVariablesReferences: true}],
            },
        ],
        invalid: [
            {
                code: 'const style = {fontSize: variables.fontSizeNormal as number};',
                errors: [{messageId: 'rawTypographyVariable'}],
            },
            {
                code: 'const style = {fontSize: 17 as const};',
                errors: [{messageId: 'rawTypography'}],
            },
            {
                code: 'const style = {lineHeight: 20 satisfies number};',
                errors: [{messageId: 'rawTypography'}],
            },
            {
                code: 'const style = {fontSize: -17 as const};',
                errors: [{messageId: 'rawTypography'}],
            },
            {
                code: 'const jsx = <Text lineHeight={20 as const}>hi</Text>;',
                errors: [{messageId: 'rawTypography'}],
            },
        ],
    });
});

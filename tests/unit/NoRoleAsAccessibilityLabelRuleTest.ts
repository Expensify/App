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

const ruleModule: unknown = require('../../eslint-plugin-local-rules/no-role-as-accessibility-label');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected no-role-as-accessibility-label to export an ESLint rule module.');
}

const ruleTester = new RuleTester({
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

describe('no-role-as-accessibility-label', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            // Given a role passed as a role, When linted, Then it passes, since that is where a role belongs
            '<Pressable role={CONST.ROLE.BUTTON} accessibilityLabel={translate("common.close")} />',
            // Given a role passed through the older accessibilityRole prop, When linted, Then it passes for the same reason
            '<Pressable accessibilityRole={CONST.ROLE.BUTTON} accessibilityLabel={label} />',
            // Given a label with a fallback that is real text, When linted, Then it passes, since every branch names the control
            '<Pressable accessibilityLabel={label ?? translate("common.close")} />',
            // Given a role constant used for something other than a name, When linted, Then it passes, since only accessible names are checked
            '<Tooltip text={CONST.ROLE.TOOLTIP} />',
            // Given a different constant group with a ROLE-like key, When linted, Then it passes, since only CONST.ROLE holds role words
            '<Pressable accessibilityLabel={CONST.WORKSPACE.ROLE} />',
            // Given a role set on an object of props, When linted, Then it passes, since the key is not an accessible name
            'const props = {role: CONST.ROLE.BUTTON, accessibilityLabel: translate("common.close")};',
        ],
        invalid: [
            {
                // Given the role constant as the label, When linted, Then it is reported, because the screen reader would read "button, button"
                code: '<Pressable accessibilityLabel={CONST.ROLE.BUTTON} />',
                errors: [{messageId: 'roleAsLabel', data: {prop: 'accessibilityLabel', role: 'BUTTON'}}],
            },
            {
                // Given the role constant as a `??` fallback, When linted, Then it is reported, because the fallback is what gets read when there is no href
                code: '<Pressable accessibilityLabel={rest.href ?? CONST.ROLE.BUTTON} />',
                errors: [{messageId: 'roleAsLabel', data: {prop: 'accessibilityLabel', role: 'BUTTON'}}],
            },
            {
                // Given the role constant as a `||` fallback, When linted, Then it is reported for the same reason
                code: '<Pressable accessibilityLabel={label || CONST.ROLE.LINK} />',
                errors: [{messageId: 'roleAsLabel', data: {prop: 'accessibilityLabel', role: 'LINK'}}],
            },
            {
                // Given the role constant in one branch of a ternary, When linted, Then it is reported, since that branch names the control with a role
                code: '<Pressable accessibilityLabel={isLink ? translate("common.open") : CONST.ROLE.BUTTON} />',
                errors: [{messageId: 'roleAsLabel', data: {prop: 'accessibilityLabel', role: 'BUTTON'}}],
            },
            {
                // Given role constants in both branches of a ternary, When linted, Then each one is reported
                code: '<Pressable accessibilityLabel={isLink ? CONST.ROLE.LINK : CONST.ROLE.BUTTON} />',
                errors: [{messageId: 'roleAsLabel'}, {messageId: 'roleAsLabel'}],
            },
            {
                // Given the role constant as a web aria-label, When linted, Then it is reported, since aria-label is the accessible name on web
                code: '<View aria-label={CONST.ROLE.TOOLTIP} />',
                errors: [{messageId: 'roleAsLabel', data: {prop: 'aria-label', role: 'TOOLTIP'}}],
            },
            {
                // Given the role constant as a switch's label, When linted, Then it is reported, since that prop names the switch
                code: '<ToggleSettingOptionRow switchAccessibilityLabel={CONST.ROLE.SWITCH} />',
                errors: [{messageId: 'roleAsLabel', data: {prop: 'switchAccessibilityLabel', role: 'SWITCH'}}],
            },
            {
                // Given the role constant behind a type assertion, When linted, Then it is still reported, since the assertion doesn't change the value
                code: '<Pressable accessibilityLabel={CONST.ROLE.BUTTON as string} />',
                errors: [{messageId: 'roleAsLabel', data: {prop: 'accessibilityLabel', role: 'BUTTON'}}],
            },
            {
                // Given the role constant as a label in an object of props, When linted, Then it is reported, since the object gets spread onto a control
                code: 'const props = {accessibilityLabel: CONST.ROLE.BUTTON};',
                errors: [{messageId: 'roleAsLabel', data: {prop: 'accessibilityLabel', role: 'BUTTON'}}],
            },
        ],
    });
});

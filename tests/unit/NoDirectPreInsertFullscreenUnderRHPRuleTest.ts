import type {Rule} from 'eslint';

import {RuleTester} from 'eslint';

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

const ruleModule: unknown = require('../../eslint-plugin-local-rules/no-direct-pre-insert-fullscreen-under-rhp');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected no-direct-pre-insert-fullscreen-under-rhp to export an ESLint rule module.');
}

const ruleTester = new RuleTester({
    languageOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
});

const NAVIGATION_IMPORT = "import Navigation from '@libs/Navigation/Navigation';";

describe('no-direct-pre-insert-fullscreen-under-rhp', () => {
    ruleTester.run(ruleModule.name, ruleModule, {
        valid: [
            'Navigation.navigate(route);',
            'OtherNavigation.preInsertFullscreenUnderRHP(route);',
            `${NAVIGATION_IMPORT} Navigation[preInsertFullscreenUnderRHP](route);`,
            'const Navigation = {preInsertFullscreenUnderRHP: () => {}}; Navigation.preInsertFullscreenUnderRHP(route);',
            'const preInsertFullscreenUnderRHP = () => {}; preInsertFullscreenUnderRHP(route);',
            'const {preInsertFullscreenUnderRHP} = OtherNavigation; preInsertFullscreenUnderRHP(route);',
            'const {preInsertFullscreenUnderRHP} = UnknownNavigation; preInsertFullscreenUnderRHP(route);',
            `${NAVIGATION_IMPORT} const preInsert = Navigation.preInsertFullscreenUnderRHP; function run() { const preInsert = () => {}; preInsert(route); }`,
            `${NAVIGATION_IMPORT} const {preInsertFullscreenUnderRHP} = Navigation; function run(preInsertFullscreenUnderRHP) { preInsertFullscreenUnderRHP(route); }`,
            {
                code: `${NAVIGATION_IMPORT} Navigation.preInsertFullscreenUnderRHP(route);`,
                filename: '/repo/src/hooks/usePreMountDestination/index.ts',
            },
        ],
        invalid: [
            {
                code: `${NAVIGATION_IMPORT} Navigation.preInsertFullscreenUnderRHP(route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
            {
                code: `${NAVIGATION_IMPORT} Navigation["preInsertFullscreenUnderRHP"](route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
            {
                code: "import Nav from '@libs/Navigation/Navigation'; Nav.preInsertFullscreenUnderRHP(route);",
                errors: [{messageId: 'useHookInstead'}],
            },
            {
                code: `${NAVIGATION_IMPORT} const {preInsertFullscreenUnderRHP} = Navigation; preInsertFullscreenUnderRHP(route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
            {
                code: `${NAVIGATION_IMPORT} const {preInsertFullscreenUnderRHP: preInsert} = Navigation; preInsert(route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
            {
                code: `${NAVIGATION_IMPORT} const preInsert = Navigation.preInsertFullscreenUnderRHP; preInsert(route);`,
                errors: [{messageId: 'useHookInstead'}],
            },
        ],
    });
});

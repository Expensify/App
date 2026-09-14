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

const ruleModule: unknown = require('../../eslint-plugin-local-rules/no-direct-personal-details-list');

if (!isLocalRuleModule(ruleModule)) {
    throw new TypeError('Expected no-direct-personal-details-list to export an ESLint rule module.');
}

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

describe('no-direct-personal-details-list', () => {
    tsRuleTester.run(ruleModule.name, ruleModule, {
        valid: [
            'const [personalDetail] = usePersonalDetail(accountID);',
            'const [personalDetails] = usePersonalDetailsByIDs(accountIDs);',
            'const personalDetail = getPersonalDetail(accountID);',
            // Type positions parse as TSTypeQuery, not MemberExpression.
            'type Update = OnyxUpdate<typeof ONYXKEYS.PERSONAL_DETAILS_LIST>;',
            'type Data = Partial<Record<typeof ONYXKEYS.PERSONAL_DETAILS_LIST, PersonalDetailsList>>;',
            'const [metadata] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_METADATA);',
            'const [list] = useOnyx(ONYXKEYS.COLLECTION.REPORT);',
            'const key = SOME_OTHER_KEYS.PERSONAL_DETAILS_LIST;',
            // Only known at runtime, so there is nothing to resolve statically.
            'const key = ONYXKEYS[PERSONAL_DETAILS_LIST];',
        ],
        invalid: [
            {
                code: 'const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);',
                errors: [{messageId: 'directUsage'}],
            },
            {
                code: 'const [login] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsLoginSelector(accountID)});',
                errors: [{messageId: 'directUsage'}],
            },
            {
                code: "const [personalDetails] = useOnyx(ONYXKEYS['PERSONAL_DETAILS_LIST']);",
                errors: [{messageId: 'directUsage'}],
            },
            {
                code: 'const [personalDetails] = useOnyx(ONYXKEYS[`PERSONAL_DETAILS_LIST`]);',
                errors: [{messageId: 'directUsage'}],
            },
            {
                code: 'Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {[accountID]: null});',
                errors: [{messageId: 'directUsage'}],
            },
            {
                code: 'const update = {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.PERSONAL_DETAILS_LIST, value: personalDetails};',
                errors: [{messageId: 'directUsage'}],
            },
            {
                code: 'Onyx.connectWithoutView({key: ONYXKEYS.PERSONAL_DETAILS_LIST, callback: (value) => value});',
                errors: [{messageId: 'directUsage'}],
            },
            {
                code: 'const masks = {[ONYXKEYS.PERSONAL_DETAILS_LIST]: {allowList: []}};',
                errors: [{messageId: 'directUsage'}],
            },
            {
                // Reported per usage, so the seatbelt count is per usage too.
                code: 'const [all] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST); Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {});',
                errors: [{messageId: 'directUsage'}, {messageId: 'directUsage'}],
            },
        ],
    });
});

import getInsightsViolationRule from '@pages/Insights/details/getInsightsViolationRule';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Policy} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

const POLICY: Policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.CORPORATE),
    id: 'ABC123',
    outputCurrency: CONST.CURRENCY.USD,
    maxExpenseAmountNoReceipt: 7500,
    maxExpenseAmountNoItemizedReceipt: 20000,
    maxExpenseAmount: 100000,
    maxExpenseAge: 90,
    requiresCategory: true,
};

describe('getInsightsViolationRule', () => {
    it.each([
        [
            CONST.VIOLATIONS.RECEIPT_REQUIRED,
            {type: CONST.VIOLATIONS.RECEIPT_REQUIRED, amount: 7500, currency: CONST.CURRENCY.USD, route: ROUTES.RULES_RECEIPT_REQUIRED_AMOUNT.getRoute('ABC123')},
        ],
        [
            CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED,
            {type: CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED, amount: 20000, currency: CONST.CURRENCY.USD, route: ROUTES.RULES_ITEMIZED_RECEIPT_REQUIRED_AMOUNT.getRoute('ABC123')},
        ],
        [CONST.VIOLATIONS.OVER_LIMIT, {type: CONST.VIOLATIONS.OVER_LIMIT, amount: 100000, currency: CONST.CURRENCY.USD, route: ROUTES.RULES_MAX_EXPENSE_AMOUNT.getRoute('ABC123')}],
        [CONST.VIOLATIONS.MAX_AGE, {type: CONST.VIOLATIONS.MAX_AGE, days: 90, route: ROUTES.RULES_MAX_EXPENSE_AGE.getRoute('ABC123')}],
        [CONST.VIOLATIONS.MISSING_CATEGORY, {type: CONST.VIOLATIONS.MISSING_CATEGORY, route: ROUTES.RULES_REQUIRE_FIELDS.getRoute('ABC123')}],
    ])('names the workspace setting behind %s', (violation, expectedRule) => {
        // Given a workspace with every rule turned on

        // When the setting behind the violation is looked up
        const rule = getInsightsViolationRule(violation, POLICY);

        // Then the row names that setting and links to its page in workspace settings
        expect(rule).toEqual(expectedRule);
    });

    it.each([
        [CONST.VIOLATIONS.RECEIPT_REQUIRED, {maxExpenseAmountNoReceipt: CONST.DISABLED_MAX_EXPENSE_VALUE}],
        [CONST.VIOLATIONS.ITEMIZED_RECEIPT_REQUIRED, {maxExpenseAmountNoItemizedReceipt: undefined}],
        [CONST.VIOLATIONS.OVER_LIMIT, {maxExpenseAmount: CONST.DISABLED_MAX_EXPENSE_VALUE}],
        [CONST.VIOLATIONS.MAX_AGE, {maxExpenseAge: CONST.DISABLED_MAX_EXPENSE_VALUE}],
        [CONST.VIOLATIONS.MISSING_CATEGORY, {requiresCategory: false}],
    ])('returns nothing for %s when its setting is off', (violation, disabledSetting) => {
        // Given a workspace whose setting behind the violation has since been turned off
        const policy = {...POLICY, ...disabledSetting};

        // When the setting behind the violation is looked up
        const rule = getInsightsViolationRule(violation, policy);

        // Then there's no current setting to name, so the row is hidden
        expect(rule).toBeUndefined();
    });

    it.each([CONST.VIOLATIONS.DUPLICATED_TRANSACTION, CONST.VIOLATIONS.OVER_CATEGORY_LIMIT, CONST.VIOLATIONS.SMARTSCAN_FAILED])(
        'returns nothing for %s, which no single workspace setting raises',
        (violation) => {
            // Given a workspace with every rule turned on

            // When the setting behind a violation that doesn't come from one setting is looked up
            const rule = getInsightsViolationRule(violation, POLICY);

            // Then there's no setting to name, so the row is hidden
            expect(rule).toBeUndefined();
        },
    );
});

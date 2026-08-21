import {initSplitExpenseItemData} from '@libs/actions/IOU/SplitExpenseItems';

import CONST from '@src/CONST';
import type {Policy, Report, Transaction} from '@src/types/onyx';

/**
 * Tests for the stale-tax gating in `initSplitExpenseItemData`.
 *
 * When a tax rate's value is edited in workspace settings after an expense was created, the expense's stored
 * `taxValue` (and the `taxAmount` derived from it) no longer match the live policy rate. Seeding a split from
 * those stored values persists a tax label and amount that disagree, so the seeding is gated to drop the stale
 * tax fields when a policy is available to detect the mismatch.
 */
describe('initSplitExpenseItemData tax gating', () => {
    const TAX_CODE = 'idDefault';

    const buildPolicy = (defaultRateValue: string): Policy =>
        ({
            id: '200',
            name: 'Tax Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            owner: 'owner@test.com',
            outputCurrency: CONST.CURRENCY.USD,
            isPolicyExpenseChatEnabled: true,
            role: CONST.POLICY.ROLE.ADMIN,
            tax: {trackingEnabled: true},
            taxRates: {
                name: 'Tax',
                defaultExternalID: TAX_CODE,
                foreignTaxDefault: TAX_CODE,
                defaultValue: defaultRateValue,
                taxes: {
                    [TAX_CODE]: {name: 'Tax Rate 1', value: defaultRateValue},
                },
            },
        }) as Policy;

    const transaction: Transaction = {
        transactionID: 'tx-1',
        amount: -10000,
        currency: CONST.CURRENCY.USD,
        created: '2024-01-01',
        merchant: 'Coffee',
        reportID: 'report-100',
        comment: {},
        taxCode: TAX_CODE,
        taxAmount: 476, // computed from the old 5% rate (100 * 5 / 105)
        taxValue: '5%',
    };

    const transactionReport = {reportID: 'report-100', statusNum: 0} as Report;

    it('drops the stale taxCode/taxValue and zeroes taxAmount when the stored value is out of date', () => {
        // Policy rate is now 20% while the transaction stored 5% -> stale.
        const splitExpense = initSplitExpenseItemData(transaction, transactionReport, {policy: buildPolicy('20%')});

        expect(splitExpense.taxCode).toBeUndefined();
        expect(splitExpense.taxValue).toBeUndefined();
        expect(splitExpense.taxAmount).toBe(0);
    });

    it('keeps the stored tax fields when the stored value still matches the policy rate', () => {
        // Policy rate matches the transaction's stored 5% -> not stale.
        const splitExpense = initSplitExpenseItemData(transaction, transactionReport, {policy: buildPolicy('5%')});

        expect(splitExpense.taxCode).toBe(TAX_CODE);
        expect(splitExpense.taxValue).toBe('5%');
        expect(splitExpense.taxAmount).toBe(476);
    });

    it('keeps the stored tax fields when no policy is provided (existing behavior)', () => {
        const splitExpense = initSplitExpenseItemData(transaction, transactionReport);

        expect(splitExpense.taxCode).toBe(TAX_CODE);
        expect(splitExpense.taxValue).toBe('5%');
        expect(splitExpense.taxAmount).toBe(476);
    });
});

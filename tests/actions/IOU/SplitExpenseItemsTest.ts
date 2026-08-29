import {initSplitExpenseItemData} from '@libs/actions/IOU/SplitExpenseItems';

import CONST from '@src/CONST';
import type {Policy, Report, Transaction} from '@src/types/onyx';

/**
 * Tests for the stale-tax handling in `initSplitExpenseItemData`.
 *
 * When a tax rate is edited or deleted in workspace settings after an expense was created, the expense's stored
 * `taxValue` (and the `taxAmount` derived from it) no longer match the live policy rate. Instead of seeding a split
 * with those stale values, the tax is resolved fresh against the live policy so `taxCode`/`taxValue`/`taxAmount`
 * stay consistent: the rate's current value is used when the code still resolves, the policy default is used when
 * the rate was deleted, and all three fields are cleared when no live rate applies.
 */
describe('initSplitExpenseItemData stale tax handling', () => {
    const TAX_CODE = 'idDefault';
    const NEW_TAX_CODE = 'idNew';

    const buildPolicy = (defaultRateValue: string): Policy =>
        ({
            id: '200',
            name: 'Tax Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            owner: 'owner@test.com',
            outputCurrency: CONST.CURRENCY.USD,
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

    // The originally selected tax code no longer exists in the policy. A different code is now the default.
    const buildPolicyWithDeletedRate = (defaultRateValue: string): Policy =>
        ({
            id: '200',
            name: 'Tax Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            owner: 'owner@test.com',
            outputCurrency: CONST.CURRENCY.USD,
            role: CONST.POLICY.ROLE.ADMIN,
            tax: {trackingEnabled: true},
            taxRates: {
                name: 'Tax',
                defaultExternalID: NEW_TAX_CODE,
                foreignTaxDefault: NEW_TAX_CODE,
                defaultValue: defaultRateValue,
                taxes: {
                    [NEW_TAX_CODE]: {name: 'Tax Rate 2', value: defaultRateValue},
                },
            },
        }) as Policy;

    // The originally selected tax code still exists but is disabled, so it is no longer selectable. A different
    // enabled code is now the default.
    const buildPolicyWithDisabledRate = (disabledRateValue: string, defaultRateValue: string): Policy =>
        ({
            id: '200',
            name: 'Tax Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            owner: 'owner@test.com',
            outputCurrency: CONST.CURRENCY.USD,
            role: CONST.POLICY.ROLE.ADMIN,
            tax: {trackingEnabled: true},
            taxRates: {
                name: 'Tax',
                defaultExternalID: NEW_TAX_CODE,
                foreignTaxDefault: NEW_TAX_CODE,
                defaultValue: defaultRateValue,
                taxes: {
                    [TAX_CODE]: {name: 'Tax Rate 1', value: disabledRateValue, isDisabled: true},
                    [NEW_TAX_CODE]: {name: 'Tax Rate 2', value: defaultRateValue},
                },
            },
        }) as Policy;

    // The originally selected tax code is disabled and it is also the policy default, so no selectable rate resolves.
    const buildPolicyWithOnlyDisabledRate = (disabledRateValue: string): Policy =>
        ({
            id: '200',
            name: 'Tax Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            owner: 'owner@test.com',
            outputCurrency: CONST.CURRENCY.USD,
            role: CONST.POLICY.ROLE.ADMIN,
            tax: {trackingEnabled: true},
            taxRates: {
                name: 'Tax',
                defaultExternalID: TAX_CODE,
                foreignTaxDefault: TAX_CODE,
                defaultValue: disabledRateValue,
                taxes: {
                    [TAX_CODE]: {name: 'Tax Rate 1', value: disabledRateValue, isDisabled: true},
                },
            },
        }) as Policy;

    // No tax rate resolves at all (the rate was deleted and there is no default to fall back to).
    const buildPolicyWithoutRates = (): Policy =>
        ({
            id: '200',
            name: 'Tax Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            owner: 'owner@test.com',
            outputCurrency: CONST.CURRENCY.USD,
            role: CONST.POLICY.ROLE.ADMIN,
            tax: {trackingEnabled: true},
            taxRates: {
                name: 'Tax',
                defaultExternalID: '',
                foreignTaxDefault: '',
                defaultValue: '',
                taxes: {},
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

    it('refreshes the tax with the live rate when the stored value is out of date', () => {
        // Policy rate is now 20% while the transaction stored 5%, so it is stale. Keep the code, use the live value
        // and a recalculated amount (20% of 100 gives 100 * 20 / 120 = 16.67).
        const splitExpense = initSplitExpenseItemData(transaction, transactionReport, {policy: buildPolicy('20%'), getCurrencyDecimals: () => 2});

        expect(splitExpense.taxCode).toBe(TAX_CODE);
        expect(splitExpense.taxValue).toBe('20%');
        expect(splitExpense.taxAmount).toBe(1667);
    });

    it('falls back to the policy default rate when the stored tax rate was deleted', () => {
        // The stored code no longer exists. The policy default is now a 10% rate (100 * 10 / 110 = 9.09).
        const splitExpense = initSplitExpenseItemData(transaction, transactionReport, {policy: buildPolicyWithDeletedRate('10%'), getCurrencyDecimals: () => 2});

        expect(splitExpense.taxCode).toBe(NEW_TAX_CODE);
        expect(splitExpense.taxValue).toBe('10%');
        expect(splitExpense.taxAmount).toBe(909);
    });

    it('falls back to the policy default rate when the stored tax rate was disabled', () => {
        // The stored code still exists but is disabled, so it is not selectable. The enabled default is a 10% rate
        // (100 * 10 / 110 = 9.09).
        const splitExpense = initSplitExpenseItemData(transaction, transactionReport, {policy: buildPolicyWithDisabledRate('20%', '10%'), getCurrencyDecimals: () => 2});

        expect(splitExpense.taxCode).toBe(NEW_TAX_CODE);
        expect(splitExpense.taxValue).toBe('10%');
        expect(splitExpense.taxAmount).toBe(909);
    });

    it('refreshes to the default rate when the stored value still matches but its rate is now disabled', () => {
        // The stored 5% still matches the (now disabled) rate's value, but a disabled rate is not selectable, so the
        // split refreshes to the enabled 10% default (100 * 10 / 110 = 9.09) instead of keeping the disabled rate.
        const splitExpense = initSplitExpenseItemData(transaction, transactionReport, {policy: buildPolicyWithDisabledRate('5%', '10%'), getCurrencyDecimals: () => 2});

        expect(splitExpense.taxCode).toBe(NEW_TAX_CODE);
        expect(splitExpense.taxValue).toBe('10%');
        expect(splitExpense.taxAmount).toBe(909);
    });

    it('keeps the parent stored tax trio when only a disabled rate resolves', () => {
        // The stored code is disabled and it is also the default, so no selectable rate resolves. Keep the parent's
        // internally-consistent stored trio.
        const splitExpense = initSplitExpenseItemData(transaction, transactionReport, {policy: buildPolicyWithOnlyDisabledRate('20%'), getCurrencyDecimals: () => 2});

        expect(splitExpense.taxCode).toBe(TAX_CODE);
        expect(splitExpense.taxValue).toBe('5%');
        expect(splitExpense.taxAmount).toBe(476);
    });

    it('keeps the parent stored tax trio when no live rate can be resolved', () => {
        // The rate was deleted and there is no default to fall back to. Rather than emitting an undefined code/value
        // (which the save path would overwrite with the parent's deleted values while keeping a recomputed amount),
        // leave the parent's internally-consistent stored trio in place.
        const splitExpense = initSplitExpenseItemData(transaction, transactionReport, {policy: buildPolicyWithoutRates(), getCurrencyDecimals: () => 2});

        expect(splitExpense.taxCode).toBe(TAX_CODE);
        expect(splitExpense.taxValue).toBe('5%');
        expect(splitExpense.taxAmount).toBe(476);
    });

    it('keeps the stored tax fields when the stored value still matches the policy rate', () => {
        // Policy rate matches the transaction's stored 5%, so it is not stale.
        const splitExpense = initSplitExpenseItemData(transaction, transactionReport, {policy: buildPolicy('5%'), getCurrencyDecimals: () => 2});

        expect(splitExpense.taxCode).toBe(TAX_CODE);
        expect(splitExpense.taxValue).toBe('5%');
        expect(splitExpense.taxAmount).toBe(476);
    });

    it('keeps the stored tax fields when no policy is provided (existing behavior)', () => {
        const splitExpense = initSplitExpenseItemData(transaction, transactionReport, {getCurrencyDecimals: () => 2});

        expect(splitExpense.taxCode).toBe(TAX_CODE);
        expect(splitExpense.taxValue).toBe('5%');
        expect(splitExpense.taxAmount).toBe(476);
    });
});

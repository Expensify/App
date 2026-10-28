import {getChangedTagLevels, getMerchantRuleDraftFromTransaction, isMerchantRuleSuggestionLive} from '@libs/MerchantRuleSuggestionUtils';

import CONST from '@src/CONST';
import type {MerchantRuleSuggestion, Policy, Transaction} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

const TRANSACTION_ID = '1234567890';

/**
 * A minimal expense the draft builder can read. Tests override only the fields they exercise, so the seeding table is
 * validated against a realistic transaction rather than a hand-picked subset.
 */
const buildTransaction = (overrides: Partial<Transaction> = {}) =>
    ({
        transactionID: TRANSACTION_ID,
        merchant: 'Starbucks',
        amount: -500,
        currency: 'USD',
        created: '2026-09-01',
        reportID: '999',
        comment: {},
        ...overrides,
    }) as Transaction;

/** The recorded tag levels, built rather than written inline so the level numbers stay out of an object literal. */
const buildEditedTagLevels = (levels: number[]): Record<string, boolean> => Object.fromEntries(levels.map((level) => [level, true]));

/** A workspace holding one tax rate, to exercise seeding a rate that is still there against one that is not. */
const buildPolicyWithTax = (taxCode: string): Policy => {
    const policy = createRandomPolicy(0);
    policy.taxRates = {
        name: 'Tax',
        defaultExternalID: taxCode,
        defaultValue: '0%',
        foreignTaxDefault: taxCode,
        taxes: Object.fromEntries([[taxCode, {name: 'Tax exempt', value: '0%'}]]),
    };
    return policy;
};

const buildSuggestion = (overrides: Partial<MerchantRuleSuggestion> = {}) =>
    ({
        transactionID: TRANSACTION_ID,
        reportID: '999',
        editedFields: {[TRANSACTION_ID]: {category: true}},
        ...overrides,
    }) as MerchantRuleSuggestion;

describe('isMerchantRuleSuggestionLive', () => {
    it('is not live without a stored offer', () => {
        expect(isMerchantRuleSuggestionLive(undefined)).toBe(false);
    });

    it('is not live without a transaction to offer for', () => {
        expect(isMerchantRuleSuggestionLive(buildSuggestion({transactionID: ''}))).toBe(false);
    });

    it('is live for a freshly recorded edit', () => {
        expect(isMerchantRuleSuggestionLive(buildSuggestion())).toBe(true);
    });

    it('is not live once retired', () => {
        expect(isMerchantRuleSuggestionLive(buildSuggestion({isRetired: true}))).toBe(false);
    });

    it('stays live after being seen, since seeing it is not taking it', () => {
        expect(isMerchantRuleSuggestionLive(buildSuggestion({seenInReportID: '999'}))).toBe(true);
    });

    it('is not live once this expense is dismissed', () => {
        expect(isMerchantRuleSuggestionLive(buildSuggestion({dismissedTransactionIDs: [TRANSACTION_ID]}))).toBe(false);
    });

    it('stays live when a different expense was dismissed', () => {
        expect(isMerchantRuleSuggestionLive(buildSuggestion({dismissedTransactionIDs: ['9999']}))).toBe(true);
    });
});

describe('getChangedTagLevels', () => {
    it('reports no change when the tag is untouched', () => {
        expect(getChangedTagLevels('Sales:South America', 'Sales:South America')).toEqual([]);
    });

    it('reports only the level that changed', () => {
        expect(getChangedTagLevels('Sales:South America:Project 6', 'Marketing:South America:Project 6')).toEqual([0]);
        expect(getChangedTagLevels('Sales:South America:Project 6', 'Sales:Europe:Project 6')).toEqual([1]);
    });

    it('reports every level that changed', () => {
        expect(getChangedTagLevels('Sales:South America', 'Marketing:Europe')).toEqual([0, 1]);
    });

    it('reports a level added to a shorter tag', () => {
        expect(getChangedTagLevels('Sales', 'Sales:South America')).toEqual([1]);
    });

    it('reports a level removed from a longer tag', () => {
        expect(getChangedTagLevels('Sales:South America', 'Sales')).toEqual([1]);
    });

    it('reports the whole tag when it is cleared', () => {
        expect(getChangedTagLevels('Sales:South America', '')).toEqual([0, 1]);
    });

    it('reports a single-level tag being set', () => {
        expect(getChangedTagLevels('', 'Sales')).toEqual([0]);
    });
});

describe('getMerchantRuleDraftFromTransaction', () => {
    it('returns nothing when there is no expense', () => {
        expect(getMerchantRuleDraftFromTransaction(undefined, [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY], undefined)).toBeUndefined();
    });

    it('returns nothing when the expense has no merchant to match on', () => {
        const transaction = buildTransaction({merchant: CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT});
        expect(getMerchantRuleDraftFromTransaction(transaction, [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY], undefined)).toBeUndefined();
    });

    it('names the rule type itself, so the editor opens rather than the type chooser', () => {
        const draft = getMerchantRuleDraftFromTransaction(buildTransaction(), [], undefined);
        expect(draft?.ruleType).toBe(CONST.POLICY.EXPENSE_DEFAULT_RULE_TYPE.MERCHANT);
        expect(draft?.merchantToMatch).toBe('Starbucks');
    });

    it('seeds the category that was edited', () => {
        const transaction = buildTransaction({category: 'Benefits'});
        const draft = getMerchantRuleDraftFromTransaction(transaction, [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY], undefined);
        expect(draft?.category).toBe('Benefits');
    });

    it('leaves out a field that was cleared, so the rule would change nothing', () => {
        const transaction = buildTransaction({category: ''});
        const draft = getMerchantRuleDraftFromTransaction(transaction, [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY], undefined);
        expect(draft).not.toHaveProperty('category');
    });

    it('carries the whole tag when no levels were recorded', () => {
        const transaction = buildTransaction({tag: 'Sales:South America'});
        const draft = getMerchantRuleDraftFromTransaction(transaction, [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAG], undefined);
        expect(draft?.tag).toBe('Sales:South America');
    });

    it('blanks the levels that were not edited', () => {
        const transaction = buildTransaction({tag: 'Sales:South America:Project 6'});
        const draft = getMerchantRuleDraftFromTransaction(transaction, [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAG], undefined, buildEditedTagLevels([1]));
        expect(draft?.tag).toBe(':South America');
    });

    it('keeps the first level alone when only it was edited', () => {
        const transaction = buildTransaction({tag: 'Sales:South America'});
        const draft = getMerchantRuleDraftFromTransaction(transaction, [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAG], undefined, buildEditedTagLevels([0]));
        expect(draft?.tag).toBe('Sales');
    });

    it('leaves out the tag when every edited level is empty', () => {
        const transaction = buildTransaction({tag: ''});
        const draft = getMerchantRuleDraftFromTransaction(transaction, [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAG], undefined, buildEditedTagLevels([0]));
        expect(draft).not.toHaveProperty('tag');
    });

    it('seeds a tax rate the workspace still holds', () => {
        const transaction = buildTransaction({taxCode: 'id_TAX_EXEMPT'});
        const draft = getMerchantRuleDraftFromTransaction(transaction, [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAX], buildPolicyWithTax('id_TAX_EXEMPT'));
        expect(draft?.tax).toBe('id_TAX_EXEMPT');
    });

    it('leaves out a tax rate the workspace no longer holds', () => {
        const transaction = buildTransaction({taxCode: 'id_GONE'});
        const draft = getMerchantRuleDraftFromTransaction(transaction, [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAX], buildPolicyWithTax('id_TAX_EXEMPT'));
        expect(draft).not.toHaveProperty('tax');
    });

    it('seeds an unset reimbursable as reimbursable, matching what the expense shows', () => {
        const draft = getMerchantRuleDraftFromTransaction(buildTransaction(), [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.REIMBURSABLE], undefined);
        expect(draft?.reimbursable).toBe(true);
    });

    it('seeds reimbursable turned off', () => {
        const transaction = buildTransaction({reimbursable: false});
        const draft = getMerchantRuleDraftFromTransaction(transaction, [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.REIMBURSABLE], undefined);
        expect(draft?.reimbursable).toBe(false);
    });

    it('carries every edited field together, so one rule holds them all', () => {
        const transaction = buildTransaction({category: 'Benefits', tag: 'Sales', billable: true});
        const draft = getMerchantRuleDraftFromTransaction(
            transaction,
            [CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY, CONST.MERCHANT_RULE_SUGGESTION_FIELDS.TAG, CONST.MERCHANT_RULE_SUGGESTION_FIELDS.BILLABLE],
            undefined,
        );
        expect(draft?.category).toBe('Benefits');
        expect(draft?.tag).toBe('Sales');
        expect(draft?.billable).toBe(true);
    });
});

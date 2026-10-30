import {getChangedTagLevels, getMerchantRuleDraftFromTransaction, getOfferableMerchantRuleSuggestionFields, isMerchantRuleSuggestionLive} from '@libs/MerchantRuleSuggestionUtils';

import CONST from '@src/CONST';
import type {MerchantRuleSuggestion, MerchantRuleSuggestionConfirmation, Policy, Transaction} from '@src/types/onyx';

import createRandomPolicy from '../utils/collections/policies';

const TRANSACTION_ID = '1234567890';
const OTHER_TRANSACTION_ID = '9999';

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
        reportIDs: {[TRANSACTION_ID]: '999'},
        editedFields: {[TRANSACTION_ID]: {category: true}},
        ...overrides,
    }) as MerchantRuleSuggestion;

const buildConfirmation = (overrides: Partial<MerchantRuleSuggestionConfirmation> = {}): MerchantRuleSuggestionConfirmation => ({
    category: true,
    ...overrides,
});

describe('isMerchantRuleSuggestionLive', () => {
    it('is not live without a stored offer', () => {
        // Given neither edits nor a verdict, which is how both records read before the first tracked edit
        // When the offer is checked
        // Then it does not stand
        expect(isMerchantRuleSuggestionLive(undefined, undefined)).toBe(false);
    });

    it('is not live until an edit names the expense offering', () => {
        // Given a record holding no expense, which is how it reads before the first tracked edit
        // When the offer is checked
        // Then it does not stand, since there is no expense for the callout to offer on
        expect(isMerchantRuleSuggestionLive(buildSuggestion({transactionID: undefined}), buildConfirmation())).toBe(false);
    });

    it('is live once the server has confirmed an edited field', () => {
        // Given an edit the server judged worth a rule
        // When the offer is checked
        // Then it stands
        expect(isMerchantRuleSuggestionLive(buildSuggestion(), buildConfirmation())).toBe(true);
    });

    it('is not live while the edit is still waiting on the server', () => {
        // Given an edit recorded before its queued write has been answered
        // When the offer is checked
        // Then it does not stand, since only the server can say the edit repeats
        expect(isMerchantRuleSuggestionLive(buildSuggestion(), undefined)).toBe(false);
    });

    it('is not live when the server turned the edit down', () => {
        // Given a verdict saying this edit is a one-off, which is what the server returns for a first edit
        // When the offer is checked
        // Then it does not stand
        expect(isMerchantRuleSuggestionLive(buildSuggestion(), buildConfirmation({category: false}))).toBe(false);
    });

    it('is not live when the only confirmed field was never edited', () => {
        // Given a verdict for a field the user did not edit on this expense, which is what a response for an expense
        // the call site declined to record leaves behind, and what a verdict outliving its session reads like
        const suggestion = buildSuggestion({editedFields: {[TRANSACTION_ID]: {description: true}}});

        // When the offer is checked
        // Then it does not stand, since there is no field the rule could be built from
        expect(isMerchantRuleSuggestionLive(suggestion, buildConfirmation())).toBe(false);
    });

    it('is not live once this expense is retired', () => {
        // Given an offer the user saw and left behind
        const suggestion = buildSuggestion({retiredTransactionIDs: {[TRANSACTION_ID]: true}});

        // When the offer is checked
        // Then it does not stand
        expect(isMerchantRuleSuggestionLive(suggestion, buildConfirmation())).toBe(false);
    });

    it('stays live when a different expense was retired', () => {
        // Given an offer left behind on an expense that is no longer the one offering
        const suggestion = buildSuggestion({retiredTransactionIDs: {[OTHER_TRANSACTION_ID]: true}});

        // When the offer is checked
        // Then it stands, since retiring one expense must not silence the next one
        expect(isMerchantRuleSuggestionLive(suggestion, buildConfirmation())).toBe(true);
    });

    it('stays live after being seen, since seeing it is not taking it', () => {
        // Given a callout that has rendered and recorded the report it rendered in
        // When the offer is checked
        // Then it stands, because the offer ends on leaving that report rather than on reaching it
        expect(isMerchantRuleSuggestionLive(buildSuggestion({seenInReportID: '999'}), buildConfirmation())).toBe(true);
    });

    it('is not live once this expense is dismissed', () => {
        // Given an offer the user dismissed with the X
        // When the offer is checked
        // Then it does not stand
        expect(isMerchantRuleSuggestionLive(buildSuggestion({dismissedTransactionIDs: [TRANSACTION_ID]}), buildConfirmation())).toBe(false);
    });

    it('stays live when a different expense was dismissed', () => {
        // Given a dismissal recorded against another expense
        // When the offer is checked
        // Then it stands, since a dismissal silences one expense rather than the feature
        expect(isMerchantRuleSuggestionLive(buildSuggestion({dismissedTransactionIDs: [OTHER_TRANSACTION_ID]}), buildConfirmation())).toBe(true);
    });
});

describe('getOfferableMerchantRuleSuggestionFields', () => {
    it('offers only the fields the server confirmed', () => {
        // Given an expense whose category repeats often enough to earn a rule, edited alongside a one-off description
        const suggestion = buildSuggestion({editedFields: {[TRANSACTION_ID]: {category: true, description: true}}});

        // When the fields the rule may carry are worked out
        // Then the one-off description is left out, so the rule does not impose it on every future expense
        expect(getOfferableMerchantRuleSuggestionFields(suggestion, buildConfirmation())).toEqual([CONST.MERCHANT_RULE_SUGGESTION_FIELDS.CATEGORY]);
    });

    it('offers nothing for an expense other than the one offering', () => {
        // Given edits recorded against an expense that is not the one the verdict named
        const suggestion = buildSuggestion({editedFields: {[OTHER_TRANSACTION_ID]: {category: true}}});

        // When the fields the rule may carry are worked out
        // Then nothing is offered, since another expense's edits must not seed this one's rule
        expect(getOfferableMerchantRuleSuggestionFields(suggestion, buildConfirmation())).toEqual([]);
    });

    it('offers nothing for a verdict with no edits left to answer', () => {
        // Given a stored verdict and no edits, which is how a session that outlived its RAM-only edits reads
        // When the fields the rule may carry are worked out
        // Then nothing is offered, so a verdict on its own can never raise a callout
        expect(getOfferableMerchantRuleSuggestionFields(undefined, buildConfirmation())).toEqual([]);
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

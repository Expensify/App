import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Expense field a merchant rule can govern, which is always one of the edit-request fields it is built from */
type MerchantRuleSuggestionField = ValueOf<typeof CONST.MERCHANT_RULE_SUGGESTION_FIELDS>;

/**
 * The expense edits that can be turned into a merchant rule, which drive the "Create a rule" callout.
 *
 * Kept RAM-only so the callout can appear again on the same expense in a future session.
 */
type MerchantRuleSuggestion = {
    /** The expense most recently edited, which is the one currently offering a rule */
    transactionID: string;

    /** The expense's own transaction thread, whose expense detail view can show the callout */
    reportID: string;

    /**
     * Every field edited so far, keyed by expense. The callout offers all of an expense's fields at once, because the
     * user is recorded from their first edit until they take the offer. Keying by expense is what lets `Onyx.merge`
     * accumulate them without reading the record back, and keeps one expense's edits out of another's rule.
     */
    editedFields: Record<string, Partial<Record<MerchantRuleSuggestionField, boolean>>>;

    /**
     * Expenses the user dismissed this session. Kept alongside the current offer rather than replaced by it, so a
     * dismissal survives a later edit on any expense, including that same one.
     */
    dismissedTransactionIDs?: string[];

    /**
     * Whether the offer has been seen and left behind. Unlike dismissing, it ends only the current offer, so
     * returning to the expense shows nothing while editing it again offers afresh.
     */
    isRetired?: boolean;
};

export default MerchantRuleSuggestion;
export type {MerchantRuleSuggestionField};

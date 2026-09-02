import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Expense field a merchant rule can govern */
type MerchantRuleSuggestionField = ValueOf<typeof CONST.MERCHANT_RULE_SUGGESTION_FIELDS>;

/**
 * The expense edits that can become a merchant rule, which drive the "Create a rule" callout.
 *
 * RAM-only, so the callout can appear again on the same expense next session.
 */
type MerchantRuleSuggestion = {
    /** The most recently edited expense, the one currently offering */
    transactionID: string;

    /** That expense's transaction thread, where the callout can show */
    reportID: string;

    /**
     * Fields edited so far, keyed by expense. Keying by expense lets `Onyx.merge` accumulate them without a read, and
     * keeps one expense's edits out of another's rule.
     */
    editedFields: Record<string, Partial<Record<MerchantRuleSuggestionField, boolean>>>;

    /**
     * Which levels of a multi-level tag were edited, keyed by expense then by level. Only these levels seed the rule,
     * so editing one level does not commit the rule to the levels the user left alone.
     */
    editedTagLevels?: Record<string, Record<string, boolean>>;

    /** Expenses dismissed this session. Kept alongside the current offer, so a dismissal survives later edits. */
    dismissedTransactionIDs?: string[];

    /** Whether the offer was seen and left. Unlike dismissing, editing the expense again offers afresh. */
    isRetired?: boolean;
};

export default MerchantRuleSuggestion;
export type {MerchantRuleSuggestionField};

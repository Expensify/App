import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Expense field a merchant rule can govern */
type MerchantRuleSuggestionField = ValueOf<typeof CONST.MERCHANT_RULE_SUGGESTION_FIELDS>;

/**
 * Session-scoped record of the merchant-rule-governed field the user most recently edited on an expense.
 *
 * Drives the "Create a rule" callout on the expense detail view. Kept RAM-only so the callout can surface again on
 * the same expense in a future session, per the product spec.
 */
type MerchantRuleSuggestion = {
    /** The expense that was edited */
    transactionID: string;

    /** Reports whose expense detail view can surface the callout: the transaction thread and its parent expense report */
    reportIDs: string[];

    /** The edited field, used to pre-seed the rule */
    field: MerchantRuleSuggestionField;

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

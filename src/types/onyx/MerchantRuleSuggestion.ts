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
     * Expenses whose callout the user dismissed this session. Kept alongside the current offer rather than replaced
     * with it, so dismissing one expense survives a later edit on any expense, including that same one.
     */
    dismissedTransactionIDs?: string[];

    /**
     * Whether the user took the offer and is now in the rule creation flow. The rule page reads this to return to the
     * expense after saving instead of to the workspace Rules page, which is where creating a rule from settings ends.
     */
    isCreatingRule?: boolean;
};

export default MerchantRuleSuggestion;
export type {MerchantRuleSuggestionField};

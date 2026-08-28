import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

/** Expense field a merchant rule can govern */
type MerchantRuleSuggestionField = ValueOf<typeof CONST.MERCHANT_RULE_SUGGESTION_FIELDS>;

/**
 * Session-scoped record of the merchant-rule-governed field the user most recently edited on an expense.
 *
 * Drives the "Create a rule" product training tooltip on the expense detail view. Kept RAM-only so the tooltip can
 * surface again on the same expense in a future session, per the product spec.
 */
type MerchantRuleSuggestion = {
    /** The expense that was edited */
    transactionID: string;

    /** Reports whose expense detail view can surface the tooltip: the transaction thread and its parent expense report */
    reportIDs: string[];

    /** The edited field, used to pre-seed the rule */
    field: MerchantRuleSuggestionField;

    /**
     * Whether this offer has already been shown and left behind. Distinct from dismissing the callout, which is
     * permanent and lives in the `nvp_dismissedMerchantRuleSuggestions` NVP: this only retires the current offer for
     * the session, so navigating away doesn't silence the expense for good.
     */
    isRetired?: boolean;

    /**
     * Whether the user took the offer and is now in the rule creation flow. The rule page reads this to return to the
     * expense after saving instead of to the workspace Rules page, which is where creating a rule from settings ends.
     */
    isCreatingRule?: boolean;
};

export default MerchantRuleSuggestion;
export type {MerchantRuleSuggestionField};

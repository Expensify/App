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

    /** Whether the user dismissed the tooltip for this expense */
    isDismissed?: boolean;
};

export default MerchantRuleSuggestion;
export type {MerchantRuleSuggestionField};

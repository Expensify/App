import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import Onyx from 'react-native-onyx';

/**
 * Records that a merchant-rule-governed field was edited on an expense, so the expense detail view can offer to
 * turn the edit into a merchant rule. The record is RAM-only, so it never outlives the session, and it is written
 * for every user: whether the callout actually renders is decided by `useMerchantRuleSuggestion`, which requires
 * workspace admin rights.
 */
function trackMerchantRuleSuggestion(transactionID: string | undefined, field: MerchantRuleSuggestionField, reportIDs: Array<string | undefined>) {
    if (!transactionID) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_MERCHANT_RULE_SUGGESTION}${transactionID}`, {
        transactionID,
        reportIDs: reportIDs.filter((reportID): reportID is string => !!reportID),
        field,
        // A fresh edit re-opens the callout even if an earlier edit on this expense was dismissed
        isDismissed: false,
    });
}

/** Dismisses the "Create a rule" callout for a single expense. */
function dismissMerchantRuleSuggestion(transactionID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.RAM_ONLY_MERCHANT_RULE_SUGGESTION}${transactionID}`, {isDismissed: true});
}

export {trackMerchantRuleSuggestion, dismissMerchantRuleSuggestion};

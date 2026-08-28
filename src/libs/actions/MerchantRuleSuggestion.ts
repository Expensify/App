import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import Onyx from 'react-native-onyx';

/**
 * Records that a merchant-rule-governed field was edited on an expense, so the expense detail view can offer to turn
 * the edit into a merchant rule. Only the most recent edit is kept: the product training context shows one tooltip at
 * a time, and the offer is always about the edit the user just made.
 *
 * The record is RAM-only, so it never outlives the session. This deliberately does not use `dismissProductTraining`
 * like the other product training elements: that NVP dismisses an element account-wide and permanently, while this
 * callout is scoped to one expense and is meant to surface again on a later edit.
 *
 * Written for every user; whether the tooltip renders is decided by `useMerchantRuleSuggestion` and the tooltip's
 * `shouldShow`, which require workspace admin rights.
 */
function trackMerchantRuleSuggestion(transactionID: string | undefined, field: MerchantRuleSuggestionField, reportIDs: Array<string | undefined>) {
    if (!transactionID) {
        return;
    }

    Onyx.set(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {
        transactionID,
        reportIDs: reportIDs.filter((reportID): reportID is string => !!reportID),
        field,
    });
}

/** Dismisses the "Create a rule" tooltip for the expense currently offering it. */
function dismissMerchantRuleSuggestion() {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {isDismissed: true});
}

/**
 * Records that the user took the offer, so the rule page knows to return to the expense once the rule is saved.
 *
 * The `backTo` URL param is deprecated (see the `How to remove backTo from URL` section in NAVIGATION.md), so the
 * origin travels through this record instead. It is session-scoped like the rest of the record, which means a page
 * refresh mid-flow falls back to the workspace Rules page — acceptable, since a refresh discards the offer anyway.
 */
function setIsCreatingMerchantRule(isCreatingRule: boolean) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {isCreatingRule});
}

export {trackMerchantRuleSuggestion, dismissMerchantRuleSuggestion, setIsCreatingMerchantRule};

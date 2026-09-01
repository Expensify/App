import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import Onyx from 'react-native-onyx';

// Dismissing appends to the expenses already dismissed, so it needs the current record. This is action-only state,
// never read during render, so `Onyx.connectWithoutView` is appropriate. Components use `useOnyx`.
let merchantRuleSuggestion: MerchantRuleSuggestion | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION,
    callback: (value) => {
        merchantRuleSuggestion = value;
    },
});

/**
 * Records an edit to a field merchant rules can govern, so the expense detail view can offer to turn it into a rule.
 * Only the most recent edit is kept, since one callout shows at a time.
 *
 * The record is RAM-only, so nothing outlives the session, dismissals included. That is deliberate: the callout is
 * dismissed one expense at a time and should appear again on that expense in a later session, which an account-wide
 * NVP could not express.
 *
 * Written for every user. `useMerchantRuleSuggestion` decides whether the callout renders, which needs admin rights.
 */
function trackMerchantRuleSuggestion(transactionID: string | undefined, field: MerchantRuleSuggestionField, reportIDs: Array<string | undefined>) {
    if (!transactionID) {
        return;
    }

    // Merged rather than set so this session's dismissals survive an edit to an already dismissed expense.
    // `isCreatingRule` and `isRetired` describe the offer being replaced, so they are cleared with it. A fresh edit
    // is a fresh offer, even on an expense the user walked away from.
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {
        transactionID,
        reportIDs: reportIDs.filter((reportID): reportID is string => !!reportID),
        field,
        isCreatingRule: null,
        isRetired: null,
    });
}

/**
 * Dismisses the callout for the expense currently offering it, for the rest of the session. Editing a different
 * expense still shows the callout there, and a new session offers this expense again.
 */
function dismissMerchantRuleSuggestion() {
    const transactionID = merchantRuleSuggestion?.transactionID;
    if (!transactionID) {
        return;
    }

    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {
        dismissedTransactionIDs: [...new Set([...(merchantRuleSuggestion?.dismissedTransactionIDs ?? []), transactionID])],
    });
}

/**
 * Ends the current offer once the user has seen it, without dismissing the expense. Coming back shows nothing, but
 * editing the expense again offers afresh. Only the close button silences an expense outright.
 */
function retireMerchantRuleSuggestion() {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {isRetired: true});
}

/**
 * Records that the user took the offer, so the rule page returns to the expense once the rule is saved.
 *
 * The `backTo` URL param is deprecated (see the `How to remove backTo from URL` section in NAVIGATION.md), so the
 * origin travels through this record instead. A page refresh mid-flow then falls back to the workspace Rules page,
 * which is fine because a refresh discards the offer anyway.
 */
function setIsCreatingMerchantRule(isCreatingRule: boolean) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {isCreatingRule});
}

export {trackMerchantRuleSuggestion, dismissMerchantRuleSuggestion, retireMerchantRuleSuggestion, setIsCreatingMerchantRule};

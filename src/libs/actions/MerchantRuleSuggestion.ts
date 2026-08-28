import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import Onyx from 'react-native-onyx';

// The product training registry calls `onHideTooltip` with no arguments, so the dismissal below has to resolve the
// expense being offered on its own. This is action-only state, never read during render, so `Onyx.connectWithoutView`
// is appropriate. Components read the same key with `useOnyx`.
let merchantRuleSuggestion: MerchantRuleSuggestion | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION,
    callback: (value) => {
        merchantRuleSuggestion = value;
    },
});

/**
 * Records that a merchant-rule-governed field was edited on an expense, so the expense detail view can offer to turn
 * the edit into a merchant rule. Only the most recent edit is kept: the product training context shows one tooltip at
 * a time, and the offer is always about the edit the user just made.
 *
 * The record is RAM-only, so it never outlives the session. This deliberately does not use `dismissProductTraining`
 * like the other product training elements: that NVP dismisses an element account-wide and permanently, while this
 * callout is dismissed per expense and is meant to surface again on another expense, or on the same one in a later
 * session.
 *
 * Written for every user; whether the tooltip renders is decided by `useMerchantRuleSuggestion` and the tooltip's
 * `shouldShow`, which require workspace admin rights.
 */
function trackMerchantRuleSuggestion(transactionID: string | undefined, field: MerchantRuleSuggestionField, reportIDs: Array<string | undefined>) {
    if (!transactionID) {
        return;
    }

    // Merged rather than set so the session's dismissals survive: an expense the user has already dismissed must stay
    // dismissed even after they edit it again. `isCreatingRule` belongs to the offer being replaced, so it is cleared.
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {
        transactionID,
        reportIDs: reportIDs.filter((reportID): reportID is string => !!reportID),
        field,
        isCreatingRule: null,
    });
}

/**
 * Dismisses the "Create a rule" callout for the expense currently offering it, for the rest of the session. Editing a
 * different expense still surfaces the callout there, and a new session offers this expense again.
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

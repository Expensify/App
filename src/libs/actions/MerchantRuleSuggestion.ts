import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import Onyx from 'react-native-onyx';

import {setNameValuePair} from './User';

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

// `SetNameValuePair` replaces the whole NVP rather than merging into it, so dismissing one expense has to send the
// expenses dismissed so far alongside it. Read here for the same reason as above.
let dismissedMerchantRuleSuggestions: Record<string, boolean> | undefined;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_DISMISSED_MERCHANT_RULE_SUGGESTIONS,
    callback: (value) => {
        dismissedMerchantRuleSuggestions = value;
    },
});

/**
 * Records that a merchant-rule-governed field was edited on an expense, so the expense detail view can offer to turn
 * the edit into a merchant rule. Only the most recent edit is kept: the product training context shows one tooltip at
 * a time, and the offer is always about the edit the user just made.
 *
 * The record is RAM-only, so which expense is currently offering never outlives the session. Dismissal is separate and
 * does persist, in `nvp_dismissedMerchantRuleSuggestions`. This deliberately does not use `dismissProductTraining` like
 * the other product training elements: that NVP dismisses an element account-wide, while this callout is dismissed one
 * expense at a time and keeps appearing on the others.
 *
 * Written for every user; whether the tooltip renders is decided by `useMerchantRuleSuggestion` and the tooltip's
 * `shouldShow`, which require workspace admin rights.
 */
function trackMerchantRuleSuggestion(transactionID: string | undefined, field: MerchantRuleSuggestionField, reportIDs: Array<string | undefined>) {
    if (!transactionID) {
        return;
    }

    // `isCreatingRule` and `isRetired` describe the offer being replaced, so they are cleared with it
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {
        transactionID,
        reportIDs: reportIDs.filter((reportID): reportID is string => !!reportID),
        field,
        isCreatingRule: null,
        isRetired: null,
    });
}

/**
 * Dismisses the "Create a rule" callout for the expense currently offering it, permanently and on every device. Other
 * expenses are unaffected: editing one of those still surfaces the callout there.
 */
function dismissMerchantRuleSuggestion() {
    const transactionID = merchantRuleSuggestion?.transactionID;
    if (!transactionID || dismissedMerchantRuleSuggestions?.[transactionID]) {
        return;
    }

    setNameValuePair(ONYXKEYS.NVP_DISMISSED_MERCHANT_RULE_SUGGESTIONS, {...dismissedMerchantRuleSuggestions, [transactionID]: true}, {...dismissedMerchantRuleSuggestions});
}

/**
 * Retires the current offer for the session once the user has seen it and moved on, without dismissing the expense.
 * The offer is about the edit they just made, so leaving the view ends it — but the expense is not silenced, and a
 * later edit on it offers again.
 */
function retireMerchantRuleSuggestion() {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {isRetired: true});
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

export {trackMerchantRuleSuggestion, dismissMerchantRuleSuggestion, retireMerchantRuleSuggestion, setIsCreatingMerchantRule};

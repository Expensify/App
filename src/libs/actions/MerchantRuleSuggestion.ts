import {arePolicyRulesEnabled} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion, Policy, PolicyCategories} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Records an edit to a field merchant rules can govern, so the expense detail view can offer to turn it into a rule.
 * Only the most recent edit is kept, since one callout shows at a time.
 *
 * The record is RAM-only, so nothing outlives the session, dismissals included. That is deliberate: the callout is
 * dismissed one expense at a time and should appear again on that expense in a later session, which an account-wide
 * NVP could not express.
 *
 * Written for every member of a workspace that could carry a merchant rule. `useMerchantRuleSuggestion` decides
 * whether the callout renders, which additionally needs write access to the Rules feature.
 */
function trackMerchantRuleSuggestion(
    transactionID: string | undefined,
    field: MerchantRuleSuggestionField,
    reportIDs: Array<string | undefined>,
    policy: OnyxEntry<Policy>,
    policyCategories: OnyxEntry<PolicyCategories>,
) {
    // An offer only makes sense if the workspace could hold a merchant rule when the edit was made. Recording one
    // regardless would leave an edit made with Rules switched off sitting here, ready to surface the moment somebody
    // switched Rules on. The beta is assumed enabled because it cannot be read outside a component, which only makes
    // this more permissive than the callout itself: `useMerchantRuleSuggestion` checks it for real before rendering.
    if (!transactionID || !arePolicyRulesEnabled(policy, policyCategories, true)) {
        return;
    }

    // Merged rather than set so this session's dismissals survive an edit to an already dismissed expense.
    // `isRetired` describes the offer being replaced, so it is cleared with it. A fresh edit is a fresh offer, even
    // on an expense the user walked away from.
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {
        transactionID,
        reportIDs: reportIDs.filter((reportID): reportID is string => !!reportID),
        field,
        isRetired: null,
    });
}

/**
 * Dismisses the callout for the expense currently offering it, for the rest of the session. Editing a different
 * expense still shows the callout there, and a new session offers this expense again.
 *
 * @param suggestion - the offer being dismissed, whose already dismissed expenses this one is appended to
 */
function dismissMerchantRuleSuggestion(suggestion: MerchantRuleSuggestion) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {
        dismissedTransactionIDs: [...new Set([...(suggestion.dismissedTransactionIDs ?? []), suggestion.transactionID])],
    });
}

/**
 * Ends the current offer once the user has seen it, without dismissing the expense. Coming back shows nothing, but
 * editing the expense again offers afresh. Only the close button silences an expense outright.
 */
function retireMerchantRuleSuggestion() {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {isRetired: true});
}

export {trackMerchantRuleSuggestion, dismissMerchantRuleSuggestion, retireMerchantRuleSuggestion};

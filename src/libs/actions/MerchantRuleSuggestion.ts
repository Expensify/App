import {arePolicyRulesEnabled} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion, Policy, PolicyCategories} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Records an edit that could become a merchant rule, so the expense can offer to create one.
 *
 * Edits accumulate per expense until the offer is taken, so one rule can carry category, tag and tax together. Only
 * the most recently edited expense offers. Recorded for anyone on the workspace; `useMerchantRuleSuggestion` decides
 * who actually sees the callout.
 */
function trackMerchantRuleSuggestion(
    transactionID: string | undefined,
    field: MerchantRuleSuggestionField,
    reportID: string | undefined,
    policy: OnyxEntry<Policy>,
    policyCategories: OnyxEntry<PolicyCategories>,
    editedTagLevels?: number[],
) {
    // Skip workspaces that could not hold a merchant rule, otherwise an edit made with Rules off would surface the
    // moment somebody turned Rules on.
    //
    // The Rules revamp beta is assumed on: it only narrows collect workspaces, it is being removed, and
    // `useMerchantRuleSuggestion` checks it for real before rendering.
    if (!transactionID || !reportID || !arePolicyRulesEnabled(policy, policyCategories, true)) {
        return;
    }

    // Merged rather than set, so dismissals survive and `editedFields` accumulates. `isRetired` belongs to the offer
    // being replaced, so it is cleared: a new edit is a new offer.
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {
        transactionID,
        reportID,
        editedFields: {[transactionID]: {[field]: true}},
        // Keyed by level so editing several levels of one tag accumulates, the same way fields do.
        ...(editedTagLevels?.length ? {editedTagLevels: {[transactionID]: Object.fromEntries(editedTagLevels.map((level) => [level, true]))}} : {}),
        isRetired: null,
    });
}

/**
 * Hides the callout for this expense for the rest of the session. Other expenses still offer, and a new session
 * offers this one again.
 */
function dismissMerchantRuleSuggestion(suggestion: MerchantRuleSuggestion) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {
        dismissedTransactionIDs: [...new Set([...(suggestion.dismissedTransactionIDs ?? []), suggestion.transactionID])],
    });
}

/** Forgets an expense's recorded fields so the next rule starts fresh. Called when the offer is taken. */
function clearMerchantRuleSuggestionFields(transactionID: string) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {editedFields: {[transactionID]: null}});
}

/** Ends the current offer without silencing the expense. Returning shows nothing; editing it again offers afresh. */
function retireMerchantRuleSuggestion() {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {isRetired: true});
}

export {trackMerchantRuleSuggestion, dismissMerchantRuleSuggestion, retireMerchantRuleSuggestion, clearMerchantRuleSuggestionFields};

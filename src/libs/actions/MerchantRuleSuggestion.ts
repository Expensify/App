import {arePolicyRulesEnabled, isControlPolicy} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion, Policy, PolicyCategories} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * The update that records an edit as one that could become a merchant rule, to sit in an update's `successData`. Kept
 * out of `optimisticData` so a rejected edit never has to be untracked: it is simply never tracked, and an earlier
 * edit's own tracking is left alone.
 *
 * Edits accumulate per expense until the offer is taken, so one rule can carry category, tag and tax together. Only
 * the most recently edited expense offers. Recorded for anyone on the workspace; `useMerchantRuleSuggestion` decides
 * who actually sees the callout.
 *
 * @param editedTagLevels - the levels being recorded alongside a tag edit
 */
function getMerchantRuleSuggestionTrackingUpdate(
    transactionID: string | undefined,
    field: MerchantRuleSuggestionField,
    reportID: string | undefined,
    policy: OnyxEntry<Policy>,
    policyCategories: OnyxEntry<PolicyCategories>,
    editedTagLevels?: number[],
): OnyxUpdate<typeof ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION> | undefined {
    // Skip workspaces that could not hold a merchant rule, otherwise an edit made with Rules off would surface the
    // moment somebody turned Rules on. Control only, matching the rule page the callout leads to, so an edit on a
    // Collect workspace does not pay for a write that could never be shown.
    if (!transactionID || !reportID || !isControlPolicy(policy) || !arePolicyRulesEnabled(policy, policyCategories)) {
        return undefined;
    }

    return {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION,
        // Merged rather than set, so dismissals survive and `editedFields` accumulates. `isRetired` belongs to the
        // offer being replaced, so it is cleared: a new edit is a new offer.
        value: {
            transactionID,
            reportID,
            editedFields: {[transactionID]: {[field]: true}},
            // Keyed by level so editing several levels of one tag accumulates, the same way fields do.
            ...(editedTagLevels?.length ? {editedTagLevels: {[transactionID]: Object.fromEntries(editedTagLevels.map((level) => [level, true]))}} : {}),
            seenInReportID: null,
            isRetired: null,
        },
    };
}

/**
 * Records the report the callout rendered in, which is what makes leaving that report retire the offer.
 *
 * @param reportID - the report hosting the expense detail view the callout appeared on
 */
function markMerchantRuleSuggestionSeen(reportID: string) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {seenInReportID: reportID});
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

/**
 * Forgets an expense's recorded fields, and the tag levels alongside them, so the next rule starts fresh. Called when
 * the offer is taken.
 */
function clearMerchantRuleSuggestionFields(transactionID: string) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {editedFields: {[transactionID]: null}, editedTagLevels: {[transactionID]: null}});
}

/** Ends the current offer without silencing the expense. Returning shows nothing; editing it again offers afresh. */
function retireMerchantRuleSuggestion() {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {isRetired: true});
}

export {getMerchantRuleSuggestionTrackingUpdate, dismissMerchantRuleSuggestion, markMerchantRuleSuggestionSeen, retireMerchantRuleSuggestion, clearMerchantRuleSuggestionFields};

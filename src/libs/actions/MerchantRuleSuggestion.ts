import {arePolicyRulesEnabled, isControlPolicy} from '@libs/PolicyUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion, Policy, PolicyCategories} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

/**
 * Records an edit that could become a merchant rule, so the expense can offer to create one.
 *
 * Written optimistically rather than from `successData`, so the offer appears at once, offline included: a queued
 * write has no response to key off until reconnect, and this app works offline. `getMerchantRuleSuggestionRollback`
 * is the failure-side counterpart.
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
    // moment somebody turned Rules on. Control only, matching the rule page the callout leads to, so an edit on a
    // Collect workspace does not pay for a write that could never be shown.
    if (!transactionID || !reportID || !isControlPolicy(policy) || !arePolicyRulesEnabled(policy, policyCategories)) {
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
        seenInReportID: null,
        isRetired: null,
    });
}

/**
 * The rollback for a tracked edit, to sit in an update's `failureData`. A rejected edit puts the old value back, and
 * an offer left behind would seed a rule from a value the expense no longer holds. Forgetting the field is enough:
 * once an expense has none left, it stops offering.
 *
 * Known limitation: if this field was already tracked from an earlier, successful edit, this still forgets it rather
 * than restoring that earlier state, since the flag carries no history to restore. Narrower than the offline case
 * above, and self-heals on the next edit, so it is left as is.
 *
 * @param editedTagLevels - the levels recorded alongside a tag edit, forgotten with it
 */
function getMerchantRuleSuggestionRollback(
    transactionID: string | undefined,
    field: MerchantRuleSuggestionField,
    editedTagLevels?: number[],
): OnyxUpdate<typeof ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION> | undefined {
    if (!transactionID) {
        return undefined;
    }

    return {
        onyxMethod: Onyx.METHOD.MERGE,
        key: ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION,
        value: {
            editedFields: {[transactionID]: {[field]: null}},
            ...(editedTagLevels?.length ? {editedTagLevels: {[transactionID]: Object.fromEntries(editedTagLevels.map((level) => [level, null]))}} : {}),
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

export {
    trackMerchantRuleSuggestion,
    getMerchantRuleSuggestionRollback,
    dismissMerchantRuleSuggestion,
    markMerchantRuleSuggestionSeen,
    retireMerchantRuleSuggestion,
    clearMerchantRuleSuggestionFields,
};

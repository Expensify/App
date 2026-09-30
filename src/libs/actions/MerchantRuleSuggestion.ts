import {arePolicyRulesEnabled, isControlPolicy} from '@libs/PolicyUtils';
import {isInvoiceReport} from '@libs/ReportUtils';
import {isDistanceRequest, isMerchantMissing, isPerDiemRequest} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion, Policy, PolicyCategories, Report, Transaction} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import type {OnyxEntry, OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type TrackMerchantRuleSuggestionParams = {
    /** The edited expense */
    transactionID: string | undefined;

    /** The field that was edited */
    field: MerchantRuleSuggestionField;

    /** The edited expense's transaction thread, where the callout can show */
    reportID: string | undefined;

    /** The workspace that would own the rule */
    policy: OnyxEntry<Policy>;

    /** That workspace's categories, needed to tell whether Rules are reachable at all */
    policyCategories: OnyxEntry<PolicyCategories>;

    /** The edited expense itself, which decides whether a merchant rule could ever match it */
    transaction: OnyxEntry<Transaction>;

    /** The report holding the expense, which is what says the expense is really on this workspace */
    parentReport: OnyxEntry<Report>;

    /** Which levels of a multi-level tag were edited */
    editedTagLevels?: number[];

    /**
     * Whether the edit was made straight from a list of expenses, rather than from the expense itself. Such an edit
     * records no offer, because the callout has nowhere to appear at the moment it is made.
     */
    isEditedFromExpenseList?: boolean;
};

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
function trackMerchantRuleSuggestion({
    transactionID,
    field,
    reportID,
    policy,
    policyCategories,
    transaction,
    parentReport,
    editedTagLevels,
    isEditedFromExpenseList = false,
}: TrackMerchantRuleSuggestionParams) {
    // Skip workspaces that could not hold a merchant rule, otherwise an edit made with Rules off would surface the
    // moment somebody turned Rules on. Control only, matching the rule page the callout leads to, so an edit on a
    // Collect workspace does not pay for a write that could never be shown.
    if (!transactionID || !reportID || !isControlPolicy(policy) || !arePolicyRulesEnabled(policy, policyCategories)) {
        return;
    }

    // An offer nothing can show is an offer nobody asked for. Editing from a list of expenses leaves no expense detail
    // on screen, so the record would sit there unseen and fire on whatever expense the user opened next.
    if (isEditedFromExpenseList) {
        return;
    }

    // The policy handed in is the one whose fields the editor offered, which is not always the one that owns the
    // expense. An expense held in a self DM borrows the workspace it would move to, so its edits must not be recorded
    // against a workspace it has not reached. Invoices are excluded outright, since merchant rules govern expenses.
    if (parentReport?.policyID !== policy?.id || isInvoiceReport(parentReport)) {
        return;
    }

    // A rule matches on merchant, so an expense that has none, or whose merchant is not the user's to set, can never
    // be matched by the rule this offer would create. Distance and per diem expenses derive their merchant.
    if (isMerchantMissing(transaction) || isDistanceRequest(transaction) || isPerDiemRequest(transaction)) {
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

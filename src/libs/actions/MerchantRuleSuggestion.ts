import {arePolicyRulesEnabled, isControlPolicy} from '@libs/PolicyUtils';
import {isInvoiceReport} from '@libs/ReportUtils';
import {isDistanceRequest, isMerchantMissing, isPerDiemRequest} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion, Policy, PolicyCategories, Report, Transaction} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import type {OnyxEntry} from 'react-native-onyx';

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
};

/**
 * Records an edit that could become a merchant rule, so the expense can offer to create one.
 *
 * Only the server can tell whether an edit repeats, since it alone sees the user's history, so the record starts
 * unconfirmed and `confirmMerchantRuleSuggestion` promotes it when the response says the same merchant has been given
 * the same value often enough. Recording here rather than waiting keeps the workspace and expense checks at the call
 * site, where the data already is, and lets an edit made offline still offer once its queued write is sent.
 *
 * Edits accumulate per expense until the offer is taken, so one rule can carry category, tag and tax together. Only
 * the most recently edited expense offers. Recorded for anyone on the workspace; `useMerchantRuleSuggestion` decides
 * who actually sees the callout.
 */
function trackMerchantRuleSuggestion({transactionID, field, reportID, policy, policyCategories, transaction, parentReport, editedTagLevels}: TrackMerchantRuleSuggestionParams) {
    // Skip workspaces that could not hold a merchant rule, otherwise an edit made with Rules off would surface the
    // moment somebody turned Rules on. Control only, matching the rule page the callout leads to, so an edit on a
    // Collect workspace does not pay for a write that could never be shown.
    if (!transactionID || !reportID || !isControlPolicy(policy) || !arePolicyRulesEnabled(policy, policyCategories)) {
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
        // A fresh edit of this field answers to its own response, so an earlier confirmation of it must not stand in
        // for one. Other fields keep theirs, which is what lets an offer earned on category survive editing the tag.
        confirmedFields: {[transactionID]: {[field]: null}},
        // Keyed by level so editing several levels of one tag accumulates, the same way fields do.
        ...(editedTagLevels?.length ? {editedTagLevels: {[transactionID]: Object.fromEntries(editedTagLevels.map((level) => [level, true]))}} : {}),
        seenInReportID: null,
        isRetired: null,
    });
}

/**
 * Promotes a recorded edit to one worth offering, once the server has said the same merchant keeps being given this
 * value. Called from the `ConfirmMerchantRuleSuggestion` middleware, since a queued write never returns its response
 * to the caller.
 *
 * Keyed by expense and field rather than set on the record as a whole, so a response that lands after the user has
 * moved on to another expense cannot confirm that one.
 */
function confirmMerchantRuleSuggestion(transactionID: string, field: MerchantRuleSuggestionField) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {confirmedFields: {[transactionID]: {[field]: true}}});
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
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {
        editedFields: {[transactionID]: null},
        confirmedFields: {[transactionID]: null},
        editedTagLevels: {[transactionID]: null},
    });
}

/** Ends the current offer without silencing the expense. Returning shows nothing; editing it again offers afresh. */
function retireMerchantRuleSuggestion() {
    Onyx.merge(ONYXKEYS.RAM_ONLY_MERCHANT_RULE_SUGGESTION, {isRetired: true});
}

export {
    trackMerchantRuleSuggestion,
    confirmMerchantRuleSuggestion,
    dismissMerchantRuleSuggestion,
    markMerchantRuleSuggestionSeen,
    retireMerchantRuleSuggestion,
    clearMerchantRuleSuggestionFields,
};

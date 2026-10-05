import {arePolicyRulesEnabled, isControlPolicy} from '@libs/PolicyUtils';
import {isInvoiceReport} from '@libs/ReportUtils';
import {isDistanceRequest, isMerchantMissing, isPerDiemRequest} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {MerchantRuleSuggestion, Policy, PolicyCategories, Report, Transaction} from '@src/types/onyx';
import type {MerchantRuleSuggestionField} from '@src/types/onyx/MerchantRuleSuggestion';

import type {OnyxEntry} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type TrackMerchantRuleSuggestionParams = {
    /** The server's answer on whether this edit repeats often enough to be worth a rule */
    suggestNewRuleCreation: boolean | undefined;

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
 * Driven by the server's `suggestNewRuleCreation`, which counts how often the same merchant has been given the same
 * value for the same field. An edit nobody repeats is not worth a rule, so one edit alone records nothing. The offer
 * is therefore lost while offline, since there is no response to read until the queued write reaches the server.
 *
 * Edits accumulate per expense until the offer is taken, so one rule can carry category, tag and tax together. Only
 * the most recently edited expense offers. Recorded for anyone on the workspace; `useMerchantRuleSuggestion` decides
 * who actually sees the callout.
 */
function trackMerchantRuleSuggestion({
    suggestNewRuleCreation,
    transactionID,
    field,
    reportID,
    policy,
    policyCategories,
    transaction,
    parentReport,
    editedTagLevels,
}: TrackMerchantRuleSuggestionParams) {
    if (!suggestNewRuleCreation) {
        return;
    }

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
        // Keyed by level so editing several levels of one tag accumulates, the same way fields do.
        ...(editedTagLevels?.length ? {editedTagLevels: {[transactionID]: Object.fromEntries(editedTagLevels.map((level) => [level, true]))}} : {}),
        seenInReportID: null,
        isRetired: null,
    });
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

export {trackMerchantRuleSuggestion, dismissMerchantRuleSuggestion, markMerchantRuleSuggestionSeen, retireMerchantRuleSuggestion, clearMerchantRuleSuggestionFields};

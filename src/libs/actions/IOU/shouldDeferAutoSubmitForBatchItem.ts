import {isInstantSubmitEnabled, isSubmitAndClose} from '@libs/PolicyUtils';
import {getChatReportFromMoneyRequestReport, isMoneyRequestReport, shouldCreateNewMoneyRequestReport} from '@libs/ReportUtils';
import {getReimbursable, isScanRequest} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {IOUAction} from '@src/CONST';
import type Policy from '@src/types/onyx/Policy';
import type Report from '@src/types/onyx/Report';
import type Rule from '@src/types/onyx/Rule';
import type Transaction from '@src/types/onyx/Transaction';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

type ShouldDeferAutoSubmitForBatchItemParams = {
    /** Position of the item about to be written. */
    index: number;
    transactions: Transaction[];
    /** Report the page targets: a chat report, an expense report, or nothing. The same for every item of the batch. */
    report: OnyxEntry<Report>;
    /** Report the previous item was written to, which is the one this item joins. Missing until the first item returns. */
    existingIOUReport?: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    rules: OnyxCollection<Rule>;
    isASAPSubmitBetaEnabled: boolean;
    action: IOUAction;
};

/**
 * Whether to tell the backend to hold off submitting the expense report that a single expense of a multi-expense batch is
 * written to.
 *
 * Every item after the first joins the report the first one created. On a policy with instant submit and submit-and-close
 * the backend closes that report as soon as an expense lands on it, so each later item is rejected with "New expenses
 * cannot be added to this report" and those expenses are lost. Deferring an item holds the report open for what follows
 * it, and the final item, sent without the flag, still gets the report's normal auto-submit and close.
 *
 * The opposite failure is deferring an item that turns out to be the only expense on its report: the server waits for
 * expenses that never arrive and the report is left unsubmitted. So each item is asked one question — does the item after
 * me land on the same report I am writing to? — against the same test the money request builder uses to choose the report,
 * since that is what decides it. `bulkDuplicateExpenses` guards the same failure for its own batches.
 */
function shouldDeferAutoSubmitForBatchItem({
    index,
    transactions,
    report,
    existingIOUReport,
    policy,
    rules,
    isASAPSubmitBetaEnabled,
    action,
}: ShouldDeferAutoSubmitForBatchItemParams): boolean {
    // The last item of the batch is the one that lets its report submit and close.
    if (index >= transactions.length - 1) {
        return false;
    }

    // Outside the ASAP submit beta, an optimistic report on this policy is built APPROVED/CLOSED, so the builder already
    // gives every item its own report and no report is shared.
    if (!isASAPSubmitBetaEnabled || !isInstantSubmitEnabled(policy) || !isSubmitAndClose(policy)) {
        return false;
    }

    const transaction = transactions.at(index);
    const nextTransaction = transactions.at(index + 1);
    const isPinnedReport = isMoneyRequestReport(report);
    const chatReport = getChatReportFromMoneyRequestReport(report);

    // The report this item writes to: the one the previous item returned, the one the page pinned, or one this item
    // creates. Only the first two can be inspected, so a report that is not yet built is judged by what the builder is
    // known to do with it.
    const currentReport = existingIOUReport ?? (isPinnedReport ? report : undefined);

    if (!currentReport) {
        return joinsReportNotBuiltYet(nextTransaction, isPinnedReport, action);
    }

    // This item goes to a report of its own when the one it would join cannot take it, which is the builder's own answer.
    const joinsCurrentReport = !shouldCreateNewMoneyRequestReport(currentReport, chatReport, isScanRequest(transaction), isASAPSubmitBetaEnabled, rules, action, isPinnedReport);
    if (!joinsCurrentReport) {
        return joinsReportNotBuiltYet(nextTransaction, isPinnedReport, action);
    }

    return !shouldCreateNewMoneyRequestReport(currentReport, chatReport, isScanRequest(nextTransaction), isASAPSubmitBetaEnabled, rules, action, isPinnedReport);
}

/**
 * Whether the next item joins the report this item is about to create.
 *
 * On this policy in the ASAP submit beta the builder builds that report open, and a submission loop hands the report it
 * created to every item after the first, so the only thing that sends an item somewhere else is a scan, which the builder
 * puts on a report of its own unless the expense is being submitted out of a self-DM or a report was named up front.
 *
 * Reimbursability is deliberately not consulted. `canAddTransaction` turns an item away from a report that holds nothing
 * but non-reimbursable spend, but it reads the transactions of a report from an Onyx cache that an update callback fills
 * asynchronously, so partway through a submission it sees a report the loop just built as empty and lets the item in. A
 * batch of card expenses therefore lands on one report here, not one each, and deferring is what saves it.
 * `bulkDuplicateExpenses` can treat those as real splits only because it resets its own report state between items; this
 * loop does not.
 */
function joinsReportNotBuiltYet(nextTransaction: OnyxEntry<Transaction>, isPinnedReport: boolean, action: IOUAction): boolean {
    const splitsPerItem = !isPinnedReport && action !== CONST.IOU.ACTION.SUBMIT;
    return !(splitsPerItem && isScanRequest(nextTransaction));
}

export default shouldDeferAutoSubmitForBatchItem;

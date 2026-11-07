/** Builds approval warnings from local data without the submitter's rejection or card-match warnings. */
import {getTransactionViolations, isOnHold} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {getReportSubmitViolationSummary} from './getReportSubmitViolationSummary';

function getReportApproveViolationSummary(
    transactions: Array<OnyxEntry<Transaction>>,
    violationsCollection: OnyxCollection<TransactionViolations>,
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    currentUserEmail: string,
    currentUserAccountID: number,
    full = true,
) {
    const approvalTransactions: Transaction[] = [];
    const approvalViolations: OnyxCollection<TransactionViolations> = {};
    for (const transaction of transactions) {
        if (!transaction?.transactionID || (!full && isOnHold(transaction))) {
            continue;
        }
        approvalTransactions.push(transaction);
        // Raw overrides must respect the approver's dismissals before warnings are classified or deduplicated.
        approvalViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`] = getTransactionViolations(
            transaction,
            violationsCollection,
            currentUserEmail,
            currentUserAccountID,
            report,
            undefined,
            policy,
        );
    }

    const summary = getReportSubmitViolationSummary(approvalTransactions, approvalViolations, report, policy, currentUserEmail, currentUserAccountID, full);

    // These warnings require acknowledgement by the submitter, not the approver.
    return {...summary, hasRejectedExpense: false, hasReportBeenRejected: false, hasPendingCardMatch: false};
}

export default getReportApproveViolationSummary;

/** Builds approval warnings from local data without the submitter's rejection or card-match warnings. */
import {isOnHold} from '@libs/TransactionUtils';

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
    const summary = getReportSubmitViolationSummary(
        transactions.filter((transaction) => transaction && (full || !isOnHold(transaction))),
        violationsCollection,
        report,
        policy,
        currentUserEmail,
        currentUserAccountID,
        full,
    );

    // These warnings require acknowledgement by the submitter, not the approver.
    return {...summary, hasRejectedExpense: false, hasReportBeenRejected: false, hasPendingCardMatch: false};
}

export default getReportApproveViolationSummary;

/** Resolves report-scoped approval warnings from Search snapshots and fresher live entries. */
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

function getReportApprovalWarningData(
    reportID: string | undefined,
    snapshotTransactions: Transaction[] | undefined,
    liveTransactions: Transaction[],
    snapshotViolations: OnyxCollection<TransactionViolations>,
    liveViolations: OnyxCollection<TransactionViolations>,
) {
    const transactionsByID = new Map<string, Transaction>();
    for (const transaction of [...(snapshotTransactions ?? []), ...liveTransactions]) {
        if (transaction.reportID !== reportID) {
            continue;
        }
        transactionsByID.set(transaction.transactionID, transaction);
    }

    const violations: OnyxCollection<TransactionViolations> = {};
    for (const transactionID of transactionsByID.keys()) {
        const key = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}` as const;
        // An empty live array clears stale snapshot warnings; selector-created undefined entries do not.
        violations[key] = liveViolations?.[key] !== undefined ? liveViolations[key] : snapshotViolations?.[key];
    }
    return {transactions: [...transactionsByID.values()], violations};
}

export default getReportApprovalWarningData;

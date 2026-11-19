/** Keeps approval-data computations within their own hook so parent memo scopes do not cross subscriptions. */
import getReportApprovalWarningData from '@libs/Violations/getReportApprovalWarningData';

import type {Transaction, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import useLiveViolationsForSnapshotTransactions from './useLiveViolationsForSnapshotTransactions';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

function useReportApprovalWarningData(reportID: string | undefined, snapshotTransactions?: Transaction[], snapshotViolations?: OnyxCollection<TransactionViolations>) {
    const {transactions: liveReportTransactions, violations: filteredLiveViolations} = useTransactionsAndViolationsForReport(reportID);
    const liveTransactions = Object.values(liveReportTransactions);
    const liveViolations = useLiveViolationsForSnapshotTransactions(snapshotTransactions, liveTransactions);
    const warningData = getReportApprovalWarningData(reportID, snapshotTransactions, liveTransactions, snapshotViolations, liveViolations);
    return {...warningData, liveTransactions, liveViolations, filteredLiveViolations};
}

export default useReportApprovalWarningData;

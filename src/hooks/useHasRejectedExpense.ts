import {hasReportBeenRejectedToSubmitter} from '@libs/ReportUtils';
import {hasTransactionBeenRejected} from '@libs/TransactionUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, TransactionViolations} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

// We need direct access to useOnyx from react-native-onyx to avoid reading search snapshots instead of live data
// eslint-disable-next-line no-restricted-imports
import {useOnyx} from 'react-native-onyx';

const hasRejectedTransactionSelector = (allTransactionViolations: OnyxCollection<TransactionViolations>): boolean =>
    Object.values(allTransactionViolations ?? {}).some((transactionViolations) => hasTransactionBeenRejected(transactionViolations));

// A whole-report rejection doesn't add a violation to the report's transactions, so it has to be checked on the report.
const hasRejectedReportSelector = (allReports: OnyxCollection<Report>): boolean => Object.values(allReports ?? {}).some((report) => hasReportBeenRejectedToSubmitter(report));

/**
 * Whether the user currently has at least one rejected expense, either rejected on its own or as part of a rejected report.
 * The selectors return a boolean so consumers only re-render when the answer changes.
 */
function useHasRejectedExpense(): boolean {
    const [hasRejectedTransaction = false] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {selector: hasRejectedTransactionSelector});
    const [hasRejectedReport = false] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: hasRejectedReportSelector});

    return hasRejectedTransaction || hasRejectedReport;
}

export default useHasRejectedExpense;

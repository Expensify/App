import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';
import useTransactionThreadReportID from './useTransactionThreadReportID';

/**
 * Derives the single-transaction thread report ID and report for a money request report.
 *
 * This pattern is repeated across multiple hooks and components that need to know
 * whether a report has a single transaction thread (and access its data).
 */
function useTransactionThreadReport(reportID: string | undefined) {
    const {transactionThreadReportID, reportActions} = useTransactionThreadReportID(reportID);

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(transactionThreadReportID)}`);

    return {
        transactionThreadReportID,
        transactionThreadReport,
        reportActions,
    };
}

export default useTransactionThreadReport;

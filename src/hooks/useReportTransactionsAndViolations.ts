import {useAllReportsTransactionsAndViolations} from '@components/OnyxProvider';
import CONST from '@src/CONST';
import type {ReportTransactionsAndViolations} from '@src/types/onyx/DerivedValues';

/**
 * Returns transactions and violations for a specific report.
 * It connects to single Onyx instance held in OnyxProvider, so it can be safely used in list items without affecting performance.
 *
 * @param reportID - The ID of the report to get transactions and violations for.
 * @returns Transactions and violations for the report.
 */
function useReportTransactionsAndViolations(reportID: string): ReportTransactionsAndViolations {
    const allReportTransactionsAndViolations = useAllReportsTransactionsAndViolations();

    return allReportTransactionsAndViolations?.[reportID ?? CONST.DEFAULT_NUMBER_ID] ?? {transactions: [], violations: {}};
}

export default useReportTransactionsAndViolations;

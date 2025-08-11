import {useAllReportsTransactionsAndViolations} from '@components/OnyxListItemProvider';
import CONST from '@src/CONST';

const DEFAULT_RETURN_VALUE = {transactions: {}, violations: {}};

function useTransactionsAndViolationsForReport(reportID?: string) {
    const allReportsTransactionsAndViolations = useAllReportsTransactionsAndViolations();

    if (!reportID) {
        return DEFAULT_RETURN_VALUE;
    }

    return allReportsTransactionsAndViolations?.[reportID ?? CONST.DEFAULT_NUMBER_ID] ?? DEFAULT_RETURN_VALUE;
}

export default useTransactionsAndViolationsForReport;

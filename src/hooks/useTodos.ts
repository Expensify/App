import {useMemo} from 'react';
import CONST from '@src/CONST';
import {getActions} from '@src/libs/SearchUIUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {emailSelector} from '@src/selectors/Session';
import type {Report, SearchResults} from '@src/types/onyx';
import useOnyx from './useOnyx';
import { useSearchContext } from '@components/Search/SearchContext';

export default function useTodos() {
    const [currentUserEmail] = useOnyx(ONYXKEYS.SESSION, {selector: emailSelector, canBeMissing: false});
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {canBeMissing: false});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: false});
    const [allReportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: false});
    const [allTransactions] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {canBeMissing: false});
    const [allTransactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS, {canBeMissing: false});
    const {currentSearchKey = CONST.SEARCH.SEARCH_KEYS.EXPENSES} = useSearchContext();

    const data = useMemo(
        () => ({...allReports, ...allPolicies, ...allReportNameValuePairs, ...allTransactions}) as SearchResults['data'],
        [allReports, allPolicies, allReportNameValuePairs, allTransactions],
    );

    return useMemo(() => {
        const reportsToSubmit: Report[] = [];
        const reportsToApprove: Report[] = [];
        const reportsToPay: Report[] = [];
        const reportsToExport: Report[] = [];

        if (!allReports) {
            return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
        }

        for (const report of Object.values(allReports)) {
            if (!report?.reportID || report.type !== CONST.REPORT.TYPE.EXPENSE) {
                continue;
            }

            const actions = getActions(data, allTransactionViolations, `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, currentSearchKey, currentUserEmail ?? '');

            if (actions.includes(CONST.SEARCH.ACTION_TYPES.SUBMIT)) {
                reportsToSubmit.push(report);
            }
            if (actions.includes(CONST.SEARCH.ACTION_TYPES.APPROVE)) {
                reportsToApprove.push(report);
            }
            if (actions.includes(CONST.SEARCH.ACTION_TYPES.PAY)) {
                reportsToPay.push(report);
            }
            if (actions.includes(CONST.SEARCH.ACTION_TYPES.EXPORT_TO_ACCOUNTING)) {
                reportsToExport.push(report);
            }
        }

        return {reportsToSubmit, reportsToApprove, reportsToPay, reportsToExport};
    }, [data, allReports, allTransactionViolations, currentUserEmail]);
}

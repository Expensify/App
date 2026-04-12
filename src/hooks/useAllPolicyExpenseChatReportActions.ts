import {useCallback, useMemo} from 'react';
import type {OnyxCollection} from 'react-native-onyx';
import {isPolicyExpenseChat, isThread} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportActions} from '@src/types/onyx';
import mapOnyxCollectionItems from '@src/utils/mapOnyxCollectionItems';
import useOnyx from './useOnyx';

const policyExpenseChatReportsSelector = (reports: OnyxCollection<Report>) => {
    return mapOnyxCollectionItems(reports, (report) => {
        if (!report || !isPolicyExpenseChat(report) || isThread(report)) {
            return undefined;
        }
        return report;
    });
};

/**
 * Returns all reports that satisfy isPolicyExpenseChat && !isThread (via selector),
 * along with reportActions filtered to only those matching reports.
 */
function useAllPolicyExpenseChatReportActions() {
    const [policyExpenseChatReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT, {selector: policyExpenseChatReportsSelector});

    const policyExpenseChatReportIDs = useMemo(() => {
        const ids = new Set<string>();
        for (const report of Object.values(policyExpenseChatReports ?? {})) {
            if (report?.reportID) {
                ids.add(report.reportID);
            }
        }
        return ids;
    }, [policyExpenseChatReports]);

    const reportActionsSelector = useCallback(
        (reportActions: OnyxCollection<ReportActions>) => {
            const result: NonNullable<OnyxCollection<ReportActions>> = {};
            for (const [key, actions] of Object.entries(reportActions ?? {})) {
                const reportID = key.replace(ONYXKEYS.COLLECTION.REPORT_ACTIONS, '');
                if (policyExpenseChatReportIDs.has(reportID)) {
                    result[key] = actions;
                }
            }
            return result;
        },
        [policyExpenseChatReportIDs],
    );

    const [filteredReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS, {selector: reportActionsSelector}, [reportActionsSelector]);

    return {policyExpenseChatReports, filteredReportActions};
}

export default useAllPolicyExpenseChatReportActions;

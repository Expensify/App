import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import PaginationUtils from '@libs/PaginationUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Get the longest continuous chunk of reportActions including the linked reportAction. If not linking to a specific action, returns the continuous chunk of newest reportActions.
 */
function usePaginatedReportActions(reportID?: string, reportActionID?: string) {
    // Use `||` instead of `??` to handle empty string.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const reportIDWithDefault = reportID || '-1';

    const [sortedAllReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportIDWithDefault}`, {
        canEvict: false,
        selector: (allReportActions) => ReportActionsUtils.getSortedReportActionsForDisplay(allReportActions, reportID, true),
    });
    const [reportActionPages] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportIDWithDefault}`);

    const {
        data: reportActions,
        hasNextPage,
        hasPreviousPage,
    } = useMemo(() => {
        if (!sortedAllReportActions?.length) {
            return {data: [], hasNextPage: false, hasPreviousPage: false};
        }
        return PaginationUtils.getContinuousChain(sortedAllReportActions, reportActionPages ?? [], (reportAction) => reportAction.reportActionID, reportActionID);
    }, [reportActionID, reportActionPages, sortedAllReportActions]);

    const linkedAction = useMemo(
        () => sortedAllReportActions?.find((reportAction) => String(reportAction.reportActionID) === String(reportActionID)),
        [reportActionID, sortedAllReportActions],
    );

    return {
        reportActions,
        linkedAction,
        sortedAllReportActions,
        hasOlderActions: hasNextPage,
        hasNewerActions: hasPreviousPage,
    };
}

export default usePaginatedReportActions;

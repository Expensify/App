import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import PaginationUtils from '@libs/PaginationUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Get the longest continuous chunk of reportActions including the linked reportAction. If not linking to a specific action, returns the continuous chunk of newest reportActions.
 *
 * @param reportID
 * @param [reportActionID]
 */
function usePaginatedReportActions(reportID?: string, reportActionID?: string) {
    // Use `||` instead of `??` to handle empty string.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const reportIDWithDefault = reportID || '-1';
    const [sortedAllReportActions = []] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportIDWithDefault}`, {
        canEvict: false,
        selector: (allReportActions) => ReportActionsUtils.getSortedReportActionsForDisplay(allReportActions, true),
    });
    const [pages = []] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${reportIDWithDefault}`);

    const reportActions = useMemo(() => {
        if (!sortedAllReportActions.length) {
            return [];
        }
        return PaginationUtils.getContinuousChain(sortedAllReportActions, pages ?? [], (item) => item.reportActionID, reportActionID);
    }, [reportActionID, sortedAllReportActions, pages]);

    const linkedAction = useMemo(() => sortedAllReportActions.find((obj) => String(obj.reportActionID) === String(reportActionID)), [sortedAllReportActions, reportActionID]);

    return {
        reportActions,
        linkedAction,
    };
}

export default usePaginatedReportActions;

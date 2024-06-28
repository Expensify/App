import {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Get the longest continuous chunk of reportActions including the linked reportAction. If not linking to a specific action, returns the continuous chunk of newest reportActions.
 */
function usePaginatedReportActions(reportID?: string, reportActionID?: string) {
    // Use `||` instead of `??` to handle empty string.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const reportIDWithDefault = reportID || '-1';
    const [sortedAllReportActions = []] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportIDWithDefault}`, {
        canEvict: false,
        selector: (allReportActions) => ReportActionsUtils.getSortedReportActionsForDisplay(allReportActions, true),
    });

    const reportActions = useMemo(() => {
        if (!sortedAllReportActions.length) {
            return [];
        }
        return ReportActionsUtils.getContinuousReportActionChain(sortedAllReportActions, reportActionID);
    }, [reportActionID, sortedAllReportActions]);

    const linkedAction = useMemo(() => sortedAllReportActions.find((obj) => String(obj.reportActionID) === String(reportActionID)), [reportActionID, sortedAllReportActions]);

    return {
        reportActions,
        linkedAction,
    };
}

export default usePaginatedReportActions;

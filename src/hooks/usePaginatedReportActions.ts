import {useCallback, useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import PaginationUtils from '@libs/PaginationUtils';
import {getSortedReportActionsForDisplay} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import useOnyx from './useOnyx';
import useReportIsArchived from './useReportIsArchived';

/**
 * Get the longest continuous chunk of reportActions including the linked reportAction. If not linking to a specific action, returns the continuous chunk of newest reportActions.
 */
function usePaginatedReportActions(reportID: string | undefined, reportActionID?: string) {
    const nonEmptyStringReportID = getNonEmptyStringOnyxID(reportID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nonEmptyStringReportID}`, {canBeMissing: true});
    const isReportArchived = useReportIsArchived(report?.reportID);
    const hasWriteAccess = canUserPerformWriteAction(report, isReportArchived);

    const getSortedAllReportActionsSelector = useCallback(
        (allReportActions: OnyxEntry<ReportActions>): ReportAction[] => {
            return getSortedReportActionsForDisplay(allReportActions, hasWriteAccess, true);
        },
        [hasWriteAccess],
    );

    const [sortedAllReportActions] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${nonEmptyStringReportID}`,
        {
            canEvict: false,
            selector: getSortedAllReportActionsSelector,
            canBeMissing: true,
        },
        [getSortedAllReportActionsSelector],
    );
    const [reportActionPages] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${nonEmptyStringReportID}`, {canBeMissing: true});

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
        () => (reportActionID ? sortedAllReportActions?.find((reportAction) => String(reportAction.reportActionID) === String(reportActionID)) : undefined),
        [reportActionID, sortedAllReportActions],
    );

    return {
        reportActions,
        linkedAction,
        sortedAllReportActions,
        hasOlderActions: hasNextPage,
        hasNewerActions: hasPreviousPage,
        report,
    };
}

export default usePaginatedReportActions;

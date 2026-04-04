import {useCallback, useMemo, useRef} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import PaginationUtils from '@libs/PaginationUtils';
import {getSortedReportActionsForDisplay} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import useOnyx from './useOnyx';
import useReportIsArchived from './useReportIsArchived';

type UsePaginatedReportActionsOptions = {
    /** Whether to link to the oldest unread report action, if no other report action id is provided. */
    shouldLinkToOldestUnreadReportAction?: boolean;

    /** When true, pagination anchors to the newest window only (ignores route and unread-derived anchors). */
    treatAsNoPaginationAnchor?: boolean;
};

/**
 * Get the longest continuous chunk of reportActions including the linked reportAction. If not linking to a specific action, returns the continuous chunk of newest reportActions.
 */
function usePaginatedReportActions(reportID: string | undefined, reportActionID?: string, options?: UsePaginatedReportActionsOptions) {
    const {shouldLinkToOldestUnreadReportAction = false, treatAsNoPaginationAnchor = false} = options ?? {};

    const nonEmptyStringReportID = getNonEmptyStringOnyxID(reportID);
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${nonEmptyStringReportID}`);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const hasWriteAccess = canUserPerformWriteAction(report, isReportArchived);

    const getSortedAllReportActionsSelector = useCallback(
        (allReportActions: OnyxEntry<ReportActions>): ReportAction[] => {
            return getSortedReportActionsForDisplay(allReportActions, hasWriteAccess, true, undefined, nonEmptyStringReportID);
        },
        [hasWriteAccess, nonEmptyStringReportID],
    );

    const [sortedAllReportActions] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${nonEmptyStringReportID}`,
        {
            canEvict: false,
            selector: getSortedAllReportActionsSelector,
        },
        [getSortedAllReportActionsSelector],
    );
    const [reportActionPages] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${nonEmptyStringReportID}`);

    const initialReportLastReadTime = useRef(report?.lastReadTime);

    const id = useMemo(() => {
        /* eslint-disable react-hooks/refs -- initialReportLastReadTime snapshots lastRead at first render for stable unread deep-link anchor */
        if (treatAsNoPaginationAnchor) {
            return undefined;
        }

        if (reportActionID) {
            return reportActionID;
        }

        if (!shouldLinkToOldestUnreadReportAction) {
            return undefined;
        }

        const initialLastReadTime = initialReportLastReadTime.current;
        if (!initialLastReadTime || !sortedAllReportActions?.length) {
            return undefined;
        }

        for (let i = sortedAllReportActions.length - 1; i >= 0; i -= 1) {
            const reportAction = sortedAllReportActions.at(i);
            if (reportAction && reportAction.created > initialLastReadTime) {
                return reportAction.reportActionID;
            }
        }

        return undefined;
        /* eslint-enable react-hooks/refs */
    }, [treatAsNoPaginationAnchor, reportActionID, shouldLinkToOldestUnreadReportAction, sortedAllReportActions]);

    const {
        data: reportActions,
        hasNextPage,
        hasPreviousPage,
        resourceItem,
    } = useMemo(() => {
        if (!sortedAllReportActions?.length) {
            return {data: [], hasNextPage: false, hasPreviousPage: false};
        }

        return PaginationUtils.getContinuousChain(sortedAllReportActions, reportActionPages ?? [], (reportAction) => reportAction.reportActionID, id);
    }, [id, reportActionPages, sortedAllReportActions]);

    const linkedAction = useMemo(() => (reportActionID ? resourceItem?.item : undefined), [resourceItem?.item, reportActionID]);

    const oldestUnreadReportAction = useMemo(() => {
        if (shouldLinkToOldestUnreadReportAction && resourceItem && !reportActionID) {
            return resourceItem.item;
        }
        return undefined;
    }, [resourceItem, shouldLinkToOldestUnreadReportAction, reportActionID]);

    return {
        reportActions,
        linkedAction,
        oldestUnreadReportAction,
        sortedAllReportActions,
        hasOlderActions: hasNextPage,
        hasNewerActions: hasPreviousPage,
        report,
    };
}

export default usePaginatedReportActions;

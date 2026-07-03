import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getContinuousChain} from '@libs/PaginationUtils';
import {getSortedReportActionsForDisplay} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction} from '@libs/ReportUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {useCallback, useMemo, useRef} from 'react';

import useInitial from './useInitial';
import useOnyx from './useOnyx';
import useReportIsArchived from './useReportIsArchived';

type UsePaginatedReportActionsOptions = {
    /** Whether to link to the oldest unread report action, if no other report action id is provided. */
    shouldLinkToOldestUnreadReportAction?: boolean;

    /** When true, pagination anchors to the newest window only (ignores route and unread-derived anchors). */
    treatAsNoPaginationAnchor?: boolean;

    /**
     * When true, the unread anchor snapshots the first *defined* lastReadTime (via `useInitial`) instead of the
     * first-render ref value. This is needed for the Concierge cold-open flow (https://github.com/Expensify/App/issues/93196),
     * where the report can be undefined on first render and a plain ref would latch `undefined`, preventing the unread
     * anchor from ever resolving. Scoped to Concierge so regular inbox chat pagination keeps the first-render ref behavior.
     */
    shouldSnapshotInitialLastReadTime?: boolean;
};

/**
 * Get the longest continuous chunk of reportActions including the linked reportAction. If not linking to a specific action, returns the continuous chunk of newest reportActions.
 */
function usePaginatedReportActions(reportID: string | undefined, reportActionID?: string, options?: UsePaginatedReportActionsOptions) {
    const {shouldLinkToOldestUnreadReportAction = false, treatAsNoPaginationAnchor = false, shouldSnapshotInitialLastReadTime = false} = options ?? {};

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
            selector: getSortedAllReportActionsSelector,
        },
        [getSortedAllReportActionsSelector],
    );
    const [reportActionPages] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${nonEmptyStringReportID}`);

    // Default (regular inbox chats): snapshot lastReadTime at first render via a ref — production behavior.
    const firstRenderLastReadTime = useRef(report?.lastReadTime);
    // Concierge only: snapshot the first non-undefined lastReadTime. On a cold open the report can be
    // undefined on first render; useInitial waits for the first defined (pre-read) value instead of
    // latching undefined like a first-render ref, so the unread anchor can still resolve after the report loads.
    const firstDefinedLastReadTime = useInitial(report?.lastReadTime);

    const id = useMemo(() => {
        /* eslint-disable react-hooks/refs -- firstRenderLastReadTime snapshots lastReadTime at first render for a stable unread anchor */
        if (treatAsNoPaginationAnchor) {
            return undefined;
        }

        if (reportActionID) {
            return reportActionID;
        }

        if (!shouldLinkToOldestUnreadReportAction) {
            return undefined;
        }

        const initialLastReadTime = shouldSnapshotInitialLastReadTime ? firstDefinedLastReadTime : firstRenderLastReadTime.current;
        if (!initialLastReadTime || !sortedAllReportActions?.length) {
            return undefined;
        }

        return sortedAllReportActions.findLast((reportAction) => reportAction.created > initialLastReadTime)?.reportActionID;
        /* eslint-enable react-hooks/refs */
    }, [treatAsNoPaginationAnchor, reportActionID, shouldLinkToOldestUnreadReportAction, sortedAllReportActions, shouldSnapshotInitialLastReadTime, firstDefinedLastReadTime]);

    const {
        data: reportActions,
        hasNextPage,
        hasPreviousPage,
        resourceItem,
    } = useMemo(() => {
        if (!sortedAllReportActions?.length) {
            return {data: [], hasNextPage: false, hasPreviousPage: false};
        }

        return getContinuousChain(sortedAllReportActions, reportActionPages ?? [], (reportAction) => reportAction.reportActionID, id);
    }, [id, reportActionPages, sortedAllReportActions]);

    // When `treatAsNoPaginationAnchor` is set, we intentionally ignore `reportActionID` for pagination
    // (same as `id` above), so we must not surface a "linked" action from that id either.
    const linkedAction = useMemo(() => {
        if (treatAsNoPaginationAnchor) {
            return undefined;
        }
        if (!reportActionID) {
            return undefined;
        }
        return resourceItem?.item;
    }, [resourceItem?.item, reportActionID, treatAsNoPaginationAnchor]);

    const oldestUnreadReportAction = useMemo(() => {
        if (treatAsNoPaginationAnchor) {
            return undefined;
        }
        if (shouldLinkToOldestUnreadReportAction && resourceItem && !reportActionID) {
            return resourceItem.item;
        }
        return undefined;
    }, [resourceItem, shouldLinkToOldestUnreadReportAction, reportActionID, treatAsNoPaginationAnchor]);

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

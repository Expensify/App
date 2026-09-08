import useOnyx from '@hooks/useOnyx';

import {isActionVisibleOnMoneyRequestReport} from '@libs/MoneyRequestReportUtils';
import {getFirstVisibleReportActionID, isDeletedParentAction, isIOUActionMatchingTransactionList, isReportActionVisible} from '@libs/ReportActionsUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import {reportVisibleActionsSelector} from '@selectors/ReportAction';

type UseMoneyRequestReportVisibleActionsParams = {
    /** The report whose actions are being displayed */
    reportID: string | undefined;

    /** Paginated report actions, newest-first */
    reportActions: OnyxTypes.ReportAction[];

    /** IDs of the report's non-deleted transactions, used to filter IOU actions to the visible transaction list */
    reportTransactionIDs: string[];

    /** Whether the current user can perform write actions on the report */
    canPerformWriteAction: boolean;

    /** Whether the harvest-created expense CREATED action should stay visible */
    shouldShowHarvestCreatedAction: boolean;

    /** Whether the network is offline */
    isOffline: boolean;
};

type UseMoneyRequestReportVisibleActionsResult = {
    /** Actions to render in the unified list — oldest-first, because this view starts at the top and is not inverted */
    visibleReportActions: OnyxTypes.ReportAction[];

    /** The same visible actions in the newest-first domain shared hooks like `useMarkAsRead` expect */
    visibleReportActionsNewestFirst: OnyxTypes.ReportAction[];

    /** The newest visible action */
    lastAction: OnyxTypes.ReportAction | undefined;

    /** The ID of the first visible action within the full paginated chain */
    firstVisibleReportActionID: string | undefined;
};

/**
 * Filters the paginated report actions down to the ones the money-request report view renders and
 * returns them in both orderings: oldest-first for the non-inverted unified list, newest-first for
 * the shared unread/mark-as-read hooks.
 */
function useMoneyRequestReportVisibleActions({
    reportID,
    reportActions,
    reportTransactionIDs,
    canPerformWriteAction,
    shouldShowHarvestCreatedAction,
    isOffline,
}: UseMoneyRequestReportVisibleActionsParams): UseMoneyRequestReportVisibleActionsResult {
    // Scoped selector: subscribing to the whole derived value re-renders this view on any report-action
    // change anywhere in the app; the selector keeps the ref stable while this report's slice is unchanged.
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {selector: reportVisibleActionsSelector(reportID)});

    const visibleReportActionsNewestFirst = reportActions.filter((reportAction) => {
        const isActionVisibleOnMoneyReport = isActionVisibleOnMoneyRequestReport(reportAction, shouldShowHarvestCreatedAction);
        if (!isActionVisibleOnMoneyReport) {
            return false;
        }

        const passesOfflineCheck = isOffline || isDeletedParentAction(reportAction) || reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || reportAction.errors;
        if (!passesOfflineCheck) {
            return false;
        }

        const actionReportID = reportAction.reportID ?? reportID;
        if (!isReportActionVisible(reportAction, actionReportID, canPerformWriteAction, visibleReportActionsData)) {
            return false;
        }

        if (!isIOUActionMatchingTransactionList(reportAction, reportTransactionIDs)) {
            return false;
        }

        return true;
    });

    // We are reversing actions because in this view we are starting at the top and don't use an inverted list
    const visibleReportActions = visibleReportActionsNewestFirst.slice().reverse();
    const lastAction = visibleReportActionsNewestFirst.at(0);
    const firstVisibleReportActionID = getFirstVisibleReportActionID(reportActions, isOffline);

    return {
        visibleReportActions,
        visibleReportActionsNewestFirst,
        lastAction,
        firstVisibleReportActionID,
    };
}

export default useMoneyRequestReportVisibleActions;

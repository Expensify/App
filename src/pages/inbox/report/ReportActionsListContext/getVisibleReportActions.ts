/** Visibility uses the records supplied by the list, including optimistic actions missing from the derived cache. */
import {
    getPaySiblingActionIDs,
    isActionableWhisperRequiringWritePermission,
    isDeletedParentAction,
    isIOUActionMatchingTransactionList,
    shouldHidePayAction,
    shouldReportActionBeVisible,
} from '@libs/ReportActionsUtils';
import {isResolvedSupportTicket, isSupportTicket} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import type {Report, ReportAction, ReportActions} from '@src/types/onyx';
import type {VisibleReportActionsDerivedValue} from '@src/types/onyx/DerivedValues';
import {getEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

type GetVisibleReportActionsParams = {
    reportID: string;
    report: OnyxEntry<Report>;
    actions: ReportAction[];
    reportActions: OnyxEntry<ReportActions>;
    threadReport: OnyxEntry<Report>;
    threadActions: OnyxEntry<ReportActions>;
    visibleActionsData: VisibleReportActionsDerivedValue | undefined;
    transactionIDs: string[] | undefined;
    canWrite: boolean;
    currentUserAccountID: number;
    isOffline: boolean;
};

function getVisibleReportActions({
    reportID,
    report,
    actions,
    reportActions,
    threadReport,
    threadActions,
    visibleActionsData,
    transactionIDs,
    canWrite,
    currentUserAccountID,
    isOffline,
}: GetVisibleReportActionsParams): ReportAction[] {
    const isSupportReport = isSupportTicket(report);
    return actions.filter((action) => {
        if (!isOffline && !isDeletedParentAction(action) && action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !action.errors) {
            return false;
        }
        if (!action.reportActionID) {
            return false;
        }
        const actionReportID = action.reportID ?? reportID;
        const cachedVisibility = action.pendingAction ? undefined : visibleActionsData?.[actionReportID]?.[action.reportActionID];
        if (cachedVisibility === false || (cachedVisibility === true && !canWrite && isActionableWhisperRequiringWritePermission(action))) {
            return false;
        }
        if (cachedVisibility === undefined) {
            const history = (actionReportID === threadReport?.reportID ? threadActions : reportActions) ?? getEmptyObject<ReportActions>();
            const paySiblingActionIDs = action.actionName === CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED ? getPaySiblingActionIDs(history) : undefined;
            if (
                !shouldReportActionBeVisible(
                    action,
                    action.reportActionID,
                    canWrite,
                    currentUserAccountID,
                    actionReportID,
                    actionReportID === reportID && isSupportReport,
                    undefined,
                    paySiblingActionIDs,
                )
            ) {
                return false;
            }
        }
        return isIOUActionMatchingTransactionList(action, transactionIDs);
    });
}

type GetDisplayReportActionsParams = {
    actions: ReportAction[];
    visibleActions: ReportAction[];
    cachedActions: ReportAction[] | undefined;
    report: OnyxEntry<Report>;
    reopenedAsReportID: string | undefined;
};

function getDisplayReportActions({actions, visibleActions, cachedActions, report, reopenedAsReportID}: GetDisplayReportActionsParams) {
    const paymentFilteredActions = report?.isWaitingOnBankAccount ? actions.filter((action) => !shouldHidePayAction(action, true)) : actions;
    const scrollActions = report?.isWaitingOnBankAccount ? visibleActions.filter((action) => !shouldHidePayAction(action, true)) : visibleActions;
    if (!isSupportTicket(report)) {
        return {actionsForUnread: paymentFilteredActions, visibleActions: scrollActions, scrollActions};
    }

    const latestResolution = isResolvedSupportTicket(report) && !reopenedAsReportID ? cachedActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED) : undefined;
    const latestSurvey = latestResolution
        ? cachedActions?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY && action.created >= latestResolution.created)
        : undefined;
    const shouldKeepAction = (action: ReportAction) => action.actionName !== CONST.REPORT.ACTIONS.TYPE.SUPPORT_SURVEY || action.reportActionID === latestSurvey?.reportActionID;

    return {actionsForUnread: paymentFilteredActions.filter(shouldKeepAction), visibleActions: scrollActions.filter(shouldKeepAction), scrollActions};
}

export {getVisibleReportActions, getDisplayReportActions};

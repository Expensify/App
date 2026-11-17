import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import type {HomeTodoSearchKey, Report, ReportAction, ReportActions} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {isApprovedAction, isExportIntegrationAction, isForwardedAction, isPayAction, isSubmittedAction, isSubmittedAndClosedAction} from './ReportActionsUtils';
import {isExported} from './ReportUtils';

/**
 * Helpers for the Home to-do review: paging through a to-do row's reports and moving on to the next one once the
 * user takes the row's action on the open report.
 */

/**
 * Whether the open report shows that the row's own action was taken on it. Other ways a report leaves a to-do row,
 * such as rejecting, deleting or holding it, return false so the user stays on the report.
 */
function isHomeTodoActionComplete(searchKey: HomeTodoSearchKey, report: OnyxEntry<Report>, reportActions: OnyxEntry<ReportActions>, currentUserAccountID: number): boolean {
    if (!report?.reportID || report.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        return false;
    }

    const stateNum = report.stateNum ?? CONST.REPORT.STATE_NUM.OPEN;
    switch (searchKey) {
        case CONST.SEARCH.SEARCH_KEYS.SUBMIT:
            return stateNum !== CONST.REPORT.STATE_NUM.OPEN;
        case CONST.SEARCH.SEARCH_KEYS.APPROVE:
            // An approval either finishes the workflow or forwards the report to the next approver, which takes it
            // off the current user's list while it stays submitted.
            return stateNum >= CONST.REPORT.STATE_NUM.APPROVED || (stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.managerID !== currentUserAccountID);
        case CONST.SEARCH.SEARCH_KEYS.PAY:
            // A payment waiting on the payee's bank account is still a payment the current user made.
            return report.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED || !!report.isWaitingOnBankAccount;
        case CONST.SEARCH.SEARCH_KEYS.EXPORT:
            return isExported(reportActions, report);
        default:
            return false;
    }
}

/** Whether a report action records the row's own action, by whoever took it */
function isHomeTodoReportAction(searchKey: HomeTodoSearchKey, reportAction: ReportAction): boolean {
    switch (searchKey) {
        case CONST.SEARCH.SEARCH_KEYS.SUBMIT:
            return isSubmittedAction(reportAction) || isSubmittedAndClosedAction(reportAction);
        case CONST.SEARCH.SEARCH_KEYS.APPROVE:
            return isApprovedAction(reportAction) || isForwardedAction(reportAction);
        case CONST.SEARCH.SEARCH_KEYS.PAY:
            return isPayAction(reportAction);
        case CONST.SEARCH.SEARCH_KEYS.EXPORT:
            return isExportIntegrationAction(reportAction);
        default:
            return false;
    }
}

/**
 * The newest report action that records the row's action on the report. Comparing it before and after lets the review
 * tell the user's own action apart from a change someone else made, such as another approver acting or an admin
 * changing the approver.
 */
function getLatestHomeTodoReportAction(searchKey: HomeTodoSearchKey, reportActions: OnyxEntry<ReportActions>): ReportAction | undefined {
    let latestReportAction: ReportAction | undefined;
    for (const reportAction of Object.values(reportActions ?? {})) {
        if (!reportAction || reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isHomeTodoReportAction(searchKey, reportAction)) {
            continue;
        }
        if (!latestReportAction || reportAction.created > latestReportAction.created) {
            latestReportAction = reportAction;
        }
    }
    return latestReportAction;
}

/**
 * The report to open after the user finishes `currentReportID`: the first report after it that still needs the row's
 * action, wrapping around to the reports the user skipped earlier. Returns undefined when none is left.
 */
function getNextHomeTodoReportID(reportIDs: string[], currentReportID: string, reportIDsNeedingAction: string[]): string | undefined {
    const needingAction = new Set(reportIDsNeedingAction);
    const currentIndex = reportIDs.indexOf(currentReportID);
    const rotation = currentIndex === -1 ? reportIDs : [...reportIDs.slice(currentIndex + 1), ...reportIDs.slice(0, currentIndex)];
    return rotation.find((reportID) => reportID !== currentReportID && needingAction.has(reportID));
}

/** Where a report from a to-do row opens: full screen on narrow layouts, and in the RHP otherwise, both returning to Home */
function getHomeTodoReportRoute(reportID: string, isNarrowLayout: boolean): Route {
    return isNarrowLayout ? ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, ROUTES.HOME) : ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo: ROUTES.HOME});
}

export {isHomeTodoActionComplete, getLatestHomeTodoReportAction, getNextHomeTodoReportID, getHomeTodoReportRoute};

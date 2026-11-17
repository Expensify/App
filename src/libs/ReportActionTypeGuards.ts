import CONST from '@src/CONST';
import type {OnyxInputOrEntry} from '@src/types/onyx';
import type ReportAction from '@src/types/onyx/ReportAction';
import type ReportActionName from '@src/types/onyx/ReportActionName';

function isActionOfType<T extends ReportActionName>(action: OnyxInputOrEntry<ReportAction>, actionName: T): action is ReportAction<T> {
    return action?.actionName === actionName;
}

function isMoneyRequestAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.IOU);
}

function isModifiedExpenseAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE);
}

function isDynamicExternalWorkflowApproveFailedAction(reportAction: OnyxInputOrEntry<ReportAction>): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED> {
    return isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED);
}

export {isActionOfType, isDynamicExternalWorkflowApproveFailedAction, isModifiedExpenseAction, isMoneyRequestAction};

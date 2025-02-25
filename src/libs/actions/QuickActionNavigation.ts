import {generateReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import type QuickAction from '@src/types/onyx/QuickAction';
import type {IOURequestType} from './IOU';
import {startMoneyRequest} from './IOU';
import {startOutCreateTaskQuickAction} from './Task';

function getQuickActionRequestType(action: QuickActionName | undefined): IOURequestType | undefined {
    if (!action) {
        return;
    }

    let requestType;
    if ([CONST.QUICK_ACTIONS.REQUEST_MANUAL, CONST.QUICK_ACTIONS.SPLIT_MANUAL, CONST.QUICK_ACTIONS.TRACK_MANUAL].some((a) => a === action)) {
        requestType = CONST.IOU.REQUEST_TYPE.MANUAL;
    } else if ([CONST.QUICK_ACTIONS.REQUEST_SCAN, CONST.QUICK_ACTIONS.SPLIT_SCAN, CONST.QUICK_ACTIONS.TRACK_SCAN].some((a) => a === action)) {
        requestType = CONST.IOU.REQUEST_TYPE.SCAN;
    } else if ([CONST.QUICK_ACTIONS.REQUEST_DISTANCE, CONST.QUICK_ACTIONS.SPLIT_DISTANCE, CONST.QUICK_ACTIONS.TRACK_DISTANCE].some((a) => a === action)) {
        requestType = CONST.IOU.REQUEST_TYPE.DISTANCE;
    } else if (action === CONST.QUICK_ACTIONS.PER_DIEM) {
        requestType = CONST.IOU.REQUEST_TYPE.PER_DIEM;
    }

    return requestType;
}

function navigateToQuickAction(isValidReport: boolean, quickActionReportID: string, quickAction: QuickAction, selectOption: (onSelected: () => void, shouldRestrictAction: boolean) => void) {
    const reportID = isValidReport ? quickActionReportID : generateReportID();
    const requestType = getQuickActionRequestType(quickAction?.action);

    switch (quickAction?.action) {
        case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
        case CONST.QUICK_ACTIONS.REQUEST_SCAN:
        case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
        case CONST.QUICK_ACTIONS.PER_DIEM:
            selectOption(() => startMoneyRequest(CONST.IOU.TYPE.SUBMIT, reportID, requestType, true), true);
            return;
        case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
        case CONST.QUICK_ACTIONS.SPLIT_SCAN:
        case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
            selectOption(() => startMoneyRequest(CONST.IOU.TYPE.SPLIT, reportID, requestType, true), true);
            return;
        case CONST.QUICK_ACTIONS.SEND_MONEY:
            selectOption(() => startMoneyRequest(CONST.IOU.TYPE.PAY, reportID, undefined, true), false);
            return;
        case CONST.QUICK_ACTIONS.ASSIGN_TASK:
            selectOption(() => startOutCreateTaskQuickAction(isValidReport ? reportID : '', quickAction.targetAccountID ?? CONST.DEFAULT_NUMBER_ID), false);
            break;
        case CONST.QUICK_ACTIONS.TRACK_MANUAL:
        case CONST.QUICK_ACTIONS.TRACK_SCAN:
        case CONST.QUICK_ACTIONS.TRACK_DISTANCE:
            selectOption(() => startMoneyRequest(CONST.IOU.TYPE.TRACK, reportID, requestType, true), false);
            break;
        default:
    }
}
export {navigateToQuickAction, getQuickActionRequestType};

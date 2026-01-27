import type {OnyxCollection} from 'react-native-onyx';
import {generateReportID} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import type {PersonalDetails} from '@src/types/onyx';
import type {DistanceExpenseType} from '@src/types/onyx/IOU';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import type QuickAction from '@src/types/onyx/QuickAction';
import type Transaction from '@src/types/onyx/Transaction';
import type {IOURequestType} from './IOU';
import {startDistanceRequest, startMoneyRequest} from './IOU';
import {startOutCreateTaskQuickAction} from './Task';

type NavigateToQuickActionParams = {
    isValidReport: boolean;
    quickAction: QuickAction;
    selectOption: (onSelected: () => void, shouldRestrictAction: boolean) => void;
    lastDistanceExpenseType?: DistanceExpenseType;
    targetAccountPersonalDetails: PersonalDetails;
    currentUserAccountID: number;
    draftTransactions: OnyxCollection<Transaction>;
};

function getQuickActionRequestType(action: QuickActionName | undefined, lastDistanceExpenseType?: DistanceExpenseType): IOURequestType | undefined {
    if (!action) {
        return;
    }

    let requestType;
    if ([CONST.QUICK_ACTIONS.REQUEST_MANUAL, CONST.QUICK_ACTIONS.SPLIT_MANUAL, CONST.QUICK_ACTIONS.TRACK_MANUAL].some((a) => a === action)) {
        requestType = CONST.IOU.REQUEST_TYPE.MANUAL;
    } else if ([CONST.QUICK_ACTIONS.REQUEST_SCAN, CONST.QUICK_ACTIONS.SPLIT_SCAN, CONST.QUICK_ACTIONS.TRACK_SCAN].some((a) => a === action)) {
        requestType = CONST.IOU.REQUEST_TYPE.SCAN;
    } else if ([CONST.QUICK_ACTIONS.REQUEST_DISTANCE, CONST.QUICK_ACTIONS.SPLIT_DISTANCE, CONST.QUICK_ACTIONS.TRACK_DISTANCE].some((a) => a === action)) {
        requestType = lastDistanceExpenseType ?? CONST.IOU.REQUEST_TYPE.DISTANCE_MAP;
    } else if (action === CONST.QUICK_ACTIONS.PER_DIEM) {
        requestType = CONST.IOU.REQUEST_TYPE.PER_DIEM;
    }

    return requestType;
}

function navigateToQuickAction(params: NavigateToQuickActionParams) {
    const {isValidReport, quickAction, selectOption, lastDistanceExpenseType, targetAccountPersonalDetails, currentUserAccountID, draftTransactions} = params;
    const reportID = isValidReport && quickAction?.chatReportID ? quickAction?.chatReportID : generateReportID();
    const requestType = getQuickActionRequestType(quickAction?.action, lastDistanceExpenseType);

    switch (quickAction?.action) {
        case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
        case CONST.QUICK_ACTIONS.REQUEST_SCAN:
        case CONST.QUICK_ACTIONS.PER_DIEM:
            selectOption(() => startMoneyRequest(CONST.IOU.TYPE.SUBMIT, reportID, requestType, true), true);
            break;
        case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
        case CONST.QUICK_ACTIONS.SPLIT_SCAN:
        case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
            selectOption(() => startMoneyRequest(CONST.IOU.TYPE.SPLIT, reportID, requestType, true), true);
            break;
        case CONST.QUICK_ACTIONS.SEND_MONEY:
            selectOption(() => startMoneyRequest(CONST.IOU.TYPE.PAY, reportID, undefined, true), false);
            break;
        case CONST.QUICK_ACTIONS.ASSIGN_TASK:
            selectOption(() => startOutCreateTaskQuickAction(currentUserAccountID, isValidReport ? reportID : '', targetAccountPersonalDetails), false);
            break;
        case CONST.QUICK_ACTIONS.TRACK_MANUAL:
        case CONST.QUICK_ACTIONS.TRACK_SCAN:
            selectOption(() => startMoneyRequest(CONST.IOU.TYPE.TRACK, reportID, requestType, true), false);
            break;
        case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
            selectOption(() => startDistanceRequest(CONST.IOU.TYPE.SUBMIT, reportID, requestType, true, undefined, draftTransactions), false);
            break;
        case CONST.QUICK_ACTIONS.TRACK_DISTANCE:
            selectOption(() => startDistanceRequest(CONST.IOU.TYPE.TRACK, reportID, requestType, true, undefined, draftTransactions), false);
            break;
        default:
    }
}
export {navigateToQuickAction, getQuickActionRequestType};

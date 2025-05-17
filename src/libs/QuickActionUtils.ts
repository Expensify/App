import type {SvgProps} from 'react-native-svg';
import * as Expensicons from '@components/Icon/Expensicons';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Policy, Report} from '@src/types/onyx';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import type QuickAction from '@src/types/onyx/QuickAction';
import getIconForAction from './getIconForAction';
import {canCreateRequest} from './ReportUtils';

const getQuickActionIcon = (action: QuickActionName): React.FC<SvgProps> => {
    switch (action) {
        case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
            return getIconForAction(CONST.IOU.TYPE.REQUEST);
        case CONST.QUICK_ACTIONS.REQUEST_SCAN:
            return Expensicons.ReceiptScan;
        case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
            return Expensicons.Car;
        case CONST.QUICK_ACTIONS.PER_DIEM:
            return Expensicons.CalendarSolid;
        case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
        case CONST.QUICK_ACTIONS.SPLIT_SCAN:
        case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
            return getIconForAction(CONST.IOU.TYPE.SPLIT);
        case CONST.QUICK_ACTIONS.SEND_MONEY:
            return getIconForAction(CONST.IOU.TYPE.SEND);
        case CONST.QUICK_ACTIONS.ASSIGN_TASK:
            return Expensicons.Task;
        case CONST.QUICK_ACTIONS.TRACK_DISTANCE:
            return Expensicons.Car;
        case CONST.QUICK_ACTIONS.TRACK_MANUAL:
            return getIconForAction(CONST.IOU.TYPE.TRACK);
        case CONST.QUICK_ACTIONS.TRACK_SCAN:
            return Expensicons.ReceiptScan;
        case CONST.QUICK_ACTIONS.CREATE_REPORT:
            return Expensicons.Document;
        default:
            return Expensicons.MoneyCircle;
    }
};

const getIOUType = (action: QuickActionName | undefined) => {
    switch (action) {
        case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
        case CONST.QUICK_ACTIONS.REQUEST_SCAN:
        case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
        case CONST.QUICK_ACTIONS.PER_DIEM:
            return CONST.IOU.TYPE.SUBMIT;
        case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
        case CONST.QUICK_ACTIONS.SPLIT_SCAN:
        case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
            return CONST.IOU.TYPE.SPLIT;
        case CONST.QUICK_ACTIONS.TRACK_DISTANCE:
        case CONST.QUICK_ACTIONS.TRACK_MANUAL:
        case CONST.QUICK_ACTIONS.TRACK_SCAN:
            return CONST.IOU.TYPE.TRACK;
        case CONST.QUICK_ACTIONS.SEND_MONEY:
            return CONST.IOU.TYPE.PAY;
        default:
            return undefined;
    }
};

const getQuickActionTitle = (action: QuickActionName): TranslationPaths => {
    switch (action) {
        case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
        case CONST.QUICK_ACTIONS.TRACK_MANUAL:
            return 'quickAction.requestMoney';
        case CONST.QUICK_ACTIONS.REQUEST_SCAN:
        case CONST.QUICK_ACTIONS.TRACK_SCAN:
            return 'quickAction.scanReceipt';
        case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
        case CONST.QUICK_ACTIONS.TRACK_DISTANCE:
            return 'quickAction.recordDistance';
        case CONST.QUICK_ACTIONS.PER_DIEM:
            return 'quickAction.perDiem';
        case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
            return 'quickAction.splitBill';
        case CONST.QUICK_ACTIONS.SPLIT_SCAN:
            return 'quickAction.splitScan';
        case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
            return 'quickAction.splitDistance';
        case CONST.QUICK_ACTIONS.SEND_MONEY:
            return 'quickAction.paySomeone';
        case CONST.QUICK_ACTIONS.ASSIGN_TASK:
            return 'quickAction.assignTask';
        case CONST.QUICK_ACTIONS.CREATE_REPORT:
            return 'quickAction.createReport';
        default:
            return '' as TranslationPaths;
    }
};

const isQuickActionAllowed = (quickAction: QuickAction, quickActionReport: Report | undefined, quickActionPolicy: Policy | undefined) => {
    const iouType = getIOUType(quickAction?.action);
    if (iouType) {
        return canCreateRequest(quickActionReport, quickActionPolicy, iouType);
    }
    if (quickAction?.action === CONST.QUICK_ACTIONS.PER_DIEM) {
        return !!quickActionPolicy?.arePerDiemRatesEnabled;
    }
    if (quickAction?.action === CONST.QUICK_ACTIONS.CREATE_REPORT) {
        return !!quickActionPolicy;
    }
    return true;
};

export {getQuickActionIcon, getQuickActionTitle, getIOUType, isQuickActionAllowed};

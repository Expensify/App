import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {Policy, Report} from '@src/types/onyx';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import type QuickAction from '@src/types/onyx/QuickAction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type IconAsset from '@src/types/utils/IconAsset';
import getIconForAction from './getIconForAction';
import {getPerDiemCustomUnit} from './PolicyUtils';
import {canCreateRequest} from './ReportUtils';

const getQuickActionIcon = (
    icons: Record<'CalendarSolid' | 'Car' | 'Task' | 'Coins' | 'Receipt' | 'Cash' | 'Transfer' | 'ReceiptScan' | 'MoneyCircle', IconAsset>,
    action: QuickActionName,
): IconAsset => {
    switch (action) {
        case CONST.QUICK_ACTIONS.REQUEST_MANUAL:
            return getIconForAction(CONST.IOU.TYPE.REQUEST, icons);
        case CONST.QUICK_ACTIONS.REQUEST_SCAN:
            return icons.ReceiptScan;
        case CONST.QUICK_ACTIONS.REQUEST_DISTANCE:
            return icons.Car;
        case CONST.QUICK_ACTIONS.PER_DIEM:
            return icons.CalendarSolid;
        case CONST.QUICK_ACTIONS.SPLIT_MANUAL:
        case CONST.QUICK_ACTIONS.SPLIT_SCAN:
        case CONST.QUICK_ACTIONS.SPLIT_DISTANCE:
            return getIconForAction(CONST.IOU.TYPE.SPLIT, icons);
        case CONST.QUICK_ACTIONS.SEND_MONEY:
            return getIconForAction(CONST.IOU.TYPE.SEND, icons);
        case CONST.QUICK_ACTIONS.ASSIGN_TASK:
            return icons.Task;
        case CONST.QUICK_ACTIONS.TRACK_DISTANCE:
            return icons.Car;
        case CONST.QUICK_ACTIONS.TRACK_MANUAL:
            return getIconForAction(CONST.IOU.TYPE.TRACK, icons);
        case CONST.QUICK_ACTIONS.TRACK_SCAN:
            return icons.ReceiptScan;
        default:
            return icons.MoneyCircle;
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
        default:
            return '' as TranslationPaths;
    }
};
const isManagerMcTestQuickActionReport = (report: Report | undefined) => {
    return !!report?.participants?.[CONST.ACCOUNT_ID.MANAGER_MCTEST];
};

const isQuickActionAllowed = (
    quickAction: QuickAction,
    quickActionReport: Report | undefined,
    quickActionPolicy: Policy | undefined,
    isReportArchived: boolean | undefined,
    isRestrictedToPreferredPolicy = false,
) => {
    if (quickAction?.action === CONST.QUICK_ACTIONS.PER_DIEM) {
        if (!quickActionPolicy?.arePerDiemRatesEnabled) {
            return false;
        }
        const perDiemCustomUnit = getPerDiemCustomUnit(quickActionPolicy);
        if (isEmptyObject(perDiemCustomUnit?.rates)) {
            return false;
        }
    }
    const iouType = getIOUType(quickAction?.action);
    if (iouType) {
        // We're disabling QAB for Manager McTest reports to prevent confusion when submitting real data for Manager McTest
        const isReportHasManagerMCTest = isManagerMcTestQuickActionReport(quickActionReport);
        if (isReportHasManagerMCTest) {
            return false;
        }
        return canCreateRequest(quickActionReport, quickActionPolicy, iouType, isReportArchived, isRestrictedToPreferredPolicy);
    }
    return true;
};

export {getQuickActionIcon, getQuickActionTitle, getIOUType, isQuickActionAllowed};

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';

type GetSubmitExpenseScenarioParams = {
    iouType: IOUType;
    isDistanceRequest: boolean;
    isMovingTransactionFromTrackExpense: boolean;
    isUnreported: boolean;
    isCategorizingTrackExpense: boolean;
    isSharingTrackExpense: boolean;
    isPerDiemRequest: boolean;
    isFromGlobalCreate: boolean;
    hasReceiptFiles: boolean;
};

/**
 * Determines the telemetry scenario string for a submit expense action.
 */
function getSubmitExpenseScenario({
    iouType,
    isDistanceRequest,
    isMovingTransactionFromTrackExpense,
    isUnreported,
    isCategorizingTrackExpense,
    isSharingTrackExpense,
    isPerDiemRequest,
    isFromGlobalCreate,
    hasReceiptFiles,
}: GetSubmitExpenseScenarioParams): string {
    const {SUBMIT_EXPENSE_SCENARIO} = CONST.TELEMETRY;

    if (iouType !== CONST.IOU.TYPE.TRACK && isDistanceRequest && !isMovingTransactionFromTrackExpense && !isUnreported) {
        return SUBMIT_EXPENSE_SCENARIO.DISTANCE;
    }
    if (iouType === CONST.IOU.TYPE.SPLIT) {
        if (hasReceiptFiles) {
            return SUBMIT_EXPENSE_SCENARIO.SPLIT_RECEIPT;
        }
        if (isFromGlobalCreate) {
            return SUBMIT_EXPENSE_SCENARIO.SPLIT_GLOBAL;
        }
        return SUBMIT_EXPENSE_SCENARIO.SPLIT;
    }
    if (iouType === CONST.IOU.TYPE.INVOICE) {
        return SUBMIT_EXPENSE_SCENARIO.INVOICE;
    }
    if (iouType === CONST.IOU.TYPE.TRACK || isCategorizingTrackExpense || isSharingTrackExpense) {
        return SUBMIT_EXPENSE_SCENARIO.TRACK_EXPENSE;
    }
    if (isPerDiemRequest) {
        return SUBMIT_EXPENSE_SCENARIO.PER_DIEM;
    }
    if (hasReceiptFiles) {
        return SUBMIT_EXPENSE_SCENARIO.REQUEST_MONEY_SCAN;
    }

    return SUBMIT_EXPENSE_SCENARIO.REQUEST_MONEY_MANUAL;
}

export default getSubmitExpenseScenario;
export type {GetSubmitExpenseScenarioParams};

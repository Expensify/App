import CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

const SUBMISSION_PATH = {
    DISTANCE: 'distance',
    SPLIT: 'split',
    INVOICE: 'invoice',
    TRACK: 'track',
    PER_DIEM: 'perDiem',
    REQUEST_MONEY: 'requestMoney',
} as const;

type SubmissionPath = (typeof SUBMISSION_PATH)[keyof typeof SUBMISSION_PATH];

type SubmissionPathSnapshot = {
    iouType: DeepValueOf<typeof CONST.IOU.TYPE>;
    action: DeepValueOf<typeof CONST.IOU.ACTION>;
    isDistanceRequest: boolean;
    isPerDiemRequest: boolean;
    isCategorizingTrackExpense: boolean;
    isSharingTrackExpense: boolean;
    isSelfDMDestination: boolean;
    isMovingTransactionFromTrackExpense: boolean;
    isUnreported: boolean;
    isSubmittingExpenseToDraftWorkspace: boolean;
};

function resolveSubmissionPath(snapshot: SubmissionPathSnapshot): SubmissionPath {
    const isTrackExpense = snapshot.iouType === CONST.IOU.TYPE.TRACK;

    if (!isTrackExpense && !snapshot.isSelfDMDestination && snapshot.isDistanceRequest && !snapshot.isMovingTransactionFromTrackExpense && !snapshot.isUnreported) {
        return SUBMISSION_PATH.DISTANCE;
    }
    if (snapshot.iouType === CONST.IOU.TYPE.SPLIT) {
        return SUBMISSION_PATH.SPLIT;
    }
    if (snapshot.iouType === CONST.IOU.TYPE.INVOICE) {
        return SUBMISSION_PATH.INVOICE;
    }
    if (
        !snapshot.isPerDiemRequest &&
        (isTrackExpense || snapshot.isCategorizingTrackExpense || snapshot.isSharingTrackExpense || snapshot.isSelfDMDestination || snapshot.isSubmittingExpenseToDraftWorkspace)
    ) {
        return SUBMISSION_PATH.TRACK;
    }
    if (snapshot.isPerDiemRequest && snapshot.action !== CONST.IOU.ACTION.SUBMIT) {
        return SUBMISSION_PATH.PER_DIEM;
    }
    return SUBMISSION_PATH.REQUEST_MONEY;
}

export {SUBMISSION_PATH, resolveSubmissionPath};
export type {SubmissionPath, SubmissionPathSnapshot};

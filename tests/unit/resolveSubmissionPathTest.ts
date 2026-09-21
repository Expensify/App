import type {SubmissionPathSnapshot} from '@pages/iou/request/step/confirmation/submission/utils/resolveSubmissionPath';
import {resolveSubmissionPath, SUBMISSION_PATH} from '@pages/iou/request/step/confirmation/submission/utils/resolveSubmissionPath';

import CONST from '@src/CONST';

const BASE_SNAPSHOT: SubmissionPathSnapshot = {
    iouType: CONST.IOU.TYPE.REQUEST,
    action: CONST.IOU.ACTION.CREATE,
    isDistanceRequest: false,
    isPerDiemRequest: false,
    isCategorizingTrackExpense: false,
    isSharingTrackExpense: false,
    isSelfDMDestination: false,
    isMovingTransactionFromTrackExpense: false,
    isUnreported: false,
    isSubmittingExpenseToDraftWorkspace: false,
};

function snap(overrides: Partial<SubmissionPathSnapshot>): SubmissionPathSnapshot {
    return {...BASE_SNAPSHOT, ...overrides};
}

describe('resolveSubmissionPath', () => {
    describe('happy path per destination', () => {
        it('routes a regular expense owed to someone else through requestMoney', () => {
            // Given the default snapshot, with no type or destination flags set
            // When the dispatch destination is resolved
            // Then it falls through every guard to requestMoney, the residual branch
            expect(resolveSubmissionPath(snap({}))).toBe(SUBMISSION_PATH.REQUEST_MONEY);
        });

        it('routes an untracked distance expense to another person through distance', () => {
            // Given a distance expense that is not being moved off a tracked expense and is not unreported
            // When the dispatch destination is resolved
            // Then CreateDistanceRequest runs, as it did before the split
            expect(resolveSubmissionPath(snap({isDistanceRequest: true}))).toBe(SUBMISSION_PATH.DISTANCE);
        });

        it('routes a split through split', () => {
            // Given a SPLIT expense
            // When the dispatch destination is resolved
            // Then the split family of commands runs
            expect(resolveSubmissionPath(snap({iouType: CONST.IOU.TYPE.SPLIT}))).toBe(SUBMISSION_PATH.SPLIT);
        });

        it('routes an invoice through invoice', () => {
            // Given an INVOICE expense
            // When the dispatch destination is resolved
            // Then SendInvoice runs
            expect(resolveSubmissionPath(snap({iouType: CONST.IOU.TYPE.INVOICE}))).toBe(SUBMISSION_PATH.INVOICE);
        });

        it('routes a tracked expense through track', () => {
            // Given a TRACK expense (not per diem)
            // When the dispatch destination is resolved
            // Then AddTrackedExpense runs
            expect(resolveSubmissionPath(snap({iouType: CONST.IOU.TYPE.TRACK}))).toBe(SUBMISSION_PATH.TRACK);
        });

        it('routes per diem to someone else through perDiem', () => {
            // Given a per diem expense created for another person
            // When the dispatch destination is resolved
            // Then CreatePerDiemExpense runs
            expect(resolveSubmissionPath(snap({isPerDiemRequest: true}))).toBe(SUBMISSION_PATH.PER_DIEM);
        });
    });

    describe('branch 1 guards (distance is checked first, before iouType)', () => {
        it('routes an untracked distance expense to the self DM through track, not distance', () => {
            // Given a distance expense whose only recipient is the current user
            // When the dispatch destination is resolved
            // Then track runs, because branch 1 requires a destination other than the self DM
            expect(resolveSubmissionPath(snap({isDistanceRequest: true, isSelfDMDestination: true}))).toBe(SUBMISSION_PATH.TRACK);
        });

        it('routes a distance expense moved off a tracked expense through requestMoney, not distance', () => {
            // Given a distance expense being converted from a tracked expense (SUBMIT/CATEGORIZE/SHARE)
            // When the dispatch destination is resolved
            // Then ConvertTrackedExpenseToRequest runs, since the expense already exists as tracked
            expect(resolveSubmissionPath(snap({isDistanceRequest: true, isMovingTransactionFromTrackExpense: true}))).toBe(SUBMISSION_PATH.REQUEST_MONEY);
        });

        it('routes an unreported distance expense through requestMoney, not distance', () => {
            // Given a distance expense that is not attached to a report
            // When the dispatch destination is resolved
            // Then branch 1 skips it, so the expense is written as a request
            expect(resolveSubmissionPath(snap({isDistanceRequest: true, isUnreported: true}))).toBe(SUBMISSION_PATH.REQUEST_MONEY);
        });

        it('routes a tracked distance expense through track, not distance', () => {
            // Given a distance expense on the TRACK type
            // When the dispatch destination is resolved
            // Then track runs, because branch 1 excludes tracked expenses
            expect(resolveSubmissionPath(snap({iouType: CONST.IOU.TYPE.TRACK, isDistanceRequest: true}))).toBe(SUBMISSION_PATH.TRACK);
        });

        it('routes a SPLIT distance expense through distance', () => {
            // Given a SPLIT expense with a distance request type
            // When the dispatch destination is resolved
            // Then CreateDistanceRequest runs, matching the pre-split dispatcher
            expect(resolveSubmissionPath(snap({iouType: CONST.IOU.TYPE.SPLIT, isDistanceRequest: true}))).toBe(SUBMISSION_PATH.DISTANCE);
        });
    });

    describe('track destination', () => {
        it('routes categorizing a tracked expense through track', () => {
            // Given a tracked expense being categorized
            // When the dispatch destination is resolved
            // Then CategorizeTrackedExpense runs
            expect(resolveSubmissionPath(snap({action: CONST.IOU.ACTION.CATEGORIZE, isCategorizingTrackExpense: true}))).toBe(SUBMISSION_PATH.TRACK);
        });

        it('routes sharing a tracked expense through track', () => {
            // Given a tracked expense being shared
            // When the dispatch destination is resolved
            // Then ShareTrackedExpense runs
            expect(resolveSubmissionPath(snap({action: CONST.IOU.ACTION.SHARE, isSharingTrackExpense: true}))).toBe(SUBMISSION_PATH.TRACK);
        });

        it('routes a request whose only recipient is the current user through track', () => {
            // Given a request to the self DM
            // When the dispatch destination is resolved
            // Then track runs, since requestMoney cannot write to the self DM
            expect(resolveSubmissionPath(snap({isSelfDMDestination: true}))).toBe(SUBMISSION_PATH.TRACK);
        });

        it('routes submitting to a brand-new submit workspace through track', () => {
            // Given "submit to my employer" with no existing workspace (a draft SUBMIT policy)
            // When the dispatch destination is resolved
            // Then track runs, so the workspace and the expense are created atomically
            expect(resolveSubmissionPath(snap({isSubmittingExpenseToDraftWorkspace: true}))).toBe(SUBMISSION_PATH.TRACK);
        });
    });

    describe('per diem + SUBMIT falls through to requestMoney', () => {
        it('routes tracked per diem being submitted through requestMoney, not perDiem or track', () => {
            // Given a per diem expense pulled out of the self DM to be submitted
            // When the dispatch destination is resolved
            // Then requestMoney runs, so the original tracked expense is converted rather than a new one created
            expect(resolveSubmissionPath(snap({iouType: CONST.IOU.TYPE.TRACK, action: CONST.IOU.ACTION.SUBMIT, isPerDiemRequest: true}))).toBe(SUBMISSION_PATH.REQUEST_MONEY);
        });

        it('routes per diem being categorized through perDiem, showing only SUBMIT falls through', () => {
            // Given per diem being categorized
            // When the dispatch destination is resolved
            // Then perDiem runs — pinning that the fallthrough is about SUBMIT alone, not track-movement actions
            expect(resolveSubmissionPath(snap({isPerDiemRequest: true, action: CONST.IOU.ACTION.CATEGORIZE}))).toBe(SUBMISSION_PATH.PER_DIEM);
        });
    });
});

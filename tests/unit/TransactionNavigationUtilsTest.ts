import {isDeletedAction} from '@libs/ReportActionsUtils';
import {
    decodeDeleteNavigateBackUrl,
    doesDeleteNavigateBackUrlIncludeDuplicatesReview,
    doesDeleteNavigateBackUrlIncludeSpecificDuplicatesReview,
    getParentReportActionDeletionStatus,
    hasLoadedReportActions,
    isThreadReportDeleted,
} from '@libs/TransactionNavigationUtils';
import CONST from '@src/CONST';
import type {Report, ReportAction, ReportMetadata} from '@src/types/onyx';

jest.mock('@libs/ReportActionsUtils', () => ({
    isDeletedAction: jest.fn(),
}));

const mockedIsDeletedAction = jest.mocked(isDeletedAction);
const DUPLICATES_REVIEW_URL = '/r/duplicates/review/123';
const ENCODED_DUPLICATES_REVIEW_URL = `/r/${encodeURIComponent('/duplicates/review/123')}`;

function createReportMetadata(overrides: Partial<ReportMetadata> = {}): ReportMetadata {
    return {
        hasOnceLoadedReportActions: false,
        isLoadingInitialReportActions: true,
        ...overrides,
    } as ReportMetadata;
}

describe('TransactionNavigationUtils', () => {
    beforeEach(() => {
        mockedIsDeletedAction.mockReturnValue(false);
    });

    describe('hasLoadedReportActions', () => {
        it('returns false for missing metadata', () => {
            expect(hasLoadedReportActions(undefined)).toBe(false);
        });

        it('returns true when report actions have loaded once', () => {
            expect(hasLoadedReportActions(createReportMetadata({hasOnceLoadedReportActions: true}))).toBe(true);
        });

        it('returns true when initial report actions loading is complete', () => {
            expect(hasLoadedReportActions(createReportMetadata({isLoadingInitialReportActions: false}))).toBe(true);
        });

        it('returns true in offline mode', () => {
            expect(hasLoadedReportActions(createReportMetadata(), true)).toBe(true);
        });

        it('returns false when still loading and online', () => {
            expect(hasLoadedReportActions(createReportMetadata())).toBe(false);
        });
    });

    describe('isThreadReportDeleted', () => {
        it('returns true for a closed report without reportID', () => {
            const report = {statusNum: CONST.REPORT.STATUS_NUM.CLOSED} as Report;

            expect(isThreadReportDeleted(report, createReportMetadata())).toBe(true);
        });

        it('returns true when report actions are loaded and reportID is missing', () => {
            expect(isThreadReportDeleted({} as Report, createReportMetadata({hasOnceLoadedReportActions: true}))).toBe(true);
        });

        it('returns false when report exists', () => {
            expect(isThreadReportDeleted({reportID: '123'} as Report, createReportMetadata({hasOnceLoadedReportActions: true}))).toBe(false);
        });

        it('returns false while actions are not loaded yet', () => {
            expect(isThreadReportDeleted({} as Report, createReportMetadata())).toBe(false);
        });
    });

    describe('decodeDeleteNavigateBackUrl', () => {
        it('decodes encoded URLs', () => {
            expect(decodeDeleteNavigateBackUrl(ENCODED_DUPLICATES_REVIEW_URL)).toBe('/r//duplicates/review/123');
        });

        it('returns already-decoded URL unchanged', () => {
            expect(decodeDeleteNavigateBackUrl(DUPLICATES_REVIEW_URL)).toBe(DUPLICATES_REVIEW_URL);
        });

        it('returns original URL when decoding fails', () => {
            expect(decodeDeleteNavigateBackUrl('%E0%A4%A')).toBe('%E0%A4%A');
        });
    });

    describe('doesDeleteNavigateBackUrlIncludeDuplicatesReview', () => {
        it('returns false for missing URL', () => {
            expect(doesDeleteNavigateBackUrlIncludeDuplicatesReview(undefined)).toBe(false);
        });

        it('returns true for plain duplicates review URL', () => {
            expect(doesDeleteNavigateBackUrlIncludeDuplicatesReview(DUPLICATES_REVIEW_URL)).toBe(true);
        });

        it('returns true for encoded duplicates review URL', () => {
            expect(doesDeleteNavigateBackUrlIncludeDuplicatesReview(ENCODED_DUPLICATES_REVIEW_URL)).toBe(true);
        });

        it('returns false for unrelated URL', () => {
            expect(doesDeleteNavigateBackUrlIncludeDuplicatesReview('/r/reports/123')).toBe(false);
        });
    });

    describe('doesDeleteNavigateBackUrlIncludeSpecificDuplicatesReview', () => {
        it('returns false when threadReportID is missing', () => {
            expect(doesDeleteNavigateBackUrlIncludeSpecificDuplicatesReview(DUPLICATES_REVIEW_URL)).toBe(false);
        });

        it('returns true when URL matches duplicates review and threadReportID', () => {
            expect(doesDeleteNavigateBackUrlIncludeSpecificDuplicatesReview(DUPLICATES_REVIEW_URL, '123')).toBe(true);
        });

        it('returns false when URL matches duplicates review with different threadReportID', () => {
            expect(doesDeleteNavigateBackUrlIncludeSpecificDuplicatesReview(DUPLICATES_REVIEW_URL, '456')).toBe(false);
        });
    });

    describe('getParentReportActionDeletionStatus', () => {
        it('marks parent action as deleted when pending delete is set', () => {
            const parentReportAction = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE} as ReportAction;

            const result = getParentReportActionDeletionStatus({parentReportAction});

            expect(result.isParentActionDeleted).toBe(true);
            expect(result.wasParentActionDeleted).toBe(true);
        });

        it('marks parent action as deleted when action is deleted', () => {
            mockedIsDeletedAction.mockReturnValue(true);

            const result = getParentReportActionDeletionStatus({parentReportAction: {reportActionID: '1'} as ReportAction});

            expect(result.isParentActionDeleted).toBe(true);
            expect(result.wasParentActionDeleted).toBe(true);
        });

        it('marks parent action missing after load as deleted', () => {
            const result = getParentReportActionDeletionStatus({
                parentReportID: '123',
                parentReportActionID: '456',
                parentReportAction: undefined,
                parentReportMetadata: createReportMetadata({hasOnceLoadedReportActions: true}),
            });

            expect(result.isParentActionMissingAfterLoad).toBe(true);
            expect(result.wasParentActionDeleted).toBe(true);
        });

        it('marks missing parent report as deleted when configured', () => {
            const result = getParentReportActionDeletionStatus({
                shouldTreatMissingParentReportAsDeleted: true,
                parentReportAction: undefined,
            });

            expect(result.wasParentActionDeleted).toBe(true);
        });

        it('does not mark parent action as deleted when action exists and is valid', () => {
            const result = getParentReportActionDeletionStatus({
                parentReportID: '123',
                parentReportActionID: '456',
                parentReportAction: {reportActionID: '456'} as ReportAction,
                parentReportMetadata: createReportMetadata({hasOnceLoadedReportActions: true}),
            });

            expect(result.isParentActionDeleted).toBe(false);
            expect(result.isParentActionMissingAfterLoad).toBe(false);
            expect(result.wasParentActionDeleted).toBe(false);
        });

        it('uses offline fallback when checking parent report actions loaded state', () => {
            const result = getParentReportActionDeletionStatus({
                parentReportID: '123',
                parentReportActionID: '456',
                parentReportAction: undefined,
                parentReportMetadata: createReportMetadata(),
                isOffline: true,
            });

            expect(result.hasLoadedParentReportActions).toBe(true);
            expect(result.isParentActionMissingAfterLoad).toBe(true);
            expect(result.wasParentActionDeleted).toBe(true);
        });
    });
});

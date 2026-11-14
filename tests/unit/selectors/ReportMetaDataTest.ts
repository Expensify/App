import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportLoadingState, ReportMetadata} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {
    hasOnceLoadedReportActionsSelector,
    isActionLoadingSelector,
    pendingChatMembersSelector,
    pendingDeleteMemberAccountIDsByReportIDSelector,
    reportActionsListLoadingStateSelector,
} from '@selectors/ReportMetaData';

describe('isActionLoadingSelector', () => {
    it('returns true when isActionLoading is true', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {isActionLoading: true};
        expect(isActionLoadingSelector(loadingState)).toBe(true);
    });

    it('returns false when isActionLoading is false', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {isActionLoading: false};
        expect(isActionLoadingSelector(loadingState)).toBe(false);
    });

    it('returns false when isActionLoading is not set', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {};
        expect(isActionLoadingSelector(loadingState)).toBe(false);
    });

    it('returns false when loadingState is undefined', () => {
        expect(isActionLoadingSelector(undefined)).toBe(false);
    });
});

describe('hasOnceLoadedReportActionsSelector', () => {
    it('returns true when hasOnceLoadedReportActions is true', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {hasOnceLoadedReportActions: true};
        expect(hasOnceLoadedReportActionsSelector(loadingState)).toBe(true);
    });

    it('returns false when hasOnceLoadedReportActions is false', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {hasOnceLoadedReportActions: false};
        expect(hasOnceLoadedReportActionsSelector(loadingState)).toBe(false);
    });

    it('returns undefined when hasOnceLoadedReportActions is not set', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {};
        expect(hasOnceLoadedReportActionsSelector(loadingState)).toBeUndefined();
    });

    it('returns undefined when loadingState is undefined', () => {
        expect(hasOnceLoadedReportActionsSelector(undefined)).toBeUndefined();
    });
});

describe('reportActionsListLoadingStateSelector', () => {
    it('preserves both initial report loading fields', () => {
        const loadingState: OnyxEntry<ReportLoadingState> = {
            hasOnceLoadedReportActions: false,
            isLoadingInitialReportActions: true,
        };

        expect(reportActionsListLoadingStateSelector(loadingState)).toEqual(loadingState);
    });

    it('returns undefined when loadingState is undefined', () => {
        expect(reportActionsListLoadingStateSelector(undefined)).toBeUndefined();
    });
});

describe('pendingChatMembersSelector', () => {
    it('returns object with pendingChatMembers when present', () => {
        const pendingChatMembers = [{accountID: '12345', pendingAction: 'add' as const}];
        const reportMetadata: OnyxEntry<ReportMetadata> = {pendingChatMembers};
        expect(pendingChatMembersSelector(reportMetadata)).toEqual({pendingChatMembers});
    });

    it('returns object with undefined pendingChatMembers when field is not set', () => {
        const reportMetadata: OnyxEntry<ReportMetadata> = {};
        expect(pendingChatMembersSelector(reportMetadata)).toEqual({pendingChatMembers: undefined});
    });

    it('returns undefined when reportMetadata is undefined', () => {
        expect(pendingChatMembersSelector(undefined)).toBeUndefined();
    });
});

describe('pendingDeleteMemberAccountIDsByReportIDSelector', () => {
    it('returns the same empty object for every snapshot without a pending member deletion', () => {
        // Given two successive snapshots of the report metadata collection, neither with a member pending deletion
        const first: OnyxCollection<ReportMetadata> = {[`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`]: {pendingChatMembers: []}};
        const second: OnyxCollection<ReportMetadata> = {[`${ONYXKEYS.COLLECTION.REPORT_METADATA}2`]: {}};

        // When the selector runs for each of them
        const firstResult = pendingDeleteMemberAccountIDsByReportIDSelector(first);
        const secondResult = pendingDeleteMemberAccountIDsByReportIDSelector(second);

        // Then both get the same empty object, so reference-keyed caches downstream (the Search Router option list) keep hitting
        expect(secondResult).toBe(firstResult);
        expect(firstResult).toEqual({});
    });

    it('returns the same result for the same collection while a member removal is pending', () => {
        // Given a collection with a member pending deletion, which Onyx hands to every subscriber as one snapshot
        const REPORT_ID = '1';
        const metadata: OnyxCollection<ReportMetadata> = {
            [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${REPORT_ID}`]: {pendingChatMembers: [{accountID: '5', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]},
        };

        // When two subscribers run the selector on that snapshot
        const first = pendingDeleteMemberAccountIDsByReportIDSelector(metadata);
        const second = pendingDeleteMemberAccountIDsByReportIDSelector(metadata);

        // Then both get the same object, so the option list cache keeps hitting while the removal is pending
        expect(first).toEqual({[REPORT_ID]: ['5']});
        expect(second).toBe(first);
    });

    it('returns a new result once the pending member removal is gone from the collection', () => {
        // Given a collection with a member pending deletion that a subscriber has already read
        const REPORT_ID = '2';
        const key = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${REPORT_ID}` as const;
        const pending: OnyxCollection<ReportMetadata> = {[key]: {pendingChatMembers: [{accountID: '7', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]}};
        expect(pendingDeleteMemberAccountIDsByReportIDSelector(pending)).toEqual({[REPORT_ID]: ['7']});

        // When Onyx hands subscribers a new snapshot after the server confirms the removal
        const confirmed: OnyxCollection<ReportMetadata> = {[key]: {pendingChatMembers: []}};
        const result = pendingDeleteMemberAccountIDsByReportIDSelector(confirmed);

        // Then the cached result for the old snapshot is not reused, so the member does not stay hidden
        expect(result).toEqual({});
    });
});

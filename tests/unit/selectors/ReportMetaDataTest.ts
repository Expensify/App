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
    it('returns the same reference for every call when no member is pending deletion', () => {
        // Given two report metadata collections without pending member deletions, as two separate subscribers see them
        const first: OnyxCollection<ReportMetadata> = {[`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`]: {pendingChatMembers: []}};
        const second: OnyxCollection<ReportMetadata> = {[`${ONYXKEYS.COLLECTION.REPORT_METADATA}2`]: {}};

        // When the selector runs for each of them
        // Then both get one shared object, so reference-keyed caches downstream (the Search Router option list) keep hitting
        const shared = pendingDeleteMemberAccountIDsByReportIDSelector(first);
        expect(pendingDeleteMemberAccountIDsByReportIDSelector(second)).toBe(shared);
        expect(pendingDeleteMemberAccountIDsByReportIDSelector(undefined)).toBe(shared);
        expect(shared).toEqual({});

        // And the shared object is frozen, so no subscriber can leak a mutation into the others
        expect(Object.isFrozen(shared)).toBe(true);
    });

    it('returns the shared empty object when members are pending only for addition', () => {
        // Given a report whose only pending member is being added, the state right after inviting someone
        const metadata: OnyxCollection<ReportMetadata> = {
            [`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`]: {pendingChatMembers: [{accountID: '5', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}]},
        };

        // When the selector runs
        // Then it returns the shared object, so pending additions do not cost the option list cache its hits
        expect(pendingDeleteMemberAccountIDsByReportIDSelector(metadata)).toBe(pendingDeleteMemberAccountIDsByReportIDSelector(undefined));
    });

    it('maps reports with members pending deletion to their account IDs', () => {
        // Given a report with one member pending deletion
        const REPORT_ID = '1';
        const metadata: OnyxCollection<ReportMetadata> = {
            [`${ONYXKEYS.COLLECTION.REPORT_METADATA}${REPORT_ID}`]: {pendingChatMembers: [{accountID: '5', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]},
        };

        // When the selector runs
        // Then the report is keyed by its ID with the pending account
        const result = pendingDeleteMemberAccountIDsByReportIDSelector(metadata);
        expect(result).toEqual({[REPORT_ID]: ['5']});

        // And it is a new object rather than the shared empty one, so the option list cache sees the change
        expect(result).not.toBe(pendingDeleteMemberAccountIDsByReportIDSelector(undefined));
    });

    it('returns the same result for the same collection while a member removal is pending', () => {
        // Given a collection with a member pending deletion, which Onyx hands to every subscriber as one snapshot
        const metadata: OnyxCollection<ReportMetadata> = {
            [`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`]: {pendingChatMembers: [{accountID: '5', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]},
        };

        // When two subscribers run the selector on that snapshot
        const first = pendingDeleteMemberAccountIDsByReportIDSelector(metadata);
        const second = pendingDeleteMemberAccountIDsByReportIDSelector(metadata);

        // Then both get the same object, so the option list cache keeps hitting while the removal is pending
        expect(second).toBe(first);

        // When Onyx rebuilds the snapshot because the removal settled
        const settled: OnyxCollection<ReportMetadata> = {[`${ONYXKEYS.COLLECTION.REPORT_METADATA}1`]: {pendingChatMembers: []}};

        // Then the selector computes again from the new snapshot
        expect(pendingDeleteMemberAccountIDsByReportIDSelector(settled)).toEqual({});
    });
});

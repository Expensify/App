import {act, renderHook} from '@testing-library/react-native';

import useOnyx from '@hooks/useOnyx';

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
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../../utils/waitForBatchedUpdatesWithAct';

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

    it('keeps the previous result when a new snapshot has the same pending removals', () => {
        // Given a pending removal read from one snapshot
        const key = `${ONYXKEYS.COLLECTION.REPORT_METADATA}3` as const;
        const pendingEntry: ReportMetadata = {pendingChatMembers: [{accountID: '9', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]};
        const first = pendingDeleteMemberAccountIDsByReportIDSelector({[key]: pendingEntry});

        // When Onyx hands out a new snapshot because unrelated metadata of another report changed
        const next = pendingDeleteMemberAccountIDsByReportIDSelector({[key]: pendingEntry, [`${ONYXKEYS.COLLECTION.REPORT_METADATA}4`]: {isOptimisticReport: true}});

        // Then the same object comes back, so the option list cache keeps hitting while the removal is pending
        expect(next).toBe(first);
    });
});

describe('pendingDeleteMemberAccountIDsByReportIDSelector through useOnyx', () => {
    const REPORT_ID = '10';
    const METADATA_KEY = `${ONYXKEYS.COLLECTION.REPORT_METADATA}${REPORT_ID}` as const;
    const OTHER_METADATA_KEY = `${ONYXKEYS.COLLECTION.REPORT_METADATA}11` as const;
    const useSelectedPendingDeletes = () => useOnyx(ONYXKEYS.COLLECTION.REPORT_METADATA, {selector: pendingDeleteMemberAccountIDsByReportIDSelector})[0];

    beforeAll(() => Onyx.init({keys: ONYXKEYS}));

    afterEach(async () => {
        await act(async () => Onyx.clear());
    });

    it('gives every subscriber of the same collection snapshot the same result', async () => {
        // Given a collection with a member pending removal. The selector cache only hits if Onyx hands every subscriber the same collection object
        await act(async () => {
            await Onyx.set(METADATA_KEY, {pendingChatMembers: [{accountID: '5', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]});
        });

        // When two components subscribe with the selector, as useFilteredOptions and InSelector do
        const first = renderHook(useSelectedPendingDeletes);
        const second = renderHook(useSelectedPendingDeletes);
        await waitForBatchedUpdatesWithAct();

        // Then both get the same object, so the reference-keyed option list cache can hit for either of them
        expect(first.result.current).toEqual({[REPORT_ID]: ['5']});
        expect(second.result.current).toBe(first.result.current);
        first.unmount();
        second.unmount();
    });

    it('gives a subscriber mounted after an unrelated metadata change the same result as one that stayed mounted', async () => {
        // Given a mounted subscriber while a member removal is pending
        await act(async () => {
            await Onyx.set(METADATA_KEY, {pendingChatMembers: [{accountID: '5', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}]});
        });
        const mounted = renderHook(useSelectedPendingDeletes);
        await waitForBatchedUpdatesWithAct();
        const before = mounted.result.current;

        // When metadata of another report changes, so Onyx builds a new collection snapshot, and the Search Router mounts a new subscriber
        await act(async () => {
            await Onyx.merge(OTHER_METADATA_KEY, {isOptimisticReport: true});
        });
        const remounted = renderHook(useSelectedPendingDeletes);
        await waitForBatchedUpdatesWithAct();

        // Then both hold the result from before the change, so reopening the Search Router still hits the option list cache
        expect(mounted.result.current).toBe(before);
        expect(remounted.result.current).toBe(before);
        mounted.unmount();
        remounted.unmount();
    });
});

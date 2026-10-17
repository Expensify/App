import {act, renderHook} from '@testing-library/react-native';

import useOptimisticSearchTracking from '@components/Search/hooks/useOptimisticSearchTracking';
import type {SearchQueryJSON} from '@components/Search/types';

import {acquireSearchWriteBarrier, flushPendingSearchWrite, hasPendingSearchWrite, markPendingSearchWrite, resetForTesting, setSearchWriteWatchKey} from '@libs/pendingSearchWrite';
import type * as ReportActionMessageUtils from '@libs/ReportActionMessageUtils';
import type * as ReportActionTypeGuards from '@libs/ReportActionTypeGuards';
import {getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Transaction} from '@src/types/onyx';
import type {ReportActions} from '@src/types/onyx/ReportAction';
import type SearchResults from '@src/types/onyx/SearchResults';

import type {OnyxCollection} from 'react-native-onyx';

import createMock from '../../utils/createMock';

jest.mock('@libs/ReportActionsUtils', () => ({
    getOriginalMessage: jest.requireActual<typeof ReportActionMessageUtils>('@libs/ReportActionMessageUtils').getOriginalMessage,
    isMoneyRequestAction: jest.requireActual<typeof ReportActionTypeGuards>('@libs/ReportActionTypeGuards').isMoneyRequestAction,
}));
jest.mock('@libs/telemetry/submitFollowUpAction', () => ({getPendingSubmitFollowUpAction: jest.fn()}));

const TRANSACTION_ID = '9876543210';
const TRANSACTION_KEY = `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}` as const;

const transactions: OnyxCollection<Transaction> = {
    [TRANSACTION_KEY]: {
        transactionID: TRANSACTION_ID,
        reportID: '1',
        merchant: 'Unique merchant',
        amount: 4200,
        currency: 'USD',
        created: '2026-09-29',
    },
};

function makeQueryJSON(hash: number): SearchQueryJSON {
    return createMock<SearchQueryJSON>({
        hash,
        flatFilters: [],
        type: CONST.SEARCH.DATA_TYPES.EXPENSE,
        sortBy: CONST.SEARCH.TABLE_COLUMNS.DATE,
        sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    });
}

function makeSearchResults(hash: number): SearchResults {
    return createMock<SearchResults>({
        data: {personalDetailsList: {}},
        search: {hash, isLoading: false, hasMoreResults: false, type: CONST.SEARCH.DATA_TYPES.EXPENSE},
    });
}

function renderTracking(hash: number, overrides: Partial<Parameters<typeof useOptimisticSearchTracking>[0]> = {}) {
    return renderHook(() =>
        useOptimisticSearchTracking({
            searchResults: makeSearchResults(hash),
            queryJSON: makeQueryJSON(hash),
            transactions,
            reportActions: undefined,
            ...overrides,
        }),
    );
}

beforeEach(() => {
    jest.useFakeTimers();
    resetForTesting();
    jest.mocked(getPendingSubmitFollowUpAction).mockReturnValue(null);
});

afterEach(() => {
    resetForTesting();
    jest.restoreAllMocks();
    jest.useRealTimers();
});

describe('useOptimisticSearchTracking', () => {
    it('adds the optimistic transaction while its write is still pending', () => {
        // Given a submission that marked the signal and published its watch key
        markPendingSearchWrite();
        setSearchWriteWatchKey(TRANSACTION_KEY);

        // When Search mounts while that write is still pending
        const {result} = renderTracking(111);

        // Then the transaction is added to the snapshot, so its row shows before the server indexes it
        expect(result.current.searchDataWithOptimisticTransaction).toHaveProperty(TRANSACTION_KEY);
    });

    it('does not add the transaction of a released write to a search mounted afterwards', () => {
        // Given a submission whose write was already released, leaving its watch key readable
        markPendingSearchWrite();
        setSearchWriteWatchKey(TRANSACTION_KEY);
        acquireSearchWriteBarrier();
        flushPendingSearchWrite();

        // When a different query mounts Search with no write of its own pending
        const {result} = renderTracking(222);

        // Then the earlier expense is left out, since it has no relation to this query's filters
        expect(result.current.searchDataWithOptimisticTransaction).not.toHaveProperty(TRANSACTION_KEY);
    });
    it('adds only matching optimistic IOU actions and preserves snapshot entries', () => {
        // Given a pending expense and real IOU actions with matching, missing and different metadata
        markPendingSearchWrite();
        setSearchWriteWatchKey(TRANSACTION_KEY);
        const matchingActions = createMock<ReportActions>({
            matching: {actionName: CONST.REPORT.ACTIONS.TYPE.IOU, originalMessage: {IOUTransactionID: TRANSACTION_ID}},
        });
        const actions: OnyxCollection<ReportActions> = {
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: matchingActions,
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: createMock<ReportActions>({missing: {actionName: CONST.REPORT.ACTIONS.TYPE.IOU}}),
            [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`]: createMock<ReportActions>({different: {actionName: CONST.REPORT.ACTIONS.TYPE.IOU, originalMessage: {IOUTransactionID: 'other'}}}),
            [ONYXKEYS.NETWORK]: matchingActions,
        };
        const snapshot = makeSearchResults(333);
        snapshot.data[`${ONYXKEYS.COLLECTION.TRANSACTION}existing`] = createMock<Transaction>({transactionID: 'existing'});

        // When the actual hook augments the snapshot using the production guards and accessor
        const {result} = renderTracking(333, {reportActions: actions, searchResults: snapshot});
        const data = result.current.searchDataWithOptimisticTransaction;

        // Then the matching action collection and transaction are retained without rewriting the input
        expect(data?.[TRANSACTION_KEY]).toBe(transactions[TRANSACTION_KEY]);
        expect(data?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]).toBe(matchingActions);
        expect(data).not.toHaveProperty(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`);
        expect(data).not.toHaveProperty(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}3`);
        expect(data).not.toHaveProperty(ONYXKEYS.NETWORK);
        expect(data?.personalDetailsList).toBe(snapshot.data.personalDetailsList);
        expect(data?.[`${ONYXKEYS.COLLECTION.TRANSACTION}existing`]).toBe(snapshot.data[`${ONYXKEYS.COLLECTION.TRANSACTION}existing`]);
        expect(snapshot.data).not.toHaveProperty(TRANSACTION_KEY);
    });

    it('preserves an existing transaction snapshot and excludes split parents and invalid watch prefixes', () => {
        // Given a server snapshot that already owns the optimistic transaction entry
        markPendingSearchWrite();
        setSearchWriteWatchKey(TRANSACTION_KEY);
        const snapshot = makeSearchResults(444);
        snapshot.data[TRANSACTION_KEY] = createMock<Transaction>({transactionID: TRANSACTION_ID, merchant: 'Server merchant'});

        // When Search sees the entry, then sees a split parent and a non-transaction watch key
        const existing = renderTracking(444, {searchResults: snapshot});
        const split = renderTracking(445, {transactions: {[TRANSACTION_KEY]: createMock<Transaction>({transactionID: TRANSACTION_ID, reportID: CONST.REPORT.SPLIT_REPORT_ID})}});
        setSearchWriteWatchKey(`${ONYXKEYS.COLLECTION.REPORT}123`);
        const invalid = renderTracking(446);

        // Then existing data is returned by identity and unsupported optimistic entries are absent
        expect(existing.result.current.searchDataWithOptimisticTransaction).toBe(snapshot.data);
        expect(split.result.current.searchDataWithOptimisticTransaction).not.toHaveProperty(TRANSACTION_KEY);
        expect(invalid.result.current.searchDataWithOptimisticTransaction).not.toHaveProperty(TRANSACTION_KEY);
        expect(invalid.result.current.trackingState.optimisticWatchKey).toBe(`${ONYXKEYS.COLLECTION.REPORT}123`);
    });

    it('swaps the first split child on rAF exactly once and cancels the scheduled frame', () => {
        // Given a split parent, two matching children and a captured animation frame
        markPendingSearchWrite();
        setSearchWriteWatchKey(TRANSACTION_KEY);
        const childKey = `${ONYXKEYS.COLLECTION.TRANSACTION}child` as const;
        const otherKey = `${ONYXKEYS.COLLECTION.TRANSACTION}other` as const;
        const splitTransactions: OnyxCollection<Transaction> = {
            [TRANSACTION_KEY]: createMock<Transaction>({transactionID: TRANSACTION_ID, reportID: CONST.REPORT.SPLIT_REPORT_ID}),
            [childKey]: createMock<Transaction>({transactionID: 'child', reportID: '1', comment: {originalTransactionID: TRANSACTION_ID}}),
            [otherKey]: createMock<Transaction>({transactionID: 'other', reportID: '1', comment: {originalTransactionID: TRANSACTION_ID}}),
        };
        let scheduledFrame: FrameRequestCallback | undefined;
        const requestFrame = jest.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => {
            scheduledFrame = callback;
            return 101;
        });
        const cancelFrame = jest.spyOn(globalThis, 'cancelAnimationFrame');

        // When the hook selects the child and the queued frame updates reactive state
        const trackingOverrides = {transactions: splitTransactions};
        const {result, rerender, unmount} = renderTracking(555, trackingOverrides);
        expect(result.current.trackingState.optimisticWatchKey).toBe(TRANSACTION_KEY);
        expect(result.current.trackingState.mutableRef.current.optimisticWatchKey).toBe(childKey);
        expect(scheduledFrame).toBeDefined();
        if (!scheduledFrame) {
            throw new Error('Expected a split-child animation frame');
        }
        const frame = scheduledFrame;
        act(() => frame(0));
        trackingOverrides.transactions = {
            ...splitTransactions,
            [childKey]: createMock<Transaction>({transactionID: 'child', reportID: CONST.REPORT.SPLIT_REPORT_ID}),
            [`${ONYXKEYS.COLLECTION.TRANSACTION}grandchild`]: createMock<Transaction>({transactionID: 'grandchild', reportID: '1', comment: {originalTransactionID: 'child'}}),
        };
        rerender({});
        unmount();

        // Then selection was first-match, only one swap occurred and cleanup cancelled its frame
        expect(result.current.trackingState.optimisticWatchKey).toBe(childKey);
        expect(result.current.trackingState.mutableRef.current.hasSwappedFromParent).toBe(true);
        expect(requestFrame).toHaveBeenCalledTimes(1);
        expect(cancelFrame).toHaveBeenCalledWith(101);
    });

    it('rejects an invalid first matching child without searching for another child', () => {
        // Given a malformed collection key before a valid matching child in enumeration order
        markPendingSearchWrite();
        setSearchWriteWatchKey(TRANSACTION_KEY);
        const child = createMock<Transaction>({transactionID: 'child', reportID: '1', comment: {originalTransactionID: TRANSACTION_ID}});
        const requestFrame = jest.spyOn(globalThis, 'requestAnimationFrame');

        // When the hook encounters that selected first child
        const {result} = renderTracking(666, {
            transactions: {
                [TRANSACTION_KEY]: createMock<Transaction>({transactionID: TRANSACTION_ID, reportID: CONST.REPORT.SPLIT_REPORT_ID}),
                [`${ONYXKEYS.COLLECTION.REPORT}wrong`]: child,
                [`${ONYXKEYS.COLLECTION.TRANSACTION}child`]: child,
            },
        });

        // Then the parent remains watched and no replacement is scheduled
        expect(result.current.trackingState.optimisticWatchKey).toBe(TRANSACTION_KEY);
        expect(result.current.trackingState.mutableRef.current.hasSwappedFromParent).toBe(false);
        expect(requestFrame).not.toHaveBeenCalled();
    });

    it('clears augmentation, rearms a later write and times out its placeholder', () => {
        // Given a mounted hook tracking the first pending write
        markPendingSearchWrite();
        setSearchWriteWatchKey(TRANSACTION_KEY);
        const {result} = renderTracking(777);

        // When tracking clears and a later write rearms it while Search remains mounted
        act(() => result.current.trackingState.clearOptimisticTracking());
        expect(result.current.searchDataWithOptimisticTransaction).not.toHaveProperty(TRANSACTION_KEY);
        expect(result.current.showPendingExpensePlaceholder).toBe(false);
        expect(result.current.trackingState.mutableRef.current.isCleanedUp).toBe(true);
        acquireSearchWriteBarrier();
        flushPendingSearchWrite();
        markPendingSearchWrite();
        setSearchWriteWatchKey(TRANSACTION_KEY);
        act(() => result.current.rearmTracking());
        expect(result.current.trackingState.isOptimisticTrackingCleared).toBe(false);
        expect(result.current.trackingState.mutableRef.current.isCleanedUp).toBe(false);
        expect(result.current.trackingState.mutableRef.current.hasSwappedFromParent).toBe(false);
        expect(result.current.searchDataWithOptimisticTransaction).toHaveProperty(TRANSACTION_KEY);
        expect(result.current.showPendingExpensePlaceholder).toBe(true);
        act(() => jest.advanceTimersByTime(10_000));

        // Then the safety timeout removes the placeholder without clearing the optimistic watch key
        expect(result.current.showPendingExpensePlaceholder).toBe(false);
        expect(result.current.trackingState.optimisticWatchKey).toBe(TRANSACTION_KEY);
    });

    it.each([false, true])('flushes unmount writes unless NAVIGATE_TO_SEARCH owns the follow-up: %s', async (isNavigatingToSearch) => {
        // Given an acquired production write barrier with a pending follow-up action
        markPendingSearchWrite();
        const barrier = acquireSearchWriteBarrier(TRANSACTION_KEY);
        let isReleased = false;
        barrier(new AbortController().signal).then(() => {
            isReleased = true;
        });
        jest.mocked(getPendingSubmitFollowUpAction).mockReturnValue(isNavigatingToSearch ? {followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH} : null);

        // When Search unmounts while its write is pending
        const {unmount} = renderTracking(888);
        unmount();
        await Promise.resolve();

        // Then ordinary unmount releases the write and the Search follow-up retains ownership
        expect(isReleased).toBe(!isNavigatingToSearch);
        expect(hasPendingSearchWrite()).toBe(isNavigatingToSearch);
    });
});

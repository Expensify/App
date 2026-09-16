import {renderHook} from '@testing-library/react-native';

import useBackfillWhenNoVisibleActions from '@hooks/useBackfillWhenNoVisibleActions';

type Params = Parameters<typeof useBackfillWhenNoVisibleActions>[0];

/** The stuck state from https://github.com/Expensify/App/issues/97574: a page of only deleted actions, older pages still fetchable. */
function getStuckParams(overrides: Partial<Params> = {}): Params {
    return {
        reportID: 'report1',
        isMissingReportActions: true,
        hasOlderActions: true,
        hasNewerActions: false,
        isOffline: false,
        isReportLoadPending: false,
        isLoadingOlderReportActions: false,
        hasLoadingOlderReportActionsError: false,
        oldestReportActionID: 'action31',
        loadOlderChats: jest.fn(),
        ...overrides,
    };
}

describe('useBackfillWhenNoVisibleActions', () => {
    it('loads older chats when the chain has no visible actions but older pages are fetchable', () => {
        const params = getStuckParams();

        renderHook(() => useBackfillWhenNoVisibleActions(params));

        expect(params.loadOlderChats).toHaveBeenCalledTimes(1);
    });

    it('does not fire again while the oldest action is unchanged', () => {
        const params = getStuckParams();

        const {rerender} = renderHook(() => useBackfillWhenNoVisibleActions(params));
        rerender({});
        rerender({});

        expect(params.loadOlderChats).toHaveBeenCalledTimes(1);
    });

    it('fires again once the response advances the oldest action', () => {
        const loadOlderChats = jest.fn();
        let params = getStuckParams({loadOlderChats});

        const {rerender} = renderHook(() => useBackfillWhenNoVisibleActions(params));
        params = getStuckParams({loadOlderChats, oldestReportActionID: 'action62'});
        rerender({});

        expect(loadOlderChats).toHaveBeenCalledTimes(2);
    });

    it('re-arms for a different report', () => {
        const loadOlderChats = jest.fn();
        let params = getStuckParams({loadOlderChats});

        const {rerender} = renderHook(() => useBackfillWhenNoVisibleActions(params));
        params = getStuckParams({loadOlderChats, reportID: 'report2'});
        rerender({});

        expect(loadOlderChats).toHaveBeenCalledTimes(2);
    });

    it('retries the same cursor once after a failed request, so one transient failure does not strand the report', () => {
        const loadOlderChats = jest.fn();
        let params = getStuckParams({loadOlderChats});

        const {rerender} = renderHook(() => useBackfillWhenNoVisibleActions(params));
        // The request failed: getOlderActions burned the cursor without advancing it.
        params = getStuckParams({loadOlderChats, hasLoadingOlderReportActionsError: true});
        rerender({});

        expect(loadOlderChats).toHaveBeenCalledTimes(2);
    });

    it('gives up after the retry fails, rather than spinning on a request that keeps failing', () => {
        const loadOlderChats = jest.fn();
        let params = getStuckParams({loadOlderChats});

        const {rerender} = renderHook(() => useBackfillWhenNoVisibleActions(params));
        params = getStuckParams({loadOlderChats, hasLoadingOlderReportActionsError: true});
        rerender({});
        rerender({});
        rerender({});

        expect(loadOlderChats).toHaveBeenCalledTimes(2);
    });

    it('allows a fresh cursor its own retry once the chain advances', () => {
        const loadOlderChats = jest.fn();
        let params = getStuckParams({loadOlderChats, hasLoadingOlderReportActionsError: true});

        const {rerender} = renderHook(() => useBackfillWhenNoVisibleActions(params));
        params = getStuckParams({loadOlderChats, oldestReportActionID: 'action62', hasLoadingOlderReportActionsError: true});
        rerender({});

        expect(loadOlderChats).toHaveBeenCalledTimes(2);
    });

    it.each([
        ['visible actions are present', {isMissingReportActions: false}],
        ['there are no older actions to fetch', {hasOlderActions: false}],
        ['the chain sits in the middle of the history, so the visible actions may be on the newer side', {hasNewerActions: true}],
        ['offline', {isOffline: true}],
        ['an OpenReport request is still pending', {isReportLoadPending: true}],
        ['an older-actions request is already in flight', {isLoadingOlderReportActions: true}],
        ['there is no action to use as a cursor', {oldestReportActionID: undefined}],
    ])('does not load older chats when %s', (_case, overrides: Partial<Params>) => {
        const params = getStuckParams(overrides);

        renderHook(() => useBackfillWhenNoVisibleActions(params));

        expect(params.loadOlderChats).not.toHaveBeenCalled();
    });
});

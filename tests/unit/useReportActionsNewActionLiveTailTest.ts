import {act, renderHook, waitFor} from '@testing-library/react-native';

import {FALLBACK_NAVIGATION_CONTEXT_VALUE} from '@components/withNavigationFallback';

import useReportActionsNewActionLiveTail from '@pages/inbox/report/useReportActionsNewActionLiveTail';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import {millisecondsInWeek} from 'date-fns/constants';
import Onyx from 'react-native-onyx';

import {createMockReport, getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const mockNavigationSetParams = jest.fn();
const mockGlobalSetParams = jest.fn();
const mockOpenReport = jest.fn<void, [{liveTailRequestID: string}]>();
const mockLogAlert = jest.fn();
let newActionHandler: ((isFromCurrentUser: boolean, action: ReportAction | undefined, source: 'local' | 'realtime') => void) | undefined;

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        alert: (...args: unknown[]) => {
            mockLogAlert(...args);
        },
        hmmm: jest.fn(),
        info: jest.fn(),
    },
}));

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({accountID: 1}),
}));

let mockNavigation: Record<string, unknown> = {setParams: mockNavigationSetParams, getState: () => ({key: 'stack-report'})};
let mockIsInSidePanel = false;

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<Record<string, unknown>>('@react-navigation/native'),
    useNavigation: () => mockNavigation,
}));

jest.mock('@hooks/useIsInSidePanel', () => ({
    __esModule: true,
    default: () => mockIsInSidePanel,
}));

jest.mock('@libs/Navigation/helpers/isReportTopmostSplitNavigator', () => ({
    __esModule: true,
    default: () => true,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        getReportRHPActiveRoute: () => undefined,
        setParams: (...args: unknown[]) => {
            mockGlobalSetParams(...args);
        },
    },
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: ({callback}: {callback: () => void}) => callback(),
    },
}));

jest.mock('@libs/actions/Report', () => ({
    openReport: (params: {liveTailRequestID: string}) => {
        mockOpenReport(params);
    },
    clearLiveTailRequestResult: jest.fn(),
    pruneExpiredLiveTailResults: jest.fn(),
    pruneReportActionPagesToNewestWindow: jest.fn(),
}));

jest.mock('@libs/actions/Report/reportActionSubscribers', () => ({
    subscribeToNewActionEvent: (_reportID: string, callback: (isFromCurrentUser: boolean, action: ReportAction | undefined, source: 'local' | 'realtime') => void) => {
        newActionHandler = callback;
        return jest.fn();
    },
}));

type HookParams = Parameters<typeof useReportActionsNewActionLiveTail>[0];

const reportScrollManager = {
    scrollToBottom: jest.fn(),
    scrollToIndex: jest.fn(),
    scrollToOffset: jest.fn(),
};

const newestRow = getFakeReportAction(1);
const loadedNewestPage = {settled: true, newestActionID: newestRow.reportActionID};

function lastLiveTailRequestID() {
    const request = mockOpenReport.mock.lastCall?.[0];
    if (!request) {
        throw new Error('Expected a live-tail OpenReport');
    }
    return request.liveTailRequestID;
}

function buildParams(overrides: Partial<HookParams> = {}): HookParams {
    return {
        reportID: '1',
        policyID: undefined,
        isOffline: false,
        reportScrollManager,
        setIsFloatingMessageCounterVisible: jest.fn(),
        unreadMarkerReportActionID: null,
        hasNewerActions: true,
        linkedReportActionID: undefined,
        hasNewestReportAction: false,
        renderedVisibleReportActions: [],
        sortedAllReportActionsForPagination: [newestRow],
        reportActionPages: [[CONST.PAGINATION_START_ID, newestRow.reportActionID]],
        setTreatAsNoPaginationAnchor: jest.fn(),
        treatAsNoPaginationAnchor: false,
        liveTailRequestResults: undefined,
        ...overrides,
    };
}

describe('useReportActionsNewActionLiveTail', () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        newActionHandler = undefined;
        mockNavigation = {setParams: mockNavigationSetParams, getState: () => ({key: 'stack-report'})};
        mockIsInSidePanel = false;
    });

    it.each([false, true])('reaches the cached newest window offline when in side panel is %s', async (isInSidePanel) => {
        // Given an offline report whose newest cached page does not contain the newest server message.
        mockIsInSidePanel = isInSidePanel;
        const linkedAction = getFakeReportAction(2);
        const newestCachedAction = getFakeReportAction(3);
        const params = buildParams({
            isOffline: true,
            linkedReportActionID: linkedAction.reportActionID,
            renderedVisibleReportActions: [linkedAction],
            sortedAllReportActionsForPagination: [newestCachedAction, linkedAction],
            reportActionPages: [[newestCachedAction.reportActionID], [linkedAction.reportActionID]],
        });
        const {result, rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: params});

        // When Latest messages is pressed, release the anchor locally instead of waiting for OpenReport.
        act(() => result.current.requestLiveTailJump());
        expect(mockOpenReport).not.toHaveBeenCalled();
        expect(params.setTreatAsNoPaginationAnchor).toHaveBeenCalledWith(true);
        expect(mockNavigationSetParams).not.toHaveBeenCalled();
        expect(mockGlobalSetParams).not.toHaveBeenCalled();
        expect(result.current.isScrollToBottomEnabled).toBe(false);

        // Then request the scroll after the cached newest window enters the list.
        const newestCachedParams = {...params, linkedReportActionID: '', treatAsNoPaginationAnchor: true, renderedVisibleReportActions: [newestCachedAction]};
        rerender(newestCachedParams);
        expect(mockNavigationSetParams).toHaveBeenCalledTimes(isInSidePanel ? 0 : 1);
        await waitFor(() => expect(result.current.isScrollToBottomEnabled).toBe(true));
        act(() => {
            result.current.setIsScrollToBottomEnabled(false);
            result.current.completeLiveTailPruneAfterScrollToBottom();
        });
        expect(params.setTreatAsNoPaginationAnchor).toHaveBeenLastCalledWith(false);

        // When the reader scrolls away and presses Latest messages again, the completed jump must not block it.
        rerender({...newestCachedParams, treatAsNoPaginationAnchor: false});
        act(() => result.current.requestLiveTailJump());
        expect(result.current.isScrollToBottomEnabled).toBe(false);
        expect(params.setTreatAsNoPaginationAnchor).toHaveBeenLastCalledWith(true);
        rerender(newestCachedParams);

        // Then another local scroll is requested without ever needing the uncached server message.
        await waitFor(() => expect(result.current.isScrollToBottomEnabled).toBe(true));
    });

    it('waits for the newest page before requesting the Latest messages scroll', async () => {
        // Given a historical page, with its linked action still anchoring pagination.
        const params = buildParams({linkedReportActionID: 'old-action'});
        const {result, rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: params});

        // When Latest messages is pressed repeatedly while its request is pending.
        act(() => {
            result.current.requestLiveTailJump();
            result.current.requestLiveTailJump();
        });
        await waitForBatchedUpdates();
        expect(mockOpenReport).toHaveBeenCalledTimes(1);
        expect(result.current.isScrollToBottomEnabled).toBe(false);
        expect(mockNavigationSetParams).not.toHaveBeenCalled();

        // Then the link stays until the newest row is present in the selected page.
        const loadedParams = {...params, liveTailRequestResults: {[lastLiveTailRequestID()]: loadedNewestPage}};
        rerender(loadedParams);
        expect(mockNavigationSetParams).not.toHaveBeenCalled();
        expect(mockGlobalSetParams).not.toHaveBeenCalled();
        expect(result.current.isScrollToBottomEnabled).toBe(false);

        rerender({...loadedParams, treatAsNoPaginationAnchor: true});
        expect(mockNavigationSetParams).not.toHaveBeenCalled();
        expect(params.setTreatAsNoPaginationAnchor).toHaveBeenLastCalledWith(true);
        rerender({...loadedParams, treatAsNoPaginationAnchor: true, hasNewestReportAction: true});
        expect(mockNavigationSetParams).toHaveBeenCalledWith({reportActionID: '', reportActionAlignment: undefined});
        await act(async () => Promise.resolve());
        expect(result.current.isScrollToBottomEnabled).toBe(true);
        act(() => {
            result.current.setIsScrollToBottomEnabled(false);
            result.current.completeLiveTailPruneAfterScrollToBottom();
        });
        rerender({...loadedParams, linkedReportActionID: '', hasNewestReportAction: true});
        expect(result.current.isScrollToBottomEnabled).toBe(false);
        expect(mockOpenReport).toHaveBeenCalledTimes(1);
    });

    it('requests one post-render scroll once the sent comment is rendered', () => {
        const action = getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT});
        const {result, rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {
            initialProps: buildParams({hasNewerActions: false, hasNewestReportAction: true}),
        });

        act(() => {
            newActionHandler?.(true, action, 'local');
        });

        expect(result.current.isScrollToBottomEnabled).toBe(false);
        expect(reportScrollManager.scrollToBottom).not.toHaveBeenCalled();

        rerender(buildParams({hasNewerActions: false, hasNewestReportAction: true, renderedVisibleReportActions: [action]}));

        expect(result.current.isScrollToBottomEnabled).toBe(true);
    });

    it('clears a pending sent-comment scroll when switching reports', () => {
        // Given a sent action that has not entered the rendered page yet.
        const action = getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT});
        const params = buildParams({hasNewerActions: false, hasNewestReportAction: true});
        const {result, rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: params});
        act(() => newActionHandler?.(true, action, 'local'));

        // When the reader switches reports and returns before the timeout, with the row now loaded.
        rerender({...params, reportID: '2'});
        rerender({...params, renderedVisibleReportActions: [action]});

        // Then the old send request does not reclaim the viewport.
        expect(result.current.isScrollToBottomEnabled).toBe(false);
    });

    it('does not scroll for a payload-less realtime echo', () => {
        const {result} = renderHook(() => useReportActionsNewActionLiveTail(buildParams({hasNewerActions: false, hasNewestReportAction: true})));

        act(() => {
            newActionHandler?.(true, undefined, 'realtime');
        });

        expect(result.current.isScrollToBottomEnabled).toBe(false);
        expect(mockOpenReport).not.toHaveBeenCalled();
    });

    it('keeps the live-tail jump for a local action without a report action payload', async () => {
        // Given a report showing an older page
        renderHook(() => useReportActionsNewActionLiveTail(buildParams()));

        // When a local money request sends a payload-less notification
        act(() => {
            newActionHandler?.(true, undefined, 'local');
        });
        await waitForBatchedUpdates();

        // Then the report opens its latest page
        expect(mockOpenReport).toHaveBeenCalledTimes(1);
    });

    it('expires a sent-comment scroll request when the action never enters the list', () => {
        // Given a sent action that is filtered out or fails to appear
        jest.useFakeTimers();
        const action = getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT});
        const {result, rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {
            initialProps: buildParams({hasNewerActions: false, hasNewestReportAction: true}),
        });
        act(() => {
            newActionHandler?.(true, action, 'local');
        });

        // When the action finally appears well after the send attempt
        act(() => {
            jest.advanceTimersByTime(10000);
        });
        rerender(buildParams({hasNewerActions: false, hasNewestReportAction: true, renderedVisibleReportActions: [action]}));

        // Then the stale request does not pull the reader to the bottom
        expect(result.current.isScrollToBottomEnabled).toBe(false);
        jest.useRealTimers();
    });

    it('does not queue a bottom scroll that would compete with a report-preview target', () => {
        const preview = getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW});
        const {result} = renderHook(() => useReportActionsNewActionLiveTail(buildParams({hasNewerActions: false, hasNewestReportAction: true, renderedVisibleReportActions: [preview]})));

        act(() => {
            newActionHandler?.(true, preview, 'local');
        });

        expect(reportScrollManager.scrollToBottom).toHaveBeenCalledTimes(1);
        expect(result.current.isScrollToBottomEnabled).toBe(false);
    });

    it('shows the cached newest window when sending offline from a linked action', () => {
        // Given an older linked action while offline.
        const params = buildParams({isOffline: true, linkedReportActionID: '2'});
        const action = getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT});
        const {result, rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: params});

        // When the current user sends a comment, release the old pagination anchor without a request.
        act(() => newActionHandler?.(true, action, 'local'));
        expect(params.setTreatAsNoPaginationAnchor).toHaveBeenLastCalledWith(true);
        expect(mockNavigationSetParams.mock.calls).toEqual([[{reportActionID: '', reportActionAlignment: undefined}]]);
        expect(mockOpenReport).not.toHaveBeenCalled();
        expect(result.current.isScrollToBottomEnabled).toBe(false);

        // Then scroll only after the chronological list contains the sent comment, and release the override afterwards.
        rerender({...params, linkedReportActionID: '', treatAsNoPaginationAnchor: true, hasNewestReportAction: true, renderedVisibleReportActions: [action]});
        expect(result.current.isScrollToBottomEnabled).toBe(true);
        act(() => result.current.completeLiveTailPruneAfterScrollToBottom());
        expect(params.setTreatAsNoPaginationAnchor).toHaveBeenLastCalledWith(false);
    });

    it('reads the openReport inputs from Onyx for the catch-up openReport call', async () => {
        // Given the Concierge chat, onboarding, intro, session and full policy snapshot in Onyx. The hook subscribes to none
        // of them, so it must read them when the jump happens for the guided setup data openReport builds.
        const conciergeChat = createMockReport({reportID: 'concierge-live-tail-1'});
        await Onyx.set(ONYXKEYS.CONCIERGE_REPORT_ID, conciergeChat.reportID);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${conciergeChat.reportID}`, conciergeChat);
        await Onyx.set(ONYXKEYS.NVP_ONBOARDING, {selfTourViewed: true, hasCompletedGuidedSetupFlow: false});
        await Onyx.set(ONYXKEYS.NVP_INTRO_SELECTED, {choice: CONST.ONBOARDING_CHOICES.EMPLOYER});
        await Onyx.set(ONYXKEYS.SESSION, {accountID: 42});
        await Onyx.set(`${ONYXKEYS.COLLECTION.RAM_ONLY_FULL_POLICY_SNAPSHOT}policy-1`, {lastModified: 123});
        renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams({policyID: 'policy-1'})});

        // When the current user sends a comment while the newest actions are not loaded
        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}), 'local');
        });
        await waitForBatchedUpdates();

        // Then the catch-up openReport receives each value as it was in Onyx, with the selectors applied
        expect(mockOpenReport).toHaveBeenCalledWith(
            expect.objectContaining({
                conciergeChat: expect.objectContaining({reportID: conciergeChat.reportID}),
                introSelected: expect.objectContaining({choice: CONST.ONBOARDING_CHOICES.EMPLOYER}),
                isSelfTourViewed: true,
                hasCompletedGuidedSetupFlow: false,
                currentUserAccountID: 42,
                fullPolicySnapshot: {policyID: 'policy-1', lastModified: 123},
            }),
        );
    });

    it('returns the live-tail request that the "Latest messages" pill reuses', async () => {
        // Given the hook for report 1. The pill in useReportActionsScroll calls this request instead of reading the openReport inputs itself.
        const {result} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams()});

        // When the pill requests the live tail
        act(() => {
            result.current.requestLiveTailJump();
        });
        await waitForBatchedUpdates();

        // Then openReport runs once, for this report
        expect(mockOpenReport).toHaveBeenCalledTimes(1);
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: '1'}));
    });

    it('lets a suspended tab retry after another reader could have removed its expired result', async () => {
        // Given End requested the latest page before the reader suspended this tab.
        const clock = jest.spyOn(Date, 'now');
        const start = Date.now();
        try {
            clock.mockReturnValue(start);
            const {result} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams({linkedReportActionID: '2'})});
            act(() => result.current.requestLiveTailJump());
            await waitForBatchedUpdates();
            const previousID = lastLiveTailRequestID();
            act(() => result.current.requestLiveTailJump());
            expect(mockOpenReport).toHaveBeenCalledTimes(1);

            // When the reader resumes after the retention period and presses End again.
            clock.mockReturnValue(start + millisecondsInWeek);
            act(() => result.current.requestLiveTailJump());
            await waitForBatchedUpdates();

            // Then another request can finish the jump, and the historical link stays until it succeeds.
            expect(mockOpenReport).toHaveBeenCalledTimes(2);
            expect(lastLiveTailRequestID()).not.toBe(previousID);
            expect(mockNavigationSetParams).not.toHaveBeenCalled();
        } finally {
            clock.mockRestore();
        }
    });

    it('keeps the historical link when an earlier request succeeds and the latest-page request fails', async () => {
        // Given the reader presses End while another OpenReport for this chat is in flight.
        const params = buildParams({linkedReportActionID: '2'});
        const {result, rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: params});
        act(() => result.current.requestLiveTailJump());
        await waitForBatchedUpdates();
        const firstRequestID = lastLiveTailRequestID();

        // When the earlier request succeeds, End must keep waiting for its own response.
        rerender({...params, liveTailRequestResults: {earlier: loadedNewestPage}});
        expect(mockNavigationSetParams).not.toHaveBeenCalled();
        expect(params.setTreatAsNoPaginationAnchor).not.toHaveBeenCalled();
        rerender({...params, liveTailRequestResults: {[firstRequestID]: {settled: true}}});

        // Then the link stays open and another End press can fetch the latest page.
        expect(mockNavigationSetParams).not.toHaveBeenCalled();
        act(() => result.current.requestLiveTailJump());
        await waitForBatchedUpdates();
        const retryRequestID = lastLiveTailRequestID();
        expect(mockOpenReport).toHaveBeenCalledTimes(2);
        expect(retryRequestID).not.toBe(firstRequestID);
        rerender({...params, liveTailRequestResults: {[firstRequestID]: {settled: true}, [retryRequestID]: loadedNewestPage}, treatAsNoPaginationAnchor: true, hasNewestReportAction: true});
        expect(mockNavigationSetParams).toHaveBeenCalledWith({reportActionID: '', reportActionAlignment: undefined});
    });

    it('keeps End retryable when a committed newest page is still unavailable to the reader', async () => {
        // Given a historical page and an outstanding latest-page request.
        const params = buildParams({reportActionPages: [['old']], linkedReportActionID: 'old'});
        const {result, rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: params});
        act(() => result.current.requestLiveTailJump());
        await waitForBatchedUpdates();

        // When another tab has committed the newest page but it is still absent here, the reader can press End again.
        rerender({...params, liveTailRequestResults: {[lastLiveTailRequestID()]: loadedNewestPage}});
        act(() => result.current.requestLiveTailJump());
        await waitForBatchedUpdates();

        // Then the link stays in place and the second request reaches the queue.
        expect(mockNavigationSetParams).not.toHaveBeenCalled();
        expect(mockOpenReport).toHaveBeenCalledTimes(2);
    });

    it('waits for the requested action on the follower even when cached report metadata matches an older row', async () => {
        // Given a follower with an internally consistent but outdated copy of the newest page.
        const oldRow = getFakeReportAction(1);
        const newRow = getFakeReportAction(2);
        const params = buildParams({
            linkedReportActionID: 'linked',
            reportActionPages: [[CONST.PAGINATION_START_ID, oldRow.reportActionID]],
            sortedAllReportActionsForPagination: [oldRow],
            renderedVisibleReportActions: [oldRow],
        });
        const {result, rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: params});
        act(() => result.current.requestLiveTailJump());
        await waitForBatchedUpdates();

        // When the leader's receipt arrives first, then the new page keys arrive before the corresponding row.
        const settled = {
            ...params,
            liveTailRequestResults: {[lastLiveTailRequestID()]: {settled: true, newestActionID: newRow.reportActionID}},
            hasNewestReportAction: true,
            treatAsNoPaginationAnchor: true,
        };
        rerender(settled);
        expect(mockNavigationSetParams).not.toHaveBeenCalled();
        const newPage = {...settled, reportActionPages: [[CONST.PAGINATION_START_ID, newRow.reportActionID]]};
        rerender(newPage);
        expect(mockNavigationSetParams).not.toHaveBeenCalled();

        // Then the link clears only after the action from this response is available to the rendered window.
        rerender({...newPage, sortedAllReportActionsForPagination: [newRow, oldRow], renderedVisibleReportActions: [oldRow, newRow]});
        await waitFor(() => expect(result.current.isScrollToBottomEnabled).toBe(true));
        expect(mockNavigationSetParams).toHaveBeenCalledWith({reportActionID: '', reportActionAlignment: undefined});
    });

    it('keeps the historical link retryable when the cached newest page is stale', async () => {
        // Given a linked chat with a cached newest-page marker and a newer message still missing.
        const params = buildParams({linkedReportActionID: 'old', reportActionPages: [[CONST.PAGINATION_START_ID, 'stale'], ['old']]});
        const {result, rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: params});
        act(() => result.current.requestLiveTailJump());
        await waitForBatchedUpdates();

        // When the first request settles without updating the cached page.
        const settled = {...params, liveTailRequestResults: {[lastLiveTailRequestID()]: {settled: true}}};
        rerender(settled);

        // Then the historical route survives and another End press can fetch the missing message.
        expect(mockNavigationSetParams).not.toHaveBeenCalled();
        expect(params.setTreatAsNoPaginationAnchor).not.toHaveBeenCalled();
        expect(result.current.isScrollToBottomEnabled).toBe(false);
        act(() => result.current.requestLiveTailJump());
        await waitForBatchedUpdates();
        expect(mockOpenReport).toHaveBeenCalledTimes(2);
    });

    it('clears the report screen param after loading the live tail without changing the focused route', async () => {
        const {rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams()});

        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}), 'local');
        });
        await waitForBatchedUpdates();

        expect(mockOpenReport).toHaveBeenCalledTimes(1);

        rerender(buildParams({liveTailRequestResults: {[lastLiveTailRequestID()]: loadedNewestPage}, treatAsNoPaginationAnchor: true, hasNewestReportAction: true}));

        expect(mockNavigationSetParams).toHaveBeenCalledWith({reportActionID: '', reportActionAlignment: undefined});
        expect(mockGlobalSetParams).not.toHaveBeenCalled();
    });

    it('does not throw and still advances the live-tail jump when navigation is the withNavigationFallback stub', async () => {
        // No NavigationContext in the side panel tree, so `useNavigation` resolves to the fallback stub.
        mockNavigation = {...FALLBACK_NAVIGATION_CONTEXT_VALUE};
        const setTreatAsNoPaginationAnchor = jest.fn();
        const {rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams({setTreatAsNoPaginationAnchor})});

        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}), 'local');
        });
        await waitForBatchedUpdates();

        expect(() =>
            rerender(
                buildParams({
                    setTreatAsNoPaginationAnchor,
                    liveTailRequestResults: {[lastLiveTailRequestID()]: loadedNewestPage},
                }),
            ),
        ).not.toThrow();

        expect(setTreatAsNoPaginationAnchor).toHaveBeenCalledWith(true);
    });

    it('skips the setParams dispatch in the side panel but still advances the live-tail jump', async () => {
        mockIsInSidePanel = true;
        const setTreatAsNoPaginationAnchor = jest.fn();
        const {rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams({setTreatAsNoPaginationAnchor})});

        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}), 'local');
        });
        await waitForBatchedUpdates();

        rerender(
            buildParams({
                setTreatAsNoPaginationAnchor,
                liveTailRequestResults: {[lastLiveTailRequestID()]: loadedNewestPage},
            }),
        );

        expect(mockGlobalSetParams).not.toHaveBeenCalled();
        expect(mockNavigationSetParams).not.toHaveBeenCalled();
        expect(setTreatAsNoPaginationAnchor).toHaveBeenCalledWith(true);
    });

    it('scrolls straight to the bottom when an unread marker is set but the newest actions are already loaded', async () => {
        // Given a report scrolled up with an unread marker from another user's comment, and the newest actions already loaded
        const setIsFloatingMessageCounterVisible = jest.fn();
        const action = getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT});
        const {result, rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {
            initialProps: buildParams({unreadMarkerReportActionID: '2', hasNewerActions: false, hasNewestReportAction: true, setIsFloatingMessageCounterVisible}),
        });

        // When the current user sends a comment
        act(() => {
            newActionHandler?.(true, action, 'local');
        });
        await waitForBatchedUpdates();

        // Then the caller receives a scroll request once the optimistic row renders, without an openReport round trip.
        expect(mockOpenReport).not.toHaveBeenCalled();
        expect(setIsFloatingMessageCounterVisible).toHaveBeenCalledWith(false);
        expect(result.current.isScrollToBottomEnabled).toBe(false);
        rerender(buildParams({unreadMarkerReportActionID: '2', hasNewerActions: false, hasNewestReportAction: true, renderedVisibleReportActions: [action]}));
        expect(result.current.isScrollToBottomEnabled).toBe(true);
    });

    it('still loads the live tail when an unread marker is set and the newest actions are not loaded', async () => {
        // Given an unread marker and a report whose newest actions are not loaded yet
        renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {
            initialProps: buildParams({unreadMarkerReportActionID: '2', hasNewerActions: false, hasNewestReportAction: false}),
        });

        // When the current user sends a comment
        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}), 'local');
        });
        await waitForBatchedUpdates();

        // Then openReport fetches the newest actions before the list scrolls
        expect(mockOpenReport).toHaveBeenCalledTimes(1);
        expect(reportScrollManager.scrollToBottom).not.toHaveBeenCalled();
    });
});

describe('withNavigationFallback stub', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('reports every swallowed navigation call at alert level so it is findable in Sentry', () => {
        // Given a tree rendered outside a navigator screen, where every navigation action is inert
        FALLBACK_NAVIGATION_CONTEXT_VALUE.setParams({reportActionID: ''});
        FALLBACK_NAVIGATION_CONTEXT_VALUE.goBack();

        // Then each swallowed call is reported with the method that was called, so it cannot pass unnoticed
        expect(mockLogAlert).toHaveBeenCalledWith('[withNavigationFallback] ignored navigation.setParams() outside a navigator screen', {method: 'setParams'});
        expect(mockLogAlert).toHaveBeenCalledWith('[withNavigationFallback] ignored navigation.goBack() outside a navigator screen', {method: 'goBack'});
    });

    it('stays silent for the state-shaped reads, which have a meaningful inert answer', () => {
        // Given the state-shaped members of the stub
        FALLBACK_NAVIGATION_CONTEXT_VALUE.getState();
        FALLBACK_NAVIGATION_CONTEXT_VALUE.getParent();
        FALLBACK_NAVIGATION_CONTEXT_VALUE.canGoBack();
        FALLBACK_NAVIGATION_CONTEXT_VALUE.isFocused();

        // Then nothing is reported - unlike an action, a read that returns "no navigator" is not a mistake
        expect(mockLogAlert).not.toHaveBeenCalled();
    });

    it('exposes callable navigation methods that do not throw', () => {
        expect(() => FALLBACK_NAVIGATION_CONTEXT_VALUE.setParams({reportActionID: ''})).not.toThrow();
        expect(() => FALLBACK_NAVIGATION_CONTEXT_VALUE.navigate('Report')).not.toThrow();
        expect(() => FALLBACK_NAVIGATION_CONTEXT_VALUE.goBack()).not.toThrow();
        expect(() => FALLBACK_NAVIGATION_CONTEXT_VALUE.dispatch({type: 'NOOP'})).not.toThrow();
        expect(FALLBACK_NAVIGATION_CONTEXT_VALUE.getState()).toBeUndefined();
        expect(FALLBACK_NAVIGATION_CONTEXT_VALUE.getParent()).toBeUndefined();
        expect(FALLBACK_NAVIGATION_CONTEXT_VALUE.canGoBack()).toBe(false);
    });
});

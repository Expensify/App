import {act, renderHook} from '@testing-library/react-native';

import {FALLBACK_NAVIGATION_CONTEXT_VALUE} from '@components/withNavigationFallback';

import useReportActionsNewActionLiveTail from '@pages/inbox/report/useReportActionsNewActionLiveTail';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import {getFakeReportAction} from '../utils/ReportTestUtils';

const mockNavigationSetParams = jest.fn();
const mockGlobalSetParams = jest.fn();
const mockOpenReport = jest.fn();
const mockLogAlert = jest.fn();
let newActionHandler: ((isFromCurrentUser: boolean, action?: ReportAction) => void) | undefined;

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
    openReport: (...args: unknown[]) => {
        mockOpenReport(...args);
    },
    pruneReportActionPagesToNewestWindow: jest.fn(),
}));

jest.mock('@libs/actions/Report/reportActionSubscribers', () => ({
    subscribeToNewActionEvent: (_reportID: string, callback: (isFromCurrentUser: boolean, action?: ReportAction) => void) => {
        newActionHandler = callback;
        return jest.fn();
    },
}));

type HookParams = Parameters<typeof useReportActionsNewActionLiveTail>[0];

const reportScrollManager = {
    scrollToBottom: jest.fn(),
    scrollToIndex: jest.fn(),
    scrollToEnd: jest.fn(),
    scrollToOffset: jest.fn(),
};

function buildParams(overrides: Partial<HookParams> = {}): HookParams {
    return {
        reportID: '1',
        introSelected: undefined,
        conciergeChat: undefined,
        isSelfTourViewed: undefined,
        hasCompletedGuidedSetupFlow: undefined,
        isOffline: false,
        reportScrollManager,
        setIsFloatingMessageCounterVisible: jest.fn(),
        setActionIdToHighlight: jest.fn(),
        unreadMarkerReportActionID: null,
        hasNewerActions: true,
        linkedReportActionID: undefined,
        hasNewestReportAction: false,
        sortedVisibleReportActions: [],
        sortedAllReportActionsForPagination: [],
        reportActionPages: undefined,
        setTreatAsNoPaginationAnchor: jest.fn(),
        treatAsNoPaginationAnchor: false,
        prevIsLoadingInitialReportActions: false,
        reportLoadingState: {isLoadingInitialReportActions: true},
        ...overrides,
    };
}

describe('useReportActionsNewActionLiveTail', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        newActionHandler = undefined;
        mockNavigation = {setParams: mockNavigationSetParams, getState: () => ({key: 'stack-report'})};
        mockIsInSidePanel = false;
    });

    it('shows the cached newest window when sending offline from a linked action', () => {
        // Given an older linked action while offline
        const params = buildParams({isOffline: true, linkedReportActionID: '2'});
        const {result} = renderHook(() => useReportActionsNewActionLiveTail(params));
        // When the current user sends a comment
        act(() => newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT})));
        // Then reveal the cached live tail and release the override after scrolling
        expect(params.setTreatAsNoPaginationAnchor).toHaveBeenLastCalledWith(true);
        expect(mockNavigationSetParams.mock.calls).toEqual([[{reportActionID: ''}]]);
        act(() => result.current.completeLiveTailPruneAfterScrollToBottom());
        expect(params.setTreatAsNoPaginationAnchor).toHaveBeenLastCalledWith(false);
    });

    it('threads the conciergeChat report through to the catch-up openReport call', () => {
        const conciergeChat = {reportID: 'concierge-live-tail-1'};
        renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams({conciergeChat})});

        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}));
        });

        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({conciergeChat}));
    });

    it('threads the onboarding status through to the catch-up openReport call', () => {
        renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams({isSelfTourViewed: true, hasCompletedGuidedSetupFlow: false})});

        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}));
        });

        // The onboarding flags are threaded straight through so guided-setup optimistic data is derived from real Onyx
        // data supplied by the caller instead of the deprecated module-level fallback.
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({isSelfTourViewed: true, hasCompletedGuidedSetupFlow: false}));
    });

    it('clears the report screen param after loading the live tail without changing the focused route', () => {
        const {rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams()});

        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}));
        });

        expect(mockOpenReport).toHaveBeenCalledTimes(1);

        rerender(
            buildParams({
                prevIsLoadingInitialReportActions: true,
                reportLoadingState: {isLoadingInitialReportActions: false},
            }),
        );

        expect(mockNavigationSetParams).toHaveBeenCalledWith({reportActionID: ''});
        expect(mockGlobalSetParams).not.toHaveBeenCalled();
    });

    it('does not throw and still advances the live-tail jump when navigation is the withNavigationFallback stub', () => {
        // No NavigationContext in the side panel tree, so `useNavigation` resolves to the fallback stub.
        mockNavigation = {...FALLBACK_NAVIGATION_CONTEXT_VALUE};
        const setTreatAsNoPaginationAnchor = jest.fn();
        const {rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams({setTreatAsNoPaginationAnchor})});

        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}));
        });

        expect(() =>
            rerender(
                buildParams({
                    setTreatAsNoPaginationAnchor,
                    prevIsLoadingInitialReportActions: true,
                    reportLoadingState: {isLoadingInitialReportActions: false},
                }),
            ),
        ).not.toThrow();

        expect(setTreatAsNoPaginationAnchor).toHaveBeenCalledWith(true);
    });

    it('skips the setParams dispatch in the side panel but still advances the live-tail jump', () => {
        mockIsInSidePanel = true;
        const setTreatAsNoPaginationAnchor = jest.fn();
        const {rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams({setTreatAsNoPaginationAnchor})});

        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}));
        });

        rerender(
            buildParams({
                setTreatAsNoPaginationAnchor,
                prevIsLoadingInitialReportActions: true,
                reportLoadingState: {isLoadingInitialReportActions: false},
            }),
        );

        expect(mockGlobalSetParams).not.toHaveBeenCalled();
        expect(mockNavigationSetParams).not.toHaveBeenCalled();
        expect(setTreatAsNoPaginationAnchor).toHaveBeenCalledWith(true);
    });

    it('scrolls straight to the bottom when an unread marker is set but the newest actions are already loaded', () => {
        // Given a report scrolled up with an unread marker from another user's comment, and the newest actions already loaded
        const setIsFloatingMessageCounterVisible = jest.fn();
        const {result} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {
            initialProps: buildParams({unreadMarkerReportActionID: '2', hasNewerActions: false, hasNewestReportAction: true, setIsFloatingMessageCounterVisible}),
        });

        // When the current user sends a comment
        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}));
        });

        // Then the list scrolls to the bottom directly, without an openReport round trip
        expect(mockOpenReport).not.toHaveBeenCalled();
        expect(setIsFloatingMessageCounterVisible).toHaveBeenCalledWith(false);
        expect(reportScrollManager.scrollToBottom).toHaveBeenCalledTimes(1);
        expect(result.current.isScrollToBottomEnabled).toBe(true);
    });

    it('still loads the live tail when an unread marker is set and the newest actions are not loaded', () => {
        // Given an unread marker and a report whose newest actions are not loaded yet
        renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {
            initialProps: buildParams({unreadMarkerReportActionID: '2', hasNewerActions: false, hasNewestReportAction: false}),
        });

        // When the current user sends a comment
        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}));
        });

        // Then openReport fetches the newest actions before the list scrolls
        expect(mockOpenReport).toHaveBeenCalledTimes(1);
        expect(reportScrollManager.scrollToBottom).not.toHaveBeenCalled();
    });

    describe('pending preview scroll', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.clearAllTimers();
            jest.useRealTimers();
        });

        function buildPreviewParams(actions: ReportAction[]): HookParams {
            return buildParams({hasNewerActions: false, hasNewestReportAction: true, sortedVisibleReportActions: actions});
        }

        it('does not scroll to a preview removed before the timer fires', () => {
            // Given a preview below the newest row has a delayed scroll scheduled
            const newest = getFakeReportAction(1);
            const preview = getFakeReportAction(2, {actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW});
            const {rerender, unmount} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildPreviewParams([newest, preview])});
            act(() => newActionHandler?.(true, preview));
            expect(jest.getTimerCount()).toBe(1);

            // When reconciliation removes the preview before its 100ms layout timer fires
            rerender(buildPreviewParams([newest]));
            act(() => jest.advanceTimersByTime(100));

            // Then neither a stale index nor a bottom scroll is used
            expect(reportScrollManager.scrollToIndex).not.toHaveBeenCalled();
            expect(reportScrollManager.scrollToBottom).not.toHaveBeenCalled();
            unmount();
        });

        it('uses the current index when reconciliation moves the preview', () => {
            // Given the preview originally occupies index 1
            const newest = getFakeReportAction(1);
            const preview = getFakeReportAction(2, {actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW});
            const inserted = getFakeReportAction(3);
            const {rerender, unmount} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildPreviewParams([newest, preview])});
            act(() => newActionHandler?.(true, preview));

            // When another row pushes it to index 2 before the timeout
            rerender(buildPreviewParams([inserted, newest, preview]));
            act(() => jest.advanceTimersByTime(100));

            // Then the latest index is used, not the eagerly captured index 1
            expect(reportScrollManager.scrollToIndex).toHaveBeenCalledTimes(1);
            expect(reportScrollManager.scrollToIndex).toHaveBeenCalledWith(2);
            unmount();
        });

        it('scrolls to the bottom when the pending preview becomes the newest row', () => {
            // Given a pending scroll for a preview at index 1
            const newest = getFakeReportAction(1);
            const preview = getFakeReportAction(2, {actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW});
            const {rerender, unmount} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildPreviewParams([newest, preview])});
            act(() => newActionHandler?.(true, preview));

            // When the preview moves to index 0 before the timer fires
            rerender(buildPreviewParams([preview, newest]));
            act(() => jest.advanceTimersByTime(100));

            // Then the list uses its bottom-scroll behavior for the newest row
            expect(reportScrollManager.scrollToIndex).not.toHaveBeenCalled();
            expect(reportScrollManager.scrollToBottom).toHaveBeenCalledTimes(1);
            unmount();
        });

        it('cancels the old timer when a newer current-user action takes over', () => {
            // Given an older preview has a delayed scroll scheduled
            const newest = getFakeReportAction(1);
            const preview = getFakeReportAction(2, {actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW});
            const {unmount} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildPreviewParams([newest, preview])});
            act(() => newActionHandler?.(true, preview));
            expect(jest.getTimerCount()).toBe(1);

            // When a newer comment from the current user requests the bottom position
            act(() => newActionHandler?.(true, getFakeReportAction(3, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT})));
            expect(jest.getTimerCount()).toBe(0);
            act(() => jest.advanceTimersByTime(100));

            // Then the cancelled preview scroll cannot override the newer scroll
            expect(reportScrollManager.scrollToIndex).not.toHaveBeenCalled();
            expect(reportScrollManager.scrollToBottom).toHaveBeenCalledTimes(1);
            unmount();
        });

        it('clears its pending timer on unmount', () => {
            // Given a report with a pending preview-scroll timer
            const newest = getFakeReportAction(1);
            const preview = getFakeReportAction(2, {actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW});
            const {unmount} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildPreviewParams([newest, preview])});
            act(() => newActionHandler?.(true, preview));
            expect(jest.getTimerCount()).toBe(1);

            // When the report is unmounted before the timer fires
            unmount();
            expect(jest.getTimerCount()).toBe(0);
            act(() => jest.advanceTimersByTime(100));

            // Then no scroll runs against the unmounted report
            expect(reportScrollManager.scrollToIndex).not.toHaveBeenCalled();
            expect(reportScrollManager.scrollToBottom).not.toHaveBeenCalled();
        });
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

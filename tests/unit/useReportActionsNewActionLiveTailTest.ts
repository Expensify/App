import {act, renderHook} from '@testing-library/react-native';

import {FALLBACK_NAVIGATION_CONTEXT_VALUE} from '@components/withNavigationFallback';

import useReportActionsNewActionLiveTail from '@pages/inbox/report/useReportActionsNewActionLiveTail';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import {createMockReport, getFakeReportAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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
        policyID: undefined,
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
    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
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
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}));
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

    it('returns the openReport helper that the "Latest messages" pill reuses', async () => {
        // Given the hook for report 1. The pill in useReportActionsScroll calls this helper instead of reading the inputs itself.
        const {result} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams()});

        // When the pill calls the returned helper
        await act(async () => {
            await result.current.openReportAtLiveTail();
        });

        // Then openReport runs once, for this report
        expect(mockOpenReport).toHaveBeenCalledTimes(1);
        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({reportID: '1'}));
    });

    it('clears the report screen param after loading the live tail without changing the focused route', async () => {
        const {rerender} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams()});

        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}));
        });
        await waitForBatchedUpdates();

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

    it('scrolls straight to the bottom when an unread marker is set but the newest actions are already loaded', async () => {
        // Given a report scrolled up with an unread marker from another user's comment, and the newest actions already loaded
        const setIsFloatingMessageCounterVisible = jest.fn();
        const {result} = renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {
            initialProps: buildParams({unreadMarkerReportActionID: '2', hasNewerActions: false, hasNewestReportAction: true, setIsFloatingMessageCounterVisible}),
        });

        // When the current user sends a comment
        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}));
        });
        await waitForBatchedUpdates();

        // Then the list scrolls to the bottom directly, without an openReport round trip
        expect(mockOpenReport).not.toHaveBeenCalled();
        expect(setIsFloatingMessageCounterVisible).toHaveBeenCalledWith(false);
        expect(reportScrollManager.scrollToBottom).toHaveBeenCalledTimes(1);
        expect(result.current.isScrollToBottomEnabled).toBe(true);
    });

    it('still loads the live tail when an unread marker is set and the newest actions are not loaded', async () => {
        // Given an unread marker and a report whose newest actions are not loaded yet
        renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {
            initialProps: buildParams({unreadMarkerReportActionID: '2', hasNewerActions: false, hasNewestReportAction: false}),
        });

        // When the current user sends a comment
        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}));
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

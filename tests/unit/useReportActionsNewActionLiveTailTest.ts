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
        betas: [],
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

    it('threads the conciergeChat report through to the catch-up openReport call', () => {
        const conciergeChat = {reportID: 'concierge-live-tail-1'};
        renderHook((props: HookParams) => useReportActionsNewActionLiveTail(props), {initialProps: buildParams({conciergeChat})});

        act(() => {
            newActionHandler?.(true, getFakeReportAction(1, {actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}));
        });

        expect(mockOpenReport).toHaveBeenCalledWith(expect.objectContaining({conciergeChat}));
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

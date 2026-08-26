import {act, renderHook} from '@testing-library/react-native';

import {FALLBACK_NAVIGATION_CONTEXT_VALUE} from '@components/withNavigationFallback';

import useReportActionsNewActionLiveTail from '@pages/inbox/report/useReportActionsNewActionLiveTail';

import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';

import {getFakeReportAction} from '../utils/ReportTestUtils';

const mockNavigationSetParams = jest.fn();
const mockGlobalSetParams = jest.fn();
const mockOpenReport = jest.fn();
let newActionHandler: ((isFromCurrentUser: boolean, action?: ReportAction) => void) | undefined;

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

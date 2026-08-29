import {act, renderHook} from '@testing-library/react-native';

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

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({setParams: mockNavigationSetParams}),
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
});

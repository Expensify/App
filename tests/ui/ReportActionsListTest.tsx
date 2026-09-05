import {act, render, screen} from '@testing-library/react-native';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useIsReportLoadPending} from '@hooks/useInFlightRequests';
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
import type * as InFlightRequests from '@hooks/useInFlightRequests';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import DateUtils from '@libs/DateUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';

import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import {useConciergeSessionActions, useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';
import ReportActionsList from '@pages/inbox/report/ReportActionsList';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {reportActionsListLoadingStateSelector} from '@src/selectors/ReportMetaData';
import type * as OnyxTypes from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockUseIsFocused = jest.fn().mockReturnValue(false);
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        useIsFocused: () => mockUseIsFocused(),
        useRoute: jest.fn(),
        useNavigationState: jest.fn(),
        createNavigationContainerRef: () => ({
            getState: () => jest.fn(),
        }),
    };
});

jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useInFlightRequests', () => ({
    ...jest.requireActual<typeof InFlightRequests>('@hooks/useInFlightRequests'),
    useIsReportLoadPending: jest.fn(),
}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useTransactionsAndViolationsForReport', () => jest.fn());
jest.mock('@hooks/usePaginatedReportActions', () => jest.fn());
jest.mock('@hooks/useParentReportAction', () => jest.fn());
jest.mock('@hooks/useIsInSidePanel', () => jest.fn());
jest.mock('@hooks/useSidePanelState', () => jest.fn());
jest.mock('@hooks/useReportTransactionsCollection', () => jest.fn());
jest.mock('@pages/inbox/ConciergeSessionContext', () => ({
    useConciergeSessionState: jest.fn(),
    useConciergeSessionActions: jest.fn(),
}));
jest.mock('@pages/inbox/ConciergeDraftContext', () => ({
    useConciergeDraft: jest.fn(),
    useConciergeDraftActions: jest.fn(),
}));

const mockUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockUseIsReportLoadPending = useIsReportLoadPending as jest.MockedFunction<typeof useIsReportLoadPending>;
const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;
const mockUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;
const mockUseTransactionsAndViolationsForReport = useTransactionsAndViolationsForReport as jest.MockedFunction<typeof useTransactionsAndViolationsForReport>;
const mockUsePaginatedReportActions = usePaginatedReportActions as jest.MockedFunction<typeof usePaginatedReportActions>;
const mockUseParentReportAction = useParentReportAction as jest.MockedFunction<typeof useParentReportAction>;
const mockUseIsInSidePanel = useIsInSidePanel as jest.MockedFunction<typeof useIsInSidePanel>;
const mockUseSidePanelState = useSidePanelState as jest.MockedFunction<typeof useSidePanelState>;
const mockUseReportTransactionsCollection = useReportTransactionsCollection as jest.MockedFunction<typeof useReportTransactionsCollection>;
const mockUseConciergeDraft = useConciergeDraft as jest.MockedFunction<typeof useConciergeDraft>;
const mockUseConciergeDraftActions = useConciergeDraftActions as jest.MockedFunction<typeof useConciergeDraftActions>;
const mockUseConciergeSessionState = useConciergeSessionState as jest.MockedFunction<typeof useConciergeSessionState>;
const mockUseConciergeSessionActions = useConciergeSessionActions as jest.MockedFunction<typeof useConciergeSessionActions>;

function getMockReportLoadingState(selector: unknown, hasOnceLoadedReportActions = true) {
    return selector === reportActionsListLoadingStateSelector
        ? {hasOnceLoadedReportActions, isLoadingInitialReportActions: false, isLoadingOlderReportActions: false, hasLoadingOlderReportActionsError: false}
        : undefined;
}

const defaultPaginatedReportActionsResult: ReturnType<typeof usePaginatedReportActions> = {
    reportActions: [],
    linkedAction: undefined,
    oldestUnreadReportAction: undefined,
    sortedAllReportActions: undefined,
    hasNewerActions: false,
    hasOlderActions: false,
    report: undefined,
};

const defaultSidePanelState: ReturnType<typeof useSidePanelState> = {
    sessionStartTime: null,
    isSidePanelTransitionEnded: false,
    isSidePanelHiddenOrLargeScreen: true,
    shouldHideSidePanel: true,
    shouldHideSidePanelBackdrop: true,
    shouldHideHelpButton: false,
    shouldHideToolTip: false,
    sidePanelOffset: {current: null} as React.RefObject<never>,
    sidePanelTranslateX: {current: null} as React.RefObject<never>,
};

jest.mock('@hooks/useCopySelectionHelper', () => jest.fn());
jest.mock('@hooks/useCurrentUserPersonalDetails', () => jest.fn());
const mockLoadOlderChats = jest.fn();
jest.mock('@hooks/useLoadReportActions', () =>
    jest.fn(({reportActions}: {reportActions: OnyxTypes.ReportAction[]}) => ({
        loadOlderChats: mockLoadOlderChats,
        loadNewerChats: jest.fn(),
        currentReportOldestActionID: reportActions.at(-1)?.reportActionID,
    })),
);
jest.mock('@hooks/usePrevious', () => jest.fn());

const mockUseCurrentUserPersonalDetails = useCurrentUserPersonalDetails as jest.MockedFunction<typeof useCurrentUserPersonalDetails>;

// We mount the public ReportActionsList (the skeleton guard + its content) and observe what the content
// feeds chronological data directly to LegendList. The heavy scroll/marker hooks have their own unit tests,
// so they are stubbed here to isolate the skeleton logic. Because the guard only mounts the content when
// the skeleton is not showing, these stubs double as a probe for dormancy: while a skeleton renders the
// content is never mounted, so useMarkAsRead/useReportActionsScroll are never called.
const mockLegendListMount = jest.fn();
const mockLegendListUnmount = jest.fn();
jest.mock('@legendapp/list/react-native', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    return {
        LegendList: jest.fn(() => {
            reactModule.useEffect(() => {
                mockLegendListMount();
                return () => {
                    mockLegendListUnmount();
                };
            }, []);
            return null;
        }),
    };
});
jest.mock('@hooks/useUnreadMarker', () => jest.fn(() => ({unreadMarkerReportActionID: null, unreadMarkerReportActionIndex: -1})));
jest.mock('@hooks/useMarkAsRead', () => jest.fn(() => ({markNewestActionAsRead: jest.fn(), completeSkippedMarkAsRead: jest.fn()})));
jest.mock('@hooks/useReportActionsScroll', () =>
    jest.fn(() => ({
        listRef: {current: null},
        trackVerticalScrolling: jest.fn(),
        onViewableItemsChanged: jest.fn(),
        isFloatingMessageCounterVisible: false,
        isActionBadgeAboveViewport: false,
        scrollToBottomAndMarkReportAsRead: jest.fn(),
        scrollToActionBadgeTarget: jest.fn(),
        shouldBeAlignedToTop: false,
        initialScrollIndex: undefined,
        initialScrollIndexParams: undefined,
        onLoad: jest.fn(),
    })),
);
jest.mock('@pages/inbox/report/FloatingMessageCounter', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/ReportActionsListPaddingView', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    return jest.fn(({children}: {children: React.ReactNode}) => reactModule.createElement(reactModule.Fragment, null, children));
});
jest.mock('@pages/inbox/report/UserTypingEventListener', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/ReportActionItemCreated', () => jest.fn(() => null));

type MockLegendListProps = {
    alignItemsAtEnd?: boolean;
    data?: OnyxTypes.ReportAction[];
    drawDistance?: number;
    extraData?: unknown;
    getItemType?: (item: OnyxTypes.ReportAction) => string;
    initialScrollAtEnd?: boolean;
    maintainScrollAtEnd?: {animated: boolean} | false;
    maintainScrollAtEndThreshold?: number;
    maintainVisibleContentPosition?: boolean;
    recycleItems?: boolean;
    renderItem?: (info: {item: OnyxTypes.ReportAction; index: number}) => React.ReactElement | null;
    onStartReached?: () => void;
    onScroll?: (event: {
        nativeEvent: {
            contentOffset: {x: number; y: number};
            contentSize: {height: number; width: number};
            layoutMeasurement: {height: number; width: number};
        };
    }) => void;
};

const {LegendList: mockLegendList} = jest.requireMock<{LegendList: jest.MockedFunction<(props: MockLegendListProps) => null>}>('@legendapp/list/react-native');
const mockReportActionItemCreated: jest.Mock = jest.requireMock('@pages/inbox/report/ReportActionItemCreated');

/** Returns the chronological report actions the body fed into the mocked LegendList on its latest render. */
const getCapturedVisibleActions = (): OnyxTypes.ReportAction[] | undefined => mockLegendList.mock.calls.at(-1)?.at(0)?.data;
const getCapturedListProps = (): MockLegendListProps | undefined => mockLegendList.mock.calls.at(-1)?.at(0);

const getRenderedReportActionsListItemProps = (reportAction: OnyxTypes.ReportAction, index = 0): {shouldDisableContextMenuForConciergeDraft?: boolean} => {
    const renderedItem = getCapturedListProps()?.renderItem?.({item: reportAction, index});

    if (!React.isValidElement<{children: React.ReactNode}>(renderedItem)) {
        throw new Error('Expected renderItem to return a React element');
    }

    const child = React.Children.toArray(renderedItem.props.children).find(
        (item): item is React.ReactElement<{shouldDisableContextMenuForConciergeDraft?: boolean}> =>
            React.isValidElement<{shouldDisableContextMenuForConciergeDraft?: boolean}>(item) && 'shouldDisableContextMenuForConciergeDraft' in item.props,
    );

    if (!child) {
        throw new Error('Expected renderItem to render ReportActionsListItemRenderer');
    }

    return child.props;
};

const mockUseMarkAsRead: jest.Mock = jest.requireMock('@hooks/useMarkAsRead');
const mockUseReportActionsScroll: jest.Mock = jest.requireMock('@hooks/useReportActionsScroll');
const mockMarkOpenReportEnd: jest.Mock = jest.requireMock('@libs/telemetry/markOpenReportEnd');
let mockHasOnceLoadedReportActions = true;

jest.mock('@libs/actions/Report', () => ({
    updateLoadingInitialReportAction: jest.fn(),
}));
jest.mock('@libs/telemetry/markOpenReportEnd', () => jest.fn());

const mockReport: OnyxTypes.Report = {
    reportID: '123',
    reportName: 'Test Report',
    chatReportID: '456',
    ownerAccountID: 123,
    lastVisibleActionCreated: '2023-01-01',
    total: 0,
};

const mockReportActions: OnyxTypes.ReportAction[] = [
    {
        reportActionID: '1',
        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
        created: '2023-01-01',
        actorAccountID: 123,
        message: [{type: 'COMMENT', html: 'Test message', text: 'Test message'}],
        originalMessage: {},
        shouldShow: true,
        person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
        pendingAction: null,
        errors: {},
    },
    {
        reportActionID: '2',
        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        created: '2023-01-02',
        actorAccountID: 124,
        message: [{type: 'COMMENT', html: 'Another message', text: 'Another message'}],
        originalMessage: {},
        shouldShow: true,
        person: [{type: 'TEXT', style: 'strong', text: 'Another User'}],
        pendingAction: null,
        errors: {},
    },
];

const olderMockReportAction: OnyxTypes.ReportAction = {
    reportActionID: '0',
    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
    created: '2022-12-31',
    actorAccountID: 125,
    message: [{type: 'COMMENT', html: 'Older message', text: 'Older message'}],
    originalMessage: {},
    shouldShow: true,
    person: [{type: 'TEXT', style: 'strong', text: 'Older User'}],
    pendingAction: null,
    errors: {},
};

const renderReportActionsList = (props: {reportID?: string} = {}) => {
    const reportID = props.reportID ?? mockReport.reportID;
    return render(
        <ReportActionsList
            reportID={reportID}
            conciergeChat={undefined}
        />,
    );
};

describe('ReportActionsList (body)', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockHasOnceLoadedReportActions = true;
        mockUseIsReportLoadPending.mockReturnValue(false);

        mockUseCurrentUserPersonalDetails.mockReturnValue({
            accountID: 100,
            displayName: 'Test User',
            login: 'test@test.com',
        } as ReturnType<typeof useCurrentUserPersonalDetails>);

        mockUseResponsiveLayout.mockReturnValue({
            shouldUseNarrowLayout: false,
            isSmallScreenWidth: false,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: true,
            isExtraLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: true,
            isInLandscapeMode: false,
        });

        mockUseTransactionsAndViolationsForReport.mockReturnValue({
            transactions: {},
            violations: {},
            isLoaded: true,
        });

        mockUsePaginatedReportActions.mockReturnValue({
            ...defaultPaginatedReportActionsResult,
            reportActions: mockReportActions,
        });

        mockUseParentReportAction.mockReturnValue(undefined as ReturnType<typeof useParentReportAction>);
        mockUseIsInSidePanel.mockReturnValue(false);
        mockUseSidePanelState.mockReturnValue(defaultSidePanelState);
        mockUseReportTransactionsCollection.mockReturnValue({});
        mockUseConciergeDraft.mockReturnValue({
            draftReportAction: null,
            hasActiveDraft: false,
            isDraftPendingCompletion: false,
        });
        mockUseConciergeDraftActions.mockReturnValue({
            clearDraft: jest.fn(),
            dispatchLocalDraftEvent: jest.fn(),
            revealDraftFromReportAction: jest.fn(),
        });
        mockUseConciergeSessionState.mockReturnValue({sessionStartTime: null, showFullHistory: false, hadMessagesAtSessionStart: false});
        mockUseConciergeSessionActions.mockReturnValue({startSession: jest.fn(), setShowFullHistory: jest.fn(), setHadMessagesAtSessionStart: jest.fn()});

        mockUseOnyx.mockImplementation((key: string, options) => {
            // useReportActionsListModel derives app-load state from the request queue via useIsAppLoadPending,
            // which reads these queue keys through selectors that resolve to a boolean. Returning that boolean
            // directly mirrors what useOnyx yields once the selector runs. The legacy IS_LOADING_APP flag is kept
            // in the fixture for any component still reading it directly.
            if (key === ONYXKEYS.IS_LOADING_APP || key === ONYXKEYS.PERSISTED_REQUESTS || key === ONYXKEYS.PERSISTED_ONGOING_REQUESTS) {
                return [false, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                return [false, {status: 'loaded'}];
            }
            if (key.includes('reportLoadingState')) {
                return [getMockReportLoadingState(options?.selector, mockHasOnceLoadedReportActions), {status: 'loaded'}];
            }
            if (key.includes('reportActions')) {
                return [[], {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`) {
                return [mockReport, {status: 'loaded'}];
            }
            if (key.includes('report')) {
                return [undefined, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    afterEach(async () => {
        await waitForBatchedUpdatesWithAct();
        await Onyx.clear();
    });

    it('delegates end following and size corrections to LegendList without a full-viewport threshold', () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderReportActionsList();

        expect(getCapturedListProps()?.maintainScrollAtEnd).toEqual({animated: false});
        expect(getCapturedListProps()?.maintainScrollAtEndThreshold).toBe(0.01);
        expect(getCapturedListProps()?.maintainVisibleContentPosition).toBe(true);
    });

    it('initially aligns the seed page to the end', () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockHasOnceLoadedReportActions = false;
        renderReportActionsList();

        expect(getCapturedListProps()?.initialScrollAtEnd).toBe(true);
        expect(getCapturedListProps()?.alignItemsAtEnd).toBe(true);
        expect(getCapturedListProps()?.maintainScrollAtEnd).toEqual({animated: false});
    });

    it('does not follow the end of a page that still has newer actions to load', () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockUsePaginatedReportActions.mockReturnValue({
            ...defaultPaginatedReportActionsResult,
            reportActions: mockReportActions,
            hasNewerActions: true,
        });
        renderReportActionsList();

        expect(getCapturedListProps()?.maintainScrollAtEnd).toBe(false);
        expect(getCapturedListProps()?.maintainVisibleContentPosition).toBe(true);
    });

    it('remounts the list when the initial report actions finish hydrating', async () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockHasOnceLoadedReportActions = false;
        const view = renderReportActionsList();

        expect(mockLegendListMount).toHaveBeenCalledTimes(1);
        expect(mockLegendListUnmount).not.toHaveBeenCalled();

        mockHasOnceLoadedReportActions = true;
        // The mocked Onyx hook does not own state, so changing its return value cannot schedule the
        // rerender that the real Onyx subscription causes. Change a prop to trigger that render.
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
                onLayout={jest.fn()}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockLegendListMount).toHaveBeenCalledTimes(2);
        expect(mockLegendListUnmount).toHaveBeenCalledTimes(1);
        expect(getCapturedListProps()?.initialScrollAtEnd).toBe(true);
        expect(getCapturedListProps()?.maintainScrollAtEnd).toEqual({animated: false});
    });

    it('keeps the initial actions visible until the hydrated page is complete', async () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockHasOnceLoadedReportActions = false;
        const view = renderReportActionsList();

        expect(getCapturedVisibleActions()).toHaveLength(mockReportActions.length);

        mockUsePaginatedReportActions.mockReturnValue({
            ...defaultPaginatedReportActionsResult,
            reportActions: [...mockReportActions, olderMockReportAction],
        });
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
                onLayout={jest.fn()}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(getCapturedVisibleActions()).toHaveLength(mockReportActions.length);
        expect(getCapturedVisibleActions()?.some((action) => action.reportActionID === olderMockReportAction.reportActionID)).toBe(false);

        mockHasOnceLoadedReportActions = true;
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
                onLayout={jest.fn()}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(getCapturedVisibleActions()).toHaveLength(mockReportActions.length + 1);
        expect(getCapturedVisibleActions()?.some((action) => action.reportActionID === olderMockReportAction.reportActionID)).toBe(true);
    });

    it('limits the render buffer and enables item recycling', () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderReportActionsList();

        const listProps = getCapturedListProps();

        expect(listProps?.drawDistance).toBe(1500);
        expect(listProps?.recycleItems).toBe(true);
    });

    it('groups comments by layout characteristics for measurement estimates', () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderReportActionsList();

        const getItemType = getCapturedListProps()?.getItemType;
        const comment = mockReportActions.at(1);
        if (!comment) {
            throw new Error('Expected comment report action fixture');
        }

        expect(getItemType?.(comment)).toBe(`${CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}-short`);
        expect(
            getItemType?.({
                ...comment,
                reportActionID: 'medium-comment',
                message: [{type: 'COMMENT', html: 'Medium comment', text: 'a'.repeat(200)}],
            }),
        ).toBe(`${CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}-medium`);
        expect(
            getItemType?.({
                ...comment,
                reportActionID: 'long-comment',
                message: [{type: 'COMMENT', html: 'Long comment', text: 'a'.repeat(600)}],
            }),
        ).toBe(`${CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}-long`);
        expect(
            getItemType?.({
                ...comment,
                reportActionID: 'extra-long-comment',
                message: [{type: 'COMMENT', html: 'Extra long comment', text: 'a'.repeat(1500)}],
            }),
        ).toBe(`${CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}-extra-long`);
        expect(
            getItemType?.({
                ...comment,
                reportActionID: 'attachment',
                isAttachmentOnly: true,
            }),
        ).toBe(`${CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}-attachment`);
        expect(
            getItemType?.({
                ...comment,
                reportActionID: 'link-preview',
                linkMetadata: [{url: 'https://example.com'}],
            }),
        ).toBe(`${CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}-link-preview-short`);
    });

    it('continues loading older pages from scroll events when LegendList does not report reaching the start', () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockUsePaginatedReportActions.mockReturnValue({
            ...defaultPaginatedReportActionsResult,
            reportActions: mockReportActions,
            hasOlderActions: true,
        });
        const view = renderReportActionsList();

        const listProps = getCapturedListProps();
        const createScrollEvent = (offset: number) => ({
            nativeEvent: {
                contentOffset: {x: 0, y: offset},
                contentSize: {height: 1000, width: 300},
                layoutMeasurement: {height: 500, width: 300},
            },
        });

        act(() => {
            listProps?.onScroll?.(createScrollEvent(0));
        });
        expect(mockLoadOlderChats).toHaveBeenCalledTimes(1);

        act(() => {
            listProps?.onStartReached?.();
            listProps?.onScroll?.(createScrollEvent(0));
        });
        expect(mockLoadOlderChats).toHaveBeenCalledTimes(1);

        mockUsePaginatedReportActions.mockReturnValue({
            ...defaultPaginatedReportActionsResult,
            reportActions: [...mockReportActions, olderMockReportAction],
            hasOlderActions: true,
        });
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
                onLayout={jest.fn()}
            />,
        );

        act(() => {
            getCapturedListProps()?.onScroll?.(createScrollEvent(0));
        });
        expect(mockLoadOlderChats).toHaveBeenCalledTimes(2);
    });

    describe('Concierge Draft Context Menu', () => {
        const conciergeDraftReportAction: OnyxTypes.ReportAction = {
            reportID: mockReport.reportID,
            reportActionID: 'concierge-draft',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            created: '2023-01-03',
            actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
            message: [{type: 'COMMENT', html: 'Bot reply', text: 'Bot reply'}],
            originalMessage: {html: 'Bot reply', whisperedTo: []},
            shouldShow: true,
            person: [{type: 'TEXT', style: 'strong', text: CONST.CONCIERGE_DISPLAY_NAME}],
            pendingAction: null,
            errors: {},
        };

        beforeEach(() => {
            mockUseNetwork.mockReturnValue({isOffline: false});
        });

        it('disables the context menu while the Concierge draft is still streaming', () => {
            mockUseConciergeDraft.mockReturnValue({
                draftReportAction: conciergeDraftReportAction,
                hasActiveDraft: true,
                isDraftPendingCompletion: true,
            });

            renderReportActionsList();

            expect(getCapturedVisibleActions()?.some((action) => action.reportActionID === conciergeDraftReportAction.reportActionID)).toBe(true);
            expect(getRenderedReportActionsListItemProps(conciergeDraftReportAction).shouldDisableContextMenuForConciergeDraft).toBe(true);
            expect((getCapturedListProps()?.extraData as unknown[]).at(-1)).toBe(true);
        });

        it('enables the context menu after the Concierge draft finishes streaming', () => {
            mockUseConciergeDraft.mockReturnValue({
                draftReportAction: conciergeDraftReportAction,
                hasActiveDraft: true,
                isDraftPendingCompletion: false,
            });

            renderReportActionsList();

            expect(getCapturedVisibleActions()?.some((action) => action.reportActionID === conciergeDraftReportAction.reportActionID)).toBe(true);
            expect(getRenderedReportActionsListItemProps(conciergeDraftReportAction).shouldDisableContextMenuForConciergeDraft).toBe(false);
            expect((getCapturedListProps()?.extraData as unknown[]).at(-1)).toBe(false);
        });
    });

    describe('Skeleton Loading States', () => {
        it('derives a true report pending value for the initial skeleton decision', () => {
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockUsePaginatedReportActions.mockReturnValue(defaultPaginatedReportActionsResult);
            mockUseIsReportLoadPending.mockReturnValue(true);

            renderReportActionsList();

            expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
            expect(mockMarkOpenReportEnd).toHaveBeenCalledWith(mockReport.reportID, mockReport, {warm: false});
            expect(mockUseIsReportLoadPending).toHaveBeenCalledWith(mockReport.reportID);
        });

        it('derives a false report pending value for the initial skeleton decision', () => {
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockUsePaginatedReportActions.mockReturnValue(defaultPaginatedReportActionsResult);

            renderReportActionsList();

            expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
            expect(mockMarkOpenReportEnd).not.toHaveBeenCalledWith(mockReport, {warm: false});
            expect(mockUseIsReportLoadPending).toHaveBeenCalledWith(mockReport.reportID);
        });

        it('should show skeleton when shouldShowSkeletonForAppLoad is true (isLoadingApp is true and isOffline is false)', () => {
            mockUseNetwork.mockReturnValue({
                isOffline: false,
            });

            mockUseOnyx.mockImplementation((key: string, options) => {
                if (key === ONYXKEYS.IS_LOADING_APP || key === ONYXKEYS.PERSISTED_REQUESTS || key === ONYXKEYS.PERSISTED_ONGOING_REQUESTS) {
                    return [true, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [getMockReportLoadingState(options?.selector), {status: 'loaded'}];
                }
                if (key.includes('reportActions')) {
                    return [[], {status: 'loaded'}];
                }
                if (key === `${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`) {
                    return [mockReport, {status: 'loaded'}];
                }
                if (key.includes('report')) {
                    return [undefined, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });

            // Empty report actions to trigger isMissingReportActions condition
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
            });

            renderReportActionsList();

            expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
            // The guard does not mount the content while the skeleton shows, so the UI-close hooks never
            // run and cannot consume unread state or open a new-action subscription.
            expect(mockUseMarkAsRead).not.toHaveBeenCalled();
            expect(mockUseReportActionsScroll).not.toHaveBeenCalled();
        });

        it('should not show skeleton when shouldShowSkeletonForAppLoad is false (isLoadingApp is false and isOffline is false)', () => {
            mockUseNetwork.mockReturnValue({
                isOffline: false,
            });

            mockUseOnyx.mockImplementation((key: string, options) => {
                if (key === ONYXKEYS.IS_LOADING_APP || key === ONYXKEYS.PERSISTED_REQUESTS || key === ONYXKEYS.PERSISTED_ONGOING_REQUESTS) {
                    return [false, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [getMockReportLoadingState(options?.selector), {status: 'loaded'}];
                }
                if (key.includes('reportActions')) {
                    return [[], {status: 'loaded'}];
                }
                if (key === `${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`) {
                    return [mockReport, {status: 'loaded'}];
                }
                if (key.includes('report')) {
                    return [undefined, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });

            renderReportActionsList();

            expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
            // The list is visible, so the guard mounts the content and the UI-close hooks run.
            expect(mockUseMarkAsRead).toHaveBeenCalled();
            expect(mockUseReportActionsScroll).toHaveBeenCalled();
        });

        it('should not show skeleton when shouldShowSkeletonForAppLoad is false (isLoadingApp is true and isOffline is true)', () => {
            mockUseNetwork.mockReturnValue({
                isOffline: true,
            });

            mockUseOnyx.mockImplementation((key: string, options) => {
                if (key === ONYXKEYS.IS_LOADING_APP || key === ONYXKEYS.PERSISTED_REQUESTS || key === ONYXKEYS.PERSISTED_ONGOING_REQUESTS) {
                    return [true, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [getMockReportLoadingState(options?.selector), {status: 'loaded'}];
                }
                if (key.includes('reportActions')) {
                    return [[], {status: 'loaded'}];
                }
                if (key === `${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`) {
                    return [mockReport, {status: 'loaded'}];
                }
                if (key.includes('report')) {
                    return [undefined, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });

            renderReportActionsList();

            expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        });

        it('should not show skeleton when both isLoadingApp is false and isOffline is true', () => {
            mockUseNetwork.mockReturnValue({
                isOffline: true,
            });

            mockUseOnyx.mockImplementation((key: string, options) => {
                if (key === ONYXKEYS.IS_LOADING_APP || key === ONYXKEYS.PERSISTED_REQUESTS || key === ONYXKEYS.PERSISTED_ONGOING_REQUESTS) {
                    return [false, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [getMockReportLoadingState(options?.selector), {status: 'loaded'}];
                }
                if (key.includes('reportActions')) {
                    return [[], {status: 'loaded'}];
                }
                if (key === `${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`) {
                    return [mockReport, {status: 'loaded'}];
                }
                if (key.includes('report')) {
                    return [undefined, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });

            renderReportActionsList();

            expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        });
    });

    describe('Open-report telemetry', () => {
        it('fires markOpenReportEnd with warm:false while the initial skeleton shows', () => {
            mockUseNetwork.mockReturnValue({isOffline: false});

            mockUseOnyx.mockImplementation((key: string, options) => {
                if (key === ONYXKEYS.IS_LOADING_APP || key === ONYXKEYS.PERSISTED_REQUESTS || key === ONYXKEYS.PERSISTED_ONGOING_REQUESTS) {
                    return [true, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [getMockReportLoadingState(options?.selector), {status: 'loaded'}];
                }
                if (key.includes('reportActions')) {
                    return [[], {status: 'loaded'}];
                }
                if (key === `${ONYXKEYS.COLLECTION.REPORT}${mockReport.reportID}`) {
                    return [mockReport, {status: 'loaded'}];
                }
                if (key.includes('report')) {
                    return [undefined, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });

            // Empty report actions so the app-load skeleton renders.
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
            });

            renderReportActionsList();

            // Must fire while the skeleton shows or the open-report span regresses.
            expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
            expect(mockMarkOpenReportEnd).toHaveBeenCalledWith(mockReport.reportID, mockReport, {warm: false});
        });

        it('does not fire the warm:false mark once content is visible', () => {
            // Default mocks render the list (no skeleton). warm:false is gated on the initial skeleton, so
            // it must not fire here; warm:true comes from the list layout, not this path.
            mockUseNetwork.mockReturnValue({isOffline: false});

            renderReportActionsList();

            expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
            expect(mockMarkOpenReportEnd).not.toHaveBeenCalledWith(mockReport.reportID, mockReport, {warm: false});
        });
    });

    describe('Concierge Side Panel', () => {
        const CONCIERGE_REPORT_ID = '123';
        const CURRENT_USER_ACCOUNT_ID = 100;

        // Actions created before the current session
        const oldReportActions: OnyxTypes.ReportAction[] = [
            {
                reportActionID: 'created-1',
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: '2023-01-01 00:00:00.000',
                actorAccountID: 123,
                message: [{type: 'COMMENT', html: '', text: ''}],
                originalMessage: {},
                shouldShow: true,
                person: [{type: 'TEXT', style: 'strong', text: 'System'}],
                pendingAction: null,
                errors: {},
            },
            {
                reportActionID: 'old-msg-1',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                created: '2023-06-15 10:00:00.000',
                actorAccountID: CURRENT_USER_ACCOUNT_ID,
                message: [{type: 'COMMENT', html: 'Old message', text: 'Old message'}],
                originalMessage: {},
                shouldShow: true,
                person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                pendingAction: null,
                errors: {},
            },
        ];

        const setupConciergeMocks = () => {
            jest.spyOn(ReportActionsUtils, 'shouldReportActionBeVisible').mockReturnValue(true);
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockUseOnyx.mockImplementation((key: string, options) => {
                if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                    return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.IS_LOADING_APP || key === ONYXKEYS.PERSISTED_REQUESTS || key === ONYXKEYS.PERSISTED_ONGOING_REQUESTS) {
                    return [false, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [getMockReportLoadingState(options?.selector), {status: 'loaded'}];
                }
                if (key.includes('reportActions')) {
                    return [[], {status: 'loaded'}];
                }
                if (key === `${ONYXKEYS.COLLECTION.REPORT}${CONCIERGE_REPORT_ID}`) {
                    return [{...mockReport, reportID: CONCIERGE_REPORT_ID}, {status: 'loaded'}];
                }
                if (key.includes('report')) {
                    return [undefined, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });
        };

        it('should show only greeting and created action when opened in side panel with no user messages', () => {
            setupConciergeMocks();

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: oldReportActions,
            });
            mockUseIsInSidePanel.mockReturnValue(true);
            mockUseSidePanelState.mockReturnValue({...defaultSidePanelState, sessionStartTime: DateUtils.getDBTime()});

            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            expect(mockLegendList).toHaveBeenCalled();
            const passedActions = getCapturedVisibleActions();
            expect(passedActions?.length).toBeGreaterThanOrEqual(1);
            expect(passedActions?.some((action) => action.reportActionID === CONST.CONCIERGE_GREETING_ACTION_ID)).toBe(true);
        });

        it('should not show welcome state when not in side panel', () => {
            setupConciergeMocks();

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: oldReportActions,
            });
            mockUseIsInSidePanel.mockReturnValue(false);

            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            expect(mockReportActionItemCreated).not.toHaveBeenCalled();
        });

        it('should not show welcome state for non-concierge reports in side panel', () => {
            setupConciergeMocks();

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: oldReportActions,
            });
            mockUseIsInSidePanel.mockReturnValue(false);

            renderReportActionsList({reportID: 'non-concierge-999'});

            expect(mockReportActionItemCreated).not.toHaveBeenCalled();
        });

        it('should hide welcome and show filtered actions when user sends a message', () => {
            setupConciergeMocks();

            const sessionStart = DateUtils.getDBTime();

            const actionsWithNewMessage: OnyxTypes.ReportAction[] = [
                ...oldReportActions,
                {
                    reportActionID: 'new-msg-1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    created: DateUtils.getDBTime(),
                    actorAccountID: CURRENT_USER_ACCOUNT_ID,
                    message: [{type: 'COMMENT', html: 'New message', text: 'New message'}],
                    originalMessage: {},
                    shouldShow: true,
                    person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                    pendingAction: null,
                    errors: {},
                },
            ];

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: actionsWithNewMessage,
            });
            mockUseIsInSidePanel.mockReturnValue(true);
            mockUseSidePanelState.mockReturnValue({...defaultSidePanelState, sessionStartTime: sessionStart});

            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            // Welcome should not be shown since user has sent a message
            expect(mockReportActionItemCreated).not.toHaveBeenCalled();
            // ReportActionsList should be rendered with filtered actions
            expect(mockLegendList).toHaveBeenCalled();
        });
    });

    describe('Concierge Main DM Hidden History', () => {
        const CONCIERGE_REPORT_ID = '123';
        const CURRENT_USER_ACCOUNT_ID = 100;
        const SESSION_START = '2024-06-01 12:00:00.000';

        const oldReportActions: OnyxTypes.ReportAction[] = [
            {
                reportActionID: 'created-1',
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: '2023-01-01 00:00:00.000',
                actorAccountID: 123,
                message: [{type: 'COMMENT', html: '', text: ''}],
                originalMessage: {},
                shouldShow: true,
                person: [{type: 'TEXT', style: 'strong', text: 'System'}],
                pendingAction: null,
                errors: {},
            },
            {
                reportActionID: 'old-user-msg',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                created: '2023-06-15 10:00:00.000',
                actorAccountID: CURRENT_USER_ACCOUNT_ID,
                message: [{type: 'COMMENT', html: 'Old user message', text: 'Old user message'}],
                originalMessage: {},
                shouldShow: true,
                person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                pendingAction: null,
                errors: {},
            },
            {
                reportActionID: 'old-concierge-msg',
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                created: '2023-06-15 10:01:00.000',
                actorAccountID: 456,
                message: [{type: 'COMMENT', html: 'Old concierge reply', text: 'Old concierge reply'}],
                originalMessage: {},
                shouldShow: true,
                person: [{type: 'TEXT', style: 'strong', text: 'Concierge'}],
                pendingAction: null,
                errors: {},
            },
        ];

        const setupMainDMConciergeMocks = (sessionStartTime: string | null = SESSION_START, showFullHistory = false, hasOnceLoadedReportActions = true) => {
            jest.spyOn(ReportActionsUtils, 'shouldReportActionBeVisible').mockReturnValue(true);
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockUseIsInSidePanel.mockReturnValue(false);
            mockUseSidePanelState.mockReturnValue(defaultSidePanelState);
            mockUseConciergeSessionState.mockReturnValue({sessionStartTime, showFullHistory, hadMessagesAtSessionStart: false});
            mockUseConciergeSessionActions.mockReturnValue({startSession: jest.fn(), setShowFullHistory: jest.fn(), setHadMessagesAtSessionStart: jest.fn()});

            mockUseOnyx.mockImplementation((key: string, options) => {
                if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                    return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.IS_LOADING_APP || key === ONYXKEYS.PERSISTED_REQUESTS || key === ONYXKEYS.PERSISTED_ONGOING_REQUESTS) {
                    return [false, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [getMockReportLoadingState(options?.selector, hasOnceLoadedReportActions), {status: 'loaded'}];
                }
                if (key.includes('reportActions')) {
                    return [[], {status: 'loaded'}];
                }
                if (key === `${ONYXKEYS.COLLECTION.REPORT}${CONCIERGE_REPORT_ID}`) {
                    return [{...mockReport, reportID: CONCIERGE_REPORT_ID}, {status: 'loaded'}];
                }
                if (key.includes('report')) {
                    return [undefined, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });
        };

        it('should show greeting and filter old messages when session is active with prior user messages', () => {
            setupMainDMConciergeMocks();

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: oldReportActions,
                hasOlderActions: false,
            });

            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            expect(mockLegendList).toHaveBeenCalled();
            const passedActions = getCapturedVisibleActions();
            expect(passedActions?.some((a) => a.reportActionID === CONST.CONCIERGE_GREETING_ACTION_ID)).toBe(true);
            expect(passedActions?.some((a) => a.reportActionID === 'old-user-msg')).toBe(false);
            expect(passedActions?.some((a) => a.reportActionID === 'old-concierge-msg')).toBe(false);
        });

        it('should show all actions when showFullHistory is true', () => {
            setupMainDMConciergeMocks(SESSION_START, true);

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: oldReportActions,
                hasOlderActions: false,
            });

            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            expect(mockLegendList).toHaveBeenCalled();
            const passedActions = getCapturedVisibleActions();
            expect(passedActions?.some((a) => a.reportActionID === 'old-user-msg')).toBe(true);
            expect(passedActions?.some((a) => a.reportActionID === 'old-concierge-msg')).toBe(true);
        });

        it('should show all actions unfiltered when user sends a message in current session', () => {
            setupMainDMConciergeMocks();

            const actionsWithNewMsg: OnyxTypes.ReportAction[] = [
                ...oldReportActions,
                {
                    reportActionID: 'new-user-msg',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    created: '2024-06-01 12:05:00.000',
                    actorAccountID: CURRENT_USER_ACCOUNT_ID,
                    message: [{type: 'COMMENT', html: 'Hello', text: 'Hello'}],
                    originalMessage: {},
                    shouldShow: true,
                    person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                    pendingAction: null,
                    errors: {},
                },
            ];

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: actionsWithNewMsg,
                hasOlderActions: false,
            });

            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            expect(mockLegendList).toHaveBeenCalled();
            const passedActions = getCapturedVisibleActions();
            // After user sends a message, the greeting stays visible alongside session actions
            expect(passedActions?.some((a) => a.reportActionID === CONST.CONCIERGE_GREETING_ACTION_ID)).toBe(true);
            expect(passedActions?.some((a) => a.reportActionID === 'new-user-msg')).toBe(true);
        });

        it('should not show old messages when sessionStartTime is null (session not started)', () => {
            setupMainDMConciergeMocks(null);

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: oldReportActions,
                hasOlderActions: false,
            });

            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            expect(mockLegendList).toHaveBeenCalled();
            const passedActions = getCapturedVisibleActions();
            // With no session, old messages should not be shown
            expect(passedActions?.some((a) => a.reportActionID === 'old-user-msg')).toBe(false);
            expect(passedActions?.some((a) => a.reportActionID === 'old-concierge-msg')).toBe(false);
        });

        it('should pass through onboarding messages for a new user with no prior messages', () => {
            setupMainDMConciergeMocks();

            // Only onboarding messages from Concierge, no user messages before session
            const onboardingActions: OnyxTypes.ReportAction[] = [
                {
                    reportActionID: 'created-1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                    created: '2024-06-01 11:59:00.000',
                    actorAccountID: 123,
                    message: [{type: 'COMMENT', html: '', text: ''}],
                    originalMessage: {},
                    shouldShow: true,
                    person: [{type: 'TEXT', style: 'strong', text: 'System'}],
                    pendingAction: null,
                    errors: {},
                },
                {
                    reportActionID: 'onboarding-msg',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    created: '2024-06-01 11:59:30.000',
                    actorAccountID: 456,
                    message: [{type: 'COMMENT', html: 'Welcome to Expensify!', text: 'Welcome to Expensify!'}],
                    originalMessage: {},
                    shouldShow: true,
                    person: [{type: 'TEXT', style: 'strong', text: 'Concierge'}],
                    pendingAction: null,
                    errors: {},
                },
            ];

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: onboardingActions,
                hasOlderActions: false,
            });

            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            expect(mockLegendList).toHaveBeenCalled();
            const passedActions = getCapturedVisibleActions();
            // New user with no prior messages — onboarding messages pass through (no filtering)
            expect(passedActions?.some((a) => a.reportActionID === 'onboarding-msg')).toBe(true);
        });

        it('should call startSession on mount for main DM concierge', () => {
            const mockStartSession = jest.fn();
            mockUseConciergeSessionActions.mockReturnValue({startSession: mockStartSession, setShowFullHistory: jest.fn(), setHadMessagesAtSessionStart: jest.fn()});
            setupMainDMConciergeMocks();
            mockUseConciergeSessionActions.mockReturnValue({startSession: mockStartSession, setShowFullHistory: jest.fn(), setHadMessagesAtSessionStart: jest.fn()});

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: oldReportActions,
                hasOlderActions: false,
            });

            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            expect(mockStartSession).toHaveBeenCalled();
        });

        it('should render cached actions without a skeleton on refresh when hasOnceLoadedReportActions resets but actions are cached', () => {
            // Simulates a page refresh: hasOnceLoadedReportActions is RAM-only and resets to false,
            // but report actions persist in Onyx cache. We should render them immediately (production behavior).
            setupMainDMConciergeMocks(SESSION_START, false, false);

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: oldReportActions,
                hasOlderActions: false,
            });

            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
            expect(mockLegendList).toHaveBeenCalled();
        });

        it('should show a skeleton on a cold load when hasOnceLoadedReportActions is false and there are no cached actions', () => {
            setupMainDMConciergeMocks(SESSION_START, false, false);

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [],
                hasOlderActions: false,
            });

            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
            // The concierge-hidden-history skeleton shows while the report is otherwise "ready"; the content
            // is still not mounted, so the UI-close hooks never run here either.
            expect(mockUseMarkAsRead).not.toHaveBeenCalled();
            expect(mockUseReportActionsScroll).not.toHaveBeenCalled();
        });
    });
});

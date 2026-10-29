import {act, render, screen, waitFor} from '@testing-library/react-native';

import type {RenderActionSheetAwareScrollViewComponent} from '@components/ActionSheetAwareScrollView/types';
import allowLegendListItemOverflow from '@components/LegendList/allowLegendListItemOverflow';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useIsReportLoadPending} from '@hooks/useInFlightRequests';
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
import type * as InFlightRequests from '@hooks/useInFlightRequests';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import type useReportActionsScroll from '@hooks/useReportActionsScroll';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import DateUtils from '@libs/DateUtils';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';

import {ActionListContext} from '@pages/inbox/ActionListContext';
import type ActionListRefType from '@pages/inbox/ActionListTypes';
import {useConciergeChatHistoryActions, useConciergeChatHistoryState} from '@pages/inbox/ConciergeChatHistoryContext';
import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import CollapsedSystemMessages from '@pages/inbox/report/CollapsedSystemMessages';
import ReportActionsList from '@pages/inbox/report/ReportActionsList';
import ReportActionsListItemRenderer from '@pages/inbox/report/ReportActionsListItemRenderer';
import useScrollToEditingReportAction from '@pages/inbox/report/useScrollToEditingReportAction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {reportActionsListLoadingStateSelector} from '@src/selectors/ReportMetaData';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnViewableItemsChangedInfo} from '@legendapp/list/react-native';
import type * as ReactNavigation from '@react-navigation/native';
import type {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import type ReactNative from 'react-native';

import {useRoute} from '@react-navigation/native';
import React from 'react';
import {Platform, StyleSheet} from 'react-native';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {buildSystemAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockUseIsFocused = jest.fn().mockReturnValue(false);
jest.unmock('@components/ActionSheetAwareScrollView');
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
jest.mock('@pages/inbox/report/AskConciergeWelcome', () => {
    const {View} = jest.requireActual<typeof ReactNative>('react-native');
    return () => <View testID="AskConciergeWelcome" />;
});
jest.mock('@hooks/useInFlightRequests', () => ({
    ...jest.requireActual<typeof InFlightRequests>('@hooks/useInFlightRequests'),
    useIsReportLoadPending: jest.fn(),
}));
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@pages/inbox/report/useScrollToEditingReportAction', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useTransactionsAndViolationsForReport', () => jest.fn());
jest.mock('@hooks/usePaginatedReportActions', () => jest.fn());
jest.mock('@hooks/useParentReportAction', () => jest.fn());
jest.mock('@hooks/useIsInSidePanel', () => jest.fn());
jest.mock('@hooks/useSidePanelState', () => jest.fn());
jest.mock('@hooks/useReportTransactionsCollection', () => jest.fn());
jest.mock('@components/LegendList/allowLegendListItemOverflow', () => jest.fn());
jest.mock('@pages/inbox/ConciergeChatHistoryContext', () => ({
    useConciergeChatHistoryState: jest.fn(),
    useConciergeChatHistoryActions: jest.fn(),
}));
jest.mock('@pages/inbox/ConciergeDraftContext', () => ({
    useConciergeDraft: jest.fn(),
    useConciergeDraftActions: jest.fn(),
}));

const mockUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockUseRoute = useRoute as jest.MockedFunction<typeof useRoute>;
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
const mockUseConciergeChatHistoryState = useConciergeChatHistoryState as jest.MockedFunction<typeof useConciergeChatHistoryState>;
const mockUseConciergeChatHistoryActions = useConciergeChatHistoryActions as jest.MockedFunction<typeof useConciergeChatHistoryActions>;
const mockAllowLegendListItemOverflow = allowLegendListItemOverflow as jest.MockedFunction<typeof allowLegendListItemOverflow>;

function getMockReportLoadingState(selector: unknown, hasOnceLoadedReportActions = true, isLoadingInitialReportActions = false, isLoadingOlderReportActions = false) {
    return selector === reportActionsListLoadingStateSelector
        ? {hasOnceLoadedReportActions, isLoadingInitialReportActions, isLoadingOlderReportActions, hasLoadingOlderReportActionsError: false}
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
const mockLegendScrollToEnd = jest.fn();
const mockLegendScrollToIndex = jest.fn();
const mockLegendPositionByKey = jest.fn(() => 1500);
const mockLegendGetState = jest.fn(() => ({
    positionByKey: mockLegendPositionByKey,
    start: 2,
    end: 4,
    isAtEnd: false,
    contentLength: 1000,
    scrollLength: 500,
    scroll: 500,
}));
const mockLegendGetScrollableNode = jest.fn(() => ({scrollTop: 0}));
let mockShouldCallLegendListOnLoad = true;
jest.mock('@legendapp/list/react-native', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    const MockLegendListContent = reactModule.forwardRef<{scrollToEnd: typeof mockLegendScrollToEnd}, {onLoad?: () => void; onReady?: () => void}>(({onLoad, onReady}, ref) => {
        reactModule.useImperativeHandle(
            ref,
            () => ({scrollToEnd: mockLegendScrollToEnd, scrollToIndex: mockLegendScrollToIndex, getState: mockLegendGetState, getScrollableNode: mockLegendGetScrollableNode}),
            [],
        );
        reactModule.useEffect(() => {
            mockLegendListMount();
            if (mockShouldCallLegendListOnLoad) {
                onLoad?.();
                onReady?.();
            }
            return () => {
                mockLegendListUnmount();
            };
        }, []);
        return null;
    });
    return {
        LegendList: jest.fn((props: {onLoad?: () => void; onReady?: () => void; ref?: React.Ref<{scrollToEnd: typeof mockLegendScrollToEnd}>}) =>
            reactModule.createElement(MockLegendListContent, props),
        ),
    };
});
jest.mock('@hooks/useUnreadMarker', () => jest.fn(() => ({unreadMarkerReportActionID: null, unreadMarkerReportActionIndex: -1})));
jest.mock('@hooks/useMarkAsRead', () => jest.fn(() => ({markNewestActionAsRead: jest.fn(), completeSkippedMarkAsRead: jest.fn()})));
jest.mock('@hooks/useReportActionsScroll', () =>
    jest.fn(() => ({
        listRef: {current: null},
        trackLinkedMessageScroll: jest.fn(),
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
        onItemSizeChanged: jest.fn(),
        stopLinkedMessagePositioning: jest.fn(),
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
    contentContainerStyle?: StyleProp<ViewStyle>;
    data?: OnyxTypes.ReportAction[];
    drawDistance?: number;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    experimental_hideItemsUntilMeasured?: boolean;
    extraData?: unknown;
    getItemType?: (item: OnyxTypes.ReportAction) => string;
    initialScrollAtEnd?: boolean;
    maintainScrollAtEnd?: {animated: boolean; on: {dataChange: boolean}} | false;
    maintainScrollAtEndThreshold?: number;
    maintainVisibleContentPosition?: boolean;
    onLayout?: (event: LayoutChangeEvent) => void;
    onLoad?: () => void;
    onReady?: () => void;
    onScrollBeginDrag?: () => void;
    onStartReachedThreshold?: number;
    onContentSizeChange?: (width: number, height: number) => void;
    onViewableItemsChanged?: (info: OnViewableItemsChangedInfo<OnyxTypes.ReportAction>) => void;
    recycleItems?: boolean;
    renderItem?: (info: {item: OnyxTypes.ReportAction; index: number}) => React.ReactElement | null;
    renderScrollComponent?: RenderActionSheetAwareScrollViewComponent;
    scrollEventThrottle?: number;
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

const getRenderedReportActionsListItemProps = (
    reportAction: OnyxTypes.ReportAction,
    index = 0,
): {shouldDisableContextMenuForConciergeDraft?: boolean; isLatestConciergeFeedbackAction?: boolean; shouldDisplayNewMarker?: boolean; displayAsGroup?: boolean} => {
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

const getShowHistoryPress = (action: OnyxTypes.ReportAction, index: number): (() => void) | undefined => {
    const renderedItem = getCapturedListProps()?.renderItem?.({item: action, index});
    if (!React.isValidElement<{children: React.ReactNode}>(renderedItem)) {
        return undefined;
    }
    const historyButton = React.Children.toArray(renderedItem.props.children).find(
        (child): child is React.ReactElement<{onPress: () => void}> => React.isValidElement<{onPress?: () => void}>(child) && typeof child.props.onPress === 'function',
    );
    return historyButton?.props.onPress;
};

const findRenderedElement = <Props,>(node: React.ReactNode, type: React.ElementType): React.ReactElement<Props> | undefined => {
    if (React.isValidElement<Props>(node) && node.type === type) {
        return node;
    }
    if (!React.isValidElement<{children?: React.ReactNode}>(node)) {
        return undefined;
    }
    for (const child of React.Children.toArray(node.props.children)) {
        const match = findRenderedElement<Props>(child, type);
        if (match) {
            return match;
        }
    }
    return undefined;
};

const mockUseMarkAsRead: jest.Mock = jest.requireMock('@hooks/useMarkAsRead');
const mockUseUnreadMarker: jest.Mock = jest.requireMock('@hooks/useUnreadMarker');
const mockUseReportActionsScroll: jest.MockedFunction<typeof useReportActionsScroll> = jest.requireMock('@hooks/useReportActionsScroll');
const mockMarkOpenReportEnd: jest.Mock = jest.requireMock('@libs/telemetry/markOpenReportEnd');
let mockHasOnceLoadedReportActions = true;
let mockIsLoadingInitialReportActions = false;
let mockIsLoadingOlderReportActions = false;

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

// useReportActionsListModel derives app-load state from the request queue via useIsAppLoadPending,
// which reads these queue keys through selectors that resolve to a boolean. Returning that boolean
// directly mirrors what useOnyx yields once the selector runs. The legacy IS_LOADING_APP flag is kept
// in the fixture for any component still reading it directly.
const getMockOnyxValue: Parameters<typeof mockUseOnyx.mockImplementation>[0] = (key: string, options) => {
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
};

describe('ReportActionsList (body)', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseIsFocused.mockReturnValue(false);
        mockHasOnceLoadedReportActions = true;
        mockIsLoadingInitialReportActions = false;
        mockIsLoadingOlderReportActions = false;
        mockShouldCallLegendListOnLoad = true;
        mockUseUnreadMarker.mockReturnValue({unreadMarkerReportActionID: null, unreadMarkerReportActionIndex: -1});
        mockUseIsReportLoadPending.mockReturnValue(false);
        mockUseRoute.mockReturnValue({key: 'report', name: 'Report', params: {}});

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
        mockUseConciergeChatHistoryState.mockReturnValue({showFullHistory: false, isHistoryCollapsedByUser: false});
        mockUseConciergeChatHistoryActions.mockReturnValue({setShowFullHistory: jest.fn(), collapseHistory: jest.fn()});

        mockUseOnyx.mockImplementation((key, options) => {
            if (key.includes('reportLoadingState')) {
                return [getMockReportLoadingState(options?.selector, mockHasOnceLoadedReportActions, mockIsLoadingInitialReportActions, mockIsLoadingOlderReportActions), {status: 'loaded'}];
            }
            return getMockOnyxValue(key, options);
        });
    });

    afterEach(async () => {
        await waitForBatchedUpdatesWithAct();
        await Onyx.clear();
    });

    it('publishes measured positions, the live visible range, and the scroll element through the action-list adapter', () => {
        // Given a mounted LegendList with measured rows and its own scroll element.
        mockUseNetwork.mockReturnValue({isOffline: false});
        const registerListRef = jest.fn<void, [ActionListRefType]>();
        const contextValue = {scrollOffsetRef: {current: 0}, getScrollOffset: () => 0, getListRef: () => null, registerListRef};
        render(
            // The shared context intentionally combines stable refs with their accessors.
            // eslint-disable-next-line rulesdir/context-provider-split-values
            <ActionListContext.Provider value={contextValue}>
                <ReportActionsList
                    reportID={mockReport.reportID}
                    conciergeChat={undefined}
                />
            </ActionListContext.Provider>,
        );

        // When linked positioning reads the registered adapter rather than the raw LegendList ref.
        const adapter = registerListRef.mock.calls.at(-1)?.at(0)?.current;
        const position = adapter?.getState?.()?.positionByKey('linked-action');
        const scrollElement = adapter?.getScrollableNode?.();
        const visibleRange = adapter?.computeVisibleIndices?.();

        // Then measurement recovery and web input cancellation can reach the real list.
        expect(position).toBe(1500);
        expect(mockLegendPositionByKey).toHaveBeenCalledWith('linked-action');
        expect(scrollElement).toEqual({scrollTop: 0});
        expect(mockLegendGetScrollableNode).toHaveBeenCalledTimes(1);
        expect(visibleRange).toEqual({startIndex: 2, endIndex: 4});
    });

    it('corrects the initial end position after the latest row has been measured', async () => {
        // Given a report opens at its latest action and the virtualized list finishes its initial placement.
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderReportActionsList();

        // When the last row is taller than the estimate, its feedback controls must not remain below the viewport.
        // Then the list makes one final end scroll after the layout is ready.
        await waitFor(() => expect(mockLegendScrollToEnd).toHaveBeenCalledWith({animated: false}));
    });

    it('keeps the native scroll-view throttle supplied by LegendList', () => {
        // Given a report list using the action-sheet-aware native scroller.
        mockUseNetwork.mockReturnValue({isOffline: false});
        const platform = jest.replaceProperty(Platform, 'OS', 'android');
        try {
            renderReportActionsList();
            const listProps = getCapturedListProps();

            // When LegendList requests native scroll events on every frame.
            const scrollView = listProps?.renderScrollComponent?.({scrollEventThrottle: 0});

            // Then the wrapper preserves them while LegendList separately throttles the app callback.
            expect(scrollView?.props.scrollEventThrottle).toBe(0);
            expect(listProps?.scrollEventThrottle).toBe(16);
        } finally {
            platform.restore();
        }
    });

    it.each([800, 1000])('refreshes the newest-message offset without following successive viewport layouts at %i pixels', async (height) => {
        // Given a reader 600 pixels from the end before the viewport grows.
        mockUseNetwork.mockReturnValue({isOffline: false});
        const originalState = mockLegendGetState();
        const scrollOffsetRef = {current: 600};
        const contextValue = {scrollOffsetRef, getScrollOffset: () => scrollOffsetRef.current, getListRef: () => null, registerListRef: jest.fn()};
        render(
            // The shared context intentionally combines stable refs with their accessors.
            // eslint-disable-next-line rulesdir/context-provider-split-values
            <ActionListContext.Provider value={contextValue}>
                <ReportActionsList
                    reportID={mockReport.reportID}
                    conciergeChat={undefined}
                />
            </ActionListContext.Provider>,
        );
        await waitFor(() => expect(mockLegendScrollToEnd).toHaveBeenCalled());
        mockLegendScrollToEnd.mockClear();
        const frames: FrameRequestCallback[] = [];
        const requestFrame = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => frames.push(callback));
        try {
            act(() => {
                const listProps = getCapturedListProps();
                listProps?.onScrollBeginDrag?.();
                listProps?.onScroll?.({
                    nativeEvent: {
                        contentOffset: {x: 0, y: 900},
                        contentSize: {height: 2000, width: 300},
                        layoutMeasurement: {height: 500, width: 300},
                    },
                });
            });

            // When successive layouts resize the viewport without new content or scroll events.
            for (const viewportHeight of [height, height + 50]) {
                mockLegendGetState.mockReturnValue({...originalState, contentLength: 2000, scrollLength: viewportHeight, scroll: 900});
                act(() => getCapturedListProps()?.onLayout?.(createMock<LayoutChangeEvent>({nativeEvent: {layout: {x: 0, y: 0, width: 300, height: viewportHeight}}})));

                // Then a future incoming message uses the current pixel offset without resizing itself starting a scroll.
                expect(scrollOffsetRef.current).toBe(2000 - viewportHeight - 900);
                expect(frames).toHaveLength(0);
            }
            expect(mockLegendScrollToEnd).not.toHaveBeenCalled();
            expect(getCapturedListProps()?.maintainScrollAtEnd).toBe(false);
        } finally {
            requestFrame.mockRestore();
            mockLegendGetState.mockReturnValue(originalState);
        }
    });

    it('keeps following the newest action when the keyboard shrinks the viewport', async () => {
        // Given the reader is following the newest action before opening the keyboard.
        mockUseNetwork.mockReturnValue({isOffline: false});
        const originalState = mockLegendGetState();
        renderReportActionsList();
        await waitFor(() => expect(mockLegendScrollToEnd).toHaveBeenCalled());
        mockLegendScrollToEnd.mockClear();
        try {
            // When the smaller viewport temporarily leaves the newest action 300 pixels below it.
            mockLegendGetState.mockReturnValue({...originalState, contentLength: 1000, scrollLength: 200, scroll: 500});
            act(() => getCapturedListProps()?.onLayout?.(createMock<LayoutChangeEvent>({nativeEvent: {layout: {x: 0, y: 0, width: 300, height: 200}}})));

            // Then resizing keeps the existing end-following intent.
            await waitFor(() => expect(mockLegendScrollToEnd).toHaveBeenCalledWith({animated: false}));
        } finally {
            mockLegendGetState.mockReturnValue(originalState);
        }
    });

    it('keeps the latest message visible when its measured height grows after opening', async () => {
        // Given the chat has opened at the end with a measured viewport.
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderReportActionsList();
        await waitFor(() => expect(mockLegendScrollToEnd).toHaveBeenCalledWith({animated: false}));
        mockLegendScrollToEnd.mockClear();
        const listProps = getCapturedListProps();
        act(() => {
            listProps?.onScroll?.({
                nativeEvent: {
                    contentOffset: {x: 0, y: 500},
                    contentSize: {height: 1000, width: 300},
                    layoutMeasurement: {height: 500, width: 300},
                },
            });
        });

        // When a late feedback row makes the content taller without a user scroll.
        act(() => {
            listProps?.onScroll?.({
                nativeEvent: {
                    contentOffset: {x: 0, y: 500},
                    contentSize: {height: 1025, width: 300},
                    layoutMeasurement: {height: 500, width: 300},
                },
            });
            listProps?.onContentSizeChange?.(300, 1025);
        });

        // Then the last 25 pixels are brought into view.
        await waitFor(() => expect(mockLegendScrollToEnd).toHaveBeenCalledWith({animated: false}));
    });

    it('follows content growth when the reader is 50 pixels above the newest action', async () => {
        // Given a reader still within the existing 250-pixel follow distance.
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderReportActionsList();
        await waitFor(() => expect(mockLegendScrollToEnd).toHaveBeenCalled());
        mockLegendScrollToEnd.mockClear();
        act(() => {
            const listProps = getCapturedListProps();
            listProps?.onScrollBeginDrag?.();
            listProps?.onScroll?.({
                nativeEvent: {
                    contentOffset: {x: 0, y: 450},
                    contentSize: {height: 1000, width: 300},
                    layoutMeasurement: {height: 500, width: 300},
                },
            });
        });

        // When a new message or streamed text increases the content height.
        act(() => getCapturedListProps()?.onContentSizeChange?.(300, 1025));

        // Then it follows the new content even though the reader is more than 1% from the end.
        await waitFor(() => expect(mockLegendScrollToEnd).toHaveBeenCalledWith({animated: false}));
    });

    it('does not pull the chat back down when the reader has scrolled away', async () => {
        // Given the chat opened at the end and the reader scrolled upward.
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderReportActionsList();
        await waitFor(() => expect(mockLegendScrollToEnd).toHaveBeenCalledWith({animated: false}));
        mockLegendScrollToEnd.mockClear();
        const listProps = getCapturedListProps();
        act(() => {
            listProps?.onScroll?.({
                nativeEvent: {
                    contentOffset: {x: 0, y: 500},
                    contentSize: {height: 1000, width: 300},
                    layoutMeasurement: {height: 500, width: 300},
                },
            });
            listProps?.onScroll?.({
                nativeEvent: {
                    contentOffset: {x: 0, y: 200},
                    contentSize: {height: 1000, width: 300},
                    layoutMeasurement: {height: 500, width: 300},
                },
            });
            listProps?.onContentSizeChange?.(300, 1025);
        });

        // When content grows, the reader's position stays where they left it.
        await act(
            async () =>
                new Promise<void>((resolve) => {
                    setTimeout(resolve, 30);
                }),
        );
        expect(mockLegendScrollToEnd).not.toHaveBeenCalled();
    });

    it('resumes resize following after scrolling from a linked action to the end', async () => {
        // Given the chat opens at a linked action, which must keep its initial position.
        mockUseNetwork.mockReturnValue({isOffline: false});
        const originalImplementation = mockUseReportActionsScroll.getMockImplementation();
        const defaultScrollState = mockUseReportActionsScroll(createMock<Parameters<typeof useReportActionsScroll>[0]>({}));
        mockUseReportActionsScroll.mockReturnValue({...defaultScrollState, initialScrollIndex: 0});
        try {
            renderReportActionsList();
            expect(mockLegendScrollToEnd).not.toHaveBeenCalled();

            // When the reader reaches the end and the latest row grows afterward.
            act(() => {
                const listProps = getCapturedListProps();
                listProps?.onScroll?.({
                    nativeEvent: {
                        contentOffset: {x: 0, y: 500},
                        contentSize: {height: 1000, width: 300},
                        layoutMeasurement: {height: 500, width: 300},
                    },
                });
                listProps?.onContentSizeChange?.(300, 1025);
            });

            // Then the latest content remains visible even though the route still contains a linked action.
            await waitFor(() => expect(mockLegendScrollToEnd).toHaveBeenCalledWith({animated: false}));
        } finally {
            mockUseReportActionsScroll.mockImplementation(originalImplementation);
        }
    });

    it.each([
        {isAtEnd: true, shouldFollowEnd: true},
        {isAtEnd: false, shouldFollowEnd: false},
    ])('follows late row growth after opening at an unread marker only when it lands at the end ($isAtEnd)', async ({isAtEnd, shouldFollowEnd}) => {
        // Given the chat opens at an unread marker, which LegendList clamps to the end when the marker is near the newest action.
        mockUseNetwork.mockReturnValue({isOffline: false});
        const originalImplementation = mockUseReportActionsScroll.getMockImplementation();
        const defaultScrollState = mockUseReportActionsScroll(createMock<Parameters<typeof useReportActionsScroll>[0]>({}));
        mockUseReportActionsScroll.mockReturnValue({...defaultScrollState, initialScrollIndex: 1});
        mockLegendGetState.mockReturnValue({...mockLegendGetState(), isAtEnd});
        try {
            renderReportActionsList();

            // When rows above the viewport are measured after the list is ready and change the content height.
            act(() => {
                getCapturedListProps()?.onContentSizeChange?.(300, 1025);
            });
            await act(
                async () =>
                    new Promise<void>((resolve) => {
                        setTimeout(resolve, 30);
                    }),
            );

            // Then a list that landed at the end keeps the newest messages in view, and one showing older unread messages stays put.
            if (shouldFollowEnd) {
                expect(mockLegendScrollToEnd).toHaveBeenCalledWith({animated: false});
            } else {
                expect(mockLegendScrollToEnd).not.toHaveBeenCalled();
            }
        } finally {
            mockUseReportActionsScroll.mockImplementation(originalImplementation);
            mockLegendGetState.mockReturnValue({...mockLegendGetState(), isAtEnd: false});
        }
    });

    it('cancels a queued end correction as soon as the reader starts dragging', async () => {
        // Given removing the latest message has queued a layout correction at the end.
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderReportActionsList();
        await waitFor(() => expect(mockLegendScrollToEnd).toHaveBeenCalled());
        mockLegendScrollToEnd.mockClear();
        const animationFrames: FrameRequestCallback[] = [];
        const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
            animationFrames.push(callback);
            return animationFrames.length;
        });
        try {
            const listProps = getCapturedListProps();
            // When the user touches the list before the next scroll metrics arrive.
            act(() => {
                listProps?.onContentSizeChange?.(300, 900);
                listProps?.onScrollBeginDrag?.();
                for (const callback of animationFrames) {
                    callback(0);
                }
            });

            // Then even a callback already dispatched by the frame scheduler respects the gesture.
            expect(mockLegendScrollToEnd).not.toHaveBeenCalled();
        } finally {
            requestAnimationFrameSpy.mockRestore();
        }
    });

    it('keeps linked positioning active through automatic scroll metrics until the reader drags', () => {
        // Given a measured linked target can cause automatic scroll compensation before its preview settles.
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderReportActionsList();
        const scrollHookResult = mockUseReportActionsScroll.mock.results.at(-1)?.value as ReturnType<typeof useReportActionsScroll>;
        const stopLinkedPositioning = scrollHookResult.stopLinkedMessagePositioning;
        const listProps = getCapturedListProps();

        // When layout compensation moves the list without a user gesture.
        act(() => {
            for (const offset of [200, 100]) {
                listProps?.onScroll?.({
                    nativeEvent: {
                        contentOffset: {x: 0, y: offset},
                        contentSize: {height: 2000, width: 300},
                        layoutMeasurement: {height: 100, width: 300},
                    },
                });
            }
        });

        // Then later preview measurements can still correct the target, until the reader takes over.
        expect(stopLinkedPositioning).not.toHaveBeenCalled();
        act(() => listProps?.onScrollBeginDrag?.());
        expect(stopLinkedPositioning).toHaveBeenCalledTimes(1);
    });

    it('does not duplicate the composer spacing inside the chronological list', () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderReportActionsList();

        expect(StyleSheet.flatten(getCapturedListProps()?.contentContainerStyle)?.paddingBottom).toBe(0);
    });

    it('invalidates a recycled row when the unread marker changes on a wide layout', () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockUseUnreadMarker.mockReturnValue({unreadMarkerReportActionID: '2', unreadMarkerReportActionIndex: 0});
        renderReportActionsList();

        expect(getCapturedListProps()?.extraData).toEqual(expect.arrayContaining(['2']));
        const markerAction = getCapturedVisibleActions()?.find((action) => action.reportActionID === '2');
        if (!markerAction) {
            throw new Error('Expected unread marker action fixture');
        }
        expect(getRenderedReportActionsListItemProps(markerAction, 1).shouldDisplayNewMarker).toBe(true);
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
        mockLegendScrollToEnd.mockClear();

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
        await waitFor(() => expect(mockLegendScrollToEnd).toHaveBeenCalledWith({animated: false}));
    });

    it('keeps the initial viewport covered until the hydrated LegendList finishes rendering it', async () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockUseIsFocused.mockReturnValue(true);
        mockHasOnceLoadedReportActions = false;
        mockIsLoadingInitialReportActions = true;
        mockShouldCallLegendListOnLoad = false;
        const view = renderReportActionsList();

        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();

        act(() => {
            getCapturedListProps()?.onReady?.();
        });
        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
        expect(mockMarkOpenReportEnd).not.toHaveBeenCalledWith(mockReport.reportID, mockReport, {warm: true});

        mockHasOnceLoadedReportActions = true;
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
                onLayout={jest.fn()}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();

        act(() => {
            getCapturedListProps()?.onReady?.();
        });
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
        expect(mockMarkOpenReportEnd).toHaveBeenCalledWith(mockReport.reportID, mockReport, {warm: true});
    });

    it('resumes initial scroll tracking after layout and scrolling are ready', () => {
        // Given a report with its action list ready to mount.
        mockShouldCallLegendListOnLoad = false;
        renderReportActionsList();
        const scrollHookResult = mockUseReportActionsScroll.mock.results.at(-1)?.value as {onLoad?: jest.Mock} | undefined;
        const onLoad = scrollHookResult?.onLoad;
        expect(onLoad).not.toHaveBeenCalled();

        // When LegendList reports that layout and initial scrolling are complete.
        act(() => getCapturedListProps()?.onReady?.());

        // Then the scroll hook receives that event to finish initial positioning.
        expect(onLoad).toHaveBeenCalledTimes(1);
    });

    it('covers a previously hydrated report until LegendList finishes its initial layout', () => {
        // Given a report that was already loaded before this list mounted
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockShouldCallLegendListOnLoad = false;

        // When the user opens the report again
        renderReportActionsList();

        // Then the cover hides LegendList's empty initial viewport until its actions are ready
        expect(getCapturedVisibleActions()).toHaveLength(mockReportActions.length);
        expect(screen.getByTestId('ReportActionsSkeletonCover')).toBeTruthy();

        act(() => getCapturedListProps()?.onLoad?.());
        expect(screen.getByTestId('ReportActionsSkeletonCover')).toBeTruthy();

        act(() => getCapturedListProps()?.onReady?.());
        expect(screen.queryByTestId('ReportActionsSkeletonCover')).toBeNull();
    });

    it('keeps the positioned list mounted when sending a message clears the linked action', async () => {
        // Given a linked message has finished its initial positioning.
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockUseRoute.mockReturnValue({key: 'report', name: 'Report', params: {reportActionID: '2'}});
        const view = renderReportActionsList();
        expect(screen.queryByTestId('ReportActionsSkeletonCover')).toBeNull();

        // When the live-tail jump clears the link, a new mount would have to position again.
        mockShouldCallLegendListOnLoad = false;
        mockUseRoute.mockReturnValue({key: 'report', name: 'Report', params: {reportActionID: ''}});
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
                onLayout={jest.fn()}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the existing list stays visible without another initial skeleton.
        expect(mockLegendListMount).toHaveBeenCalledTimes(1);
        expect(mockLegendListUnmount).not.toHaveBeenCalled();
        expect(screen.queryByTestId('ReportActionsSkeletonCover')).toBeNull();
    });

    it.each(['2', 'another-action'])('positions a newly opened link after the previous link was cleared: %s', async (reportActionID) => {
        // Given a positioned linked list is kept mounted when returning to its latest messages.
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockUseRoute.mockReturnValue({key: 'report', name: 'Report', params: {reportActionID: '2'}});
        const view = renderReportActionsList();
        mockUseRoute.mockReturnValue({key: 'report', name: 'Report', params: {reportActionID: ''}});
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
                onLayout={jest.fn()}
            />,
        );
        await waitForBatchedUpdatesWithAct();
        expect(mockLegendListMount).toHaveBeenCalledTimes(1);

        // When the reader opens a link, even if it targets the same action again.
        mockShouldCallLegendListOnLoad = false;
        mockUseRoute.mockReturnValue({key: 'report', name: 'Report', params: {reportActionID}});
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
                onLayout={jest.fn()}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then fresh positioning is covered until the new list is ready.
        expect(mockLegendListMount).toHaveBeenCalledTimes(2);
        expect(screen.getByTestId('ReportActionsSkeletonCover')).toBeTruthy();
        act(() => getCapturedListProps()?.onReady?.());
        expect(screen.queryByTestId('ReportActionsSkeletonCover')).toBeNull();
    });

    it('releases the initial viewport cover after a terminal OpenReport failure', () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockHasOnceLoadedReportActions = false;
        mockIsLoadingInitialReportActions = false;
        mockShouldCallLegendListOnLoad = false;
        renderReportActionsList();

        expect(screen.getByTestId('ReportActionsSkeletonCover')).toBeTruthy();

        act(() => {
            getCapturedListProps()?.onReady?.();
        });

        expect(screen.queryByTestId('ReportActionsSkeletonCover')).toBeNull();
    });

    it('keeps the initial viewport covered while OpenReport is queued despite stale stored loading state', () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockHasOnceLoadedReportActions = false;
        mockIsLoadingInitialReportActions = false;
        mockUseIsReportLoadPending.mockReturnValue(true);
        mockShouldCallLegendListOnLoad = false;
        const view = renderReportActionsList();

        act(() => {
            getCapturedListProps()?.onReady?.();
        });
        expect(screen.getByTestId('ReportActionsSkeletonCover')).toBeTruthy();

        mockUseIsReportLoadPending.mockReturnValue(false);
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
                onLayout={jest.fn()}
            />,
        );

        expect(screen.queryByTestId('ReportActionsSkeletonCover')).toBeNull();
    });

    it('keeps the initial actions visible until the hydrated page is complete', async () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockHasOnceLoadedReportActions = false;
        mockIsLoadingInitialReportActions = true;
        const groupingSpy = jest.spyOn(ReportActionsUtils, 'isConsecutiveActionMadeByPreviousActor');
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

        const snapshotActions = getCapturedVisibleActions();
        const oldestSnapshotAction = snapshotActions?.at(0);
        if (!oldestSnapshotAction || !snapshotActions) {
            throw new Error('Expected the initial action snapshot to remain visible');
        }
        getRenderedReportActionsListItemProps(oldestSnapshotAction);
        expect(groupingSpy).toHaveBeenLastCalledWith(snapshotActions.toReversed(), snapshotActions.length - 1, false);
        groupingSpy.mockRestore();

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

    it.each([
        {isOffline: true, isLoadingInitialReportActions: true},
        {isOffline: false, isLoadingInitialReportActions: false},
    ])('keeps actions live after a first load cannot complete: %p', async ({isOffline, isLoadingInitialReportActions}) => {
        // Given cached actions with no successful OpenReport response
        mockUseNetwork.mockReturnValue({isOffline});
        mockHasOnceLoadedReportActions = false;
        mockIsLoadingInitialReportActions = isLoadingInitialReportActions;
        const view = renderReportActionsList();

        // When an optimistic action is added while offline or after a terminal load failure
        const existingAction = mockReportActions.at(1);
        if (!existingAction) {
            throw new Error('Expected a cached report action');
        }
        mockUsePaginatedReportActions.mockReturnValue({
            ...defaultPaginatedReportActionsResult,
            reportActions: [
                {
                    ...existingAction,
                    reportActionID: 'new-comment',
                    created: '2023-01-03',
                },
                ...mockReportActions,
            ],
        });
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
                onLayout={jest.fn()}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        // Then the new action appears without waiting for hydration
        expect(getCapturedVisibleActions()?.at(-1)?.reportActionID).toBe('new-comment');
    });

    it('keeps offline additions visible when reconnecting during the initial load', async () => {
        // Given a cached report whose initial request is still pending.
        mockUseNetwork.mockReturnValue({isOffline: false});
        mockHasOnceLoadedReportActions = false;
        mockIsLoadingInitialReportActions = true;
        const view = renderReportActionsList();
        const existingAction = mockReportActions.at(1);
        if (!existingAction) {
            throw new Error('Expected a cached report action');
        }
        const renderList = () =>
            view.rerender(
                <ReportActionsList
                    reportID={mockReport.reportID}
                    conciergeChat={undefined}
                    onLayout={jest.fn()}
                />,
            );

        // When an action is added offline and the connection returns before hydration.
        mockUseNetwork.mockReturnValue({isOffline: true});
        mockUsePaginatedReportActions.mockReturnValue({
            ...defaultPaginatedReportActionsResult,
            reportActions: [{...existingAction, reportActionID: 'offline-comment', created: '2023-01-03'}, ...mockReportActions],
        });
        renderList();
        await waitForBatchedUpdatesWithAct();
        expect(getCapturedVisibleActions()?.at(-1)?.reportActionID).toBe('offline-comment');
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderList();
        await waitForBatchedUpdatesWithAct();

        // Then the list does not revert to the earlier cached snapshot.
        expect(getCapturedVisibleActions()?.at(-1)?.reportActionID).toBe('offline-comment');
    });

    it('keeps a hydrated list mounted when its RAM-only loading entry briefly regresses', async () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        const view = renderReportActionsList();

        expect(mockLegendListMount).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();

        mockHasOnceLoadedReportActions = false;
        mockIsLoadingInitialReportActions = true;
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
                onLayout={jest.fn()}
            />,
        );
        await waitForBatchedUpdatesWithAct();

        expect(mockLegendListMount).toHaveBeenCalledTimes(1);
        expect(mockLegendListUnmount).not.toHaveBeenCalled();
        expect(screen.queryByTestId('ReportActionsSkeletonView')).toBeNull();
    });

    it('limits the render buffer and enables item recycling', () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderReportActionsList();

        const listProps = getCapturedListProps();

        expect(listProps?.drawDistance).toBe(1500);
        expect(listProps?.recycleItems).toBe(true);
        expect(listProps?.experimental_hideItemsUntilMeasured).toBe(true);
    });

    it('allows visible report action menus to overflow their LegendList item containers', () => {
        mockUseNetwork.mockReturnValue({isOffline: false});
        renderReportActionsList();
        const hiddenAction = mockReportActions.at(0);
        const visibleAction = mockReportActions.at(1);
        if (!hiddenAction || !visibleAction) {
            throw new Error('Expected report action fixtures');
        }

        act(() => {
            getCapturedListProps()?.onViewableItemsChanged?.({
                changed: [
                    {containerId: 1, index: 1, isViewable: true, item: visibleAction, key: '1'},
                    {containerId: 0, index: 0, isViewable: false, item: hiddenAction, key: '0'},
                ],
                end: 1,
                endBuffered: 1,
                start: 0,
                startBuffered: 0,
                viewableItems: [],
            });
        });

        expect(mockAllowLegendListItemOverflow).toHaveBeenCalledTimes(1);
        expect(mockAllowLegendListItemOverflow).toHaveBeenCalledWith(expect.objectContaining({scrollToEnd: mockLegendScrollToEnd}), 1);
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
                message: [{type: 'COMMENT', html: 'Medium comment', text: 'a'.repeat(320)}],
            }),
        ).toBe(`${CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}-medium`);
        expect(
            getItemType?.({
                ...comment,
                reportActionID: 'long-comment',
                message: [{type: 'COMMENT', html: 'Long comment', text: 'a'.repeat(1200)}],
            }),
        ).toBe(`${CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT}-long`);
        expect(
            getItemType?.({
                ...comment,
                reportActionID: 'extra-long-comment',
                message: [{type: 'COMMENT', html: 'Extra long comment', text: 'a'.repeat(1201)}],
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

    it('loads older pages when LegendList reaches the start and deduplicates the scroll fallback', () => {
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
            listProps?.onStartReached?.();
        });
        expect(mockLoadOlderChats).toHaveBeenCalledTimes(1);
        expect(listProps?.onStartReachedThreshold).toBe(0.75);

        act(() => {
            listProps?.onScroll?.(createScrollEvent(0));
        });
        expect(mockLoadOlderChats).toHaveBeenCalledTimes(1);

        mockIsLoadingOlderReportActions = true;
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
            />,
        );
        mockIsLoadingOlderReportActions = false;
        view.rerender(
            <ReportActionsList
                reportID={mockReport.reportID}
                conciergeChat={undefined}
            />,
        );

        act(() => {
            getCapturedListProps()?.onScroll?.(createScrollEvent(0));
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

    describe('System message presentation', () => {
        const systemActions = (
            [
                ['system-newer', CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, '03', 'changed the category'],
                ['system-older', CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE, '02', 'changed the merchant'],
                ['chat-boundary', CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT, '01', 'A chat message'],
            ] as const
        ).map(([reportActionID, actionName, minute, message]) =>
            buildSystemAction(reportActionID, {
                reportID: mockReport.reportID,
                actionName,
                created: `2023-01-01 00:${minute}:00.000`,
                actorAccountID: 123,
                message: [{type: actionName === CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT ? 'COMMENT' : 'TEXT', html: message, text: message}],
                originalMessage: {},
                shouldShow: true,
                person: [{type: 'TEXT', style: 'strong', text: 'Test User'}],
                pendingAction: null,
                errors: {},
            }),
        );

        const renderSystemActions = (reportType?: OnyxTypes.Report['type']) => {
            mockReport.type = reportType;
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockUsePaginatedReportActions.mockReturnValue({...defaultPaginatedReportActionsResult, reportActions: systemActions});
            return renderReportActionsList();
        };
        const getCapturedSystemActionIDs = () =>
            getCapturedVisibleActions()
                ?.filter((action) => systemActions.some((systemAction) => systemAction.reportActionID === action.reportActionID))
                .map((action) => action.reportActionID);
        const getSystemAction = (index: number) => {
            const action = systemActions.at(index);
            if (!action) {
                throw new Error(`Expected a system action at index ${index}`);
            }
            return action;
        };

        afterEach(() => {
            mockReport.type = undefined;
            mockReport.isWaitingOnBankAccount = undefined;
        });

        it.each([false, true])('counts only visible payment updates when waiting for a bank account is %s', (isWaitingOnBankAccount) => {
            // Given an expense payment between two visible system updates by the same user
            const payment: OnyxTypes.ReportAction = {
                ...getSystemAction(0),
                reportActionID: 'expense-payment',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: '2023-01-01 00:02:30.000',
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.PAY},
            };
            const created: OnyxTypes.ReportAction = {
                ...getSystemAction(2),
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                reportActionID: 'created',
                created: '2023-01-01 00:00:00.000',
            };
            mockReport.type = CONST.REPORT.TYPE.EXPENSE;
            mockReport.isWaitingOnBankAccount = isWaitingOnBankAccount;
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [getSystemAction(0), payment, getSystemAction(1), getSystemAction(2), created],
            });

            // When the standard report list constructs its summary
            renderReportActionsList();
            const collapsedAnchor = getCapturedListProps()?.renderItem?.({item: getSystemAction(1), index: 2});
            const summary = findRenderedElement<React.ComponentProps<typeof CollapsedSystemMessages>>(collapsedAnchor, CollapsedSystemMessages);
            expect(getCapturedSystemActionIDs()).toEqual(['chat-boundary', 'system-older']);
            expect(getRenderedReportActionsListItemProps(getSystemAction(2), 1)).toMatchObject({displayAsGroup: false});
            // Editing uses the displayed row order after the hidden update, not canonical indices.
            expect(jest.mocked(useScrollToEditingReportAction).mock.calls.at(-1)?.at(0)?.visibleReportActions).toBe(getCapturedVisibleActions());

            // Then the count matches the rows the renderer can show, and expansion preserves normal headers
            expect(summary?.props).toMatchObject({count: isWaitingOnBankAccount ? 2 : 3, earliestReportAction: getSystemAction(1)});
            act(() => summary?.props.onPress());
            expect(getCapturedVisibleActions()?.map((action) => action.reportActionID)).toEqual(
                isWaitingOnBankAccount ? ['created', 'chat-boundary', 'system-older', 'system-newer'] : ['created', 'chat-boundary', 'system-older', 'expense-payment', 'system-newer'],
            );
            expect(getRenderedReportActionsListItemProps(getSystemAction(0), isWaitingOnBankAccount ? 3 : 4)).toMatchObject({displayAsGroup: true});
            expect(findRenderedElement(getCapturedListProps()?.renderItem?.({item: getSystemAction(1), index: 2}), CollapsedSystemMessages)).toBeUndefined();
        });

        it('does not create a summary from one visible update and a hidden payment', () => {
            // Given a hidden payment that would otherwise be the oldest member and header of a two-update group
            const payment: OnyxTypes.ReportAction = {
                ...getSystemAction(1),
                reportActionID: 'hidden-payment',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.PAY},
            };
            const created: OnyxTypes.ReportAction = {...getSystemAction(2), actionName: CONST.REPORT.ACTIONS.TYPE.CREATED, reportActionID: 'created'};
            mockReport.type = CONST.REPORT.TYPE.EXPENSE;
            mockReport.isWaitingOnBankAccount = true;
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockUsePaginatedReportActions.mockReturnValue({...defaultPaginatedReportActionsResult, reportActions: [getSystemAction(0), payment, created]});

            // When the visible list is built, only the real update remains, with its normal header
            renderReportActionsList();
            expect(getCapturedVisibleActions()?.map((action) => action.reportActionID)).toEqual(['created', 'system-newer']);
            const item = getCapturedListProps()?.renderItem?.({item: getSystemAction(0), index: 1});
            expect(findRenderedElement(item, CollapsedSystemMessages)).toBeUndefined();
            expect(getRenderedReportActionsListItemProps(getSystemAction(0), 1)).toMatchObject({displayAsGroup: false});
            expect(findRenderedElement<React.ComponentProps<typeof ReportActionsListItemRenderer>>(item, ReportActionsListItemRenderer)?.props.isFirstVisibleReportAction).toBe(true);
        });

        it('keeps the sender header after a collapsed system-message run', () => {
            // Given the same sender posts a chat message after a run of system updates.
            const newerMessage = {...getSystemAction(2), reportActionID: 'chat-after-summary', created: '2023-01-01 00:04:00.000'};
            mockReport.type = CONST.REPORT.TYPE.EXPENSE;
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockUsePaginatedReportActions.mockReturnValue({...defaultPaginatedReportActionsResult, reportActions: [newerMessage, ...systemActions]});

            // When the run is displayed as one chronological summary row.
            renderReportActionsList();
            const summary = getCapturedListProps()?.renderItem?.({item: getSystemAction(1), index: 2});

            // Then the following chat message keeps its own sender header.
            expect(findRenderedElement(summary, CollapsedSystemMessages)).toBeDefined();
            expect(getRenderedReportActionsListItemProps(newerMessage, 3)).toMatchObject({displayAsGroup: false});
        });

        it('maps an unread run member to the collapsed summary row', () => {
            mockUseUnreadMarker.mockReturnValue({unreadMarkerReportActionID: 'system-newer', unreadMarkerReportActionIndex: 0});
            renderSystemActions(CONST.REPORT.TYPE.EXPENSE);

            expect(mockUseReportActionsScroll.mock.calls.at(-1)?.at(0)).toMatchObject({unreadMarkerReportActionIndex: 2});
            expect(mockUseReportActionsScroll.mock.calls.at(-1)?.at(0)?.reportActionIDToDisplayIndex?.get('system-newer')).toBe(2);
            const collapsedAnchor = getCapturedListProps()?.renderItem?.({item: getSystemAction(1), index: 2});
            const summary = findRenderedElement<React.ComponentProps<typeof CollapsedSystemMessages>>(collapsedAnchor, CollapsedSystemMessages);
            expect(summary?.props.unreadMarkerReportActionID).toBe('system-newer');
        });

        it.each([true, false])('keeps the first unread marker with its persisted or synthesized CREATED header (persisted: %s)', (hasPersistedCreatedAction) => {
            // Given two unread updates whose CREATED header is either persisted or synthesized by expense pagination
            const created = buildSystemAction('created', {
                actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
                created: '2023-01-01 00:00:00.000',
                actorAccountID: 100,
            });
            mockReport.type = CONST.REPORT.TYPE.EXPENSE;
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockUseUnreadMarker.mockReturnValue({unreadMarkerReportActionID: 'system-older', unreadMarkerReportActionIndex: 1});
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [getSystemAction(0), getSystemAction(1), ...(hasPersistedCreatedAction ? [created] : [])],
            });

            // When the unread pair is collapsed, scrolling still targets the summary
            renderReportActionsList();
            const collapsedAnchor = getCapturedListProps()?.renderItem?.({item: getSystemAction(1), index: 1});
            const summary = findRenderedElement<React.ComponentProps<typeof CollapsedSystemMessages>>(collapsedAnchor, CollapsedSystemMessages);

            // Then the visible CREATED header owns NEW in both cases, without changing the collapsed scroll target
            expect(summary).toBeDefined();
            expect(summary?.props.unreadMarkerReportActionID).toBeUndefined();
            expect(mockUseReportActionsScroll.mock.calls.at(-1)?.at(0)).toMatchObject({unreadMarkerReportActionIndex: 1});
            expect(mockUseReportActionsScroll.mock.calls.at(-1)?.at(0)?.reportActionIDToDisplayIndex?.get('system-older')).toBe(1);
            const headerAction = getCapturedVisibleActions()?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
            expect(headerAction).toBeDefined();
            if (!headerAction) {
                throw new Error('Expected expense pagination to preserve or synthesize a CREATED header');
            }
            const header = getCapturedListProps()?.renderItem?.({item: headerAction, index: 0});
            expect(findRenderedElement<React.ComponentProps<typeof ReportActionsListItemRenderer>>(header, ReportActionsListItemRenderer)?.props).toMatchObject({
                shouldHideThreadDividerLine: true,
                shouldUseThreadDividerLine: true,
            });
        });

        it('does not collapse passive actions in ordinary chat reports', () => {
            renderSystemActions(CONST.REPORT.TYPE.CHAT);

            expect(getCapturedSystemActionIDs()).toEqual(['chat-boundary', 'system-older', 'system-newer']);
        });

        it('mounts the off-screen oldest update and gives only that row a manual focus request in the chronological list', () => {
            // Given a chronological group whose collapsed anchor is its oldest member
            const scrollToIndex = mockLegendScrollToIndex;
            const frames: FrameRequestCallback[] = [];
            const frameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => frames.push(callback));
            try {
                renderSystemActions(CONST.REPORT.TYPE.EXPENSE);
                const anchor = getCapturedListProps()?.renderItem?.({item: getSystemAction(1), index: 2});
                const summary = findRenderedElement<React.ComponentProps<typeof CollapsedSystemMessages>>(anchor, CollapsedSystemMessages);
                expect(summary).toBeDefined();

                // When the user presses the summary
                act(() => summary?.props.onPress());

                // Then the oldest revealed message owns focus at its chronological data index
                const oldest = getCapturedListProps()?.renderItem?.({item: getSystemAction(1), index: 2});
                const newest = getCapturedListProps()?.renderItem?.({item: getSystemAction(0), index: 3});
                expect(findRenderedElement<React.ComponentProps<typeof ReportActionsListItemRenderer>>(oldest, ReportActionsListItemRenderer)?.props.onExpandedSystemMessageReady).toEqual(
                    expect.any(Function),
                );
                expect(
                    findRenderedElement<React.ComponentProps<typeof ReportActionsListItemRenderer>>(newest, ReportActionsListItemRenderer)?.props.onExpandedSystemMessageReady,
                ).toBeUndefined();
                act(() => {
                    for (const callback of frames) {
                        callback(0);
                    }
                });
                expect(scrollToIndex).toHaveBeenCalledWith({index: 2, animated: false, viewPosition: 0.5});
            } finally {
                frameSpy.mockRestore();
            }
        });

        it('keeps the unread target aligned with a synthetic draft in ordinary chats', () => {
            // Given an unread action followed by a newer synthetic draft.
            mockUseUnreadMarker.mockReturnValue({unreadMarkerReportActionID: 'system-older', unreadMarkerReportActionIndex: 1});
            mockUseConciergeDraft.mockReturnValue({
                draftReportAction: {...getSystemAction(2), reportActionID: 'draft-before-unread', created: '2023-01-01 00:04:00.000'},
                hasActiveDraft: true,
                isDraftPendingCompletion: true,
            });

            // When an ordinary chat uses the same list without system-message collapsing.
            renderSystemActions(CONST.REPORT.TYPE.CHAT);

            // Then the newer draft leaves the chronological unread index unchanged.
            expect(getCapturedVisibleActions()?.at(1)?.reportActionID).toBe('system-older');
            expect(getCapturedVisibleActions()?.at(-1)?.reportActionID).toBe('draft-before-unread');
            expect(mockUseReportActionsScroll.mock.calls.at(-1)?.at(0)).toMatchObject({unreadMarkerReportActionIndex: 1});
        });
    });

    describe('Concierge Feedback Prompt', () => {
        beforeEach(() => {
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockUseConciergeDraft.mockReturnValue({
                draftReportAction: null,
                hasActiveDraft: false,
                isDraftPendingCompletion: false,
            });
        });

        const conciergeReply: OnyxTypes.ReportAction = {
            reportID: mockReport.reportID,
            reportActionID: 'concierge-reply',
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            created: '2023-01-04',
            actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
            message: [{type: 'COMMENT', html: 'Here you go', text: 'Here you go'}],
            originalMessage: {html: 'Here you go', whisperedTo: []},
            shouldShow: true,
            person: [{type: 'TEXT', style: 'strong', text: CONST.CONCIERGE_DISPLAY_NAME}],
            pendingAction: null,
            errors: {},
        };

        it('marks the newest Concierge reply as the feedback target', () => {
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [...mockReportActions, conciergeReply],
            });

            renderReportActionsList();

            expect(getRenderedReportActionsListItemProps(conciergeReply).isLatestConciergeFeedbackAction).toBe(true);
        });

        it('marks the newest reply of Concierge and of each custom agent', () => {
            // Given a custom agent that replied after Concierge
            const agentAccountID = 4242;
            const agentReply: OnyxTypes.ReportAction = {
                ...conciergeReply,
                reportActionID: 'agent-reply',
                created: '2023-01-05',
                actorAccountID: agentAccountID,
                person: [{type: 'TEXT', style: 'strong', text: 'Receipt Checker'}],
            };
            mockUseOnyx.mockImplementation((key, options) => {
                if (key === ONYXKEYS.PERSONAL_DETAILS_LIST) {
                    return [[agentAccountID], {status: 'loaded'}];
                }
                return getMockOnyxValue(key, options);
            });
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [...mockReportActions, conciergeReply, agentReply],
            });

            // When the list renders
            renderReportActionsList();

            // Then both replies show the prompt, because the agent reply must not take the prompt away from Concierge
            expect(getRenderedReportActionsListItemProps(conciergeReply).isLatestConciergeFeedbackAction).toBe(true);
            expect(getRenderedReportActionsListItemProps(agentReply).isLatestConciergeFeedbackAction).toBe(true);
        });

        it('marks nothing while a Concierge answer is still streaming', () => {
            mockUseConciergeDraft.mockReturnValue({
                draftReportAction: {...conciergeReply, message: [{type: 'COMMENT', html: 'Here', text: 'Here'}]},
                hasActiveDraft: true,
                isDraftPendingCompletion: true,
            });
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [...mockReportActions, conciergeReply],
            });

            renderReportActionsList();

            expect(getRenderedReportActionsListItemProps(conciergeReply).isLatestConciergeFeedbackAction).toBe(false);
        });

        it('marks the reply once streaming finishes even when the draft HTML differs from the saved comment', () => {
            // Given a completed draft whose HTML serialization differs from its saved reply
            const completedDraft: OnyxTypes.ReportAction = {...conciergeReply, message: [{type: 'COMMENT', html: 'Here&apos;s it', text: "Here's it"}]};
            const savedReply: OnyxTypes.ReportAction = {...conciergeReply, message: [{type: 'COMMENT', html: "Here's it", text: "Here's it"}]};
            mockUseConciergeDraft.mockReturnValue({
                draftReportAction: completedDraft,
                hasActiveDraft: true,
                isDraftPendingCompletion: false,
            });
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [savedReply, ...mockReportActions],
            });

            // When the saved reply is available after streaming finishes
            renderReportActionsList();

            // Then the saved reply replaces the draft and retains its feedback prompt
            expect(getCapturedVisibleActions()).toContain(savedReply);
            expect(getCapturedVisibleActions()).not.toContain(completedDraft);
            expect(getRenderedReportActionsListItemProps(savedReply).isLatestConciergeFeedbackAction).toBe(true);
        });

        it('marks nothing inside the feedback thread the backend opens after a thumbs down', () => {
            mockUseOnyx.mockImplementation((key, options) => {
                if (key.startsWith(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS)) {
                    return [{conciergeFeedbackForReportActionID: conciergeReply.reportActionID}, {status: 'loaded'}];
                }
                return getMockOnyxValue(key, options);
            });
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [...mockReportActions, conciergeReply],
            });

            renderReportActionsList();

            expect(getRenderedReportActionsListItemProps(conciergeReply).isLatestConciergeFeedbackAction).toBe(false);
        });

        it('marks nothing while newer pages are still unloaded', () => {
            // A deep link can open an older page where the newest loaded reply is not the newest in the report
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [...mockReportActions, conciergeReply],
                hasNewerActions: true,
            });

            renderReportActionsList();

            expect(getRenderedReportActionsListItemProps(conciergeReply).isLatestConciergeFeedbackAction).toBe(false);
        });
    });

    describe('Concierge Draft Context Menu', () => {
        // extraData is an array, so isDraftPendingCompletion is read by its position
        const DRAFT_PENDING_EXTRA_DATA_INDEX = 4;

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
            expect((getCapturedListProps()?.extraData as unknown[]).at(DRAFT_PENDING_EXTRA_DATA_INDEX)).toBe(true);
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
            expect((getCapturedListProps()?.extraData as unknown[]).at(DRAFT_PENDING_EXTRA_DATA_INDEX)).toBe(false);
        });

        it('reconciles a pending draft when the matching persisted action has identical HTML', async () => {
            // Given a saved reply matching the last draft update while its completion event is missing
            const persistedReportAction = mockReportActions.at(-1);
            const revealDraftFromReportAction = jest.fn();
            mockUseConciergeDraft.mockReturnValue({
                draftReportAction: persistedReportAction ?? null,
                hasActiveDraft: true,
                isDraftPendingCompletion: true,
            });
            mockUseConciergeDraftActions.mockReturnValue({
                clearDraft: jest.fn(),
                dispatchLocalDraftEvent: jest.fn(),
                revealDraftFromReportAction,
            });

            // When the saved reply reaches the list
            renderReportActionsList();

            // Then the saved identity completes reconciliation even without a change to its HTML
            await waitFor(() => {
                expect(revealDraftFromReportAction).toHaveBeenCalledWith(persistedReportAction);
            });
        });

        it('clears a completed draft when its saved action is outside the visible page', async () => {
            // Given a saved reply outside the pagination window while its draft is still revealing
            const persistedReportAction: OnyxTypes.ReportAction = {
                ...conciergeDraftReportAction,
                reportActionID: 'persisted-outside-visible-page',
            };
            const revealingDraft: OnyxTypes.ReportAction = {...persistedReportAction, message: [{type: 'COMMENT', html: 'Bot', text: 'Bot'}]};
            const clearDraft = jest.fn();
            const revealDraftFromReportAction = jest.fn();
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: mockReportActions,
                sortedAllReportActions: [...mockReportActions, persistedReportAction],
            });
            const revealingDraftState = {
                draftReportAction: revealingDraft,
                hasActiveDraft: true,
                isDraftPendingCompletion: true,
            };
            const TestDraftContext = React.createContext(revealingDraftState);
            const useTestConciergeDraft = () => React.useContext(TestDraftContext);
            mockUseConciergeDraft.mockImplementation(useTestConciergeDraft);
            mockUseConciergeDraftActions.mockReturnValue({
                clearDraft,
                dispatchLocalDraftEvent: jest.fn(),
                revealDraftFromReportAction,
            });

            // When the list reconciles against all saved actions
            const {rerender} = render(
                <TestDraftContext.Provider value={revealingDraftState}>
                    <ReportActionsList
                        reportID={mockReport.reportID}
                        conciergeChat={undefined}
                    />
                </TestDraftContext.Provider>,
            );

            // Then the partial draft remains visible until its saved content finishes revealing
            await waitFor(() => {
                expect(revealDraftFromReportAction).toHaveBeenCalledWith(persistedReportAction);
            });
            expect(getCapturedVisibleActions()).toContain(revealingDraft);
            expect(clearDraft).not.toHaveBeenCalled();

            // When the reveal completes without changing the visible pagination window
            rerender(
                <TestDraftContext.Provider value={{draftReportAction: persistedReportAction, hasActiveDraft: true, isDraftPendingCompletion: false}}>
                    <ReportActionsList
                        reportID={mockReport.reportID}
                        conciergeChat={undefined}
                    />
                </TestDraftContext.Provider>,
            );

            // Then the synthetic bubble disappears and its cached draft is cleared
            await waitFor(() => {
                expect(clearDraft).toHaveBeenCalledTimes(1);
            });
            expect(getCapturedVisibleActions()?.some((action) => action.reportActionID === persistedReportAction.reportActionID)).toBe(false);
        });

        it('shows server followups after a local reply completes even when the pending add flag remains', () => {
            // Given a completed local reply and a later server merge that adds followups but leaves the pending add flag
            const completedDraft: OnyxTypes.ReportAction = {
                ...conciergeDraftReportAction,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                isOptimisticAction: true,
            };
            const savedHTML = 'Bot reply<followup-list><followup><followup-text>What can I do next?</followup-text></followup></followup-list>';
            const mergedReportAction: OnyxTypes.ReportAction = {
                ...completedDraft,
                message: [{type: 'COMMENT', html: savedHTML, text: 'Bot reply'}],
                originalMessage: {html: savedHTML, whisperedTo: []},
            };
            const clearDraft = jest.fn();
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [mergedReportAction, ...mockReportActions],
                sortedAllReportActions: [mergedReportAction, ...mockReportActions],
            });
            mockUseConciergeDraft.mockReturnValue({
                draftReportAction: completedDraft,
                hasActiveDraft: true,
                isDraftPendingCompletion: false,
            });
            mockUseConciergeDraftActions.mockReturnValue({
                clearDraft,
                dispatchLocalDraftEvent: jest.fn(),
                revealDraftFromReportAction: jest.fn(),
            });

            // When the saved reply reaches the open chat without a refresh
            renderReportActionsList();

            // Then the server's followups are displayed and the completed local draft is retired
            expect(getCapturedVisibleActions()).toContain(mergedReportAction);
            expect(getCapturedVisibleActions()).not.toContain(completedDraft);
            expect(clearDraft).toHaveBeenCalledTimes(1);
        });

        it.each([true, false])('retires an optimistic local reply only after draft completion (pending: %s)', (isDraftPendingCompletion) => {
            // Given a matching local reply whose pending add flag does not indicate whether its reveal has finished
            const optimisticReportAction: OnyxTypes.ReportAction = {
                ...conciergeDraftReportAction,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                isOptimisticAction: true,
            };
            const clearDraft = jest.fn();
            const revealDraftFromReportAction = jest.fn();
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [optimisticReportAction, ...mockReportActions],
                sortedAllReportActions: [optimisticReportAction, ...mockReportActions],
            });
            mockUseConciergeDraft.mockReturnValue({
                draftReportAction: optimisticReportAction,
                hasActiveDraft: true,
                isDraftPendingCompletion,
            });
            mockUseConciergeDraftActions.mockReturnValue({
                clearDraft,
                dispatchLocalDraftEvent: jest.fn(),
                revealDraftFromReportAction,
            });

            // When the list renders the draft beside that placeholder
            renderReportActionsList();

            // Then an unfinished reveal stays active, while a completed reveal lets future Onyx updates appear
            expect(revealDraftFromReportAction).not.toHaveBeenCalled();
            expect(clearDraft).toHaveBeenCalledTimes(isDraftPendingCompletion ? 0 : 1);
            expect(getCapturedVisibleActions()).toContain(optimisticReportAction);
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
        beforeEach(() => mockUseIsFocused.mockReturnValue(true));

        it('ends the warm span when the positioned content replaces its cover', () => {
            // Given cached messages whose initial list layout is still covered.
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockShouldCallLegendListOnLoad = false;
            renderReportActionsList();
            act(() => getCapturedListProps()?.onLayout?.(createMock<LayoutChangeEvent>({nativeEvent: {layout: {x: 0, y: 0, width: 300, height: 500}}})));
            expect(screen.getByTestId('ReportActionsSkeletonCover')).toBeTruthy();
            expect(mockMarkOpenReportEnd).not.toHaveBeenCalledWith(mockReport.reportID, mockReport, {warm: true});

            // When LegendList finishes positioning and the cover is removed.
            act(() => getCapturedListProps()?.onReady?.());

            // Then telemetry records visible content once, rather than the earlier hidden layout.
            expect(screen.queryByTestId('ReportActionsSkeletonCover')).toBeNull();
            expect(mockMarkOpenReportEnd).toHaveBeenCalledWith(mockReport.reportID, mockReport, {warm: true});
            act(() => getCapturedListProps()?.onLayout?.(createMock<LayoutChangeEvent>({nativeEvent: {layout: {x: 0, y: 0, width: 300, height: 400}}})));
            expect(mockMarkOpenReportEnd).toHaveBeenCalledTimes(1);
        });

        it('does not wait for a background OpenReport request when reopening a hydrated report', () => {
            // Given a report loaded earlier in this app session with a refresh still in flight.
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockHasOnceLoadedReportActions = true;
            mockIsLoadingInitialReportActions = true;
            mockUseIsReportLoadPending.mockReturnValue(true);
            mockShouldCallLegendListOnLoad = false;
            renderReportActionsList();

            // When the cached list finishes positioning, before that request completes.
            act(() => getCapturedListProps()?.onReady?.());

            // Then the cover clears and visible-content telemetry ends immediately.
            expect(screen.queryByTestId('ReportActionsSkeletonCover')).toBeNull();
            expect(mockMarkOpenReportEnd).toHaveBeenCalledWith(mockReport.reportID, mockReport, {warm: true});
        });

        it('ends a new warm span when an already-positioned report regains focus', () => {
            // Given a positioned report that remains mounted while another screen has focus.
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockUseIsFocused.mockReturnValue(false);
            const view = renderReportActionsList();
            expect(mockMarkOpenReportEnd).not.toHaveBeenCalled();

            // When navigation returns without another list layout or OpenReport response.
            mockUseIsFocused.mockReturnValue(true);
            view.rerender(
                <ReportActionsList
                    reportID={mockReport.reportID}
                    conciergeChat={undefined}
                    onLayout={jest.fn()}
                />,
            );

            // Then the visible cached content completes the new navigation span.
            expect(mockLegendListMount).toHaveBeenCalledTimes(1);
            expect(mockMarkOpenReportEnd).toHaveBeenCalledWith(mockReport.reportID, mockReport, {warm: true});
        });

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
        const SESSION_START = '2024-06-01 12:00:00.000';

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
        it('keeps a short Concierge session at its visible tail when Show History reveals older actions', () => {
            // Given a short session at its latest action, with history filtered out.
            setupConciergeMocks();
            mockUseIsInSidePanel.mockReturnValue(true);
            mockUseSidePanelState.mockReturnValue({...defaultSidePanelState, sessionStartTime: SESSION_START});
            mockUsePaginatedReportActions.mockReturnValue({...defaultPaginatedReportActionsResult, reportActions: oldReportActions, hasOlderActions: false});
            const animationFrames: FrameRequestCallback[] = [];
            const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
                animationFrames.push(callback);
                return animationFrames.length;
            });

            try {
                const view = renderReportActionsList({reportID: CONCIERGE_REPORT_ID});
                const actions = getCapturedVisibleActions();
                const createdIndex = actions?.findIndex((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) ?? -1;
                const createdAction = actions?.at(createdIndex);
                if (!createdAction) {
                    throw new Error('Expected the Concierge created action');
                }

                // When the reader reveals the older history.
                act(() => getShowHistoryPress(createdAction, createdIndex)?.());
                view.rerender(
                    <ReportActionsList
                        reportID={CONCIERGE_REPORT_ID}
                        conciergeChat={undefined}
                        onLayout={jest.fn()}
                    />,
                );
                act(() => {
                    for (const callback of animationFrames) {
                        callback(0);
                    }
                });

                // Then all actions are available while the latest session stays in view.
                expect(getCapturedVisibleActions()?.some((action) => action.reportActionID === 'old-msg-1')).toBe(true);
                expect(mockLegendScrollToEnd).toHaveBeenCalledWith({animated: false});
            } finally {
                requestAnimationFrameSpy.mockRestore();
            }
        });

        it.each([false, true])('only follows a delayed Show History page while the reader stays at the end (scrolls away: %s)', (scrollsAway) => {
            // Given a Concierge session with more history to load after the initially revealed actions.
            setupConciergeMocks();
            mockUseIsInSidePanel.mockReturnValue(true);
            mockUseSidePanelState.mockReturnValue({...defaultSidePanelState, sessionStartTime: SESSION_START});
            mockUsePaginatedReportActions.mockReturnValue({...defaultPaginatedReportActionsResult, reportActions: oldReportActions, hasOlderActions: true});
            const animationFrames: FrameRequestCallback[] = [];
            const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
                animationFrames.push(callback);
                return animationFrames.length;
            });
            const flushAnimationFrames = () => {
                act(() => {
                    for (const callback of animationFrames.splice(0)) {
                        callback(0);
                    }
                });
            };

            try {
                const view = renderReportActionsList({reportID: CONCIERGE_REPORT_ID});
                const actions = getCapturedVisibleActions();
                const createdIndex = actions?.findIndex((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) ?? -1;
                const createdAction = actions?.at(createdIndex);
                if (!createdAction) {
                    throw new Error('Expected the Concierge created action');
                }

                // When Show History reveals the loaded actions and an older page arrives afterward.
                act(() => getShowHistoryPress(createdAction, createdIndex)?.());
                view.rerender(
                    <ReportActionsList
                        reportID={CONCIERGE_REPORT_ID}
                        conciergeChat={undefined}
                        onLayout={jest.fn()}
                    />,
                );
                flushAnimationFrames();
                mockLegendScrollToEnd.mockClear();

                if (scrollsAway) {
                    act(() => {
                        getCapturedListProps()?.onScroll?.({
                            nativeEvent: {
                                contentOffset: {x: 0, y: 500},
                                contentSize: {height: 1000, width: 300},
                                layoutMeasurement: {height: 500, width: 300},
                            },
                        });
                        getCapturedListProps()?.onScroll?.({
                            nativeEvent: {
                                contentOffset: {x: 0, y: 200},
                                contentSize: {height: 1000, width: 300},
                                layoutMeasurement: {height: 500, width: 300},
                            },
                        });
                    });
                }

                const oldUserAction = oldReportActions.at(1);
                if (!oldUserAction) {
                    throw new Error('Expected the older Concierge action');
                }
                const olderAction = {...oldUserAction, reportActionID: 'older-user-msg', created: '2022-06-15 10:00:00.000'};
                mockUsePaginatedReportActions.mockReturnValue({...defaultPaginatedReportActionsResult, reportActions: [...oldReportActions, olderAction], hasOlderActions: false});
                view.rerender(
                    <ReportActionsList
                        reportID={CONCIERGE_REPORT_ID}
                        conciergeChat={undefined}
                        onLayout={jest.fn()}
                    />,
                );
                flushAnimationFrames();

                // Then loading the page respects the reader's choice to stay at the end or read history.
                expect(getCapturedVisibleActions()?.some((action) => action.reportActionID === 'older-user-msg')).toBe(true);
                if (scrollsAway) {
                    expect(mockLegendScrollToEnd).not.toHaveBeenCalled();
                } else {
                    expect(mockLegendScrollToEnd).toHaveBeenCalledWith({animated: false});
                }
            } finally {
                requestAnimationFrameSpy.mockRestore();
            }
        });

        it('does not pull a slightly scrolled Concierge chat to the bottom when Show History is pressed', () => {
            // Given the reader is above the latest message but still within the generic action-visible threshold.
            setupConciergeMocks();
            mockUseIsInSidePanel.mockReturnValue(true);
            mockUseSidePanelState.mockReturnValue({...defaultSidePanelState, sessionStartTime: SESSION_START});
            mockUsePaginatedReportActions.mockReturnValue({...defaultPaginatedReportActionsResult, reportActions: oldReportActions, hasOlderActions: false});
            const animationFrames: FrameRequestCallback[] = [];
            const requestAnimationFrameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => {
                animationFrames.push(callback);
                return animationFrames.length;
            });

            try {
                const view = renderReportActionsList({reportID: CONCIERGE_REPORT_ID});
                act(() => {
                    for (const callback of animationFrames.splice(0)) {
                        callback(0);
                    }
                });
                mockLegendScrollToEnd.mockClear();
                act(() => {
                    getCapturedListProps()?.onScroll?.({
                        nativeEvent: {
                            contentOffset: {x: 0, y: 500},
                            contentSize: {height: 1000, width: 300},
                            layoutMeasurement: {height: 500, width: 300},
                        },
                    });
                    getCapturedListProps()?.onScroll?.({
                        nativeEvent: {
                            contentOffset: {x: 0, y: 400},
                            contentSize: {height: 1000, width: 300},
                            layoutMeasurement: {height: 500, width: 300},
                        },
                    });
                });
                const actions = getCapturedVisibleActions();
                const createdIndex = actions?.findIndex((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) ?? -1;
                const createdAction = actions?.at(createdIndex);
                if (!createdAction) {
                    throw new Error('Expected the Concierge created action');
                }

                // When the reader reveals older history.
                act(() => getShowHistoryPress(createdAction, createdIndex)?.());
                view.rerender(
                    <ReportActionsList
                        reportID={CONCIERGE_REPORT_ID}
                        conciergeChat={undefined}
                        onLayout={jest.fn()}
                    />,
                );
                act(() => {
                    for (const callback of animationFrames.splice(0)) {
                        callback(0);
                    }
                });

                // Then the reader's offset is left to LegendList's visible-content preservation.
                expect(mockLegendScrollToEnd).not.toHaveBeenCalled();
            } finally {
                requestAnimationFrameSpy.mockRestore();
            }
        });
    });

    describe('Concierge Main DM', () => {
        const CONCIERGE_REPORT_ID = '123';
        const CURRENT_USER_ACCOUNT_ID = 100;

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

        const setupMainDMConciergeMocks = (showFullHistory = false, hasOnceLoadedReportActions = true) => {
            jest.spyOn(ReportActionsUtils, 'shouldReportActionBeVisible').mockReturnValue(true);
            mockUseNetwork.mockReturnValue({isOffline: false});
            mockUseIsInSidePanel.mockReturnValue(false);
            mockUseSidePanelState.mockReturnValue(defaultSidePanelState);
            mockUseConciergeChatHistoryState.mockReturnValue({showFullHistory, isHistoryCollapsedByUser: false});
            mockUseConciergeChatHistoryActions.mockReturnValue({setShowFullHistory: jest.fn(), collapseHistory: jest.fn()});

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
                    return [getMockReportLoadingState(options?.selector, hasOnceLoadedReportActions, !hasOnceLoadedReportActions), {status: 'loaded'}];
                }
                if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CONCIERGE_REPORT_ID}` && options?.selector) {
                    const reportActions = Object.fromEntries(oldReportActions.map((action) => [action.reportActionID, action]));
                    return [!!(options.selector as (actions: OnyxTypes.ReportActions) => unknown)(reportActions), {status: 'loaded'}];
                }
                if (key.includes('reportActions')) {
                    return [[], {status: 'loaded'}];
                }
                if (key === `${ONYXKEYS.COLLECTION.REPORT}${CONCIERGE_REPORT_ID}`) {
                    const conciergeReport = {...mockReport, reportID: CONCIERGE_REPORT_ID};
                    return [
                        options?.selector ? (options.selector as (report: OnyxTypes.Report) => OnyxTypes.Report | boolean | undefined)(conciergeReport) : conciergeReport,
                        {status: 'loaded'},
                    ];
                }
                if (key.includes('report')) {
                    return [undefined, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });
        };

        it('should show the welcome screen in place of the conversation by default', () => {
            // Given the main Concierge chat where the user asked before, with its history collapsed
            setupMainDMConciergeMocks();
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: oldReportActions,
                hasOlderActions: false,
            });

            // When the list renders
            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            // Then the welcome screen shows and the earlier conversation stays behind `View chat history`
            expect(screen.getByTestId('AskConciergeWelcome')).toBeTruthy();
            expect(mockLegendList).not.toHaveBeenCalled();
        });

        it('should show the whole conversation without a greeting once the history is expanded', () => {
            // Given the user expanded the main Concierge chat history
            setupMainDMConciergeMocks(true);
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: oldReportActions,
                hasOlderActions: false,
            });

            // When the list renders
            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            // Then every earlier message shows, because only the side panel collapses its history
            expect(mockLegendList).toHaveBeenCalled();
            const passedActions = getCapturedVisibleActions();
            expect(passedActions?.some((a) => a.reportActionID === CONST.CONCIERGE_GREETING_ACTION_ID)).toBe(false);
            expect(passedActions?.some((a) => a.reportActionID === 'old-user-msg')).toBe(true);
            expect(passedActions?.some((a) => a.reportActionID === 'old-concierge-msg')).toBe(true);
        });
        it('should cover cached actions until the refreshed report finishes hydrating', () => {
            // Given a page refresh: hasOnceLoadedReportActions is RAM-only and resets to false,
            // but report actions persist in Onyx cache. Keep the cached list covered until OpenReport
            // finishes so the final hydrated viewport is the first report content the user sees.
            setupMainDMConciergeMocks(true, false);

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: oldReportActions,
                hasOlderActions: false,
            });

            // When the chat opens before OpenReport returns.
            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            // Then the initial viewport stays covered.
            expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
            expect(mockLegendList).toHaveBeenCalled();
        });

        it('should show a skeleton on a cold load when hasOnceLoadedReportActions is false and there are no cached actions', () => {
            // Given an expanded Concierge chat with no cached actions or completed initial load.
            setupMainDMConciergeMocks(true, false);

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [],
                hasOlderActions: false,
            });

            // When the chat opens before OpenReport returns.
            renderReportActionsList({reportID: CONCIERGE_REPORT_ID});

            // Then the initial viewport stays covered.
            expect(screen.getByTestId('ReportActionsSkeletonView')).toBeTruthy();
            expect(mockLegendList).toHaveBeenCalled();
        });
    });
});

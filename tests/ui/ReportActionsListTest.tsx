import {act, render, screen, waitFor} from '@testing-library/react-native';

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

import {useActionListRef} from '@pages/inbox/ActionListContext';
import type * as ActionListContextModule from '@pages/inbox/ActionListContext';
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

import type * as ReactNavigation from '@react-navigation/native';
import type ReactNative from 'react-native';

import React from 'react';
import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import {buildSystemAction} from '../utils/ReportTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const mockUseIsFocused = jest.fn().mockReturnValue(false);
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        useIsFocused: () => mockUseIsFocused(),
        useRoute: () => ({key: 'Report-test', name: 'Report', params: {}}),
        useNavigationState: jest.fn(),
        createNavigationContainerRef: () => ({
            getState: () => jest.fn(),
        }),
    };
});

jest.mock('@pages/inbox/ActionListContext', () => ({
    ...jest.requireActual<typeof ActionListContextModule>('@pages/inbox/ActionListContext'),
    useActionListRef: jest.fn(() => ({current: null})),
}));

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
jest.mock('@pages/inbox/ConciergeChatHistoryContext', () => ({
    useConciergeChatHistoryState: jest.fn(),
    useConciergeChatHistoryActions: jest.fn(),
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
const mockUseConciergeChatHistoryState = useConciergeChatHistoryState as jest.MockedFunction<typeof useConciergeChatHistoryState>;
const mockUseConciergeChatHistoryActions = useConciergeChatHistoryActions as jest.MockedFunction<typeof useConciergeChatHistoryActions>;

function getMockReportLoadingState(selector: unknown, hasOnceLoadedReportActions = true) {
    return selector === reportActionsListLoadingStateSelector ? {hasOnceLoadedReportActions, isLoadingInitialReportActions: false} : undefined;
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
jest.mock('@hooks/useLoadReportActions', () =>
    jest.fn(() => ({
        loadOlderChats: jest.fn(),
        loadNewerChats: jest.fn(),
    })),
);
jest.mock('@hooks/usePrevious', () => jest.fn());

const mockUseCurrentUserPersonalDetails = useCurrentUserPersonalDetails as jest.MockedFunction<typeof useCurrentUserPersonalDetails>;

// We mount the public ReportActionsList (the skeleton guard + its content) and observe what the content
// feeds the list via InvertedFlashList's `data`. The heavy scroll/marker hooks have their own unit tests,
// so they are stubbed here to isolate the skeleton logic. Because the guard only mounts the content when
// the skeleton is not showing, these stubs double as a probe for dormancy: while a skeleton renders the
// content is never mounted, so useMarkAsRead/useReportActionsScroll are never called.
jest.mock('@components/FlashList/InvertedFlashList', () => jest.fn(() => null));
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
        flushPendingScrollToBottom: jest.fn(),
        shouldBeAlignedToTop: false,
        shouldFocusToTopOnMount: false,
        initialScrollKey: undefined,
        shouldAutoscrollToBottom: false,
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

type MockInvertedFlashListProps = {
    data?: OnyxTypes.ReportAction[];
    extraData?: unknown;
    renderItem?: (info: {item: OnyxTypes.ReportAction; index: number}) => React.ReactElement | null;
    onContentSizeChange?: () => void;
};

const mockInvertedFlashList: jest.MockedFunction<(props: MockInvertedFlashListProps) => null> = jest.requireMock('@components/FlashList/InvertedFlashList');
const mockReportActionItemCreated: jest.Mock = jest.requireMock('@pages/inbox/report/ReportActionItemCreated');

/** Returns the report actions the body fed into the (mocked) inverted list on its latest render. */
const getCapturedVisibleActions = (): OnyxTypes.ReportAction[] | undefined => mockInvertedFlashList.mock.calls.at(-1)?.at(0)?.data;
const getCapturedListProps = (): MockInvertedFlashListProps | undefined => mockInvertedFlashList.mock.calls.at(-1)?.at(0);

const getRenderedReportActionsListItemProps = (
    reportAction: OnyxTypes.ReportAction,
    index = 0,
): {shouldDisableContextMenuForConciergeDraft?: boolean; isLatestConciergeFeedbackAction?: boolean; displayAsGroup?: boolean} => {
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
        mockUseIsReportLoadPending.mockReturnValue(false);
        mockUseUnreadMarker.mockReturnValue({unreadMarkerReportActionID: null, unreadMarkerReportActionIndex: -1});

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
    });

    afterEach(async () => {
        await waitForBatchedUpdatesWithAct();
        await Onyx.clear();
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
            const collapsedAnchor = getCapturedListProps()?.renderItem?.({item: getSystemAction(0), index: 0});
            const summary = findRenderedElement<React.ComponentProps<typeof CollapsedSystemMessages>>(collapsedAnchor, CollapsedSystemMessages);
            expect(getCapturedSystemActionIDs()).toEqual(['system-newer', 'chat-boundary']);
            expect(getRenderedReportActionsListItemProps(getSystemAction(2), 1)).toMatchObject({displayAsGroup: false});
            // Editing uses the displayed row order after the hidden update, not canonical indices.
            expect(jest.mocked(useScrollToEditingReportAction).mock.calls.at(-1)?.at(0)?.visibleReportActions).toBe(getCapturedVisibleActions());

            // Then the count matches the rows the renderer can show, and expansion preserves normal headers
            expect(summary?.props).toMatchObject({count: isWaitingOnBankAccount ? 2 : 3, earliestReportAction: getSystemAction(1)});
            act(() => summary?.props.onPress());
            expect(getCapturedVisibleActions()?.map((action) => action.reportActionID)).toEqual(
                isWaitingOnBankAccount ? ['system-newer', 'system-older', 'chat-boundary', 'created'] : ['system-newer', 'expense-payment', 'system-older', 'chat-boundary', 'created'],
            );
            expect(getRenderedReportActionsListItemProps(getSystemAction(0), 0)).toMatchObject({displayAsGroup: true});
            expect(findRenderedElement(getCapturedListProps()?.renderItem?.({item: getSystemAction(0), index: 0}), CollapsedSystemMessages)).toBeUndefined();
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
            expect(getCapturedVisibleActions()?.map((action) => action.reportActionID)).toEqual(['system-newer', 'created']);
            const item = getCapturedListProps()?.renderItem?.({item: getSystemAction(0), index: 0});
            expect(findRenderedElement(item, CollapsedSystemMessages)).toBeUndefined();
            expect(getRenderedReportActionsListItemProps(getSystemAction(0), 0)).toMatchObject({displayAsGroup: false});
            expect(findRenderedElement<React.ComponentProps<typeof ReportActionsListItemRenderer>>(item, ReportActionsListItemRenderer)?.props.isFirstVisibleReportAction).toBe(true);
        });

        it('maps an unread run member to the collapsed summary row', () => {
            mockUseUnreadMarker.mockReturnValue({unreadMarkerReportActionID: 'system-older', unreadMarkerReportActionIndex: 1});
            renderSystemActions(CONST.REPORT.TYPE.EXPENSE);

            expect(mockUseReportActionsScroll.mock.calls.at(-1)?.at(0)).toMatchObject({unreadMarkerReportActionIndex: 0});
            expect(mockUseReportActionsScroll.mock.calls.at(-1)?.at(0)?.reportActionIDToDisplayIndex?.get('system-older')).toBe(0);
            const collapsedAnchor = getCapturedListProps()?.renderItem?.({item: getSystemAction(0), index: 0});
            const summary = findRenderedElement<React.ComponentProps<typeof CollapsedSystemMessages>>(collapsedAnchor, CollapsedSystemMessages);
            expect(summary?.props.unreadMarkerReportActionID).toBe('system-older');
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
            const collapsedAnchor = getCapturedListProps()?.renderItem?.({item: getSystemAction(0), index: 0});
            const summary = findRenderedElement<React.ComponentProps<typeof CollapsedSystemMessages>>(collapsedAnchor, CollapsedSystemMessages);

            // Then the visible CREATED header owns NEW in both cases, without changing the collapsed scroll target
            expect(summary).toBeDefined();
            expect(summary?.props.unreadMarkerReportActionID).toBeUndefined();
            expect(mockUseReportActionsScroll.mock.calls.at(-1)?.at(0)).toMatchObject({unreadMarkerReportActionIndex: 0});
            expect(mockUseReportActionsScroll.mock.calls.at(-1)?.at(0)?.reportActionIDToDisplayIndex?.get('system-older')).toBe(0);
            const headerAction = getCapturedVisibleActions()?.find((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
            expect(headerAction).toBeDefined();
            if (!headerAction) {
                throw new Error('Expected expense pagination to preserve or synthesize a CREATED header');
            }
            const header = getCapturedListProps()?.renderItem?.({item: headerAction, index: 1});
            expect(findRenderedElement<React.ComponentProps<typeof ReportActionsListItemRenderer>>(header, ReportActionsListItemRenderer)?.props).toMatchObject({
                shouldHideThreadDividerLine: true,
                shouldUseThreadDividerLine: true,
            });
        });

        it('does not collapse passive actions in ordinary chat reports', () => {
            renderSystemActions(CONST.REPORT.TYPE.CHAT);

            expect(getCapturedSystemActionIDs()).toEqual(['system-newer', 'system-older', 'chat-boundary']);
        });

        it('mounts the off-screen oldest update and gives only that row a manual focus request in the inverted list', () => {
            // Given a newest-first group whose collapsed anchor is its newest member
            const scrollToIndex = jest.fn();
            jest.mocked(useActionListRef).mockReturnValue(createMock<ReturnType<typeof useActionListRef>>({current: {scrollToIndex}}));
            const frames: FrameRequestCallback[] = [];
            const frameSpy = jest.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => frames.push(callback));
            try {
                renderSystemActions(CONST.REPORT.TYPE.EXPENSE);
                const anchor = getCapturedListProps()?.renderItem?.({item: getSystemAction(0), index: 0});
                const summary = findRenderedElement<React.ComponentProps<typeof CollapsedSystemMessages>>(anchor, CollapsedSystemMessages);
                expect(summary).toBeDefined();

                // When the user presses the summary
                act(() => summary?.props.onPress());

                // Then the oldest revealed message owns focus, independent of the inverted data index
                const oldest = getCapturedListProps()?.renderItem?.({item: getSystemAction(1), index: 1});
                const newest = getCapturedListProps()?.renderItem?.({item: getSystemAction(0), index: 0});
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
                expect(scrollToIndex).toHaveBeenCalledWith({index: 1, animated: false, viewPosition: 0.5});
            } finally {
                frameSpy.mockRestore();
                jest.mocked(useActionListRef).mockReturnValue({current: null});
            }
        });

        it('keeps the unread target aligned with a synthetic draft in ordinary chats', () => {
            // Given an unread action whose rendered index shifts when a newer draft is inserted.
            mockUseUnreadMarker.mockReturnValue({unreadMarkerReportActionID: 'system-older', unreadMarkerReportActionIndex: 1});
            mockUseConciergeDraft.mockReturnValue({
                draftReportAction: {...getSystemAction(2), reportActionID: 'draft-before-unread', created: '2023-01-01 00:04:00.000'},
                hasActiveDraft: true,
                isDraftPendingCompletion: true,
            });

            // When an ordinary chat uses the same list without system-message collapsing.
            renderSystemActions(CONST.REPORT.TYPE.CHAT);

            // Then scrolling uses the rendered index rather than the canonical index from before the draft.
            expect(getCapturedVisibleActions()?.at(2)?.reportActionID).toBe('system-older');
            expect(mockUseReportActionsScroll.mock.calls.at(-1)?.at(0)).toMatchObject({unreadMarkerReportActionIndex: 2});
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

        afterEach(() => {
            mockReport.type = undefined;
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

        it('marks a Concierge reply in the transaction thread of a one-expense report', () => {
            // Given a one-expense report, which shows the comments of its transaction thread that Onyx stores under the thread's reportID
            const transactionThreadReportID = 'transaction-thread';
            const transactionID = 'transaction';
            const expenseAction = {
                reportID: mockReport.reportID,
                reportActionID: 'expense',
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                created: '2023-01-03',
                actorAccountID: 123,
                childReportID: transactionThreadReportID,
                message: [{type: 'COMMENT', html: '$10.00 expense', text: '$10.00 expense'}],
                originalMessage: {type: CONST.IOU.REPORT_ACTION_TYPE.CREATE, IOUTransactionID: transactionID, IOUReportID: mockReport.reportID, amount: 1000, currency: CONST.CURRENCY.USD},
                shouldShow: true,
                pendingAction: null,
                errors: {},
            } as OnyxTypes.ReportAction;
            const threadConciergeReply: OnyxTypes.ReportAction = {...conciergeReply, reportID: transactionThreadReportID};
            mockReport.type = CONST.REPORT.TYPE.EXPENSE;
            mockUseReportTransactionsCollection.mockReturnValue({
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {transactionID, reportID: mockReport.reportID} as OnyxTypes.Transaction,
            });
            mockUseOnyx.mockImplementation((key, options) => {
                if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`) {
                    return [[threadConciergeReply], {status: 'loaded'}];
                }
                return getMockOnyxValue(key, options);
            });
            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: [...mockReportActions, expenseAction],
            });

            // When the list renders
            renderReportActionsList();

            // Then the reply shows the prompt, because it is a saved comment even though the expense report does not store it
            expect(getCapturedVisibleActions()).toContain(threadConciergeReply);
            expect(getRenderedReportActionsListItemProps(threadConciergeReply).isLatestConciergeFeedbackAction).toBe(true);
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

    describe('Pending scroll-to-bottom', () => {
        it('flushes a pending scroll-to-bottom when the list content size changes', () => {
            // Given the list is rendered
            mockUseNetwork.mockReturnValue({isOffline: false});
            renderReportActionsList();

            // When the list content size changes, as it does once FlashList lays out a newly sent comment. In an
            // aligned-to-top report this is the only list event that follows, because onLayout does not fire.
            getCapturedListProps()?.onContentSizeChange?.();

            // Then the pending scroll-to-bottom is flushed, so the list lands on the new comment
            const scrollHookResult = mockUseReportActionsScroll.mock.results.at(-1)?.value as {flushPendingScrollToBottom: jest.Mock};
            expect(scrollHookResult.flushPendingScrollToBottom).toHaveBeenCalledTimes(1);
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

            expect(mockInvertedFlashList).toHaveBeenCalled();
            const passedActions = getCapturedVisibleActions();
            expect(passedActions?.length).toBeGreaterThanOrEqual(1);
            expect(passedActions?.at(0)?.reportActionID).toBe(CONST.CONCIERGE_GREETING_ACTION_ID);
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
            expect(mockInvertedFlashList).toHaveBeenCalled();
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

        const setupMainDMConciergeMocks = (showFullHistory = false) => {
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
                    return [getMockReportLoadingState(options?.selector), {status: 'loaded'}];
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
            expect(mockInvertedFlashList).not.toHaveBeenCalled();
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
            expect(mockInvertedFlashList).toHaveBeenCalled();
            const passedActions = getCapturedVisibleActions();
            expect(passedActions?.some((a) => a.reportActionID === CONST.CONCIERGE_GREETING_ACTION_ID)).toBe(false);
            expect(passedActions?.some((a) => a.reportActionID === 'old-user-msg')).toBe(true);
            expect(passedActions?.some((a) => a.reportActionID === 'old-concierge-msg')).toBe(true);
        });
    });
});

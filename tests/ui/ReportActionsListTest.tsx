/* eslint-disable @typescript-eslint/no-unsafe-type-assertion */
import type * as ReactNavigation from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
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
import {useConciergeSessionActions, useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';
import ReportActionsList from '@pages/inbox/report/ReportActionsList';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
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

const mockUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;
const mockUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;
const mockUseTransactionsAndViolationsForReport = useTransactionsAndViolationsForReport as jest.MockedFunction<typeof useTransactionsAndViolationsForReport>;
const mockUsePaginatedReportActions = usePaginatedReportActions as jest.MockedFunction<typeof usePaginatedReportActions>;
const mockUseParentReportAction = useParentReportAction as jest.MockedFunction<typeof useParentReportAction>;
const mockUseIsInSidePanel = useIsInSidePanel as jest.MockedFunction<typeof useIsInSidePanel>;
const mockUseSidePanelState = useSidePanelState as jest.MockedFunction<typeof useSidePanelState>;
const mockUseReportTransactionsCollection = useReportTransactionsCollection as jest.MockedFunction<typeof useReportTransactionsCollection>;
const mockUseConciergeSessionState = useConciergeSessionState as jest.MockedFunction<typeof useConciergeSessionState>;
const mockUseConciergeSessionActions = useConciergeSessionActions as jest.MockedFunction<typeof useConciergeSessionActions>;

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

// PR 6 makes the ReportActionsList body hook-driven, so we mount the REAL body (no longer a prop-fed
// child) and observe what it feeds the list via InvertedFlashList's `data`. The heavy scroll/marker
// hooks have their own unit tests, so they are stubbed here to isolate the body's visibility/skeleton
// logic — the actual subject of these tests.
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

const mockInvertedFlashList: jest.MockedFunction<(props: {data?: OnyxTypes.ReportAction[]}) => null> = jest.requireMock('@components/FlashList/InvertedFlashList');
const mockReportActionItemCreated: jest.Mock = jest.requireMock('@pages/inbox/report/ReportActionItemCreated');

/** Returns the report actions the body fed into the (mocked) inverted list on its latest render. */
const getCapturedVisibleActions = (): OnyxTypes.ReportAction[] | undefined => mockInvertedFlashList.mock.calls.at(-1)?.at(0)?.data;

jest.mock('@libs/actions/Report', () => ({
    updateLoadingInitialReportAction: jest.fn(),
}));

// Mock report data
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
    return render(<ReportActionsList reportID={reportID} />);
};

describe('ReportActionsList (body)', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();

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
        mockUseConciergeSessionState.mockReturnValue({sessionStartTime: null, showFullHistory: false, hadMessagesAtSessionStart: false});
        mockUseConciergeSessionActions.mockReturnValue({startSession: jest.fn(), setShowFullHistory: jest.fn(), setHadMessagesAtSessionStart: jest.fn()});

        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.IS_LOADING_APP) {
                return [false, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                return [false, {status: 'loaded'}];
            }
            if (key.includes('reportLoadingState')) {
                return [{isLoadingInitialReportActions: false, hasOnceLoadedReportActions: true}, {status: 'loaded'}];
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

    describe('Skeleton Loading States', () => {
        it('should show skeleton when shouldShowSkeletonForAppLoad is true (isLoadingApp is true and isOffline is false)', () => {
            mockUseNetwork.mockReturnValue({
                isOffline: false,
            });

            mockUseOnyx.mockImplementation((key: string) => {
                if (key === ONYXKEYS.IS_LOADING_APP) {
                    return [true, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [{isLoadingInitialReportActions: false, hasOnceLoadedReportActions: true}, {status: 'loaded'}];
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
        });

        it('should not show skeleton when shouldShowSkeletonForAppLoad is false (isLoadingApp is false and isOffline is false)', () => {
            mockUseNetwork.mockReturnValue({
                isOffline: false,
            });

            mockUseOnyx.mockImplementation((key: string) => {
                if (key === ONYXKEYS.IS_LOADING_APP) {
                    return [false, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [{isLoadingInitialReportActions: false, hasOnceLoadedReportActions: true}, {status: 'loaded'}];
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

        it('should not show skeleton when shouldShowSkeletonForAppLoad is false (isLoadingApp is true and isOffline is true)', () => {
            mockUseNetwork.mockReturnValue({
                isOffline: true,
            });

            mockUseOnyx.mockImplementation((key: string) => {
                if (key === ONYXKEYS.IS_LOADING_APP) {
                    return [true, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [{isLoadingInitialReportActions: false, hasOnceLoadedReportActions: true}, {status: 'loaded'}];
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

            mockUseOnyx.mockImplementation((key: string) => {
                if (key === ONYXKEYS.IS_LOADING_APP) {
                    return [false, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [{isLoadingInitialReportActions: false, hasOnceLoadedReportActions: true}, {status: 'loaded'}];
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
            mockUseOnyx.mockImplementation((key: string) => {
                if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                    return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.IS_LOADING_APP) {
                    return [false, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [{isLoadingInitialReportActions: false, hasOnceLoadedReportActions: true}, {status: 'loaded'}];
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

            mockUseOnyx.mockImplementation((key: string) => {
                if (key === ONYXKEYS.CONCIERGE_REPORT_ID) {
                    return [CONCIERGE_REPORT_ID, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.IS_LOADING_APP) {
                    return [false, {status: 'loaded'}];
                }
                if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportLoadingState')) {
                    return [{isLoadingInitialReportActions: false, hasOnceLoadedReportActions}, {status: 'loaded'}];
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

            expect(mockInvertedFlashList).toHaveBeenCalled();
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

            expect(mockInvertedFlashList).toHaveBeenCalled();
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

            expect(mockInvertedFlashList).toHaveBeenCalled();
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

            expect(mockInvertedFlashList).toHaveBeenCalled();
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

            expect(mockInvertedFlashList).toHaveBeenCalled();
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
            expect(mockInvertedFlashList).toHaveBeenCalled();
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
        });
    });
});

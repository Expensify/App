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
// eslint-disable-next-line no-restricted-syntax -- disabled because we need ReportActionsUtils to mock
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import ReportActionsView from '@pages/inbox/report/ReportActionsView';
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

const mockUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;
const mockUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;
const mockUseTransactionsAndViolationsForReport = useTransactionsAndViolationsForReport as jest.MockedFunction<typeof useTransactionsAndViolationsForReport>;
const mockUsePaginatedReportActions = usePaginatedReportActions as jest.MockedFunction<typeof usePaginatedReportActions>;
const mockUseParentReportAction = useParentReportAction as jest.MockedFunction<typeof useParentReportAction>;
const mockUseIsInSidePanel = useIsInSidePanel as jest.MockedFunction<typeof useIsInSidePanel>;
const mockUseSidePanelState = useSidePanelState as jest.MockedFunction<typeof useSidePanelState>;
const mockUseReportTransactionsCollection = useReportTransactionsCollection as jest.MockedFunction<typeof useReportTransactionsCollection>;

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

jest.mock('@pages/inbox/report/ReportActionsList', () =>
    jest.fn(({sortedReportActions}: {sortedReportActions: OnyxTypes.ReportAction[]}) => {
        if (sortedReportActions && sortedReportActions.length > 0) {
            return null; // Simulate normal content
        }
        return null;
    }),
);
jest.mock('@pages/inbox/report/UserTypingEventListener', () => jest.fn(() => null));
jest.mock('@pages/inbox/report/ReportActionItemCreated', () => jest.fn(() => null));

const mockReportActionsList: jest.Mock = jest.requireMock('@pages/inbox/report/ReportActionsList');
const mockReportActionItemCreated: jest.Mock = jest.requireMock('@pages/inbox/report/ReportActionItemCreated');

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

const renderReportActionsView = (props: {reportID?: string} = {}) => {
    const reportID = props.reportID ?? mockReport.reportID;
    return render(<ReportActionsView reportID={reportID} />);
};

describe('ReportActionsView', () => {
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
        });

        mockUsePaginatedReportActions.mockReturnValue({
            ...defaultPaginatedReportActionsResult,
            reportActions: mockReportActions,
        });

        mockUseParentReportAction.mockReturnValue(undefined as ReturnType<typeof useParentReportAction>);
        mockUseIsInSidePanel.mockReturnValue(false);
        mockUseSidePanelState.mockReturnValue(defaultSidePanelState);
        mockUseReportTransactionsCollection.mockReturnValue({});

        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.IS_LOADING_APP) {
                return [false, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.RAM_ONLY_ARE_TRANSLATIONS_LOADING) {
                return [false, {status: 'loaded'}];
            }
            if (key.includes('reportMetadata')) {
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
                if (key.includes('reportMetadata')) {
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

            renderReportActionsView();

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
                if (key.includes('reportMetadata')) {
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

            renderReportActionsView();

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
                if (key.includes('reportMetadata')) {
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

            renderReportActionsView();

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
                if (key.includes('reportMetadata')) {
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

            renderReportActionsView();

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
                if (key.includes('reportMetadata')) {
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

            renderReportActionsView({reportID: CONCIERGE_REPORT_ID});

            expect(mockReportActionsList).toHaveBeenCalled();
            const passedActions = (mockReportActionsList.mock.calls.at(0) as [{sortedVisibleReportActions: OnyxTypes.ReportAction[]}]).at(0)?.sortedVisibleReportActions;
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

            renderReportActionsView({reportID: CONCIERGE_REPORT_ID});

            expect(mockReportActionItemCreated).not.toHaveBeenCalled();
        });

        it('should not show welcome state for non-concierge reports in side panel', () => {
            setupConciergeMocks();

            mockUsePaginatedReportActions.mockReturnValue({
                ...defaultPaginatedReportActionsResult,
                reportActions: oldReportActions,
            });
            mockUseIsInSidePanel.mockReturnValue(false);

            renderReportActionsView({reportID: 'non-concierge-999'});

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

            renderReportActionsView({reportID: CONCIERGE_REPORT_ID});

            // Welcome should not be shown since user has sent a message
            expect(mockReportActionItemCreated).not.toHaveBeenCalled();
            // ReportActionsList should be rendered with filtered actions
            expect(mockReportActionsList).toHaveBeenCalled();
        });
    });
});

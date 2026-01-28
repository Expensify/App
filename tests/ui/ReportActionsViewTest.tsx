import type * as ReactNavigation from '@react-navigation/native';
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
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

const mockUseNetwork = useNetwork as jest.MockedFunction<typeof useNetwork>;
const mockUseOnyx = useOnyx as jest.MockedFunction<typeof useOnyx>;
const mockUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;
const mockUseTransactionsAndViolationsForReport = useTransactionsAndViolationsForReport as jest.MockedFunction<typeof useTransactionsAndViolationsForReport>;
jest.mock('@hooks/useCopySelectionHelper', () => jest.fn());
jest.mock('@hooks/useLoadReportActions', () =>
    jest.fn(() => ({
        loadOlderChats: jest.fn(),
        loadNewerChats: jest.fn(),
    })),
);
jest.mock('@hooks/usePrevious', () => jest.fn());

jest.mock('@pages/home/report/ReportActionsList', () =>
    jest.fn(({sortedReportActions}: {sortedReportActions: OnyxTypes.ReportAction[]}) => {
        if (sortedReportActions && sortedReportActions.length > 0) {
            return null; // Simulate normal content
        }
        return null;
    }),
);
jest.mock('@pages/home/report/UserTypingEventListener', () => jest.fn(() => null));

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

const renderReportActionsView = (
    props: Partial<{
        report: OnyxTypes.Report;
        reportActions?: OnyxTypes.ReportAction[];
        parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;
        isLoadingInitialReportActions?: boolean;
        transactionThreadReportID?: string | null;
        hasNewerActions: boolean;
        hasOlderActions: boolean;
    }> = {},
) => {
    const defaultProps = {
        report: mockReport,
        reportActions: mockReportActions,
        parentReportAction: null as unknown as OnyxEntry<OnyxTypes.ReportAction>,
        isLoadingInitialReportActions: false,
        hasNewerActions: false,
        hasOlderActions: false,
        ...props,
    };

    // eslint-disable-next-line react/jsx-props-no-spreading
    return render(<ReportActionsView {...defaultProps} />);
};

describe('ReportActionsView', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();

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
        });

        mockUseTransactionsAndViolationsForReport.mockReturnValue({
            transactions: {},
            violations: {},
        });

        mockUseOnyx.mockImplementation((key: string) => {
            if (key === ONYXKEYS.IS_LOADING_APP) {
                return [false, {status: 'loaded'}];
            }
            if (key === ONYXKEYS.ARE_TRANSLATIONS_LOADING) {
                return [false, {status: 'loaded'}];
            }
            if (key.includes('reportActions')) {
                return [[], {status: 'loaded'}];
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
                if (key === ONYXKEYS.ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportActions')) {
                    return [[], {status: 'loaded'}];
                }
                if (key.includes('report')) {
                    return [undefined, {status: 'loaded'}];
                }
                return [undefined, {status: 'loaded'}];
            });

            // Empty report actions to trigger isMissingReportActions condition
            renderReportActionsView({
                reportActions: [],
            });

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
                if (key === ONYXKEYS.ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportActions')) {
                    return [[], {status: 'loaded'}];
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
                if (key === ONYXKEYS.ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportActions')) {
                    return [[], {status: 'loaded'}];
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
                if (key === ONYXKEYS.ARE_TRANSLATIONS_LOADING) {
                    return [false, {status: 'loaded'}];
                }
                if (key.includes('reportActions')) {
                    return [[], {status: 'loaded'}];
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
});

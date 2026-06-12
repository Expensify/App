/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return -- jest factory mocks use CommonJS require() which returns untyped modules */
import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation from '@libs/Navigation/Navigation';
import RecentlyAddedSection from '@pages/home/RecentlyAddedSection';
import {useRecentlyAddedData} from '@pages/home/RecentlyAddedSection/useRecentlyAddedData';
import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

jest.mock('@hooks/usePopoverPosition', () =>
    jest.fn(() => ({
        calculatePopoverPosition: jest.fn(() => Promise.resolve({horizontal: 0, vertical: 0, width: 0, height: 0})),
    })),
);

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key)),
        numberFormat: jest.fn((num: number) => num.toString()),
        localeCompare: jest.fn((a: string, b: string) => a.localeCompare(b)),
    })),
);

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => jest.fn(() => ({})),
                },
            ),
    ),
);

jest.mock('@hooks/useTheme', () => jest.fn(() => ({})));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => new Proxy({}, {get: () => null})),
    useMemoizedLazyIllustrations: jest.fn(() => new Proxy({}, {get: () => null})),
}));

jest.mock('react-native-reanimated', () => {
    return require('react-native-reanimated/mock');
});

jest.mock('@pages/home/RecentlyAddedSection/useRecentlyAddedData', () => ({
    useRecentlyAddedData: jest.fn(),
}));

// The real MenuItem's pressable doesn't dispatch onPress in this test harness, so mock it (as the repo's
// PopoverMenu/YourSpendSection tests do) to a plain pressable that the overflow menu items can trigger.
jest.mock('@components/MenuItem', () => {
    const ReactModule = require('react');
    const {Text: RNText} = require('react-native');
    function MockMenuItem(props: {title?: string; pressableTestID?: string; onPress?: () => void}) {
        return ReactModule.createElement(RNText, {testID: props.pressableTestID, onPress: props.onPress}, props.title);
    }
    return MockMenuItem;
});

const mockNavigate = jest.mocked(Navigation.navigate);
const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockUseRecentlyAddedData = jest.mocked(useRecentlyAddedData);

const ACCOUNT_ID = 12345;

type RecentlyAddedRowFixture = {
    transactionID: string;
    reportID: string;
    created: string;
    merchant: string;
    amount: number;
    currency: string;
};

const ROW_1: RecentlyAddedRowFixture = {transactionID: 't1', reportID: 'thread1', created: '2026-03-26', merchant: 'Velocity Systems', amount: 87690, currency: 'USD'};
const ROW_2: RecentlyAddedRowFixture = {transactionID: 't2', reportID: 'thread2', created: '2026-03-25', merchant: 'Nitro Fuel Supply Co.', amount: 97622, currency: 'USD'};

function setWideLayout() {
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
}

function setNarrowLayout() {
    mockUseResponsiveLayout.mockReturnValue({
        shouldUseNarrowLayout: true,
        isSmallScreenWidth: true,
        isInNarrowPaneModal: false,
        isExtraSmallScreenHeight: false,
        isMediumScreenWidth: false,
        isLargeScreenWidth: false,
        isExtraLargeScreenWidth: false,
        isExtraSmallScreenWidth: false,
        isSmallScreen: true,
        onboardingIsMediumOrLargerScreenWidth: false,
        isInLandscapeMode: false,
    });
}

function renderRecentlyAddedSection() {
    return render(
        <OnyxListItemProvider>
            <RecentlyAddedSection />
        </OnyxListItemProvider>,
    );
}

describe('RecentlyAddedSection', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        setWideLayout();
        mockUseRecentlyAddedData.mockReturnValue({transactions: []});
        await act(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.SESSION]: {accountID: ACCOUNT_ID, email: 'test@example.com'},
                [ONYXKEYS.IS_LOADING_APP]: false,
            });
        });
        await waitForBatchedUpdatesWithAct();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await act(async () => {
            await Onyx.clear();
        });
        await waitForBatchedUpdatesWithAct();
    });

    describe('empty state', () => {
        it('renders the empty state and no rows when there are no expenses', async () => {
            mockUseRecentlyAddedData.mockReturnValue({transactions: []});

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByTestId('recentlyAddedEmptyState')).toBeOnTheScreen();
            expect(screen.queryByTestId('recentlyAddedRow-t1')).not.toBeOnTheScreen();
        });

        it('renders empty-state copy from the recentlyAddedSection namespace', async () => {
            mockUseRecentlyAddedData.mockReturnValue({transactions: []});

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('homePage.recentlyAddedSection.emptyStateMessage')).toBeOnTheScreen();
        });

        it('does not render the overflow menu in the empty state', async () => {
            mockUseRecentlyAddedData.mockReturnValue({transactions: []});

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByTestId('recentlyAddedOverflowMenu')).not.toBeOnTheScreen();
        });
    });

    describe('rows', () => {
        it('renders one row per expense with the merchant name', async () => {
            mockUseRecentlyAddedData.mockReturnValue({transactions: [ROW_1, ROW_2]});

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByTestId('recentlyAddedRow-t1')).toBeOnTheScreen();
            expect(screen.getByTestId('recentlyAddedRow-t2')).toBeOnTheScreen();
            expect(screen.getByText('Velocity Systems')).toBeOnTheScreen();
            expect(screen.getByText('Nitro Fuel Supply Co.')).toBeOnTheScreen();
            expect(screen.queryByTestId('recentlyAddedEmptyState')).not.toBeOnTheScreen();
        });
    });

    describe('row navigation to the expense RHP on Home', () => {
        it('navigates to SEARCH_REPORT with backTo Home on wide layout', async () => {
            setWideLayout();
            mockUseRecentlyAddedData.mockReturnValue({transactions: [ROW_1]});

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId('recentlyAddedRow-t1'));

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: ROW_1.reportID, backTo: ROUTES.HOME}));
        });

        it('navigates to REPORT_WITH_ID with backTo Home on narrow layout', async () => {
            setNarrowLayout();
            mockUseRecentlyAddedData.mockReturnValue({transactions: [ROW_1]});

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId('recentlyAddedRow-t1'));

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(ROW_1.reportID, undefined, undefined, ROUTES.HOME));
        });
    });

    describe('overflow menu', () => {
        it('renders the ellipsis overflow menu when there are expenses', async () => {
            mockUseRecentlyAddedData.mockReturnValue({transactions: [ROW_1]});

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByTestId('recentlyAddedOverflowMenu')).toBeOnTheScreen();
        });

        it('routes to the Expenses page (SEARCH_ROOT) when the overflow menu action is selected', async () => {
            mockUseRecentlyAddedData.mockReturnValue({transactions: [ROW_1]});

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId('recentlyAddedOverflowMenu'));
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByText('homePage.recentlyAddedSection.viewAll'));
            await waitForBatchedUpdatesWithAct();

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(expect.stringContaining(ROUTES.SEARCH_ROOT.route));
        });
    });
});

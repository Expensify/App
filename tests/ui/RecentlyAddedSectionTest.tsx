/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return -- jest factory mocks use CommonJS require() which returns untyped modules */
import {act, fireEvent, render, screen} from '@testing-library/react-native';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {createTransactionThreadReport} from '@libs/actions/Report';
import Navigation from '@libs/Navigation/Navigation';

import RecentlyAddedSection from '@pages/home/RecentlyAddedSection';
import {useRecentlyAddedData} from '@pages/home/RecentlyAddedSection/useRecentlyAddedData';

import OnyxListItemProvider from '@src/components/OnyxListItemProvider';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Transaction} from '@src/types/onyx';

import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => ''),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

// The component calls useIsFocused to dismiss the hovered receipt preview on blur; the test harness doesn't
// mount a NavigationContainer, so stub it to a focused state.
jest.mock('@react-navigation/native', () => {
    const actual = jest.requireActual('@react-navigation/native');
    return {
        ...actual,
        useIsFocused: jest.fn(() => true),
    };
});

jest.mock('@hooks/usePopoverPosition', () => {
    const calculatePopoverPosition = jest.fn(() => Promise.resolve({horizontal: 0, vertical: 0, width: 0, height: 0}));
    return jest.fn(() => ({calculatePopoverPosition}));
});

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

// Partially mock the Report actions so we can assert how many transaction threads get created on a single tap
// (the lazy carousel must never create a thread for a sibling the user hasn't navigated to).
jest.mock('@libs/actions/Report', () => {
    const actual = jest.requireActual('@libs/actions/Report');
    return {
        ...actual,
        createTransactionThreadReport: jest.fn(() => ({reportID: 'created_thread_report'})),
    };
});

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
const mockCreateTransactionThreadReport = jest.mocked(createTransactionThreadReport);

const ACCOUNT_ID = 12345;

type RecentlyAddedRowFixture = {
    transactionID: string;
    reportID: string;
    created: string;
    merchant: string;
    amount: number;
    currency: string;
    transaction: Transaction;
};

function buildTransaction(transactionID: string, reportID: string): Transaction {
    return {transactionID, reportID, amount: 0, created: '', currency: 'USD', merchant: '', comment: {}} as Transaction;
}

const ROW_1: RecentlyAddedRowFixture = {
    transactionID: 't1',
    reportID: 'thread1',
    created: '2026-03-26',
    merchant: 'Velocity Systems',
    amount: 87690,
    currency: 'USD',
    transaction: buildTransaction('t1', 'thread1'),
};
const ROW_2: RecentlyAddedRowFixture = {
    transactionID: 't2',
    reportID: 'thread2',
    created: '2026-03-25',
    merchant: 'Nitro Fuel Supply Co.',
    amount: 97622,
    currency: 'USD',
    transaction: buildTransaction('t2', 'thread2'),
};

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

    describe('anonymous user', () => {
        it('hides the entire section (including the empty state) for guests', async () => {
            mockUseRecentlyAddedData.mockReturnValue({transactions: []});
            await act(async () => {
                await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
            });
            await waitForBatchedUpdatesWithAct();

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByTestId('recentlyAddedEmptyState')).not.toBeOnTheScreen();
            expect(screen.queryByText('homePage.recentlyAddedSection.title')).not.toBeOnTheScreen();
        });

        it('still hides the section for guests even when expenses are present', async () => {
            mockUseRecentlyAddedData.mockReturnValue({transactions: [ROW_1]});
            await act(async () => {
                await Onyx.merge(ONYXKEYS.SESSION, {authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});
            });
            await waitForBatchedUpdatesWithAct();

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByTestId('recentlyAddedRow-t1')).not.toBeOnTheScreen();
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
            await waitForBatchedUpdatesWithAct();

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: ROW_1.reportID, backTo: ROUTES.HOME}));
        });

        it('navigates to SEARCH_REPORT with backTo Home on narrow layout (carousel available on both layouts)', async () => {
            setNarrowLayout();
            mockUseRecentlyAddedData.mockReturnValue({transactions: [ROW_1]});

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId('recentlyAddedRow-t1'));
            await waitForBatchedUpdatesWithAct();

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: ROW_1.reportID, backTo: ROUTES.HOME}));
        });

        it('opens the tapped expense in a multi-expense report by navigating to its transaction thread', async () => {
            setWideLayout();
            const parentReportID = 'report_multi';
            const threadReportID = 'thread_for_t1';
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {reportID: parentReportID, type: CONST.REPORT.TYPE.EXPENSE, transactionCount: 2});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                    a1: {
                        reportActionID: 'a1',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        childReportID: threadReportID,
                        originalMessage: {IOUTransactionID: 't1'},
                    },
                });
            });
            await waitForBatchedUpdatesWithAct();

            mockUseRecentlyAddedData.mockReturnValue({transactions: [{...ROW_1, reportID: parentReportID}]});

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId('recentlyAddedRow-t1'));
            await waitForBatchedUpdatesWithAct();

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: threadReportID, backTo: ROUTES.HOME}));
        });

        it('opens (creating if needed) the transaction thread for an expense in a one-transaction report, not the parent report', async () => {
            setWideLayout();
            const parentReportID = 'report_single';
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {reportID: parentReportID, type: CONST.REPORT.TYPE.EXPENSE, transactionCount: 1});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                    a1: {reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.IOU, originalMessage: {IOUTransactionID: 't1'}},
                });
            });
            await waitForBatchedUpdatesWithAct();

            mockUseRecentlyAddedData.mockReturnValue({transactions: [{...ROW_1, reportID: parentReportID}]});

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId('recentlyAddedRow-t1'));
            await waitForBatchedUpdatesWithAct();

            expect(mockCreateTransactionThreadReport).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.SEARCH_REPORT.getRoute({reportID: 'created_thread_report', backTo: ROUTES.HOME}));
        });

        it('seeds the prev/next carousel with the IDs and a lazy descriptor for every recently added expense', async () => {
            setWideLayout();
            mockUseRecentlyAddedData.mockReturnValue({transactions: [ROW_1, ROW_2]});

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId('recentlyAddedRow-t1'));
            await waitForBatchedUpdatesWithAct();

            const seededIDs = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });
            const seededDescriptors = await new Promise((resolve) => {
                const connection = Onyx.connect({
                    key: ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_THREAD_REPORT_IDS,
                    callback: (value) => {
                        Onyx.disconnect(connection);
                        resolve(value);
                    },
                });
            });

            expect(seededIDs).toEqual([ROW_1.transactionID, ROW_2.transactionID]);
            // The seeded value is the cheap descriptor (parent reportID + transaction), NOT a resolved thread
            // reportID — resolution is deferred to navigation time so opening the list creates no threads.
            expect(seededDescriptors).toEqual({
                [ROW_1.transactionID]: expect.objectContaining({reportID: ROW_1.reportID, transaction: expect.objectContaining({transactionID: ROW_1.transactionID})}),
                [ROW_2.transactionID]: expect.objectContaining({reportID: ROW_2.reportID, transaction: expect.objectContaining({transactionID: ROW_2.transactionID})}),
            });
        });

        it('resolves only the tapped expense and creates no threads for siblings (lazy carousel)', async () => {
            setWideLayout();
            const parentReportID = 'report_multi_lazy';
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReportID}`, {reportID: parentReportID, type: CONST.REPORT.TYPE.EXPENSE, transactionCount: 2});
                // Neither sibling has an existing thread (no childReportID), so resolving a sibling requires creating one.
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`, {
                    a1: {reportActionID: 'a1', actionName: CONST.REPORT.ACTIONS.TYPE.IOU, originalMessage: {IOUTransactionID: 't1'}},
                    a2: {reportActionID: 'a2', actionName: CONST.REPORT.ACTIONS.TYPE.IOU, originalMessage: {IOUTransactionID: 't2'}},
                });
            });
            await waitForBatchedUpdatesWithAct();

            mockUseRecentlyAddedData.mockReturnValue({
                transactions: [
                    {...ROW_1, reportID: parentReportID},
                    {...ROW_2, reportID: parentReportID},
                ],
            });

            renderRecentlyAddedSection();
            await waitForBatchedUpdatesWithAct();

            fireEvent.press(screen.getByTestId('recentlyAddedRow-t1'));
            await waitForBatchedUpdatesWithAct();

            // Exactly one thread is created (for the tapped expense), never one per sibling.
            expect(mockCreateTransactionThreadReport).toHaveBeenCalledTimes(1);
            expect(mockCreateTransactionThreadReport).toHaveBeenCalledWith(expect.objectContaining({transaction: expect.objectContaining({transactionID: 't1'})}));
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

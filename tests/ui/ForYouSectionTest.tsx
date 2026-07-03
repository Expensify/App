import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTodoCounts from '@hooks/useTodoCounts';

import Navigation from '@libs/Navigation/Navigation';

import ForYouSection from '@pages/home/ForYouSection';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {TransactionViolations} from '@src/types/onyx';

import type * as ReactNavigation from '@react-navigation/native';

import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';

import {createMockReport} from '../utils/ReportTestUtils';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

jest.mock('@hooks/useTodoCounts', () => jest.fn());

// ForYouSection calls useIsFocused() to freeze useTodoCounts when unfocused; this test renders it outside a
// NavigationContainer, so stub the focus hook (useTodoCounts is mocked, so the focus value itself is irrelevant).
jest.mock('@react-navigation/native', () => {
    const actualNavigation: typeof ReactNavigation = jest.requireActual('@react-navigation/native');

    return {
        ...actualNavigation,
        useIsFocused: jest.fn(() => true),
    };
});

const mockNavigateToTransactionThread = jest.fn();
jest.mock('@hooks/useNavigateToTransactionThread', () => jest.fn(() => mockNavigateToTransactionThread));

// useReviewFlaggedExpenses runs the flagged-expense scan only while the screen is focused. The test harness has
// no real navigation state, so mock useIsFocused with a toggleable flag: default focused so the review row
// renders, flip it to exercise the blurred path (scan skipped, last count retained).
let mockIsFocused = true;
jest.mock('@react-navigation/native', () => {
    const actualNav = jest.requireActual<typeof ReactNavigation>('@react-navigation/native');
    return {
        ...actualNav,
        useIsFocused: () => mockIsFocused,
    };
});

jest.mock('@hooks/useLocalize', () =>
    jest.fn(() => ({
        translate: jest.fn((key: string, params?: Record<string, unknown>) => {
            if (key === 'homePage.forYouSection.begin') {
                return 'Begin';
            }
            return params ? `${key}:${JSON.stringify(params)}` : key;
        }),
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

const RECEIPT_SEARCH_ASSET = {testID: 'receipt-search-icon'};

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        MoneyBag: null,
        Send: null,
        ThumbsUp: null,
        Export: null,
        ReceiptSearch: RECEIPT_SEARCH_ASSET,
    })),
    useMemoizedLazyIllustrations: jest.fn(() => ({
        ThumbsUpStars: null,
        Fireworks: null,
    })),
}));

jest.mock('react-native-reanimated', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return require('react-native-reanimated/mock');
});

const mockNavigate = jest.mocked(Navigation.navigate);
const mockUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;
const mockUseTodoCounts = jest.mocked(useTodoCounts);

const ACCOUNT_ID = 12345;

// ForYouSection now derives its counts/single-IDs from the useTodoCounts hook (which is mocked here) instead of the
// removed TODOS derived value, so the fixtures only need the report buckets the hook's return is computed from.
type TodoReport = {reportID: string};
type TodoFixture = {
    reportsToSubmit: TodoReport[];
    reportsToApprove: TodoReport[];
    reportsToPay: TodoReport[];
    reportsToExport: TodoReport[];
};

const BASE_TODOS: TodoFixture = {
    reportsToSubmit: [],
    reportsToApprove: [],
    reportsToPay: [],
    reportsToExport: [],
};

/**
 * Seeds the Onyx collections the ForYouSection hook scans so that each provided transaction surfaces as a
 * flagged expense: an OPEN expense report owned by the current user, a transaction on it, and a
 * reviewable (MISSING_CATEGORY) violation. Mirrors the data shape exercised in FlaggedExpensesTest.
 */
async function seedFlaggedExpenses(...expenses: Array<{transactionID: string; reportID: string}>) {
    const violations: TransactionViolations = [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}];
    await Promise.all(
        expenses.flatMap(({transactionID, reportID}) => [
            Onyx.set(
                `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                createMockReport({
                    reportID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    ownerAccountID: ACCOUNT_ID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                }),
            ),
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {transactionID, reportID, amount: 100, currency: 'USD', created: '2024-01-01', merchant: 'Test Merchant'}),
            Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`, violations),
        ]),
    );
}
// Drive the component by controlling the mocked hook's return value from the report-bucket fixtures.
function setTodoCounts(todos: TodoFixture) {
    const singleReportID = (reports: TodoReport[]) => (reports.length === 1 ? reports.at(0)?.reportID : undefined);
    mockUseTodoCounts.mockReturnValue({
        counts: {
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: todos.reportsToSubmit.length,
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: todos.reportsToApprove.length,
            [CONST.SEARCH.SEARCH_KEYS.PAY]: todos.reportsToPay.length,
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: todos.reportsToExport.length,
        },
        singleReportIDs: {
            [CONST.SEARCH.SEARCH_KEYS.SUBMIT]: singleReportID(todos.reportsToSubmit),
            [CONST.SEARCH.SEARCH_KEYS.APPROVE]: singleReportID(todos.reportsToApprove),
            [CONST.SEARCH.SEARCH_KEYS.PAY]: singleReportID(todos.reportsToPay),
            [CONST.SEARCH.SEARCH_KEYS.EXPORT]: singleReportID(todos.reportsToExport),
        },
    });
}

function renderForYouSection() {
    return render(<ForYouSection />);
}

function pressFirstBeginButton() {
    const [firstButton] = screen.getAllByText('Begin');
    fireEvent.press(firstButton);
}

describe('ForYouSection', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        mockIsFocused = true;
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

        setTodoCounts(BASE_TODOS);

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

    describe('EmptyState', () => {
        it('renders EmptyState when there are no todos', async () => {
            await act(async () => {
                setTodoCounts(BASE_TODOS);
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText('Begin')).not.toBeOnTheScreen();
        });
    });

    describe('review row', () => {
        it('is not rendered when there are no flagged expenses', async () => {
            await act(async () => {
                setTodoCounts({
                    ...BASE_TODOS,
                    reportsToSubmit: [{reportID: '1'}],
                });
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(/homePage\.forYouSection\.reviewExpenses/)).not.toBeOnTheScreen();
        });

        it('renders with the count-1 string when exactly one expense is flagged', async () => {
            await act(async () => {
                setTodoCounts(BASE_TODOS);
                await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'});
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('homePage.forYouSection.reviewExpenses:{"count":1}')).toBeOnTheScreen();
        });

        it('renders with the count-N string when multiple expenses are flagged', async () => {
            await act(async () => {
                setTodoCounts(BASE_TODOS);
                await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'}, {transactionID: 't2', reportID: 'r2'}, {transactionID: 't3', reportID: 'r3'});
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('homePage.forYouSection.reviewExpenses:{"count":3}')).toBeOnTheScreen();
        });

        it('renders the review row above submit/approve/pay/export rows', async () => {
            await act(async () => {
                setTodoCounts({
                    ...BASE_TODOS,
                    reportsToSubmit: [{reportID: 's1'}],
                    reportsToApprove: [{reportID: 'a1'}],
                    reportsToPay: [{reportID: 'p1'}],
                    reportsToExport: [{reportID: 'e1'}],
                });
                await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'});
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            const reviewTitle = screen.getByText('homePage.forYouSection.reviewExpenses:{"count":1}');
            const submitTitle = screen.getByText('homePage.forYouSection.submit:{"count":1}');
            const approveTitle = screen.getByText('homePage.forYouSection.approve:{"count":1}');
            const payTitle = screen.getByText('homePage.forYouSection.pay:{"count":1}');
            const exportTitle = screen.getByText('homePage.forYouSection.export:{"count":1}');

            // jest-native renderer assigns sequential _nativeTag-like positions; we rely on
            // the order returned by getAllByText to verify rendering order.
            const allTitles = screen.getAllByText(/homePage\.forYouSection\.(reviewExpenses|submit|approve|pay|export):/);
            const getChildren = (node: {props: {children?: unknown}}) => node.props.children;
            const titleOrder = allTitles.map(getChildren);

            expect(titleOrder.at(0)).toBe(getChildren(reviewTitle));
            expect(titleOrder).toEqual([getChildren(reviewTitle), getChildren(submitTitle), getChildren(approveTitle), getChildren(payTitle), getChildren(exportTitle)]);
        });

        it('exposes a Begin CTA and uses the ReceiptSearch icon asset', async () => {
            await act(async () => {
                setTodoCounts(BASE_TODOS);
                await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'});
            });
            await waitForBatchedUpdatesWithAct();

            const {UNSAFE_root: unsafeRoot} = renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('Begin')).toBeOnTheScreen();

            // The ReceiptSearch asset should be passed as the `icon` prop on at least one BaseWidgetItem.
            // We look for any rendered element whose `icon` prop is the RECEIPT_SEARCH_ASSET reference.
            const matchingNodes = unsafeRoot.findAll((node) => node.props && (node.props as {icon?: unknown}).icon === RECEIPT_SEARCH_ASSET);
            expect(matchingNodes.length).toBeGreaterThan(0);
        });

        it('does not surface flagged expenses while the Home tab is blurred (scan skipped)', async () => {
            mockIsFocused = false;
            await act(async () => {
                setTodoCounts(BASE_TODOS);
                await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'});
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(/homePage\.forYouSection\.reviewExpenses/)).not.toBeOnTheScreen();
        });

        it('keeps the last flagged count after the Home tab is blurred (no flash to empty)', async () => {
            await act(async () => {
                setTodoCounts(BASE_TODOS);
                await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'});
            });
            await waitForBatchedUpdatesWithAct();

            const {rerender} = renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('homePage.forYouSection.reviewExpenses:{"count":1}')).toBeOnTheScreen();

            // While the Home tab is blurred the scan is skipped, but the hook retains the last computed count
            // in state, so the row keeps its count instead of flashing back to the empty state.
            mockIsFocused = false;
            rerender(<ForYouSection />);
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('homePage.forYouSection.reviewExpenses:{"count":1}')).toBeOnTheScreen();
        });
    });

    describe('review row navigation', () => {
        it('delegates to useNavigateToTransactionThread with the first flagged expense and all sibling transaction IDs', async () => {
            await act(async () => {
                setTodoCounts(BASE_TODOS);
                await seedFlaggedExpenses({transactionID: 't1', reportID: 'r1'}, {transactionID: 't2', reportID: 'r2'});
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}r1`, {
                    action1: {
                        reportActionID: 'action1',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        childReportID: 'thread-r1',
                        message: {IOUTransactionID: 't1'},
                    },
                });
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            pressFirstBeginButton();

            expect(mockNavigateToTransactionThread).toHaveBeenCalledTimes(1);
            expect(mockNavigateToTransactionThread).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionID: 't1',
                    report: expect.objectContaining({reportID: 'r1'}),
                    transaction: expect.objectContaining({transactionID: 't1'}),
                    reportActions: expect.arrayContaining([expect.objectContaining({reportActionID: 'action1', childReportID: 'thread-r1'})]),
                    siblingTransactionIDs: ['t1', 't2'],
                    backTo: ROUTES.HOME,
                }),
            );
            // The standard report routes should not be used for the review row anymore.
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('opens the flagged expense thread when a lone flagged expense sits inside a multi-transaction report', async () => {
            // Repro of the deploy blocker: an OPEN expense report with two transactions where only one is still
            // flagged. transactionCount is 2, so pressing the row must open the flagged expense's thread rather
            // than the whole report (which would show both the flagged and unflagged expenses).
            await act(async () => {
                setTodoCounts(BASE_TODOS);
                await Onyx.set(
                    `${ONYXKEYS.COLLECTION.REPORT}r1`,
                    createMockReport({
                        reportID: 'r1',
                        type: CONST.REPORT.TYPE.EXPENSE,
                        ownerAccountID: ACCOUNT_ID,
                        stateNum: CONST.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                        transactionCount: 2,
                    }),
                );
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}t1`, {transactionID: 't1', reportID: 'r1', amount: 100, currency: 'USD', created: '2024-01-01', merchant: 'Test Merchant'});
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}t2`, {transactionID: 't2', reportID: 'r1', amount: 200, currency: 'USD', created: '2024-01-01', merchant: 'Test Merchant'});
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}t1`, [
                    {type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY},
                ] as TransactionViolations);
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            pressFirstBeginButton();

            expect(mockNavigateToTransactionThread).toHaveBeenCalledTimes(1);
            expect(mockNavigateToTransactionThread).toHaveBeenCalledWith(
                expect.objectContaining({
                    transactionID: 't1',
                    report: expect.objectContaining({reportID: 'r1'}),
                    siblingTransactionIDs: ['t1'],
                    backTo: ROUTES.HOME,
                }),
            );
            // The whole-report route must not be used when the report holds more than one transaction.
            expect(mockNavigate).not.toHaveBeenCalled();
        });

        it('opens the report directly when the lone flagged expense is the report only transaction', async () => {
            // A genuine one-transaction report keeps the shortcut: the transaction thread would be a redundant
            // duplicate of the report, so navigate straight to the expense report.
            await act(async () => {
                setTodoCounts(BASE_TODOS);
                await Onyx.set(
                    `${ONYXKEYS.COLLECTION.REPORT}r1`,
                    createMockReport({
                        reportID: 'r1',
                        type: CONST.REPORT.TYPE.EXPENSE,
                        ownerAccountID: ACCOUNT_ID,
                        stateNum: CONST.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                        transactionCount: 1,
                    }),
                );
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}t1`, {transactionID: 't1', reportID: 'r1', amount: 100, currency: 'USD', created: '2024-01-01', merchant: 'Test Merchant'});
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}t1`, [
                    {type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY},
                ] as TransactionViolations);
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            pressFirstBeginButton();

            // Wide layout (default in beforeEach) → EXPENSE_REPORT_RHP.
            expect(mockNavigate).toHaveBeenCalledTimes(1);
            expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: 'r1', backTo: ROUTES.HOME}));
            expect(mockNavigateToTransactionThread).not.toHaveBeenCalled();
        });

        it('does not render the review row or navigate when a violated transaction is not on a current-user OPEN expense report', async () => {
            await act(async () => {
                setTodoCounts(BASE_TODOS);
                await Onyx.set(
                    `${ONYXKEYS.COLLECTION.REPORT}r1`,
                    createMockReport({
                        reportID: 'r1',
                        type: CONST.REPORT.TYPE.EXPENSE,
                        ownerAccountID: ACCOUNT_ID,
                        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    }),
                );
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}t1`, {transactionID: 't1', reportID: 'r1'});
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}t1`, [{type: CONST.VIOLATION_TYPES.VIOLATION, name: CONST.VIOLATIONS.MISSING_CATEGORY}]);
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(/homePage\.forYouSection\.reviewExpenses/)).not.toBeOnTheScreen();
            expect(mockNavigateToTransactionThread).not.toHaveBeenCalled();
        });
    });

    describe('navigation with multiple reports (search route)', () => {
        it('navigates to SEARCH_ROOT when submit has multiple reports', async () => {
            await act(async () => {
                setTodoCounts({
                    ...BASE_TODOS,
                    reportsToSubmit: [{reportID: '1'}, {reportID: '2'}],
                });
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            pressFirstBeginButton();

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            const calledRoute = mockNavigate.mock.calls.at(0)?.at(0) as string;
            expect(calledRoute).toContain(ROUTES.SEARCH_ROOT.route);
        });

        it('navigates to SEARCH_ROOT when approve has multiple reports', async () => {
            await act(async () => {
                setTodoCounts({
                    ...BASE_TODOS,
                    reportsToApprove: [{reportID: '3'}, {reportID: '4'}],
                });
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            pressFirstBeginButton();

            expect(mockNavigate).toHaveBeenCalledTimes(1);
            const calledRoute = mockNavigate.mock.calls.at(0)?.at(0) as string;
            expect(calledRoute).toContain(ROUTES.SEARCH_ROOT.route);
        });
    });

    describe('navigation with a single report (direct report route)', () => {
        describe('wide layout', () => {
            beforeEach(() => {
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
            });

            it('navigates to EXPENSE_REPORT_RHP when submit has exactly one report on wide layout', async () => {
                const reportID = '42';
                await act(async () => {
                    setTodoCounts({
                        ...BASE_TODOS,
                        reportsToSubmit: [{reportID}],
                    });
                });
                await waitForBatchedUpdatesWithAct();

                renderForYouSection();
                await waitForBatchedUpdatesWithAct();

                pressFirstBeginButton();

                expect(mockNavigate).toHaveBeenCalledTimes(1);
                expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo: ROUTES.HOME}));
            });

            it('navigates to EXPENSE_REPORT_RHP when approve has exactly one report on wide layout', async () => {
                const reportID = '55';
                await act(async () => {
                    setTodoCounts({
                        ...BASE_TODOS,
                        reportsToApprove: [{reportID}],
                    });
                });
                await waitForBatchedUpdatesWithAct();

                renderForYouSection();
                await waitForBatchedUpdatesWithAct();

                pressFirstBeginButton();

                expect(mockNavigate).toHaveBeenCalledTimes(1);
                expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo: ROUTES.HOME}));
            });

            it('navigates to EXPENSE_REPORT_RHP when pay has exactly one report on wide layout', async () => {
                const reportID = '66';
                await act(async () => {
                    setTodoCounts({
                        ...BASE_TODOS,
                        reportsToPay: [{reportID}],
                    });
                });
                await waitForBatchedUpdatesWithAct();

                renderForYouSection();
                await waitForBatchedUpdatesWithAct();

                pressFirstBeginButton();

                expect(mockNavigate).toHaveBeenCalledTimes(1);
                expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo: ROUTES.HOME}));
            });

            it('navigates to EXPENSE_REPORT_RHP when export has exactly one report on wide layout', async () => {
                const reportID = '77';
                await act(async () => {
                    setTodoCounts({
                        ...BASE_TODOS,
                        reportsToExport: [{reportID}],
                    });
                });
                await waitForBatchedUpdatesWithAct();

                renderForYouSection();
                await waitForBatchedUpdatesWithAct();

                pressFirstBeginButton();

                expect(mockNavigate).toHaveBeenCalledTimes(1);
                expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID, backTo: ROUTES.HOME}));
            });
        });

        describe('narrow layout', () => {
            beforeEach(() => {
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
            });

            it('navigates to REPORT_WITH_ID when submit has exactly one report on narrow layout', async () => {
                const reportID = '99';
                await act(async () => {
                    setTodoCounts({
                        ...BASE_TODOS,
                        reportsToSubmit: [{reportID}],
                    });
                });
                await waitForBatchedUpdatesWithAct();

                renderForYouSection();
                await waitForBatchedUpdatesWithAct();

                pressFirstBeginButton();

                expect(mockNavigate).toHaveBeenCalledTimes(1);
                expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, ROUTES.HOME));
            });

            it('navigates to REPORT_WITH_ID when approve has exactly one report on narrow layout', async () => {
                const reportID = '100';
                await act(async () => {
                    setTodoCounts({
                        ...BASE_TODOS,
                        reportsToApprove: [{reportID}],
                    });
                });
                await waitForBatchedUpdatesWithAct();

                renderForYouSection();
                await waitForBatchedUpdatesWithAct();

                pressFirstBeginButton();

                expect(mockNavigate).toHaveBeenCalledTimes(1);
                expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(reportID, undefined, undefined, ROUTES.HOME));
            });
        });
    });
});

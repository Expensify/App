import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation from '@libs/Navigation/Navigation';
import ForYouSection from '@pages/home/ForYouSection';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {FlaggedExpensesDerivedValue, TodosDerivedValue} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
    getActiveRouteWithoutParams: jest.fn(() => ''),
    isNavigationReady: jest.fn(() => Promise.resolve()),
}));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

const mockNavigateToTransactionThread = jest.fn();
jest.mock('@hooks/useNavigateToTransactionThread', () => jest.fn(() => mockNavigateToTransactionThread));

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

const ACCOUNT_ID = 12345;

const BASE_TODOS: TodosDerivedValue = {
    reportsToSubmit: [],
    reportsToApprove: [],
    reportsToPay: [],
    reportsToExport: [],
    transactionsByReportID: {},
};

const EMPTY_FLAGGED_EXPENSES: FlaggedExpensesDerivedValue = {flaggedExpenses: []};

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
                await Onyx.set(ONYXKEYS.DERIVED.TODOS, BASE_TODOS);
                await Onyx.set(ONYXKEYS.DERIVED.FLAGGED_EXPENSES, EMPTY_FLAGGED_EXPENSES);
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
                await Onyx.set(ONYXKEYS.DERIVED.TODOS, {
                    ...BASE_TODOS,
                    reportsToSubmit: [{reportID: '1'} as TodosDerivedValue['reportsToSubmit'][number]],
                });
                await Onyx.set(ONYXKEYS.DERIVED.FLAGGED_EXPENSES, EMPTY_FLAGGED_EXPENSES);
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText(/homePage\.forYouSection\.reviewExpenses/)).not.toBeOnTheScreen();
        });

        it('renders with the count-1 string when exactly one expense is flagged', async () => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.DERIVED.TODOS, BASE_TODOS);
                await Onyx.set(ONYXKEYS.DERIVED.FLAGGED_EXPENSES, {
                    flaggedExpenses: [{transactionID: 't1', reportID: 'r1'}],
                });
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('homePage.forYouSection.reviewExpenses:{"count":1}')).toBeOnTheScreen();
        });

        it('renders with the count-N string when multiple expenses are flagged', async () => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.DERIVED.TODOS, BASE_TODOS);
                await Onyx.set(ONYXKEYS.DERIVED.FLAGGED_EXPENSES, {
                    flaggedExpenses: [
                        {transactionID: 't1', reportID: 'r1'},
                        {transactionID: 't2', reportID: 'r2'},
                        {transactionID: 't3', reportID: 'r3'},
                    ],
                });
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.getByText('homePage.forYouSection.reviewExpenses:{"count":3}')).toBeOnTheScreen();
        });

        it('renders the review row above submit/approve/pay/export rows', async () => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.DERIVED.TODOS, {
                    ...BASE_TODOS,
                    reportsToSubmit: [{reportID: 's1'} as TodosDerivedValue['reportsToSubmit'][number]],
                    reportsToApprove: [{reportID: 'a1'} as TodosDerivedValue['reportsToApprove'][number]],
                    reportsToPay: [{reportID: 'p1'} as TodosDerivedValue['reportsToPay'][number]],
                    reportsToExport: [{reportID: 'e1'} as TodosDerivedValue['reportsToExport'][number]],
                });
                await Onyx.set(ONYXKEYS.DERIVED.FLAGGED_EXPENSES, {
                    flaggedExpenses: [{transactionID: 't1', reportID: 'r1'}],
                });
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
                await Onyx.set(ONYXKEYS.DERIVED.TODOS, BASE_TODOS);
                await Onyx.set(ONYXKEYS.DERIVED.FLAGGED_EXPENSES, {
                    flaggedExpenses: [{transactionID: 't1', reportID: 'r1'}],
                });
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
    });

    describe('review row navigation', () => {
        it('delegates to useNavigateToTransactionThread with the first flagged expense and all sibling transaction IDs', async () => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.DERIVED.TODOS, BASE_TODOS);
                await Onyx.set(ONYXKEYS.DERIVED.FLAGGED_EXPENSES, {
                    flaggedExpenses: [
                        {transactionID: 't1', reportID: 'r1'},
                        {transactionID: 't2', reportID: 'r2'},
                    ],
                });
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}r1`, {reportID: 'r1'});
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}r1`, {
                    action1: {
                        reportActionID: 'action1',
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        childReportID: 'thread-r1',
                        message: {IOUTransactionID: 't1'},
                    },
                });
                await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}t1`, {transactionID: 't1', reportID: 'r1'});
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

        it('does not call the hook when there is no flagged transaction or report', async () => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.DERIVED.TODOS, BASE_TODOS);
                // count > 0 keeps the row rendered, but the first transaction/report are missing
                await Onyx.set(ONYXKEYS.DERIVED.FLAGGED_EXPENSES, {
                    flaggedExpenses: [{transactionID: '', reportID: ''}],
                });
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            const beginButton = screen.queryByText('Begin');
            if (beginButton) {
                fireEvent.press(beginButton);
            }

            expect(mockNavigateToTransactionThread).not.toHaveBeenCalled();
        });
    });

    describe('navigation with multiple reports (search route)', () => {
        it('navigates to SEARCH_ROOT when submit has multiple reports', async () => {
            await act(async () => {
                await Onyx.set(ONYXKEYS.DERIVED.TODOS, {
                    ...BASE_TODOS,
                    reportsToSubmit: [{reportID: '1'} as TodosDerivedValue['reportsToSubmit'][number], {reportID: '2'} as TodosDerivedValue['reportsToSubmit'][number]],
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
                await Onyx.set(ONYXKEYS.DERIVED.TODOS, {
                    ...BASE_TODOS,
                    reportsToApprove: [{reportID: '3'} as TodosDerivedValue['reportsToApprove'][number], {reportID: '4'} as TodosDerivedValue['reportsToApprove'][number]],
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
                    await Onyx.set(ONYXKEYS.DERIVED.TODOS, {
                        ...BASE_TODOS,
                        reportsToSubmit: [{reportID} as TodosDerivedValue['reportsToSubmit'][number]],
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
                    await Onyx.set(ONYXKEYS.DERIVED.TODOS, {
                        ...BASE_TODOS,
                        reportsToApprove: [{reportID} as TodosDerivedValue['reportsToApprove'][number]],
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
                    await Onyx.set(ONYXKEYS.DERIVED.TODOS, {
                        ...BASE_TODOS,
                        reportsToPay: [{reportID} as TodosDerivedValue['reportsToPay'][number]],
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
                    await Onyx.set(ONYXKEYS.DERIVED.TODOS, {
                        ...BASE_TODOS,
                        reportsToExport: [{reportID} as TodosDerivedValue['reportsToExport'][number]],
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
                    await Onyx.set(ONYXKEYS.DERIVED.TODOS, {
                        ...BASE_TODOS,
                        reportsToSubmit: [{reportID} as TodosDerivedValue['reportsToSubmit'][number]],
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
                    await Onyx.set(ONYXKEYS.DERIVED.TODOS, {
                        ...BASE_TODOS,
                        reportsToApprove: [{reportID} as TodosDerivedValue['reportsToApprove'][number]],
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

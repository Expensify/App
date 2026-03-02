import {act, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import Onyx from 'react-native-onyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import Navigation from '@libs/Navigation/Navigation';
import ForYouSection from '@pages/home/ForYouSection';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {TodosDerivedValue} from '@src/types/onyx';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

jest.mock('@libs/Navigation/Navigation', () => ({
    navigate: jest.fn(),
}));

jest.mock('@hooks/useResponsiveLayout', () => jest.fn());

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

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        MoneyBag: null,
        Send: null,
        ThumbsUp: null,
        Export: null,
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
            });
            await waitForBatchedUpdatesWithAct();

            renderForYouSection();
            await waitForBatchedUpdatesWithAct();

            expect(screen.queryByText('Begin')).not.toBeOnTheScreen();
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
                expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID}));
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
                expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID}));
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
                expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID}));
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
                expect(mockNavigate).toHaveBeenCalledWith(ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID}));
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
                expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(reportID));
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
                expect(mockNavigate).toHaveBeenCalledWith(ROUTES.REPORT_WITH_ID.getRoute(reportID));
            });
        });
    });
});

import {render} from '@testing-library/react-native';

import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyReportHeaderActions from '@components/MoneyReportHeaderActions';

import useMobileSelectionMode from '@hooks/useMobileSelectionMode';
import useMoneyReportHeaderMoreContentVisibility from '@hooks/useMoneyReportHeaderMoreContentVisibility';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';

import {turnOffMobileSelectionMode} from '@libs/actions/MobileSelectionMode';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type {Report, Transaction} from '@src/types/onyx';

import type * as NativeNavigation from '@react-navigation/native';
import type {UseOnyxResult} from 'react-native-onyx';

import React from 'react';

import createRandomTransaction from '../../utils/collections/transaction';

const REPORT_ID = '4242';

// The report is opened in an RHP, which is the only place a wide/super-wide RHP can happen.
jest.mock('@react-navigation/native', () => {
    const actualNavigation = jest.requireActual<typeof NativeNavigation>('@react-navigation/native');
    return {
        ...actualNavigation,
        __esModule: true,
        // The header only turns the shared selection mode off while it is the focused screen, and these tests render
        // it on its own rather than inside a navigator.
        useIsFocused: () => true,
        useRoute: () => {
            const SCREENS_MOCK = jest.requireActual<{default: typeof SCREENS}>('@src/SCREENS').default;
            return {key: 'rhp-route-key', name: SCREENS_MOCK.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, params: {reportID: REPORT_ID}};
        },
    };
});

// `HeaderWithBackButton` is the element under test: the narrow branch renders it with a `title`, the wide
// branch renders it with the report avatar and the action buttons as children. Pass children through so the
// wide branch's `MoneyReportHeaderActions` still mounts and can be asserted on.
jest.mock('@components/HeaderWithBackButton', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    return jest.fn(({children}: {children?: React.ReactNode}) => reactModule.createElement(reactModule.Fragment, null, children));
});

// Siblings of the header row are stubbed to keep the render lightweight; only their mounting is asserted.
jest.mock('@components/MoneyReportHeaderActions', () => jest.fn(() => null));
jest.mock('@components/MoneyReportHeaderMoreContent', () => jest.fn(() => null));
jest.mock('@components/HeaderLoadingBar', () => jest.fn(() => null));

// The route mocked above is a search route, so the wide branch of the header renders the report carousel beside the
// title. These tests are about which header branch renders, not about the arrows, and the real carousels read the
// search contexts and Onyx directly, which the mocks below deliberately do not provide.
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportNavigation', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportTransactionsNavigation', () => jest.fn(() => null));

// The modal host and the payment animation provider only wrap the content, so render each as a plain
// wrapper that yields its children instead of wiring up their full Onyx/context dependency chains.
jest.mock('@components/MoneyReportHeaderModals', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    return jest.fn(({children}: {children?: React.ReactNode}) => reactModule.createElement(reactModule.Fragment, null, children));
});
jest.mock('@components/PaymentAnimationsContext', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    return {
        __esModule: true,
        PaymentAnimationsProvider: jest.fn(({children}: {children?: React.ReactNode}) => reactModule.createElement(reactModule.Fragment, null, children)),
        usePaymentAnimationsContext: jest.fn(() => ({})),
    };
});

// Only `clearSelectedTransactions` is reached from the header, and only from the narrow back button's press
// handler, which these tests don't fire.
jest.mock('@components/Search/SearchContext', () => ({__esModule: true, useSearchSelectionActions: jest.fn(() => ({clearSelectedTransactions: jest.fn()}))}));

jest.mock('@libs/actions/MobileSelectionMode', () => ({__esModule: true, turnOffMobileSelectionMode: jest.fn(), turnOnMobileSelectionMode: jest.fn()}));

jest.mock('@hooks/useMobileSelectionMode', () => jest.fn());
// The more-content row decides whether the actions sit in the header row or under it. These tests are about the
// selection-mode branch rather than that placement, and the row's real visibility is derived from the filler
// transactions below, so it is pinned to "nothing to show" and the actions stay in the header row.
jest.mock('@hooks/useMoneyReportHeaderMoreContentVisibility', () => jest.fn());
jest.mock('@hooks/useNetwork', () => jest.fn());
jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => jest.fn());
jest.mock('@hooks/useTransactionsAndViolationsForReport', () => jest.fn());
jest.mock('@hooks/useReportPrimaryAction', () => jest.fn(() => ''));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => new Proxy({}, {get: () => ({})})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: jest.fn((key: string) => key), numberFormat: jest.fn((num: number) => num.toString()), localeCompare: jest.fn()})));

const mockHeaderWithBackButton = jest.mocked(HeaderWithBackButton);
const mockMoneyReportHeaderActions = jest.mocked(MoneyReportHeaderActions);
const mockUseMobileSelectionMode = jest.mocked(useMobileSelectionMode);
const mockUseMoneyReportHeaderMoreContentVisibility = jest.mocked(useMoneyReportHeaderMoreContentVisibility);
const mockUseNetwork = jest.mocked(useNetwork);
const mockUseOnyx = jest.mocked(useOnyx);
const mockUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockUseResponsiveLayoutOnWideRHP = jest.mocked(useResponsiveLayoutOnWideRHP);
const mockUseTransactionsAndViolationsForReport = jest.mocked(useTransactionsAndViolationsForReport);
const mockTurnOffMobileSelectionMode = jest.mocked(turnOffMobileSelectionMode);

const report: Report = {reportID: REPORT_ID, reportName: 'Expense Report', type: CONST.REPORT.TYPE.EXPENSE};

function createOnyxResult<T>(value: NonNullable<T> | undefined): UseOnyxResult<T> {
    return [value, {status: 'loaded'}];
}

const WIDE_WINDOW: ResponsiveLayoutResult = {
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
};

// A narrow window: `isSmallScreenWidth` makes every layout hook report a narrow layout.
const NARROW_WINDOW: ResponsiveLayoutResult = {
    ...WIDE_WINDOW,
    shouldUseNarrowLayout: true,
    isSmallScreenWidth: true,
    isSmallScreen: true,
    isLargeScreenWidth: false,
};

// A wide window with the report in an RHP. `useResponsiveLayout` still reports `shouldUseNarrowLayout: true`
// here because of `isInNarrowPaneModal` — window width can never flip it back — which is exactly why the
// header cannot gate its narrow "Select multiple" state on that value.
const WIDE_WINDOW_IN_RHP: ResponsiveLayoutResult = {...WIDE_WINDOW, shouldUseNarrowLayout: true, isInNarrowPaneModal: true};

type RHPWidth = 'narrowPane' | 'wideRHP' | 'superWideRHP';

/**
 * Point both layout hooks at the same window, deriving the wide-RHP hook's values the way the real
 * `useResponsiveLayoutOnWideRHP` does, so these tests can't drift from it.
 */
function mockWindow(layout: ResponsiveLayoutResult, rhpWidth: RHPWidth = 'narrowPane') {
    const isWideRHPDisplayedOnWideLayout = !layout.isSmallScreenWidth && rhpWidth === 'wideRHP';
    const isSuperWideRHPDisplayedOnWideLayout = !layout.isSmallScreenWidth && rhpWidth === 'superWideRHP';

    mockUseResponsiveLayout.mockReturnValue(layout);
    mockUseResponsiveLayoutOnWideRHP.mockReturnValue({
        ...layout,
        shouldUseNarrowLayout: (layout.isSmallScreenWidth || layout.isInNarrowPaneModal) && !isWideRHPDisplayedOnWideLayout && !isSuperWideRHPDisplayedOnWideLayout,
        isWideRHPDisplayedOnWideLayout,
        isSuperWideRHPDisplayedOnWideLayout,
    });
}

/**
 * Put `pendingActions.length` transactions on the report, one per entry, applying that entry's pending action.
 * Only `pendingAction` matters to the header, so the rest of each transaction is filler.
 */
function mockTransactions(pendingActions: Array<Transaction['pendingAction']>) {
    const transactions: Record<string, Transaction> = {};
    for (const [index, pendingAction] of pendingActions.entries()) {
        transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${index}`] = {...createRandomTransaction(index), pendingAction};
    }

    mockUseTransactionsAndViolationsForReport.mockReturnValue({transactions, violations: {}, isLoaded: true});
}

const renderHeader = () =>
    render(
        <MoneyReportHeader
            reportID={REPORT_ID}
            onBackButtonPress={jest.fn()}
        />,
    );

/**
 * The title the most recent `HeaderWithBackButton` render was given. Only the narrow selection-mode branch
 * passes one, so this doubles as "which branch rendered". Read one prop at a time rather than asserting on
 * the whole props object, which carries the rendered children and is too deep for Jest to diff.
 */
const lastHeaderTitle = () => mockHeaderWithBackButton.mock.calls.at(-1)?.at(0)?.title;

/** The report the most recent `HeaderWithBackButton` render was given — only the wide branch passes one. */
const lastHeaderReport = () => mockHeaderWithBackButton.mock.calls.at(-1)?.at(0)?.report;

describe('MoneyReportHeader selection mode header', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockUseNetwork.mockReturnValue({isOffline: false});
        mockUseMobileSelectionMode.mockReturnValue(true);
        mockUseMoneyReportHeaderMoreContentVisibility.mockReturnValue({statusBarType: undefined, shouldShowNextStep: false, hasStatusOrNextStep: false});
        mockUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`) {
                return createOnyxResult<Report>(report);
            }
            return createOnyxResult(undefined);
        });

        // Two live transactions so the "one or no transactions left" cleanup never fires unless a test asks for it.
        mockTransactions([null, null]);
        mockWindow(NARROW_WINDOW);
    });

    it('renders the narrow "Select multiple" header while selection mode is on in a narrow window', () => {
        renderHeader();

        expect(lastHeaderTitle()).toBe('common.selectMultiple');
        expect(mockMoneyReportHeaderActions).not.toHaveBeenCalled();
    });

    it('keeps the "Select multiple" header in a narrow-pane RHP that is not wide or super-wide', () => {
        mockWindow(WIDE_WINDOW_IN_RHP, 'narrowPane');

        renderHeader();

        expect(lastHeaderTitle()).toBe('common.selectMultiple');
        expect(mockMoneyReportHeaderActions).not.toHaveBeenCalled();
    });

    it.each([
        ['wide RHP', 'wideRHP'],
        ['super-wide RHP', 'superWideRHP'],
    ] as const)('swaps the "Select multiple" header for the wide header when a %s is resized back to a wide window with expenses selected', (_label, rhpWidth) => {
        // Long press in a narrow window turns mobile selection mode on and the narrow header appears.
        const {rerender} = renderHeader();
        expect(lastHeaderTitle()).toBe('common.selectMultiple');

        // Resize back to a wide window. Selection mode stays on by design (the selection survives the resize),
        // so the header is what has to adapt.
        mockWindow(WIDE_WINDOW_IN_RHP, rhpWidth);
        rerender(
            <MoneyReportHeader
                reportID={REPORT_ID}
                onBackButtonPress={jest.fn()}
            />,
        );

        expect(mockUseMobileSelectionMode()).toBe(true);
        expect(lastHeaderTitle()).toBeUndefined();
        expect(lastHeaderReport()).toBe(report);
        // `shouldShowHeaderButtonsInHeaderRow` is already true in a wide RHP, so the actions (and with a
        // selection live, the "X selected" dropdown inside them) render in the header row.
        expect(mockMoneyReportHeaderActions).toHaveBeenCalled();
    });

    it.each([
        ['wide RHP', 'wideRHP'],
        ['super-wide RHP', 'superWideRHP'],
    ] as const)('restores the "Select multiple" header when a %s is resized down to a narrow window with expenses selected', (_label, rhpWidth) => {
        mockWindow(WIDE_WINDOW_IN_RHP, rhpWidth);
        const {rerender} = renderHeader();
        expect(lastHeaderTitle()).toBeUndefined();
        expect(mockMoneyReportHeaderActions).toHaveBeenCalled();

        // Forget the wide render's calls so the assertion after the resize only sees the narrow render.
        mockMoneyReportHeaderActions.mockClear();

        mockWindow(NARROW_WINDOW, rhpWidth);
        rerender(
            <MoneyReportHeader
                reportID={REPORT_ID}
                onBackButtonPress={jest.fn()}
            />,
        );

        expect(lastHeaderTitle()).toBe('common.selectMultiple');
        expect(mockMoneyReportHeaderActions).not.toHaveBeenCalled();
    });

    it('renders the wide header when selection mode is off in a wide RHP', () => {
        mockUseMobileSelectionMode.mockReturnValue(false);
        mockWindow(WIDE_WINDOW_IN_RHP, 'wideRHP');

        renderHeader();

        expect(lastHeaderTitle()).toBeUndefined();
        expect(mockMoneyReportHeaderActions).toHaveBeenCalled();
    });

    describe('selection mode cleanup when one or no transactions remain', () => {
        it.each([
            ['narrow window', NARROW_WINDOW, 'narrowPane'],
            ['wide RHP', WIDE_WINDOW_IN_RHP, 'wideRHP'],
            ['super-wide RHP', WIDE_WINDOW_IN_RHP, 'superWideRHP'],
        ] as const)('turns selection mode off in a %s when a single transaction is left', (_label, layout, rhpWidth) => {
            mockWindow(layout, rhpWidth);
            mockTransactions([null]);

            renderHeader();

            expect(mockTurnOffMobileSelectionMode).toHaveBeenCalled();
        });

        it('turns selection mode off in a wide RHP when a single transaction is left after deleting the others', () => {
            mockWindow(WIDE_WINDOW_IN_RHP, 'wideRHP');
            mockTransactions([null, CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE]);

            renderHeader();

            expect(mockTurnOffMobileSelectionMode).toHaveBeenCalled();
        });

        it('keeps selection mode on in a wide RHP when a pending delete is still visible offline', () => {
            mockUseNetwork.mockReturnValue({isOffline: true});
            mockWindow(WIDE_WINDOW_IN_RHP, 'wideRHP');
            mockTransactions([null, CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE]);

            renderHeader();

            expect(mockTurnOffMobileSelectionMode).not.toHaveBeenCalled();
        });

        it.each([
            ['wide RHP', 'wideRHP'],
            ['super-wide RHP', 'superWideRHP'],
        ] as const)('keeps selection mode on in a %s while two or more transactions remain', (_label, rhpWidth) => {
            mockWindow(WIDE_WINDOW_IN_RHP, rhpWidth);

            renderHeader();

            expect(mockTurnOffMobileSelectionMode).not.toHaveBeenCalled();
        });

        it('still runs the cleanup after a wide RHP is resized back to a wide window', () => {
            const {rerender} = renderHeader();
            expect(mockTurnOffMobileSelectionMode).not.toHaveBeenCalled();

            // The cleanup lives outside the narrow-header branch, so widening the window must not skip it.
            mockWindow(WIDE_WINDOW_IN_RHP, 'wideRHP');
            mockTransactions([null]);
            rerender(
                <MoneyReportHeader
                    reportID={REPORT_ID}
                    onBackButtonPress={jest.fn()}
                />,
            );

            expect(mockTurnOffMobileSelectionMode).toHaveBeenCalled();
            expect(lastHeaderTitle()).toBeUndefined();
        });
    });
});

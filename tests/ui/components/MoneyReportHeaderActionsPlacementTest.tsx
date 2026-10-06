import {render} from '@testing-library/react-native';

import MoneyReportHeader from '@components/MoneyReportHeader';
import MoneyReportHeaderActions from '@components/MoneyReportHeaderActions';
import MoneyReportHeaderMoreContent from '@components/MoneyReportHeaderMoreContent';

import useMoneyReportHeaderMoreContentVisibility from '@hooks/useMoneyReportHeaderMoreContentVisibility';
import useOnyx from '@hooks/useOnyx';
import useReportPrimaryAction from '@hooks/useReportPrimaryAction';
import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import type * as ReactNavigationNative from '@react-navigation/native';

import {useRoute} from '@react-navigation/native';
import React from 'react';

const REPORT_ID = '1001';
const CHAT_REPORT_ID = '2001';

const HEADER_ROW_TEST_ID = 'header-row';
const ACTIONS_TEST_ID = 'header-actions';
const REPORT_CAROUSEL_TEST_ID = 'report-carousel';
const TRANSACTIONS_CAROUSEL_TEST_ID = 'transactions-carousel';

const PARENT_REPORT_ID = '3001';
const PARENT_ACTION_ID = 'parentAction1';
const THREAD_TRANSACTION_ID = 'thread-tx-1';

/** A 1:1 DM IOU report: `isDM` is true for its chat report, and there is no next step or status bar to show. */
const iouReport = {reportID: REPORT_ID, chatReportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.IOU} as Report;
const dmChatReport = {reportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT} as Report;

jest.mock('@hooks/useOnyx', () => jest.fn());
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
jest.mock('@hooks/useReportPrimaryAction', () => jest.fn());
jest.mock('@hooks/useMoneyReportHeaderMoreContentVisibility', () => jest.fn());
jest.mock('@hooks/useResponsiveLayoutOnWideRHP', () => jest.fn(() => ({isWideRHPDisplayedOnWideLayout: false, isSuperWideRHPDisplayedOnWideLayout: false})));
jest.mock('@hooks/useNetwork', () => jest.fn(() => ({isOffline: false})));
jest.mock('@hooks/useMobileSelectionMode', () => jest.fn(() => false));
jest.mock('@hooks/useTransactionsAndViolationsForReport', () => jest.fn(() => ({transactions: {}, violations: {}})));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key})));

// The placement under test ships behind the expense carousel beta, so it is on unless a test turns it off.
let mockIsExpenseCarouselEnabled = true;
jest.mock('@hooks/usePermissions', () => ({
    __esModule: true,
    default: () => ({isBetaEnabled: (beta: string) => beta === 'expenseCarousel' && mockIsExpenseCarouselEnabled}),
}));

// useThemeStyles throws without a <ThemeStylesProvider>; return a proxy that yields an empty style object
// for any key so the (mostly-mocked) tree renders without wiring up the full provider stack.
jest.mock('@hooks/useThemeStyles', () => {
    const styleProxy = new Proxy({}, {get: () => ({})});
    return jest.fn(() => styleProxy);
});

// Only `useRoute` and `useIsFocused` are stubbed: the rest of the module is used by the navigation imports
// ReportUtils pulls in. The header reads `useIsFocused` to decide whether it owns the shared mobile selection mode,
// and these tests render it on its own rather than inside a navigator, so there is no navigation object to read.
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    __esModule: true,
    useRoute: jest.fn(),
    useIsFocused: () => true,
}));

// The providers only supply context to the (mocked) leaves, so pass children straight through.
jest.mock('@components/MoneyReportHeaderModals', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    return jest.fn(({children}: {children: React.ReactNode}) => reactModule.createElement(reactModule.Fragment, null, children));
});
jest.mock('@components/PaymentAnimationsContext', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    return {
        __esModule: true,
        PaymentAnimationsProvider: jest.fn(({children}: {children: React.ReactNode}) => reactModule.createElement(reactModule.Fragment, null, children)),
    };
});
jest.mock('@components/Search/SearchContext', () => ({
    __esModule: true,
    useSearchSelectionActions: jest.fn(() => ({clearSelectedTransactions: jest.fn()})),
}));

// HeaderWithBackButton stands in for the title row: it renders only its children, tagged so the test can
// assert what landed on the title row and in which order.
jest.mock('@components/HeaderWithBackButton', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<{View: React.ComponentType<{testID?: string; children?: React.ReactNode}>}>('react-native');
    return jest.fn(({children}: {children: React.ReactNode}) => reactModule.createElement(View, {testID: 'header-row'}, children));
});
jest.mock('@components/HeaderLoadingBar', () => jest.fn(() => null));
jest.mock('@components/MoneyReportHeaderActions', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<{View: React.ComponentType<{testID?: string; children?: React.ReactNode}>}>('react-native');
    return jest.fn(() => reactModule.createElement(View, {testID: 'header-actions'}));
});
jest.mock('@components/MoneyReportHeaderMoreContent', () => jest.fn(() => null));
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportNavigation', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<{View: React.ComponentType<{testID?: string; children?: React.ReactNode}>}>('react-native');
    return jest.fn(() => reactModule.createElement(View, {testID: 'report-carousel'}));
});
jest.mock('@components/MoneyRequestReportView/MoneyRequestReportTransactionsNavigation', () => {
    const reactModule = jest.requireActual<typeof React>('react');
    const {View} = jest.requireActual<{View: React.ComponentType<{testID?: string; children?: React.ReactNode}>}>('react-native');
    return jest.fn(() => reactModule.createElement(View, {testID: 'transactions-carousel'}));
});

const mockedUseOnyx = jest.mocked(useOnyx);
const mockedUseRoute = jest.mocked(useRoute);
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);
const mockedUseReportPrimaryAction = jest.mocked(useReportPrimaryAction);
const mockedMoreContentVisibility = jest.mocked(useMoneyReportHeaderMoreContentVisibility);
const mockedActions = jest.mocked(MoneyReportHeaderActions);
const mockedMoreContent = jest.mocked(MoneyReportHeaderMoreContent);

/** Collects the tagged testIDs in render order so the test can assert left-to-right placement on the title row. */
function getHeaderRowTestIDs(node: ReturnType<ReturnType<typeof render>['toJSON']>): string[] {
    const found: string[] = [];
    const walk = (current: unknown, isInsideHeaderRow: boolean) => {
        if (!current || typeof current !== 'object') {
            return;
        }
        if (Array.isArray(current)) {
            for (const child of current) {
                walk(child, isInsideHeaderRow);
            }
            return;
        }
        const element = current as {props?: Record<string, unknown>; children?: unknown};
        const testID = element.props?.testID;
        const isHeaderRow = testID === HEADER_ROW_TEST_ID;
        if (isInsideHeaderRow && typeof testID === 'string' && testID !== HEADER_ROW_TEST_ID) {
            found.push(testID);
        }
        walk(element.children, isInsideHeaderRow || isHeaderRow);
    };
    walk(node, false);
    return found;
}

function renderHeader() {
    return render(
        <MoneyReportHeader
            reportID={REPORT_ID}
            onBackButtonPress={jest.fn()}
        />,
    );
}

/**
 * Regression guard for https://github.com/Expensify/App/issues/98200: the report actions must sit on the title row
 * whenever the more-content row would otherwise be blank, no matter whether the report was opened directly or from
 * Search. Placement used to flip between the two entry points, moving the buttons onto a row of their own in Search.
 */
describe('MoneyReportHeader actions placement', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsExpenseCarouselEnabled = true;

        // A wide layout, so the header-row placement is in play at all.
        mockedUseResponsiveLayout.mockReturnValue({
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
        mockedUseReportPrimaryAction.mockReturnValue(CONST.REPORT.PRIMARY_ACTIONS.PAY);
        mockedMoreContentVisibility.mockReturnValue({statusBarType: undefined, shouldShowNextStep: false, hasStatusOrNextStep: false});
        mockedUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`) {
                return [iouReport, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`) {
                return [dmChatReport, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    it.each([
        ['opened directly', SCREENS.REPORT],
        ['opened from Search', SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT],
        ['opened from Search as an expense', SCREENS.RIGHT_MODAL.SEARCH_REPORT],
    ])('keeps the actions on the title row when the report is %s', (_label, routeName) => {
        mockedUseRoute.mockReturnValue({key: 'route-1', name: routeName, params: {}});

        const {toJSON} = renderHeader();

        expect(getHeaderRowTestIDs(toJSON())).toContain(ACTIONS_TEST_ID);
        // The actions row under the title must stay empty, otherwise the buttons would render twice.
        expect(mockedMoreContent).toHaveBeenCalled();
        expect(mockedMoreContent.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({shouldRenderActionsInRow: false}));
    });

    it.each([
        ['an invoice report, whose chat report is an invoice room', {reportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM} as Report],
        [
            'a workspace report, whose chat report is a policy expense chat',
            {reportID: CHAT_REPORT_ID, type: CONST.REPORT.TYPE.CHAT, chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT} as Report,
        ],
    ])('keeps the actions on the title row for %s', (_label, chatReport) => {
        mockedUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`) {
                return [iouReport, {status: 'loaded'}];
            }
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`) {
                return [chatReport, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
        mockedUseRoute.mockReturnValue({key: 'route-1', name: SCREENS.REPORT, params: {}});

        const {toJSON} = renderHeader();

        expect(getHeaderRowTestIDs(toJSON())).toContain(ACTIONS_TEST_ID);
        expect(mockedMoreContent.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({shouldRenderActionsInRow: false}));
    });

    it('renders the actions before the carousel so the carousel stays pinned to the top right', () => {
        mockedUseRoute.mockReturnValue({key: 'route-1', name: SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, params: {}});

        const {toJSON} = renderHeader();

        expect(getHeaderRowTestIDs(toJSON())).toEqual([ACTIONS_TEST_ID, REPORT_CAROUSEL_TEST_ID]);
    });

    it('moves the actions down to the more-content row when that row has a status or next step', () => {
        mockedMoreContentVisibility.mockReturnValue({statusBarType: CONST.REPORT.STATUS_BAR_TYPE.ON_HOLD, shouldShowNextStep: false, hasStatusOrNextStep: true});
        mockedUseRoute.mockReturnValue({key: 'route-1', name: SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, params: {}});

        const {toJSON} = renderHeader();

        expect(getHeaderRowTestIDs(toJSON())).not.toContain(ACTIONS_TEST_ID);
        expect(mockedActions).not.toHaveBeenCalled();
        expect(mockedMoreContent.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({shouldRenderActionsInRow: true}));
    });
});

describe('MoneyReportHeader transaction carousel anchor', () => {
    const threadReport = {
        reportID: REPORT_ID,
        chatReportID: CHAT_REPORT_ID,
        parentReportID: PARENT_REPORT_ID,
        parentReportActionID: PARENT_ACTION_ID,
        type: CONST.REPORT.TYPE.CHAT,
    } as Report;

    const parentIOUAction = {
        reportActionID: PARENT_ACTION_ID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        originalMessage: {IOUTransactionID: THREAD_TRANSACTION_ID, type: CONST.IOU.REPORT_ACTION_TYPE.CREATE},
    };

    function mockThread({
        activeIDs,
        parentActions,
        transactions = Object.fromEntries(activeIDs.map((id) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`, {transactionID: id, reportID: PARENT_REPORT_ID}])),
    }: {
        activeIDs: string[];
        parentActions: Record<string, unknown> | undefined;
        transactions?: Record<string, unknown>;
    }) {
        // The anchor is read through a `selector`, so the mock has to apply it the way useOnyx does.
        mockedUseOnyx.mockImplementation((key, options) => {
            const rawValue = (() => {
                if (key === `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`) {
                    return threadReport;
                }
                if (key === ONYXKEYS.TRANSACTION_THREAD_NAVIGATION_TRANSACTION_IDS) {
                    return activeIDs;
                }
                if (key === ONYXKEYS.COLLECTION.TRANSACTION) {
                    return transactions;
                }
                if (key === `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${PARENT_REPORT_ID}`) {
                    return parentActions;
                }
                return undefined;
            })();
            const {selector} = options ?? {};
            const value = selector ? selector(rawValue) : rawValue;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- useOnyx's result type can't express "value depends on the key", and each branch above returns the shape its own key really holds
            return [value as NonNullable<unknown> | undefined, {status: 'loaded'}];
        });
        mockedUseRoute.mockReturnValue({key: 'route-1', name: SCREENS.RIGHT_MODAL.SEARCH_REPORT, params: {}});
    }

    beforeEach(() => {
        mockIsExpenseCarouselEnabled = true;
        mockedMoreContentVisibility.mockReturnValue({statusBarType: undefined, shouldShowNextStep: false, hasStatusOrNextStep: false});
        mockedUseReportPrimaryAction.mockReturnValue(CONST.REPORT.PRIMARY_ACTIONS.PAY);
    });

    it('renders the transaction carousel using the parent IOU action when the derived index is cold', () => {
        mockThread({activeIDs: ['other-tx', THREAD_TRANSACTION_ID], parentActions: {[PARENT_ACTION_ID]: parentIOUAction}});

        const {toJSON} = renderHeader();

        expect(getHeaderRowTestIDs(toJSON())).toContain(TRANSACTIONS_CAROUSEL_TEST_ID);
    });

    it('does not render it when the resolved expense is not one of the carousel siblings', () => {
        mockThread({activeIDs: ['other-tx', 'unrelated-tx'], parentActions: {[PARENT_ACTION_ID]: parentIOUAction}});

        const {toJSON} = renderHeader();

        expect(getHeaderRowTestIDs(toJSON())).not.toContain(TRANSACTIONS_CAROUSEL_TEST_ID);
    });

    it('does not render it when the parent action is unavailable, so there is no expense to anchor to', () => {
        mockThread({activeIDs: ['other-tx', THREAD_TRANSACTION_ID], parentActions: undefined});

        const {toJSON} = renderHeader();

        expect(getHeaderRowTestIDs(toJSON())).not.toContain(TRANSACTIONS_CAROUSEL_TEST_ID);
    });

    it('falls through to the report carousel when a sibling has been deleted out from under the list', () => {
        mockThread({
            activeIDs: ['other-tx', THREAD_TRANSACTION_ID],
            parentActions: {[PARENT_ACTION_ID]: parentIOUAction},
            transactions: {
                // 'other-tx' is absent: a confirmed delete SETs its key to null, leaving one sibling behind.
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${THREAD_TRANSACTION_ID}`]: {transactionID: THREAD_TRANSACTION_ID, reportID: PARENT_REPORT_ID},
            },
        });

        const {toJSON} = renderHeader();

        expect(getHeaderRowTestIDs(toJSON())).not.toContain(TRANSACTIONS_CAROUSEL_TEST_ID);
        expect(getHeaderRowTestIDs(toJSON())).toContain(REPORT_CAROUSEL_TEST_ID);
    });

    it('does not render the expense carousel in the Inbox central pane', () => {
        mockThread({activeIDs: ['other-tx', THREAD_TRANSACTION_ID], parentActions: {[PARENT_ACTION_ID]: parentIOUAction}});
        mockedUseRoute.mockReturnValue({key: 'route-1', name: SCREENS.REPORT, params: {}});

        const {toJSON} = renderHeader();

        expect(getHeaderRowTestIDs(toJSON())).not.toContain(TRANSACTIONS_CAROUSEL_TEST_ID);
        expect(getHeaderRowTestIDs(toJSON())).not.toContain(REPORT_CAROUSEL_TEST_ID);
    });

    it('keeps the report carousel on a report opened from the Reports list', () => {
        mockThread({activeIDs: ['other-tx', THREAD_TRANSACTION_ID], parentActions: {[PARENT_ACTION_ID]: parentIOUAction}});
        mockedUseRoute.mockReturnValue({key: 'route-1', name: SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, params: {}});

        const {toJSON} = renderHeader();

        expect(getHeaderRowTestIDs(toJSON())).not.toContain(TRANSACTIONS_CAROUSEL_TEST_ID);
        expect(getHeaderRowTestIDs(toJSON())).toContain(REPORT_CAROUSEL_TEST_ID);
    });

    it('does not render either carousel on the title row while the expense carousel beta is off', () => {
        // Given an expense thread that would anchor the expense carousel, but the expense carousel beta is off
        mockIsExpenseCarouselEnabled = false;
        mockThread({activeIDs: ['other-tx', THREAD_TRANSACTION_ID], parentActions: {[PARENT_ACTION_ID]: parentIOUAction}});

        // When the header renders
        const {toJSON} = renderHeader();

        // Then the title row has no carousel, and the report arrows go back to the end of the more-content row
        expect(getHeaderRowTestIDs(toJSON())).not.toContain(TRANSACTIONS_CAROUSEL_TEST_ID);
        expect(getHeaderRowTestIDs(toJSON())).not.toContain(REPORT_CAROUSEL_TEST_ID);
        expect(mockedMoreContent.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({shouldRenderReportNavigationInRow: true}));
    });
});

describe('MoneyReportHeader without the expense carousel beta', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsExpenseCarouselEnabled = false;
        mockedUseResponsiveLayout.mockReturnValue({
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
        mockedUseReportPrimaryAction.mockReturnValue(CONST.REPORT.PRIMARY_ACTIONS.PAY);
        mockedUseOnyx.mockImplementation((key) => {
            if (key === `${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`) {
                return [iouReport, {status: 'loaded'}];
            }
            return [undefined, {status: 'loaded'}];
        });
    });

    it('keeps the actions on the title row even when the more-content row has a status or next step', () => {
        // Given a wide report opened from Search whose more-content row has a status
        mockedMoreContentVisibility.mockReturnValue({statusBarType: CONST.REPORT.STATUS_BAR_TYPE.ON_HOLD, shouldShowNextStep: false, hasStatusOrNextStep: true});
        mockedUseRoute.mockReturnValue({key: 'route-1', name: SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, params: {}});

        // When the header renders
        const {toJSON} = renderHeader();

        // Then the actions stay on the title row as they did before the expense carousel rework, and the report arrows sit in the more-content row
        expect(getHeaderRowTestIDs(toJSON())).toEqual([ACTIONS_TEST_ID]);
        expect(mockedMoreContent.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({shouldRenderActionsInRow: false, shouldRenderReportNavigationInRow: true}));
    });

    it('does not render the report arrows anywhere outside Search', () => {
        // Given a report opened directly in the Inbox
        mockedMoreContentVisibility.mockReturnValue({statusBarType: undefined, shouldShowNextStep: false, hasStatusOrNextStep: false});
        mockedUseRoute.mockReturnValue({key: 'route-1', name: SCREENS.REPORT, params: {}});

        // When the header renders
        const {toJSON} = renderHeader();

        // Then the report arrows are neither on the title row nor in the more-content row, because they only page through search results
        expect(getHeaderRowTestIDs(toJSON())).not.toContain(REPORT_CAROUSEL_TEST_ID);
        expect(mockedMoreContent.mock.calls.at(-1)?.at(0)).toEqual(expect.objectContaining({shouldRenderReportNavigationInRow: false}));
    });
});

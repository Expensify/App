import getTopmostFullScreenRoute from '@libs/Navigation/helpers/getTopmostFullScreenRoute';
import {
    isChatRoom,
    isChatThread,
    isConciergeChatReport,
    isDM,
    isGroupChat,
    isInvoiceReport,
    isInvoiceRoom,
    isMoneyRequestReport,
    isOneTransactionReport,
    isPolicyExpenseChat,
    isReportTransactionThread,
    isSelfDM,
    isTaskReport,
} from '@libs/ReportUtils';
import getSendMessageSource from '@libs/telemetry/getSendMessageSource';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import type {ValueOf} from 'type-fest';

// Mock the ReportUtils predicates so we test getSendMessageSource's precedence logic in isolation,
// not ReportUtils' report-shape rules. Every predicate defaults to false; each test flips the ones it needs.
jest.mock('@libs/ReportUtils', () => ({
    isChatRoom: jest.fn(() => false),
    isChatThread: jest.fn(() => false),
    isConciergeChatReport: jest.fn(() => false),
    isDM: jest.fn(() => false),
    isGroupChat: jest.fn(() => false),
    isInvoiceReport: jest.fn(() => false),
    isInvoiceRoom: jest.fn(() => false),
    isMoneyRequestReport: jest.fn(() => false),
    isOneTransactionReport: jest.fn(() => false),
    isPolicyExpenseChat: jest.fn(() => false),
    isReportTransactionThread: jest.fn(() => false),
    isSelfDM: jest.fn(() => false),
    isTaskReport: jest.fn(() => false),
}));

// Every value is prefixed with the tab the send is on; mock the topmost tab route so each test controls it.
jest.mock('@libs/Navigation/helpers/getTopmostFullScreenRoute', () => jest.fn(() => undefined));

const PREDICATES = [
    isChatRoom,
    isChatThread,
    isConciergeChatReport,
    isDM,
    isGroupChat,
    isInvoiceReport,
    isInvoiceRoom,
    isMoneyRequestReport,
    isOneTransactionReport,
    isPolicyExpenseChat,
    isReportTransactionThread,
    isSelfDM,
    isTaskReport,
];

const {SEND_MESSAGE_SOURCE, SEND_MESSAGE_SOURCE_TAB, SEND_MESSAGE_SOURCE_SURFACE} = CONST.TELEMETRY;
const report = {reportID: '1'} as Report;

/** Prefix a scenario base with a tab, mirroring how getSendMessageSource stamps a central-pane value. */
const withTab = (tab: ValueOf<typeof SEND_MESSAGE_SOURCE_TAB>, base: ValueOf<typeof SEND_MESSAGE_SOURCE>) => `${tab}_${base}` as const;

/** Same, plus the generic-RHP `_rhp` surface suffix. */
const withRhp = (tab: ValueOf<typeof SEND_MESSAGE_SOURCE_TAB>, base: ValueOf<typeof SEND_MESSAGE_SOURCE>) => `${tab}_${base}_${SEND_MESSAGE_SOURCE_SURFACE.RHP}` as const;

/** Build the params with sane defaults; override per test. SCREENS.REPORT is a non-expense-report route. */
function params(overrides: Partial<Parameters<typeof getSendMessageSource>[0]> = {}) {
    return {report, conciergeReportID: undefined, isInSidePanel: false, routeName: SCREENS.REPORT, ...overrides};
}

/** Fake the topmost tab route so the tab prefix resolves to home / inbox / spend. */
const tabRoute = (name: string) => ({key: 'k', name}) as ReturnType<typeof getTopmostFullScreenRoute>;

// clearAllMocks keeps mockReturnValue implementations, so reset every mock before each test. The default tab
// is the inbox (REPORTS_SPLIT_NAVIGATOR) — where a normal central-pane report lives — so report-type tests
// read `inbox_*`; surface tests override the tab as needed.
beforeEach(() => {
    for (const predicate of PREDICATES) {
        jest.mocked(predicate).mockReturnValue(false);
    }
    jest.mocked(getTopmostFullScreenRoute).mockReturnValue(tabRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));
});

describe('getSendMessageSource', () => {
    describe('tab prefix', () => {
        it('prefixes with the tab the send is on, falling back to other for an unresolved tab', () => {
            jest.mocked(isDM).mockReturnValue(true);

            jest.mocked(getTopmostFullScreenRoute).mockReturnValue(tabRoute(SCREENS.HOME));
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.HOME, SEND_MESSAGE_SOURCE.DIRECT_MESSAGE));

            jest.mocked(getTopmostFullScreenRoute).mockReturnValue(tabRoute(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR));
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.DIRECT_MESSAGE));

            jest.mocked(getTopmostFullScreenRoute).mockReturnValue(tabRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR));
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.SPEND, SEND_MESSAGE_SOURCE.DIRECT_MESSAGE));

            jest.mocked(getTopmostFullScreenRoute).mockReturnValue(undefined);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.OTHER, SEND_MESSAGE_SOURCE.DIRECT_MESSAGE));
        });
    });

    describe('surfaces (take precedence over report type)', () => {
        it('resolves Concierge in the side panel, prefixed by the tab underneath', () => {
            jest.mocked(isConciergeChatReport).mockReturnValue(true);
            const sidePanel = params({isInSidePanel: true});

            jest.mocked(getTopmostFullScreenRoute).mockReturnValue(tabRoute(SCREENS.HOME));
            expect(getSendMessageSource(sidePanel)).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.HOME, SEND_MESSAGE_SOURCE.CONCIERGE_SIDE_PANEL));

            jest.mocked(getTopmostFullScreenRoute).mockReturnValue(tabRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR));
            expect(getSendMessageSource(sidePanel)).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.SPEND, SEND_MESSAGE_SOURCE.CONCIERGE_SIDE_PANEL));
        });

        it('resolves a non-Concierge side panel (admins chat), prefixed by tab', () => {
            const sidePanel = params({isInSidePanel: true});

            jest.mocked(getTopmostFullScreenRoute).mockReturnValue(tabRoute(SCREENS.HOME));
            expect(getSendMessageSource(sidePanel)).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.HOME, SEND_MESSAGE_SOURCE.SIDE_PANEL));
        });

        it('treats the Search money-request-report route as an RHP report (expense_report + _rhp), split single/multi', () => {
            jest.mocked(isMoneyRequestReport).mockReturnValue(true);
            jest.mocked(getTopmostFullScreenRoute).mockReturnValue(tabRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR));
            const searchReport = params({routeName: SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT});

            expect(getSendMessageSource(searchReport)).toBe(withRhp(SEND_MESSAGE_SOURCE_TAB.SPEND, SEND_MESSAGE_SOURCE.EXPENSE_REPORT_MULTI));

            jest.mocked(isOneTransactionReport).mockReturnValue(true);
            expect(getSendMessageSource(searchReport)).toBe(withRhp(SEND_MESSAGE_SOURCE_TAB.SPEND, SEND_MESSAGE_SOURCE.EXPENSE_REPORT_SINGLE));
        });

        it('appends _rhp to the single/multi expense-report base on the RHP expense-report route, prefixed by tab', () => {
            jest.mocked(isMoneyRequestReport).mockReturnValue(true);
            const rhpExpense = params({routeName: SCREENS.RIGHT_MODAL.EXPENSE_REPORT});

            jest.mocked(getTopmostFullScreenRoute).mockReturnValue(tabRoute(SCREENS.HOME));
            expect(getSendMessageSource(rhpExpense)).toBe(withRhp(SEND_MESSAGE_SOURCE_TAB.HOME, SEND_MESSAGE_SOURCE.EXPENSE_REPORT_MULTI));

            jest.mocked(getTopmostFullScreenRoute).mockReturnValue(tabRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR));
            jest.mocked(isOneTransactionReport).mockReturnValue(true);
            expect(getSendMessageSource(rhpExpense)).toBe(withRhp(SEND_MESSAGE_SOURCE_TAB.SPEND, SEND_MESSAGE_SOURCE.EXPENSE_REPORT_SINGLE));
        });

        it('derives the report type + _rhp on the RHP ReportScreen route (transaction thread), prefixed by tab', () => {
            jest.mocked(isReportTransactionThread).mockReturnValue(true);
            const rhpReport = params({routeName: SCREENS.RIGHT_MODAL.SEARCH_REPORT});

            jest.mocked(getTopmostFullScreenRoute).mockReturnValue(tabRoute(SCREENS.HOME));
            expect(getSendMessageSource(rhpReport)).toBe(withRhp(SEND_MESSAGE_SOURCE_TAB.HOME, SEND_MESSAGE_SOURCE.EXPENSE_TRANSACTION_THREAD));

            jest.mocked(getTopmostFullScreenRoute).mockReturnValue(tabRoute(NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR));
            expect(getSendMessageSource(rhpReport)).toBe(withRhp(SEND_MESSAGE_SOURCE_TAB.SPEND, SEND_MESSAGE_SOURCE.EXPENSE_TRANSACTION_THREAD));
        });

        it('derives a non-expense report type + _rhp on the RHP ReportScreen route (e.g. a DM)', () => {
            jest.mocked(isDM).mockReturnValue(true);
            expect(getSendMessageSource(params({routeName: SCREENS.RIGHT_MODAL.SEARCH_REPORT}))).toBe(withRhp(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.DIRECT_MESSAGE));
        });

        it('adds _rhp for any Right-Hand-Panel route, not just the report ones (generic RHP detection)', () => {
            jest.mocked(isDM).mockReturnValue(true);
            // A non-report RHP screen name still yields `_rhp` — the check is "is this the RHP", not a fixed list.
            expect(getSendMessageSource(params({routeName: SCREENS.RIGHT_MODAL.REPORT_DETAILS}))).toBe(withRhp(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.DIRECT_MESSAGE));
            // A central-pane (non-RHP) route stays bare.
            expect(getSendMessageSource(params({routeName: SCREENS.REPORT}))).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.DIRECT_MESSAGE));
        });

        it('side panel wins over an RHP report route and does NOT get a _rhp suffix', () => {
            jest.mocked(isConciergeChatReport).mockReturnValue(true);
            // Even with an RHP report routeName, the side panel keeps its own base and is never suffixed.
            expect(getSendMessageSource(params({isInSidePanel: true, routeName: SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT}))).toBe(
                withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.CONCIERGE_SIDE_PANEL),
            );
        });

        it('returns expense_report_multi for a multi-expense money-request report in the central pane', () => {
            jest.mocked(isMoneyRequestReport).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.EXPENSE_REPORT_MULTI));
        });

        it('returns expense_report_single for a one-expense money-request report in the central pane', () => {
            jest.mocked(isMoneyRequestReport).mockReturnValue(true);
            jest.mocked(isOneTransactionReport).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.EXPENSE_REPORT_SINGLE));
        });

        it('returns an expense_report base for an invoice report in the central pane', () => {
            jest.mocked(isInvoiceReport).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.EXPENSE_REPORT_MULTI));
        });
    });

    describe('report types (central-pane chat surface, default inbox tab)', () => {
        it('returns expense_transaction_thread for a transaction thread (before the chat-thread check)', () => {
            jest.mocked(isReportTransactionThread).mockReturnValue(true);
            jest.mocked(isChatThread).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.EXPENSE_TRANSACTION_THREAD));
        });

        it('returns concierge for the Concierge chat', () => {
            jest.mocked(isConciergeChatReport).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.CONCIERGE));
        });

        it('concierge beats thread/room checks', () => {
            jest.mocked(isConciergeChatReport).mockReturnValue(true);
            jest.mocked(isChatThread).mockReturnValue(true);
            jest.mocked(isChatRoom).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.CONCIERGE));
        });

        it('returns report_thread for a chat thread', () => {
            jest.mocked(isChatThread).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.REPORT_THREAD));
        });

        it('returns invoice_room for an invoice room (before the generic room check)', () => {
            jest.mocked(isInvoiceRoom).mockReturnValue(true);
            jest.mocked(isChatRoom).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.INVOICE_ROOM));
        });

        it('returns workspace_room for a chat room', () => {
            jest.mocked(isChatRoom).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.WORKSPACE_ROOM));
        });

        it('returns policy_expense_chat for a workspace expense chat', () => {
            jest.mocked(isPolicyExpenseChat).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.POLICY_EXPENSE_CHAT));
        });

        it('returns task_report for a task report', () => {
            jest.mocked(isTaskReport).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.TASK_REPORT));
        });

        it('returns group_chat for a group chat', () => {
            jest.mocked(isGroupChat).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.GROUP_CHAT));
        });

        it('returns direct_message for a DM', () => {
            jest.mocked(isDM).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.DIRECT_MESSAGE));
        });

        it('returns self_dm for a self-DM', () => {
            jest.mocked(isSelfDM).mockReturnValue(true);
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.SELF_DM));
        });

        it('returns other_chat when nothing matches', () => {
            expect(getSendMessageSource(params())).toBe(withTab(SEND_MESSAGE_SOURCE_TAB.INBOX, SEND_MESSAGE_SOURCE.OTHER_CHAT));
        });
    });
});

import getCentralPaneReportID from '@libs/Navigation/helpers/getCentralPaneReportID';
import getRouteBeneathTopmostRHP from '@libs/Navigation/helpers/getRouteBeneathTopmostRHP';
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

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

type SendMessageSourceBase = ValueOf<typeof CONST.TELEMETRY.SEND_MESSAGE_SOURCE>;
type SendMessageSourceTab = ValueOf<typeof CONST.TELEMETRY.SEND_MESSAGE_SOURCE_TAB>;
type SendMessageSourceSurface = ValueOf<typeof CONST.TELEMETRY.SEND_MESSAGE_SOURCE_SURFACE>;
type SendMessageSourceRhpOrigin = ValueOf<typeof CONST.TELEMETRY.SEND_MESSAGE_SOURCE_RHP_ORIGIN>;

/**
 * The stamped value: `<tab>_<scenario>`, optionally `_rhp`, optionally `_from_report`. E.g.
 * `inbox_direct_message`, `home_expense_report_rhp`, `spend_expense_transaction_thread_rhp_from_report`.
 */
type SendMessageSource =
    | `${SendMessageSourceTab}_${SendMessageSourceBase}`
    | `${SendMessageSourceTab}_${SendMessageSourceBase}_${SendMessageSourceSurface}`
    | `${SendMessageSourceTab}_${SendMessageSourceBase}_${SendMessageSourceSurface}_${SendMessageSourceRhpOrigin}`;

function getOriginTab(): SendMessageSourceTab {
    const {SEND_MESSAGE_SOURCE_TAB} = CONST.TELEMETRY;
    switch (getTopmostFullScreenRoute()?.name) {
        case SCREENS.HOME:
            return SEND_MESSAGE_SOURCE_TAB.HOME;
        case NAVIGATORS.REPORTS_SPLIT_NAVIGATOR:
            return SEND_MESSAGE_SOURCE_TAB.INBOX;
        case NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR:
            return SEND_MESSAGE_SOURCE_TAB.SPEND;
        default:
            return SEND_MESSAGE_SOURCE_TAB.OTHER;
    }
}

type GetSendMessageSourceParams = {
    report: OnyxEntry<Report>;
    /** Used to identify the Concierge chat by identity (not type/chatType). */
    conciergeReportID: string | undefined;
    isInSidePanel: boolean;
    routeName: string;
};

/**
 * Resolve the tab-agnostic scenario base. Checks run in precedence order (first match wins) so a report
 * matching several predicates is attributed to the most specific surface.
 */
function getSendMessageSourceBase({report, conciergeReportID, isInSidePanel}: Omit<GetSendMessageSourceParams, 'routeName'>): SendMessageSourceBase {
    const {SEND_MESSAGE_SOURCE} = CONST.TELEMETRY;

    // Surfaces first: they own a distinct render tree regardless of the report's own type.
    // The Side Panel is usually Concierge, but hosts the workspace admins chat during admin onboarding.
    if (isInSidePanel) {
        return isConciergeChatReport(report, conciergeReportID) ? SEND_MESSAGE_SOURCE.CONCIERGE_SIDE_PANEL : SEND_MESSAGE_SOURCE.SIDE_PANEL;
    }
    if (isMoneyRequestReport(report) || isInvoiceReport(report)) {
        return isOneTransactionReport(report) ? SEND_MESSAGE_SOURCE.EXPENSE_REPORT_SINGLE : SEND_MESSAGE_SOURCE.EXPENSE_REPORT_MULTI;
    }
    // A transaction thread is a chat-type report, so it must run before the generic chat-thread check below or
    // it would be mislabeled report_thread.
    if (isReportTransactionThread(report)) {
        return SEND_MESSAGE_SOURCE.EXPENSE_TRANSACTION_THREAD;
    }

    if (isConciergeChatReport(report, conciergeReportID)) {
        return SEND_MESSAGE_SOURCE.CONCIERGE;
    }
    if (isChatThread(report)) {
        return SEND_MESSAGE_SOURCE.REPORT_THREAD;
    }
    if (isInvoiceRoom(report)) {
        return SEND_MESSAGE_SOURCE.INVOICE_ROOM;
    }
    if (isChatRoom(report)) {
        return SEND_MESSAGE_SOURCE.WORKSPACE_ROOM;
    }
    // policyExpenseChat is not a "room" (isChatRoom excludes it), so it needs its own branch.
    if (isPolicyExpenseChat(report)) {
        return SEND_MESSAGE_SOURCE.POLICY_EXPENSE_CHAT;
    }
    if (isTaskReport(report)) {
        return SEND_MESSAGE_SOURCE.TASK_REPORT;
    }
    if (isGroupChat(report)) {
        return SEND_MESSAGE_SOURCE.GROUP_CHAT;
    }
    if (isDM(report)) {
        return SEND_MESSAGE_SOURCE.DIRECT_MESSAGE;
    }
    if (isSelfDM(report)) {
        return SEND_MESSAGE_SOURCE.SELF_DM;
    }
    return SEND_MESSAGE_SOURCE.OTHER_CHAT;
}

// Every Right-Hand-Panel screen name. getSendMessageSource only runs where a composer is mounted (report
// screens), so any RHP routeName it sees means the report is hosted in the RHP — no need to list the specific
// report routes here; a new RHP report route is covered automatically.
const RHP_SCREEN_NAMES = new Set<string>(Object.values(SCREENS.RIGHT_MODAL));

// The RHP screens that render an expense report (both use the money-request-report component).
const RHP_EXPENSE_REPORT_SCREEN_NAMES = new Set<string>([SCREENS.RIGHT_MODAL.EXPENSE_REPORT, SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT]);

// A parent expense report behind an RHP screen means the user drilled in (vs opening directly, e.g. off a Search
// list, where neither holds). It can sit in two places:
//   1. stacked directly beneath the screen in the RHP, or
//   2. shown in the central pane behind the overlay, matched via the thread's parentReportID.
// Case 2 is gated on isReportTransactionThread so parentReportID is by definition the expense report.
function isDrilledFromExpenseReport(report: OnyxEntry<Report>): boolean {
    if (RHP_EXPENSE_REPORT_SCREEN_NAMES.has(getRouteBeneathTopmostRHP()?.name ?? '')) {
        return true;
    }
    return isReportTransactionThread(report) && !!report?.parentReportID && getCentralPaneReportID() === report.parentReportID;
}

/**
 * The `send_message_source` span attribute: tab prefix + scenario base (+ `_rhp` in the RHP, + `_from_report`
 * when drilled in from a report behind it). The affixes are uniform, so Sentry can slice by tab, scenario,
 * surface, or drill-down path across every send path.
 */
function getSendMessageSource(params: GetSendMessageSourceParams): SendMessageSource {
    const {SEND_MESSAGE_SOURCE_SURFACE, SEND_MESSAGE_SOURCE_RHP_ORIGIN} = CONST.TELEMETRY;
    const value = `${getOriginTab()}_${getSendMessageSourceBase(params)}` as const;
    // The Side Panel owns its own bases and can't be on an RHP route, so never suffix it (defensive — a stray
    // RHP routeName in the panel would otherwise produce a nonsensical `..._side_panel_rhp`).
    if (!RHP_SCREEN_NAMES.has(params.routeName) || params.isInSidePanel) {
        return value;
    }
    const rhpValue = `${value}_${SEND_MESSAGE_SOURCE_SURFACE.RHP}` as const;
    return isDrilledFromExpenseReport(params.report) ? `${rhpValue}_${SEND_MESSAGE_SOURCE_RHP_ORIGIN.FROM_REPORT}` : rhpValue;
}

export default getSendMessageSource;

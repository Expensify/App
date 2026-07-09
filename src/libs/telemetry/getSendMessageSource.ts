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

/**
 * A stamped value: the tab prefix + scenario base, plus an optional surface suffix for the generic RHP
 * (e.g. `inbox_direct_message`, `home_expense_report_rhp`, `spend_expense_transaction_thread_rhp`).
 */
type SendMessageSource = `${SendMessageSourceTab}_${SendMessageSourceBase}` | `${SendMessageSourceTab}_${SendMessageSourceBase}_${SendMessageSourceSurface}`;

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
    // Split single- vs multi-expense reports (only multi has a heavy transactions table), via
    // isOneTransactionReport (report.transactionCount === 1). Serves both the central pane and the RHP report
    // routes — e/:id and search/r/:id render the same money-request-report component, so they fall through here
    // and pick up `_rhp` in getSendMessageSource rather than owning a separate base.
    if (isMoneyRequestReport(report) || isInvoiceReport(report)) {
        return isOneTransactionReport(report) ? SEND_MESSAGE_SOURCE.EXPENSE_REPORT_SINGLE : SEND_MESSAGE_SOURCE.EXPENSE_REPORT_MULTI;
    }
    // A single-transaction expense opens as a transaction thread (chat-type with an expense parent), so this
    // must run before the generic chat-thread check below or it would be mislabeled report_thread. The `_rhp`
    // surface suffix (added later) keeps the RHP variant distinct from this central-pane one.
    if (isReportTransactionThread(report)) {
        return SEND_MESSAGE_SOURCE.EXPENSE_TRANSACTION_THREAD;
    }

    // Classify by report type — for both the central pane and the generic RHP routes (the latter get `_rhp`).
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

/**
 * The `send_message_source` span attribute: tab prefix + scenario base (+ `_rhp` when the report is in the RHP).
 * Tab and surface are uniform affixes, so Sentry can slice by tab, scenario, or surface across every send path.
 */
function getSendMessageSource(params: GetSendMessageSourceParams): SendMessageSource {
    const {SEND_MESSAGE_SOURCE_SURFACE} = CONST.TELEMETRY;
    const value = `${getOriginTab()}_${getSendMessageSourceBase(params)}` as const;
    // The Side Panel owns its own bases and can't be on an RHP route, so never suffix it (defensive — a stray
    // RHP routeName in the panel would otherwise produce a nonsensical `..._side_panel_rhp`).
    return RHP_SCREEN_NAMES.has(params.routeName) && !params.isInSidePanel ? `${value}_${SEND_MESSAGE_SOURCE_SURFACE.RHP}` : value;
}

export default getSendMessageSource;

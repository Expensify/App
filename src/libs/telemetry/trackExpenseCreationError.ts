import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';

import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import type {SeverityLevel} from '@sentry/react-native';
import type {ValueOf} from 'type-fest';

import * as Sentry from '@sentry/react-native';

type ExpenseCreationErrorType = ValueOf<typeof CONST.TELEMETRY.EXPENSE_ERROR_TYPE>;
type ErrorSource = ValueOf<typeof CONST.TELEMETRY.EXPENSE_ERROR_SOURCE>;

const EXPENSE_COMMANDS = new Set<string>([WRITE_COMMANDS.REQUEST_MONEY, WRITE_COMMANDS.TRACK_EXPENSE]);

// Commands that indicate a lost expense (e.g., OpenReport fails because expense report was lost)
const LOST_EXPENSE_INDICATOR_COMMANDS = new Set<string>([WRITE_COMMANDS.OPEN_REPORT]);

function isExpenseCommand(command: string | undefined): boolean {
    return !!command && EXPENSE_COMMANDS.has(command);
}

function isLostExpenseIndicatorCommand(command: string | undefined): boolean {
    return !!command && LOST_EXPENSE_INDICATOR_COMMANDS.has(command);
}

type ExpenseCreationErrorContext = {
    errorType: ExpenseCreationErrorType;
    transactionID?: string;
    reportID?: string;
    hasReceipt?: boolean;
    pendingAction?: PendingAction;
    errorMessage?: string;
    iouType?: string;
    errorSource?: ErrorSource;
    isTransactionMissing?: boolean;
    isRequestPending?: boolean;
};

/**
 * Track expense creation errors in Sentry for monitoring lost requests.
 *
 * @param error - The error object to capture (can be null for warning-level events)
 * @param context - Additional context about the expense creation error
 */
function trackExpenseCreationError(error: Error | null, context: ExpenseCreationErrorContext): void {
    try {
        const {errorType, transactionID, reportID, hasReceipt, pendingAction, errorMessage, iouType, errorSource, isTransactionMissing, isRequestPending} = context;

        const tags: Record<string, string> = {
            [CONST.TELEMETRY.TAGS.EXPENSE_ERROR_TYPE]: errorType,
        };

        if (iouType) {
            tags[CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE] = iouType;
        }

        if (errorSource) {
            tags[CONST.TELEMETRY.TAGS.EXPENSE_ERROR_SOURCE] = errorSource;
        }

        if (isRequestPending) {
            tags[CONST.TELEMETRY.TAGS.EXPENSE_IS_REQUEST_PENDING] = 'true';
        }
        if (hasReceipt) {
            tags[CONST.TELEMETRY.TAGS.EXPENSE_HAS_RECEIPT] = 'true';
        }

        const extra: Record<string, unknown> = {
            ...(transactionID && {transactionID}),
            ...(reportID && {reportID}),
            ...(hasReceipt && {hasReceipt}),
            ...(pendingAction && {pendingAction}),
            ...(errorMessage && {errorMessage}),
            ...(isTransactionMissing && {isTransactionMissing}),
            ...(isRequestPending && {isRequestPending}),
            ...(errorSource && {errorSource}),
            timestamp: Date.now(),
        };

        Sentry.captureMessage(`Expense Creation Issue: ${errorType}`, {
            level: 'error',
            tags,
            extra,
        });
    } catch (sentryError) {
        Log.warn('[trackExpenseCreationError] Failed to track expense creation error', {sentryError, originalContext: context});
    }
}

/**
 * Why the server rejected an expense write. Derived from the response, never from user data, so it is safe to put in a
 * Sentry tag and low enough cardinality to group by.
 */
type ExpenseFailureReason = ValueOf<typeof CONST.TELEMETRY.EXPENSE_FAILURE_REASON>;

/**
 * How much attention a rejection deserves. `expected` is a business rule about the user's situation working as designed,
 * `client_bug` is the server rejecting a request we built, `not_our_problem` is a rejection the client cannot act on at
 * all, `unclassified` is a response we have no mapping for.
 */
type ExpenseFailureClass = ValueOf<typeof CONST.TELEMETRY.EXPENSE_FAILURE_CLASS>;

/** Which response field a reason was derived from. */
type ExpenseReasonSource = ValueOf<typeof CONST.TELEMETRY.EXPENSE_REASON_SOURCE>;

const {EXPENSE_FAILURE_REASON: REASON, EXPENSE_FAILURE_CLASS: FAILURE_CLASS, EXPENSE_REASON_SOURCE: REASON_SOURCE, TAGS} = CONST.TELEMETRY;
const {EXPENSE_CREATION_ERROR_MESSAGE: SERVER_MESSAGE, EXPENSE_ERROR_UUID: SERVER_UUID} = CONST;

/**
 * Each expense-write error site in Web-Expensify and what it means. This is the primary classification: the id is fixed per
 * throw site, so a rewording of the server's English cannot break it. Several of these sites share one message, and two of
 * them would be misread from that message alone — `401 Unauthorized` says "permissions required" but is an ownership,
 * membership or policy-match check, and a generic "Something went wrong" hides a malformed receipt request.
 */
const FAILURE_REASON_BY_ERROR_UUID = new Map<string, ExpenseFailureReason>([
    [SERVER_UUID.TARGET_UNAUTHORIZED, REASON.TARGET_UNAUTHORIZED],
    [SERVER_UUID.REPORT_WRITE_FORBIDDEN, REASON.REPORT_WRITE_FORBIDDEN],
    [SERVER_UUID.IOU_REPORT_NOT_SUBMITTED, REASON.IOU_REPORT_NOT_SUBMITTED],
    [SERVER_UUID.EXPENSE_REPORT_CLOSED, REASON.EXPENSE_REPORT_CLOSED],
    [SERVER_UUID.REPORT_NOT_OPEN, REASON.REPORT_NOT_OPEN],
    [SERVER_UUID.SELF_DM, REASON.SELF_DM],
    [SERVER_UUID.INVALID_ATTENDEE, REASON.INVALID_ATTENDEE],
    [SERVER_UUID.INVALID_ATTENDEE_FORMAT, REASON.INVALID_ATTENDEE],
    [SERVER_UUID.RECEIPT_AND_RECEIPT_ID, REASON.RECEIPT_AND_RECEIPT_ID],
    [SERVER_UUID.RECEIPT_ALREADY_ATTACHED, REASON.RECEIPT_ALREADY_ATTACHED],
    [SERVER_UUID.INVALID_AMOUNT, REASON.INVALID_AMOUNT],
    [SERVER_UUID.POLICY_NOT_EXPENSE_ENABLED, REASON.POLICY_NOT_EXPENSE_ENABLED],
    [SERVER_UUID.CHAT_ALREADY_EXISTS, REASON.CHAT_ALREADY_EXISTS],
    [SERVER_UUID.SELF_REQUEST, REASON.SELF_REQUEST],
    [SERVER_UUID.PAYER_NOT_ALLOWED, REASON.PAYER_NOT_ALLOWED],
    [SERVER_UUID.APP_VERSION_DEPRECATED, REASON.APP_VERSION_DEPRECATED],
]);

/**
 * Fallback for rejections that arrive with no error UUID, which is every unmapped one plus every TrackExpense rejection:
 * only RequestMoney runs the mapping ladder in Web-Expensify, so TrackExpense gets raw Auth error lines. Matched exactly,
 * including the status prefix an unmapped passthrough carries. When Sentry's `other` bucket grows, mine its `errorMessage`
 * extra for the strings to add here.
 */
const FAILURE_REASON_BY_MESSAGE = new Map<string, ExpenseFailureReason>([
    [SERVER_MESSAGE.REPORT_UNAVAILABLE_SHARED, REASON.REPORT_UNAVAILABLE],
    [SERVER_MESSAGE.TARGET_UNAUTHORIZED, REASON.TARGET_UNAUTHORIZED],
    [SERVER_MESSAGE.REPORT_WRITE_FORBIDDEN, REASON.REPORT_WRITE_FORBIDDEN],
    [SERVER_MESSAGE.MEMBER_CANNOT_CREATE_EXPENSES, REASON.MEMBER_CANNOT_CREATE_EXPENSES],
    [SERVER_MESSAGE.REPORT_UNAVAILABLE_RAW, REASON.REPORT_UNAVAILABLE],
    [SERVER_MESSAGE.APP_VERSION_DEPRECATED, REASON.APP_VERSION_DEPRECATED],
    [SERVER_MESSAGE.SELF_REQUEST, REASON.SELF_REQUEST],
    [SERVER_MESSAGE.INVALID_AMOUNT, REASON.INVALID_AMOUNT],
    [SERVER_MESSAGE.INVALID_ATTENDEE, REASON.INVALID_ATTENDEE],
    [SERVER_MESSAGE.INVALID_ATTENDEE_FORMAT, REASON.INVALID_ATTENDEE],
    [SERVER_MESSAGE.RECEIPT_ALREADY_ATTACHED, REASON.RECEIPT_ALREADY_ATTACHED],
    [SERVER_MESSAGE.CHAT_ALREADY_EXISTS, REASON.CHAT_ALREADY_EXISTS],
    [SERVER_MESSAGE.POLICY_NOT_EXPENSE_ENABLED, REASON.POLICY_NOT_EXPENSE_ENABLED],
    [SERVER_MESSAGE.SERVER_GENERIC, REASON.SERVER_GENERIC],
]);

/** Last resort, for a rejection that carried neither an error UUID nor a message we know. */
function getReasonFromJsonCode(jsonCode: number): ExpenseFailureReason | undefined {
    if (jsonCode === CONST.JSON_CODE.UPDATE_REQUIRED) {
        return REASON.APP_VERSION_DEPRECATED;
    }
    if (jsonCode === CONST.JSON_CODE.NOT_AUTHENTICATED) {
        return REASON.NOT_AUTHENTICATED;
    }
    return undefined;
}

/**
 * Business rules the server enforces by design, and rejections no fix on our side would prevent. Everything else is a
 * response we have no mapping for, so it stays visible until someone classifies it.
 */
const FAILURE_CLASS_BY_REASON: Record<ExpenseFailureReason, ExpenseFailureClass> = {
    [REASON.EXPENSE_REPORT_CLOSED]: FAILURE_CLASS.EXPECTED,
    [REASON.IOU_REPORT_NOT_SUBMITTED]: FAILURE_CLASS.EXPECTED,
    [REASON.REPORT_NOT_OPEN]: FAILURE_CLASS.EXPECTED,
    [REASON.SELF_DM]: FAILURE_CLASS.EXPECTED,
    [REASON.REPORT_UNAVAILABLE]: FAILURE_CLASS.EXPECTED,
    [REASON.TARGET_UNAUTHORIZED]: FAILURE_CLASS.EXPECTED,
    [REASON.REPORT_WRITE_FORBIDDEN]: FAILURE_CLASS.EXPECTED,
    [REASON.MEMBER_CANNOT_CREATE_EXPENSES]: FAILURE_CLASS.EXPECTED,
    [REASON.SELF_REQUEST]: FAILURE_CLASS.EXPECTED,
    [REASON.INVALID_AMOUNT]: FAILURE_CLASS.EXPECTED,
    // The attendee list is a JSON blob we serialize ourselves, and the server requires `email`, `displayName` and
    // `avatarUrl` on every entry. We omit `email` whenever it is empty, so a rejection here is our payload's shape.
    [REASON.INVALID_ATTENDEE]: FAILURE_CLASS.CLIENT_BUG,
    // NewDot sends the receipt file and never a `receiptID`, so a request carrying both was built wrong. No money-request
    // param type in this repo has a `receiptID` field at all.
    [REASON.RECEIPT_AND_RECEIPT_ID]: FAILURE_CLASS.CLIENT_BUG,
    [REASON.RECEIPT_ALREADY_ATTACHED]: FAILURE_CLASS.EXPECTED,
    [REASON.CHAT_ALREADY_EXISTS]: FAILURE_CLASS.EXPECTED,
    [REASON.POLICY_NOT_EXPENSE_ENABLED]: FAILURE_CLASS.EXPECTED,
    // The server comment on this throw says it outright: "When creating an expense in NewDot, we should not specify one
    // payer email". We build that email from the participant unconditionally and put it in the request, so it is our param.
    [REASON.PAYER_NOT_ALLOWED]: FAILURE_CLASS.CLIENT_BUG,
    // A server-side failure it gave no more detail about. Unclassified rather than expected: the server is saying something
    // broke, and filing it as a business rule would hide it from the triage this classification exists for.
    [REASON.SERVER_GENERIC]: FAILURE_CLASS.UNCLASSIFIED,
    [REASON.APP_VERSION_DEPRECATED]: FAILURE_CLASS.NOT_OUR_PROBLEM,
    [REASON.NOT_AUTHENTICATED]: FAILURE_CLASS.NOT_OUR_PROBLEM,
    [REASON.NO_MESSAGE]: FAILURE_CLASS.UNCLASSIFIED,
    [REASON.OTHER]: FAILURE_CLASS.UNCLASSIFIED,
};

/**
 * Issue level for a rejection that reaches `captureMessage`. `not_our_problem` never does, it goes to Sentry Logs, but the
 * record stays total so the lookup cannot come back undefined.
 */
const LEVEL_BY_FAILURE_CLASS: Record<ExpenseFailureClass, SeverityLevel> = {
    [FAILURE_CLASS.EXPECTED]: 'warning',
    [FAILURE_CLASS.CLIENT_BUG]: 'error',
    // Unreachable today: a `not_our_problem` rejection either goes to Sentry Logs or is a possible lost expense, which
    // forces error. The entry is here so the record stays total over the class.
    [FAILURE_CLASS.NOT_OUR_PROBLEM]: 'info',
    [FAILURE_CLASS.UNCLASSIFIED]: 'error',
};

/**
 * Classify a rejected expense write: the server's error UUID first, then its message, then the response code.
 *
 * @param errorUUID - the response's `UUID`, present for the errors Web-Expensify maps and absent for everything it passes through
 * @returns `reasonSource` says which field the reason rested on. Because the matches are exact, an API rewording shows up as
 * `message` matches falling while `other` and `none` rise, not as a rise in `message`.
 */
function classifyExpenseApiError(
    jsonCode: number,
    message: string | undefined,
    errorUUID: string | undefined,
): {reason: ExpenseFailureReason; failureClass: ExpenseFailureClass; reasonSource: ExpenseReasonSource} {
    const reasonFromUUID = errorUUID ? FAILURE_REASON_BY_ERROR_UUID.get(errorUUID) : undefined;
    const reasonFromMessage = message ? FAILURE_REASON_BY_MESSAGE.get(message) : undefined;
    const reasonFromCode = getReasonFromJsonCode(jsonCode);
    const reason = reasonFromUUID ?? reasonFromMessage ?? reasonFromCode ?? (message ? REASON.OTHER : REASON.NO_MESSAGE);
    let reasonSource: ExpenseReasonSource;
    if (reasonFromUUID) {
        reasonSource = REASON_SOURCE.ERROR_UUID;
    } else if (reasonFromMessage) {
        reasonSource = REASON_SOURCE.MESSAGE;
    } else if (reasonFromCode) {
        reasonSource = REASON_SOURCE.JSON_CODE_ONLY;
    } else if (errorUUID) {
        // The server named the error site and we have not mapped it: a throw site nobody has classified yet.
        reasonSource = REASON_SOURCE.UNKNOWN_ERROR_UUID;
    } else {
        reasonSource = REASON_SOURCE.NONE;
    }

    return {reason, failureClass: FAILURE_CLASS_BY_REASON[reason], reasonSource};
}

type ApiErrorContext = {
    command: string;
    jsonCode: string | number;
    message?: string;
    /** The server's identifier for the error site that threw. Bounded by the error sites in the API source, so it is safe as a tag. */
    errorUUID?: string;
    transactionID?: string;
    reportID?: string;
    requestData?: Record<string, unknown>;
};

function trackExpenseApiError(context: ApiErrorContext): void {
    try {
        const {command, jsonCode, message, errorUUID, requestData} = context;

        const isExpense = isExpenseCommand(command);
        const isOpenReport = isLostExpenseIndicatorCommand(command);

        // Only track expense-related commands or OpenReport
        if (!isExpense && !isOpenReport) {
            return;
        }

        if (isOpenReport && !requestData?.transactionID) {
            return;
        }

        const errorType = isOpenReport ? CONST.TELEMETRY.EXPENSE_ERROR_TYPE.OPEN_REPORT_FAILED : CONST.TELEMETRY.EXPENSE_ERROR_TYPE.API_ERROR;
        const jsonCodeTag = String(jsonCode);
        // jsonCode is typed number or string, and one value is a word rather than a number, so the numeric compares in the
        // classifier need normalizing. The tag keeps the value as it arrived.
        const {reason, failureClass, reasonSource} = classifyExpenseApiError(Number(jsonCode), message, errorUUID);
        // Whether this failure is a candidate lost expense. Whether OpenReport failures lose anything at all is still open
        // in https://github.com/Expensify/App/issues/106416. A build the server refuses to serve is excluded: it is
        // rejected before any command runs, so nothing was in flight to lose. An expired session is not, because there the
        // request was well-formed and did reach the server.
        const couldHaveLostExpense = isOpenReport && reason !== REASON.APP_VERSION_DEPRECATED;

        const tags: Record<string, string> = {
            [TAGS.EXPENSE_ERROR_TYPE]: errorType,
            [TAGS.EXPENSE_ERROR_SOURCE]: CONST.TELEMETRY.EXPENSE_ERROR_SOURCE.API_RESPONSE,
            [TAGS.EXPENSE_COMMAND]: command,
            [TAGS.EXPENSE_JSON_CODE]: jsonCodeTag,
            [TAGS.EXPENSE_FAILURE_REASON]: reason,
            [TAGS.EXPENSE_FAILURE_CLASS]: failureClass,
            [TAGS.EXPENSE_REASON_SOURCE]: reasonSource,
        };

        if (errorUUID) {
            tags[TAGS.EXPENSE_ERROR_UUID] = errorUUID;
        }

        // Named `errorMessage`, as in `trackAuthenticationError`: in Sentry Logs the body is its own field, so a plain
        // `message` attribute reads as though it were that text.
        const extra: Record<string, unknown> = {
            command,
            jsonCode,
            failureClass,
            reasonSource,
            ...(message && {errorMessage: message}),
        };

        const eventMessage = isOpenReport
            ? `OpenReport Failed: jsonCode ${jsonCodeTag} (${reason}) (possible lost expense)`
            : `Expense API Error: ${command} returned ${jsonCodeTag} (${reason})`;

        // A build the server refuses to serve and an expired session are floods rather than findings: the first fires for
        // every user still on an old build each time the minimum version moves. They go to Sentry Logs, out of the issue
        // stream, the way `trackAuthenticationError` routes its own non-actionable outcomes. A possible lost expense is the
        // exception, because there the same code has to stay in front of someone.
        if (failureClass === FAILURE_CLASS.NOT_OUR_PROBLEM && !couldHaveLostExpense) {
            Sentry.logger.info(`[Expense] ${command} returned ${jsonCodeTag} (${reason})`, {...tags, ...(message && {errorMessage: message})});
            return;
        }

        Sentry.captureMessage(eventMessage, {
            level: couldHaveLostExpense ? 'error' : LEVEL_BY_FAILURE_CLASS[failureClass],
            tags,
            extra,
            // Group on the reason rather than on the title, so rewording the title neither splits an existing issue nor
            // merges two. The leading token namespaces the keys, as `trackMFAFlowOutcome` does.
            fingerprint: [errorType, command, jsonCodeTag, reason],
        });
    } catch (sentryError) {
        Log.warn('[trackExpenseApiError] Failed to track expense API error', {sentryError, originalContext: context});
    }
}

export default trackExpenseCreationError;
export {trackExpenseApiError};

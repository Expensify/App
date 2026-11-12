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

type ExpenseFailureReason = ValueOf<typeof CONST.TELEMETRY.EXPENSE_FAILURE_REASON>;

type ExpenseFailureClass = ValueOf<typeof CONST.TELEMETRY.EXPENSE_FAILURE_CLASS>;

type ExpenseReasonSource = ValueOf<typeof CONST.TELEMETRY.EXPENSE_REASON_SOURCE>;

const {EXPENSE_FAILURE_REASON: REASON, EXPENSE_FAILURE_CLASS: FAILURE_CLASS, EXPENSE_REASON_SOURCE: REASON_SOURCE, TAGS} = CONST.TELEMETRY;
const {EXPENSE_CREATION_ERROR_MESSAGE: SERVER_MESSAGE, EXPENSE_ERROR_UUID: SERVER_UUID} = CONST;

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

function getReasonFromJsonCode(jsonCode: number): ExpenseFailureReason | undefined {
    if (jsonCode === CONST.JSON_CODE.UPDATE_REQUIRED) {
        return REASON.APP_VERSION_DEPRECATED;
    }
    if (jsonCode === CONST.JSON_CODE.NOT_AUTHENTICATED) {
        return REASON.NOT_AUTHENTICATED;
    }
    return undefined;
}

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
    [REASON.INVALID_ATTENDEE]: FAILURE_CLASS.CLIENT_BUG,
    [REASON.RECEIPT_AND_RECEIPT_ID]: FAILURE_CLASS.CLIENT_BUG,
    [REASON.RECEIPT_ALREADY_ATTACHED]: FAILURE_CLASS.EXPECTED,
    [REASON.CHAT_ALREADY_EXISTS]: FAILURE_CLASS.EXPECTED,
    [REASON.POLICY_NOT_EXPENSE_ENABLED]: FAILURE_CLASS.EXPECTED,
    [REASON.PAYER_NOT_ALLOWED]: FAILURE_CLASS.CLIENT_BUG,
    [REASON.SERVER_GENERIC]: FAILURE_CLASS.UNCLASSIFIED,
    [REASON.APP_VERSION_DEPRECATED]: FAILURE_CLASS.NOT_OUR_PROBLEM,
    [REASON.NOT_AUTHENTICATED]: FAILURE_CLASS.NOT_OUR_PROBLEM,
    [REASON.NO_MESSAGE]: FAILURE_CLASS.UNCLASSIFIED,
    [REASON.OTHER]: FAILURE_CLASS.UNCLASSIFIED,
};

const LEVEL_BY_FAILURE_CLASS: Record<ExpenseFailureClass, SeverityLevel> = {
    [FAILURE_CLASS.EXPECTED]: 'warning',
    [FAILURE_CLASS.CLIENT_BUG]: 'error',
    [FAILURE_CLASS.NOT_OUR_PROBLEM]: 'info',
    [FAILURE_CLASS.UNCLASSIFIED]: 'error',
};

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
        const {reason, failureClass, reasonSource} = classifyExpenseApiError(Number(jsonCode), message, errorUUID);
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

        if (failureClass === FAILURE_CLASS.NOT_OUR_PROBLEM && !couldHaveLostExpense) {
            Sentry.logger.info(`[Expense] ${command} returned ${jsonCodeTag} (${reason})`, {...tags, ...(message && {errorMessage: message})});
            return;
        }

        Sentry.captureMessage(eventMessage, {
            level: couldHaveLostExpense ? 'error' : LEVEL_BY_FAILURE_CLASS[failureClass],
            tags,
            extra,
            fingerprint: [errorType, command, jsonCodeTag, reason],
        });
    } catch (sentryError) {
        Log.warn('[trackExpenseApiError] Failed to track expense API error', {sentryError, originalContext: context});
    }
}

export default trackExpenseCreationError;
export {trackExpenseApiError};

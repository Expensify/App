import * as Sentry from '@sentry/react-native';
import type {ValueOf} from 'type-fest';
import {WRITE_COMMANDS} from '@libs/API/types';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

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
            [CONST.TELEMETRY.TAG_EXPENSE_ERROR_TYPE]: errorType,
        };

        if (iouType) {
            tags[CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE] = iouType;
        }

        if (errorSource) {
            tags[CONST.TELEMETRY.TAG_EXPENSE_ERROR_SOURCE] = errorSource;
        }

        if (isRequestPending) {
            tags[CONST.TELEMETRY.TAG_EXPENSE_IS_REQUEST_PENDING] = 'true';
        }
        if (hasReceipt) {
            tags[CONST.TELEMETRY.TAG_EXPENSE_HAS_RECEIPT] = 'true';
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

type ApiErrorContext = {
    command: string;
    jsonCode: string | number;
    message?: string;
    transactionID?: string;
    reportID?: string;
    requestData?: Record<string, unknown>;
};

function trackExpenseApiError(context: ApiErrorContext): void {
    try {
        const {command, jsonCode, message, requestData} = context;

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

        const tags: Record<string, string> = {
            [CONST.TELEMETRY.TAG_EXPENSE_ERROR_TYPE]: errorType,
            [CONST.TELEMETRY.TAG_EXPENSE_ERROR_SOURCE]: CONST.TELEMETRY.EXPENSE_ERROR_SOURCE.API_RESPONSE,
            [CONST.TELEMETRY.TAG_EXPENSE_COMMAND]: command,
            [CONST.TELEMETRY.TAG_EXPENSE_JSON_CODE]: String(jsonCode),
        };

        const extra: Record<string, unknown> = {
            command,
            jsonCode,
            ...(message && {message}),
        };

        const eventMessage = isOpenReport ? `OpenReport Failed: jsonCode ${jsonCode} (possible lost expense)` : `Expense API Error: ${command} returned ${jsonCode}`;

        Sentry.captureMessage(eventMessage, {
            level: 'error',
            tags,
            extra,
        });
    } catch (sentryError) {
        Log.warn('[trackExpenseApiError] Failed to track expense API error', {sentryError, originalContext: context});
    }
}

export default trackExpenseCreationError;
export {trackExpenseApiError, isExpenseCommand, isLostExpenseIndicatorCommand};

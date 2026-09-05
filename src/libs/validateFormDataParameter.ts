import isFileUploadable from './isFileUploadable';
import Log from './Log';
import RECEIPT_LOG_PREFIX from './telemetry/receiptLogPrefix';

function getReceiptTraceId(value: unknown): string | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }
    const {receiptTraceId} = value as {receiptTraceId?: unknown};
    return typeof receiptTraceId === 'string' ? receiptTraceId : undefined;
}

/**
 * Ensures no value of type `object` other than null, Blob, its subclasses, or {uri: string} (native platforms only) is passed to XMLHttpRequest.
 * Otherwise, it will be incorrectly serialized as `[object Object]` and cause an error on Android.
 * See https://github.com/Expensify/App/issues/45086
 */
function validateFormDataParameter(command: string, key: string, value: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const isValid = (value: unknown, isTopLevel: boolean): boolean => {
        if (value === null || typeof value !== 'object') {
            return true;
        }
        if (Array.isArray(value)) {
            return value.every((element) => isValid(element, false));
        }
        if (isTopLevel) {
            return isFileUploadable(value);
        }
        return false;
    };

    if (!isValid(value, true)) {
        const receiptTraceId = getReceiptTraceId(value);

        // This runs for every key of every command, so only tag the receipt parameter to keep unrelated failures out
        // of the [Receipt] queries and out of Sentry, which allow-lists on the prefix.
        const isReceiptParameter = key === 'receipt' || receiptTraceId !== undefined;
        const message = `${isReceiptParameter ? RECEIPT_LOG_PREFIX : '[FormData]'} An unsupported value was passed to command '${command}' (parameter: '${key}'). Only Blob and primitive types are allowed.`;
        const parameters = {
            event: 'unsupportedParameter',
            command,
            key,
            receiptTraceId,
        };

        if (isReceiptParameter) {
            Log.alert(message, parameters);
            return;
        }

        // Lower severity until we know the rate: this was a console.warn that never left the device, so it could flood.
        Log.hmmm(message, parameters);
    }
}

export default validateFormDataParameter;

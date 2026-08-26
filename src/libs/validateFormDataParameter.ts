import isFileUploadable from './isFileUploadable';
import Log from './Log';
import {RECEIPT_LOG_PREFIX} from './telemetry/ReceiptObservability';

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
        Log.alert(`${RECEIPT_LOG_PREFIX} An unsupported value was passed to command '${command}' (parameter: '${key}'). Only Blob and primitive types are allowed.`, {
            event: 'unsupportedParameter',
            command,
            key,
            receiptTraceId: getReceiptTraceId(value),
        });
    }
}

export default validateFormDataParameter;

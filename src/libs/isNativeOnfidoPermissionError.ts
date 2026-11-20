/**
 * Tells whether an error from the native Entrust IDV SDK was caused by a missing camera or microphone permission.
 *
 * The SDK's TypeScript type says an error has a string `type` and a `category`, but that's not what native sends:
 * iOS encodes the type as a Swift enum case, like `{"cameraPermissionDenied": {}}`, and neither platform sends `category`.
 */
import CONST from '@src/CONST';

/** Reads the error type as a string, whether native sent it as a string or as an encoded Swift enum case */
function getNativeOnfidoErrorType(type: unknown): string | undefined {
    if (typeof type === 'string') {
        return type;
    }
    if (type && typeof type === 'object') {
        return Object.keys(type).at(0);
    }
    return undefined;
}

function isNativeOnfidoPermissionError(error: {type?: unknown; category?: unknown}): boolean {
    if (error.category === CONST.ONFIDO.NATIVE_ERROR_CATEGORY.PERMISSIONS) {
        return true;
    }
    const errorType = getNativeOnfidoErrorType(error.type)?.toLowerCase();
    return !!errorType && (CONST.ONFIDO.NATIVE_PERMISSION_ERROR_TYPES as readonly string[]).includes(errorType);
}

export default isNativeOnfidoPermissionError;
export {getNativeOnfidoErrorType};

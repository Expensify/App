import isFileUploadable from './isFileUploadable';

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
        // eslint-disable-next-line no-console
        console.warn(`An unsupported value was passed to command '${command}' (parameter: '${key}'). Only Blob and primitive types are allowed.`);
    }
}

export default validateFormDataParameter;

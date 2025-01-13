import CONST from '@src/CONST';
import getPlatform from './getPlatform';

const platform = getPlatform();
const isNativePlatform = platform === CONST.PLATFORM.ANDROID || platform === CONST.PLATFORM.IOS;

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
            // Native platforms only require the value to include the `uri` property.
            // Optionally, it can also have a `name` and `type` props.
            // On other platforms, the value must be an instance of `Blob`.
            return isNativePlatform ? 'uri' in value && !!value.uri : value instanceof Blob;
        }
        return false;
    };

    if (!isValid(value, true)) {
        // eslint-disable-next-line no-console
        console.warn(`An unsupported value was passed to command '${command}' (parameter: '${key}'). Only Blob and primitive types are allowed.`);
    }
}

export default validateFormDataParameter;

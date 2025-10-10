import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

/**
 * Takes an error from SecureStore and maps it to a translation path based on the error message.
 * Parses the error string using a separator and searches for known error patterns.
 * Returns a generic error translation if no specific mapping is found.
 */
function decodeExpoMessage(error: unknown): TranslationPaths {
    const errorString = String(error);
    const parts = errorString.split(CONST.BIOMETRICS.EXPO_ERRORS.SEPARATOR);
    const searchString = parts.length > 1 ? parts.slice(1).join(';').trim() : errorString;

    const errorMappings = {
        [CONST.BIOMETRICS.EXPO_ERRORS.SEARCH_STRING.CANCELED]: 'biometrics.reason.expoErrors.canceled',
        [CONST.BIOMETRICS.EXPO_ERRORS.SEARCH_STRING.IN_PROGRESS]: 'biometrics.reason.expoErrors.alreadyInProgress',
        [CONST.BIOMETRICS.EXPO_ERRORS.SEARCH_STRING.NOT_IN_FOREGROUND]: 'biometrics.reason.expoErrors.notInForeground',
        [CONST.BIOMETRICS.EXPO_ERRORS.SEARCH_STRING.EXISTS]: 'biometrics.reason.expoErrors.keyExists',
        [CONST.BIOMETRICS.EXPO_ERRORS.SEARCH_STRING.NO_AUTHENTICATION]: 'biometrics.reason.expoErrors.noAuthentication',
        [CONST.BIOMETRICS.EXPO_ERRORS.SEARCH_STRING.OLD_ANDROID]: 'biometrics.reason.expoErrors.oldAndroid',
    } as const;

    for (const [searchKey, translationPath] of Object.entries(errorMappings)) {
        if (searchString.includes(searchKey)) {
            return translationPath as TranslationPaths;
        }
    }

    return 'biometrics.reason.expoErrors.generic';
}

/**
 * Converts Expo SecureStore error messages into user-friendly translation paths.
 * First attempts to map the error to a specific translation using decodeExpoMessage.
 * If the error maps to a generic message and a fallback is provided, returns the fallback instead.
 * This allows for more specific error messaging in known error scenarios.
 */
const decodeBiometricsExpoMessage = (message: unknown, fallback?: TranslationPaths): TranslationPaths => {
    const decodedMessage = decodeExpoMessage(message);
    return decodedMessage === 'biometrics.reason.expoErrors.generic' && fallback ? fallback : decodedMessage;
};

export default decodeBiometricsExpoMessage;

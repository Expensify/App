/**
 * Constants specific to native biometrics (ED25519 / SecureStore / Expo).
 */
import SHARED_VALUES from '@libs/MultifactorAuthentication/shared/VALUES';

const {REASON} = SHARED_VALUES;

/**
 * Expo error message search strings and separator.
 */
const EXPO_ERRORS = {
    SEPARATOR: 'Caused by:',
    SEARCH_STRING: {
        NOT_IN_FOREGROUND: 'not in the foreground',
        IN_PROGRESS: 'in progress',
        CANCELED: 'canceled',
        EXISTS: 'already exists',
        NO_AUTHENTICATION: 'No authentication method available',
        OLD_ANDROID: 'NoSuchMethodError',
    },
} as const;

const NATIVE_BIOMETRICS_VALUES = {
    /**
     * Keychain service name for secure key storage.
     */
    KEYCHAIN_SERVICE: 'Expensify',

    /**
     * EdDSA key type identifier referred to as EdDSA in the Auth.
     */
    ED25519_TYPE: 'biometric',

    /**
     * Key alias identifiers for secure storage.
     */
    KEY_ALIASES: {
        PUBLIC_KEY: '3DS_SCA_KEY_PUBLIC',
        PRIVATE_KEY: '3DS_SCA_KEY_PRIVATE',
    },
    EXPO_ERRORS,

    /**
     * Maps authentication Expo errors to appropriate reason messages.
     */
    EXPO_ERROR_MAPPINGS: {
        [EXPO_ERRORS.SEARCH_STRING.CANCELED]: REASON.EXPO.CANCELED,
        [EXPO_ERRORS.SEARCH_STRING.IN_PROGRESS]: REASON.EXPO.IN_PROGRESS,
        [EXPO_ERRORS.SEARCH_STRING.NOT_IN_FOREGROUND]: REASON.EXPO.NOT_IN_FOREGROUND,
        [EXPO_ERRORS.SEARCH_STRING.EXISTS]: REASON.EXPO.KEY_EXISTS,
        [EXPO_ERRORS.SEARCH_STRING.NO_AUTHENTICATION]: REASON.EXPO.NO_METHOD_AVAILABLE,
        [EXPO_ERRORS.SEARCH_STRING.OLD_ANDROID]: REASON.EXPO.NOT_SUPPORTED,
    },
} as const;

export default NATIVE_BIOMETRICS_VALUES;

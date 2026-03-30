/**
 * Constants specific to native biometrics (HSM / react-native-biometrics).
 */
import {AuthType} from '@sbaiahmed1/react-native-biometrics';
import MARQETA_VALUES from '@libs/MultifactorAuthentication/shared/MarqetaValues';

const NATIVE_BIOMETRICS_HSM_VALUES = {
    /**
     * HSM key type identifier
     */
    HSM_TYPE: 'biometric-hsm',

    /**
     * Key alias suffix for HSM keys managed by react-native-biometrics.
     */
    HSM_KEY_SUFFIX: 'HSM_KEY',

    /**
     * Authentication types mapped to Marqeta values
     */
    AUTH_TYPE: {
        /**
         * AuthType.Unknown will be released in the next version of the @sbaiahmed1/react-native-biometrics
         */
        UNKNOWN: {
            CODE: -1,
            NAME: 'Unknown',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.KNOWLEDGE_BASED,
        },
        NONE: {
            CODE: AuthType.None,
            NAME: 'None',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.NONE,
        },
        CREDENTIALS: {
            CODE: AuthType.DeviceCredentials,
            NAME: 'Credentials',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.KNOWLEDGE_BASED,
        },
        BIOMETRICS: {
            CODE: AuthType.Biometrics,
            NAME: 'Biometrics',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FINGERPRINT,
        },
        FACE_ID: {
            CODE: AuthType.FaceID,
            NAME: 'Face ID',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FACE,
        },
        TOUCH_ID: {
            CODE: AuthType.TouchID,
            NAME: 'Touch ID',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FINGERPRINT,
        },
        /**
         * OpticID is reserved by apple, used on Apple Vision Pro and not iOS.
         * It is declared here for completeness but is not currently supported.
         */
        OPTIC_ID: {
            CODE: AuthType.OpticID,
            NAME: 'Optic ID',
            MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.BIOMETRIC_FACE,
        },
    },
} as const;

export default NATIVE_BIOMETRICS_HSM_VALUES;

import {AUTH_TYPE as SECURE_STORE_AUTH_TYPE} from 'expo-secure-store';

/** Type of used authentication method returned by the SecureStore mapped to names */
const SECURE_STORE_VALUES = {
    AUTH_TYPE: {
        UNKNOWN: {
            CODE: SECURE_STORE_AUTH_TYPE.UNKNOWN,
            NAME: 'Unknown',
        },
        NONE: {
            CODE: SECURE_STORE_AUTH_TYPE.NONE,
            NAME: 'None',
        },
        CREDENTIALS: {
            CODE: SECURE_STORE_AUTH_TYPE.CREDENTIALS,
            NAME: 'Credentials',
        },
        BIOMETRICS: {
            CODE: SECURE_STORE_AUTH_TYPE.BIOMETRICS,
            NAME: 'Biometrics',
        },
        FACE_ID: {
            CODE: SECURE_STORE_AUTH_TYPE.FACE_ID,
            NAME: 'FaceID',
        },
        TOUCH_ID: {
            CODE: SECURE_STORE_AUTH_TYPE.TOUCH_ID,
            NAME: 'TouchID',
        },
        OPTIC_ID: {
            CODE: SECURE_STORE_AUTH_TYPE.OPTIC_ID,
            NAME: 'OpticID',
        },
    },
} as const;

export default SECURE_STORE_VALUES;

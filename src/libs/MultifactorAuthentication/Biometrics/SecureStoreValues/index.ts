/** Type of used authentication method returned by the SecureStore mapped to names */
const SECURE_STORE_VALUES = {
    AUTH_TYPE: {
        UNKNOWN: {
            CODE: -1,
            NAME: 'Unknown',
        },
        NONE: {
            CODE: 0,
            NAME: 'None',
        },
        CREDENTIALS: {
            CODE: 1,
            NAME: 'Credentials',
        },
        BIOMETRICS: {
            CODE: 2,
            NAME: 'Biometrics',
        },
        FACE_ID: {
            CODE: 3,
            NAME: 'FaceID',
        },
        TOUCH_ID: {
            CODE: 4,
            NAME: 'TouchID',
        },
        OPTIC_ID: {
            CODE: 5,
            NAME: 'OpticID',
        },
    },
} as const;

export default SECURE_STORE_VALUES;

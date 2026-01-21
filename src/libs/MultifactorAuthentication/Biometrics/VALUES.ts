/**
 * Centralized constants used by the multifactor authentication biometrics flow.
 * It is stored here instead of the CONST file to avoid circular dependencies.
 */
const MULTIFACTOR_AUTHENTICATION_VALUES = {
    /** Referred to as the EdDSA in the Auth */
    ED25519_TYPE: 'biometric',
    KEY_ALIASES: {
        PUBLIC_KEY: '3DS_SCA_KEY_PUBLIC',
    },
} as const;

export default MULTIFACTOR_AUTHENTICATION_VALUES;

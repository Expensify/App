import SCENARIO from '@components/MultifactorAuthentication/config/scenarios/names';

const MULTIFACTOR_AUTHENTICATION_VALUES = {
    ED25519_TYPE: 'biometric',
    KEY_ALIASES: {
        PUBLIC_KEY: '3DS_SCA_KEY_PUBLIC',
    },
    SCENARIO,
    TYPE: {
        BIOMETRICS: 'BIOMETRICS',
    },
} as const;

export default MULTIFACTOR_AUTHENTICATION_VALUES;

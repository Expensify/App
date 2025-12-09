import type {MultifactorAuthenticationChallengeObject} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import type {ReadCommands, WriteCommands} from './types';

const WRITE_COMMANDS = {
    REGISTER_BIOMETRICS: 'RegisterBiometrics',
    AUTHORIZE_TRANSACTION: 'AuthorizeTransaction',
    RESEND_VALIDATE_CODE: 'ResendValidateCode',
    REVOKE_MULTIFACTOR_AUTHENTICATION_KEYS: 'RevokeMultifactorAuthenticationKeys',
} as const;

const READ_COMMANDS = {
    REQUEST_BIOMETRIC_CHALLENGE: 'RequestBiometricChallenge',
} as const;

const SIDE_EFFECT_REQUEST_COMMANDS = {
    REGISTER_BIOMETRICS: WRITE_COMMANDS.REGISTER_BIOMETRICS,
    AUTHORIZE_TRANSACTION: WRITE_COMMANDS.AUTHORIZE_TRANSACTION,
    RESEND_VALIDATE_CODE: WRITE_COMMANDS.RESEND_VALIDATE_CODE,
    REQUEST_BIOMETRIC_CHALLENGE: READ_COMMANDS.REQUEST_BIOMETRIC_CHALLENGE,
    REVOKE_MULTIFACTOR_AUTHENTICATION_KEYS: WRITE_COMMANDS.REVOKE_MULTIFACTOR_AUTHENTICATION_KEYS,
};

const API_ROUTES: {
    Read: Record<keyof ReadCommands, `${'POST' | 'GET'}:${string}`>;
    Write: Record<keyof WriteCommands, `${'POST' | 'GET'}:${string}`>;
} = {
    Read: {
        RequestBiometricChallenge: 'GET:/request_biometric_challenge',
    },
    Write: {
        ResendValidateCode: 'POST:/resend_validate_code',
        RegisterBiometrics: 'POST:/register_biometrics',
        AuthorizeTransaction: 'POST:/authorize_transaction',
        RevokeMultifactorAuthenticationKeys: 'POST:/revoke_public_keys',
    },
};

const FALLBACK_EMAIL = 'user@example.com';
const FALLBACK_ACCOUNT_ID = 18023156;

const STORAGE: {
    publicKeys: Record<string, string[]>;
    validateCodes: Record<string, number[]>;
    challenges: Record<string, MultifactorAuthenticationChallengeObject>;
} = {
    publicKeys: {},
    validateCodes: {},
    challenges: {},
};

const ROUTER: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    post: Record<string, Function>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    get: Record<string, Function>;
} = {
    post: {},
    get: {},
};

const RESPONSE = {
    MISSING_PARAMETER: {
        status: 422,
        response: undefined,
    },

    REQUEST_SUCCESSFUL: {
        status: 200,
        response: undefined,
    },

    UNAUTHORIZED: {
        status: 401,
        response: undefined,
    },

    BAD_REQUEST: {
        status: 400,
        response: undefined,
    },

    CONFLICT: {
        status: 409,
        response: undefined,
    },
};

export {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS, READ_COMMANDS, API_ROUTES, FALLBACK_EMAIL, FALLBACK_ACCOUNT_ID, STORAGE, ROUTER, RESPONSE};

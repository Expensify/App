import Onyx from 'react-native-onyx';
import {bytesToHex, randomBytes} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import type {MultifactorAuthenticationChallengeObject} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import {FALLBACK_ACCOUNT_ID, FALLBACK_EMAIL, RESPONSE, ROUTER, STORAGE} from './config';
import type {ReadCommands, WriteCommands} from './index';
import Logger from './Logger';
import {base64URL, generateSixDigitNumber, isChallengeValid} from './utils';

let sessionData: OnyxValues[typeof ONYXKEYS.SESSION] = {};

// eslint-disable-next-line rulesdir/prefer-onyx-connect-in-libs,rulesdir/no-onyx-connect
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        if (!val || Object.keys(val).length === 0) {
            return;
        }

        sessionData = val;
    },
});

ROUTER.post['/resend_validate_code'] = ({email}: Partial<WriteCommands['ResendValidateCode']['parameters']>): WriteCommands['ResendValidateCode']['returns'] => {
    Logger.m('Generating new validation code');

    if (!email) {
        return {
            ...RESPONSE.MISSING_PARAMETER,
            message: Logger.w('Email parameter is missing in the request'),
        };
    }

    const randomCode = generateSixDigitNumber();
    const emailWithFallback = sessionData.email ?? email;

    STORAGE.validateCodes[emailWithFallback] ??= [];
    STORAGE.validateCodes[emailWithFallback].push(randomCode);
    Logger.m('Generated new validation code:', randomCode, 'for email', emailWithFallback);

    return {
        ...RESPONSE.REQUEST_SUCCESSFUL,
        message: `Validate code sent to email ${emailWithFallback}`,
    };
};

ROUTER.post['/revoke_public_keys'] = (): WriteCommands['RevokeMultifactorAuthenticationKeys']['returns'] => {
    const emailWithFallback = sessionData.email ?? FALLBACK_EMAIL;
    const publicKeys = STORAGE.publicKeys[emailWithFallback];

    Logger.m('Revoking all public keys for email', emailWithFallback);

    if (!publicKeys || publicKeys.length === 0) {
        return {
            ...RESPONSE.BAD_REQUEST,
            message: Logger.w('There are no registered public keys for this email'),
        };
    }

    while (publicKeys.length) {
        Logger.m(`Revoked ${publicKeys.pop()} public key`);
    }

    return {
        ...RESPONSE.REQUEST_SUCCESSFUL,
        message: `Revoked all public keys for email ${emailWithFallback}`,
    };
};

// eslint-disable-next-line @typescript-eslint/require-await
ROUTER.get['/request_biometric_challenge'] = async (): Promise<ReadCommands['RequestBiometricChallenge']['returns']> => {
    Logger.m('Requested biometric challenge');

    const publicKeys = STORAGE.publicKeys[sessionData.email ?? FALLBACK_EMAIL];

    if (!publicKeys) {
        return {
            ...RESPONSE.UNAUTHORIZED,
            message: Logger.w('Registration required'),
        };
    }

    const nonce = bytesToHex(randomBytes(16));

    const challenge: MultifactorAuthenticationChallengeObject = {
        challenge: nonce,
        rpId: 'expensify.com',
        // not used currently
        allowCredentials: [
            {
                type: 'biometrics',
                id: base64URL(`${sessionData.accountID ?? FALLBACK_ACCOUNT_ID}_${VALUES.KEY_ALIASES.PUBLIC_KEY}`),
            },
        ],
        userVerification: 'required',
        timeout: 480000,
    };

    STORAGE.challenges[challenge.challenge] = challenge;

    setTimeout(() => {
        Logger.m(`Challenge ${challenge.challenge} expired, removed from storage`);
        delete STORAGE.challenges[challenge.challenge];
    }, 480000);

    Logger.m('Challenge', challenge.challenge, 'sent to the client');

    return {
        response: {challenge, publicKeys},
        status: 200,
        message: 'Biometrics challenge generated successfully',
    };
};

ROUTER.post['/register_biometrics'] = ({publicKey, validateCode}: Partial<WriteCommands['RegisterBiometrics']['parameters']>): WriteCommands['RegisterBiometrics']['returns'] => {
    const validateCodes = STORAGE.validateCodes[sessionData.email ?? FALLBACK_EMAIL] ?? [];

    Logger.m('Received request with publicKey', publicKey, validateCode ? `and validate code ${validateCode}` : 'and no validate code');

    if (!publicKey) {
        return {
            ...RESPONSE.MISSING_PARAMETER,
            message: Logger.w('No public key provided'),
        };
    }

    if (!validateCode) {
        return {
            ...RESPONSE.MISSING_PARAMETER,
            message: Logger.w('Validation code required'),
        };
    }

    if (STORAGE.publicKeys[sessionData.email ?? FALLBACK_EMAIL]?.includes(publicKey)) {
        return {
            ...RESPONSE.CONFLICT,
            message: Logger.w('Public key is already registered'),
        };
    }

    const isValidateCodeCorrect = !!validateCodes.at(-1) && validateCodes.at(-1) === validateCode;

    if (!isValidateCodeCorrect) {
        return {
            ...RESPONSE.BAD_REQUEST,
            message: Logger.w('Validation code invalid'),
        };
    }

    validateCodes.pop();

    STORAGE.publicKeys[sessionData.email ?? FALLBACK_EMAIL] ??= [];
    STORAGE.publicKeys[sessionData.email ?? FALLBACK_EMAIL].push(publicKey);

    Logger.m('Registered biometrics for public key', publicKey);

    return {
        ...RESPONSE.REQUEST_SUCCESSFUL,
        message: 'Biometrics registered successfully',
    };
};

ROUTER.post['/authorize_transaction'] = ({
    transactionID,
    signedChallenge,
}: Partial<WriteCommands['AuthorizeTransaction']['parameters']>): WriteCommands['AuthorizeTransaction']['returns'] => {
    if (!transactionID) {
        return {
            ...RESPONSE.MISSING_PARAMETER,
            message: Logger.w('No transaction ID provided'),
        };
    }

    const userPublicKeys = STORAGE.publicKeys[sessionData.email ?? FALLBACK_EMAIL];

    if (!userPublicKeys?.length) {
        return {
            ...RESPONSE.UNAUTHORIZED,
            message: Logger.w('User is not registered'),
        };
    }

    if (signedChallenge) {
        Logger.m('Authorizing transaction', transactionID, 'with signed challenge', signedChallenge);

        const authorized = userPublicKeys.some((publicKey) => isChallengeValid(signedChallenge, publicKey));

        return authorized
            ? {
                  ...RESPONSE.REQUEST_SUCCESSFUL,
                  message: Logger.m('User authorized successfully using challenge'),
              }
            : {
                  ...RESPONSE.CONFLICT,
                  message: Logger.w('Unable to authorize user using challenge'),
              };
    }

    return {
        ...RESPONSE.BAD_REQUEST,
        message: Logger.w('Bad request'),
    };
};

const callMockedAPI = (
    path: string,
    options: {
        method: 'GET' | 'POST';
        body?: Record<string, unknown>;
    },
) => {
    const methodLowerCase = options.method === 'GET' ? 'get' : 'post';

    if (path === '/trigger') {
        return;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
    return ROUTER[methodLowerCase][path](options.body);
};

export default callMockedAPI;

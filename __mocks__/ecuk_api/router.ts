import {Buffer} from 'buffer';
import Onyx from 'react-native-onyx';
import {bytesToHex, randomBytes} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import type {MFAChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519.types';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import type {OnyxValues} from '@src/ONYXKEYS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReadCommands, WriteCommands} from './index';
import Logger from './Logger';
import {FALLBACK_ACCOUNT_ID, FALLBACK_EMAIL, generateSixDigitNumber, isChallengeValid, MOCKED_AUTHENTICATOR_CODE, PHONE_NUMBER, STORAGE} from './utils';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Base64URL<T> = string;

/** RN polyfill for base64url encoding */
const base64URL = <T>(value: string): Base64URL<T> => {
    return Buffer.from(value).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};

const router: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    post: Record<string, Function>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    get: Record<string, Function>;
} = {
    post: {},
    get: {},
};

const MISSING_PARAMETER = {
    status: 422,
    response: undefined,
};

const REQUEST_SUCCESSFUL = {
    status: 200,
    response: undefined,
};

const UNAUTHORIZED = {
    status: 401,
    response: undefined,
};

const BAD_REQUEST = {
    status: 400,
    response: undefined,
};

const CONFLICT = {
    status: 409,
    response: undefined,
};

const OTP_REQUIRED = {
    status: 202,
    response: undefined,
};

router.post['/resend_validate_code'] = ({email}: Partial<WriteCommands['ResendValidateCode']['parameters']>): WriteCommands['ResendValidateCode']['returns'] => {
    Logger.m('Generating new validation code');

    if (!email) {
        return {
            ...MISSING_PARAMETER,
            message: Logger.w('Email parameter is missing in the request'),
        };
    }

    const randomCode = generateSixDigitNumber();
    const emailWithFallback = sessionData.email ?? email;

    STORAGE.validateCodes[emailWithFallback] ??= [];
    STORAGE.validateCodes[emailWithFallback].push(randomCode);
    Logger.m('Generated new validation code:', randomCode, 'for email', emailWithFallback);

    return {
        ...REQUEST_SUCCESSFUL,
        message: `Validate code sent to email ${emailWithFallback}`,
    };
};

router.post['/revoke_public_keys'] = (): WriteCommands['RevokeMultifactorAuthenticationKeys']['returns'] => {
    const emailWithFallback = sessionData.email ?? FALLBACK_EMAIL;
    const publicKeys = STORAGE.publicKeys[emailWithFallback];

    Logger.m('Revoking all public keys for email', emailWithFallback);

    if (!publicKeys || publicKeys.length === 0) {
        return {
            ...BAD_REQUEST,
            message: Logger.w('There are no registered public keys for this email'),
        };
    }

    while (publicKeys.length) {
        Logger.m(`Revoked ${publicKeys.pop()} public key`);
    }

    return {
        ...REQUEST_SUCCESSFUL,
        message: `Revoked all public keys for email ${emailWithFallback}`,
    };
};

router.post['/send_otp'] = ({phoneNumber}: Partial<WriteCommands['SendOTP']['parameters']>): WriteCommands['SendOTP']['returns'] => {
    Logger.m('Generating new validation code');

    if (!phoneNumber) {
        return {
            ...MISSING_PARAMETER,
            message: Logger.w('Phone parameter is missing in the request'),
        };
    }

    const randomCode = generateSixDigitNumber();

    STORAGE.OTPs[phoneNumber] ??= [];
    STORAGE.OTPs[phoneNumber].push(randomCode);
    Logger.m('Generated new OTP code:', randomCode, 'for phone number', phoneNumber);

    return {
        ...REQUEST_SUCCESSFUL,
        message: `Validate code sent to phone number ${phoneNumber}`,
    };
};

// eslint-disable-next-line @typescript-eslint/require-await
router.get['/request_biometric_challenge'] = async (): Promise<ReadCommands['RequestBiometricChallenge']['returns']> => {
    Logger.m('Requested biometric challenge');

    const publicKeys = STORAGE.publicKeys[sessionData.email ?? FALLBACK_EMAIL];

    if (!publicKeys) {
        return {
            ...UNAUTHORIZED,
            message: Logger.w('Registration required'),
        };
    }

    const nonce = bytesToHex(randomBytes(16));

    const challenge: MFAChallenge = {
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

router.post['/register_biometrics'] = ({publicKey, validateCode}: Partial<WriteCommands['RegisterBiometrics']['parameters']>): WriteCommands['RegisterBiometrics']['returns'] => {
    const validateCodes = STORAGE.validateCodes[sessionData.email ?? FALLBACK_EMAIL] ?? [];

    Logger.m('Received request with publicKey', publicKey, validateCode ? `and validate code ${validateCode}` : 'and no validate code');

    if (!publicKey) {
        return {
            ...MISSING_PARAMETER,
            message: Logger.w('No public key provided'),
        };
    }

    if (!validateCode) {
        return {
            ...MISSING_PARAMETER,
            message: Logger.w('Validation code required'),
        };
    }

    if (STORAGE.publicKeys[sessionData.email ?? FALLBACK_EMAIL]?.includes(publicKey)) {
        return {
            ...CONFLICT,
            message: Logger.w('Public key is already registered'),
        };
    }

    const isValidateCodeCorrect = !!validateCodes.at(-1) && validateCodes.at(-1) === validateCode;

    if (!isValidateCodeCorrect) {
        return {
            ...BAD_REQUEST,
            message: Logger.w('Validation code invalid'),
        };
    }

    validateCodes.pop();

    STORAGE.publicKeys[sessionData.email ?? FALLBACK_EMAIL] ??= [];
    STORAGE.publicKeys[sessionData.email ?? FALLBACK_EMAIL].push(publicKey);

    Logger.m('Registered biometrics for public key', publicKey);

    return {
        ...REQUEST_SUCCESSFUL,
        message: 'Biometrics registered successfully',
    };
};

router.post['/authorize_transaction'] = ({
    transactionID,
    validateCode,
    otp,
    signedChallenge,
}: Partial<WriteCommands['AuthorizeTransaction']['parameters']>): WriteCommands['AuthorizeTransaction']['returns'] => {
    const validateCodes = STORAGE.validateCodes[sessionData.email ?? FALLBACK_EMAIL] ?? [];
    const OTPs = STORAGE.OTPs[PHONE_NUMBER] ?? [];

    if (!transactionID) {
        return {
            ...MISSING_PARAMETER,
            message: Logger.w('No transaction ID provided'),
        };
    }

    const userPublicKeys = STORAGE.publicKeys[sessionData.email ?? FALLBACK_EMAIL];

    if (!userPublicKeys?.length && (!validateCode || signedChallenge)) {
        return {
            ...UNAUTHORIZED,
            message: Logger.w('User is not registered'),
        };
    }

    if (signedChallenge) {
        Logger.m('Authorizing transaction', transactionID, 'with signed challenge', signedChallenge);

        const authorized = userPublicKeys.some((publicKey) => isChallengeValid(signedChallenge, publicKey));

        return authorized
            ? {
                  ...REQUEST_SUCCESSFUL,
                  message: Logger.m('User authorized successfully using challenge'),
              }
            : {
                  ...CONFLICT,
                  message: Logger.w('Unable to authorize user using challenge'),
              };
    }

    if (validateCode && !!validateCodes.at(-1)) {
        Logger.m('Authorizing transaction', transactionID, 'with validate code', validateCode);

        const isValidateCodeCorrect = validateCodes.at(-1) === validateCode;

        if (isValidateCodeCorrect && !otp) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            router.post['/send_otp']({phoneNumber: PHONE_NUMBER});

            return {
                ...OTP_REQUIRED,
                message: Logger.w('OTP required to authorize transaction'),
            };
        }

        // eslint-disable-next-line rulesdir/no-negated-variables
        const areOTPsNotNull = !!OTPs.at(-1) && !!otp;
        const isOTPCorrect = otp === MOCKED_AUTHENTICATOR_CODE || (areOTPsNotNull && OTPs.at(-1) === otp);

        const isEverythingOK = isValidateCodeCorrect && isOTPCorrect;

        if (isEverythingOK) {
            validateCodes.pop();
            OTPs.pop();
        }

        return isEverythingOK
            ? {
                  ...REQUEST_SUCCESSFUL,
                  message: Logger.m('User authorized successfully using validate code and OTP'),
              }
            : {
                  ...CONFLICT,
                  message: Logger.w('Unable to authorize user using validate code and OTP'),
              };
    }

    return {
        ...BAD_REQUEST,
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
    return router[methodLowerCase][path](options.body);
};

export default callMockedAPI;

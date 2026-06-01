/**
 * Helper utilities for native biometrics HSM (react-native-biometrics).
 */
import {sha256} from '@sbaiahmed1/react-native-biometrics';
import type {AuthType} from '@sbaiahmed1/react-native-biometrics/types';
import {Buffer} from 'buffer';
import type {ValueOf} from 'type-fest';
import {getErrorMessage} from '@libs/ErrorUtils';
import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {MFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {AuthTypeInfo, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/shared/types';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import CONST from '@src/CONST';
import NATIVE_BIOMETRICS_HSM_VALUES from './VALUES';

type NativeBiometricsHSMTypeEntry = ValueOf<typeof NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE>;

/**
 * Builds the key alias for a given account.
 */
function getKeyAlias(accountID: number): string {
    return `${accountID}_${CONST.MULTIFACTOR_AUTHENTICATION.HSM_KEY_SUFFIX}`;
}

/**
 * Maps authType number from signWithOptions (with returnAuthType: true) to AuthTypeInfo.
 * Native layer returns: -1=Unknown, 0=None, 1=DeviceCredentials, 2=Biometrics, 3=FaceID, 4=TouchID, 5=OpticID
 */
const AUTH_TYPE_NUMBER_MAP = new Map<AuthType, NativeBiometricsHSMTypeEntry>([
    [-1, NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.UNKNOWN],
    [0, NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.NONE],
    [1, NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.CREDENTIALS],
    [2, NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.BIOMETRICS],
    [3, NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.FACE_ID],
    [4, NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.TOUCH_ID],
    [5, NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.OPTIC_ID],
]);

function mapAuthTypeNumber(authType?: number): AuthTypeInfo | undefined {
    if (authType === undefined) {
        return undefined;
    }
    const entry = AUTH_TYPE_NUMBER_MAP.get(authType);
    if (!entry) {
        return undefined;
    }
    return {code: entry.CODE, name: entry.NAME, marqetaValue: entry.MARQETA_VALUE};
}

/**
 * Maps errorCode strings from signWithOptions results to REASON values.
 * Uses exact error code matching against constants from ERRORS.md.
 */
const SIGN_ERROR_CODE_MAP: Record<string, MultifactorAuthenticationReason> = {
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.USER_CANCEL]: VALUES.REASON.LOCAL_ERRORS.HSM.CANCELED,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.USER_CANCELED]: VALUES.REASON.LOCAL_ERRORS.HSM.CANCELED,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.SYSTEM_CANCEL]: VALUES.REASON.LOCAL_ERRORS.HSM.CANCELED,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.SYSTEM_CANCELED]: VALUES.REASON.LOCAL_ERRORS.HSM.CANCELED,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.KEY_NOT_FOUND]: VALUES.REASON.LOCAL_ERRORS.HSM.KEY_NOT_FOUND,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRY_NOT_AVAILABLE]: VALUES.REASON.LOCAL_ERRORS.HSM.NOT_AVAILABLE,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRIC_NOT_AVAILABLE]: VALUES.REASON.LOCAL_ERRORS.HSM.NOT_AVAILABLE,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRIC_UNAVAILABLE]: VALUES.REASON.LOCAL_ERRORS.HSM.NOT_AVAILABLE,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRY_LOCKOUT]: VALUES.REASON.LOCAL_ERRORS.HSM.LOCKOUT,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRIC_LOCKOUT]: VALUES.REASON.LOCAL_ERRORS.HSM.LOCKOUT,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRY_LOCKOUT_PERMANENT]: VALUES.REASON.LOCAL_ERRORS.HSM.LOCKOUT_PERMANENT,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.BIOMETRIC_LOCKOUT_PERMANENT]: VALUES.REASON.LOCAL_ERRORS.HSM.LOCKOUT_PERMANENT,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.SIGNATURE_CREATION_FAILED]: VALUES.REASON.LOCAL_ERRORS.HSM.SIGNATURE_FAILED,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.KEY_ACCESS_FAILED]: VALUES.REASON.LOCAL_ERRORS.HSM.KEY_ACCESS_FAILED,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.AUTHENTICATION_FAILED]: VALUES.REASON.LOCAL_ERRORS.HSM.AUTHENTICATION_FAILED,
};

function mapSignErrorCodeToReason(errorCode?: string): MultifactorAuthenticationReason | undefined {
    if (!errorCode) {
        return undefined;
    }
    return SIGN_ERROR_CODE_MAP[errorCode] ?? VALUES.REASON.LOCAL_ERRORS.HSM.UNRECOGNIZED;
}

/**
 * Maps errorCode strings from rejected library promises to REASON values.
 */
const LIBRARY_ERROR_CODE_MAP: Record<string, MultifactorAuthenticationReason> = {
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.USER_CANCEL]: VALUES.REASON.LOCAL_ERRORS.HSM.CANCELED,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.USER_CANCELED]: VALUES.REASON.LOCAL_ERRORS.HSM.CANCELED,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.KEY_NOT_FOUND]: VALUES.REASON.LOCAL_ERRORS.HSM.KEY_NOT_FOUND,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.KEY_ALREADY_EXISTS]: VALUES.REASON.LOCAL_ERRORS.HSM.KEY_CREATION_FAILED,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.CREATE_KEYS_ERROR]: VALUES.REASON.LOCAL_ERRORS.HSM.KEY_CREATION_FAILED,
    [NATIVE_BIOMETRICS_HSM_VALUES.ERROR_CODE.KEY_ACCESS_FAILED]: VALUES.REASON.LOCAL_ERRORS.HSM.KEY_ACCESS_FAILED,
};

/**
 * Decodes caught exceptions from the library into an MFAError.
 * Falls back to UNRECOGNIZED for errors without a known code — mirrors decodeWebAuthnError.
 */
function decodeLibraryError(error: unknown): MFAError {
    const message = getErrorMessage(error);
    if (error instanceof Error && 'code' in error && typeof error.code === 'string') {
        const reason = LIBRARY_ERROR_CODE_MAP[error.code];
        if (reason) {
            return createLocalMFAError(reason, message);
        }
    }
    return createLocalMFAError(VALUES.REASON.LOCAL_ERRORS.HSM.UNRECOGNIZED, message);
}

/**
 * Builds the WebAuthn-style authenticatorData, clientDataJSON and dataToSign for a challenge.
 *
 * authenticatorData = rpIdHash(32B) || flags(1B: UP|UV = 0x05) || signCount(4B: zeros)
 * dataToSign       = authenticatorData || sha256(clientDataJSON)
 */
async function buildSigningData(rpId: string, challenge: string): Promise<{authenticatorData: Buffer; clientDataJSON: string; dataToSignB64: string}> {
    const {hash: rpIdHashB64} = await sha256(rpId);
    const rpIdHash = Buffer.from(rpIdHashB64, 'base64');

    // User Presence and User Verification flags - UP (0x01) | UV (0x04)
    const flags = Buffer.from([0x05]);
    // 4 zero bytes, big-endian
    const signCount = Buffer.alloc(4);

    const authenticatorData = Buffer.concat([rpIdHash, flags, signCount]);

    const clientDataJSON = JSON.stringify({challenge});
    const {hash: clientDataHashB64} = await sha256(clientDataJSON);
    const clientDataHash = Buffer.from(clientDataHashB64, 'base64');

    const dataToSign = Buffer.concat([authenticatorData, clientDataHash]);
    const dataToSignB64 = dataToSign.toString('base64');

    return {authenticatorData, clientDataJSON, dataToSignB64};
}

export {getKeyAlias, mapAuthTypeNumber, mapSignErrorCodeToReason, decodeLibraryError, buildSigningData};

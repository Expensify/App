/**
 * Helper utilities for native biometrics HSM (react-native-biometrics).
 */
import type {BiometricSensorInfo} from '@sbaiahmed1/react-native-biometrics';
import {isSensorAvailable, sha256} from '@sbaiahmed1/react-native-biometrics';
import {Buffer} from 'buffer';
import type {ValueOf} from 'type-fest';
import type {AuthTypeInfo, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/shared/types';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import CONST from '@src/CONST';
import NATIVE_BIOMETRICS_HSM_VALUES from './VALUES';

type SecureStoreAuthTypeEntry = ValueOf<typeof NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE>;

/**
 * Builds the key alias for a given account.
 */
function getKeyAlias(accountID: number): string {
    return `${accountID}_${CONST.MULTIFACTOR_AUTHENTICATION.HSM_KEY_SUFFIX}`;
}

/**
 * Module-level cache for sensor availability, called once at module load.
 */
let sensorResult: BiometricSensorInfo = {available: false};

isSensorAvailable()
    .then((result) => {
        sensorResult = result;
    })
    .catch(() => {
        // sensorResult stays { available: false }
    });

function getSensorResult(): BiometricSensorInfo {
    return sensorResult;
}

/**
 * Maps authType number from signWithOptions (with returnAuthType: true) to AuthTypeInfo.
 * Native layer returns: -1=Unknown, 0=None, 1=DeviceCredentials, 2=Biometrics, 3=FaceID, 4=TouchID, 5=OpticID
 */
const AUTH_TYPE_NUMBER_MAP = new Map<number, SecureStoreAuthTypeEntry>([
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
 * Maps library errorCode strings to existing REASON values.
 */
function mapSignErrorCode(errorCode?: string): MultifactorAuthenticationReason | undefined {
    if (!errorCode) {
        return undefined;
    }
    if (errorCode.toLowerCase().includes('cancel')) {
        return VALUES.REASON.EXPO.CANCELED;
    }
    if (errorCode.toLowerCase().includes('not available')) {
        return VALUES.REASON.EXPO.NOT_SUPPORTED;
    }
    return VALUES.REASON.EXPO.GENERIC;
}

/**
 * Maps caught exceptions from the library to REASON values.
 */
function mapLibraryError(e: unknown): MultifactorAuthenticationReason | undefined {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.toLowerCase().includes('cancel')) {
        return VALUES.REASON.EXPO.CANCELED;
    }
    return undefined;
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

    // UP (0x01) | UV (0x04)
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

export {getKeyAlias, getSensorResult, mapAuthTypeNumber, mapSignErrorCode, mapLibraryError, buildSigningData};

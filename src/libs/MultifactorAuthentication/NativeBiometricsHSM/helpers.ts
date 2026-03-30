/**
 * Helper utilities for native biometrics HSM (react-native-biometrics).
 */
import type {BiometricSensorInfo} from '@sbaiahmed1/react-native-biometrics';
import {isSensorAvailable} from '@sbaiahmed1/react-native-biometrics';
import type {ValueOf} from 'type-fest';
import type {AuthTypeInfo, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/shared/types';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import CONST from '@src/CONST';
import NATIVE_BIOMETRICS_HSM_VALUES from './VALUES';

type SecureStoreAuthTypeEntry = ValueOf<typeof NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE>;

/**
 * Converts standard base64 to base64url encoding.
 */
function base64ToBase64url(b64: string): string {
    return b64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}

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
 * Maps biometryType string from isSensorAvailable to AuthTypeInfo (used during registration).
 */
const BIOMETRY_TYPE_MAP: Record<string, SecureStoreAuthTypeEntry> = {
    FaceID: NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.FACE_ID,
    TouchID: NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.TOUCH_ID,
    Biometrics: NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.BIOMETRICS,
    OpticID: NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.OPTIC_ID,
};

function mapBiometryTypeToAuthType(biometryType?: string, isDeviceSecure?: boolean): AuthTypeInfo | undefined {
    let entry = BIOMETRY_TYPE_MAP[biometryType ?? ''];
    if (!entry) {
        if (isDeviceSecure) {
            entry = NATIVE_BIOMETRICS_HSM_VALUES.AUTH_TYPE.CREDENTIALS;
        } else {
            return undefined;
        }
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

export {base64ToBase64url, getKeyAlias, getSensorResult, mapAuthTypeNumber, mapBiometryTypeToAuthType, mapSignErrorCode, mapLibraryError};

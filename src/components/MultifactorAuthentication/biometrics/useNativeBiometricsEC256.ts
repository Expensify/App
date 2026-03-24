import type {BiometricSensorInfo} from '@sbaiahmed1/react-native-biometrics';
import {createKeys, deleteKeys, getAllKeys, InputEncoding, isSensorAvailable, sha256, signWithOptions} from '@sbaiahmed1/react-native-biometrics';
import {Buffer} from 'buffer';
import {useCallback} from 'react';
import type {ValueOf} from 'type-fest';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/NativeBiometrics/KeyStore';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/NativeBiometrics/SecureStore';
import type {NativeBiometricsEC256KeyInfo} from '@libs/MultifactorAuthentication/NativeBiometrics/types';
import type {AuthTypeInfo, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/shared/types';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import CONST from '@src/CONST';
import Base64URL from '@src/utils/Base64URL';
import type {AuthorizeParams, AuthorizeResult, RegisterResult, UseBiometricsReturn} from './shared/types';
import useServerCredentials from './shared/useServerCredentials';

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
    return `${accountID}_${CONST.MULTIFACTOR_AUTHENTICATION.EC256_KEY_SUFFIX}`;
}

// Called once at module load. The MFA flow goes through multiple state machine steps
// (validate code → challenge → soft prompt) before doesDeviceSupportAuthenticationMethod()
// is checked, giving ample time for this to resolve.
let sensorResult: BiometricSensorInfo = {available: false};

isSensorAvailable()
    .then((result) => {
        sensorResult = result;
    })
    .catch(() => {
        // sensorResult stays { available: false }
    });

type SecureStoreAuthTypeEntry = ValueOf<typeof SECURE_STORE_VALUES.AUTH_TYPE>;

/**
 * Maps authType number from signWithOptions (with returnAuthType: true) to AuthTypeInfo.
 * Native layer returns: 1=DeviceCredentials, 3=FaceID, 4=TouchID, 5=OpticID
 */
const AUTH_TYPE_NUMBER_MAP = new Map<number, SecureStoreAuthTypeEntry>([
    [-1, SECURE_STORE_VALUES.AUTH_TYPE.UNKNOWN],
    [0, SECURE_STORE_VALUES.AUTH_TYPE.NONE],
    [1, SECURE_STORE_VALUES.AUTH_TYPE.CREDENTIALS],
    [2, SECURE_STORE_VALUES.AUTH_TYPE.BIOMETRICS],
    [3, SECURE_STORE_VALUES.AUTH_TYPE.FACE_ID],
    [4, SECURE_STORE_VALUES.AUTH_TYPE.TOUCH_ID],
    [5, SECURE_STORE_VALUES.AUTH_TYPE.OPTIC_ID],
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
    FaceID: SECURE_STORE_VALUES.AUTH_TYPE.FACE_ID,
    TouchID: SECURE_STORE_VALUES.AUTH_TYPE.TOUCH_ID,
    Biometrics: SECURE_STORE_VALUES.AUTH_TYPE.BIOMETRICS,
    OpticID: SECURE_STORE_VALUES.AUTH_TYPE.OPTIC_ID,
};

function mapBiometryTypeToAuthType(biometryType?: string, isDeviceSecure?: boolean): AuthTypeInfo | undefined {
    let entry = BIOMETRY_TYPE_MAP[biometryType ?? ''];
    if (!entry) {
        if (isDeviceSecure) {
            entry = SECURE_STORE_VALUES.AUTH_TYPE.CREDENTIALS;
        } else {
            return undefined;
        }
    }
    return {code: entry.CODE, name: entry.NAME, marqetaValue: entry.MARQETA_VALUE};
}

/**
 * Maps library errorCode strings to existing REASON values.
 * TODO: Investigate actual errorCode values from the library on both platforms.
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
 * Native biometrics hook using EC P-256 keys via react-native-biometrics.
 * All cryptographic operations happen in native code (Secure Enclave / Android Keystore).
 * Private keys never enter JS memory.
 */
function useNativeBiometricsEC256(): UseBiometricsReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const {translate} = useLocalize();
    const {serverKnownCredentialIDs, haveCredentialsEverBeenConfigured} = useServerCredentials();

    const doesDeviceSupportAuthenticationMethod = useCallback(() => {
        return sensorResult.isDeviceSecure ?? sensorResult.available;
    }, []);

    const getLocalCredentialID = useCallback(async () => {
        const keyAlias = getKeyAlias(accountID);
        const {keys} = await getAllKeys(keyAlias);
        const entry = keys.find((k) => k.alias === keyAlias);
        if (!entry) {
            return undefined;
        }
        return base64ToBase64url(entry.publicKey);
    }, [accountID]);

    const areLocalCredentialsKnownToServer = useCallback(async () => {
        const key = await getLocalCredentialID();
        return !!key && serverKnownCredentialIDs.includes(key);
    }, [getLocalCredentialID, serverKnownCredentialIDs]);

    const deleteLocalKeysForAccount = useCallback(async () => {
        const keyAlias = getKeyAlias(accountID);
        await deleteKeys(keyAlias);
        // Also clean up legacy ED25519 keys for migration
        await Promise.all([PrivateKeyStore.delete(accountID), PublicKeyStore.delete(accountID)]);
    }, [accountID]);

    const register = async (onResult: (result: RegisterResult) => Promise<void> | void, registrationChallenge: Parameters<UseBiometricsReturn['register']>[1]) => {
        try {
            const keyAlias = getKeyAlias(accountID);

            // createKeys with failIfExists=false auto-deletes existing key and recreates
            const {publicKey} = await createKeys(keyAlias, 'ec256', undefined, true, false);

            const credentialID = base64ToBase64url(publicKey);

            // Map biometryType from module-level cache to auth type
            const authType = mapBiometryTypeToAuthType(sensorResult.biometryType, sensorResult.isDeviceSecure);
            if (!authType) {
                onResult({success: false, reason: VALUES.REASON.GENERIC.BAD_REQUEST});
                return;
            }

            const clientDataJSON = JSON.stringify({challenge: registrationChallenge.challenge});
            const keyInfo: NativeBiometricsEC256KeyInfo = {
                rawId: credentialID,
                type: CONST.MULTIFACTOR_AUTHENTICATION.ED25519_TYPE,
                response: {
                    clientDataJSON: Base64URL.encode(clientDataJSON),
                    biometric: {
                        publicKey: credentialID,
                        algorithm: CONST.COSE_ALGORITHM.ES256,
                    },
                },
            };

            await onResult({
                success: true,
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.LOCAL_REGISTRATION_COMPLETE,
                keyInfo,
                authenticationMethod: authType,
            });
        } catch (e) {
            onResult({
                success: false,
                reason: mapLibraryError(e) ?? VALUES.REASON.KEYSTORE.UNABLE_TO_SAVE_KEY,
            });
        }
    };

    const authorize = async (params: AuthorizeParams, onResult: (result: AuthorizeResult) => Promise<void> | void) => {
        const {challenge} = params;

        try {
            const keyAlias = getKeyAlias(accountID);
            const credentialID = await getLocalCredentialID();
            const allowedIDs = challenge.allowCredentials?.map((c: {id: string; type: string}) => c.id) ?? [];

            if (!credentialID || !allowedIDs.includes(credentialID)) {
                onResult({success: false, reason: VALUES.REASON.KEYSTORE.REGISTRATION_REQUIRED});
                return;
            }

            // Build authenticatorData: rpIdHash(32B) || flags(1B) || signCount(4B)
            const {hash: rpIdHashB64} = await sha256(challenge.rpId);
            const rpIdHash = Buffer.from(rpIdHashB64, 'base64');

            const flags = Buffer.from([0x05]); // UP (0x01) | UV (0x04)
            const signCount = Buffer.alloc(4); // 4 zero bytes, big-endian

            const authenticatorData = Buffer.concat([rpIdHash, flags, signCount]);

            // Build dataToSign: authenticatorData || sha256(clientDataJSON)
            const clientDataJSON = JSON.stringify({challenge: challenge.challenge});
            const {hash: clientDataHashB64} = await sha256(clientDataJSON);
            const clientDataHash = Buffer.from(clientDataHashB64, 'base64');

            const dataToSign = Buffer.concat([authenticatorData, clientDataHash]);
            const dataToSignB64 = dataToSign.toString('base64');

            // Sign with biometric prompt — signWithOptions handles iOS/Android differences
            const signResult = await signWithOptions({
                keyAlias,
                data: dataToSignB64,
                inputEncoding: InputEncoding.Base64,
                promptTitle: translate('multifactorAuthentication.letsVerifyItsYou'),
                returnAuthType: true,
            });

            if (!signResult.success || !signResult.signature) {
                onResult({
                    success: false,
                    reason: mapSignErrorCode(signResult.errorCode) ?? VALUES.REASON.GENERIC.BAD_REQUEST,
                });
                return;
            }

            const authType = mapAuthTypeNumber(signResult.authType);
            if (!authType) {
                onResult({success: false, reason: VALUES.REASON.GENERIC.BAD_REQUEST});
                return;
            }

            await onResult({
                success: true,
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_SIGNED,
                signedChallenge: {
                    rawId: credentialID,
                    type: CONST.MULTIFACTOR_AUTHENTICATION.ED25519_TYPE,
                    response: {
                        authenticatorData: base64ToBase64url(authenticatorData.toString('base64')),
                        clientDataJSON: Base64URL.encode(clientDataJSON),
                        signature: base64ToBase64url(signResult.signature),
                    },
                },
                authenticationMethod: authType,
            });
        } catch (e) {
            onResult({
                success: false,
                reason: mapLibraryError(e) ?? VALUES.REASON.GENERIC.BAD_REQUEST,
            });
        }
    };

    const hasLocalCredentials = async () => !!(await getLocalCredentialID());

    return {
        deviceVerificationType: CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS,
        serverKnownCredentialIDs,
        haveCredentialsEverBeenConfigured,
        getLocalCredentialID,
        doesDeviceSupportAuthenticationMethod,
        hasLocalCredentials,
        areLocalCredentialsKnownToServer,
        register,
        authorize,
        deleteLocalKeysForAccount,
    };
}

export default useNativeBiometricsEC256;

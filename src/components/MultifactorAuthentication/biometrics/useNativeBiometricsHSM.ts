import {createKeys, deleteKeys, getAllKeys, InputEncoding, sha256, signWithOptions} from '@sbaiahmed1/react-native-biometrics';
import {Buffer} from 'buffer';
import {useCallback} from 'react';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {getKeyAlias, getSensorResult, mapAuthTypeNumber, mapLibraryError, mapSignErrorCode} from '@libs/MultifactorAuthentication/NativeBiometricsHSM/helpers';
import type {NativeBiometricsHSMKeyInfo} from '@libs/MultifactorAuthentication/NativeBiometricsHSM/types';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import CONST from '@src/CONST';
import Base64URL from '@src/utils/Base64URL';
import type {AuthorizeParams, AuthorizeResult, RegisterResult, UseBiometricsReturn} from './shared/types';
import useServerCredentials from './shared/useServerCredentials';

/**
 * Native biometrics hook using HSM-backed EC P-256 keys via react-native-biometrics.
 * All cryptographic operations happen in native code (Secure Enclave / Android Keystore).
 * Private keys never enter JS memory.
 */
function useNativeBiometricsHSM(): UseBiometricsReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const {translate} = useLocalize();
    const {serverKnownCredentialIDs, haveCredentialsEverBeenConfigured} = useServerCredentials();

    const doesDeviceSupportAuthenticationMethod = useCallback(() => {
        const sensorResult = getSensorResult();
        return sensorResult.isDeviceSecure ?? sensorResult.available;
    }, []);

    const getLocalCredentialID = useCallback(async () => {
        const keyAlias = getKeyAlias(accountID);
        const {keys} = await getAllKeys(keyAlias);
        const entry = keys.find((k) => k.alias === keyAlias);
        if (!entry) {
            return undefined;
        }
        return Base64URL.base64ToBase64url(entry.publicKey);
    }, [accountID]);

    const areLocalCredentialsKnownToServer = useCallback(async () => {
        const key = await getLocalCredentialID();
        return !!key && serverKnownCredentialIDs.includes(key);
    }, [getLocalCredentialID, serverKnownCredentialIDs]);

    const deleteLocalKeysForAccount = useCallback(async () => {
        const keyAlias = getKeyAlias(accountID);
        await deleteKeys(keyAlias);
    }, [accountID]);

    const register = async (onResult: (result: RegisterResult) => Promise<void> | void, registrationChallenge: Parameters<UseBiometricsReturn['register']>[1]) => {
        try {
            const keyAlias = getKeyAlias(accountID);

            /**
             * createKeys called with:
             * keyAlias - alias associated with the key stored on the device
             * keyType: 'ec256' - Elliptic Curve P-256 key
             * biometricStrength: undefined - currently ignored when allowDeviceCredentials is set to true
             * allowDeviceCredentials: true - allow device credentials fallback when biometrics are unavailable
             * failIfExists: false - overwrite any existing key for this alias to support re-registration
             */
            const {publicKey} = await createKeys(keyAlias, 'ec256', undefined, true, false);

            const credentialID = Base64URL.base64ToBase64url(publicKey);

            // TODO: Remove once the backend no longer requires a Marqeta auth method at registration.
            // No actual authentication happens during key creation, so this value is a placeholder.
            const authType = VALUES.AUTH_TYPE.CREDENTIALS;

            const clientDataJSON = JSON.stringify({challenge: registrationChallenge.challenge});
            const keyInfo: NativeBiometricsHSMKeyInfo = {
                rawId: credentialID,
                type: CONST.MULTIFACTOR_AUTHENTICATION.BIOMETRIC_HSM_TYPE,
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
                authenticationMethod: {code: authType.CODE, name: authType.NAME, marqetaValue: authType.MARQETA_VALUE},
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
            const allowedIDs = challenge.allowCredentials?.map((credential: {id: string; type: string}) => credential.id) ?? [];

            if (!credentialID || !allowedIDs.includes(credentialID)) {
                onResult({success: false, reason: VALUES.REASON.KEYSTORE.REGISTRATION_REQUIRED});
                return;
            }

            // Build authenticatorData: rpIdHash(32B) || flags(1B) || signCount(4B)
            const {hash: rpIdHashB64} = await sha256(challenge.rpId);
            const rpIdHash = Buffer.from(rpIdHashB64, 'base64');

            // UP (0x01) | UV (0x04)
            const flags = Buffer.from([0x05]);
            // 4 zero bytes, big-endian
            const signCount = Buffer.alloc(4);

            const authenticatorData = Buffer.concat([rpIdHash, flags, signCount]);

            // Build dataToSign: authenticatorData || sha256(clientDataJSON)
            const clientDataJSON = JSON.stringify({challenge: challenge.challenge});
            const {hash: clientDataHashB64} = await sha256(clientDataJSON);
            const clientDataHash = Buffer.from(clientDataHashB64, 'base64');

            const dataToSign = Buffer.concat([authenticatorData, clientDataHash]);
            const dataToSignB64 = dataToSign.toString('base64');

            // Sign with biometric prompt — signWithOptions
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
                    type: CONST.MULTIFACTOR_AUTHENTICATION.BIOMETRIC_HSM_TYPE,
                    response: {
                        authenticatorData: Base64URL.base64ToBase64url(authenticatorData.toString('base64')),
                        clientDataJSON: Base64URL.encode(clientDataJSON),
                        signature: Base64URL.base64ToBase64url(signResult.signature),
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
        deviceVerificationType: CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRIC_HSM,
        serverKnownCredentialIDs,
        haveCredentialsEverBeenConfigured,
        getLocalCredentialID,
        doesDeviceSupportAuthenticationMethod,
        deviceCheckFailureReason: VALUES.REASON.GENERIC.NO_AUTHENTICATION_METHODS_ENROLLED,
        hasLocalCredentials,
        areLocalCredentialsKnownToServer,
        register,
        authorize,
        deleteLocalKeysForAccount,
    };
}

export default useNativeBiometricsHSM;

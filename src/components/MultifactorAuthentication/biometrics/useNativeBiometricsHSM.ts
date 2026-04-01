import {createKeys, deleteKeys, getAllKeys, InputEncoding, isSensorAvailable, signWithOptions} from '@sbaiahmed1/react-native-biometrics';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {buildSigningData, getKeyAlias, mapAuthTypeNumber, mapLibraryErrorToReason, mapSignErrorCodeToReason} from '@libs/MultifactorAuthentication/NativeBiometricsHSM/helpers';
import type NativeBiometricsHSMKeyInfo from '@libs/MultifactorAuthentication/NativeBiometricsHSM/types';
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

    const doesDeviceSupportAuthenticationMethod = async () => {
        const sensorResult = await isSensorAvailable();
        return sensorResult.isDeviceSecure ?? sensorResult.available;
    };

    const getLocalCredentialID = async () => {
        try {
            const keyAlias = getKeyAlias(accountID);
            const {keys} = await getAllKeys(keyAlias);
            const entry = keys.find((key) => key.alias === keyAlias);
            if (!entry) {
                return undefined;
            }
            return Base64URL.base64ToBase64url(entry.publicKey);
        } catch (error) {
            addMFABreadcrumb('Failed to get local credential ID', {reason: mapLibraryErrorToReason(error) ?? VALUES.REASON.HSM.GENERIC}, 'error');
            return undefined;
        }
    };

    const areLocalCredentialsKnownToServer = async () => {
        const key = await getLocalCredentialID();
        return !!key && serverKnownCredentialIDs.includes(key);
    };

    const deleteLocalKeysForAccount = async () => {
        try {
            const keyAlias = getKeyAlias(accountID);
            await deleteKeys(keyAlias);
        } catch (error) {
            addMFABreadcrumb('Failed to delete local keys', {reason: mapLibraryErrorToReason(error) ?? VALUES.REASON.HSM.GENERIC}, 'error');
        }
    };

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
            });
        } catch (error) {
            onResult({
                success: false,
                reason: mapLibraryErrorToReason(error) ?? VALUES.REASON.HSM.KEY_CREATION_FAILED,
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
                await deleteLocalKeysForAccount();
                onResult({success: false, reason: VALUES.REASON.HSM.KEY_NOT_FOUND});
                return;
            }

            const {authenticatorData, clientDataJSON, dataToSignB64} = await buildSigningData(challenge.rpId, challenge.challenge);

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
                    reason: mapSignErrorCodeToReason(signResult.errorCode) ?? VALUES.REASON.HSM.GENERIC,
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
        } catch (error) {
            onResult({
                success: false,
                reason: mapLibraryErrorToReason(error) ?? VALUES.REASON.HSM.GENERIC,
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

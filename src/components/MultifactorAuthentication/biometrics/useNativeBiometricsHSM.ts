import {createKeys, deleteKeys, getAllKeys, InputEncoding, isSensorAvailable, signWithOptions} from '@sbaiahmed1/react-native-biometrics';
import type {SignatureResult} from '@sbaiahmed1/react-native-biometrics';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import {getErrorMessage} from '@libs/ErrorUtils';
import {buildSigningData, getKeyAlias, mapAuthTypeNumber, mapLibraryErrorToReason, mapSignErrorCodeToReason} from '@libs/MultifactorAuthentication/NativeBiometricsHSM/helpers';
import type NativeBiometricsHSMKeyInfo from '@libs/MultifactorAuthentication/NativeBiometricsHSM/types';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import CONST from '@src/CONST';
import Base64URL from '@src/utils/Base64URL';
import type {AuthorizeParams, AuthorizeResult, RegisterResult, UseBiometricsReturn} from './shared/types';
import useServerCredentials from './shared/useServerCredentials';

/**
 * UTILS START
 * These utils were added to comply with react compiler requirements:
 * "Error: Support value blocks (conditional, logical, optional chaining, etc) within a try/catch statement"
 */
function isCredentialAllowed(credentialID: string | undefined, allowedIDs: string[]): credentialID is string {
    return !!credentialID && allowedIDs.includes(credentialID);
}

function hasValidSignature(signResult: SignatureResult): signResult is SignatureResult & {signature: string} {
    return signResult.success && !!signResult.signature;
}
/**
 * UTILS END
 */

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
        return sensorResult.isDeviceSecure;
    };

    const getLocalCredentialID = async () => {
        try {
            const keyAlias = getKeyAlias(accountID);
            const {keys} = await getAllKeys(keyAlias);
            const entry = keys.at(0);
            if (!entry) {
                return undefined;
            }
            return Base64URL.base64ToBase64url(entry.publicKey);
        } catch (error) {
            let reason = mapLibraryErrorToReason(error);
            if (reason === undefined) {
                reason = VALUES.REASON.HSM.GENERIC;
            }
            const errorMessage = getErrorMessage(error);
            addMFABreadcrumb('Failed to get local credential ID', {reason, message: errorMessage}, 'error');
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
            let reason = mapLibraryErrorToReason(error);
            if (reason === undefined) {
                reason = VALUES.REASON.HSM.GENERIC;
            }
            const errorMessage = getErrorMessage(error);
            addMFABreadcrumb('Failed to delete local keys', {reason, message: errorMessage}, 'error');
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
                type: CONST.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_HSM_TYPE,
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
            let reason = mapLibraryErrorToReason(error);
            if (reason === undefined) {
                reason = VALUES.REASON.HSM.KEY_CREATION_FAILED;
            }
            onResult({
                success: false,
                reason,
                message: getErrorMessage(error),
            });
        }
    };

    const authorize = async (params: AuthorizeParams, onResult: (result: AuthorizeResult) => Promise<void> | void) => {
        const {challenge} = params;

        try {
            const keyAlias = getKeyAlias(accountID);
            const credentialID = await getLocalCredentialID();
            const allowedIDs = challenge.allowCredentials.map((credential: {id: string; type: string}) => credential.id);

            if (!isCredentialAllowed(credentialID, allowedIDs)) {
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
                promptSubtitle: '',
                returnAuthType: true,
            });

            if (!hasValidSignature(signResult)) {
                let failReason = mapSignErrorCodeToReason(signResult.errorCode);
                if (failReason === undefined) {
                    failReason = VALUES.REASON.HSM.GENERIC;
                }
                onResult({
                    success: false,
                    reason: failReason,
                    message: failReason === VALUES.REASON.HSM.GENERIC ? signResult.errorCode : undefined,
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
                    type: CONST.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_HSM_TYPE,
                    response: {
                        authenticatorData: Base64URL.base64ToBase64url(authenticatorData.toString('base64')),
                        clientDataJSON: Base64URL.encode(clientDataJSON),
                        signature: Base64URL.base64ToBase64url(signResult.signature),
                    },
                },
                authenticationMethod: authType,
            });
        } catch (error) {
            let reason = mapLibraryErrorToReason(error);
            if (reason === undefined) {
                reason = VALUES.REASON.HSM.GENERIC;
            }
            onResult({
                success: false,
                reason,
                message: getErrorMessage(error),
            });
        }
    };

    const hasLocalCredentials = async () => !!(await getLocalCredentialID());

    return {
        deviceVerificationType: CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM,
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

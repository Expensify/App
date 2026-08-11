import type {CreateCredentialParams, CreateCredentialResult} from '@components/MultifactorAuthentication/biometrics/shared/types';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';

import {decodeLibraryError, getKeyAlias} from '@libs/MultifactorAuthentication/NativeBiometricsHSM/helpers';
import type NativeBiometricsHSMKeyInfo from '@libs/MultifactorAuthentication/NativeBiometricsHSM/types';
import readOnyxValueOnce from '@libs/MultifactorAuthentication/shared/readOnyxValueOnce';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Base64URL from '@src/utils/Base64URL';

import {createKeys, getAllKeys, isSensorAvailable} from '@sbaiahmed1/react-native-biometrics';
import {mfaCredentialIDsSelector} from '@selectors/Account';

/**
 * Platform-resolved biometric operations for the MFA machine's pre-screen checks and the
 * credential-creation ceremony. These functions read no React state, so the machine actors and
 * other non-React callers can import them directly.
 */

/** The authentication method this platform verifies with. Native verifies with HSM-backed biometrics. */
const deviceVerificationType = CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM;

/** The failure reason to report when this platform cannot run the verification method. */
const deviceCheckFailureReason = CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.NO_AUTHENTICATION_METHODS_ENROLLED;

/** Resolves to whether this device has an enrolled, secured biometric sensor. */
async function doesDeviceSupportAuthenticationMethod(): Promise<boolean> {
    const sensorResult = await isSensorAvailable();
    return sensorResult.isDeviceSecure;
}

/** Resolves to the account's HSM-backed credential ID, or undefined when no key exists or the keystore read fails. */
async function getLocalCredentialID(accountID: number): Promise<string | undefined> {
    try {
        const {keys} = await getAllKeys(getKeyAlias(accountID));
        const entry = keys.at(0);
        if (!entry) {
            return undefined;
        }
        return Base64URL.base64ToBase64url(entry.publicKey);
    } catch (error) {
        addMFABreadcrumb('Failed to get local credential ID', decodeLibraryError(error), 'error');
        return undefined;
    }
}

/**
 * Resolves to whether the account has a local HSM key the server also knows, meaning it can skip registration.
 *
 * This is the canonical non-React implementation. The legacy `useNativeBiometricsHSM` hook
 * intentionally performs the same comparison using its reactive Onyx values. Keep both
 * implementations aligned until the hook is removed.
 */
async function areLocalCredentialsKnownToServer(accountID: number, signal?: AbortSignal): Promise<boolean> {
    const localCredentialID = await getLocalCredentialID(accountID);
    if (!localCredentialID) {
        return false;
    }
    const account = await readOnyxValueOnce(ONYXKEYS.ACCOUNT, signal);
    return (mfaCredentialIDsSelector(account) ?? []).includes(localCredentialID);
}

/** Runs the platform HSM key-creation ceremony. */
async function createCredential(params: CreateCredentialParams): Promise<CreateCredentialResult> {
    const {accountID, registrationChallenge} = params;
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

        return {success: true, keyInfo};
    } catch (error) {
        return {success: false, error: decodeLibraryError(error)};
    }
}

export {areLocalCredentialsKnownToServer, createCredential, deviceVerificationType, deviceCheckFailureReason, doesDeviceSupportAuthenticationMethod};

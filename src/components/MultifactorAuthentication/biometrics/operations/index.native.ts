import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';

import {decodeLibraryError, getKeyAlias} from '@libs/MultifactorAuthentication/NativeBiometricsHSM/helpers';
import waitForAccountDataReady from '@libs/MultifactorAuthentication/shared/waitForAccountDataReady';
import {readOnyxValueOnce} from '@libs/MultifactorAuthentication/shared/waitForOnyxValue';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Base64URL from '@src/utils/Base64URL';

import {getAllKeys, isSensorAvailable} from '@sbaiahmed1/react-native-biometrics';
import {mfaCredentialIDsSelector} from '@selectors/Account';

/**
 * Platform-resolved biometric operations for the MFA machine's pre-screen checks. These functions
 * read no React state, so the machine actors and other non-React callers can import them directly.
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
    await waitForAccountDataReady(signal);
    const account = await readOnyxValueOnce(ONYXKEYS.ACCOUNT, signal);
    return (mfaCredentialIDsSelector(account) ?? []).includes(localCredentialID);
}

export {areLocalCredentialsKnownToServer, deviceVerificationType, deviceCheckFailureReason, doesDeviceSupportAuthenticationMethod};

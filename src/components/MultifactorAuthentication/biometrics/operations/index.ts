import {isWebAuthnSupported} from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';
import waitForAccountDataReady from '@libs/MultifactorAuthentication/shared/waitForAccountDataReady';
import {readOnyxValueOnce} from '@libs/MultifactorAuthentication/shared/waitForOnyxValue';

import {getPasskeyOnyxKey} from '@userActions/Passkey';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {mfaCredentialIDsSelector} from '@selectors/Account';

/**
 * Platform-resolved biometric operations for the MFA machine's pre-screen checks. These functions
 * read no React state, so the machine actors and other non-React callers can import them directly.
 */

/** The authentication method this platform verifies with. Web verifies with passkeys. */
const deviceVerificationType = CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS;

/** The failure reason to report when this platform cannot run the verification method. */
const deviceCheckFailureReason = CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED;

/** Resolves to whether this browser can perform the passkey ceremony. */
async function doesDeviceSupportAuthenticationMethod(): Promise<boolean> {
    return isWebAuthnSupported();
}

/**
 * Resolves to whether the account has a local passkey the server also knows, meaning it can skip registration.
 *
 * This is the canonical non-React implementation. The legacy `usePasskeys` hook intentionally
 * performs the same comparison using its reactive Onyx values. Keep both implementations aligned
 * until the hook is removed.
 */
async function areLocalCredentialsKnownToServer(accountID: number, signal?: AbortSignal): Promise<boolean> {
    const localPasskeyCredentials = await readOnyxValueOnce(getPasskeyOnyxKey(String(accountID)), signal);
    if (!localPasskeyCredentials?.length) {
        return false;
    }
    await waitForAccountDataReady(signal);
    const account = await readOnyxValueOnce(ONYXKEYS.ACCOUNT, signal);
    const serverKnownCredentialIDs = new Set(mfaCredentialIDsSelector(account) ?? []);
    return localPasskeyCredentials.some((credential) => serverKnownCredentialIDs.has(credential.id));
}

export {areLocalCredentialsKnownToServer, deviceVerificationType, deviceCheckFailureReason, doesDeviceSupportAuthenticationMethod};

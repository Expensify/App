import type {CreateCredentialParams, CreateCredentialResult} from '@components/MultifactorAuthentication/biometrics/shared/types';

import {isWebAuthnSupported} from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';
import readOnyxValueOnce from '@libs/MultifactorAuthentication/shared/readOnyxValueOnce';

import {getPasskeyOnyxKey} from '@userActions/Passkey';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {mfaCredentialIDsSelector} from '@selectors/Account';

/**
 * Platform-resolved biometric operations for the MFA machine's pre-screen checks and credential
 * creation ceremony. These functions read no React state, so the machine actors and other
 * non-React callers can import them directly.
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
    const [account, localPasskeyCredentials] = await Promise.all([readOnyxValueOnce(ONYXKEYS.ACCOUNT, signal), readOnyxValueOnce(getPasskeyOnyxKey(String(accountID)), signal)]);
    const serverKnownCredentialIDs = new Set(mfaCredentialIDsSelector(account) ?? []);
    return (localPasskeyCredentials ?? []).some((credential) => serverKnownCredentialIDs.has(credential.id));
}

/** Runs the platform passkey ceremony and persists the resulting credential locally. */
async function createCredential(params: CreateCredentialParams): Promise<CreateCredentialResult> {
    throw new Error('Not implemented');
}

export {areLocalCredentialsKnownToServer, createCredential, deviceVerificationType, deviceCheckFailureReason, doesDeviceSupportAuthenticationMethod};

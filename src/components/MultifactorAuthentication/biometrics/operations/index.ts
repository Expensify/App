import type {AuthorizeOperationParams, AuthorizeOperationResult, CreateCredentialParams, CreateCredentialResult} from '@components/MultifactorAuthentication/biometrics/shared/types';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';

import {getErrorMessage} from '@libs/ErrorUtils';
import {
    arrayBufferToBase64URL,
    authenticateWithPasskey,
    buildAllowedCredentialDescriptors,
    buildPublicKeyCredentialCreationOptions,
    buildPublicKeyCredentialRequestOptions,
    createPasskeyCredential,
    decodeWebAuthnError,
    extractAAGUID,
    isSupportedTransport,
    isWebAuthnSupported,
    PASSKEY_AUTH_TYPE,
} from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';
import {createCanceledMFAResult, createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import readOnyxValueOnce from '@libs/MultifactorAuthentication/shared/readOnyxValueOnce';

import {addLocalPasskeyCredential, deleteLocalPasskeyCredentials, getPasskeyOnyxKey, reconcileLocalPasskeysWithBackend} from '@userActions/Passkey';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {mfaCredentialIDsSelector} from '@selectors/Account';

/**
 * Platform-resolved biometric operations for the MFA machine's pre-screen checks and the
 * credential-creation ceremony. These functions read no React state, so the machine actors and
 * other non-React callers can import them directly.
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
    const {accountID, registrationChallenge, signal} = params;
    const userId = String(accountID);
    const [account, localPasskeyCredentials] = await Promise.all([readOnyxValueOnce(ONYXKEYS.ACCOUNT, signal), readOnyxValueOnce(getPasskeyOnyxKey(userId), signal)]);

    const backendCredentials = (mfaCredentialIDsSelector(account) ?? []).map((id) => ({id, type: CONST.PASSKEY_CREDENTIAL_TYPE}));
    const reconciledExisting = reconcileLocalPasskeysWithBackend({userId, backendCredentials, localCredentials: localPasskeyCredentials ?? null});
    const publicKeyOptions = buildPublicKeyCredentialCreationOptions(registrationChallenge, reconciledExisting);

    let credential: PublicKeyCredential;
    try {
        // Cancelling the flow (CLOSE_MODAL) aborts `signal`, which closes the passkey dialog — the
        // rejection below then gets handled like any other refusal.
        credential = await createPasskeyCredential(publicKeyOptions, signal);
    } catch (error) {
        return {success: false, error: decodeWebAuthnError(error)};
    }

    if (!(credential.response instanceof AuthenticatorAttestationResponse)) {
        return {
            success: false,
            error: createLocalMFAError(
                CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WEBAUTHN.UNEXPECTED_RESPONSE,
                'Registration credential response is not AuthenticatorAttestationResponse',
            ),
        };
    }
    const attestationResponse = credential.response;
    const credentialId = arrayBufferToBase64URL(credential.rawId);
    const clientDataJSON = arrayBufferToBase64URL(attestationResponse.clientDataJSON);
    const attestationObject = arrayBufferToBase64URL(attestationResponse.attestationObject);

    const transports = attestationResponse.getTransports?.().filter(isSupportedTransport);

    // getAuthenticatorData() is a WebAuthn Level 2 method — not available in older browsers.
    // NOTE: A value of "00000000-0000-0000-0000-000000000000" is expected for Apple iCloud Keychain
    const aaguid = attestationResponse.getAuthenticatorData ? extractAAGUID(attestationResponse.getAuthenticatorData()) : undefined;

    // Not every browser honors `signal` on create(), so the ceremony can still succeed after the flow
    // was cancelled. Don't persist or register a credential nobody asked for anymore — the passkey
    // itself is already on the device either way, that part can't be undone.
    if (signal.aborted) {
        return createCanceledMFAResult('MFA flow canceled before the credential could be persisted');
    }

    try {
        // Reconciled list, not the stale pre-reconciliation read — reconciliation may have already
        // dropped a duplicate id, and checking the stale list would throw for a credential that's
        // no longer there.
        await addLocalPasskeyCredential({
            userId,
            credential: {id: credentialId, type: CONST.PASSKEY_CREDENTIAL_TYPE, transports, aaguid},
            existingCredentials: reconciledExisting,
        });
    } catch (error) {
        // `addLocalPasskeyCredential` validates the user ID and rejects duplicate
        // credential IDs before updating Onyx. Don't continue with backend
        // registration when that local validation fails.
        addMFABreadcrumb('Failed to update local passkey credentials', {message: getErrorMessage(error)}, 'error');
        return {
            success: false,
            error: createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.LOCAL_CREDENTIAL_UPDATE_FAILED, getErrorMessage(error)),
        };
    }

    return {
        success: true,
        keyInfo: {
            rawId: credentialId,
            type: CONST.PASSKEY_CREDENTIAL_TYPE,
            transports,
            aaguid,
            response: {clientDataJSON, attestationObject},
        },
    };
}

/**
 * Runs the platform passkey authorization ceremony. No local-credential clearing happens in here on a
 * reconciliation miss — that is the authorization actor's decision, not the ceremony's; this only
 * reports `NO_MATCHING_LOCAL_CREDENTIAL`.
 */
async function authorize(params: AuthorizeOperationParams): Promise<AuthorizeOperationResult> {
    const {accountID, challenge, signal} = params;
    const userId = String(accountID);
    let localPasskeyCredentials;
    try {
        localPasskeyCredentials = await readOnyxValueOnce(getPasskeyOnyxKey(userId), signal);
    } catch (error) {
        if (signal.aborted) {
            return createCanceledMFAResult('MFA flow canceled while reading local passkey credentials');
        }
        throw error;
    }

    // Keep authorization reconciliation pure. On a full miss the actor owns the cancellation-aware
    // credential cleanup after this operation reports NO_MATCHING_LOCAL_CREDENTIAL.
    const allowedCredentialIDs = new Set(challenge.allowCredentials.map((credential) => credential.id));
    const reconciledExisting = (localPasskeyCredentials ?? []).filter((credential) => allowedCredentialIDs.has(credential.id));

    if (reconciledExisting.length === 0) {
        return {
            success: false,
            error: createLocalMFAError(
                CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WEBAUTHN.NO_MATCHING_LOCAL_CREDENTIAL,
                'No local passkey credentials match challenge allowCredentials',
            ),
        };
    }

    const allowCredentials = buildAllowedCredentialDescriptors(reconciledExisting);
    const publicKeyOptions = buildPublicKeyCredentialRequestOptions(challenge, allowCredentials);

    let assertion: PublicKeyCredential;
    try {
        // Cancelling the flow (CLOSE_MODAL) aborts `signal`, which closes the passkey dialog — the
        // rejection below then gets handled like any other refusal.
        assertion = await authenticateWithPasskey(publicKeyOptions, signal);
    } catch (error) {
        return {success: false, error: decodeWebAuthnError(error)};
    }

    if (!(assertion.response instanceof AuthenticatorAssertionResponse)) {
        return {
            success: false,
            error: createLocalMFAError(
                CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.WEBAUTHN.UNEXPECTED_RESPONSE,
                'Authentication assertion response is not AuthenticatorAssertionResponse',
            ),
        };
    }
    const assertionResponse = assertion.response;

    return {
        success: true,
        signedChallenge: {
            rawId: arrayBufferToBase64URL(assertion.rawId),
            type: CONST.PASSKEY_CREDENTIAL_TYPE,
            response: {
                authenticatorData: arrayBufferToBase64URL(assertionResponse.authenticatorData),
                clientDataJSON: arrayBufferToBase64URL(assertionResponse.clientDataJSON),
                signature: arrayBufferToBase64URL(assertionResponse.signature),
            },
        },
        authenticationMethod: {name: PASSKEY_AUTH_TYPE.NAME, marqetaValue: PASSKEY_AUTH_TYPE.MARQETA_VALUE},
    };
}

/** Clears the account's local passkey list and resolves once the Onyx write finishes. */
async function deleteLocalCredentials(accountID: number, signal?: AbortSignal): Promise<void> {
    if (signal?.aborted) {
        return;
    }
    await deleteLocalPasskeyCredentials(String(accountID));
}

export {areLocalCredentialsKnownToServer, authorize, createCredential, deleteLocalCredentials, deviceVerificationType, deviceCheckFailureReason, doesDeviceSupportAuthenticationMethod};

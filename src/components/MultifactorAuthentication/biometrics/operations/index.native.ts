import type {AuthorizeOperationParams, AuthorizeOperationResult, CreateCredentialParams, CreateCredentialResult} from '@components/MultifactorAuthentication/biometrics/shared/types';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';

import {translateLocal} from '@libs/Localize';
import {buildSigningData, decodeLibraryError, getKeyAlias, mapAuthTypeNumber, mapSignErrorCodeToReason} from '@libs/MultifactorAuthentication/NativeBiometricsHSM/helpers';
import type NativeBiometricsHSMKeyInfo from '@libs/MultifactorAuthentication/NativeBiometricsHSM/types';
import type {MFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import {createCanceledMFAResult, createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import readOnyxValueOnce from '@libs/MultifactorAuthentication/shared/readOnyxValueOnce';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Base64URL from '@src/utils/Base64URL';

import {createKeys, deleteKeys, getAllKeys, InputEncoding, isSensorAvailable, signWithOptions} from '@sbaiahmed1/react-native-biometrics';
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

const credentialMutationTails = new Map<number, Promise<unknown>>();

/**
 * Serializes same-account HSM writes so an in-flight stale delete cannot remove a replacement key.
 * Only the writes belong here: the authorization ceremony neither creates nor destroys the key, so
 * queueing it would hold the biometric prompt behind a keystore write without changing its outcome.
 */
async function serializeCredentialMutation<T>(accountID: number, mutation: () => Promise<T>): Promise<T> {
    const previousMutation = credentialMutationTails.get(accountID) ?? Promise.resolve();
    const currentMutation = previousMutation.catch(() => undefined).then(mutation);
    credentialMutationTails.set(accountID, currentMutation);

    try {
        return await currentMutation;
    } finally {
        if (credentialMutationTails.get(accountID) === currentMutation) {
            credentialMutationTails.delete(accountID);
        }
    }
}

/** Resolves to whether this device has an enrolled, secured biometric sensor. */
async function doesDeviceSupportAuthenticationMethod(): Promise<boolean> {
    const sensorResult = await isSensorAvailable();
    return sensorResult.isDeviceSecure;
}

/**
 * Outcome of reading the account's HSM-backed credential. `readFailed` stays distinct from `absent`
 * because an unreadable keystore may recover on the next attempt, while a confirmed absence cannot:
 * only the latter means the credential is unusable and may be deleted or re-registered.
 */
type LocalCredentialLookup = {status: 'found'; credentialID: string} | {status: 'absent'} | {status: 'readFailed'; error: MFAError};

/** Reads the account's HSM-backed credential, separating a confirmed absence from an unreadable keystore. */
async function getLocalCredential(accountID: number): Promise<LocalCredentialLookup> {
    try {
        const {keys} = await getAllKeys(getKeyAlias(accountID));
        const entry = keys.at(0);
        if (!entry) {
            return {status: 'absent'};
        }
        return {status: 'found', credentialID: Base64URL.base64ToBase64url(entry.publicKey)};
    } catch (error) {
        const readError = decodeLibraryError(error);
        addMFABreadcrumb('Failed to get local credential ID', readError, 'error');
        // The library rejects with KEY_NOT_FOUND rather than returning an empty key list when the
        // alias does not exist. That is a confirmed absence, so it has to keep routing a first-time
        // device into registration instead of being reported as a read failure.
        if (readError.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.KEY_NOT_FOUND) {
            return {status: 'absent'};
        }
        return {status: 'readFailed', error: readError};
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
    const localCredential = await getLocalCredential(accountID);
    // A read failure still answers "no", which sends the flow to registration. This check returns a
    // plain boolean, so it has no way to fail the flow instead; the recovery slice owns that.
    if (localCredential.status !== 'found') {
        return false;
    }
    const account = await readOnyxValueOnce(ONYXKEYS.ACCOUNT, signal);
    return (mfaCredentialIDsSelector(account) ?? []).includes(localCredential.credentialID);
}

/** Runs the platform HSM key-creation ceremony. */
async function createCredential(params: CreateCredentialParams): Promise<CreateCredentialResult> {
    const {accountID, registrationChallenge, signal} = params;
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
        const keyResult = await serializeCredentialMutation(accountID, async () => {
            if (signal.aborted) {
                return undefined;
            }
            return createKeys(keyAlias, 'ec256', undefined, true, false);
        });
        if (!keyResult) {
            return createCanceledMFAResult('MFA flow canceled before HSM key creation');
        }
        const {publicKey} = keyResult;

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

/**
 * Runs the platform HSM authorization ceremony: signs the authentication challenge with the
 * account's biometric-backed key. `signal` is checked twice: right before `signWithOptions` opens the
 * prompt (catching a cancellation during the credential lookup or signing-data build above), and once
 * the ceremony resolves (catching one that lands while the prompt itself is open — the native prompt
 * cannot be dismissed once started, so that case is only caught after the fact).
 */
async function authorize(params: AuthorizeOperationParams): Promise<AuthorizeOperationResult> {
    const {accountID, challenge, signal} = params;
    const keyAlias = getKeyAlias(accountID);
    const localCredential = await getLocalCredential(accountID);
    const allowedIDs = challenge.allowCredentials.map((credential) => credential.id);

    // A keystore the device could not read is reported as-is, so the caller does not delete a key
    // that may well still be usable. Only a confirmed absence or a mismatch marks it unusable.
    if (localCredential.status === 'readFailed') {
        return {success: false, error: localCredential.error};
    }

    if (localCredential.status === 'absent') {
        return {success: false, error: createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.KEY_NOT_FOUND, 'No local HSM credential for this account')};
    }

    const {credentialID} = localCredential;
    if (!allowedIDs.includes(credentialID)) {
        return {
            success: false,
            error: createLocalMFAError(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.NO_MATCHING_LOCAL_CREDENTIAL, 'Local HSM credential not in challenge allowCredentials'),
        };
    }

    try {
        const {authenticatorData, clientDataJSON, dataToSignB64} = await buildSigningData(challenge.rpId, challenge.challenge);

        // The flow may have been cancelled while the credential lookup or signing-data build above
        // were still in flight. Check right before opening the prompt — once `signWithOptions` is
        // called there is no way to dismiss it, so this is the last point to skip it.
        if (signal.aborted) {
            return createCanceledMFAResult('MFA flow canceled before the biometric prompt could open');
        }

        const signResult = await signWithOptions({
            keyAlias,
            data: dataToSignB64,
            inputEncoding: InputEncoding.Base64,
            // This operation is a plain function invoked from the machine actor, not a component or
            // hook, so `useLocalize` is not available here.
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            promptTitle: translateLocal('multifactorAuthentication.letsVerifyItsYou'),
            promptSubtitle: '',
            returnAuthType: true,
        });

        if (signal.aborted) {
            return createCanceledMFAResult('MFA flow canceled after the biometric ceremony completed');
        }

        if (!signResult.success || !signResult.signature) {
            const failReason = mapSignErrorCodeToReason(signResult.errorCode) ?? CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.UNRECOGNIZED;
            return {success: false, error: createLocalMFAError(failReason, `Error Code: ${signResult.errorCode}`)};
        }

        const authenticationMethod = mapAuthTypeNumber(signResult.authType);
        if (!authenticationMethod) {
            return {
                success: false,
                error: createLocalMFAError(
                    CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.UNRECOGNIZED_AUTH_TYPE,
                    `Unrecognized auth type from HSM sign result: ${signResult.authType}`,
                ),
            };
        }

        return {
            success: true,
            signedChallenge: {
                rawId: credentialID,
                type: CONST.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_HSM_TYPE,
                response: {
                    authenticatorData: Base64URL.base64ToBase64url(authenticatorData.toString('base64')),
                    clientDataJSON: Base64URL.encode(clientDataJSON),
                    signature: Base64URL.base64ToBase64url(signResult.signature),
                },
            },
            authenticationMethod,
        };
    } catch (error) {
        return {success: false, error: decodeLibraryError(error)};
    }
}

/** Deletes the account's HSM key unless the flow was canceled before this write starts. */
async function deleteLocalCredentials(accountID: number, signal?: AbortSignal): Promise<void> {
    await serializeCredentialMutation(accountID, async () => {
        if (signal?.aborted) {
            return;
        }
        try {
            await deleteKeys(getKeyAlias(accountID));
        } catch (error) {
            addMFABreadcrumb('Failed to delete local keys', decodeLibraryError(error), 'error');
        }
    });
}

export {areLocalCredentialsKnownToServer, authorize, createCredential, deleteLocalCredentials, deviceVerificationType, deviceCheckFailureReason, doesDeviceSupportAuthenticationMethod};

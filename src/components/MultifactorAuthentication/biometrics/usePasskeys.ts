import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {
    arrayBufferToBase64URL,
    authenticateWithPasskey,
    buildAllowedCredentialDescriptors,
    buildPublicKeyCredentialRequestOptions,
    decodeWebAuthnError,
    PASSKEY_AUTH_TYPE,
} from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';
import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

import {deleteLocalPasskeyCredentials, getPasskeyOnyxKey, reconcileLocalPasskeysWithBackend} from '@userActions/Passkey';

import CONST from '@src/CONST';

import type {AuthorizeParams, AuthorizeResult, UseBiometricsReturn} from './shared/types';

import useServerCredentials from './shared/useServerCredentials';

function usePasskeys(): UseBiometricsReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const userId = String(accountID);
    const {serverKnownCredentialIDs, haveCredentialsEverBeenConfigured} = useServerCredentials();
    const [localPasskeyCredentials] = useOnyx(getPasskeyOnyxKey(userId));

    const getLocalCredentialID = async (): Promise<string | undefined> => {
        return (localPasskeyCredentials ?? []).at(0)?.id;
    };

    const hasLocalCredentials = async () => (localPasskeyCredentials?.length ?? 0) > 0;

    /**
     * Legacy compatibility path. The MFA machine uses the platform-resolved biometrics operation,
     * while this hook keeps using reactive Onyx values for existing React consumers. Keep this
     * comparison aligned with `operations/index.ts` until the hook is removed.
     */
    const areLocalCredentialsKnownToServer = async () => {
        const serverSet = new Set(serverKnownCredentialIDs);
        return (localPasskeyCredentials ?? []).some((c) => serverSet.has(c.id));
    };

    const deleteLocalKeysForAccount = async () => {
        deleteLocalPasskeyCredentials(userId);
    };

    const authorize = async (params: AuthorizeParams, onResult: (result: AuthorizeResult) => Promise<void> | void) => {
        const {challenge} = params;

        const backendCredentials = challenge.allowCredentials?.map((c) => ({id: c.id, type: CONST.PASSKEY_CREDENTIAL_TYPE})) ?? [];
        const reconciled = reconcileLocalPasskeysWithBackend({
            userId,
            backendCredentials,
            localCredentials: localPasskeyCredentials ?? null,
        });

        if (reconciled.length === 0) {
            await deleteLocalKeysForAccount();
            await onResult({
                success: false,
                error: createLocalMFAError(
                    VALUES.REASON.LOCAL_ERRORS.WEBAUTHN.NO_MATCHING_LOCAL_CREDENTIAL,
                    'No local passkey credentials match challenge allowCredentials, credentials cleared',
                ),
            });
            return;
        }

        const allowCredentials = buildAllowedCredentialDescriptors(reconciled);
        const publicKeyOptions = buildPublicKeyCredentialRequestOptions(challenge, allowCredentials);

        let assertion: PublicKeyCredential;
        try {
            assertion = await authenticateWithPasskey(publicKeyOptions);
        } catch (error) {
            await onResult({
                success: false,
                error: decodeWebAuthnError(error),
            });
            return;
        }

        if (!(assertion.response instanceof AuthenticatorAssertionResponse)) {
            await onResult({
                success: false,
                error: createLocalMFAError(VALUES.REASON.LOCAL_ERRORS.WEBAUTHN.UNEXPECTED_RESPONSE, 'Authentication assertion response is not AuthenticatorAssertionResponse'),
            });
            return;
        }
        const assertionResponse = assertion.response;
        const rawId = arrayBufferToBase64URL(assertion.rawId);
        const authenticatorData = arrayBufferToBase64URL(assertionResponse.authenticatorData);
        const clientDataJSON = arrayBufferToBase64URL(assertionResponse.clientDataJSON);
        const signature = arrayBufferToBase64URL(assertionResponse.signature);

        await onResult({
            success: true,
            signedChallenge: {
                rawId,
                type: CONST.PASSKEY_CREDENTIAL_TYPE,
                response: {
                    authenticatorData,
                    clientDataJSON,
                    signature,
                },
            },
            authenticationMethod: {
                name: PASSKEY_AUTH_TYPE.NAME,
                marqetaValue: PASSKEY_AUTH_TYPE.MARQETA_VALUE,
            },
        });
    };

    return {
        serverKnownCredentialIDs,
        haveCredentialsEverBeenConfigured,
        getLocalCredentialID,
        hasLocalCredentials,
        areLocalCredentialsKnownToServer,
        authorize,
        deleteLocalKeysForAccount,
    };
}

export default usePasskeys;

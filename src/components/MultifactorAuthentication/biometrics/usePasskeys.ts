import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {
    arrayBufferToBase64URL,
    authenticateWithPasskey,
    buildAllowedCredentialDescriptors,
    buildPublicKeyCredentialCreationOptions,
    buildPublicKeyCredentialRequestOptions,
    createPasskeyCredential,
    decodeWebAuthnError,
    isSupportedTransport,
    isWebAuthnSupported,
    PASSKEY_AUTH_TYPE,
} from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';
import type {RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import {addLocalPasskeyCredential, deleteLocalPasskeyCredentials, getPasskeyOnyxKey, reconcileLocalPasskeysWithBackend} from '@userActions/Passkey';
import CONST from '@src/CONST';
import type {AuthorizeParams, AuthorizeResult, RegisterResult, UseBiometricsReturn} from './shared/types';
import useServerCredentials from './shared/useServerCredentials';

function usePasskeys(): UseBiometricsReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const userId = String(accountID);
    const {serverKnownCredentialIDs, haveCredentialsEverBeenConfigured} = useServerCredentials();
    const [localPasskeyCredentials] = useOnyx(getPasskeyOnyxKey(userId));

    const doesDeviceSupportAuthenticationMethod = () => isWebAuthnSupported();

    const getLocalCredentialID = async (): Promise<string | undefined> => {
        return (localPasskeyCredentials ?? []).at(0)?.id;
    };

    const hasLocalCredentials = async () => (localPasskeyCredentials?.length ?? 0) > 0;

    const areLocalCredentialsKnownToServer = async () => {
        const serverSet = new Set(serverKnownCredentialIDs);
        return (localPasskeyCredentials ?? []).some((c) => serverSet.has(c.id));
    };

    const deleteLocalKeysForAccount = async () => {
        deleteLocalPasskeyCredentials(userId);
    };

    const register = async (onResult: (result: RegisterResult) => Promise<void> | void, registrationChallenge: RegistrationChallenge) => {
        const backendCredentials = serverKnownCredentialIDs.map((id) => ({id, type: CONST.PASSKEY_CREDENTIAL_TYPE}));
        const reconciledExisting = reconcileLocalPasskeysWithBackend({
            userId,
            backendCredentials,
            localCredentials: localPasskeyCredentials ?? null,
        });
        const publicKeyOptions = buildPublicKeyCredentialCreationOptions(registrationChallenge, reconciledExisting);

        let credential: PublicKeyCredential;
        try {
            credential = await createPasskeyCredential(publicKeyOptions);
        } catch (error) {
            await onResult({
                success: false,
                reason: decodeWebAuthnError(error),
            });
            return;
        }

        if (!(credential.response instanceof AuthenticatorAttestationResponse)) {
            await onResult({
                success: false,
                reason: VALUES.REASON.WEBAUTHN.UNEXPECTED_RESPONSE,
            });
            return;
        }
        const attestationResponse = credential.response;
        const credentialId = arrayBufferToBase64URL(credential.rawId);
        const clientDataJSON = arrayBufferToBase64URL(attestationResponse.clientDataJSON);
        const attestationObject = arrayBufferToBase64URL(attestationResponse.attestationObject);

        const transports = attestationResponse.getTransports?.().filter(isSupportedTransport);

        addLocalPasskeyCredential({
            userId,
            credential: {
                id: credentialId,
                type: CONST.PASSKEY_CREDENTIAL_TYPE,
                transports,
            },
            existingCredentials: localPasskeyCredentials ?? null,
        });

        await onResult({
            success: true,
            reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.LOCAL_REGISTRATION_COMPLETE,
            keyInfo: {
                rawId: credentialId,
                type: CONST.PASSKEY_CREDENTIAL_TYPE,
                response: {
                    clientDataJSON,
                    attestationObject,
                },
            },
            authenticationMethod: {
                name: PASSKEY_AUTH_TYPE.NAME,
                marqetaValue: PASSKEY_AUTH_TYPE.MARQETA_VALUE,
            },
        });
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
            await onResult({
                success: false,
                reason: VALUES.REASON.WEBAUTHN.REGISTRATION_REQUIRED,
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
                reason: decodeWebAuthnError(error),
            });
            return;
        }

        if (!(assertion.response instanceof AuthenticatorAssertionResponse)) {
            await onResult({
                success: false,
                reason: VALUES.REASON.WEBAUTHN.UNEXPECTED_RESPONSE,
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
            reason: VALUES.REASON.CHALLENGE.CHALLENGE_SIGNED,
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
        deviceVerificationType: CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS,
        serverKnownCredentialIDs,
        haveCredentialsEverBeenConfigured,
        getLocalCredentialID,
        doesDeviceSupportAuthenticationMethod,
        hasLocalCredentials,
        areLocalCredentialsKnownToServer,
        register,
        authorize,
        deleteLocalKeysForAccount,
    };
}

export default usePasskeys;

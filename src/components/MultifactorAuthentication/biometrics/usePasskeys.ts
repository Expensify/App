import {useCallback} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import type {RegistrationChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import {decodeWebAuthnError} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import {SECURE_STORE_VALUES} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import {
    arrayBufferToBase64URL,
    buildAllowCredentials,
    buildCreationOptions,
    buildRequestOptions,
    createPasskey,
    getPasskeyAssertion,
    isWebAuthnSupported,
} from '@libs/MultifactorAuthentication/Biometrics/WebAuthn';
import {addLocalPasskeyCredential, deleteLocalPasskeyCredentials, getPasskeyOnyxKey, reconcileLocalPasskeysWithBackend} from '@userActions/Passkey';
import CONST from '@src/CONST';
import type {LocalPasskeyCredentialsEntry, PasskeyCredential} from '@src/types/onyx';
import type {AuthorizeParams, AuthorizeResult, RegisterResult, UseBiometricsReturn} from './common/types';
import useServerCredentials from './common/useServerCredentials';

function getLocalCredentials(entry: OnyxEntry<LocalPasskeyCredentialsEntry>): PasskeyCredential[] {
    return entry ?? [];
}

function usePasskeys(): UseBiometricsReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const userId = String(accountID);
    const {serverHasAnyCredentials, serverKnownCredentialIDs} = useServerCredentials();
    const [localPasskeyCredentials] = useOnyx(getPasskeyOnyxKey(userId));

    const doesDeviceSupportBiometrics = useCallback(() => {
        return isWebAuthnSupported();
    }, []);

    const hasLocalCredentials = useCallback(async () => {
        return getLocalCredentials(localPasskeyCredentials).length > 0;
    }, [localPasskeyCredentials]);

    const areLocalCredentialsKnownToServer = useCallback(async () => {
        const credentials = getLocalCredentials(localPasskeyCredentials);
        if (credentials.length === 0) {
            return false;
        }
        const serverSet = new Set(serverKnownCredentialIDs);
        return credentials.some((c) => serverSet.has(c.id));
    }, [localPasskeyCredentials, serverKnownCredentialIDs]);

    const resetKeysForAccount = useCallback(async () => {
        deleteLocalPasskeyCredentials(userId);
    }, [userId]);

    const register = async (onResult: (result: RegisterResult) => Promise<void> | void, registrationChallenge?: RegistrationChallenge) => {
        if (!registrationChallenge) {
            console.debug('[Passkeys] register: registrationChallenge is missing');
            onResult({
                success: false,
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_MISSING,
            });
            return;
        }

        const publicKeyOptions = buildCreationOptions(registrationChallenge, []);

        let credential: PublicKeyCredential;
        try {
            credential = await createPasskey(publicKeyOptions);
        } catch (error) {
            console.debug('[Passkeys] register: WebAuthn create error', error);
            onResult({
                success: false,
                reason: decodeWebAuthnError(error),
            });
            return;
        }

        const attestationResponse = credential.response as AuthenticatorAttestationResponse;
        const credentialId = arrayBufferToBase64URL(credential.rawId);
        const clientDataJSON = arrayBufferToBase64URL(attestationResponse.clientDataJSON);
        const attestationObject = arrayBufferToBase64URL(attestationResponse.attestationObject);

        const transports = (attestationResponse.getTransports?.() ?? []) as PasskeyCredential['transports'];

        addLocalPasskeyCredential({
            userId,
            credential: {
                id: credentialId,
                type: CONST.PASSKEY_CREDENTIAL_TYPE,
                transports,
            },
            existingCredentials: localPasskeyCredentials ?? null,
        });

        const passkeyAuthType = SECURE_STORE_VALUES.AUTH_TYPE.PASSKEY;
        console.debug('[Passkeys] register: success', {credentialId, authType: passkeyAuthType});

        await onResult({
            success: true,
            reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.LOCAL_REGISTRATION_COMPLETE,
            publicKey: credentialId,
            privateKey: '',
            authenticationMethod: {
                code: passkeyAuthType.CODE,
                name: passkeyAuthType.NAME,
                marqetaValue: passkeyAuthType.MARQETA_VALUE,
            },
            attestation: {
                rawId: credentialId,
                clientDataJSON,
                attestationObject,
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
            console.debug('[Passkeys] authorize: no reconciled credentials, registration required', {backendCredentials, localCredentials: localPasskeyCredentials});
            onResult({
                success: false,
                reason: VALUES.REASON.KEYSTORE.REGISTRATION_REQUIRED,
            });
            return;
        }

        const allowCredentials = buildAllowCredentials(reconciled);
        const publicKeyOptions = buildRequestOptions(challenge, allowCredentials);

        let assertion: PublicKeyCredential;
        try {
            assertion = await getPasskeyAssertion(publicKeyOptions);
        } catch (error) {
            console.debug('[Passkeys] authorize: WebAuthn get error', error);
            onResult({
                success: false,
                reason: decodeWebAuthnError(error),
            });
            return;
        }

        const assertionResponse = assertion.response as AuthenticatorAssertionResponse;
        const rawId = arrayBufferToBase64URL(assertion.rawId);
        const authenticatorData = arrayBufferToBase64URL(assertionResponse.authenticatorData);
        const clientDataJSON = arrayBufferToBase64URL(assertionResponse.clientDataJSON);
        const signature = arrayBufferToBase64URL(assertionResponse.signature);

        const passkeyAuthType = SECURE_STORE_VALUES.AUTH_TYPE.PASSKEY;
        console.debug('[Passkeys] authorize: success', {rawId, authType: passkeyAuthType});

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
                code: passkeyAuthType.CODE,
                name: passkeyAuthType.NAME,
                marqetaValue: passkeyAuthType.MARQETA_VALUE,
            },
        });
    };

    return {
        serverHasAnyCredentials,
        serverKnownCredentialIDs,
        doesDeviceSupportBiometrics,
        hasLocalCredentials,
        areLocalCredentialsKnownToServer,
        register,
        authorize,
        resetKeysForAccount,
    };
}

export default usePasskeys;

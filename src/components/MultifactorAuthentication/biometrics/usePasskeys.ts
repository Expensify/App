import type {OnyxEntry} from 'react-native-onyx';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import {decodeWebAuthnError} from '@libs/MultifactorAuthentication/Passkeys/helpers';
import {
    arrayBufferToBase64URL,
    buildAllowCredentials,
    buildCreationOptions,
    buildRequestOptions,
    createPasskey,
    getPasskeyAssertion,
    isSupportedTransport,
    isWebAuthnSupported,
    PASSKEY_AUTH_TYPE,
} from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';
import type {RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import {addLocalPasskeyCredential, deleteLocalPasskeyCredentials, getPasskeyOnyxKey, reconcileLocalPasskeysWithBackend} from '@userActions/Passkey';
import CONST from '@src/CONST';
import type {LocalPasskeyCredentialsEntry, PasskeyCredential} from '@src/types/onyx';
import type {AuthorizeParams, AuthorizeResult, RegisterResult, UseBiometricsReturn} from './shared/types';
import useServerCredentials from './shared/useServerCredentials';

function getLocalCredentials(entry: OnyxEntry<LocalPasskeyCredentialsEntry>): PasskeyCredential[] {
    return entry ?? [];
}

function usePasskeys(): UseBiometricsReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const userId = String(accountID);
    const {serverHasAnyCredentials, serverKnownCredentialIDs} = useServerCredentials();
    const [localPasskeyCredentials] = useOnyx(getPasskeyOnyxKey(userId));

    const doesDeviceSupportBiometrics = () => isWebAuthnSupported();

    const hasLocalCredentials = async () => getLocalCredentials(localPasskeyCredentials).length > 0;

    const areLocalCredentialsKnownToServer = async () => {
        const credentials = getLocalCredentials(localPasskeyCredentials);
        const serverSet = new Set(serverKnownCredentialIDs);
        return credentials.some((c) => serverSet.has(c.id));
    };

    const resetKeysForAccount = async () => {
        deleteLocalPasskeyCredentials(userId);
    };

    const register = async (onResult: (result: RegisterResult) => Promise<void> | void, registrationChallenge?: RegistrationChallenge) => {
        if (!registrationChallenge) {
            onResult({
                success: false,
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_MISSING,
            });
            return;
        }

        const backendCredentials = serverKnownCredentialIDs.map((id) => ({id, type: CONST.PASSKEY_CREDENTIAL_TYPE}));
        const reconciledExisting = reconcileLocalPasskeysWithBackend({
            userId,
            backendCredentials,
            localCredentials: localPasskeyCredentials ?? null,
        });
        const excludeCredentials = buildAllowCredentials(reconciledExisting);
        const publicKeyOptions = buildCreationOptions(registrationChallenge, excludeCredentials);

        let credential: PublicKeyCredential;
        try {
            credential = await createPasskey(publicKeyOptions);
        } catch (error) {
            onResult({
                success: false,
                reason: decodeWebAuthnError(error),
            });
            return;
        }

        if (!(credential.response instanceof AuthenticatorAttestationResponse)) {
            throw new Error('credential.response is not an AuthenticatorAttestationResponse');
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
            onResult({
                success: false,
                reason: decodeWebAuthnError(error),
            });
            return;
        }

        if (!(assertion.response instanceof AuthenticatorAssertionResponse)) {
            throw new Error('assertion.response is not an AuthenticatorAssertionResponse');
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

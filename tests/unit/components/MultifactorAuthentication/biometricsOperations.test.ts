// jest-expo defaults to the ios platform, so this import resolves the native operations module
// (operations/index.native.ts), which checks the HSM biometric sensor.
import {
    areLocalCredentialsKnownToServer,
    authorize,
    createCredential,
    deleteLocalCredentials,
    deviceCheckFailureReason,
    deviceVerificationType,
    doesDeviceSupportAuthenticationMethod,
} from '@components/MultifactorAuthentication/biometrics/operations';

import {translateLocal} from '@libs/Localize';
import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Base64URL from '@src/utils/Base64URL';

import {AuthType} from '@sbaiahmed1/react-native-biometrics';
import Onyx from 'react-native-onyx';
import waitForBatchedUpdates from 'tests/utils/waitForBatchedUpdates';

const mockIsSensorAvailable = jest.fn();
const mockGetAllKeys = jest.fn();
const mockCreateKeys = jest.fn();
const mockSignWithOptions = jest.fn();
const mockDeleteKeys = jest.fn();
const mockSha256 = jest.fn();

jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    isSensorAvailable: (...args: unknown[]) => mockIsSensorAvailable(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getAllKeys: (...args: unknown[]) => mockGetAllKeys(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    createKeys: (...args: unknown[]) => mockCreateKeys(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    signWithOptions: (...args: unknown[]) => mockSignWithOptions(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    deleteKeys: (...args: unknown[]) => mockDeleteKeys(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    sha256: (...args: unknown[]) => mockSha256(...args),
    InputEncoding: {Base64: 'base64'},
    AuthType: {Unknown: -1, None: 0, DeviceCredentials: 1, Biometrics: 2, FaceID: 3, TouchID: 4, OpticID: 5},
}));

const ACCOUNT_ID = 12345;
const TEST_SIGNAL = new AbortController().signal;
// The keystore returns the public key as plain base64 while the server stores base64url IDs, so the
// characters below only match after the module's base64url conversion.
const LOCAL_PUBLIC_KEY_BASE64 = 'Ab+/cd==';
const LOCAL_CREDENTIAL_ID = 'Ab-_cd';
const REGISTRATION_CHALLENGE: RegistrationChallenge = {
    challenge: 'native-registration-challenge',
    rp: {id: 'expensify.com'},
    user: {id: 'native-test-user', displayName: 'Native Test User'},
    pubKeyCredParams: [{type: 'public-key', alg: -7}],
    timeout: 60000,
};
const AUTHENTICATION_CHALLENGE: AuthenticationChallenge = {
    challenge: 'native-authentication-challenge',
    rpId: 'expensify.com',
    allowCredentials: [{type: 'public-key', id: LOCAL_CREDENTIAL_ID}],
    userVerification: 'required',
    timeout: 60000,
};

describe('biometrics operations (native)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockIsSensorAvailable.mockResolvedValue({available: true, biometryType: 'FaceID', isDeviceSecure: true});
    });

    it('should report BIOMETRICS_HSM as the device verification type', () => {
        expect(deviceVerificationType).toBe(CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM);
    });

    it('should report the enrollment failure reason for an unsupported device', () => {
        expect(deviceCheckFailureReason).toBe(VALUES.REASON.LOCAL_ERRORS.NO_AUTHENTICATION_METHODS_ENROLLED);
    });

    describe('doesDeviceSupportAuthenticationMethod', () => {
        it('should return true when sensor is available', async () => {
            await expect(doesDeviceSupportAuthenticationMethod()).resolves.toBe(true);
        });

        it('should return true when device is secure but no biometrics', async () => {
            mockIsSensorAvailable.mockResolvedValue({available: false, isDeviceSecure: true});

            await expect(doesDeviceSupportAuthenticationMethod()).resolves.toBe(true);
        });

        it('should return false when sensor unavailable and device not secure', async () => {
            mockIsSensorAvailable.mockResolvedValue({available: false, isDeviceSecure: false});

            await expect(doesDeviceSupportAuthenticationMethod()).resolves.toBe(false);
        });
    });

    describe('areLocalCredentialsKnownToServer', () => {
        afterEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });

        it('should return true when the local HSM key is among the server-known credential IDs', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: ['other-credential-id', LOCAL_CREDENTIAL_ID]});

            await expect(areLocalCredentialsKnownToServer(ACCOUNT_ID)).resolves.toBe(true);
        });

        it('should return false when the server does not know the local HSM key', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: ['other-credential-id']});

            await expect(areLocalCredentialsKnownToServer(ACCOUNT_ID)).resolves.toBe(false);
        });

        it('should return false when the device holds no key for the account', async () => {
            mockGetAllKeys.mockResolvedValue({keys: []});
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: [LOCAL_CREDENTIAL_ID]});

            await expect(areLocalCredentialsKnownToServer(ACCOUNT_ID)).resolves.toBe(false);
        });

        it('should return false when the keystore read throws', async () => {
            mockGetAllKeys.mockRejectedValue(new Error('Keystore unavailable'));
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: [LOCAL_CREDENTIAL_ID]});

            await expect(areLocalCredentialsKnownToServer(ACCOUNT_ID)).resolves.toBe(false);
        });

        // The library rejects instead of returning an empty key list when the alias does not exist, so
        // treating every rejection as a read failure would stop routing a first-time device to registration.
        it('should return false when the alias rejects with KEY_NOT_FOUND, keeping a first-time device on the registration path', async () => {
            mockGetAllKeys.mockRejectedValue(Object.assign(new Error('No key for alias'), {code: 'KEY_NOT_FOUND'}));
            await Onyx.merge(ONYXKEYS.ACCOUNT, {multifactorAuthenticationPublicKeyIDs: [LOCAL_CREDENTIAL_ID]});

            await expect(areLocalCredentialsKnownToServer(ACCOUNT_ID)).resolves.toBe(false);
        });
    });

    describe('createCredential', () => {
        beforeEach(() => {
            mockCreateKeys.mockResolvedValue({publicKey: LOCAL_PUBLIC_KEY_BASE64});
        });

        it('creates the HSM key with the account-specific alias', async () => {
            await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(mockCreateKeys).toHaveBeenCalledWith('12345_HSM_KEY', 'ec256', undefined, true, false);
        });

        it('returns the exact NativeBiometricsHSMKeyInfo shape on success', async () => {
            const result = await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(result).toEqual({
                success: true,
                keyInfo: {
                    rawId: LOCAL_CREDENTIAL_ID,
                    type: CONST.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_HSM_TYPE,
                    response: {
                        clientDataJSON: Base64URL.encode(JSON.stringify({challenge: REGISTRATION_CHALLENGE.challenge})),
                        biometric: {
                            publicKey: LOCAL_CREDENTIAL_ID,
                            algorithm: CONST.COSE_ALGORITHM.ES256,
                        },
                    },
                },
            });
        });

        it('returns a failed result with the mapped reason when the library throws', async () => {
            mockCreateKeys.mockRejectedValue(Object.assign(new Error('Key creation failed'), {code: 'CREATE_KEYS_ERROR'}));

            const result = await createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected credential creation to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.KEY_CREATION_FAILED);
        });

        it('does not create a queued HSM key after its flow is cancelled', async () => {
            let resolveDeletion = () => {};
            mockDeleteKeys.mockImplementationOnce(
                () =>
                    new Promise<void>((resolve) => {
                        resolveDeletion = resolve;
                    }),
            );
            const deletionPromise = deleteLocalCredentials(ACCOUNT_ID);
            const controller = new AbortController();
            const creationPromise = createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE, signal: controller.signal});
            await waitForBatchedUpdates();

            controller.abort();
            resolveDeletion();
            await deletionPromise;
            const result = await creationPromise;

            expect(mockCreateKeys).not.toHaveBeenCalled();
            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected credential creation to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED);
        });
    });

    describe('authorize', () => {
        beforeEach(() => {
            mockSha256.mockResolvedValue({hash: Buffer.alloc(32).toString('base64')});
            mockSignWithOptions.mockResolvedValue({success: true, signature: 'dGVzdC1zaWduYXR1cmU=', authType: AuthType.FaceID});
        });

        it('returns NO_MATCHING_LOCAL_CREDENTIAL and never calls signWithOptions when the local credential is not in allowCredentials', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            const challengeWithDifferentCredential: AuthenticationChallenge = {...AUTHENTICATION_CHALLENGE, allowCredentials: [{type: 'public-key', id: 'different-credential-id'}]};

            const result = await authorize({accountID: ACCOUNT_ID, challenge: challengeWithDifferentCredential, signal: TEST_SIGNAL});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected authorization to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.NO_MATCHING_LOCAL_CREDENTIAL);
            expect(mockSignWithOptions).not.toHaveBeenCalled();
            // Deletion is the actor's decision, taken from this reason, so the ceremony must leave the keystore alone.
            expect(mockDeleteKeys).not.toHaveBeenCalled();
        });

        // An unreadable keystore may recover, so it must not take the same destructive path as a
        // credential the device confirmed it does not have.
        it('reports the decoded read error, which is not deletion-worthy, when the keystore cannot be read', async () => {
            mockGetAllKeys.mockRejectedValue(Object.assign(new Error('Keystore unavailable'), {code: 'KEY_ACCESS_FAILED'}));

            const result = await authorize({accountID: ACCOUNT_ID, challenge: AUTHENTICATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected authorization to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.KEY_ACCESS_FAILED);
            expect(CONST.MULTIFACTOR_AUTHENTICATION.CREDENTIAL_FAILURES_REQUIRING_LOCAL_DELETION.has(result.error.reason)).toBe(false);
            expect(mockSignWithOptions).not.toHaveBeenCalled();
        });

        it('reports KEY_NOT_FOUND, which is deletion-worthy, when the keystore confirms the account has no key', async () => {
            mockGetAllKeys.mockResolvedValue({keys: []});

            const result = await authorize({accountID: ACCOUNT_ID, challenge: AUTHENTICATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected authorization to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.KEY_NOT_FOUND);
            expect(CONST.MULTIFACTOR_AUTHENTICATION.CREDENTIAL_FAILURES_REQUIRING_LOCAL_DELETION.has(result.error.reason)).toBe(true);
            expect(mockSignWithOptions).not.toHaveBeenCalled();
        });

        it('builds the signing data from the challenge rpId and challenge string', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});

            await authorize({accountID: ACCOUNT_ID, challenge: AUTHENTICATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(mockSha256).toHaveBeenCalledWith(AUTHENTICATION_CHALLENGE.rpId);
            expect(mockSha256).toHaveBeenCalledWith(JSON.stringify({challenge: AUTHENTICATION_CHALLENGE.challenge}));
        });

        it('signs with the account-specific key alias and a localized prompt title', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});

            await authorize({accountID: ACCOUNT_ID, challenge: AUTHENTICATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(mockSignWithOptions).toHaveBeenCalledWith(
                expect.objectContaining({
                    keyAlias: '12345_HSM_KEY',
                    inputEncoding: 'base64',
                    // eslint-disable-next-line @typescript-eslint/no-deprecated
                    promptTitle: translateLocal('multifactorAuthentication.letsVerifyItsYou'),
                    returnAuthType: true,
                }),
            );
        });

        it('maps a sign error code to the corresponding reason when no signature is returned', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            mockSignWithOptions.mockResolvedValue({success: false, errorCode: 'USER_CANCEL'});

            const result = await authorize({accountID: ACCOUNT_ID, challenge: AUTHENTICATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected authorization to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.CANCELED);
        });

        it('falls back to UNRECOGNIZED when no signature is returned and there is no mappable error code', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            mockSignWithOptions.mockResolvedValue({success: false});

            const result = await authorize({accountID: ACCOUNT_ID, challenge: AUTHENTICATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected authorization to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.UNRECOGNIZED);
        });

        it('returns UNRECOGNIZED_AUTH_TYPE for an unmappable authType', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            mockSignWithOptions.mockResolvedValue({success: true, signature: 'dGVzdC1zaWduYXR1cmU=', authType: 999});

            const result = await authorize({accountID: ACCOUNT_ID, challenge: AUTHENTICATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected authorization to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.UNRECOGNIZED_AUTH_TYPE);
        });

        it('decodes a thrown exception into the mapped library error', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            mockSignWithOptions.mockRejectedValue(Object.assign(new Error('User canceled authentication'), {code: 'USER_CANCEL'}));

            const result = await authorize({accountID: ACCOUNT_ID, challenge: AUTHENTICATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected authorization to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.HSM.CANCELED);
        });

        it('returns CANCELED when the flow was cancelled while the ceremony was still running', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            const controller = new AbortController();
            mockSignWithOptions.mockImplementation(async () => {
                controller.abort();
                return {success: true, signature: 'dGVzdC1zaWduYXR1cmU=', authType: AuthType.FaceID};
            });

            const result = await authorize({accountID: ACCOUNT_ID, challenge: AUTHENTICATION_CHALLENGE, signal: controller.signal});

            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected authorization to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED);
        });

        it('does not open the biometric prompt when the flow was cancelled while looking up the local credential', async () => {
            // The credential lookup and the signing-data build both run before the prompt opens, so a
            // cancellation landing in either window must be caught before `signWithOptions` is ever
            // called — unlike the ceremony itself, this window can still be interrupted.
            const controller = new AbortController();
            let resolveGetAllKeys: (result: {keys: Array<{publicKey: string}>}) => void = () => {};
            mockGetAllKeys.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveGetAllKeys = resolve;
                    }),
            );

            const resultPromise = authorize({accountID: ACCOUNT_ID, challenge: AUTHENTICATION_CHALLENGE, signal: controller.signal});
            controller.abort();
            resolveGetAllKeys({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            const result = await resultPromise;

            expect(mockSignWithOptions).not.toHaveBeenCalled();
            expect(result.success).toBe(false);
            if (result.success) {
                throw new Error('Expected authorization to fail');
            }
            expect(result.error.reason).toBe(CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.CANCELED);
        });

        it.each([
            {authType: AuthType.FaceID, name: 'Face ID'},
            {authType: AuthType.TouchID, name: 'Touch ID'},
            {authType: AuthType.Biometrics, name: 'Biometrics'},
            {authType: AuthType.DeviceCredentials, name: 'Credentials'},
        ])('maps authType $authType to "$name" on success', async ({authType, name}) => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});
            mockSignWithOptions.mockResolvedValue({success: true, signature: 'dGVzdC1zaWduYXR1cmU=', authType});

            const result = await authorize({accountID: ACCOUNT_ID, challenge: AUTHENTICATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(result.success).toBe(true);
            if (!result.success) {
                throw new Error('Expected authorization to succeed');
            }
            expect(result.authenticationMethod.name).toBe(name);
        });

        it('returns the exact signed-challenge shape on success', async () => {
            mockGetAllKeys.mockResolvedValue({keys: [{publicKey: LOCAL_PUBLIC_KEY_BASE64}]});

            const result = await authorize({accountID: ACCOUNT_ID, challenge: AUTHENTICATION_CHALLENGE, signal: TEST_SIGNAL});

            expect(result.success).toBe(true);
            if (!result.success) {
                throw new Error('Expected authorization to succeed');
            }
            expect(result.signedChallenge.rawId).toBe(LOCAL_CREDENTIAL_ID);
            expect(result.signedChallenge.type).toBe(CONST.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_HSM_TYPE);
            expect(typeof result.signedChallenge.response.signature).toBe('string');
        });
    });

    describe('deleteLocalCredentials', () => {
        it('deletes the HSM key with the account-specific alias', async () => {
            await deleteLocalCredentials(ACCOUNT_ID);

            expect(mockDeleteKeys).toHaveBeenCalledWith('12345_HSM_KEY');
        });

        it('does not throw when the deletion fails', async () => {
            mockDeleteKeys.mockRejectedValue(new Error('Keystore unavailable'));

            await expect(deleteLocalCredentials(ACCOUNT_ID)).resolves.toBeUndefined();
        });

        it('does not run a queued deletion after its flow is canceled', async () => {
            let resolveCreation: (result: {publicKey: string}) => void = () => {};
            mockCreateKeys.mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveCreation = resolve;
                    }),
            );
            const creationPromise = createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE, signal: TEST_SIGNAL});
            await waitForBatchedUpdates();
            const controller = new AbortController();
            const deletionPromise = deleteLocalCredentials(ACCOUNT_ID, controller.signal);

            controller.abort();
            resolveCreation({publicKey: LOCAL_PUBLIC_KEY_BASE64});
            await creationPromise;
            await deletionPromise;

            expect(mockDeleteKeys).not.toHaveBeenCalled();
        });

        it('finishes an in-flight deletion before creating a replacement key for the same account', async () => {
            let resolveDeletion = () => {};
            mockDeleteKeys.mockImplementation(
                () =>
                    new Promise<void>((resolve) => {
                        resolveDeletion = resolve;
                    }),
            );
            mockCreateKeys.mockResolvedValue({publicKey: LOCAL_PUBLIC_KEY_BASE64});

            const deletionPromise = deleteLocalCredentials(ACCOUNT_ID);
            const creationPromise = createCredential({accountID: ACCOUNT_ID, registrationChallenge: REGISTRATION_CHALLENGE, signal: TEST_SIGNAL});
            await waitForBatchedUpdates();

            expect(mockDeleteKeys).toHaveBeenCalledTimes(1);
            expect(mockCreateKeys).not.toHaveBeenCalled();

            resolveDeletion();
            await deletionPromise;
            await creationPromise;

            expect(mockCreateKeys).toHaveBeenCalledTimes(1);
        });
    });
});

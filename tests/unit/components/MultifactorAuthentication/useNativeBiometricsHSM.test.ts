import {AuthType} from '@sbaiahmed1/react-native-biometrics';
import {act, renderHook} from '@testing-library/react-native';
import useNativeBiometricsHSM from '@components/MultifactorAuthentication/biometrics/useNativeBiometricsHSM';
import type {AuthenticationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import CONST from '@src/CONST';

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        accountID: 12345,
    }),
}));

jest.mock('@hooks/useLocalize', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        translate: (key: string) => `translated_${key}`,
    }),
}));

let mockMultifactorAuthenticationPublicKeyIDs: string[] | undefined = [];

jest.mock('@hooks/useOnyx', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => [mockMultifactorAuthenticationPublicKeyIDs],
}));

jest.mock('@userActions/MultifactorAuthentication');

const mockCreateKeys = jest.fn();
const mockDeleteKeys = jest.fn();
const mockGetAllKeys = jest.fn();
const mockSignWithOptions = jest.fn();
const mockSha256 = jest.fn();
const mockIsSensorAvailable = jest.fn();

jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    createKeys: (...args: unknown[]) => mockCreateKeys(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    deleteKeys: (...args: unknown[]) => mockDeleteKeys(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getAllKeys: (...args: unknown[]) => mockGetAllKeys(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    signWithOptions: (...args: unknown[]) => mockSignWithOptions(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    sha256: (...args: unknown[]) => mockSha256(...args),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    isSensorAvailable: (...args: unknown[]) => mockIsSensorAvailable(...args),
    InputEncoding: {Base64: 'base64'},
    AuthType: {Unknown: -1, None: 0, DeviceCredentials: 1, Biometrics: 2, FaceID: 3, TouchID: 4, OpticID: 5},
}));

jest.mock('@components/MultifactorAuthentication/config', () => ({
    MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG: new Proxy(
        {},
        {
            get: () => ({
                nativePromptTitle: 'multifactorAuthentication.biometricsTest.promptTitle',
            }),
        },
    ),
}));
jest.mock('@userActions/MultifactorAuthentication/processing');

const DEFAULT_SENSOR_RESULT = {available: true, biometryType: 'FaceID', isDeviceSecure: true};

describe('useNativeBiometricsHSM hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMultifactorAuthenticationPublicKeyIDs = [];
        mockIsSensorAvailable.mockResolvedValue(DEFAULT_SENSOR_RESULT);

        mockGetAllKeys.mockResolvedValue({keys: []});
    });

    describe('Hook initialization', () => {
        it('should return hook with required properties', () => {
            // Given a device with biometrics available and an authenticated user
            // When the hook is initialized
            // Then it should expose all required interface methods so consumers can register, authorize, and manage biometric credentials
            const {result} = renderHook(() => useNativeBiometricsHSM());

            expect(result.current).toHaveProperty('serverKnownCredentialIDs');
            expect(result.current).toHaveProperty('doesDeviceSupportAuthenticationMethod');
            expect(result.current).toHaveProperty('getLocalCredentialID');
            expect(result.current).toHaveProperty('areLocalCredentialsKnownToServer');
            expect(result.current).toHaveProperty('register');
            expect(result.current).toHaveProperty('authorize');
            expect(result.current).toHaveProperty('deleteLocalKeysForAccount');
        });

        it('should return biometrics device verification type', () => {
            // Given a device with biometrics available
            // When the hook is initialized
            // Then it should report BIOMETRICS as its device verification type so the MFA system can distinguish it from other verification methods
            const {result} = renderHook(() => useNativeBiometricsHSM());

            expect(result.current.deviceVerificationType).toBe(CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM);
        });
    });

    describe('doesDeviceSupportAuthenticationMethod', () => {
        it('should return true when sensor is available', async () => {
            // Given a device with a biometric sensor available (e.g., Face ID or Touch ID)
            // When checking device support for biometric authentication
            // Then it should return true because the device can perform biometric verification
            const {result} = renderHook(() => useNativeBiometricsHSM());

            await expect(result.current.doesDeviceSupportAuthenticationMethod()).resolves.toBe(true);
        });

        it('should return true when device is secure but no biometrics', async () => {
            // Given a device without biometric hardware but with a secure lock screen (PIN/password)
            // When checking device support for biometric authentication
            // Then it should return true because device credentials can serve as a fallback verification method
            mockIsSensorAvailable.mockResolvedValue({available: false, isDeviceSecure: true});

            const {result} = renderHook(() => useNativeBiometricsHSM());

            await expect(result.current.doesDeviceSupportAuthenticationMethod()).resolves.toBe(true);
        });

        it('should return false when sensor unavailable and device not secure', async () => {
            // Given a device with no biometric sensor and no secure lock screen configured
            // When checking device support for biometric authentication
            // Then it should return false because there is no way to verify the user's identity on this device
            mockIsSensorAvailable.mockResolvedValue({available: false, isDeviceSecure: false});

            const {result} = renderHook(() => useNativeBiometricsHSM());

            await expect(result.current.doesDeviceSupportAuthenticationMethod()).resolves.toBe(false);
        });
    });

    describe('getLocalCredentialID', () => {
        it('should return undefined when no local key exists', async () => {
            // Given no HSM keys have been created on the device for this account
            // When retrieving the local credential ID
            // Then undefined should be returned because the user has not yet registered biometrics on this device
            mockGetAllKeys.mockResolvedValue({keys: []});

            const {result} = renderHook(() => useNativeBiometricsHSM());

            const key = await result.current.getLocalCredentialID();
            expect(key).toBeUndefined();
        });

        it('should return base64url-encoded public key when key exists', async () => {
            // Given an HSM key exists on the device for this account with a base64 public key
            // When retrieving the local credential ID
            // Then the public key should be returned in base64url format because credential IDs must be URL-safe for server communication
            const keyAlias = '12345_HSM_KEY';
            mockGetAllKeys.mockResolvedValue({keys: [{alias: keyAlias, publicKey: 'abc+def/ghi='}]});

            const {result} = renderHook(() => useNativeBiometricsHSM());

            const key = await result.current.getLocalCredentialID();
            expect(key).toBe('abc-def_ghi');
        });
    });

    describe('areLocalCredentialsKnownToServer', () => {
        it('should return false when no local credential exists', async () => {
            // Given no HSM keys exist on the device
            // When checking if local credentials are known to the server
            // Then it should return false because there is no local key to match against server-known credential IDs
            const {result} = renderHook(() => useNativeBiometricsHSM());

            const isKnown = await result.current.areLocalCredentialsKnownToServer();
            expect(isKnown).toBe(false);
        });

        it('should return true when local credential is known to server', async () => {
            // Given an HSM key exists on the device and its base64url-encoded public key matches a server-known credential ID
            // When checking if local credentials are known to the server
            // Then it should return true because the device's biometric registration is still valid on the server
            const keyAlias = '12345_HSM_KEY';
            mockMultifactorAuthenticationPublicKeyIDs = ['abc-def_ghi'];
            mockGetAllKeys.mockResolvedValue({keys: [{alias: keyAlias, publicKey: 'abc+def/ghi='}]});

            const {result} = renderHook(() => useNativeBiometricsHSM());

            const isKnown = await result.current.areLocalCredentialsKnownToServer();
            expect(isKnown).toBe(true);
        });
    });

    describe('serverKnownCredentialIDs', () => {
        it('should expose credential IDs from Onyx state', () => {
            // Given the server has registered multiple biometric credential IDs stored in Onyx
            // When accessing serverKnownCredentialIDs from the hook
            // Then it should return all credential IDs
            mockMultifactorAuthenticationPublicKeyIDs = ['key-1', 'key-2'];
            const {result} = renderHook(() => useNativeBiometricsHSM());

            expect(result.current.serverKnownCredentialIDs).toEqual(['key-1', 'key-2']);
        });

        it('should return empty array when Onyx state is empty', () => {
            // Given no biometric credentials are registered on the server (empty Onyx state)
            // When accessing serverKnownCredentialIDs from the hook
            // Then it should return an empty array rather than undefined
            mockMultifactorAuthenticationPublicKeyIDs = [];
            const {result} = renderHook(() => useNativeBiometricsHSM());

            expect(result.current.serverKnownCredentialIDs).toEqual([]);
        });
    });

    describe('haveCredentialsEverBeenConfigured', () => {
        it('should return false when Onyx state is undefined', () => {
            // Given the Onyx state for MFA public key IDs is undefined, meaning biometrics have never been set up for this account
            // When checking if credentials have ever been configured
            // Then it should return false because undefined indicates the key was never initialized in Onyx
            mockMultifactorAuthenticationPublicKeyIDs = undefined;
            const {result} = renderHook(() => useNativeBiometricsHSM());

            expect(result.current.haveCredentialsEverBeenConfigured).toBe(false);
        });

        it('should return true when Onyx state is an empty array', () => {
            // Given the Onyx state is an empty array, meaning biometrics were configured but all credentials have since been removed
            // When checking if credentials have ever been configured
            // Then it should return true because an empty array (vs undefined) indicates the user previously set up biometrics
            mockMultifactorAuthenticationPublicKeyIDs = [];
            const {result} = renderHook(() => useNativeBiometricsHSM());

            expect(result.current.haveCredentialsEverBeenConfigured).toBe(true);
        });

        it('should return true when Onyx state has credential IDs', () => {
            // Given the Onyx state contains active credential IDs
            // When checking if credentials have ever been configured
            // Then it should return true because credentials are currently registered
            mockMultifactorAuthenticationPublicKeyIDs = ['key-1'];
            const {result} = renderHook(() => useNativeBiometricsHSM());

            expect(result.current.haveCredentialsEverBeenConfigured).toBe(true);
        });
    });

    describe('register', () => {
        const mockRegistrationChallenge = {
            challenge: 'test-challenge-string',
            rp: {id: 'expensify.com'},
            user: {id: 'user-123', displayName: 'Test User'},
            pubKeyCredParams: [{type: 'public-key' as const, alg: -7}],
            timeout: 60000,
        };

        beforeEach(() => {
            mockCreateKeys.mockResolvedValue({publicKey: 'abc+def/ghi='});
        });

        it('should create keys with correct alias', async () => {
            // Given a valid registration challenge from the server
            // When registering a new biometric credential
            // Then it should create an HSM key with the account-specific alias so the key is uniquely tied to the current user
            const {result} = renderHook(() => useNativeBiometricsHSM());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register(onResult, mockRegistrationChallenge);
            });

            expect(mockCreateKeys).toHaveBeenCalledWith('12345_HSM_KEY', 'ec256', undefined, true, false);
        });

        it('should call onResult with success and keyInfo on successful registration', async () => {
            // Given a valid registration challenge and the biometric library successfully creates an HSM key pair
            // When the registration completes
            // Then onResult should receive a success result with the base64url-encoded public key as rawId and HSM type for server registration
            const {result} = renderHook(() => useNativeBiometricsHSM());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register(onResult, mockRegistrationChallenge);
            });

            expect(onResult).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    keyInfo: expect.objectContaining({
                        rawId: 'abc-def_ghi',
                        type: CONST.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_HSM_TYPE,
                    }),
                }),
            );
        });

        it('should call onResult with failure when createKeys throws', async () => {
            // Given the biometric library fails to create keys
            // When the registration is attempted
            // Then onResult should receive a failure result
            mockCreateKeys.mockRejectedValue(new Error('Key creation failed'));

            const {result} = renderHook(() => useNativeBiometricsHSM());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register(onResult, mockRegistrationChallenge);
            });

            expect(onResult).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                }),
            );
        });
    });

    describe('authorize', () => {
        const mockChallenge: AuthenticationChallenge = {
            allowCredentials: [{id: 'abc-def_ghi', type: 'public-key'}],
            rpId: 'expensify.com',
            challenge: 'test-challenge',
            userVerification: 'required',
            timeout: 60000,
        };

        beforeEach(() => {
            const keyAlias = '12345_HSM_KEY';
            mockGetAllKeys.mockResolvedValue({keys: [{alias: keyAlias, publicKey: 'abc+def/ghi='}]});
            mockSha256.mockResolvedValue({hash: Buffer.alloc(32).toString('base64')});
            mockSignWithOptions.mockResolvedValue({success: true, signature: 'dGVzdC1zaWduYXR1cmU=', authType: AuthType.FaceID});
        });

        it('should sign challenge and return success', async () => {
            // Given a valid authentication challenge from the server and a local HSM key that can sign it
            // When the user successfully authenticates via biometrics
            // Then onResult should receive a success with the signed challenge and HSM type so the server can verify the signature
            const {result} = renderHook(() => useNativeBiometricsHSM());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({challenge: mockChallenge}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    signedChallenge: expect.objectContaining({
                        type: CONST.MULTIFACTOR_AUTHENTICATION.BIOMETRICS_HSM_TYPE,
                    }),
                }),
            );
        });

        it('should call signWithOptions with biometric prompt', async () => {
            // Given a valid authentication challenge and a local HSM key
            // When initiating the authorize flow
            // Then signWithOptions should be called with the correct key alias and a localized prompt title
            const {result} = renderHook(() => useNativeBiometricsHSM());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({challenge: mockChallenge}, onResult);
            });

            expect(mockSignWithOptions).toHaveBeenCalledWith(
                expect.objectContaining({
                    keyAlias: '12345_HSM_KEY',
                    promptTitle: 'translated_multifactorAuthentication.letsVerifyItsYou',
                    returnAuthType: true,
                }),
            );
        });

        it('should handle sign failure', async () => {
            // Given the biometric sign operation returns a failure result (e.g., user canceled the biometric prompt)
            // When the authorize flow completes
            // Then onResult should receive a failure so the app can prompt the user to retry or use an alternative method
            mockSignWithOptions.mockResolvedValue({success: false, errorCode: 'canceled'});

            const {result} = renderHook(() => useNativeBiometricsHSM());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({challenge: mockChallenge}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                }),
            );
        });

        it('should handle thrown errors with known error code', async () => {
            // Given the biometric library throws an error with a USER_CANCEL code property
            // When the authorize flow catches the thrown error
            // Then onResult should receive a failure with CANCELED reason based on the exact error code
            mockSignWithOptions.mockRejectedValue(Object.assign(new Error('User canceled authentication'), {code: 'USER_CANCEL'}));

            const {result} = renderHook(() => useNativeBiometricsHSM());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({challenge: mockChallenge}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({reason: VALUES.REASON.LOCAL_ERRORS.HSM.CANCELED}),
                }),
            );
        });

        it('should delete local keys and return NO_MATCHING_LOCAL_CREDENTIAL when local credential is not in allowCredentials', async () => {
            // Given a local HSM key exists but its credential ID does not match any ID in the challenge's allowCredentials list
            // When the authorize flow checks for a matching credential
            // Then it should delete the orphaned local key and return NO_MATCHING_LOCAL_CREDENTIAL so the app can prompt re-registration
            const keyAlias = '12345_HSM_KEY';
            mockGetAllKeys.mockResolvedValue({keys: [{alias: keyAlias, publicKey: 'abc+def/ghi='}]});

            const challengeWithDifferentCredential: AuthenticationChallenge = {
                ...mockChallenge,
                allowCredentials: [{id: 'different-credential-id', type: 'public-key'}],
            };

            const {result} = renderHook(() => useNativeBiometricsHSM());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({challenge: challengeWithDifferentCredential}, onResult);
            });

            expect(mockDeleteKeys).toHaveBeenCalledWith(keyAlias);
            expect(onResult).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({reason: VALUES.REASON.LOCAL_ERRORS.HSM.NO_MATCHING_LOCAL_CREDENTIAL}),
                }),
            );
            expect(mockSignWithOptions).not.toHaveBeenCalled();
        });

        it('should return UNRECOGNIZED_AUTH_TYPE when mapAuthTypeNumber returns undefined', async () => {
            // Given the biometric sign operation succeeds but returns an unrecognized authType number
            // When mapAuthTypeNumber cannot map the authType to a known value and returns undefined
            // Then onResult should receive a failure with UNRECOGNIZED_AUTH_TYPE because the response cannot be trusted without a valid auth type
            mockSignWithOptions.mockResolvedValue({success: true, signature: 'dGVzdC1zaWduYXR1cmU=', authType: 999});

            const {result} = renderHook(() => useNativeBiometricsHSM());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({challenge: mockChallenge}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({reason: VALUES.REASON.LOCAL_ERRORS.HSM.UNRECOGNIZED_AUTH_TYPE}),
                }),
            );
        });

        it('should handle thrown errors with unknown error code', async () => {
            // Given the biometric library throws an error without a recognized code property
            // When the authorize flow catches the thrown error
            // Then onResult should receive a failure with GENERIC as the fallback reason
            mockSignWithOptions.mockRejectedValue(new Error('Unexpected error'));

            const {result} = renderHook(() => useNativeBiometricsHSM());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({challenge: mockChallenge}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: expect.objectContaining({reason: VALUES.REASON.LOCAL_ERRORS.HSM.UNRECOGNIZED}),
                }),
            );
        });
    });

    describe('deleteLocalKeysForAccount', () => {
        it('should delete keys with correct alias', async () => {
            // Given an authenticated user with a locally stored HSM key
            // When deleting local biometric keys for the account
            // Then deleteKeys should be called with the account-specific alias to remove only this user's key without affecting other accounts on the device
            const {result} = renderHook(() => useNativeBiometricsHSM());

            await act(async () => {
                await result.current.deleteLocalKeysForAccount();
            });

            expect(mockDeleteKeys).toHaveBeenCalledWith('12345_HSM_KEY');
        });
    });
});

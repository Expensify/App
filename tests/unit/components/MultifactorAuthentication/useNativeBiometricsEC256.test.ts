import type {BiometricSensorInfo} from '@sbaiahmed1/react-native-biometrics';
import {act, renderHook} from '@testing-library/react-native';
import useNativeBiometricsEC256 from '@components/MultifactorAuthentication/biometrics/useNativeBiometricsEC256';
import * as EC256Helpers from '@libs/MultifactorAuthentication/NativeBiometricsEC256/helpers';
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
    isSensorAvailable: jest.fn().mockResolvedValue({available: true, biometryType: 'FaceID', isDeviceSecure: true}),
    InputEncoding: {Base64: 'base64'},
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

const DEFAULT_SENSOR_RESULT: BiometricSensorInfo = {available: true, biometryType: 'FaceID', isDeviceSecure: true};

describe('useNativeBiometricsEC256 hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMultifactorAuthenticationPublicKeyIDs = [];
        jest.spyOn(EC256Helpers, 'getSensorResult').mockReturnValue(DEFAULT_SENSOR_RESULT);

        mockGetAllKeys.mockResolvedValue({keys: []});
    });

    describe('Hook initialization', () => {
        it('should return hook with required properties', () => {
            const {result} = renderHook(() => useNativeBiometricsEC256());

            expect(result.current).toHaveProperty('serverKnownCredentialIDs');
            expect(result.current).toHaveProperty('doesDeviceSupportAuthenticationMethod');
            expect(result.current).toHaveProperty('getLocalCredentialID');
            expect(result.current).toHaveProperty('areLocalCredentialsKnownToServer');
            expect(result.current).toHaveProperty('register');
            expect(result.current).toHaveProperty('authorize');
            expect(result.current).toHaveProperty('deleteLocalKeysForAccount');
        });

        it('should return biometrics device verification type', () => {
            const {result} = renderHook(() => useNativeBiometricsEC256());

            expect(result.current.deviceVerificationType).toBe(CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS);
        });
    });

    describe('doesDeviceSupportAuthenticationMethod', () => {
        it('should return true when sensor is available', () => {
            const {result} = renderHook(() => useNativeBiometricsEC256());

            expect(result.current.doesDeviceSupportAuthenticationMethod()).toBe(true);
        });

        it('should return true when device is secure but no biometrics', () => {
            jest.spyOn(EC256Helpers, 'getSensorResult').mockReturnValue({available: false, isDeviceSecure: true});

            const {result} = renderHook(() => useNativeBiometricsEC256());

            expect(result.current.doesDeviceSupportAuthenticationMethod()).toBe(true);
        });

        it('should return false when sensor unavailable and device not secure', () => {
            jest.spyOn(EC256Helpers, 'getSensorResult').mockReturnValue({available: false});

            const {result} = renderHook(() => useNativeBiometricsEC256());

            expect(result.current.doesDeviceSupportAuthenticationMethod()).toBe(false);
        });
    });

    describe('getLocalCredentialID', () => {
        it('should return undefined when no local key exists', async () => {
            mockGetAllKeys.mockResolvedValue({keys: []});

            const {result} = renderHook(() => useNativeBiometricsEC256());

            const key = await result.current.getLocalCredentialID();
            expect(key).toBeUndefined();
        });

        it('should return base64url-encoded public key when key exists', async () => {
            const keyAlias = '12345_EC256_KEY';
            mockGetAllKeys.mockResolvedValue({keys: [{alias: keyAlias, publicKey: 'abc+def/ghi='}]});

            const {result} = renderHook(() => useNativeBiometricsEC256());

            const key = await result.current.getLocalCredentialID();
            expect(key).toBe('abc-def_ghi');
        });
    });

    describe('areLocalCredentialsKnownToServer', () => {
        it('should return false when no local credential exists', async () => {
            const {result} = renderHook(() => useNativeBiometricsEC256());

            const isKnown = await result.current.areLocalCredentialsKnownToServer();
            expect(isKnown).toBe(false);
        });

        it('should return true when local credential is known to server', async () => {
            const keyAlias = '12345_EC256_KEY';
            mockMultifactorAuthenticationPublicKeyIDs = ['abc-def_ghi'];
            mockGetAllKeys.mockResolvedValue({keys: [{alias: keyAlias, publicKey: 'abc+def/ghi='}]});

            const {result} = renderHook(() => useNativeBiometricsEC256());

            const isKnown = await result.current.areLocalCredentialsKnownToServer();
            expect(isKnown).toBe(true);
        });
    });

    describe('serverKnownCredentialIDs', () => {
        it('should expose credential IDs from Onyx state', () => {
            mockMultifactorAuthenticationPublicKeyIDs = ['key-1', 'key-2'];
            const {result} = renderHook(() => useNativeBiometricsEC256());

            expect(result.current.serverKnownCredentialIDs).toEqual(['key-1', 'key-2']);
        });

        it('should return empty array when Onyx state is empty', () => {
            mockMultifactorAuthenticationPublicKeyIDs = [];
            const {result} = renderHook(() => useNativeBiometricsEC256());

            expect(result.current.serverKnownCredentialIDs).toEqual([]);
        });
    });

    describe('haveCredentialsEverBeenConfigured', () => {
        it('should return false when Onyx state is undefined', () => {
            mockMultifactorAuthenticationPublicKeyIDs = undefined;
            const {result} = renderHook(() => useNativeBiometricsEC256());

            expect(result.current.haveCredentialsEverBeenConfigured).toBe(false);
        });

        it('should return true when Onyx state is an empty array', () => {
            mockMultifactorAuthenticationPublicKeyIDs = [];
            const {result} = renderHook(() => useNativeBiometricsEC256());

            expect(result.current.haveCredentialsEverBeenConfigured).toBe(true);
        });

        it('should return true when Onyx state has credential IDs', () => {
            mockMultifactorAuthenticationPublicKeyIDs = ['key-1'];
            const {result} = renderHook(() => useNativeBiometricsEC256());

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
            const {result} = renderHook(() => useNativeBiometricsEC256());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register(onResult, mockRegistrationChallenge);
            });

            expect(mockCreateKeys).toHaveBeenCalledWith('12345_EC256_KEY', 'ec256', undefined, true, false);
        });

        it('should call onResult with success and keyInfo on successful registration', async () => {
            const {result} = renderHook(() => useNativeBiometricsEC256());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register(onResult, mockRegistrationChallenge);
            });

            expect(onResult).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.LOCAL_REGISTRATION_COMPLETE,
                    keyInfo: expect.objectContaining({
                        rawId: 'abc-def_ghi',
                        type: CONST.MULTIFACTOR_AUTHENTICATION.EC256_TYPE,
                    }),
                }),
            );
        });

        it('should call onResult with failure when createKeys throws', async () => {
            mockCreateKeys.mockRejectedValue(new Error('Key creation failed'));

            const {result} = renderHook(() => useNativeBiometricsEC256());
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
            const keyAlias = '12345_EC256_KEY';
            mockGetAllKeys.mockResolvedValue({keys: [{alias: keyAlias, publicKey: 'abc+def/ghi='}]});
            mockSha256.mockResolvedValue({hash: Buffer.alloc(32).toString('base64')});
            mockSignWithOptions.mockResolvedValue({success: true, signature: 'c2lnbmF0dXJl', authType: 3});
        });

        it('should sign challenge and return success', async () => {
            const {result} = renderHook(() => useNativeBiometricsEC256());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({challenge: mockChallenge}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    reason: VALUES.REASON.CHALLENGE.CHALLENGE_SIGNED,
                    signedChallenge: expect.objectContaining({
                        type: CONST.MULTIFACTOR_AUTHENTICATION.EC256_TYPE,
                    }),
                }),
            );
        });

        it('should call signWithOptions with biometric prompt', async () => {
            const {result} = renderHook(() => useNativeBiometricsEC256());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({challenge: mockChallenge}, onResult);
            });

            expect(mockSignWithOptions).toHaveBeenCalledWith(
                expect.objectContaining({
                    keyAlias: '12345_EC256_KEY',
                    promptTitle: 'translated_multifactorAuthentication.letsVerifyItsYou',
                    returnAuthType: true,
                }),
            );
        });

        it('should handle sign failure', async () => {
            mockSignWithOptions.mockResolvedValue({success: false, errorCode: 'canceled'});

            const {result} = renderHook(() => useNativeBiometricsEC256());
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

        it('should handle thrown errors', async () => {
            mockSignWithOptions.mockRejectedValue(new Error('Biometric canceled'));

            const {result} = renderHook(() => useNativeBiometricsEC256());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({challenge: mockChallenge}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    reason: VALUES.REASON.EXPO.CANCELED,
                }),
            );
        });
    });

    describe('deleteLocalKeysForAccount', () => {
        it('should delete keys with correct alias', async () => {
            const {result} = renderHook(() => useNativeBiometricsEC256());

            await act(async () => {
                await result.current.deleteLocalKeysForAccount();
            });

            expect(mockDeleteKeys).toHaveBeenCalledWith('12345_EC256_KEY');
        });
    });
});

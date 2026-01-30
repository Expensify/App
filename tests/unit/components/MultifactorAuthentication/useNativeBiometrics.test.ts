import {act, renderHook} from '@testing-library/react-native';
import useNativeBiometrics from '@components/MultifactorAuthentication/Context/useNativeBiometrics';
import {generateKeyPair, signToken as signTokenED25519} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
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
jest.mock('@libs/MultifactorAuthentication/Biometrics/ED25519');
jest.mock('@libs/MultifactorAuthentication/Biometrics/KeyStore', () => ({
    PublicKeyStore: {
        supportedAuthentication: {biometrics: true, deviceCredentials: true},
        set: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
    },
    PrivateKeyStore: {
        supportedAuthentication: {biometrics: true, deviceCredentials: true},
        set: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
    },
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

describe('useNativeBiometrics hook', () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {delete: privateKeyStoreDelete} = jest.mocked(PrivateKeyStore);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const {delete: publicKeyStoreDelete} = jest.mocked(PublicKeyStore);

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset the Onyx mock
        mockMultifactorAuthenticationPublicKeyIDs = [];
        // Reset PublicKeyStore.supportedAuthentication to default
        Object.defineProperty(PublicKeyStore, 'supportedAuthentication', {
            value: {biometrics: true, deviceCredentials: true},
            writable: true,
            configurable: true,
        });
        // Setup default mock for PublicKeyStore
        (PublicKeyStore.get as jest.Mock).mockResolvedValue({
            value: null,
            reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_RETRIEVED,
        });
    });

    describe('Hook initialization', () => {
        it('should return hook with required properties', () => {
            const {result} = renderHook(() => useNativeBiometrics());

            expect(result.current).toHaveProperty('info');
            expect(result.current).toHaveProperty('isAnyDeviceRegistered');
            expect(result.current).toHaveProperty('doesDeviceSupportBiometrics');
            expect(result.current).toHaveProperty('isRegisteredLocally');
            expect(result.current).toHaveProperty('isRegisteredInAuth');
            expect(result.current).toHaveProperty('register');
            expect(result.current).toHaveProperty('authorize');
            expect(result.current).toHaveProperty('resetKeysForAccount');
        });

        it('should initialize info with biometrics status', () => {
            const {result} = renderHook(() => useNativeBiometrics());

            expect(result.current.info).toEqual({
                deviceSupportsBiometrics: true,
                isBiometryRegisteredLocally: false,
                isLocalPublicKeyInAuth: false,
            });
        });

        it('should derive isAnyDeviceRegistered from Onyx state', () => {
            mockMultifactorAuthenticationPublicKeyIDs = ['public-key-123'];
            const {result} = renderHook(() => useNativeBiometrics());

            expect(result.current.isAnyDeviceRegistered).toBe(true);
        });

        it('should return false for isAnyDeviceRegistered when Onyx state is empty', () => {
            mockMultifactorAuthenticationPublicKeyIDs = [];
            const {result} = renderHook(() => useNativeBiometrics());

            expect(result.current.isAnyDeviceRegistered).toBe(false);
        });
    });

    describe('doesDeviceSupportBiometrics', () => {
        it('should return true when device supports biometrics', () => {
            const {result} = renderHook(() => useNativeBiometrics());

            expect(typeof result.current.doesDeviceSupportBiometrics()).toBe('boolean');
            expect(result.current.doesDeviceSupportBiometrics()).toBe(true);
        });

        it('should return boolean based on supportedAuthentication', () => {
            const {result} = renderHook(() => useNativeBiometrics());

            const support = result.current.doesDeviceSupportBiometrics();
            const {biometrics, credentials} = PublicKeyStore.supportedAuthentication;
            const expectedValue = biometrics || credentials;

            expect(support).toBe(expectedValue);
        });
    });

    describe('isRegisteredLocally', () => {
        it('should return false when no local key exists', async () => {
            const {result} = renderHook(() => useNativeBiometrics());

            const isRegistered = await result.current.isRegisteredLocally();
            expect(isRegistered).toBe(false);
        });

        it('should return true when local key exists', async () => {
            (PublicKeyStore.get as jest.Mock).mockResolvedValue({
                value: 'public-key-123',
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_RETRIEVED,
            });

            const {result} = renderHook(() => useNativeBiometrics());

            const isRegistered = await result.current.isRegisteredLocally();
            expect(isRegistered).toBe(true);
        });
    });

    describe('isRegisteredInAuth', () => {
        it('should return false when no local key exists', async () => {
            const {result} = renderHook(() => useNativeBiometrics());

            const isRegistered = await result.current.isRegisteredInAuth();
            expect(isRegistered).toBe(false);
        });

        it('should return true when local key exists in auth backend', async () => {
            mockMultifactorAuthenticationPublicKeyIDs = ['public-key-123'];
            (PublicKeyStore.get as jest.Mock).mockResolvedValue({
                value: 'public-key-123',
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_RETRIEVED,
            });

            const {result} = renderHook(() => useNativeBiometrics());

            const isRegistered = await result.current.isRegisteredInAuth();
            expect(isRegistered).toBe(true);
        });
    });

    describe('isAnyDeviceRegistered', () => {
        it('should return true when Onyx has registered public keys', () => {
            mockMultifactorAuthenticationPublicKeyIDs = ['public-key-123'];

            const {result} = renderHook(() => useNativeBiometrics());

            expect(result.current.isAnyDeviceRegistered).toBe(true);
        });

        it('should return false when Onyx has no registered public keys', () => {
            mockMultifactorAuthenticationPublicKeyIDs = [];

            const {result} = renderHook(() => useNativeBiometrics());

            expect(result.current.isAnyDeviceRegistered).toBe(false);
        });
    });

    describe('register', () => {
        beforeEach(() => {
            (generateKeyPair as jest.Mock).mockReturnValue({
                publicKey: 'public-key-123',
                privateKey: 'private-key-123',
            });
            (PrivateKeyStore.set as jest.Mock).mockResolvedValue({
                value: true,
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_SAVED,
                type: 0,
            });
            (PublicKeyStore.set as jest.Mock).mockResolvedValue({
                value: true,
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_SAVED,
            });
            (PublicKeyStore.get as jest.Mock).mockResolvedValue({
                value: 'public-key-123',
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_RETRIEVED,
            });
        });

        // Note: Challenge fetching is now done in Main.tsx, not in useNativeBiometrics
        // These tests verify the register function with challenge passed as a parameter

        it('should generate key pair', async () => {
            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register({nativePromptTitle: 'Authenticate'}, onResult);
            });

            expect(generateKeyPair).toHaveBeenCalled();
        });

        it('should store private key with prompt title', async () => {
            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register({nativePromptTitle: 'Test Prompt'}, onResult);
            });

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(PrivateKeyStore.set).toHaveBeenCalledWith(12345, 'private-key-123', {nativePromptTitle: 'Test Prompt'});
        });

        it('should store public key', async () => {
            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register({nativePromptTitle: 'Authenticate'}, onResult);
            });

            // Verify both stores were called
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(PrivateKeyStore.set).toHaveBeenCalled();
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(PublicKeyStore.set).toHaveBeenCalled();
        });

        it('should handle successful registration flow', async () => {
            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register({nativePromptTitle: 'Authenticate'}, onResult);
            });

            // Verify the full flow was triggered
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(generateKeyPair).toHaveBeenCalled();
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(PrivateKeyStore.set).toHaveBeenCalled();
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(PublicKeyStore.set).toHaveBeenCalled();
            expect(onResult).toHaveBeenCalled();
        });
    });

    describe('authorize', () => {
        beforeEach(() => {
            (PrivateKeyStore.get as jest.Mock).mockResolvedValue({
                value: 'private-key-123',
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_RETRIEVED,
                type: 0,
            });
            (PublicKeyStore.get as jest.Mock).mockResolvedValue({
                value: 'public-key-123',
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.KEY_RETRIEVED,
            });
            (signTokenED25519 as jest.Mock).mockReturnValue({
                clientDataJSON: 'client-data',
                authenticatorData: 'auth-data',
                signature: 'signature',
            });
        });

        // Note: Challenge fetching is now done in Main.tsx, not in useNativeBiometrics
        // These tests verify the authorize function with challenge passed as a parameter

        const mockChallenge = {
            allowCredentials: [{id: 'public-key-123', type: 'public-key'}],
            rpId: 'expensify.com',
            challenge: 'test-challenge',
            userVerification: 'required',
            timeout: 60000,
        };

        it('should get private key from secure store', async () => {
            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST, challenge: mockChallenge}, onResult);
            });

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(PrivateKeyStore.get).toHaveBeenCalledWith(12345, expect.any(Object));
        });

        it('should handle missing private key', async () => {
            (PrivateKeyStore.get as jest.Mock).mockResolvedValue({
                value: null,
                reason: VALUES.REASON.KEYSTORE.KEY_MISSING,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST, challenge: mockChallenge}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith({
                success: false,
                reason: VALUES.REASON.KEYSTORE.KEY_MISSING,
            });
        });

        it('should verify public key is in allowCredentials', async () => {
            const challengeWithOtherKey = {
                allowCredentials: [{id: 'other-public-key', type: 'public-key'}],
                rpId: 'expensify.com',
                challenge: 'test-challenge',
                userVerification: 'required',
                timeout: 60000,
            };

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST, challenge: challengeWithOtherKey}, onResult);
            });

            expect(publicKeyStoreDelete).toHaveBeenCalledWith(12345);
            expect(privateKeyStoreDelete).toHaveBeenCalledWith(12345);
            expect(onResult).toHaveBeenCalledWith({
                success: false,
                reason: VALUES.REASON.KEYSTORE.REGISTRATION_REQUIRED,
            });
        });

        it('should sign challenge with private key', async () => {
            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST, challenge: mockChallenge}, onResult);
            });

            expect(signTokenED25519).toHaveBeenCalledWith(expect.any(Object), expect.any(String), 'public-key-123');
        });

        it('should return success with signed challenge', async () => {
            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST, challenge: mockChallenge}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    reason: VALUES.REASON.CHALLENGE.CHALLENGE_SIGNED,
                    signedChallenge: {
                        clientDataJSON: 'client-data',
                        authenticatorData: 'auth-data',
                        signature: 'signature',
                    },
                }),
            );
        });
    });

    describe('resetKeysForAccount', () => {
        it('should delete keys and refresh local state', async () => {
            const {result} = renderHook(() => useNativeBiometrics());

            await act(async () => {
                await result.current.resetKeysForAccount();
            });

            expect(publicKeyStoreDelete).toHaveBeenCalledWith(12345);
            expect(privateKeyStoreDelete).toHaveBeenCalledWith(12345);
            // Local state refresh calls PublicKeyStore.get
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(PublicKeyStore.get).toHaveBeenCalledWith(12345);
        });
    });
});

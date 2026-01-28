import {act, renderHook} from '@testing-library/react-native';
import {doesDeviceSupportBiometrics, isBiometryConfigured, resetKeys} from '@components/MultifactorAuthentication/Context/helpers';
import useNativeBiometrics from '@components/MultifactorAuthentication/Context/useNativeBiometrics';
import {requestAuthenticationChallenge} from '@libs/actions/MultifactorAuthentication';
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

jest.mock('@libs/actions/MultifactorAuthentication');
jest.mock('@libs/MultifactorAuthentication/Biometrics/ED25519');
jest.mock('@libs/MultifactorAuthentication/Biometrics/KeyStore');

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
jest.mock('@components/MultifactorAuthentication/Context/helpers');

describe('useNativeBiometrics hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (doesDeviceSupportBiometrics as jest.Mock).mockReturnValue(true);
        (isBiometryConfigured as jest.Mock).mockResolvedValue({
            isAnyDeviceRegistered: false,
            isBiometryRegisteredLocally: false,
            isLocalPublicKeyInAuth: false,
        });
    });

    describe('Hook initialization', () => {
        it('should return hook with required properties', () => {
            const {result} = renderHook(() => useNativeBiometrics());

            expect(result.current).toHaveProperty('info');
            expect(result.current).toHaveProperty('doesDeviceSupportBiometrics');
            expect(result.current).toHaveProperty('isRegisteredLocally');
            expect(result.current).toHaveProperty('isRegisteredInAuth');
            expect(result.current).toHaveProperty('refresh');
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
                isAnyDeviceRegistered: false,
            });
        });
    });

    describe('doesDeviceSupportBiometrics', () => {
        it('should return boolean from helper function', () => {
            const {result} = renderHook(() => useNativeBiometrics());

            const support = result.current.doesDeviceSupportBiometrics();

            expect(typeof support).toBe('boolean');
            expect(support).toBe(true);
        });

        it('should reflect device support status from helper', () => {
            (doesDeviceSupportBiometrics as jest.Mock).mockReturnValue(false);

            const {result} = renderHook(() => useNativeBiometrics());

            expect(result.current.doesDeviceSupportBiometrics()).toBe(false);
        });
    });

    describe('isRegisteredLocally', () => {
        it('should return local registration status from info', () => {
            const {result} = renderHook(() => useNativeBiometrics());

            expect(result.current.isRegisteredLocally()).toBe(false);
        });
    });

    describe('isRegisteredInAuth', () => {
        it('should return auth registration status from info', () => {
            const {result} = renderHook(() => useNativeBiometrics());

            expect(result.current.isRegisteredInAuth()).toBe(false);
        });
    });

    describe('refresh', () => {
        it('should update info from isBiometryConfigured', async () => {
            (isBiometryConfigured as jest.Mock).mockResolvedValue({
                isAnyDeviceRegistered: true,
                isBiometryRegisteredLocally: true,
                isLocalPublicKeyInAuth: true,
            });

            const {result} = renderHook(() => useNativeBiometrics());

            await act(async () => {
                await result.current.refresh();
            });

            expect(result.current.info.isAnyDeviceRegistered).toBe(true);
            expect(result.current.info.isBiometryRegisteredLocally).toBe(true);
            expect(result.current.info.isLocalPublicKeyInAuth).toBe(true);
        });

        it('should call isBiometryConfigured with accountID', async () => {
            const {result} = renderHook(() => useNativeBiometrics());

            await act(async () => {
                await result.current.refresh();
            });

            expect(isBiometryConfigured).toHaveBeenCalledWith(12345);
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
        });

        it('should request registration challenge from backend', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {user: {id: '123'}, rp: {name: 'Expensify'}},
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register({nativePromptTitle: 'Authenticate'}, onResult);
            });

            expect(requestAuthenticationChallenge).toHaveBeenCalledWith('registration');
        });

        it('should handle missing challenge', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: null,
                reason: VALUES.REASON.BACKEND.UNKNOWN_RESPONSE,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register({nativePromptTitle: 'Authenticate'}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith({
                success: false,
                reason: VALUES.REASON.CHALLENGE.COULD_NOT_RETRIEVE_A_CHALLENGE,
            });
        });

        it('should validate registration challenge has user and rp properties', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {challenge: 'abc123'},
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register({nativePromptTitle: 'Authenticate'}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith({
                success: false,
                reason: VALUES.REASON.BACKEND.INVALID_CHALLENGE_TYPE,
            });
        });

        it('should check device support', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {user: {id: '123'}, rp: {name: 'Expensify'}},
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });
            (doesDeviceSupportBiometrics as jest.Mock).mockReturnValue(false);

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register({nativePromptTitle: 'Authenticate'}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith({
                success: false,
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS,
            });
        });

        it('should generate key pair', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {user: {id: '123'}, rp: {name: 'Expensify'}, challenge: 'abc123'},
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register({nativePromptTitle: 'Authenticate'}, onResult);
            });

            expect(generateKeyPair).toHaveBeenCalled();
        });

        it('should store private key with prompt title', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {user: {id: '123'}, rp: {name: 'Expensify'}, challenge: 'abc123'},
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.register({nativePromptTitle: 'Test Prompt'}, onResult);
            });

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(PrivateKeyStore.set).toHaveBeenCalledWith(12345, 'private-key-123', {nativePromptTitle: 'Test Prompt'});
        });

        it('should store public key', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {user: {id: '123'}, rp: {name: 'Expensify'}, challenge: 'abc123'},
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

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
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {user: {id: '123'}, rp: {name: 'Expensify'}, challenge: 'abc123'},
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

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

        it('should request authentication challenge from backend', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {
                    allowCredentials: [{id: 'public-key-123', type: 'public-key'}],
                    rpId: 'expensify.com',
                },
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST}, onResult);
            });

            expect(requestAuthenticationChallenge).toHaveBeenCalledWith();
        });

        it('should handle missing challenge', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: null,
                reason: VALUES.REASON.BACKEND.UNKNOWN_RESPONSE,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith({
                success: false,
                reason: VALUES.REASON.CHALLENGE.COULD_NOT_RETRIEVE_A_CHALLENGE,
            });
        });

        it('should validate authentication challenge has allowCredentials and rpId', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {challenge: 'abc123'},
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith({
                success: false,
                reason: VALUES.REASON.BACKEND.INVALID_CHALLENGE_TYPE,
            });
        });

        it('should get private key from secure store', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {
                    allowCredentials: [{id: 'public-key-123', type: 'public-key'}],
                    rpId: 'expensify.com',
                },
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST}, onResult);
            });

            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(PrivateKeyStore.get).toHaveBeenCalledWith(12345, expect.any(Object));
        });

        it('should handle missing private key', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {
                    allowCredentials: [{id: 'public-key-123', type: 'public-key'}],
                    rpId: 'expensify.com',
                },
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });
            (PrivateKeyStore.get as jest.Mock).mockResolvedValue({
                value: null,
                reason: VALUES.REASON.KEYSTORE.KEY_MISSING,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST}, onResult);
            });

            expect(onResult).toHaveBeenCalledWith({
                success: false,
                reason: VALUES.REASON.KEYSTORE.KEY_MISSING,
            });
        });

        it('should verify public key is in allowCredentials', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {
                    allowCredentials: [{id: 'other-public-key', type: 'public-key'}],
                    rpId: 'expensify.com',
                },
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST}, onResult);
            });

            expect(resetKeys).toHaveBeenCalledWith(12345);
            expect(onResult).toHaveBeenCalledWith({
                success: false,
                reason: VALUES.REASON.KEYSTORE.REGISTRATION_REQUIRED,
            });
        });

        it('should sign challenge with private key', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {
                    allowCredentials: [{id: 'public-key-123', type: 'public-key'}],
                    rpId: 'expensify.com',
                },
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST}, onResult);
            });

            expect(signTokenED25519).toHaveBeenCalledWith(expect.any(Object), expect.any(String), 'public-key-123');
        });

        it('should return success with signed challenge', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {
                    allowCredentials: [{id: 'public-key-123', type: 'public-key'}],
                    rpId: 'expensify.com',
                },
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST}, onResult);
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

        it('should use chained private key status if provided', async () => {
            (requestAuthenticationChallenge as jest.Mock).mockResolvedValue({
                challenge: {
                    allowCredentials: [{id: 'public-key-123', type: 'public-key'}],
                    rpId: 'expensify.com',
                },
                reason: VALUES.REASON.CHALLENGE.CHALLENGE_RECEIVED,
            });

            const chainedKeyStatus = {
                value: 'chained-private-key',
                reason: VALUES.REASON.KEYSTORE.KEY_PAIR_GENERATED,
                type: 0,
            } as const;

            const {result} = renderHook(() => useNativeBiometrics());
            const onResult = jest.fn();

            await act(async () => {
                await result.current.authorize({scenario: CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST, chainedPrivateKeyStatus: chainedKeyStatus}, onResult);
            });

            // When chained key is provided, it should be used instead of fetching
            expect(signTokenED25519).toHaveBeenCalledWith(expect.any(Object), 'chained-private-key', 'public-key-123');
        });
    });

    describe('resetKeysForAccount', () => {
        it('should call resetKeys and refresh', async () => {
            const {result} = renderHook(() => useNativeBiometrics());

            await act(async () => {
                await result.current.resetKeysForAccount();
            });

            expect(resetKeys).toHaveBeenCalledWith(12345);
            expect(isBiometryConfigured).toHaveBeenCalledWith(12345);
        });
    });
});

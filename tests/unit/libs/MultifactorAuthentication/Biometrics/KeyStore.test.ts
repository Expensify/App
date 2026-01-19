import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import {SECURE_STORE_METHODS} from '@libs/MultifactorAuthentication/Biometrics/SecureStore';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';

jest.mock('@libs/MultifactorAuthentication/Biometrics/SecureStore');

const mockedSecureStoreMethods = jest.mocked(SECURE_STORE_METHODS);

// Mock the SECURE_STORE_METHODS
jest.mock('@libs/MultifactorAuthentication/Biometrics/SecureStore', () => ({
    SECURE_STORE_METHODS: {
        getItemAsync: jest.fn(),
        setItemAsync: jest.fn(),
        deleteItemAsync: jest.fn(),
        canUseBiometricAuthentication: jest.fn(() => true),
        canUseDeviceCredentialsAuthentication: jest.fn(() => true),
    },
    SECURE_STORE_VALUES: {
        WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: 'WHEN_PASSCODE_SET_THIS_DEVICE_ONLY',
        AUTH_TYPE: {
            BIOMETRIC: {CODE: 'biometric', NAME: 'Biometric'},
            DEVICE_CREDENTIAL: {CODE: 'device_credential', NAME: 'Device Credential'},
        },
    },
}));

jest.mock('@libs/MultifactorAuthentication/Biometrics/helpers', () => ({
    decodeExpoMessage: jest.fn(() => 'decoded-error-reason'),
}));

describe('MultifactorAuthentication KeyStore', () => {
    const mockAccountID = 12345;
    const mockKey = 'test-key-value';
    const mockOptions = {nativePromptTitle: 'Test Prompt'};

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('PrivateKeyStore', () => {
        describe('set method', () => {
            it('should save a private key successfully', async () => {
                mockedSecureStoreMethods.setItemAsync.mockResolvedValueOnce('biometric');

                const result = await PrivateKeyStore.set(mockAccountID, mockKey);

                expect(result.value).toBe(true);
                expect(result.reason).toBe(VALUES.REASON.KEYSTORE.KEY_SAVED);
                expect(result.type).toBe('biometric');
                expect(mockedSecureStoreMethods.setItemAsync).toHaveBeenCalled();
            });

            it('should handle save errors', async () => {
                mockedSecureStoreMethods.setItemAsync.mockRejectedValueOnce(new Error('Save failed'));

                const result = await PrivateKeyStore.set(mockAccountID, mockKey);

                expect(result.value).toBe(false);
            });

            it('should pass options to secure store', async () => {
                mockedSecureStoreMethods.setItemAsync.mockResolvedValueOnce('biometric');

                await PrivateKeyStore.set(mockAccountID, mockKey, mockOptions);

                expect(mockedSecureStoreMethods.setItemAsync).toHaveBeenCalled();
            });
        });

        describe('get method', () => {
            it('should retrieve a stored private key', async () => {
                mockedSecureStoreMethods.getItemAsync.mockResolvedValueOnce([mockKey, 'biometric']);

                const result = await PrivateKeyStore.get(mockAccountID);

                expect(result.value).toBe(mockKey);
                expect(result.reason).toBe(VALUES.REASON.KEYSTORE.KEY_RETRIEVED);
                expect(result.type).toBe('biometric');
            });

            it('should return KEY_NOT_FOUND when key is null', async () => {
                mockedSecureStoreMethods.getItemAsync.mockResolvedValueOnce([null, undefined]);

                const result = await PrivateKeyStore.get(mockAccountID);

                expect(result.value).toBeNull();
                expect(result.reason).toBe(VALUES.REASON.KEYSTORE.KEY_NOT_FOUND);
            });

            it('should handle retrieval errors', async () => {
                mockedSecureStoreMethods.getItemAsync.mockRejectedValueOnce(new Error('Retrieval failed'));

                const result = await PrivateKeyStore.get(mockAccountID);

                expect(result.value).toBeNull();
            });
        });

        describe('delete method', () => {
            it('should delete a private key successfully', async () => {
                mockedSecureStoreMethods.deleteItemAsync.mockResolvedValueOnce(undefined);

                const result = await PrivateKeyStore.delete(mockAccountID);

                expect(result.value).toBe(true);
                expect(result.reason).toBe(VALUES.REASON.KEYSTORE.KEY_DELETED);
            });

            it('should handle deletion errors', async () => {
                mockedSecureStoreMethods.deleteItemAsync.mockRejectedValueOnce(new Error('Deletion failed'));

                const result = await PrivateKeyStore.delete(mockAccountID);

                expect(result.value).toBe(false);
            });
        });

        describe('supportedAuthentication property', () => {
            it('should return available authentication methods', () => {
                const supported = PrivateKeyStore.supportedAuthentication;

                expect(supported).toEqual({
                    biometrics: true,
                    credentials: true,
                });
            });
        });
    });

    describe('PublicKeyStore', () => {
        describe('set method', () => {
            it('should save a public key successfully', async () => {
                mockedSecureStoreMethods.setItemAsync.mockResolvedValueOnce('device_credential');

                const result = await PublicKeyStore.set(mockAccountID, mockKey);

                expect(result.value).toBe(true);
                expect(result.reason).toBe(VALUES.REASON.KEYSTORE.KEY_SAVED);
            });
        });

        describe('get method', () => {
            it('should retrieve a stored public key', async () => {
                mockedSecureStoreMethods.getItemAsync.mockResolvedValueOnce([mockKey, 'device_credential']);

                const result = await PublicKeyStore.get(mockAccountID);

                expect(result.value).toBe(mockKey);
                expect(result.reason).toBe(VALUES.REASON.KEYSTORE.KEY_RETRIEVED);
            });
        });

        describe('delete method', () => {
            it('should delete a public key successfully', async () => {
                mockedSecureStoreMethods.deleteItemAsync.mockResolvedValueOnce(undefined);

                const result = await PublicKeyStore.delete(mockAccountID);

                expect(result.value).toBe(true);
                expect(result.reason).toBe(VALUES.REASON.KEYSTORE.KEY_DELETED);
            });
        });
    });
});

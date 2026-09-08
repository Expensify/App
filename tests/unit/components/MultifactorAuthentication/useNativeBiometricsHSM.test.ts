import {renderHook} from '@testing-library/react-native';

import useNativeBiometricsHSM from '@components/MultifactorAuthentication/biometrics/useNativeBiometricsHSM';

jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    __esModule: true,
    default: () => ({
        accountID: 12345,
    }),
}));

let mockMultifactorAuthenticationPublicKeyIDs: string[] | undefined = [];

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [mockMultifactorAuthenticationPublicKeyIDs],
}));

const mockGetAllKeys = jest.fn();

jest.mock('@sbaiahmed1/react-native-biometrics', () => ({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    getAllKeys: (...args: unknown[]) => mockGetAllKeys(...args),
}));

describe('useNativeBiometricsHSM hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockMultifactorAuthenticationPublicKeyIDs = [];

        mockGetAllKeys.mockResolvedValue({keys: []});
    });

    describe('Hook initialization', () => {
        it('should return hook with required properties', () => {
            // Given a device with biometrics available and an authenticated user
            // When the hook is initialized
            // Then it should expose all required interface methods so consumers can read biometric registration state
            const {result} = renderHook(() => useNativeBiometricsHSM());

            expect(result.current).toHaveProperty('serverKnownCredentialIDs');
            expect(result.current).toHaveProperty('getLocalCredentialID');
            expect(result.current).toHaveProperty('areLocalCredentialsKnownToServer');
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
});

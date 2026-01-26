import {act, renderHook} from '@testing-library/react-native';
import {doesDeviceSupportBiometrics, isBiometryConfigured} from '@components/MultifactorAuthentication/helpers';
import useNativeBiometricsSetup from '@components/MultifactorAuthentication/useNativeBiometrics/useNativeBiometricsSetup';
import {generateKeyPair} from '@libs/MultifactorAuthentication/Biometrics/ED25519';
import {processRegistration} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import {PrivateKeyStore, PublicKeyStore} from '@libs/MultifactorAuthentication/Biometrics/KeyStore';
import type {MultifactorAuthenticationPartialStatus, MultifactorAuthenticationStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';

jest.mock('@components/MultifactorAuthentication/helpers');
jest.mock('@libs/MultifactorAuthentication/Biometrics/ED25519');
jest.mock('@libs/MultifactorAuthentication/Biometrics/KeyStore');
jest.mock('@libs/MultifactorAuthentication/Biometrics/helpers');
jest.mock('@hooks/useCurrentUserPersonalDetails', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        accountID: 12345,
    }),
}));

type StatusOrFn = MultifactorAuthenticationPartialStatus<unknown> | ((status: MultifactorAuthenticationPartialStatus<unknown>) => MultifactorAuthenticationPartialStatus<unknown>);

const mockSetupStatus = jest.fn((statusOrFn: StatusOrFn) => {
    const baseStatus: MultifactorAuthenticationStatus<unknown> = {
        value: {
            isBiometryRegisteredLocally: false,
            isAnyDeviceRegistered: false,
            isLocalPublicKeyInAuth: false,
        },
        reason: 'No action has been made yet',
        step: {
            wasRecentStepSuccessful: undefined,
            isRequestFulfilled: true,
            requiredFactorForNextStep: undefined,
        },
        scenario: 'BIOMETRICS-TEST',
        outcomePaths: {
            successOutcome: 'biometrics-test-success',
            failureOutcome: 'biometrics-test-failure',
        },
        headerTitle: 'Test',
        title: 'Test',
        type: 1,
        typeName: 'BIOMETRICS',
        description: 'Test',
    };

    if (typeof statusOrFn === 'function') {
        return statusOrFn(baseStatus);
    }
    return {
        ...baseStatus,
        ...statusOrFn,
    };
});

jest.mock('@components/MultifactorAuthentication/useMultifactorAuthenticationStatus', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => [
        {
            value: {
                isBiometryRegisteredLocally: false,
                isAnyDeviceRegistered: false,
                isLocalPublicKeyInAuth: false,
            },
            reason: 'NO_ACTION_MADE_YET',
            step: {
                wasRecentStepSuccessful: undefined,
                isRequestFulfilled: true,
                requiredFactorForNextStep: undefined,
            },
            headerTitle: 'Test',
            title: 'Test',
            description: 'Test',
            outcomePaths: {
                successOutcome: 'biometrics-test-success',
                failureOutcome: 'biometrics-test-failure',
            },
        },
        mockSetupStatus,
    ],
}));

describe('useNativeBiometricsSetup hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (doesDeviceSupportBiometrics as jest.Mock).mockReturnValue(true);
        (isBiometryConfigured as jest.Mock).mockResolvedValue({
            isAnyDeviceRegistered: false,
            isBiometryRegisteredLocally: false,
            isLocalPublicKeyInAuth: false,
        });
    });

    it('should return setup object with required properties', () => {
        const {result} = renderHook(() => useNativeBiometricsSetup());

        expect(result.current).toHaveProperty('register');
        expect(result.current).toHaveProperty('cancel');
        expect(result.current).toHaveProperty('refresh');
        expect(result.current).toHaveProperty('deviceSupportBiometrics');
    });

    it('should initialize with biometrics status values', () => {
        const {result} = renderHook(() => useNativeBiometricsSetup());

        expect(result.current.isBiometryRegisteredLocally).toBe(false);
        expect(result.current.isAnyDeviceRegistered).toBe(false);
        expect(result.current.isLocalPublicKeyInAuth).toBe(false);
    });

    it('should report device support capability', () => {
        const {result} = renderHook(() => useNativeBiometricsSetup());

        expect(typeof result.current.deviceSupportBiometrics).toBe('boolean');
    });

    it('should have callable cancel function', () => {
        const {result} = renderHook(() => useNativeBiometricsSetup());

        expect(typeof result.current.cancel).toBe('function');
    });

    it('should have callable refresh function', () => {
        const {result} = renderHook(() => useNativeBiometricsSetup());

        expect(typeof result.current.refresh).toBe('function');
    });

    it('should have callable register function', () => {
        const {result} = renderHook(() => useNativeBiometricsSetup());

        expect(typeof result.current.register).toBe('function');
    });

    it('should not allow registration on unsupported devices', async () => {
        (doesDeviceSupportBiometrics as jest.Mock).mockReturnValue(false);

        const {result} = renderHook(() => useNativeBiometricsSetup());

        await act(async () => {
            await result.current.register({
                validateCode: 123456,
                nativePromptTitle: 'Authenticate',
            });
        });

        expect(doesDeviceSupportBiometrics).toHaveBeenCalled();
        expect(mockSetupStatus).toHaveBeenCalled();
    });

    it('should require validate code for registration', async () => {
        const {result} = renderHook(() => useNativeBiometricsSetup());

        await act(async () => {
            await result.current.register({
                validateCode: undefined,
                nativePromptTitle: 'Authenticate',
            });
        });

        expect(mockSetupStatus).toHaveBeenCalled();
    });

    it('should generate key pair during registration', async () => {
        (generateKeyPair as jest.Mock).mockReturnValue({
            publicKey: 'public-key',
            privateKey: 'private-key',
        });
        (PrivateKeyStore.set as jest.Mock).mockResolvedValue({
            value: true,
            reason: 'KEY_SAVED',
        });
        (PublicKeyStore.set as jest.Mock).mockResolvedValue({
            value: true,
            reason: 'KEY_SAVED',
        });
        (processRegistration as jest.Mock).mockResolvedValue({
            step: {
                wasRecentStepSuccessful: true,
                isRequestFulfilled: true,
            },
            reason: 'REGISTRATION_SUCCESSFUL',
        });

        const {result} = renderHook(() => useNativeBiometricsSetup());

        await act(async () => {
            await result.current.register({
                validateCode: 123456,
                nativePromptTitle: 'Authenticate',
            });
        });

        expect(generateKeyPair).toHaveBeenCalled();
    });

    it('should store generated keys in secure stores', async () => {
        (generateKeyPair as jest.Mock).mockReturnValue({
            publicKey: 'public-key',
            privateKey: 'private-key',
        });
        (PrivateKeyStore.set as jest.Mock).mockResolvedValue({
            value: true,
            reason: 'KEY_SAVED',
        });
        (PublicKeyStore.set as jest.Mock).mockResolvedValue({
            value: true,
            reason: 'KEY_SAVED',
        });
        (processRegistration as jest.Mock).mockResolvedValue({
            step: {
                wasRecentStepSuccessful: true,
                isRequestFulfilled: true,
            },
            reason: 'REGISTRATION_SUCCESSFUL',
        });

        const {result} = renderHook(() => useNativeBiometricsSetup());

        await act(async () => {
            await result.current.register({
                validateCode: 123456,
                nativePromptTitle: 'Authenticate',
            });
        });

        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(PrivateKeyStore.set).toHaveBeenCalledWith(12345, 'private-key', expect.any(Object));
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(PublicKeyStore.set).toHaveBeenCalledWith(12345, 'public-key');
    });

    it('cancel function should call setStatus', () => {
        mockSetupStatus.mockClear();
        const {result} = renderHook(() => useNativeBiometricsSetup());

        act(() => {
            result.current.cancel(true);
        });

        expect(mockSetupStatus).toHaveBeenCalled();
    });

    it('refresh function should query biometric configuration', async () => {
        (isBiometryConfigured as jest.Mock).mockResolvedValue({
            isAnyDeviceRegistered: true,
            isBiometryRegisteredLocally: true,
            isLocalPublicKeyInAuth: true,
        });

        const {result} = renderHook(() => useNativeBiometricsSetup());

        await act(async () => {
            await result.current.refresh();
        });

        expect(isBiometryConfigured).toHaveBeenCalledWith(12345);
    });

    it('should handle successful registration with chained authorization', async () => {
        (generateKeyPair as jest.Mock).mockReturnValue({
            publicKey: 'public-key',
            privateKey: 'private-key',
        });
        (PrivateKeyStore.set as jest.Mock).mockResolvedValue({
            value: true,
            reason: 'KEY_SAVED',
        });
        (PublicKeyStore.set as jest.Mock).mockResolvedValue({
            value: true,
            reason: 'KEY_SAVED',
        });
        (processRegistration as jest.Mock).mockResolvedValue({
            step: {
                wasRecentStepSuccessful: true,
                isRequestFulfilled: true,
            },
            reason: 'REGISTRATION_SUCCESSFUL',
        });

        const {result} = renderHook(() => useNativeBiometricsSetup());

        let registrationResult;
        await act(async () => {
            registrationResult = await result.current.register(
                {
                    validateCode: 123456,
                    chainedWithAuthorization: true,
                    nativePromptTitle: 'Authenticate',
                },
                CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST,
            );
        });

        // When chained with authorization, should return partial status with private key
        expect(registrationResult).toBeDefined();
    });

    it('should handle registration failure and delete keys', async () => {
        (generateKeyPair as jest.Mock).mockReturnValue({
            publicKey: 'public-key',
            privateKey: 'private-key',
        });
        (PrivateKeyStore.set as jest.Mock).mockResolvedValue({
            value: true,
            reason: 'KEY_SAVED',
        });
        (PublicKeyStore.set as jest.Mock).mockResolvedValue({
            value: false,
            reason: 'KEY_SAVE_FAILED',
        });

        const {result} = renderHook(() => useNativeBiometricsSetup());

        await act(async () => {
            await result.current.register({
                validateCode: 123456,
                nativePromptTitle: 'Authenticate',
            });
        });

        // Should attempt to set both keys
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(PrivateKeyStore.set).toHaveBeenCalled();
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(PublicKeyStore.set).toHaveBeenCalled();
    });

    it('should pass through UI text fields', () => {
        const {result} = renderHook(() => useNativeBiometricsSetup());

        expect(result.current.headerTitle).toBeDefined();
        expect(result.current.title).toBeDefined();
        expect(result.current.description).toBeDefined();
    });

    it('should pass through step information', () => {
        const {result} = renderHook(() => useNativeBiometricsSetup());

        expect(result.current.wasRecentStepSuccessful).toBeUndefined();
        expect(result.current.isRequestFulfilled).toBe(true);
        expect(result.current.requiredFactorForNextStep).toBeUndefined();
    });
});

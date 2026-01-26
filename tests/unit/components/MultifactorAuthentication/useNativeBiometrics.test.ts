import {act, renderHook} from '@testing-library/react-native';
import useNativeBiometrics from '@components/MultifactorAuthentication/useNativeBiometrics';
import MultifactorAuthenticationChallenge from '@libs/MultifactorAuthentication/Biometrics/Challenge';
import type {MultifactorAuthenticationPartialStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';

jest.mock('@components/MultifactorAuthentication/config', () => ({
    MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'BIOMETRICS-TEST': {
            nativePromptTitle: 'multifactorAuthentication.biometricsTest.promptTitle',
        },
    },
}));

jest.mock('@components/MultifactorAuthentication/useNativeBiometrics/useNativeBiometricsSetup', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        wasRecentStepSuccessful: false,
        isRequestFulfilled: true,
        requiredFactorForNextStep: undefined,
        deviceSupportBiometrics: true,
        headerTitle: 'Test',
        title: 'Test',
        description: 'Test',
        register: jest.fn(),
        cancel: jest.fn(),
        refresh: jest.fn(),
    }),
}));

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

const mockSetStatus = jest.fn((status: MultifactorAuthenticationPartialStatus<unknown>) => {
    if (typeof status === 'object') {
        return status;
    }
    return status;
});

jest.mock('@components/MultifactorAuthentication/useMultifactorAuthenticationStatus', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => [
        {
            value: false,
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
        mockSetStatus,
    ],
}));

jest.mock('@libs/MultifactorAuthentication/Biometrics/Challenge');

describe('useNativeBiometrics hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return hook with required properties', () => {
        const {result} = renderHook(() => useNativeBiometrics());

        expect(result.current).toHaveProperty('status');
        expect(result.current).toHaveProperty('authorize');
        expect(result.current).toHaveProperty('cancel');
        expect(result.current).toHaveProperty('setup');
    });

    it('should have authorization status initialized', () => {
        const {result} = renderHook(() => useNativeBiometrics());

        expect(result.current.status).toBeDefined();
        expect(result.current.status.value).toBe(false);
    });

    it('should have authorize function', () => {
        const {result} = renderHook(() => useNativeBiometrics());

        expect(typeof result.current.authorize).toBe('function');
    });

    it('should have cancel function', () => {
        const {result} = renderHook(() => useNativeBiometrics());

        expect(typeof result.current.cancel).toBe('function');
    });

    it('should have setup object with registration capabilities', () => {
        const {result} = renderHook(() => useNativeBiometrics());

        expect(result.current.setup).toBeDefined();
        expect(result.current.setup).toHaveProperty('register');
        expect(result.current.setup).toHaveProperty('cancel');
        expect(result.current.setup).toHaveProperty('refresh');
    });

    it('should handle authorization with valid scenario', async () => {
        const mockChallenge = {
            request: jest.fn().mockResolvedValue({value: 'challenge-data'}),
            sign: jest.fn().mockResolvedValue({value: 'signed-challenge'}),
            send: jest.fn().mockResolvedValue({value: true, reason: 'Authorization successful'}),
        };

        (MultifactorAuthenticationChallenge as jest.Mock).mockImplementation(() => mockChallenge);

        const {result} = renderHook(() => useNativeBiometrics());

        await act(async () => {
            await result.current.authorize(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST, {});
        });

        expect(MultifactorAuthenticationChallenge).toHaveBeenCalledWith(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST, expect.any(Object), expect.any(Object));
    });

    it('should handle authorization error when challenge request fails', async () => {
        const mockChallenge = {
            request: jest.fn().mockResolvedValue({value: null, reason: 'Challenge request failed'}),
            sign: jest.fn(),
            send: jest.fn(),
        };

        (MultifactorAuthenticationChallenge as jest.Mock).mockImplementation(() => mockChallenge);

        const {result} = renderHook(() => useNativeBiometrics());

        await act(async () => {
            await result.current.authorize(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST, {});
        });

        // Challenge should be requested but not signed if request fails
        expect(mockChallenge.request).toHaveBeenCalled();
    });

    it('should handle authorization error when signing fails', async () => {
        const mockChallenge = {
            request: jest.fn().mockResolvedValue({value: 'challenge-data'}),
            sign: jest.fn().mockResolvedValue({value: null, reason: 'Signing failed'}),
            send: jest.fn(),
        };

        (MultifactorAuthenticationChallenge as jest.Mock).mockImplementation(() => mockChallenge);

        const {result} = renderHook(() => useNativeBiometrics());

        await act(async () => {
            await result.current.authorize(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST, {});
        });

        expect(mockChallenge.request).toHaveBeenCalled();
        expect(mockChallenge.sign).toHaveBeenCalled();
    });

    it('cancel function should call setStatus with correct parameters', () => {
        const {result} = renderHook(() => useNativeBiometrics());

        act(() => {
            result.current.cancel(true);
        });

        expect(mockSetStatus).toHaveBeenCalled();
    });

    it('cancel function should handle undefined success flag', () => {
        mockSetStatus.mockClear();
        const {result} = renderHook(() => useNativeBiometrics());

        act(() => {
            result.current.cancel();
        });

        expect(mockSetStatus).toHaveBeenCalled();
    });

    it('setup should provide biometric configuration utilities', () => {
        const {result} = renderHook(() => useNativeBiometrics());
        const {setup} = result.current;

        expect(setup.deviceSupportBiometrics).toBeDefined();
        expect(typeof setup.register).toBe('function');
        expect(typeof setup.cancel).toBe('function');
        expect(typeof setup.refresh).toBe('function');
    });

    it('should initialize with chained private key status in authorize params', async () => {
        const mockChallenge = {
            request: jest.fn().mockResolvedValue({value: 'challenge-data'}),
            sign: jest.fn().mockResolvedValue({value: 'signed-challenge'}),
            send: jest.fn().mockResolvedValue({value: true}),
        };

        (MultifactorAuthenticationChallenge as jest.Mock).mockImplementation(() => mockChallenge);

        const {result} = renderHook(() => useNativeBiometrics());

        const chainedKeyStatus = {
            value: 'chained-private-key',
            reason: 'Key successfully retrieved from SecureStore',
            step: {
                wasRecentStepSuccessful: true,
                isRequestFulfilled: false,
                requiredFactorForNextStep: undefined,
            },
        } as const;

        await act(async () => {
            await result.current.authorize(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST, {
                chainedPrivateKeyStatus: chainedKeyStatus,
            });
        });

        expect(mockChallenge.sign).toHaveBeenCalledWith(12345, chainedKeyStatus);
    });
});

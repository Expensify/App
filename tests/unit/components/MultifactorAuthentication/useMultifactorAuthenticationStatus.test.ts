import {act, renderHook} from '@testing-library/react-native';
import type {MultifactorAuthenticationScenario} from '@components/MultifactorAuthentication/config/types';
import useMultifactorAuthenticationStatus from '@components/MultifactorAuthentication/Context/useMultifactorAuthenticationStatus';
import type {MultifactorAuthenticationPartialStatus} from '@libs/MultifactorAuthentication/Biometrics/types';
import CONST from '@src/CONST';

// Mock useLocalize
jest.mock('@hooks/useLocalize', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __esModule: true,
    default: () => ({
        translate: (key: string) => `translated_${key}`,
    }),
}));

// Mock all the dependency helpers with proper implementations
jest.mock('@components/MultifactorAuthentication/Context/helpers', () => ({
    getAuthTypeName: jest.fn(() => 'BIOMETRICS'),
    getOutcomePaths: jest.fn(() => {
        // Always return valid outcome paths that exist in the config mock
        return {
            successOutcome: 'biometrics-test-success',
            failureOutcome: 'biometrics-test-failure',
        };
    }),
    isValidScenario: jest.fn((scenario: MultifactorAuthenticationScenario) => scenario === 'BIOMETRICS-TEST'),
    shouldClearScenario: jest.fn(() => true),
    resetKeys: jest.fn(),
    Status: {
        createEmptyStatus: jest.fn((initialValue: unknown, {headerTitle, title, description}: {headerTitle: string; title: string; description: string}) => ({
            value: initialValue,
            reason: 'NO_ACTION_MADE_YET',
            headerTitle,
            title,
            description,
            outcomePaths: {
                successOutcome: 'biometrics-test-success',
                failureOutcome: 'biometrics-test-failure',
            },
            scenario: undefined,
            step: {
                wasRecentStepSuccessful: undefined,
                requiredFactorForNextStep: undefined,
                isRequestFulfilled: true,
            },
            typeName: undefined,
        })),
    },
}));

// Mock config module with proper translation paths
jest.mock('@components/MultifactorAuthentication/config', () => {
    const successOutcome = {
        headerTitle: 'multifactorAuthentication.biometricsTest.authenticationSuccessful',
        title: 'multifactorAuthentication.biometricsTest.biometricsAuthentication',
        description: 'common.success',
    };

    const failureOutcome = {
        headerTitle: 'multifactorAuthentication.oops',
        title: 'multifactorAuthentication.biometricsTest.yourAttemptWasUnsuccessful',
        description: 'multifactorAuthentication.biometricsTest.youCouldNotBeAuthenticated',
    };

    /* eslint-disable @typescript-eslint/naming-convention */
    const outcomeMap = {
        'biometrics-test-success': successOutcome,
        'biometrics-test-failure': failureOutcome,
    };
    /* eslint-enable @typescript-eslint/naming-convention */

    return {
        MULTIFACTOR_AUTHENTICATION_DEFAULT_UI: {
            OUTCOMES: {
                failure: failureOutcome,
            },
        },
        MULTIFACTOR_AUTHENTICATION_OUTCOME_MAP: outcomeMap,
    };
});

describe('useMultifactorAuthenticationStatus hook', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should initialize with provided initial value', () => {
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(true));
        const [status] = result.current;

        expect(status.value).toBe(true);
    });

    it('should return tuple with status and setter function', () => {
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(null));

        expect(Array.isArray(result.current)).toBe(true);
        expect(result.current).toHaveLength(2);
        expect(typeof result.current[0]).toBe('object');
        expect(typeof result.current[1]).toBe('function');
    });

    it('should have initialized UI text fields', () => {
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(null));
        const [status] = result.current;

        expect(status.headerTitle).toBeDefined();
        expect(status.title).toBeDefined();
        expect(status.description).toBeDefined();
        expect(typeof status.headerTitle).toBe('string');
        expect(typeof status.title).toBe('string');
        expect(typeof status.description).toBe('string');
    });

    it('should have outcome paths', () => {
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(null));
        const [status] = result.current;

        expect(status.outcomePaths).toBeDefined();
        expect(status.outcomePaths.successOutcome).toBeDefined();
        expect(status.outcomePaths.failureOutcome).toBeDefined();
    });

    it('should have step field initialized', () => {
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(null));
        const [status] = result.current;

        expect(status.step).toBeDefined();
        expect(status.step.wasRecentStepSuccessful).toBeUndefined();
        expect(status.step.isRequestFulfilled).toBe(true);
    });

    it('should support different value types', () => {
        const numberHook = renderHook(() => useMultifactorAuthenticationStatus(42));
        const stringHook = renderHook(() => useMultifactorAuthenticationStatus('test'));
        const objectHook = renderHook(() => useMultifactorAuthenticationStatus({data: 'value'}));

        expect(numberHook.result.current[0].value).toBe(42);
        expect(stringHook.result.current[0].value).toBe('test');
        expect(objectHook.result.current[0].value).toEqual({data: 'value'});
    });

    it('should accept optional success selector parameter', () => {
        const successSelector = jest.fn(() => true);
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(null, successSelector));

        expect(result.current[0]).toBeDefined();
        expect(typeof result.current[1]).toBe('function');
    });

    it('should have a callable setter function with required parameters', () => {
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(null));
        const [, setStatus] = result.current;

        expect(typeof setStatus).toBe('function');
        expect(setStatus.length).toBeGreaterThanOrEqual(2); // At least 2 parameters (partialStatus, scenario)
    });

    it('should update value when using partial status with scenario', () => {
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(false));

        act(() => {
            const [, setStatus] = result.current;
            const partialStatus: MultifactorAuthenticationPartialStatus<boolean> = {
                value: true,
                reason: 'No action has been made yet',
                step: {
                    wasRecentStepSuccessful: true,
                    requiredFactorForNextStep: undefined,
                    isRequestFulfilled: true,
                },
            };
            setStatus(partialStatus, CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST);
        });

        const [updatedStatus] = result.current;
        expect(updatedStatus.value).toBe(true);
    });

    it('should handle function-based status updates that modify value', () => {
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(5));

        act(() => {
            const [, setStatus] = result.current;
            setStatus(
                (prevStatus) => ({
                    ...prevStatus,
                    value: prevStatus.value + 1,
                    reason: 'No action has been made yet',
                    step: {
                        ...prevStatus.step,
                        wasRecentStepSuccessful: true,
                    },
                }),
                CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST,
            );
        });

        const [updatedStatus] = result.current;
        expect(updatedStatus.value).toBe(6);
    });

    it('should support custom success selector parameter', () => {
        const successSelector = jest.fn((status: MultifactorAuthenticationPartialStatus<unknown>) => status.value === true);
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(false, successSelector));

        const [status, setStatus] = result.current;
        expect(status.value).toBe(false);
        expect(typeof setStatus).toBe('function');
        expect(successSelector).toBeDefined();
    });

    it('should accept valid scenario and update outcome paths', () => {
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(null));

        act(() => {
            const [, setStatus] = result.current;
            const partialStatus: MultifactorAuthenticationPartialStatus<null> = {
                value: null,
                reason: 'No action has been made yet',
                step: {
                    wasRecentStepSuccessful: false,
                    requiredFactorForNextStep: undefined,
                    isRequestFulfilled: true,
                },
            };
            setStatus(partialStatus, 'BIOMETRICS-TEST');
        });

        const [updatedStatus] = result.current;
        // Scenario should be set when valid
        expect(updatedStatus.scenario).toBeDefined();
        expect(updatedStatus.outcomePaths).toBeDefined();
    });

    it('should update state and outcome paths on multiple calls', () => {
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(false));

        act(() => {
            const [, setStatus] = result.current;
            setStatus(
                {
                    value: true,
                    reason: 'No action has been made yet',
                    step: {
                        wasRecentStepSuccessful: true,
                        requiredFactorForNextStep: undefined,
                        isRequestFulfilled: true,
                    },
                },
                'BIOMETRICS-TEST',
            );
        });

        const [status1] = result.current;
        expect(status1.value).toBe(true);

        act(() => {
            const [, setStatus] = result.current;
            setStatus(
                {
                    value: false,
                    reason: 'No action has been made yet',
                    step: {
                        wasRecentStepSuccessful: false,
                        requiredFactorForNextStep: undefined,
                        isRequestFulfilled: true,
                    },
                },
                'BIOMETRICS-TEST',
            );
        });

        const [status2] = result.current;
        expect(status2.value).toBe(false);
    });

    it('should have undefined scenario initially', () => {
        const {result} = renderHook(() => useMultifactorAuthenticationStatus(null));
        const [status] = result.current;

        expect(status.scenario).toBeUndefined();
    });
});

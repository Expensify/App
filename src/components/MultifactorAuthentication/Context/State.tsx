import React, {createContext, useContext, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioAdditionalParams} from '@components/MultifactorAuthentication/config/types';
import type {MarqetaAuthTypeName, MultifactorAuthenticationReason, OutcomePaths} from '@libs/MultifactorAuthentication/Biometrics/types';

type ErrorState = {
    reason: MultifactorAuthenticationReason;
    message?: string;
};

type MultifactorAuthenticationState = {
    /** Current error state */
    error: ErrorState | undefined;

    /** Validate code entered by user */
    validateCode: string | undefined;

    /** Whether user approved the soft prompt for biometric setup */
    softPromptApproved: boolean | undefined;

    /** Current scenario being executed */
    scenario: MultifactorAuthenticationScenario | undefined;

    /** Additional parameters for the current scenario */
    payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined;

    /** Outcome paths for navigation after authentication completes */
    outcomePaths: OutcomePaths | undefined;

    /** Whether registration step has been completed */
    isRegistrationComplete: boolean;

    /** Whether authorization step has been completed */
    isAuthorizationComplete: boolean;

    /** Whether the entire flow has been completed */
    isFlowComplete: boolean;

    /** Authentication method used (e.g., 'BIOMETRIC_FACE', 'BIOMETRIC_FINGERPRINT') */
    authenticationMethod: MarqetaAuthTypeName | undefined;
};

type MultifactorAuthenticationStateContextValue = {
    state: MultifactorAuthenticationState;

    /** Set error state */
    setError: (error: ErrorState | undefined) => void;

    /** Set validate code */
    setValidateCode: (validateCode: string | undefined) => void;

    /** Set soft prompt approved state */
    setSoftPromptApproved: (approved: boolean | undefined) => void;

    /** Set current scenario */
    setScenario: (scenario: MultifactorAuthenticationScenario | undefined) => void;

    /** Set payload for current scenario */
    setPayload: (payload: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined) => void;

    /** Set outcome paths */
    setOutcomePaths: (outcomePaths: OutcomePaths | undefined) => void;

    /** Set registration complete state */
    setIsRegistrationComplete: (isComplete: boolean) => void;

    /** Set authorization complete state */
    setIsAuthorizationComplete: (isComplete: boolean) => void;

    /** Set flow complete state */
    setIsFlowComplete: (isComplete: boolean) => void;

    /** Set authentication method */
    setAuthenticationMethod: (method: MarqetaAuthTypeName | undefined) => void;

    /** Reset all state to initial values */
    reset: () => void;
};

const DEFAULT_STATE: MultifactorAuthenticationState = {
    error: undefined,
    validateCode: undefined,
    softPromptApproved: undefined,
    scenario: undefined,
    payload: undefined,
    outcomePaths: undefined,
    isRegistrationComplete: false,
    isAuthorizationComplete: false,
    isFlowComplete: false,
    authenticationMethod: undefined,
};

const MultifactorAuthenticationStateContext = createContext<MultifactorAuthenticationStateContextValue | undefined>(undefined);

type MultifactorAuthenticationStateProviderProps = {
    children: ReactNode;
};

function MultifactorAuthenticationStateProvider({children}: MultifactorAuthenticationStateProviderProps) {
    const [error, setErrorInternal] = useState<ErrorState | undefined>(DEFAULT_STATE.error);
    const [validateCode, setValidateCodeInternal] = useState<string | undefined>(DEFAULT_STATE.validateCode);
    const [softPromptApproved, setSoftPromptApprovedInternal] = useState<boolean | undefined>(DEFAULT_STATE.softPromptApproved);
    const [scenario, setScenarioInternal] = useState<MultifactorAuthenticationScenario | undefined>(DEFAULT_STATE.scenario);
    const [payload, setPayloadInternal] = useState<MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined>(DEFAULT_STATE.payload);
    const [outcomePaths, setOutcomePathsInternal] = useState<OutcomePaths | undefined>(DEFAULT_STATE.outcomePaths);
    const [isRegistrationComplete, setIsRegistrationCompleteInternal] = useState<boolean>(DEFAULT_STATE.isRegistrationComplete);
    const [isAuthorizationComplete, setIsAuthorizationCompleteInternal] = useState<boolean>(DEFAULT_STATE.isAuthorizationComplete);
    const [isFlowComplete, setIsFlowCompleteInternal] = useState<boolean>(DEFAULT_STATE.isFlowComplete);
    const [authenticationMethod, setAuthenticationMethodInternal] = useState<MarqetaAuthTypeName | undefined>(DEFAULT_STATE.authenticationMethod);

    const setError = (value: ErrorState | undefined) => {
        setErrorInternal(value);
    };
    const setValidateCode = (value: string | undefined) => {
        setValidateCodeInternal(value);
    };
    const setSoftPromptApproved = (value: boolean | undefined) => {
        setSoftPromptApprovedInternal(value);
    };
    const setScenario = (value: MultifactorAuthenticationScenario | undefined) => {
        setScenarioInternal(value);
    };
    const setPayload = (value: MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined) => {
        setPayloadInternal(value);
    };
    const setOutcomePaths = (value: OutcomePaths | undefined) => {
        setOutcomePathsInternal(value);
    };
    const setIsRegistrationComplete = (value: boolean) => {
        setIsRegistrationCompleteInternal(value);
    };
    const setIsAuthorizationComplete = (value: boolean) => {
        setIsAuthorizationCompleteInternal(value);
    };
    const setIsFlowComplete = (value: boolean) => {
        setIsFlowCompleteInternal(value);
    };
    const setAuthenticationMethod = (value: MarqetaAuthTypeName | undefined) => {
        setAuthenticationMethodInternal(value);
    };

    const reset = () => {
        setErrorInternal(DEFAULT_STATE.error);
        setValidateCodeInternal(DEFAULT_STATE.validateCode);
        setSoftPromptApprovedInternal(DEFAULT_STATE.softPromptApproved);
        setScenarioInternal(DEFAULT_STATE.scenario);
        setPayloadInternal(DEFAULT_STATE.payload);
        setOutcomePathsInternal(DEFAULT_STATE.outcomePaths);
        setIsRegistrationCompleteInternal(DEFAULT_STATE.isRegistrationComplete);
        setIsAuthorizationCompleteInternal(DEFAULT_STATE.isAuthorizationComplete);
        setIsFlowCompleteInternal(DEFAULT_STATE.isFlowComplete);
        setAuthenticationMethodInternal(DEFAULT_STATE.authenticationMethod);
    };

    const state: MultifactorAuthenticationState = useMemo(
        () => ({
            error,
            validateCode,
            softPromptApproved,
            scenario,
            payload,
            outcomePaths,
            isRegistrationComplete,
            isAuthorizationComplete,
            isFlowComplete,
            authenticationMethod,
        }),
        [authenticationMethod, error, isAuthorizationComplete, isFlowComplete, isRegistrationComplete, outcomePaths, payload, scenario, softPromptApproved, validateCode],
    );

    const contextValue: MultifactorAuthenticationStateContextValue = useMemo(
        () => ({
            state,
            setError,
            setValidateCode,
            setSoftPromptApproved,
            setScenario,
            setPayload,
            setOutcomePaths,
            setIsRegistrationComplete,
            setIsAuthorizationComplete,
            setIsFlowComplete,
            setAuthenticationMethod,
            reset,
        }),
        [state],
    );

    return <MultifactorAuthenticationStateContext.Provider value={contextValue}>{children}</MultifactorAuthenticationStateContext.Provider>;
}

function useMultifactorAuthenticationState(): MultifactorAuthenticationStateContextValue {
    const context = useContext(MultifactorAuthenticationStateContext);

    if (!context) {
        throw new Error('useMultifactorAuthenticationState must be used within a MultifactorAuthenticationStateProvider');
    }

    return context;
}

MultifactorAuthenticationStateProvider.displayName = 'MultifactorAuthenticationStateProvider';

export default MultifactorAuthenticationStateProvider;
export {useMultifactorAuthenticationState, MultifactorAuthenticationStateContext, DEFAULT_STATE};
export type {MultifactorAuthenticationState, MultifactorAuthenticationStateContextValue, ErrorState};

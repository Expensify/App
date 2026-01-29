import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioAdditionalParams} from '@components/MultifactorAuthentication/config/types';
import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/Biometrics/ED25519/types';
import type {MarqetaAuthTypeName, MultifactorAuthenticationReason, OutcomePaths} from '@libs/MultifactorAuthentication/Biometrics/types';
import {isContinuableReason} from '@libs/MultifactorAuthentication/Biometrics/VALUES';

type ErrorState = {
    reason: MultifactorAuthenticationReason;
    message?: string;
};

type MultifactorAuthenticationState = {
    /** Current error state - stops the flow and navigates to failure outcome */
    error: ErrorState | undefined;

    /** Continuable error - displayed on current screen without stopping the flow */
    continuableError: ErrorState | undefined;

    /** Validate code entered by user */
    validateCode: string | undefined;

    /** Challenge received from backend for registration (full object with user, rp, challenge) */
    registrationChallenge: RegistrationChallenge | undefined;

    /** Challenge received from backend for authorization (full object with allowCredentials, rpId, challenge) */
    authorizationChallenge: AuthenticationChallenge | undefined;

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

    /** Set error state - automatically routes to error or continuableError based on reason */
    setError: (error: ErrorState | undefined) => void;

    /** Clear continuable error */
    clearContinuableError: () => void;

    /** Set validate code */
    setValidateCode: (validateCode: string | undefined) => void;

    /** Set registration challenge */
    setRegistrationChallenge: (challenge: RegistrationChallenge | undefined) => void;

    /** Set authorization challenge */
    setAuthorizationChallenge: (challenge: AuthenticationChallenge | undefined) => void;

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
    continuableError: undefined,
    validateCode: undefined,
    registrationChallenge: undefined,
    authorizationChallenge: undefined,
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
    const [continuableError, setContinuableErrorInternal] = useState<ErrorState | undefined>(DEFAULT_STATE.continuableError);
    const [validateCode, setValidateCodeInternal] = useState<string | undefined>(DEFAULT_STATE.validateCode);
    const [registrationChallenge, setRegistrationChallengeInternal] = useState<RegistrationChallenge | undefined>(DEFAULT_STATE.registrationChallenge);
    const [authorizationChallenge, setAuthorizationChallengeInternal] = useState<AuthenticationChallenge | undefined>(DEFAULT_STATE.authorizationChallenge);
    const [softPromptApproved, setSoftPromptApprovedInternal] = useState<boolean | undefined>(DEFAULT_STATE.softPromptApproved);
    const [scenario, setScenarioInternal] = useState<MultifactorAuthenticationScenario | undefined>(DEFAULT_STATE.scenario);
    const [payload, setPayloadInternal] = useState<MultifactorAuthenticationScenarioAdditionalParams<MultifactorAuthenticationScenario> | undefined>(DEFAULT_STATE.payload);
    const [outcomePaths, setOutcomePathsInternal] = useState<OutcomePaths | undefined>(DEFAULT_STATE.outcomePaths);
    const [isRegistrationComplete, setIsRegistrationCompleteInternal] = useState<boolean>(DEFAULT_STATE.isRegistrationComplete);
    const [isAuthorizationComplete, setIsAuthorizationCompleteInternal] = useState<boolean>(DEFAULT_STATE.isAuthorizationComplete);
    const [isFlowComplete, setIsFlowCompleteInternal] = useState<boolean>(DEFAULT_STATE.isFlowComplete);
    const [authenticationMethod, setAuthenticationMethodInternal] = useState<MarqetaAuthTypeName | undefined>(DEFAULT_STATE.authenticationMethod);

    const setError = useCallback((value: ErrorState | undefined) => {
        if (value === undefined) {
            setErrorInternal(undefined);
            setContinuableErrorInternal(undefined);
            return;
        }

        // Route to appropriate state based on whether the reason is continuable
        if (isContinuableReason(value.reason)) {
            setContinuableErrorInternal(value);
            setErrorInternal(undefined);
        } else {
            setErrorInternal(value);
            setContinuableErrorInternal(undefined);
        }
    }, []);

    const clearContinuableError = useCallback(() => {
        setContinuableErrorInternal(undefined);
    }, []);
    const setValidateCode = (value: string | undefined) => {
        setValidateCodeInternal(value);
    };
    const setRegistrationChallenge = (challenge: RegistrationChallenge | undefined) => {
        setRegistrationChallengeInternal(challenge);
    };
    const setAuthorizationChallenge = (challenge: AuthenticationChallenge | undefined) => {
        setAuthorizationChallengeInternal(challenge);
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
        setContinuableErrorInternal(DEFAULT_STATE.continuableError);
        setValidateCodeInternal(DEFAULT_STATE.validateCode);
        setRegistrationChallengeInternal(DEFAULT_STATE.registrationChallenge);
        setAuthorizationChallengeInternal(DEFAULT_STATE.authorizationChallenge);
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
            continuableError,
            validateCode,
            registrationChallenge,
            authorizationChallenge,
            softPromptApproved,
            scenario,
            payload,
            outcomePaths,
            isRegistrationComplete,
            isAuthorizationComplete,
            isFlowComplete,
            authenticationMethod,
        }),
        [
            authenticationMethod,
            authorizationChallenge,
            continuableError,
            error,
            isAuthorizationComplete,
            isFlowComplete,
            isRegistrationComplete,
            outcomePaths,
            payload,
            registrationChallenge,
            scenario,
            softPromptApproved,
            validateCode,
        ],
    );

    const contextValue: MultifactorAuthenticationStateContextValue = useMemo(
        () => ({
            state,
            setError,
            clearContinuableError,
            setValidateCode,
            setRegistrationChallenge,
            setAuthorizationChallenge,
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
        [clearContinuableError, setError, state],
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

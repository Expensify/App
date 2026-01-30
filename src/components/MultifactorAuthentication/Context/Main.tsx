import React, {createContext, useCallback, useContext, useEffect, useMemo} from 'react';
import type {ReactNode} from 'react';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import {getOutcomePath, getOutcomePaths} from '@components/MultifactorAuthentication/config/outcomePaths';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from '@components/MultifactorAuthentication/config/types';
import useLocalize from '@hooks/useLocalize';
import {requestValidateCodeAction} from '@libs/actions/User';
import {isContinuableReason} from '@libs/MultifactorAuthentication/Biometrics/helpers';
import type {OutcomePaths} from '@libs/MultifactorAuthentication/Biometrics/types';
import Navigation from '@navigation/Navigation';
import {requestAuthorizationChallenge, requestRegistrationChallenge} from '@userActions/MultifactorAuthentication';
import {processRegistration, processScenario} from '@userActions/MultifactorAuthentication/processing';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import {useMultifactorAuthenticationState} from './State';
import useNativeBiometrics from './useNativeBiometrics';
import type {AuthorizeResult, RegisterResult} from './useNativeBiometrics';

type ExecuteScenarioParams<T extends MultifactorAuthenticationScenario> = MultifactorAuthenticationScenarioParams<T> & Partial<OutcomePaths>;

type MultifactorAuthenticationContextValue = {
    /** Execute a multifactor authentication scenario */
    executeScenario: <T extends MultifactorAuthenticationScenario>(scenario: T, params?: ExecuteScenarioParams<T>) => Promise<void>;

    /** Cancel the current authentication flow and navigate to failure outcome */
    cancel: () => void;
};

const MultifactorAuthenticationContext = createContext<MultifactorAuthenticationContextValue | undefined>(undefined);

type MultifactorAuthenticationContextProviderProps = {
    children: ReactNode;
};

function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    const {
        state,
        setScenario,
        setPayload,
        setOutcomePaths,
        setError,
        setValidateCode,
        setRegistrationChallenge,
        setAuthorizationChallenge,
        setIsRegistrationComplete,
        setIsAuthorizationComplete,
        setIsFlowComplete,
        setAuthenticationMethod,
    } = useMultifactorAuthenticationState();

    const biometrics = useNativeBiometrics();
    const {translate} = useLocalize();

    /**
     * Internal process function that runs after each step.
     * Uses if statements to determine and execute the next step in the flow.
     */
    const process = useCallback(async () => {
        const {
            error,
            scenario,
            softPromptApproved,
            validateCode,
            registrationChallenge,
            authorizationChallenge,
            payload,
            outcomePaths,
            isRegistrationComplete,
            isAuthorizationComplete,
            isFlowComplete,
        } = state;

        // 0. Check if flow is already complete or scenario not set - do nothing
        if (isFlowComplete || !scenario) {
            return;
        }

        const scenarioLowerCase = scenario.toLowerCase() as Lowercase<MultifactorAuthenticationScenario>;
        const paths = outcomePaths ?? getOutcomePaths(scenario);

        // 1. Check if there's an error - stop processing
        if (error) {
            if (error.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS) {
                const noEligibleMethodsOutcome = getOutcomePath(scenarioLowerCase, 'no-eligible-methods');
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME.getRoute(noEligibleMethodsOutcome));
            } else {
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME.getRoute(paths.failureOutcome));
            }
            setIsFlowComplete(true);
            return;
        }

        // 2. Check if device is compatible
        if (!biometrics.doesDeviceSupportBiometrics()) {
            setError({
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS,
            });
            return;
        }

        // 4. Check if registration is required (not registered yet)
        const isRegistrationRequired = !(await biometrics.isRegisteredInAuth()) && !isRegistrationComplete;

        if (isRegistrationRequired) {
            // Need validate code before registration
            if (!validateCode) {
                requestValidateCodeAction();
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_MAGIC_CODE);
                return;
            }

            // Request registration challenge after validateCode is set
            if (!registrationChallenge) {
                const {challenge, reason: challengeReason} = await requestRegistrationChallenge(validateCode);

                if (!challenge) {
                    // Clear validateCode for continuable errors so user can retry
                    if (isContinuableReason(challengeReason)) {
                        setValidateCode(undefined);
                    }
                    setError({reason: challengeReason});
                    return;
                }

                // Validate that we received a registration challenge (has 'user' and 'rp' properties)
                const isRegistrationChallengeValid = 'user' in challenge && 'rp' in challenge;
                if (!isRegistrationChallengeValid) {
                    setError({reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.INVALID_CHALLENGE_TYPE});
                    return;
                }

                setRegistrationChallenge(challenge);
                return;
            }

            // Check if soft prompt is needed (soft prompt not answered + device supports)
            const isSoftPromptRequired = !softPromptApproved && biometrics.info.deviceSupportsBiometrics;

            if (isSoftPromptRequired) {
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute(CONST.MULTIFACTOR_AUTHENTICATION.PROMPT.ENABLE_BIOMETRICS));
                return;
            }

            const {nativePromptTitle: nativePromptTitleTPath} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];
            const nativePromptTitle = translate(nativePromptTitleTPath);

            if (!registrationChallenge.challenge) {
                setError({
                    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BAD_REQUEST,
                });
                return;
            }

            await biometrics.register({nativePromptTitle}, async (result: RegisterResult) => {
                if (!result.success) {
                    setError({
                        reason: result.reason,
                    });
                    return;
                }

                // Call backend to register the public key
                const registrationResult = await processRegistration({
                    publicKey: result.publicKey,
                    authenticationMethod: result.authenticationMethod,
                    challenge: registrationChallenge.challenge,
                    currentPublicKeyIDs: biometrics.registeredPublicKeyIDs,
                });

                if (!registrationResult.success) {
                    setError({
                        reason: registrationResult.reason,
                    });
                    return;
                }

                setIsRegistrationComplete(true);
            });
            return;
        }

        // 5. Check if authorization is required
        const isAuthorizationRequired = !isAuthorizationComplete;

        if (isAuthorizationRequired) {
            // Request authorization challenge if not already fetched
            if (!authorizationChallenge) {
                const {challenge, reason: challengeReason} = await requestAuthorizationChallenge();

                if (!challenge) {
                    setError({reason: challengeReason});
                    return;
                }

                // Validate that we received an authentication challenge (has 'allowCredentials' and 'rpId' properties)
                const isAuthenticationChallengeValid = 'allowCredentials' in challenge && 'rpId' in challenge;
                if (!isAuthenticationChallengeValid) {
                    setError({reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.INVALID_CHALLENGE_TYPE});
                    return;
                }

                setAuthorizationChallenge(challenge);
                return;
            }

            await biometrics.authorize(
                {
                    scenario,
                    challenge: authorizationChallenge,
                },
                async (result: AuthorizeResult) => {
                    if (!result.success) {
                        // Check if re-registration is needed
                        if (result.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.REGISTRATION_REQUIRED) {
                            await biometrics.resetKeysForAccount();
                            setIsRegistrationComplete(false);
                            setAuthorizationChallenge(undefined);
                        }
                        setError({
                            reason: result.reason,
                        });
                        return;
                    }

                    // Call backend with signed challenge
                    const scenarioResult = await processScenario(scenario, {
                        signedChallenge: result.signedChallenge,
                        authenticationMethod: result.authenticationMethod,
                        ...payload,
                    });

                    if (!scenarioResult.success) {
                        setError({
                            reason: scenarioResult.reason,
                        });
                        return;
                    }

                    setAuthenticationMethod(result.authenticationMethod);
                    setIsAuthorizationComplete(true);
                },
            );
            return;
        }

        // 6. All steps completed - success
        Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME.getRoute(paths.successOutcome));
        setIsFlowComplete(true);
    }, [
        biometrics,
        setAuthenticationMethod,
        setAuthorizationChallenge,
        setError,
        setIsAuthorizationComplete,
        setIsFlowComplete,
        setIsRegistrationComplete,
        setRegistrationChallenge,
        setValidateCode,
        state,
        translate,
    ]);

    // Run process on every relevant state change, but only after executeScenario has been called
    useEffect(() => {
        if (!state.scenario) {
            return;
        }

        process();
        // We intentionally omit `process` and `state` from dependencies.
        // Including them would cause infinite re-renders since `process` is recreated on every state change.
        // Instead, we list only the specific state fields that should trigger a re-run of the MFA flow.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        state.error,
        state.scenario,
        state.softPromptApproved,
        state.validateCode,
        state.registrationChallenge,
        state.authorizationChallenge,
        state.isRegistrationComplete,
        state.isAuthorizationComplete,
        state.isFlowComplete,
    ]);

    const executeScenario = useCallback(
        async <T extends MultifactorAuthenticationScenario>(scenario: T, params?: ExecuteScenarioParams<T>): Promise<void> => {
            const {successOutcome, failureOutcome, ...payload} = params ?? {};

            // Set initial state
            setScenario(scenario);
            setPayload(Object.keys(payload).length > 0 ? payload : undefined);
            setIsRegistrationComplete(false);
            setIsAuthorizationComplete(false);
            setIsFlowComplete(false);
            setError(undefined);
            setAuthenticationMethod(undefined);

            const paths = getOutcomePaths(scenario);
            setOutcomePaths({
                successOutcome: successOutcome ?? paths.successOutcome,
                failureOutcome: failureOutcome ?? paths.failureOutcome,
            });
        },
        [setAuthenticationMethod, setError, setIsAuthorizationComplete, setIsFlowComplete, setIsRegistrationComplete, setOutcomePaths, setPayload, setScenario],
    );

    /**
     * Cancel the current authentication flow.
     * Sets an error state which triggers navigation to the failure outcome.
     */
    const cancel = useCallback(() => {
        // Set error to trigger failure navigation
        setError({
            reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.EXPO.CANCELED,
        });
    }, [setError]);

    const contextValue: MultifactorAuthenticationContextValue = useMemo(
        () => ({
            executeScenario,
            cancel,
        }),
        [cancel, executeScenario],
    );

    return <MultifactorAuthenticationContext.Provider value={contextValue}>{children}</MultifactorAuthenticationContext.Provider>;
}

function useMultifactorAuthentication(): MultifactorAuthenticationContextValue {
    const context = useContext(MultifactorAuthenticationContext);

    if (!context) {
        throw new Error('useMultifactorAuthentication must be used within a MultifactorAuthenticationContextProviders');
    }

    return context;
}

MultifactorAuthenticationContextProvider.displayName = 'MultifactorAuthenticationContextProvider';

export {useMultifactorAuthentication, MultifactorAuthenticationContext, MultifactorAuthenticationContextProvider};
export type {MultifactorAuthenticationContextValue, ExecuteScenarioParams};

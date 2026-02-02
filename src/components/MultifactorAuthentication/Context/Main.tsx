import React, {createContext, useCallback, useContext, useEffect, useMemo} from 'react';
import type {ReactNode} from 'react';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import {getOutcomePath, getOutcomePaths} from '@components/MultifactorAuthentication/config/outcomePaths';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from '@components/MultifactorAuthentication/config/types';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import {requestValidateCodeAction} from '@libs/actions/User';
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
    const {state, dispatch} = useMultifactorAuthenticationState();

    const biometrics = useNativeBiometrics();
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();

    /**
     * Internal process function that runs after each step.
     * Uses if statements to determine and execute the next step in the flow.
     */
    const process = useCallback(async () => {
        const {
            error,
            continuableError,
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

        // 0. Check if flow is already complete, user is offline or scenario not set - do nothing
        if (isFlowComplete || !scenario || isOffline) {
            return;
        }

        // 0.5 Check if there's a continuable error - pause flow and wait for user to fix it
        // Continuable errors (like invalid validate code) are displayed on the current screen
        // and don't stop the entire flow - the user can retry without restarting
        if (continuableError) {
            return;
        }

        const scenarioLowerCase = scenario.toLowerCase() as Lowercase<MultifactorAuthenticationScenario>;
        const paths = outcomePaths ?? getOutcomePaths(scenario);

        // 1. Check if there's an error - stop processing
        if (error) {
            if (error.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS) {
                const noEligibleMethodsOutcomePath = getOutcomePath(scenarioLowerCase, 'no-eligible-methods');
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME.getRoute(noEligibleMethodsOutcomePath), {forceReplace: true});
            } else {
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME.getRoute(paths.failureOutcome), {forceReplace: true});
            }
            dispatch({type: 'SET_FLOW_COMPLETE', payload: true});
            return;
        }

        // 2. Check if device is compatible
        if (!biometrics.doesDeviceSupportBiometrics()) {
            dispatch({
                type: 'SET_ERROR',
                payload: {
                    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS,
                },
            });
            return;
        }

        // 4. Check if registration is required (local credentials not known to server yet)
        const isRegistrationRequired = !(await biometrics.areLocalCredentialsKnownToServer()) && !isRegistrationComplete;

        if (isRegistrationRequired) {
            // Need validate code before registration
            if (!validateCode) {
                requestValidateCodeAction();
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_MAGIC_CODE, {forceReplace: true});
                return;
            }

            // Request registration challenge after validateCode is set
            if (!registrationChallenge) {
                const {challenge, reason: challengeReason} = await requestRegistrationChallenge(validateCode);

                if (!challenge) {
                    dispatch({type: 'SET_ERROR', payload: {reason: challengeReason}});
                    return;
                }

                // Validate that we received a registration challenge (has 'user' and 'rp' properties)
                const isRegistrationChallengeValid = 'user' in challenge && 'rp' in challenge;
                if (!isRegistrationChallengeValid) {
                    dispatch({type: 'SET_ERROR', payload: {reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.INVALID_CHALLENGE_TYPE}});
                    return;
                }

                dispatch({type: 'SET_REGISTRATION_CHALLENGE', payload: challenge});
                return;
            }

            // Check if soft prompt is needed (device support already verified above)
            const shouldNavigateToPromptPage = !softPromptApproved;

            if (shouldNavigateToPromptPage) {
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute(CONST.MULTIFACTOR_AUTHENTICATION.PROMPT.ENABLE_BIOMETRICS), {forceReplace: true});
                return;
            }

            const {nativePromptTitle: nativePromptTitleTPath} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];
            const nativePromptTitle = translate(nativePromptTitleTPath);

            await biometrics.register({nativePromptTitle}, async (result: RegisterResult) => {
                if (!result.success) {
                    dispatch({
                        type: 'SET_ERROR',
                        payload: {
                            reason: result.reason,
                        },
                    });
                    return;
                }

                // Call backend to register the public key
                const registrationResponse = await processRegistration({
                    publicKey: result.publicKey,
                    authenticationMethod: result.authenticationMethod,
                    challenge: registrationChallenge.challenge,
                    currentPublicKeyIDs: biometrics.serverKnownCredentialIDs,
                });

                if (!registrationResponse.success) {
                    dispatch({
                        type: 'SET_ERROR',
                        payload: {
                            reason: registrationResponse.reason,
                        },
                    });
                    return;
                }

                dispatch({type: 'SET_REGISTRATION_COMPLETE', payload: true});
            });
            return;
        }

        // 5. Authorize the user if that has not already been done
        if (!isAuthorizationComplete) {
            // Request authorization challenge if not already fetched
            if (!authorizationChallenge) {
                const {challenge, reason: challengeReason} = await requestAuthorizationChallenge();

                if (!challenge) {
                    dispatch({type: 'SET_ERROR', payload: {reason: challengeReason}});
                    return;
                }

                // Validate that we received an authentication challenge (has 'allowCredentials' and 'rpId' properties)
                const isAuthenticationChallengeValid = 'allowCredentials' in challenge && 'rpId' in challenge;
                if (!isAuthenticationChallengeValid) {
                    dispatch({type: 'SET_ERROR', payload: {reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.INVALID_CHALLENGE_TYPE}});
                    return;
                }

                dispatch({type: 'SET_AUTHORIZATION_CHALLENGE', payload: challenge});
                return;
            }

            await biometrics.authorize(
                {
                    scenario,
                    challenge: authorizationChallenge,
                },
                async (result: AuthorizeResult) => {
                    if (!result.success) {
                        // Re-registration may be needed even though we checked credentials above, because:
                        // - The local public key was deleted between the check and authorization
                        // - The server no longer accepts the local public key (not in allowCredentials)
                        if (result.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.REGISTRATION_REQUIRED) {
                            await biometrics.resetKeysForAccount();
                            dispatch({type: 'SET_REGISTRATION_COMPLETE', payload: false});
                            dispatch({type: 'SET_AUTHORIZATION_CHALLENGE', payload: undefined});
                        } else {
                            dispatch({
                                type: 'SET_ERROR',
                                payload: {
                                    reason: result.reason,
                                },
                            });
                        }
                        return;
                    }

                    // Call backend with signed challenge
                    const scenarioAPIResponse = await processScenario(scenario, {
                        signedChallenge: result.signedChallenge,
                        authenticationMethod: result.authenticationMethod,
                        ...payload,
                    });

                    if (!scenarioAPIResponse.success) {
                        dispatch({
                            type: 'SET_ERROR',
                            payload: {
                                reason: scenarioAPIResponse.reason,
                            },
                        });
                        return;
                    }

                    dispatch({type: 'SET_AUTHENTICATION_METHOD', payload: result.authenticationMethod});
                    dispatch({type: 'SET_AUTHORIZATION_COMPLETE', payload: true});
                },
            );
            return;
        }

        // 6. All steps completed - success
        Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME.getRoute(paths.successOutcome), {forceReplace: true});
        dispatch({type: 'SET_FLOW_COMPLETE', payload: true});
    }, [biometrics, dispatch, isOffline, state, translate]);

    /**
     * Drives the MFA state machine forward whenever relevant state changes occur.
     * This effect acts as the "engine" that progresses through the authentication flow:
     * - Waits for a scenario to be set via executeScenario() before running
     * - Re-evaluates the flow whenever key state fields change (e.g., validateCode entered, challenge received)
     * - Each run of process() checks current state and advances to the next step or completes the flow
     * */
    useEffect(() => {
        // Don't run until a scenario has been initiated
        if (!state.scenario) {
            return;
        }

        process();
        // We intentionally omit `process` and `state` from dependencies.
        // Including them would cause infinite re-renders since `process` is recreated on every state change.
        // Instead, we list only the specific state fields that should trigger a re-run of the MFA flow.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        // Error states - need to handle failures and navigate to outcome screens
        state.error,
        // Core flow state - which scenario is active
        state.scenario,
        // User interactions - soft prompt approval triggers biometric registration
        state.softPromptApproved,
        // Magic code entry - required before registration challenge can be requested
        state.validateCode,
        // Challenge responses from backend - trigger next steps in registration/authorization
        state.registrationChallenge,
        state.authorizationChallenge,
        // Completion flags - determine whether to continue or finish the flow
        state.isRegistrationComplete,
        state.isAuthorizationComplete,
        state.isFlowComplete,
    ]);

    /**
     * Initiates a multifactor authentication scenario.
     * Dispatches the initial state setup with the specified scenario and optional parameters.
     * The flow will automatically progress through registration (if needed) and authorization steps.
     *
     * @template T - The type of the multifactor authentication scenario
     * @param scenario - The MFA scenario to process
     * @param {ExecuteScenarioParams<T>} [params] - Optional parameters including:
     *   - successOutcome: Navigation route for successful authentication (overrides default)
     *   - failureOutcome: Navigation route for failed authentication (overrides default)
     *   - Additional payload data to pass through the authentication flow
     * @returns {Promise<void>} A promise that resolves when the scenario has been initialized
     */
    const executeScenario = useCallback(
        async <T extends MultifactorAuthenticationScenario>(scenario: T, params?: ExecuteScenarioParams<T>): Promise<void> => {
            const {successOutcome, failureOutcome, ...payload} = params ?? {};
            const paths = getOutcomePaths(scenario);

            dispatch({
                type: 'INIT',
                payload: {
                    scenario,
                    payload: Object.keys(payload).length > 0 ? payload : undefined,
                    outcomePaths: {
                        successOutcome: successOutcome ?? paths.successOutcome,
                        failureOutcome: failureOutcome ?? paths.failureOutcome,
                    },
                },
            });
        },
        [dispatch],
    );

    /**
     * Cancel the current authentication flow.
     * Sets an error state which triggers navigation to the failure outcome.
     */
    const cancel = useCallback(() => {
        // Set error to trigger failure navigation
        dispatch({
            type: 'SET_ERROR',
            payload: {
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.EXPO.CANCELED,
            },
        });
    }, [dispatch]);

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

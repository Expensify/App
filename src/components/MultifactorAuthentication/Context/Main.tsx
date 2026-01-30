import React, {createContext, useCallback, useContext, useEffect, useMemo} from 'react';
import type {ReactNode} from 'react';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import {getOutcomePath, getOutcomePaths} from '@components/MultifactorAuthentication/config/outcomePaths';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from '@components/MultifactorAuthentication/config/types';
import useLocalize from '@hooks/useLocalize';
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
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME.getRoute(noEligibleMethodsOutcome), {forceReplace: true});
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

        // 4. Check if registration is required (not registered yet)
        const isRegistrationRequired = !(await biometrics.isRegisteredInAuth()) && !isRegistrationComplete;

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
                    // For invalid validate code errors, clear the code so user can retry without failing the entire flow
                    if (challengeReason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.INVALID_VALIDATE_CODE) {
                        dispatch({type: 'SET_VALIDATE_CODE', payload: undefined});
                    }
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

            // Check if soft prompt is needed (soft prompt not answered + device supports)
            const isSoftPromptRequired = !softPromptApproved && biometrics.info.deviceSupportsBiometrics;

            if (isSoftPromptRequired) {
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute(CONST.MULTIFACTOR_AUTHENTICATION.PROMPT.ENABLE_BIOMETRICS), {forceReplace: true});
                return;
            }

            const {nativePromptTitle: nativePromptTitleTPath} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];
            const nativePromptTitle = translate(nativePromptTitleTPath);

            if (!registrationChallenge.challenge) {
                dispatch({
                    type: 'SET_ERROR',
                    payload: {
                        reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BAD_REQUEST,
                    },
                });
                return;
            }

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
                const registrationResult = await processRegistration({
                    publicKey: result.publicKey,
                    authenticationMethod: result.authenticationMethod,
                    challenge: registrationChallenge.challenge,
                    currentPublicKeyIDs: biometrics.registeredPublicKeyIDs,
                });

                if (!registrationResult.success) {
                    dispatch({
                        type: 'SET_ERROR',
                        payload: {
                            reason: registrationResult.reason,
                        },
                    });
                    return;
                }

                dispatch({type: 'SET_REGISTRATION_COMPLETE', payload: true});
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
                        // Check if re-registration is needed
                        if (result.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.REGISTRATION_REQUIRED) {
                            await biometrics.resetKeysForAccount();
                            dispatch({type: 'SET_REGISTRATION_COMPLETE', payload: false});
                            dispatch({type: 'SET_AUTHORIZATION_CHALLENGE', payload: undefined});
                        }
                        dispatch({
                            type: 'SET_ERROR',
                            payload: {
                                reason: result.reason,
                            },
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
                        dispatch({
                            type: 'SET_ERROR',
                            payload: {
                                reason: scenarioResult.reason,
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
    }, [biometrics, dispatch, state, translate]);

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

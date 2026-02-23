import React, {createContext, useCallback, useContext, useEffect, useMemo} from 'react';
import type {ReactNode} from 'react';
import Onyx from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from '@components/MultifactorAuthentication/config/types';
import useNetwork from '@hooks/useNetwork';
import {requestValidateCodeAction} from '@libs/actions/User';
import getPlatform from '@libs/getPlatform';
import type {ChallengeType, MultifactorAuthenticationCallbackInput, MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/Biometrics/types';
import Navigation from '@navigation/Navigation';
import {clearLocalMFAPublicKeyList, requestAuthorizationChallenge, requestRegistrationChallenge} from '@userActions/MultifactorAuthentication';
import {processRegistration, processScenarioAction} from '@userActions/MultifactorAuthentication/processing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {DeviceBiometrics} from '@src/types/onyx';
import {useMultifactorAuthenticationActions, useMultifactorAuthenticationState} from './State';
import useNativeBiometrics from './useNativeBiometrics';
import type {AuthorizeResult, RegisterResult} from './useNativeBiometrics';

let deviceBiometricsState: OnyxEntry<DeviceBiometrics>;

// Use Onyx.connectWithoutView instead of useOnyx hook to access the device biometrics state.
// This is a non-reactive read that allows us to check the current value (hasAcceptedSoftPrompt)
// from within the process() callback without triggering calling it too many times during the
// fresh registration flow
Onyx.connectWithoutView({
    key: ONYXKEYS.DEVICE_BIOMETRICS,
    callback: (data) => {
        deviceBiometricsState = data;
    },
});

type ExecuteScenarioParams<T extends MultifactorAuthenticationScenario> = MultifactorAuthenticationScenarioParams<T>;

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

/**
 * Identifies the challenge type based on its properties.
 * Registration challenges (require prior validateCode verification) have 'user' and 'rp'.
 * Authorization challenges (no prior verification) have 'allowCredentials' and 'rpId'.
 */
function getChallengeType(challenge: unknown): ChallengeType | undefined {
    if (typeof challenge === 'object' && challenge !== null) {
        if ('user' in challenge && 'rp' in challenge) {
            return CONST.MULTIFACTOR_AUTHENTICATION.CHALLENGE_TYPE.REGISTRATION;
        }
        if ('allowCredentials' in challenge && 'rpId' in challenge) {
            return CONST.MULTIFACTOR_AUTHENTICATION.CHALLENGE_TYPE.AUTHENTICATION;
        }
    }
    return undefined;
}

function MultifactorAuthenticationContextProvider({children}: MultifactorAuthenticationContextProviderProps) {
    const state = useMultifactorAuthenticationState();
    const {dispatch} = useMultifactorAuthenticationActions();

    const biometrics = useNativeBiometrics();
    const {isOffline} = useNetwork();
    const platform = getPlatform();
    const isWeb = useMemo(() => platform === CONST.PLATFORM.WEB || platform === CONST.PLATFORM.MOBILE_WEB, [platform]);

    /**
     * Handles the completion of a multifactor authentication scenario.
     * Invokes the scenario's callback function and navigates to the appropriate outcome screen.
     * This function is called after the MFA flow completes (either successfully or with failure).
     * It provides the scenario callback with relevant information (HTTP codes, error messages, response body)
     * and then either:
     * 1. Allows the callback to handle navigation (if it returns SKIP_OUTCOME_SCREEN)
     * 2. Navigates to the success/failure outcome screen
     *
     * @param isSuccessful - Whether the authentication scenario completed successfully
     */
    const handleCallback = useCallback(
        async (isSuccessful: boolean) => {
            const {error, scenario, scenarioResponse} = state;

            if (!scenario) {
                return;
            }

            const scenarioConfig = scenario;
            const callbackInput: MultifactorAuthenticationCallbackInput = {
                httpStatusCode: scenarioResponse?.httpStatusCode,
                message: scenarioResponse?.reason ?? error?.reason,
                body: scenarioResponse?.body,
            };

            const callbackResponse = await scenarioConfig.callback?.(isSuccessful, callbackInput);

            // If the callback returns SKIP_OUTCOME_SCREEN, the callback handles navigation itself
            if (callbackResponse === CONST.MULTIFACTOR_AUTHENTICATION.CALLBACK_RESPONSE.SKIP_OUTCOME_SCREEN) {
                dispatch({type: 'SET_FLOW_COMPLETE', payload: true});
                return;
            }

            if (isSuccessful) {
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME_SUCCESS, {forceReplace: true});
            } else {
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME_FAILURE, {forceReplace: true});
            }

            dispatch({type: 'SET_FLOW_COMPLETE', payload: true});
        },
        [dispatch, state],
    );

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
            isRegistrationComplete,
            isAuthorizationComplete,
            isFlowComplete,
        } = state;

        // 0. Check if one of the early exit conditions applies:
        // - Flow is already complete,
        // - User is offline,
        // - Scenario is not set,
        // - There's a continuable error:
        //      Pause flow and wait for the user to fix it.
        //      Continuable errors (like invalid validate code) are displayed on the current screen
        //      and don't stop the entire flow - the user can retry without restarting
        if (isFlowComplete || !scenario || isOffline || continuableError) {
            return;
        }

        // 1. Check if there's an error - stop processing
        if (error) {
            if (error.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.REGISTRATION_REQUIRED) {
                clearLocalMFAPublicKeyList();
                dispatch({type: 'REREGISTER'});
                return;
            }

            handleCallback(false);
            return;
        }

        // 2. Check if device is compatible
        if (!biometrics.doesDeviceSupportBiometrics()) {
            const {allowedAuthenticationMethods = [] as string[]} = scenario;

            let reason: MultifactorAuthenticationReason = CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.UNSUPPORTED_DEVICE;

            // If the user is using mobile app and the scenario allows native biometrics as a form of authentication,
            // then they need to enable it in the system settings as well for doesDeviceSupportBiometrics to return true.
            if (!isWeb && allowedAuthenticationMethods.includes(CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS)) {
                reason = CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS;
            }

            dispatch({
                type: 'SET_ERROR',
                payload: {
                    reason,
                },
            });
            return;
        }

        // 3. Check if registration is required (local credentials not known to server yet)
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

                // IMPORTANT: Validate that we received a registration challenge.
                // This check is safe here because the backend only issues registration challenges AFTER
                // validateCode verification. The prior validation gate guarantees that if we receive
                // a challenge of type 'registration', it's genuinely from the registration path. This security guarantee
                // does NOT apply to authorization challenges (which skip validateCode verification). If the WebAuthN spec
                // ever changes the structure of these challenges, update getChallengeType() accordingly.
                const challengeType = getChallengeType(challenge);
                if (challengeType !== CONST.MULTIFACTOR_AUTHENTICATION.CHALLENGE_TYPE.REGISTRATION) {
                    dispatch({type: 'SET_ERROR', payload: {reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.INVALID_CHALLENGE_TYPE}});
                    return;
                }

                dispatch({type: 'SET_REGISTRATION_CHALLENGE', payload: challenge});
                return;
            }

            // Check if a soft prompt is needed
            if (!softPromptApproved) {
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute(CONST.MULTIFACTOR_AUTHENTICATION.PROMPT.ENABLE_BIOMETRICS), {forceReplace: true});
                return;
            }

            await biometrics.register(async (result: RegisterResult) => {
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
                    authenticationMethod: result.authenticationMethod.marqetaValue,
                    challenge: registrationChallenge.challenge,
                });

                if (!registrationResponse.success) {
                    dispatch({
                        type: 'SET_ERROR',
                        payload: {
                            reason: registrationResponse.reason,
                            httpStatusCode: registrationResponse.httpStatusCode,
                            message: registrationResponse.message,
                        },
                    });
                    return;
                }

                dispatch({type: 'SET_REGISTRATION_COMPLETE', payload: true});
            });
            return;
        }

        // Registration isn't required, but they have never seen the soft prompt
        // this happens on ios if they delete and reinstall the app. Their keys are preserved in the secure store, but
        // they'll be shown the "do you want to enable FaceID again" system prompt, so we want to show them the soft prompt
        if (!deviceBiometricsState?.hasAcceptedSoftPrompt) {
            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute(CONST.MULTIFACTOR_AUTHENTICATION.PROMPT.ENABLE_BIOMETRICS), {forceReplace: true});
            return;
        }

        // 4. Authorize the user if that has not already been done
        if (!isAuthorizationComplete) {
            if (!Navigation.isActiveRoute(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute('enable-biometrics'))) {
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute('enable-biometrics'), {forceReplace: true});
            }

            // Request authorization challenge if not already fetched
            if (!authorizationChallenge) {
                const {challenge, reason: challengeReason} = await requestAuthorizationChallenge();

                if (!challenge) {
                    dispatch({type: 'SET_ERROR', payload: {reason: challengeReason}});
                    return;
                }

                // Validate that we received an authentication challenge
                const challengeType = getChallengeType(challenge);
                if (challengeType !== CONST.MULTIFACTOR_AUTHENTICATION.CHALLENGE_TYPE.AUTHENTICATION) {
                    dispatch({type: 'SET_ERROR', payload: {reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.BACKEND.INVALID_CHALLENGE_TYPE}});
                    return;
                }

                dispatch({type: 'SET_AUTHORIZATION_CHALLENGE', payload: challenge});
                return;
            }

            await biometrics.authorize(
                {
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
                    const scenarioAPIResponse = await processScenarioAction(scenario.action, {
                        signedChallenge: result.signedChallenge,
                        authenticationMethod: result.authenticationMethod.marqetaValue,
                        ...payload,
                    });

                    if (!scenarioAPIResponse.success) {
                        dispatch({
                            type: 'SET_ERROR',
                            payload: {
                                reason: scenarioAPIResponse.reason,
                                httpStatusCode: scenarioAPIResponse.httpStatusCode,
                                message: scenarioAPIResponse.message,
                            },
                        });
                        return;
                    }

                    // Store the scenario response for callback invocation at outcome navigation
                    dispatch({
                        type: 'SET_SCENARIO_RESPONSE',
                        payload: {
                            httpStatusCode: scenarioAPIResponse.httpStatusCode,
                            reason: scenarioAPIResponse.reason,
                            message: scenarioAPIResponse.message,
                            body: scenarioAPIResponse.body,
                        },
                    });
                    dispatch({type: 'SET_AUTHENTICATION_METHOD', payload: result.authenticationMethod});
                    dispatch({type: 'SET_AUTHORIZATION_COMPLETE', payload: true});
                },
            );
            return;
        }

        // 5. All steps completed - invoke callback to determine whether to show the outcome screen
        handleCallback(true);
    }, [biometrics, dispatch, handleCallback, isOffline, state, isWeb]);

    /**
     * Drives the MFA state machine forward whenever relevant state changes occur.
     * This effect acts as the "engine" that progresses through the authentication flow:
     * - Waits for a scenario to be set via executeScenario() before running
     * - Re-evaluates the flow whenever key state fields change (e.g., validateCode entered, challenge received)
     * - Each run of process() checks current state and advances to the next step or completes the flow
     *
     * TODO: This pattern will likely be refactored to address React rules violations and race condition risks.
     * See: https://github.com/Expensify/App/issues/81197
     */
    useEffect(() => {
        // Don't run until a scenario has been initiated
        if (!state.scenario) {
            return;
        }

        process().catch((error: unknown) => {
            dispatch({
                type: 'SET_ERROR',
                payload: {
                    reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.UNHANDLED_ERROR,
                    message: error instanceof Error ? error.message : String(error),
                },
            });
        });
        // We intentionally omit `process` and `state` from dependencies.
        // Including them would cause infinite re-renders since `process` is recreated on every state change.
        // Instead, we list only the specific state fields that should trigger a re-run of the MFA flow.
        // https://github.com/Expensify/App/issues/81197
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
     * @param {ExecuteScenarioParams<T>} [params] - Optional parameters for the scenario
     * @returns {Promise<void>} A promise that resolves when the scenario has been initialized
     */
    const executeScenario = useCallback(
        async <T extends MultifactorAuthenticationScenario>(scenario: T, params?: ExecuteScenarioParams<T>): Promise<void> => {
            dispatch({
                type: 'INIT',
                payload: {
                    scenario,
                    payload: params && Object.keys(params).length > 0 ? params : undefined,
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
        // When the app is reopened (e.g. page refresh on web), the MFA context resets to its default state
        // and scenario becomes undefined. Without a scenario, the state machine in process() won't run,
        // so dispatching SET_ERROR would have no effect. In this case we dismiss the modal directly.
        if (!state.scenario) {
            Navigation.dismissModal();
            return;
        }

        dispatch({
            type: 'SET_ERROR',
            payload: {
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.EXPO.CANCELED,
            },
        });
    }, [dispatch, state.scenario]);

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

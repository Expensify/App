import React, {createContext, useCallback, useContext, useEffect, useMemo} from 'react';
import type {ReactNode} from 'react';
import {MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG} from '@components/MultifactorAuthentication/config';
import {getOutcomePath, getOutcomePaths} from '@components/MultifactorAuthentication/config/outcomePaths';
import type {MultifactorAuthenticationScenario, MultifactorAuthenticationScenarioParams} from '@components/MultifactorAuthentication/config/types';
import useLocalize from '@hooks/useLocalize';
import {requestValidateCodeAction} from '@libs/actions/User';
import type {MarqetaAuthTypeName, OutcomePaths} from '@libs/MultifactorAuthentication/Biometrics/types';
import Navigation from '@navigation/Navigation';
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
    const {state, setScenario, setPayload, setOutcomePaths, setError, setIsRegistrationComplete, setIsAuthorizationComplete, setIsFlowComplete} = useMultifactorAuthenticationState();

    const biometrics = useNativeBiometrics();
    const {translate} = useLocalize();

    /**
     * Internal process function that runs after each step.
     * Uses if statements to determine and execute the next step in the flow.
     */
    const process = useCallback(async () => {
        const {error, scenario, softPromptApproved, validateCode, payload, outcomePaths, isRegistrationComplete, isAuthorizationComplete, isFlowComplete} = state;

        // 0. Check if flow is already complete - do nothing
        if (isFlowComplete) {
            return;
        }

        const scenarioLowerCase = scenario?.toLowerCase() as Lowercase<MultifactorAuthenticationScenario> | undefined;
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

        // 2. Check if scenario is set
        if (!scenario) {
            setError({
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BAD_REQUEST,
            });
            return;
        }

        // 3. Check if device is compatible
        if (!biometrics.doesDeviceSupportBiometrics()) {
            setError({
                reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.NO_ELIGIBLE_METHODS,
            });
            return;
        }

        // 4. Check if registration is required (not registered yet)
        const needsRegistration = !biometrics.isRegisteredInAuth() && !isRegistrationComplete;

        if (needsRegistration) {
            // Need validate code before registration
            if (!validateCode) {
                requestValidateCodeAction();
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_MAGIC_CODE);
                return;
            }

            // Check if soft prompt is needed (soft prompt not answered + device supports)
            const needsSoftPrompt = softPromptApproved === undefined && biometrics.info.deviceSupportsBiometrics;

            if (needsSoftPrompt) {
                Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_PROMPT.getRoute('enable-biometrics'));
                return;
            }

            const {nativePromptTitle: nativePromptTitleTPath} = MULTIFACTOR_AUTHENTICATION_SCENARIO_CONFIG[scenario];
            const nativePromptTitle = translate(nativePromptTitleTPath);

            await biometrics.register({nativePromptTitle}, async (result: RegisterResult) => {
                if (!result.success) {
                    setError({
                        reason: result.reason,
                    });
                    return;
                }

                // Call backend to register the public key
                if (!result.publicKey || !result.authenticationMethod || !result.challenge) {
                    setError({
                        reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BAD_REQUEST,
                    });
                    return;
                }

                const registrationResult = await processRegistration({
                    publicKey: result.publicKey,
                    validateCode,
                    authenticationMethod: result.authenticationMethod as MarqetaAuthTypeName,
                    challenge: result.challenge,
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
        const needsAuthorization = !isAuthorizationComplete;

        if (needsAuthorization) {
            await biometrics.authorize(
                {
                    scenario,
                },
                async (result: AuthorizeResult) => {
                    if (!result.success) {
                        // Check if re-registration is needed
                        if (result.reason === CONST.MULTIFACTOR_AUTHENTICATION.REASON.KEYSTORE.REGISTRATION_REQUIRED) {
                            await biometrics.resetKeysForAccount();
                            setIsRegistrationComplete(false);
                        }
                        setError({
                            reason: result.reason,
                        });
                        return;
                    }

                    // Call backend with signed challenge
                    if (!result.signedChallenge || !result.authenticationMethod) {
                        setError({
                            reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.BAD_REQUEST,
                        });
                        return;
                    }

                    const scenarioResult = await processScenario(scenario, {
                        signedChallenge: result.signedChallenge,
                        authenticationMethod: result.authenticationMethod as MarqetaAuthTypeName,
                        ...payload,
                    });

                    if (!scenarioResult.success) {
                        setError({
                            reason: scenarioResult.reason,
                        });
                        return;
                    }

                    setIsAuthorizationComplete(true);
                },
            );
            return;
        }

        // 6. All steps completed - success
        Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_OUTCOME.getRoute(paths.successOutcome));
        setIsFlowComplete(true);
    }, [biometrics, setError, setIsAuthorizationComplete, setIsFlowComplete, setIsRegistrationComplete, state, translate]);

    // Run process on every state change, but only after executeScenario has been called
    useEffect(() => {
        if (!state.scenario) {
            return;
        }
        process();
    }, [
        state.error,
        state.scenario,
        state.softPromptApproved,
        state.validateCode,
        state.payload,
        state.outcomePaths,
        state.isRegistrationComplete,
        state.isAuthorizationComplete,
        state.isFlowComplete,
        process,
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

            const paths = getOutcomePaths(scenario);
            setOutcomePaths({
                successOutcome: successOutcome ?? paths.successOutcome,
                failureOutcome: failureOutcome ?? paths.failureOutcome,
            });
        },
        [setError, setIsAuthorizationComplete, setIsFlowComplete, setIsRegistrationComplete, setOutcomePaths, setPayload, setScenario],
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

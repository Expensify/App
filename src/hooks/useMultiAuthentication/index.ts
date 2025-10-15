import {useCallback, useMemo, useRef} from 'react';
import {createRecentStatus} from './helpers';
import type {
    MultifactorAuthenticationMethods,
    MultifactorAuthenticationRecentStatus,
    MultifactorAuthenticationState,
    MultifactorAuthorizationMethod,
    UseMultifactorAuthentication,
} from './types';
import useBiometricsSetup from './useBiometricsSetup';
import useMultifactorAuthorization from './useMultifactorAuthorization';
import useMultifactorAuthorizationFallback from './useMultifactorAuthorizationFallback';

/**
 * Hook that manages the multifactorial authentication flow, including registration,
 * authorization and fallback mechanisms. Returns current multifactorial authentication state and
 * available scenarios.
 */
function useMultifactorAuthentication(): UseMultifactorAuthentication {
    const MultifactorAuthenticationSetup = useBiometricsSetup();
    const MultifactorAuthorizationFallback = useMultifactorAuthorizationFallback('AUTHORIZE_TRANSACTION');
    const MultifactorAuthorization = useMultifactorAuthorization();

    const recentStatus = useRef<MultifactorAuthenticationRecentStatus>({
        status: MultifactorAuthorization.status,
        cancel: MultifactorAuthorization.cancel,
    });

    /**
     * Core authorization method that handles different multifactorial authentication scenarios:
     *
     * - For devices without multifactorial authentication support: Uses OTP and validation code fallback
     * - For not configured multifactorial authentication: Attempts registration first, then authorization
     * - For configured multifactorial authentication: Proceeds directly to authorization
     *
     * Required parameters vary by scenario:
     * - No multifactorial authentication support: Requires both OTP and validation code
     * - Not configured multifactorial authentication: Requires validation code
     * - Configured multifactorial authentication: No additional parameters needed
     *
     * Will trigger authentication UI when called.
     */
    const authorize = useCallback(
        async ({transactionID, validateCode, otp}: Parameters<MultifactorAuthorizationMethod>[0]): Promise<MultifactorAuthenticationRecentStatus> => {
            if (!MultifactorAuthenticationSetup.deviceSupportBiometrics) {
                const result = await MultifactorAuthorizationFallback.authorize({
                    otp,
                    validateCode,
                    transactionID,
                });
                return createRecentStatus(result, MultifactorAuthorizationFallback.cancel);
            }

            if (!MultifactorAuthenticationSetup.isBiometryConfigured) {
                /** Multi-factor authentication is not configured, let's do that first */
                /** Run the setup method */
                const requestStatus = await MultifactorAuthenticationSetup.register({
                    validateCode,
                    chainedWithAuthorization: true,
                });

                /** Setup was successful and auto run was not disabled, let's run the challenge right away */
                const result = await MultifactorAuthorization.authorize({
                    transactionID,
                    validateCode,
                    chainedPrivateKeyStatus: requestStatus,
                });

                return createRecentStatus(result, MultifactorAuthorization.cancel);
            }

            /** Multi-factor authentication is configured already, let's do the challenge logic */
            const result = await MultifactorAuthorization.authorize({
                transactionID,
                validateCode,
            });

            if (result.reason === 'multifactorAuthentication.reason.error.keyMissingOnTheBE') {
                await MultifactorAuthenticationSetup.revoke();
            }

            return createRecentStatus(result, MultifactorAuthorization.cancel);
        },
        [MultifactorAuthenticationSetup, MultifactorAuthorization, MultifactorAuthorizationFallback],
    );

    /**
     * Wrapper around authorize that saves the authorization result to current status
     * before returning it.
     */
    const authorizeAndSaveRecentStatus: MultifactorAuthorizationMethod = useCallback(
        async (params: Parameters<MultifactorAuthorizationMethod>[0]) => {
            const result = await authorize(params);
            recentStatus.current = result;
            return result.status;
        },
        [authorize],
    );

    /**
     * Cancels the current multifactorial authentication operation by calling the stored cancel method
     * and updates the current status with the result.
     */
    const cancel = useCallback(() => {
        const status = recentStatus.current.cancel();
        const newStatus = {
            ...status,
            value: !!status.step.wasRecentStepSuccessful,
        };

        recentStatus.current = {
            status: newStatus,
            cancel: recentStatus.current.cancel,
        };

        return newStatus;
    }, []);

    /** Memoized state values exposed to consumers */
    const state: MultifactorAuthenticationState = useMemo(
        () => ({
            isBiometryConfigured: MultifactorAuthenticationSetup.isBiometryConfigured,
            // eslint-disable-next-line react-compiler/react-compiler
            ...recentStatus.current.status,
        }),
        [MultifactorAuthenticationSetup.isBiometryConfigured],
    );

    /** Memoized methods exposed to consumers */
    const methods: MultifactorAuthenticationMethods = useMemo(
        () => ({
            register: MultifactorAuthenticationSetup.register,
            resetSetup: MultifactorAuthenticationSetup.revoke,
            authorize: authorizeAndSaveRecentStatus,
            cancel,
        }),
        [MultifactorAuthenticationSetup.register, MultifactorAuthenticationSetup.revoke, authorizeAndSaveRecentStatus, cancel],
    );

    // eslint-disable-next-line react-compiler/react-compiler
    return [state, methods];
}

export default useMultifactorAuthentication;

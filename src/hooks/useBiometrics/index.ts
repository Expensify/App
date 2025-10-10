import {useCallback, useMemo, useRef} from 'react';
import useBiometricsAuthorization from '@hooks/useBiometricsAuthorization';
import useBiometricsAuthorizationFallback from '@hooks/useBiometricsAuthorizationFallback';
import useBiometricsSetup from '../useBiometricsSetup';
import {createRecentStatus} from './helpers';
import type {BiometricsAuthorization, BiometricsRecentStatus, BiometricsScenarios, BiometricsState, UseBiometrics} from './types';

/**
 * Hook that manages the biometrics authentication flow, including registration,
 * authorization and fallback mechanisms. Returns current biometrics state and
 * available scenarios.
 */
function useBiometrics(): UseBiometrics {
    const BiometricsSetup = useBiometricsSetup();
    const BiometricsFallback = useBiometricsAuthorizationFallback('AUTHORIZE_TRANSACTION_FALLBACK');
    const BiometricsAuthorization = useBiometricsAuthorization();

    const recentStatus = useRef<BiometricsRecentStatus>({
        status: BiometricsAuthorization.status,
        cancel: BiometricsAuthorization.cancel,
    });

    /**
     * Core authorization method that handles different biometric scenarios:
     *
     * - For devices without biometric support: Uses OTP and validation code fallback
     * - For unconfigured biometrics: Attempts registration first, then authorization
     * - For configured biometrics: Proceeds directly to authorization
     *
     * Required parameters vary by scenario:
     * - No biometric support: Requires both OTP and validation code
     * - Unconfigured biometrics: Requires validation code
     * - Configured biometrics: No additional parameters needed
     *
     * Will trigger authentication UI when called.
     */
    const authorize = useCallback(
        async ({transactionID, validateCode, otp}: Parameters<BiometricsAuthorization>[0]): Promise<BiometricsRecentStatus> => {
            if (!BiometricsSetup.deviceSupportBiometrics) {
                const result = await BiometricsFallback.authorize({
                    otp,
                    validateCode: validateCode!,
                    transactionID,
                });
                return createRecentStatus(result, BiometricsFallback.cancel);
            }

            if (!BiometricsSetup.isBiometryConfigured) {
                /** Biometrics is not configured, let's do that first */
                /** Run the setup method */
                const requestStatus = await BiometricsSetup.register({
                    validateCode,
                    chainedWithAuthorization: true,
                });

                /** Setup was successful and auto run was not disabled, let's run the challenge right away */
                const result = await BiometricsAuthorization.authorize({
                    transactionID,
                    validateCode,
                    chainedPrivateKeyStatus: requestStatus,
                });

                return createRecentStatus(result, BiometricsAuthorization.cancel);
            }

            /** Biometrics is configured already, let's do the challenge logic */
            const result = await BiometricsAuthorization.authorize({
                transactionID,
                validateCode,
            });

            if (result.reason === 'biometrics.reason.error.keyMissingOnTheBE') {
                await BiometricsSetup.revoke();
            }

            return createRecentStatus(result, BiometricsAuthorization.cancel);
        },
        [BiometricsSetup, BiometricsAuthorization, BiometricsFallback],
    );

    /**
     * Wrapper around authorize that saves the authorization result to current status
     * before returning it.
     */
    const authorizeAndSaveRecentStatus: BiometricsAuthorization = useCallback(
        async (params: Parameters<BiometricsAuthorization>[0]) => {
            const result = await authorize(params);
            recentStatus.current = result;
            return result.status;
        },
        [authorize],
    );

    /**
     * Cancels the current biometric operation by calling the stored cancel method
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
    const state: BiometricsState = useMemo(
        () => ({
            isBiometryConfigured: BiometricsSetup.isBiometryConfigured,
            ...recentStatus.current.status,
        }),
        [BiometricsSetup.isBiometryConfigured],
    );

    /** Memoized scenarios exposed to consumers */
    const scenarios: BiometricsScenarios = useMemo(
        () => ({
            register: BiometricsSetup.register,
            resetSetup: BiometricsSetup.revoke,
            authorize: authorizeAndSaveRecentStatus,
            cancel,
        }),
        [BiometricsSetup.register, BiometricsSetup.revoke, authorizeAndSaveRecentStatus, cancel],
    );

    return [state, scenarios];
}

export default useBiometrics;

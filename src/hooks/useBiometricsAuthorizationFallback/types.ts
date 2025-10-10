import {BiometricsFallbackScenario, BiometricsFallbackScenarioParams, BiometricsScenarioStoredValueType} from '@libs/Biometrics/scenarios/types';
import {BiometricsStatus, BiometricsStep} from '../useBiometricsStatus/types';

/**
 * Function type for authorizing transactions when biometrics is not available.
 * Uses provided factors as alternative authentication factors.
 * Returns a status containing the first verified factor.
 */
type AuthorizeUsingFallback<T extends BiometricsFallbackScenario> = (
    params: BiometricsFallbackScenarioParams<T>,
) => Promise<BiometricsStatus<BiometricsScenarioStoredValueType<T> | undefined>>;

/**
 * User-facing status messages for the current biometric state
 */
type BiometricsStatusMessage = {
    /** Detailed message explaining the current state or required scenario */
    message: string;

    /** Brief status header (e.g. "Authentication Successful") */
    title: string;
};

/**
 * Hook return type for biometrics fallback authorization.
 * Provides status tracking, authorization function, and request canceling.
 * Status tracks the current verified factor and authorization state.
 */
type UseBiometricsAuthorizationFallback<T extends BiometricsFallbackScenario> = BiometricsStatusMessage &
    BiometricsStep & {
        authorize: AuthorizeUsingFallback<T>;
        cancel: () => BiometricsStatus<BiometricsScenarioStoredValueType<T> | undefined>;
    };

export type {AuthorizeUsingFallback, UseBiometricsAuthorizationFallback};

import {AUTH_TYPE} from 'expo-secure-store';
import type {ValueOf} from 'type-fest';
import {BiometricsFactor} from '@libs/Biometrics/scenarios/types';
import CONST from '@src/CONST';
import {TranslationPaths} from '@src/languages/types';

/**
 * Represents the step of the biometric operation.
 */
type BiometricsStep = {
    /** Whether the recent step was successful */
    wasRecentStepSuccessful: boolean | undefined;

    /** The required factor for the next step */
    requiredFactorForNextStep: BiometricsFactor | undefined;

    /** Whether the request has been fulfilled */
    isRequestFulfilled: boolean;
};

type BiometricsPartialStatusConditional<omitStatus> = omitStatus extends false
    ? {
          /** The status of the biometric operation */
          step: BiometricsStep;
      }
    : object;

/**
 * Represents the core status information for biometric operations.
 * @template T - The type of the value of the biometric operation.
 * @template omitStatus - Whether to omit the status from the partial status.
 */
type BiometricsPartialStatus<T, omitStatus = false> = BiometricsPartialStatusConditional<omitStatus> & {
    /**
     * The result value of the biometric operation.
     * Can be of various types depending on the operation, commonly boolean or string.
     */
    value: T;

    /**
     * Translation key explaining the current status or error condition.
     * Used to provide user feedback about what happened.
     */
    reason: TranslationPaths;

    /**
     * The numeric authentication type identifier from SecureStore.
     * Indicates which authentication method was used (e.g. biometric, passcode).
     */
    type?: ValueOf<typeof AUTH_TYPE>;
};

/**
 * Complete status object for biometric operations, extending the partial status.
 * Used to track and communicate the full state of biometric authentication/authorization,
 * including user-facing messages and authentication details.
 */
type BiometricsStatus<T, omitStatus = false> = BiometricsPartialStatus<T, omitStatus> & {
    /** Human-readable name of the authentication method used */
    typeName?: string;

    /**
     * Formatted message combining status, reason, and authentication type
     * for displaying detailed feedback to users
     */
    message: string;

    /**
     * Concise status message suitable for headers or brief notifications
     * Examples: "Authorization Successful", "Authentication Failed"
     */
    title: string;
};

/** Valid biometric scenario types as defined in constants */
type BiometricsStatusKeyType = ValueOf<typeof CONST.BIOMETRICS.SCENARIO_TYPE>;

/** Names of supported authentication types */
type AuthTypeName = ValueOf<typeof CONST.BIOMETRICS.AUTH_TYPE>['NAME'];

/**
 * Function to update the biometrics status.
 * @param partialStatus - New status data or function to transform existing status
 * @returns Updated BiometricsStatus object
 */
type SetBiometricsStatus<T> = (partialStatus: BiometricsPartialStatus<T> | ((prevStatus: BiometricsStatus<T>) => BiometricsStatus<T>)) => BiometricsStatus<T>;

/** Valid type for the useBiometricsStatus hook */
type UseBiometricsStatus<T> = [BiometricsStatus<T>, SetBiometricsStatus<T>];

export type {BiometricsStatus, BiometricsStep, SetBiometricsStatus, BiometricsStatusKeyType, AuthTypeName, BiometricsPartialStatus, UseBiometricsStatus};

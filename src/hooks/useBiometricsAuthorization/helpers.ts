import {BiometricsPartialStatus, BiometricsStatus} from '../useBiometricsStatus/types';

/**
 * Creates a status object for failed biometric authorization attempts.
 * Takes the error status from a failed biometric operation and merges it with the previous status,
 * marking the attempt as unsuccessful while fulfilling the request to prevent retries.
 */
const createAuthorizeErrorStatus = (errorStatus: BiometricsPartialStatus<boolean, true>) => (prevStatus: BiometricsStatus<boolean>) => ({
    ...prevStatus,
    ...errorStatus,
    step: {
        wasRecentStepSuccessful: false,
        isRequestFulfilled: true,
        requiredFactorForNextStep: undefined,
    },
});

export {createAuthorizeErrorStatus};

import {CreateBiometricsRecentStatus} from './types';

/**
 * Creates a BiometricsRecentStatus object that contains both the status and cancel method.
 * The status includes whether the most recent biometric step was successful.
 * The cancel method is used to cancel the biometric operation.
 */
const createRecentStatus: CreateBiometricsRecentStatus = (result, cancel) => ({
    status: {...result, value: !!result.step.wasRecentStepSuccessful},
    cancel,
});

export {createRecentStatus};

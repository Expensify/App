import checkDeviceEligibility from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import {fromPromise} from 'xstate';

import type {ValidateDeviceInput} from './types';

/**
 * A refused device resolves as a failed MFAResult, so the machine's onError transition for this
 * actor fires only when the platform check throws unexpectedly.
 */
const validateDevice = fromPromise<MFAResult, ValidateDeviceInput>(({input}) => checkDeviceEligibility(input.allowedAuthenticationMethods));

/**
 * Builds the side-effect actors that the machine states invoke. The machine is always created with
 * these working implementations, so no caller needs to provide stubs or overrides.
 */
function createActors() {
    return {validateDevice};
}

export default createActors;

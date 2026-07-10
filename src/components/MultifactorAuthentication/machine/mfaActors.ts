import checkDeviceEligibility from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import {fromPromise} from 'xstate';

import type {ValidateDeviceInput} from './types';

/**
 * Runs {@link checkDeviceEligibility} with the scenario's allowed methods. A refusal is an expected
 * outcome that resolves as a failed result carrying the blocking MFAError, which the machine routes
 * to the failure outcome. A rejection therefore always means the platform check itself threw
 * unexpectedly.
 */
const validateDevice = fromPromise<MFAResult, ValidateDeviceInput>(({input}) => checkDeviceEligibility(input.scenario?.allowedAuthenticationMethods ?? []));

/**
 * Builds the machine's real side-effect actors. Each slice adds the actors its states invoke, so
 * setup() always wires real implementations and never a throwing stub. This slice contributes only
 * the device check.
 */
function createActors() {
    return {validateDevice};
}

export default createActors;

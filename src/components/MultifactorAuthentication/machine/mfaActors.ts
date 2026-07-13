import checkDeviceEligibility from '@components/MultifactorAuthentication/biometrics/checkDeviceEligibility';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';

import {fromPromise} from 'xstate';

import type {ValidateDeviceInput} from './types';

/**
 * Runs {@link checkDeviceEligibility} with the scenario's allowed methods. See its documentation for
 * how a refusal settles as a failed result while a rejection means an unexpected platform error.
 */
const validateDevice = fromPromise<MFAResult, ValidateDeviceInput>(({input}) => checkDeviceEligibility(input.allowedAuthenticationMethods));

/**
 * Builds the machine's real side-effect actors. Each slice adds the actors its states invoke, so
 * setup() always wires real implementations and never a throwing stub. This slice contributes only
 * the device check.
 */
function createActors() {
    return {validateDevice};
}

export default createActors;

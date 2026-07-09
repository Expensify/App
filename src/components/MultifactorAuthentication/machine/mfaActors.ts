import {deviceCheckFailureReason, deviceVerificationType, doesDeviceSupportAuthenticationMethod} from '@components/MultifactorAuthentication/biometrics/operations';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {fromPromise} from 'xstate';

import type {ValidateDeviceInput} from './types';

const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

/**
 * Confirms the device can complete the scenario's biometric ceremony through two ordered gates that
 * mirror the legacy flow. The first gate refuses a device whose verification type the scenario does not
 * allow. The second gate refuses a device that cannot actually perform that method, for example a
 * browser without WebAuthn or a phone with no enrolled biometrics. A refusal is an expected outcome, so
 * it resolves as a failed result carrying the blocking MFAError, which the machine routes to the
 * failure outcome. A rejection therefore always means the platform check itself threw unexpectedly.
 */
const validateDevice = fromPromise<MFAResult, ValidateDeviceInput>(async ({input}) => {
    const allowedAuthenticationMethods: ReadonlyArray<ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>> = input.scenario?.allowedAuthenticationMethods ?? [];

    if (!allowedAuthenticationMethods.includes(deviceVerificationType)) {
        const error = createLocalMFAError(
            REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED,
            `Authentication method not allowed (deviceVerificationType: ${deviceVerificationType}, allowedMethods: ${allowedAuthenticationMethods.join(', ')})`,
        );
        addMFABreadcrumb('Authentication method not allowed', {...error, deviceVerificationType, allowedAuthenticationMethods: allowedAuthenticationMethods.join(', ')}, 'warning');
        return {success: false, error};
    }

    if (!(await doesDeviceSupportAuthenticationMethod())) {
        const error = createLocalMFAError(deviceCheckFailureReason, `Device check failed (deviceVerificationType: ${deviceVerificationType})`);
        addMFABreadcrumb('Device check failed', {...error, deviceVerificationType}, 'warning');
        return {success: false, error};
    }

    return {success: true};
});

/**
 * Builds the machine's real side-effect actors. Each slice adds the actors its states invoke, so
 * setup() always wires real implementations and never a throwing stub. This slice contributes only
 * the device check.
 */
function createActors() {
    return {validateDevice};
}

export default createActors;

import {deviceCheckFailureReason, deviceVerificationType, doesDeviceSupportAuthenticationMethod} from '@components/MultifactorAuthentication/biometrics/operations';
import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';

import {createLocalMFAError, MFAActorError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {fromPromise} from 'xstate';

import type {ValidateDeviceInput} from './types';

const REASON = CONST.MULTIFACTOR_AUTHENTICATION.REASON;

/**
 * Confirms the device can complete the scenario's biometric ceremony through two ordered gates that
 * mirror the legacy flow. The first gate rejects a device whose verification type the scenario does not
 * allow. The second gate rejects a device that cannot actually perform that method, for example a
 * browser without WebAuthn or a phone with no enrolled biometrics. It resolves when both gates pass and
 * throws the blocking MFAError when one fails, which the machine routes to the failure outcome.
 */
const validateDevice = fromPromise<void, ValidateDeviceInput>(async ({input}) => {
    const allowedAuthenticationMethods: ReadonlyArray<ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>> = input.scenario?.allowedAuthenticationMethods ?? [];

    if (!allowedAuthenticationMethods.includes(deviceVerificationType)) {
        const message = `Authentication method not allowed (deviceVerificationType: ${deviceVerificationType}, allowedMethods: ${allowedAuthenticationMethods.join(', ')})`;
        addMFABreadcrumb(
            'Authentication method not allowed',
            {reason: REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED, deviceVerificationType, allowedAuthenticationMethods: allowedAuthenticationMethods.join(', '), message},
            'warning',
        );
        throw new MFAActorError(createLocalMFAError(REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED, message));
    }

    if (!(await doesDeviceSupportAuthenticationMethod())) {
        const message = `Device check failed (deviceVerificationType: ${deviceVerificationType})`;
        addMFABreadcrumb('Device check failed', {reason: deviceCheckFailureReason, deviceVerificationType, message}, 'warning');
        throw new MFAActorError(createLocalMFAError(deviceCheckFailureReason, message));
    }
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

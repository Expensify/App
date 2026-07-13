import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {deviceCheckFailureReason, deviceVerificationType, doesDeviceSupportAuthenticationMethod} from './operations';

/**
 * Confirms the device can complete a biometric ceremony through two ordered gates that mirror the
 * legacy flow. The first gate refuses a device whose verification type the caller does not allow, and
 * it runs first because it is synchronous while the second gate queries the platform. The second gate
 * refuses a device that cannot actually perform that method, for example a browser without WebAuthn
 * or a phone with no enrolled biometrics. A refusal is an expected outcome, so it resolves as a
 * failed result carrying the blocking MFAError. A rejection therefore always means the platform
 * check itself threw unexpectedly.
 */
async function checkDeviceEligibility(allowedAuthenticationMethods: ReadonlyArray<ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>>): Promise<MFAResult> {
    if (!allowedAuthenticationMethods.includes(deviceVerificationType)) {
        const error = createLocalMFAError(
            CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED,
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
}

export default checkDeviceEligibility;

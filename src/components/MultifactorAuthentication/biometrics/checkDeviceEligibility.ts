import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';

import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import {createLocalMFAError} from '@libs/MultifactorAuthentication/shared/MFAResult';

import CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

import {deviceCheckFailureReason, deviceVerificationType, doesDeviceSupportAuthenticationMethod} from './operations';

type AllowedAuthenticationMethods = ReadonlyArray<ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION.TYPE>>;

/**
 * Checks that the caller allows this platform's verification method and that the device can actually
 * perform it, which fails for example in a browser without WebAuthn or on a phone with no enrolled
 * biometrics. A failed check is an expected outcome, so it resolves as a failed result carrying the
 * blocking MFAError. A rejection always means the platform check itself threw unexpectedly.
 */
async function checkDeviceEligibility(allowedAuthenticationMethods: AllowedAuthenticationMethods): Promise<MFAResult> {
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
export type {AllowedAuthenticationMethods};

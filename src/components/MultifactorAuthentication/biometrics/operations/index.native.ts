import CONST from '@src/CONST';

import {isSensorAvailable} from '@sbaiahmed1/react-native-biometrics';

/**
 * Platform-resolved biometric operations for the device check. These functions read no Onyx and no
 * React state, so the MFA machine actors and other non-React callers can import them directly.
 */

/** The authentication method this platform verifies with. Native verifies with HSM-backed biometrics. */
const deviceVerificationType = CONST.MULTIFACTOR_AUTHENTICATION.TYPE.BIOMETRICS_HSM;

/** The failure reason to report when this platform cannot run the verification method. */
const deviceCheckFailureReason = CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.NO_AUTHENTICATION_METHODS_ENROLLED;

/** Resolves to whether this device has an enrolled, secured biometric sensor. */
async function doesDeviceSupportAuthenticationMethod(): Promise<boolean> {
    const sensorResult = await isSensorAvailable();
    return sensorResult.isDeviceSecure;
}

export {deviceVerificationType, deviceCheckFailureReason, doesDeviceSupportAuthenticationMethod};

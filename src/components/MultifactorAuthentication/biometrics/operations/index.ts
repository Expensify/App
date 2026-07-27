import {isWebAuthnSupported} from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';

import CONST from '@src/CONST';

/**
 * Platform-resolved biometric operations for the device check. These functions read no Onyx and no
 * React state, so the MFA machine actors and other non-React callers can import them directly.
 */

/** The authentication method this platform verifies with. Web verifies with passkeys. */
const deviceVerificationType = CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS;

/** The failure reason to report when this platform cannot run the verification method. */
const deviceCheckFailureReason = CONST.MULTIFACTOR_AUTHENTICATION.REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED;

/** Resolves to whether this browser can perform the passkey ceremony. */
async function doesDeviceSupportAuthenticationMethod(): Promise<boolean> {
    return isWebAuthnSupported();
}

export {deviceVerificationType, deviceCheckFailureReason, doesDeviceSupportAuthenticationMethod};

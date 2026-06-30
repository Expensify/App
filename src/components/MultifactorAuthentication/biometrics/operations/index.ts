import {isWebAuthnSupported} from '@libs/MultifactorAuthentication/Passkeys/WebAuthn';
import VALUES from '@libs/MultifactorAuthentication/VALUES';

import CONST from '@src/CONST';

/**
 * Platform-resolved biometric operations shared by the MFA machine actors and the React biometrics
 * hooks. These functions read no Onyx and no React state, so a machine actor can import them directly
 * instead of reaching through a hook. Web resolves to this file and native resolves to the
 * `index.native.ts` sibling. Later slices add the registration and authorization operations here.
 */

/** The authentication method this platform verifies with. Web verifies with passkeys. */
const deviceVerificationType = CONST.MULTIFACTOR_AUTHENTICATION.TYPE.PASSKEYS;

/** The failure reason to report when this platform cannot run the verification method. */
const deviceCheckFailureReason = VALUES.REASON.LOCAL_ERRORS.AUTHENTICATION_TYPE_NOT_SUPPORTED;

/** Resolves to whether this browser can perform the passkey ceremony. */
async function doesDeviceSupportAuthenticationMethod(): Promise<boolean> {
    return isWebAuthnSupported();
}

export {deviceVerificationType, deviceCheckFailureReason, doesDeviceSupportAuthenticationMethod};

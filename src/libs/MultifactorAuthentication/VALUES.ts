/**
 * Barrel file that merges shared, NativeBiometricsHSM, and Passkeys VALUES
 * into a single object matching the original Biometrics/VALUES shape.
 * This ensures CONST.MULTIFACTOR_AUTHENTICATION continues working everywhere.
 */
import NATIVE_BIOMETRICS_HSM_VALUES from './NativeBiometricsHSM/VALUES';
import PASSKEY_VALUES from './Passkeys/VALUES';
import SHARED_VALUES from './shared/VALUES';

const MULTIFACTOR_AUTHENTICATION_VALUES = {
    ...SHARED_VALUES,
    ...NATIVE_BIOMETRICS_HSM_VALUES,
    ...PASSKEY_VALUES,
} as const;

export default MULTIFACTOR_AUTHENTICATION_VALUES;

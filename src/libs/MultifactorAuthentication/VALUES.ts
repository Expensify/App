/**
 * Barrel file that merges shared, NativeBiometrics, and Passkeys VALUES
 * into a single object matching the original Biometrics/VALUES shape.
 * This ensures CONST.MULTIFACTOR_AUTHENTICATION continues working everywhere.
 */
import NATIVE_BIOMETRICS_VALUES from './NativeBiometrics/VALUES';
import NATIVE_BIOMETRICS_EC256_VALUES from './NativeBiometricsEC256/VALUES';
import PASSKEY_VALUES from './Passkeys/VALUES';
import SHARED_VALUES from './shared/VALUES';

const MULTIFACTOR_AUTHENTICATION_VALUES = {
    ...SHARED_VALUES,
    ...NATIVE_BIOMETRICS_VALUES,
    ...NATIVE_BIOMETRICS_EC256_VALUES,
    ...PASSKEY_VALUES,

    /**
     * Feature flag to switch native biometrics from ED25519 (noble/JS) to EC256 (react-native-biometrics/native).
     */
    USE_NATIVE_EC256: true,
} as const;

export default MULTIFACTOR_AUTHENTICATION_VALUES;

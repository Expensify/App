/**
 * Constants specific to native biometrics (EC256 / react-native-biometrics).
 */

const NATIVE_BIOMETRICS_EC256_VALUES = {
    /**
     * EC256 key type identifier
     */
    EC256_TYPE: 'biometric',

    /**
     * Key alias suffix for EC256 keys managed by react-native-biometrics.
     */
    EC256_KEY_SUFFIX: 'EC256_KEY',
} as const;

export default NATIVE_BIOMETRICS_EC256_VALUES;

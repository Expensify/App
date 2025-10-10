import {BiometricsStatus, BiometricsStep} from '../useBiometricsStatus/types';

/**
 * Base type for the register function that handles biometric setup.
 * Takes a validate code and additional params, returns a BiometricsStatus.
 */
type RegisterFunction<T, R> = (params: {validateCode?: number} & T) => Promise<BiometricsStatus<R>>;

/**
 * Function to register biometrics on the device.
 * Returns different status types based on whether authorization is chained:
 * - With chained=true: Returns a string status for the next authorization step
 * - With chained=false: Returns a boolean indicating registration success
 * - With chained unspecified: Returns either boolean or string based on flow
 */
type Register = RegisterFunction<{chainedWithAuthorization: true}, string> &
    RegisterFunction<{chainedWithAuthorization?: false}, boolean> &
    RegisterFunction<{chainedWithAuthorization?: boolean}, boolean | string>;

/**
 * Information about the device's biometric capabilities and configuration state
 */
type BiometricsInfo = {
    /** Whether the device supports biometric auth (fingerprint/face) or fallback (PIN/pattern) */
    deviceSupportBiometrics: boolean;

    /** Whether biometrics is already set up with a stored public key */
    isBiometryConfigured: boolean;
};

/**
 * User-facing status messages for the current biometric state
 */
type BiometricsStatusMessage = {
    /** Detailed message explaining the current state or required scenario */
    message: string;

    /** Brief status header (e.g. "Authentication Successful") */
    title: string;
};

/**
 * Authentication hook return type combining status information and available scenarios.
 * Returns a tuple with current state and methods to control the biometric setup flow.
 */
type UseBiometricsSetup = BiometricsStep &
    BiometricsInfo &
    BiometricsStatusMessage & {
        /** Sets up biometrics by generating keys and registering with backend */
        register: Register;

        /** Clears biometric configuration by removing stored keys */
        revoke: () => Promise<BiometricsStatus<boolean>>;

        /** Completes current request and updates UI state accordingly */
        cancel: () => BiometricsStatus<boolean>;
    };

export type {UseBiometricsSetup, Register};

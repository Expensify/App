/** Holds information about device-specific biometrics which:
 * - does need to be persisted
 * - does not need to be kept in secure storage
 * - does not persist across uninstallations
 * (secure storage persists across uninstallation)
 */
type DeviceBiometrics = {
    /** Whether the user has been shown the Biometrics Soft Prompt screen and accepted it */
    hasAcceptedSoftPrompt: boolean;
};

export default DeviceBiometrics;

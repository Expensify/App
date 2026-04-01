/** Holds information about device-specific biometrics which:
 * - persists across logout/login (stored as a collection keyed by accountID)
 * - does not need to be kept in secure storage
 * - does not persist across uninstallations
 * (secure storage persists across uninstallation)
 */
type DeviceBiometrics = {
    /** Whether the user has been shown the Biometrics Soft Prompt screen and accepted it */
    hasAcceptedSoftPrompt: boolean;
};

export default DeviceBiometrics;

/**
 * On web, AccessibilityInfo.isScreenReaderEnabled() always returns true
 * (see https://github.com/necolas/react-native-web/discussions/2072).
 * This flag is only meaningful on native, so we return false on web.
 */
function isScreenReaderEnabled(): Promise<boolean> {
    return Promise.resolve(false);
}

export default isScreenReaderEnabled;

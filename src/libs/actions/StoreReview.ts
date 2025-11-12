import {isAvailableAsync, requestReview as requestNativeReview} from 'expo-store-review';

/**
 * Request the native in-app review prompt (iOS/Android)
 * This should only be called when the user has indicated they're enjoying the app
 *
 * Per Expo docs: https://docs.expo.dev/versions/latest/sdk/storereview/
 * - Don't call from a button directly
 * - Don't spam the user
 * - Don't request during time-sensitive tasks
 */
async function requestReview(): Promise<void> {
    try {
        // Check if available before requesting (returns false on web, TestFlight, Android <5.0)
        const getAvailability = async (): Promise<boolean> => {
            const candidate: unknown = isAvailableAsync;
            if (typeof candidate === 'function') {
                return (candidate as () => Promise<boolean>)();
            }
            return false;
        };

        const available = await getAvailability();
        if (available) {
            const performRequestReview = async (): Promise<void> => {
                const candidate: unknown = requestNativeReview;
                if (typeof candidate === 'function') {
                    return (candidate as () => Promise<void>)();
                }
            };

            await performRequestReview();
        }
    } catch (error) {
        // Module not installed yet or platform doesn't support it
        // Silently fail - the custom modal already collected feedback
    }
}

export default requestReview;

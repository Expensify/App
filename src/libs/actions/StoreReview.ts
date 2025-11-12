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
        // Dynamic import to handle case where package isn't installed yet
        const StoreReviewModule = await import('expo-store-review');

        // Check if available before requesting (returns false on web, TestFlight, Android <5.0)
        const available = await StoreReviewModule.isAvailableAsync();
        if (available) {
            await StoreReviewModule.requestReview();
        }
    } catch (error) {
        // Module not installed yet or platform doesn't support it
        // Silently fail - the custom modal already collected feedback
    }
}

export {requestReview};

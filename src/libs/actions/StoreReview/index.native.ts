import {hasAction as hasStoreReviewAction, isAvailableAsync, requestReview as requestNativeReview} from 'expo-store-review';
import Log from '@libs/Log';

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
        // Determine if any review action is possible on this build/device/config
        const getHasAction = async (): Promise<boolean> => {
            const candidate: unknown = hasStoreReviewAction;
            if (typeof candidate === 'function') {
                return (candidate as () => Promise<boolean>)();
            }
            return false;
        };

        const hasAction = await getHasAction();
        if (!hasAction) {
            Log.info('[StoreReview] No review action found', false, {hasAction});
            return;
        }

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
            Log.info('[StoreReview] Requesting review', false, {available});
            const performRequestReview = async (): Promise<void> => {
                const candidate: unknown = requestNativeReview;
                if (typeof candidate === 'function') {
                    return (candidate as () => Promise<void>)();
                }

                Log.hmmm('[StoreReview] No requestNativeReview function found');
            };

            await performRequestReview();
            return;
        }

        Log.info('[StoreReview] Review not available');
    } catch (error) {
        // Module not installed yet or platform doesn't support it
        // Silently fail - the custom modal already collected feedback
        Log.hmmm('[StoreReview] Error requesting review', {error});
    }
}

export default requestReview;

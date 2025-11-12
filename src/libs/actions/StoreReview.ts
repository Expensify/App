import * as StoreReview from 'expo-store-review';

/**
 * Request the native in-app review prompt (iOS/Android)
 * This should only be called when the user has indicated they're enjoying the app
 */
function requestReview() {
    void StoreReview.requestReview();
}

/**
 * Check if the native store review is available on this device
 */
async function isAvailable(): Promise<boolean> {
    return StoreReview.isAvailableAsync();
}

export {requestReview, isAvailable};


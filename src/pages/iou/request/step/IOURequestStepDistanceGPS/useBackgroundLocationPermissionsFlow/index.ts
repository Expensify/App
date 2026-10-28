/**
 * GPS distance tracking only runs on native, so there are no location permissions to ask for on other platforms.
 * The hook still has to exist to keep the call site platform-agnostic.
 */
import type BackgroundLocationPermissionsFlowCallbacks from './types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the callbacks are only used by the native variants, but the signature has to match them
function useBackgroundLocationPermissionsFlow(callbacks: BackgroundLocationPermissionsFlowCallbacks) {
    return () => {};
}

export default useBackgroundLocationPermissionsFlow;

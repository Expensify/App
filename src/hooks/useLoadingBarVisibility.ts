import {useIsLoadingBarPending} from './useInFlightRequests';
import useNetwork from './useNetwork';

/**
 * Hook that determines whether LoadingBar should be visible based on active queue requests
 * Shows LoadingBar when any of the loading-bar commands are being processed
 */
export default function useLoadingBarVisibility(): boolean {
    const hasPendingLoadingBarRequest = useIsLoadingBarPending();
    const {isOffline} = useNetwork();

    // Don't show loading bar if currently offline
    if (isOffline) {
        return false;
    }

    return hasPendingLoadingBarRequest;
}

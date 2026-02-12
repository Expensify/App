import {useEffect} from 'react';
import * as DeepLinkHandler from '@libs/DeepLinkHandler';

/**
 * Hook that manages the DeepLinkHandler lifecycle.
 * Cleans up module-level Onyx subscriptions and event listeners on unmount.
 */
export default function useDeepLinkHandler() {
    useEffect(() => {
        return () => {
            DeepLinkHandler.clearModule();
        };
    }, []);
}

import {useEffect} from 'react';
// eslint-disable-next-line no-restricted-syntax
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

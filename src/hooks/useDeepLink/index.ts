import {useContext} from 'react';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import type UseDeepLinkResult from './types';

/**
 * Hook to detect if the current navigation is from a deeplink and get the deeplink URL
 * @returns:
 *  isDeeplink - whether user enter app via deep link
 *  deeplinkUrl - deep link address
 */
export default function useDeepLink(): UseDeepLinkResult {
    const {initialURL} = useContext(InitialURLContext);

    const deepLinkUrl = window.location.href;
    const isDeeplink = deepLinkUrl === initialURL;

    return {
        isDeeplink,
        deepLinkUrl,
    };
}

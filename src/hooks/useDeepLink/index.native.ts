import {useContext} from 'react';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import Navigation from '@libs/Navigation/Navigation';
import type UseDeepLinkResult from './types';

/**
 * Hook to detect if the current navigation is from a deeplink and get the deeplink URL
 * @returns:
 *  isDeeplink - whether user enter app via deep link
 *  deeplinkUrl - deep link address
 */
export default function useDeepLink(): UseDeepLinkResult {
    const {initialURL} = useContext(InitialURLContext);

    const isDeeplink = !!initialURL;
    const deepLinkUrl = Navigation.getActiveRoute() || '';

    return {
        isDeeplink,
        deepLinkUrl,
    };
}


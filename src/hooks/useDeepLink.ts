import {useContext} from 'react';
import {Platform} from 'react-native';
import {InitialURLContext} from '@components/InitialURLContextProvider';
import Navigation from '@libs/Navigation/Navigation';

type UseDeepLinkResult = {
    isDeeplink: boolean;
    deepLinkUrl: string;
};

/**
 * Hook to detect if the current navigation is from a deeplink and get the deeplink URL
 * @returns:
 *  isDeeplink - whether user enter app via deep link
 *  deeplinkUrl - deep link address
 */
export default function useDeepLink(): UseDeepLinkResult {
    const {initialURL} = useContext(InitialURLContext);

    let isDeeplink = false;
    let deepLinkUrl = '';

    if (Platform.OS === 'web') {
        deepLinkUrl = window.location.href;
        isDeeplink = deepLinkUrl === initialURL;
    } else {
        isDeeplink = !!initialURL;
        deepLinkUrl = Navigation.getActiveRoute() || '';
    }

    return {
        isDeeplink,
        deepLinkUrl,
    };
}

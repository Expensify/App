import {NavigationRouteContext} from '@react-navigation/native';
import {useContext} from 'react';

/** The current route's key from React Navigation, or null when the consumer isn't inside a navigator. */
function useRouteKey(): string | null {
    return useContext(NavigationRouteContext)?.key ?? null;
}

export default useRouteKey;

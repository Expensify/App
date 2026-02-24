/* eslint-disable @typescript-eslint/naming-convention */
import type {LinkingOptions} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {Linking} from 'react-native';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import navigationRef from '@libs/Navigation/navigationRef';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import ROUTES from '@src/ROUTES';
import {config} from './config';
import prefixes from './prefixes';

const linkingConfig: LinkingOptions<RootNavigatorParamList> = {
    getStateFromPath: getAdaptedStateFromPath,
    prefixes,
    config,
    subscribe(listener) {
        const subscription = Linking.addEventListener('url', ({url}: {url: string}) => {
            // Skip GPS distance screen deep links when the user is already on that screen.
            // This prevents a re-navigation with animation when tapping the GPS live update notification
            // while the GPS screen is already visible.
            if (url.includes('distance-gps')) {
                const state = navigationRef.current?.getRootState();
                if (state) {
                    const currentRoute = findFocusedRoute(state);
                    if (currentRoute?.name === ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.route) {
                        return;
                    }
                }
            }
            listener(url);
        });
        return () => subscription.remove();
    },
};

// eslint-disable-next-line import/prefer-default-export
export {linkingConfig};

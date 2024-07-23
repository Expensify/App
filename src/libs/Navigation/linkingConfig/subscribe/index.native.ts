/* eslint-disable @typescript-eslint/naming-convention */
import type {LinkingOptions} from '@react-navigation/native';
import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';
import extractPathFromURL from '@react-navigation/native/src/extractPathFromURL';
import {Linking} from 'react-native';
import Navigation from '@libs/Navigation/Navigation';
import config from '@navigation/linkingConfig/config';
import prefixes from '@navigation/linkingConfig/prefixes';
import type {RootStackParamList} from '@navigation/types';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

// This field in linkingConfig is supported on native only.
const subscribe: LinkingOptions<RootStackParamList>['subscribe'] = (listener) => {
    // We need to override the default behaviour for the deep link to search screen.
    // Even on mobile narrow layout, this screen need to push two screens on the stack to work (bottom tab and central pane).
    // That's why we are going to handle it with our navigate function instead the default react-navigation one.
    const linkingSubscription = Linking.addEventListener('url', ({url}) => {
        const path = extractPathFromURL(prefixes, url);

        if (path) {
            const stateFromPath = getStateFromPath(path, config);
            if (stateFromPath) {
                const focusedRoute = findFocusedRoute(stateFromPath);
                if (focusedRoute && focusedRoute.name === SCREENS.SEARCH.CENTRAL_PANE) {
                    Navigation.navigate(path as Route);
                    return;
                }
            }
        }

        listener(url);
    });
    return () => {
        // Clean up the event listeners
        linkingSubscription.remove();
    };
};

export default subscribe;

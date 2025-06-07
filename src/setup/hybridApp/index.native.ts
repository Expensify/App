import {findFocusedRoute} from '@react-navigation/native';
import {Linking} from 'react-native';
import Navigation, {navigationRef} from '@navigation/Navigation';
import CONFIG from '@src/CONFIG';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

if (CONFIG.IS_HYBRID_APP) {
    Linking.addEventListener('url', (state) => {
        handleHybridUrlNavigation(state.url as Route);
    });
}

function handleHybridUrlNavigation(url: Route) {
    const parsedUrl = Navigation.parseHybridAppUrl(url);

    Navigation.isNavigationReady().then(() => {
        if (parsedUrl.startsWith(`/${ROUTES.SHARE_ROOT}`)) {
            const focusRoute = findFocusedRoute(navigationRef.getRootState());
            if (focusRoute?.name === SCREENS.SHARE.SHARE_DETAILS || focusRoute?.name === SCREENS.SHARE.SUBMIT_DETAILS) {
                Navigation.goBack(ROUTES.SHARE_ROOT);
                return;
            }
        }
        Navigation.navigate(parsedUrl);
    });
}

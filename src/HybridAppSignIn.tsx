import {findFocusedRoute} from '@react-navigation/native';
import {useContext, useEffect, useState} from 'react';
import {Linking} from 'react-native';
import type {AppProps} from './App';
import CONST from './CONST';
import {signInAfterTransitionFromOldDot} from './libs/actions/Session';
import Navigation, {navigationRef} from './libs/Navigation/Navigation';
import type {Route} from './ROUTES';
import ROUTES from './ROUTES';
import SCREENS from './SCREENS';
import SplashScreenStateContext from './SplashScreenStateContext';

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

function HybridAppSignIn({url, hybridAppSettings}: AppProps) {
    const [signInHandled, setSignInHandled] = useState(false);
    const {setSplashScreenState} = useContext(SplashScreenStateContext);

    useEffect(() => {
        Linking.addEventListener('url', (state) => {
            handleHybridUrlNavigation(state.url as Route);
        });
    }, []);

    if (!url || !hybridAppSettings || signInHandled) {
        return null;
    }

    signInAfterTransitionFromOldDot(hybridAppSettings).then(() => {
        handleHybridUrlNavigation(url);
        setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
        setSignInHandled(true);
    });

    return null;
}

HybridAppSignIn.displayName = 'HybridAppSignIn';

export default HybridAppSignIn;

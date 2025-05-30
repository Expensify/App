import {findFocusedRoute} from '@react-navigation/native';
import {useContext, useEffect, useState} from 'react';
import {Linking} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {AppProps} from './App';
import CONST from './CONST';
import {parseHybridAppSettings} from './libs/actions/HybridApp';
import {setupNewDotAfterTransitionFromOldDot} from './libs/actions/Session';
import Navigation, {navigationRef} from './libs/Navigation/Navigation';
import ONYXKEYS from './ONYXKEYS';
import type {Route} from './ROUTES';
import ROUTES from './ROUTES';
import SCREENS from './SCREENS';
import SplashScreenStateContext from './SplashScreenStateContext';
import isLoadingOnyxValue from './types/utils/isLoadingOnyxValue';

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

function HybridAppHandler({url, hybridAppSettings}: AppProps) {
    const [signInHandled, setSignInHandled] = useState(false);
    const {setSplashScreenState} = useContext(SplashScreenStateContext);
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});
    const isLoading = isLoadingOnyxValue(tryNewDotMetadata);

    useEffect(() => {
        const listener = Linking.addEventListener('url', (state) => {
            handleHybridUrlNavigation(state.url as Route);
        });

        return () => {
            listener.remove();
        };
    }, []);

    if (!url || !hybridAppSettings || signInHandled || isLoading) {
        return null;
    }

    const parsedHybridAppSettings = parseHybridAppSettings(hybridAppSettings);
    setupNewDotAfterTransitionFromOldDot(parsedHybridAppSettings, tryNewDot).then(() => {
        handleHybridUrlNavigation(url);
        setSplashScreenState(parsedHybridAppSettings.hybridApp?.loggedOutFromOldDot ? CONST.BOOT_SPLASH_STATE.HIDDEN : CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
        setSignInHandled(true);
    });

    return null;
}

HybridAppHandler.displayName = 'HybridAppHandler';

export default HybridAppHandler;

import {findFocusedRoute} from '@react-navigation/native';
import React, {createContext, useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {ReactNode} from 'react';
import {Linking} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {setupNewDotAfterTransitionFromOldDot} from '@libs/actions/Session';
import Navigation, {navigationRef} from '@navigation/Navigation';
import {parseHybridAppSettings} from '@userActions/HybridApp';
import type {AppProps} from '@src/App';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {useSplashScreenStateContext} from '@src/SplashScreenStateContext';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type InitialUrlContextType = {
    initialURL: Route | undefined;
    setInitialURL: React.Dispatch<React.SetStateAction<Route | undefined>>;
};

/** Initial url that will be opened when NewDot is embedded into Hybrid App. */
const InitialURLContext = createContext<InitialUrlContextType>({
    initialURL: undefined,
    setInitialURL: () => {},
});

type InitialURLContextProviderProps = AppProps & {
    /** Children passed to the context provider */
    children: ReactNode;
};

function InitialURLContextProvider({children, url, hybridAppSettings, timestamp}: InitialURLContextProviderProps) {
    const [initialURL, setInitialURL] = useState<Route | undefined>();
    const {splashScreenState, setSplashScreenState} = useSplashScreenStateContext();
    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {canBeMissing: true});
    // We use `setupCalled` ref to guarantee that `signInAfterTransitionFromOldDot` is called once.
    const setupCalled = useRef(false);
    const isLoading = isLoadingOnyxValue(tryNewDotMetadata);

    const handleNavigation = useCallback(
        (initialUrl: Route) => {
            setInitialURL(initialUrl);

            const parsedUrl = Navigation.parseHybridAppUrl(initialUrl);

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

            if (splashScreenState === CONST.BOOT_SPLASH_STATE.VISIBLE) {
                setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
            }
        },
        [splashScreenState, setSplashScreenState],
    );

    useEffect(() => {
        if (url && hybridAppSettings) {
            if (!isLoading) {
                if (!setupCalled.current) {
                    setupCalled.current = true;
                    const parsedHybridAppSettings = parseHybridAppSettings(hybridAppSettings);
                    setupNewDotAfterTransitionFromOldDot(parsedHybridAppSettings, tryNewDot).then(() => {
                        handleNavigation(url);
                        if (parsedHybridAppSettings.hybridApp?.loggedOutFromOldDot) {
                            setSplashScreenState(CONST.BOOT_SPLASH_STATE.HIDDEN);
                        }
                    });
                    return;
                }
            }
            handleNavigation(url);
            return;
        }
        Linking.getInitialURL().then((initURL) => {
            setInitialURL(initURL as Route);
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [url, hybridAppSettings, timestamp, isLoading]);

    const initialUrlContext = useMemo(
        () => ({
            initialURL,
            setInitialURL,
        }),
        [initialURL],
    );

    return <InitialURLContext.Provider value={initialUrlContext}>{children}</InitialURLContext.Provider>;
}

InitialURLContextProvider.displayName = 'InitialURLContextProvider';

export default InitialURLContextProvider;
export {InitialURLContext};

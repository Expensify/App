import React, {createContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {Linking} from 'react-native';
import {signInAfterTransitionFromOldDot} from '@libs/actions/Session';
import Navigation from '@navigation/Navigation';
import type {AppProps} from '@src/App';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import {useSplashScreenStateContext} from '@src/SplashScreenStateContext';

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

    useEffect(() => {
        if (url && hybridAppSettings) {
            signInAfterTransitionFromOldDot(hybridAppSettings).then(() => {
                setInitialURL(url);
                Navigation.isNavigationReady().then(() => {
                    Navigation.navigate(Navigation.parseHybridAppUrl(url));
                });

                if (splashScreenState === CONST.BOOT_SPLASH_STATE.HIDDEN) {
                    return;
                }
                setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
            });
            return;
        }
        Linking.getInitialURL().then((initURL) => {
            setInitialURL(initURL as Route);
        });
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [url, hybridAppSettings, timestamp]);

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

import React, {createContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {Linking} from 'react-native';
import type {HybridAppSettings} from '@libs/actions/Session';
import {signInAfterTransitionFromOldDot} from '@libs/actions/Session';
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

type InitialURLContextProviderProps = {
    /** URL passed to our top-level React Native component by HybridApp. Will always be undefined in "pure" NewDot builds. */
    url?: Route;

    hybridAppSettings?: string;
    timestamp?: string;

    /** Children passed to the context provider */
    children: ReactNode;
};

function InitialURLContextProvider({children, url, hybridAppSettings, timestamp}: InitialURLContextProviderProps) {
    const [initialURL, setInitialURL] = useState<Route | undefined>();
    const {splashScreenState, setSplashScreenState} = useSplashScreenStateContext();

    useEffect(() => {
        if (url && hybridAppSettings) {
            const parsedSettings = JSON.parse(hybridAppSettings) as HybridAppSettings;
            setInitialURL(`${url}${parsedSettings.isSingleNewDotEntry ? '?singleNewDotEntry=true' : ''}` as Route);

            signInAfterTransitionFromOldDot(parsedSettings).then(() => {
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
    }, [setSplashScreenState, url, hybridAppSettings, timestamp]);

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

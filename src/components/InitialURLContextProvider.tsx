import React, {createContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {Linking} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {signInAfterTransitionFromOldDot} from '@libs/actions/Session';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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
    url?: Route | ValueOf<typeof CONST.HYBRID_APP>;

    /** Children passed to the context provider */
    children: ReactNode;
};

function InitialURLContextProvider({children, url}: InitialURLContextProviderProps) {
    const [initialURL, setInitialURL] = useState<Route | undefined>();
    const [lastVisitedPath] = useOnyx(ONYXKEYS.LAST_VISITED_PATH);
    const {splashScreenState, setSplashScreenState} = useSplashScreenStateContext();

    useEffect(() => {
        if (url !== CONST.HYBRID_APP.REORDERING_REACT_NATIVE_ACTIVITY_TO_FRONT) {
            return;
        }

        if (splashScreenState !== CONST.BOOT_SPLASH_STATE.HIDDEN) {
            setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
            Navigation.navigate(lastVisitedPath as Route);
        }
    }, [lastVisitedPath, setSplashScreenState, splashScreenState, url]);

    useEffect(() => {
        if (url === CONST.HYBRID_APP.REORDERING_REACT_NATIVE_ACTIVITY_TO_FRONT) {
            return;
        }

        if (url) {
            signInAfterTransitionFromOldDot(url).then((route) => {
                setInitialURL(route);
                setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
            });
            return;
        }
        Linking.getInitialURL().then((initURL) => {
            setInitialURL(initURL as Route);
        });
    }, [setSplashScreenState, url]);

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

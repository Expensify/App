import React, {createContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {Linking} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import {signInAfterTransitionFromOldDot} from '@libs/actions/Session';
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
    url?: Route;

    /** Children passed to the context provider */
    children: ReactNode;
};

function InitialURLContextProvider({children, url}: InitialURLContextProviderProps) {
    const [initialURL, setInitialURL] = useState<Route | undefined>();
    const {setSplashScreenState} = useSplashScreenStateContext();
    const [initialLastUpdateIDAppliedToClient, metadata] = useOnyx(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT);
    useEffect(() => {
        if (metadata.status !== 'loaded') {
            return;
        }
        if (url) {
            signInAfterTransitionFromOldDot(url, initialLastUpdateIDAppliedToClient).then((route) => {
                setInitialURL(route);
                setSplashScreenState(CONST.BOOT_SPLASH_STATE.READY_TO_BE_HIDDEN);
            });
            return;
        }
        Linking.getInitialURL().then((initURL) => {
            setInitialURL(initURL as Route);
        });
    }, [initialLastUpdateIDAppliedToClient, metadata.status, setSplashScreenState, url]);

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

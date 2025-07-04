import React, {createContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {Linking} from 'react-native';
import type {AppProps} from '@src/App';
import type {Route} from '@src/ROUTES';
import CONFIG from '@src/CONFIG';
import Navigation from '@navigation/Navigation';

type InitialUrlContextType = {
    initialURL: Route | null;
    setInitialURL: React.Dispatch<React.SetStateAction<Route | null>>;
};

/** Initial url that will be opened when NewDot is embedded into Hybrid App. */
const InitialURLContext = createContext<InitialUrlContextType>({
    initialURL: null,
    setInitialURL: () => {},
});

type InitialURLContextProviderProps = AppProps & {
    /** Children passed to the context provider */
    children: ReactNode;
};

function InitialURLContextProvider({children}: InitialURLContextProviderProps) {
    const [initialURL, setInitialURL] = useState<Route | null>(null);

    useEffect(() => {
        Linking.getInitialURL().then((initURL) => {
            if (!initURL) {
                return;
            }
            setInitialURL(
                CONFIG.IS_HYBRID_APP ? Navigation.parseHybridAppUrl(initURL as Route) : initURL as Route 
            );
        });
    }, []);

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

import React, {createContext, useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import {Linking} from 'react-native';
import type {Route} from '@src/ROUTES';

/** Initial url that will be opened when NewDot is embedded into Hybrid App. */
const InitialURLContext = createContext<Route | undefined>(undefined);

type InitialURLContextProviderProps = {
    /** URL passed to our top-level React Native component by HybridApp. Will always be undefined in "pure" NewDot builds. */
    url?: Route;

    /** Children passed to the context provider */
    children: ReactNode;
};

function InitialURLContextProvider({children, url}: InitialURLContextProviderProps) {
    const [initialURL, setInitialURL] = useState(url);
    useEffect(() => {
        if (initialURL) {
            return;
        }
        Linking.getInitialURL().then((initURL) => {
            setInitialURL(initURL as Route);
        });
    }, [initialURL]);
    return <InitialURLContext.Provider value={initialURL}>{children}</InitialURLContext.Provider>;
}

InitialURLContextProvider.displayName = 'InitialURLContextProvider';

export default InitialURLContextProvider;
export {InitialURLContext};

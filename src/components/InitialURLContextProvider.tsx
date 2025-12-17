import React, {createContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {Linking} from 'react-native';
import type {Route} from '@src/ROUTES';

type InitialUrlContextType = {
    initialURL: Route | null;
    setInitialURL: React.Dispatch<React.SetStateAction<Route | null>>;
    isAuthenticatedAtStartup: boolean;
    setIsAuthenticatedAtStartup: React.Dispatch<React.SetStateAction<boolean>>;
};

/** Initial url that will be opened when NewDot is embedded into Hybrid App. */
const InitialURLContext = createContext<InitialUrlContextType>({
    initialURL: null,
    setInitialURL: () => {},
    isAuthenticatedAtStartup: false,
    setIsAuthenticatedAtStartup: () => {},
});

type InitialURLContextProviderProps = {
    /** Children passed to the context provider */
    children: ReactNode;
};

function InitialURLContextProvider({children}: InitialURLContextProviderProps) {
    const [initialURL, setInitialURL] = useState<Route | null>(null);
    const [isAuthenticatedAtStartup, setIsAuthenticatedAtStartup] = useState<boolean>(false);

    useEffect(() => {
        Linking.getInitialURL().then((initURL) => {
            if (!initURL) {
                return;
            }
            setInitialURL(initURL as Route);
        });
    }, []);

    const initialUrlContext = useMemo(
        () => ({
            initialURL,
            setInitialURL,
            isAuthenticatedAtStartup,
            setIsAuthenticatedAtStartup,
        }),
        [initialURL, isAuthenticatedAtStartup],
    );

    return <InitialURLContext.Provider value={initialUrlContext}>{children}</InitialURLContext.Provider>;
}

export default InitialURLContextProvider;
export {InitialURLContext};

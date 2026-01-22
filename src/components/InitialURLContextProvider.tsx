import React, {createContext, useContext, useEffect, useState} from 'react';
import type {ReactNode} from 'react';
import {Linking} from 'react-native';
import type {Route} from '@src/ROUTES';

type InitialUrlStateContextType = {
    initialURL: Route | null;
    isAuthenticatedAtStartup: boolean;
};

type InitialUrlActionsContextType = {
    setInitialURL: React.Dispatch<React.SetStateAction<Route | null>>;
    setIsAuthenticatedAtStartup: React.Dispatch<React.SetStateAction<boolean>>;
};

const defaultInitialURLActionsContext: InitialUrlActionsContextType = {
    setInitialURL: () => {},
    setIsAuthenticatedAtStartup: () => {},
};

/** Initial url that will be opened when NewDot is embedded into Hybrid App. */
const InitialURLStateContext = createContext<InitialUrlStateContextType>({
    initialURL: null,
    isAuthenticatedAtStartup: false,
});

const InitialURLActionsContext = createContext<InitialUrlActionsContextType>(defaultInitialURLActionsContext);

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

    const stateContextValue = {
        initialURL,
        isAuthenticatedAtStartup,
    };

    const actionsContextValue = {
        setInitialURL,
        setIsAuthenticatedAtStartup,
    };

    return (
        <InitialURLActionsContext.Provider value={actionsContextValue}>
            <InitialURLStateContext.Provider value={stateContextValue}>{children}</InitialURLStateContext.Provider>
        </InitialURLActionsContext.Provider>
    );
}

export default InitialURLContextProvider;

function useInitialURLState() {
    return useContext(InitialURLStateContext);
}

function useInitialURLActions() {
    return useContext(InitialURLActionsContext);
}

export {useInitialURLState, useInitialURLActions};

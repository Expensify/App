import React, {createContext, useContext, useState} from 'react';
import type {ReactNode} from 'react';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';

type FullScreenLoaderStateContextType = {
    /**
     * Whether the full screen loader is visible.
     */
    isLoaderVisible: boolean;
};

type FullScreenLoaderActionsContextType = {
    /**
     * Set the full screen loader visibility.
     */
    setIsLoaderVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

type FullScreenLoaderContextProviderProps = {
    /**
     * The children of the full screen loader context provider.
     */
    children: ReactNode;
};

const defaultActionsContextValue: FullScreenLoaderActionsContextType = {
    setIsLoaderVisible: () => {},
};

const FullScreenLoaderStateContext = createContext<FullScreenLoaderStateContextType>({
    isLoaderVisible: false,
});

const FullScreenLoaderActionsContext = createContext<FullScreenLoaderActionsContextType>(defaultActionsContextValue);

function FullScreenLoaderContextProvider({children}: FullScreenLoaderContextProviderProps) {
    const [isLoaderVisible, setIsLoaderVisible] = useState(false);

    const actionsContextValue = {
        setIsLoaderVisible,
    };

    const stateContextValue = {isLoaderVisible};

    return (
        <FullScreenLoaderActionsContext.Provider value={actionsContextValue}>
            <FullScreenLoaderStateContext.Provider value={stateContextValue}>
                {children}
                {isLoaderVisible && <FullScreenLoadingIndicator />}
            </FullScreenLoaderStateContext.Provider>
        </FullScreenLoaderActionsContext.Provider>
    );
}

function useFullScreenLoaderState(): FullScreenLoaderStateContextType {
    return useContext(FullScreenLoaderStateContext);
}

function useFullScreenLoaderActions(): FullScreenLoaderActionsContextType {
    return useContext(FullScreenLoaderActionsContext);
}

export default FullScreenLoaderContextProvider;
export {useFullScreenLoaderState, useFullScreenLoaderActions};

import React, {createContext, useContext, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import FullScreenLoadingIndicator from './FullscreenLoadingIndicator';

type FullScreenLoaderContextType = {
    isLoaderVisible: boolean;
    setIsLoaderVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const FullScreenLoaderContext = createContext<FullScreenLoaderContextType>({
    isLoaderVisible: false,
    setIsLoaderVisible: () => {},
});

type FullScreenLoaderContextProviderProps = {
    children: ReactNode;
};

function FullScreenLoaderContextProvider({children}: FullScreenLoaderContextProviderProps) {
    const [isLoaderVisible, setIsLoaderVisible] = useState(false);

    const loaderContext = useMemo(
        () => ({
            isLoaderVisible,
            setIsLoaderVisible,
        }),
        [isLoaderVisible],
    );

    return (
        <FullScreenLoaderContext.Provider value={loaderContext}>
            {children}
            {isLoaderVisible && <FullScreenLoadingIndicator />}
        </FullScreenLoaderContext.Provider>
    );
}

function useFullScreenLoader() {
    const context = useContext(FullScreenLoaderContext);

    if (!context) {
        throw new Error('useFullScreenLoader must be used within a FullScreenLoaderContextProvider');
    }

    return context;
}

FullScreenLoaderContextProvider.displayName = 'FullScreenLoaderContextProvider';

export default FullScreenLoaderContextProvider;
export {FullScreenLoaderContext, useFullScreenLoader};

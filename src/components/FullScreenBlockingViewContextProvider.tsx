import React, {createContext, useCallback, useMemo, useState} from 'react';

type FullScreenBlockingViewContextValue = {
    addRouteKey: (key: string) => void;
    removeRouteKey: (key: string) => void;
    isBlockingViewVisible: boolean;
};

type FullScreenBlockingViewContextProviderProps = {
    children: React.ReactNode;
};

const defaultValue: FullScreenBlockingViewContextValue = {
    addRouteKey: () => {},
    removeRouteKey: () => {},
    isBlockingViewVisible: false,
};

const FullScreenBlockingViewContext = createContext<FullScreenBlockingViewContextValue>(defaultValue);

function FullScreenBlockingViewContextProvider({children}: FullScreenBlockingViewContextProviderProps) {
    const [routeKeys, setRouteKeys] = useState<Set<string>>(new Set());

    const addRouteKey = useCallback((key: string) => {
        setRouteKeys((prevKeys) => new Set(prevKeys).add(key));
    }, []);

    const removeRouteKey = useCallback((key: string) => {
        setRouteKeys((prevKeys) => {
            const newKeys = new Set(prevKeys);
            newKeys.delete(key);
            return newKeys;
        });
    }, []);

    const isBlockingViewVisible = useMemo(() => routeKeys.size > 0, [routeKeys]);

    const contextValue = useMemo(
        () => ({
            addRouteKey,
            removeRouteKey,
            isBlockingViewVisible,
        }),
        [addRouteKey, removeRouteKey, isBlockingViewVisible],
    );

    return <FullScreenBlockingViewContext.Provider value={contextValue}>{children}</FullScreenBlockingViewContext.Provider>;
}

export default FullScreenBlockingViewContextProvider;

export {FullScreenBlockingViewContext};

export type {FullScreenBlockingViewContextProviderProps, FullScreenBlockingViewContextValue};

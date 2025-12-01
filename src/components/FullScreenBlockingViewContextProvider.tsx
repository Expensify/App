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

/**
 * Provides a context for getting information about the visibility of a full-screen blocking view.
 * This context allows the blocking view to add or remove route keys, which determine
 * whether the blocking view is displayed on a screen. If there are any route keys present,
 * the blocking view is considered visible.
 * This information is necessary because we don't want to show the TopLevelNavigationTabBar when the blocking view is visible.
 */
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

    const isBlockingViewVisible = useMemo(() => routeKeys.size > 0, [routeKeys.size]);

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

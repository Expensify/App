import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';

type FullScreenBlockingViewStateContextType = {
    isBlockingViewVisible: boolean;
};

type FullScreenBlockingViewActionsContextType = {
    addRouteKey: (key: string) => void;
    removeRouteKey: (key: string) => void;
};

type FullScreenBlockingViewContextProviderProps = {
    children: React.ReactNode;
};

const defaultActionsValue: FullScreenBlockingViewActionsContextType = {
    addRouteKey: () => {},
    removeRouteKey: () => {},
};

const FullScreenBlockingViewStateContext = createContext<FullScreenBlockingViewStateContextType>({
    isBlockingViewVisible: false,
});

const FullScreenBlockingViewActionsContext = createContext<FullScreenBlockingViewActionsContextType>(defaultActionsValue);

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

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const actionsContextValue = {
        addRouteKey,
        removeRouteKey,
    };

    // Because of the React Compiler we don't need to memoize it manually
    // eslint-disable-next-line react/jsx-no-constructed-context-values
    const stateContextValue = {isBlockingViewVisible};

    return (
        <FullScreenBlockingViewActionsContext.Provider value={actionsContextValue}>
            <FullScreenBlockingViewStateContext.Provider value={stateContextValue}>{children}</FullScreenBlockingViewStateContext.Provider>
        </FullScreenBlockingViewActionsContext.Provider>
    );
}

function useFullScreenBlockingViewState(): FullScreenBlockingViewStateContextType {
    return useContext(FullScreenBlockingViewStateContext);
}

function useFullScreenBlockingViewActions(): FullScreenBlockingViewActionsContextType {
    return useContext(FullScreenBlockingViewActionsContext);
}

export default FullScreenBlockingViewContextProvider;

export {useFullScreenBlockingViewState, useFullScreenBlockingViewActions};

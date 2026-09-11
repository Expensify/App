import React, {createContext, useContext} from 'react';

import type {WindowLayoutPolicy} from './getNavigationLayoutPolicy';

const NavigationLayoutContext = createContext<WindowLayoutPolicy | undefined>(undefined);

type NavigationLayoutContextProviderProps = React.PropsWithChildren<{
    policy: WindowLayoutPolicy | undefined;
}>;

function NavigationLayoutContextProvider({policy, children}: NavigationLayoutContextProviderProps) {
    return <NavigationLayoutContext.Provider value={policy}>{children}</NavigationLayoutContext.Provider>;
}

function useNavigationLayoutContext() {
    return useContext(NavigationLayoutContext);
}

export {NavigationLayoutContextProvider, useNavigationLayoutContext};

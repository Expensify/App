import isTabRouteAtRoot from '@libs/Navigation/helpers/isTabRouteAtRoot';

import type ChildrenProps from '@src/types/utils/ChildrenProps';

import {useNavigationState} from '@react-navigation/native';
import React, {createContext} from 'react';

/** Whether the tab screen's route is at the tab's root, where the navigator draws its own tab bar. */
const IsTabRouteAtRootContext = createContext(false);

type IsTabRouteAtRootProviderProps = ChildrenProps & {
    /** Key of the tab route the provided screen belongs to. */
    routeKey: string;
};

function IsTabRouteAtRootProvider({routeKey, children}: IsTabRouteAtRootProviderProps) {
    const isAtRoot = useNavigationState((state) => isTabRouteAtRoot(state.routes.find((route) => route.key === routeKey)));

    return <IsTabRouteAtRootContext.Provider value={isAtRoot}>{children}</IsTabRouteAtRootContext.Provider>;
}

export default IsTabRouteAtRootContext;
export {IsTabRouteAtRootProvider};

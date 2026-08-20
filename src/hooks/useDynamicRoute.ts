import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';

import type {Route} from '@src/ROUTES';

import {useRoutePath} from '@react-navigation/native';

/** Binds a dynamic route to the component's own screen (via `useRoutePath`), not the active route, so a link built during render still resolves after an RHP opens over it. */
function useDynamicRoute(): (dynamicRouteSuffixWithParams: string) => Route {
    const basePath = useRoutePath();
    return (dynamicRouteSuffixWithParams: string) => createDynamicRoute(dynamicRouteSuffixWithParams, basePath);
}

export default useDynamicRoute;

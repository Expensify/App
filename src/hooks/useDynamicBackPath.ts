import {useNavigationState} from '@react-navigation/native';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

/**
 * Returns the back path for a dynamic route by removing the dynamic suffix from the current URL.
 * @param dynamicRouteSuffix The dynamic route suffix to remove from the current path
 * @returns The back path without the dynamic route suffix
 */
function useDynamicBackPath(dynamicRouteSuffix: DynamicRouteSuffix): Route {
    const path = useNavigationState((state) => getPathFromState(state));
    const backPath = path ? (path.replace(`/${dynamicRouteSuffix}`, '') as Route) : ROUTES.HOME;
    return backPath;
}

export default useDynamicBackPath;

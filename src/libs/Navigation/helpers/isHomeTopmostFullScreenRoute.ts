import {navigationRef} from '@libs/Navigation/Navigation';
import type {RootNavigatorParamList, State} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';
import {isFullScreenName} from './isNavigatorName';

const isHomeTopmostFullScreenRoute = (): boolean => {
    const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;

    if (!rootState) {
        return false;
    }

    return rootState.routes.findLast((route) => isFullScreenName(route.name))?.name === SCREENS.HOME;
};

export default isHomeTopmostFullScreenRoute;

import {navigationRef} from '@libs/Navigation/Navigation';
import type {RootNavigatorParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import getActiveTabName from './getActiveTabName';
import {isFullScreenName} from './isNavigatorName';

const isSearchTopmostFullScreenRoute = (): boolean => {
    const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;

    if (!rootState) {
        return false;
    }

    const topmostFullScreenRoute = rootState.routes.findLast((route) => isFullScreenName(route.name));
    return getActiveTabName(topmostFullScreenRoute) === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
};

export default isSearchTopmostFullScreenRoute;

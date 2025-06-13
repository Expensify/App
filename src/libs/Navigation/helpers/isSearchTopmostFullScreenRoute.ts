import {navigationRef} from '@libs/Navigation/Navigation';
import type {RootNavigatorParamList, State} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';
import {isFullScreenName} from './isNavigatorName';

const isSearchTopmostFullScreenRoute = (): boolean => {
    const rootState = navigationRef.getRootState() as State<RootNavigatorParamList>;

    if (!rootState) {
        return false;
    }
    return rootState.routes.findLast((route) => isFullScreenName(route.name))?.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
};

export default isSearchTopmostFullScreenRoute;

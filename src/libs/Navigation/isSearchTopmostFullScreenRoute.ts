import {isFullScreenName} from '@libs/NavigationUtils';
import SCREENS from '@src/SCREENS';
import {navigationRef} from './Navigation';
import type {RootStackParamList, State} from './types';

const isSearchTopmostFullScreenRoute = (): boolean => {
    const rootState = navigationRef.getRootState() as State<RootStackParamList>;

    if (!rootState) {
        return false;
    }

    return rootState.routes.findLast((route) => isFullScreenName(route.name))?.name === SCREENS.SEARCH.CENTRAL_PANE;
};

export default isSearchTopmostFullScreenRoute;

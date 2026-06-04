import NAVIGATORS from '@src/NAVIGATORS';
import getTopmostFullScreenRoute from './getTopmostFullScreenRoute';

const isSearchTopmostFullScreenRoute = (): boolean => {
    const topmostFullScreenRoute = getTopmostFullScreenRoute();
    if (!topmostFullScreenRoute) {
        return false;
    }
    return topmostFullScreenRoute.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
};

export default isSearchTopmostFullScreenRoute;

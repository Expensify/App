import NAVIGATORS from '@src/NAVIGATORS';
import type {NavigationPartialRoute, State} from './types';

/**
 * @param state - react-navigation state
 */
const getTopmostNestedRHPRoute = (state: State): NavigationPartialRoute | undefined => {
    const topmostRightPane = state.routes.filter((route) => route.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR).at(-1);

    if (topmostRightPane?.state) {
        return getTopmostNestedRHPRoute(topmostRightPane.state);
    }

    const topmostRoute = state.routes.at(-1);

    if (topmostRoute?.state) {
        return getTopmostNestedRHPRoute(topmostRoute.state);
    }

    if (topmostRoute) {
        return {name: topmostRoute.name, params: topmostRoute.params};
    }
};

export default getTopmostNestedRHPRoute;

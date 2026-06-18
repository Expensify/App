type FocusedRoutePathRoute = {
    key?: string;
    name: string;
    state?: FocusedRoutePathState;
};

type FocusedRoutePathState = {
    index?: number;
    routes?: readonly FocusedRoutePathRoute[];
};

type ShouldStopAtRoute = (route: FocusedRoutePathRoute) => boolean;

function getFocusedRouteAtCurrentLevel(state?: FocusedRoutePathState): FocusedRoutePathRoute | undefined {
    if (!state?.routes?.length) {
        return;
    }

    const focusedIndex = typeof state.index === 'number' && state.routes.at(state.index) ? state.index : state.routes.length - 1;
    return state.routes.at(focusedIndex);
}

function getFocusedRoutePath(state?: FocusedRoutePathState, shouldStopAtRoute?: ShouldStopAtRoute): FocusedRoutePathRoute[] {
    const focusedRoute = getFocusedRouteAtCurrentLevel(state);
    if (!focusedRoute) {
        return [];
    }

    if (shouldStopAtRoute?.(focusedRoute)) {
        return [focusedRoute];
    }

    return [focusedRoute, ...getFocusedRoutePath(focusedRoute.state, shouldStopAtRoute)];
}

export default getFocusedRoutePath;
export {getFocusedRouteAtCurrentLevel};
export type {FocusedRoutePathRoute, FocusedRoutePathState};

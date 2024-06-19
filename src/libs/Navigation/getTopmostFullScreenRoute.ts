import NAVIGATORS from '@src/NAVIGATORS';
import type {NavigationPartialRoute, RootStackParamList, State, WorkspaceScreenName} from './types';

// Get the name of topmost fullscreen route in the navigation stack.
function getTopmostFullScreenRoute(state: State<RootStackParamList>): NavigationPartialRoute<WorkspaceScreenName> | undefined {
    if (!state) {
        return;
    }

    const topmostFullScreenRoute = state.routes.filter((route) => route.name === NAVIGATORS.WORKSPACE_NAVIGATOR).at(-1);

    if (!topmostFullScreenRoute) {
        return;
    }

    if (topmostFullScreenRoute.state) {
        // There will be at least one route in the fullscreen navigator.
        const {name, params} = topmostFullScreenRoute.state.routes.at(-1) as NavigationPartialRoute<WorkspaceScreenName>;

        return {name, params};
    }

    if (!!topmostFullScreenRoute.params && 'screen' in topmostFullScreenRoute.params) {
        return {name: topmostFullScreenRoute.params.screen as WorkspaceScreenName, params: topmostFullScreenRoute.params.params};
    }
}

export default getTopmostFullScreenRoute;

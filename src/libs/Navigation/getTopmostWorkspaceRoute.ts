import NAVIGATORS from '@src/NAVIGATORS';
import type {NavigationPartialRoute, RootStackParamList, State, WorkspaceScreenName} from './types';

// Get the name of topmost workspace navigator route in the navigation stack.
function getTopmostWorkspaceRoute(state: State<RootStackParamList>): NavigationPartialRoute<WorkspaceScreenName> | undefined {
    if (!state) {
        return;
    }

    const topmostWorkspaceRoute = state.routes.filter((route) => route.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR).at(-1);

    if (!topmostWorkspaceRoute) {
        return;
    }

    if (topmostWorkspaceRoute.state) {
        // There will be at least one route in the workspace navigator.
        const {name, params} = topmostWorkspaceRoute.state.routes.at(-1) as NavigationPartialRoute<WorkspaceScreenName>;

        return {name, params};
    }

    if (!!topmostWorkspaceRoute.params && 'screen' in topmostWorkspaceRoute.params) {
        return {name: topmostWorkspaceRoute.params.screen as WorkspaceScreenName, params: topmostWorkspaceRoute.params.params};
    }
}

export default getTopmostWorkspaceRoute;

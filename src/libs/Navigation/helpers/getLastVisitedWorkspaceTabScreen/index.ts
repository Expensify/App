import type {NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

function saveWorkspacesTabPathToSessionStorage(url: string) {
    sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_WORKSPACES_TAB_PATH, url);
}

function getWorkspacesTabStateFromSessionStorage(): PartialState<NavigationState> | undefined {
    const lastVisitedWorkspacesTabPath = sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_WORKSPACES_TAB_PATH);
    if (!lastVisitedWorkspacesTabPath) {
        return undefined;
    }
    return getStateFromPath(lastVisitedWorkspacesTabPath as Route);
}

function getWorkspacesTabScreenNameFromState(state?: PartialState<NavigationState>) {
    return state?.routes.at(-1)?.state?.routes.at(-1)?.name;
}

function getLastVisitedWorkspacesTabPath(state: NavigationState | PartialState<NavigationState>): Route | undefined {
    const lastVisitedWorkspacesTabPath = findFocusedRoute(state)?.path;
    if (!lastVisitedWorkspacesTabPath) {
        return undefined;
    }
    return lastVisitedWorkspacesTabPath as Route;
}

function getLastVisitedWorkspaceTabScreen() {
    const workspacesTabState = getWorkspacesTabStateFromSessionStorage();
    const workspacesTabScreenName = getWorkspacesTabScreenNameFromState(workspacesTabState);
    return workspacesTabScreenName;
}

export {getLastVisitedWorkspaceTabScreen, getLastVisitedWorkspacesTabPath, saveWorkspacesTabPathToSessionStorage, getWorkspacesTabStateFromSessionStorage};

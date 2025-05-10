import type {NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

function saveSettingsTabPathToSessionStorage(url: string) {
    sessionStorage.setItem(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_SETTINGS_TAB_PATH, url);
}

function clearSessionStorage() {
    sessionStorage.clear();
}

function getSettingsTabStateFromSessionStorage(): PartialState<NavigationState> | undefined {
    const lastVisitedSettingsPath = sessionStorage.getItem(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_SETTINGS_TAB_PATH);
    if (!lastVisitedSettingsPath) {
        return undefined;
    }
    return getStateFromPath(lastVisitedSettingsPath as Route);
}

function getWorkspaceScreenNameFromState(state?: PartialState<NavigationState>) {
    return state?.routes.at(-1)?.state?.routes.at(-1)?.name;
}

function getLastVisitedSettingsPath(state: NavigationState | PartialState<NavigationState>): Route | undefined {
    const lastVisitedSettingsPath = findFocusedRoute(state)?.path;
    if (!lastVisitedSettingsPath) {
        return undefined;
    }
    return lastVisitedSettingsPath as Route;
}

function getLastVisitedWorkspaceScreen() {
    const settingsState = getSettingsTabStateFromSessionStorage();
    const workspaceScreenName = getWorkspaceScreenNameFromState(settingsState);
    return workspaceScreenName ?? undefined;
}

export {getLastVisitedWorkspaceScreen, getLastVisitedSettingsPath, saveSettingsTabPathToSessionStorage, getSettingsTabStateFromSessionStorage, clearSessionStorage};

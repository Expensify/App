import type {NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import type {ValueOf} from 'type-fest';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

type LastVisitedTabPathKey = ValueOf<typeof CONST.SESSION_STORAGE_KEYS.LAST_VISITED_PATH>;

/**
 * Clears all session storage data.
 */
function clearSessionStorage() {
    sessionStorage.clear();
}

/**
 * Generic function to save a path to session storage by key
 */
function saveTabPathToSessionStorage(key: LastVisitedTabPathKey, url: string) {
    sessionStorage.setItem(key, url);
}

/**
 * Converts stored path to navigation state
 */
function getTabStateFromSessionStorage(key: LastVisitedTabPathKey) {
    const path = sessionStorage.getItem(key) as Route | undefined;
    if (!path) {
        return undefined;
    }
    return getStateFromPath(path);
}

/**
 * Generic function to extract the path from currently focused route
 */
function getLastVisitedTabPath(state: NavigationState | PartialState<NavigationState>) {
    const focusedRoute = findFocusedRoute(state);
    if (!focusedRoute) {
        return undefined;
    }
    return focusedRoute.path as Route;
}

function saveWorkspacesTabPathToSessionStorage(url: string) {
    saveTabPathToSessionStorage(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_PATH.WORKSPACES_TAB, url);
}

function getWorkspacesTabStateFromSessionStorage() {
    return getTabStateFromSessionStorage(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_PATH.WORKSPACES_TAB);
}

function saveSettingsTabPathToSessionStorage(url: string) {
    saveTabPathToSessionStorage(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_PATH.SETTINGS_TAB, url);
}

function getSettingsTabStateFromSessionStorage() {
    return getTabStateFromSessionStorage(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_PATH.SETTINGS_TAB);
}

function getLastVisitedWorkspaceTabScreen() {
    const workspacesTabState = getWorkspacesTabStateFromSessionStorage();
    return workspacesTabState?.routes?.at(-1)?.state?.routes?.at(-1)?.name;
}

export {
    clearSessionStorage,
    getLastVisitedWorkspaceTabScreen,
    getLastVisitedTabPath,
    saveSettingsTabPathToSessionStorage,
    getSettingsTabStateFromSessionStorage,
    saveWorkspacesTabPathToSessionStorage,
    getWorkspacesTabStateFromSessionStorage,
};

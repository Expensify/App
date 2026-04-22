import type {InitialState} from '@react-navigation/native';
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
    if (!workspacesTabState) {
        return undefined;
    }
    return findFocusedRoute(workspacesTabState as InitialState)?.name;
}

export {
    clearSessionStorage,
    getLastVisitedWorkspaceTabScreen,
    saveSettingsTabPathToSessionStorage,
    getSettingsTabStateFromSessionStorage,
    saveWorkspacesTabPathToSessionStorage,
    getWorkspacesTabStateFromSessionStorage,
};

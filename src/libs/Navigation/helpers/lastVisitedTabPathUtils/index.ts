import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';

import type {ValueOf} from 'type-fest';

type LastVisitedTabPathKey = ValueOf<typeof CONST.SESSION_STORAGE_KEYS.LAST_VISITED_PATH>;

/**
 * Clears all session storage data.
 */
function clearSessionStorage() {
    sessionStorage.clear();
}

/**
 * Clears the last visited tab paths, so a tab can't restore a path that belongs to another account.
 */
function clearLastVisitedTabPaths() {
    for (const key of Object.values(CONST.SESSION_STORAGE_KEYS.LAST_VISITED_PATH)) {
        sessionStorage.removeItem(key);
    }
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

export {clearSessionStorage, clearLastVisitedTabPaths, saveSettingsTabPathToSessionStorage, saveWorkspacesTabPathToSessionStorage, getWorkspacesTabStateFromSessionStorage};

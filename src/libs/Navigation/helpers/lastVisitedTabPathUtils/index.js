"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearSessionStorage = clearSessionStorage;
exports.getLastVisitedWorkspaceTabScreen = getLastVisitedWorkspaceTabScreen;
exports.getLastVisitedTabPath = getLastVisitedTabPath;
exports.saveSettingsTabPathToSessionStorage = saveSettingsTabPathToSessionStorage;
exports.getSettingsTabStateFromSessionStorage = getSettingsTabStateFromSessionStorage;
exports.saveWorkspacesTabPathToSessionStorage = saveWorkspacesTabPathToSessionStorage;
exports.getWorkspacesTabStateFromSessionStorage = getWorkspacesTabStateFromSessionStorage;
var native_1 = require("@react-navigation/native");
var getStateFromPath_1 = require("@libs/Navigation/helpers/getStateFromPath");
var CONST_1 = require("@src/CONST");
/**
 * Clears all session storage data.
 */
function clearSessionStorage() {
    sessionStorage.clear();
}
/**
 * Generic function to save a path to session storage by key
 */
function saveTabPathToSessionStorage(key, url) {
    sessionStorage.setItem(key, url);
}
/**
 * Converts stored path to navigation state
 */
function getTabStateFromSessionStorage(key) {
    var path = sessionStorage.getItem(key);
    if (!path) {
        return undefined;
    }
    return (0, getStateFromPath_1.default)(path);
}
/**
 * Generic function to extract the path from currently focused route
 */
function getLastVisitedTabPath(state) {
    var focusedRoute = (0, native_1.findFocusedRoute)(state);
    if (!focusedRoute) {
        return undefined;
    }
    return focusedRoute.path;
}
function saveWorkspacesTabPathToSessionStorage(url) {
    saveTabPathToSessionStorage(CONST_1.default.SESSION_STORAGE_KEYS.LAST_VISITED_PATH.WORKSPACES_TAB, url);
}
function getWorkspacesTabStateFromSessionStorage() {
    return getTabStateFromSessionStorage(CONST_1.default.SESSION_STORAGE_KEYS.LAST_VISITED_PATH.WORKSPACES_TAB);
}
function saveSettingsTabPathToSessionStorage(url) {
    saveTabPathToSessionStorage(CONST_1.default.SESSION_STORAGE_KEYS.LAST_VISITED_PATH.SETTINGS_TAB, url);
}
function getSettingsTabStateFromSessionStorage() {
    return getTabStateFromSessionStorage(CONST_1.default.SESSION_STORAGE_KEYS.LAST_VISITED_PATH.SETTINGS_TAB);
}
function getLastVisitedWorkspaceTabScreen() {
    var _a, _b, _c, _d, _e;
    var workspacesTabState = getWorkspacesTabStateFromSessionStorage();
    return (_e = (_d = (_c = (_b = (_a = workspacesTabState === null || workspacesTabState === void 0 ? void 0 : workspacesTabState.routes) === null || _a === void 0 ? void 0 : _a.at(-1)) === null || _b === void 0 ? void 0 : _b.state) === null || _c === void 0 ? void 0 : _c.routes) === null || _d === void 0 ? void 0 : _d.at(-1)) === null || _e === void 0 ? void 0 : _e.name;
}

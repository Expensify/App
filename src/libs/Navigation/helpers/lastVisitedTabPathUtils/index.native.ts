import type {NavigationState, PartialState} from '@react-navigation/native';
import type {Route} from '@src/ROUTES';

function clearSessionStorage() {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveWorkspacesTabPathToSessionStorage(url: string) {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveSettingsTabPathToSessionStorage(url: string) {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getLastVisitedTabPath(state: NavigationState | PartialState<NavigationState>): Route | undefined {
    return undefined;
}

function getWorkspacesTabStateFromSessionStorage() {
    return undefined;
}
function getSettingsTabStateFromSessionStorage() {
    return undefined;
}

function getLastVisitedWorkspaceTabScreen() {
    return undefined;
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

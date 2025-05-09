import type {NavigationState, PartialState} from '@react-navigation/native';
import type {Route} from '@src/ROUTES';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveSettingsTabPathToSessionStorage(url: string) {}

function getSettingsTabStateFromSessionStorage(): PartialState<NavigationState> | undefined {
    return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function clearSessionStorage() {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getLastVisitedSettingsPath(state: NavigationState | PartialState<NavigationState>): Route | undefined {
    return undefined;
}

function getLastVisitedWorkspaceScreen() {
    return undefined;
}

export {getLastVisitedWorkspaceScreen, getLastVisitedSettingsPath, saveSettingsTabPathToSessionStorage, getSettingsTabStateFromSessionStorage, clearSessionStorage};

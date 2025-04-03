import type {NavigationState, PartialState} from '@react-navigation/native';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveSettingsStatePathToSessionStorage(url: string) {}

function getSettingsTabStateFromSessionStorage(): PartialState<NavigationState> | undefined {
    return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getLastVisitedSettingsPath(state?: NavigationState | PartialState<NavigationState> | undefined): Route | undefined {
    return undefined;
}

function getLastVisitedWorkspaceScreen() {
    return SCREENS.WORKSPACE.INITIAL;
}

export {getLastVisitedWorkspaceScreen, getLastVisitedSettingsPath, saveSettingsStatePathToSessionStorage, getSettingsTabStateFromSessionStorage};

import type {NavigationState, PartialState} from '@react-navigation/native';
import type {Route} from '@src/ROUTES';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveWorkspacesTabPathToSessionStorage(url: string) {}

function getWorkspacesTabStateFromSessionStorage(): PartialState<NavigationState> | undefined {
    return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getLastVisitedWorkspacesTabPath(state: NavigationState | PartialState<NavigationState>): Route | undefined {
    return undefined;
}

function getLastVisitedWorkspaceTabScreen() {
    return undefined;
}

export {getLastVisitedWorkspaceTabScreen, getLastVisitedWorkspacesTabPath, saveWorkspacesTabPathToSessionStorage, getWorkspacesTabStateFromSessionStorage};

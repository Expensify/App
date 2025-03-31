import SCREENS from '@src/SCREENS';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function savePathToSessionStorage(url: string) {}

function getLastVisitedWorkspaceScreen() {
    return SCREENS.WORKSPACE.INITIAL;
}

function getLastVisitedSettingsPath(): string {
    return '';
}

export {savePathToSessionStorage, getLastVisitedWorkspaceScreen, getLastVisitedSettingsPath};

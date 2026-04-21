function clearSessionStorage() {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveWorkspacesTabPathToSessionStorage(url: string) {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveSettingsTabPathToSessionStorage(url: string) {}

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
    saveSettingsTabPathToSessionStorage,
    getSettingsTabStateFromSessionStorage,
    saveWorkspacesTabPathToSessionStorage,
    getWorkspacesTabStateFromSessionStorage,
};

function clearSessionStorage() {}

function clearLastVisitedTabPaths() {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveWorkspacesTabPathToSessionStorage(url: string) {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveSettingsTabPathToSessionStorage(url: string) {}

function getWorkspacesTabStateFromSessionStorage() {
    return undefined;
}

export {clearSessionStorage, clearLastVisitedTabPaths, saveSettingsTabPathToSessionStorage, saveWorkspacesTabPathToSessionStorage, getWorkspacesTabStateFromSessionStorage};

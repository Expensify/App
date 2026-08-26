function clearSessionStorage() {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveWorkspacesTabPathToSessionStorage(url: string) {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveSettingsTabPathToSessionStorage(url: string) {}

function getWorkspacesTabStateFromSessionStorage(): {routes?: Array<{name: string; state?: {routes?: Array<{name: string; state?: {routes?: Array<{name: string}>}}>}}>} | undefined {
    return undefined;
}

export {clearSessionStorage, saveSettingsTabPathToSessionStorage, saveWorkspacesTabPathToSessionStorage, getWorkspacesTabStateFromSessionStorage};

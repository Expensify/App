// Use logging utils exposed from desktop/contextBridge.js to persist logs to file
// See https://www.npmjs.com/package/electron-log for all the options

// Prefix custom logs with a scope label, so they are easily distinguished in the log file
const scope = window.electron.log.scope('renderer:Log');

export default scope.debug;

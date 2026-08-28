/**
 * Browser crash diagnostics are web-only — native crashes are captured by the Sentry native SDK.
 */
function initializeCrashDiagnostics() {}

function cleanupCrashDiagnostics() {}

export {initializeCrashDiagnostics, cleanupCrashDiagnostics};

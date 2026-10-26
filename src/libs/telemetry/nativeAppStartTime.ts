// Elapsed time uses performance.now() because Date.now() jumps when the device clock is corrected.
let appStartAgeAtSetupMs: number | undefined;
let performanceNowAtSetupMs = 0;

function setNativeAppStartTime(timestampMs: number | undefined) {
    if (timestampMs === undefined) {
        appStartAgeAtSetupMs = undefined;
        return;
    }
    appStartAgeAtSetupMs = Date.now() - timestampMs;
    performanceNowAtSetupMs = performance.now();
}

function getMsSinceNativeAppStart(): number | undefined {
    if (appStartAgeAtSetupMs === undefined) {
        return undefined;
    }
    return Math.round(appStartAgeAtSetupMs + performance.now() - performanceNowAtSetupMs);
}

export {getMsSinceNativeAppStart, setNativeAppStartTime};

// Elapsed time takes the larger of the Date.now() and performance.now() deltas: Date.now() goes backwards when the
// device clock is corrected, and performance.now() stops during Android deep sleep. JS cannot tell a forward clock
// correction from sleep, so a forward correction after setup inflates the value.
let appStartAgeAtSetupMs: number | undefined;
let dateNowAtSetupMs: number | undefined;
let performanceNowAtSetupMs = 0;

function setNativeAppStartTime(timestampMs: number | undefined) {
    dateNowAtSetupMs = Date.now();
    performanceNowAtSetupMs = performance.now();
    appStartAgeAtSetupMs = timestampMs === undefined ? undefined : dateNowAtSetupMs - timestampMs;
}

function getElapsedMsSinceSetup(): number | undefined {
    if (dateNowAtSetupMs === undefined) {
        return undefined;
    }
    return Math.max(Date.now() - dateNowAtSetupMs, performance.now() - performanceNowAtSetupMs);
}

function getMsSinceJsStartup(): number | undefined {
    const elapsedMs = getElapsedMsSinceSetup();
    return elapsedMs === undefined ? undefined : Math.round(elapsedMs);
}

function getMsSinceNativeAppStart(): number | undefined {
    const elapsedMs = getElapsedMsSinceSetup();
    if (appStartAgeAtSetupMs === undefined || elapsedMs === undefined) {
        return undefined;
    }
    return Math.round(appStartAgeAtSetupMs + elapsedMs);
}

export {getMsSinceJsStartup, getMsSinceNativeAppStart, setNativeAppStartTime};

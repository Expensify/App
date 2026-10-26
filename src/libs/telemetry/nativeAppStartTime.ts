// Elapsed time takes the larger of the Date.now() and performance.now() deltas: Date.now() goes backwards when the
// device clock is corrected, and performance.now() stops during Android deep sleep. JS cannot tell a forward clock
// correction from sleep, so a forward correction after setup inflates the value.
let appStartAgeAtSetupMs: number | undefined;
let dateNowAtSetupMs = 0;
let performanceNowAtSetupMs = 0;

function setNativeAppStartTime(timestampMs: number | undefined) {
    if (timestampMs === undefined) {
        appStartAgeAtSetupMs = undefined;
        return;
    }
    dateNowAtSetupMs = Date.now();
    performanceNowAtSetupMs = performance.now();
    appStartAgeAtSetupMs = dateNowAtSetupMs - timestampMs;
}

function getMsSinceNativeAppStart(): number | undefined {
    if (appStartAgeAtSetupMs === undefined) {
        return undefined;
    }
    const msSinceSetup = Math.max(Date.now() - dateNowAtSetupMs, performance.now() - performanceNowAtSetupMs);
    return Math.round(appStartAgeAtSetupMs + msSinceSetup);
}

export {getMsSinceNativeAppStart, setNativeAppStartTime};

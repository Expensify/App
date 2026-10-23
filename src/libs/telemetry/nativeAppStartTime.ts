let nativeAppStartTimeMs: number | undefined;

function setNativeAppStartTime(timestampMs: number | undefined) {
    nativeAppStartTimeMs = timestampMs;
}

function getMsSinceNativeAppStart(): number | undefined {
    if (nativeAppStartTimeMs === undefined) {
        return undefined;
    }
    return Math.round(Date.now() - nativeAppStartTimeMs);
}

export {getMsSinceNativeAppStart, setNativeAppStartTime};

import checkWebServer from './checkWebServer';

type WaitForPublicWebServerOptions = {
    interval?: number;

    /** How long startup can take before `onSlow` reports it. */
    slowAfter?: number;
    onSlow?: () => void;
};

/**
 * Wait until the browser-facing listener serves the app. A slow first compile is reported, not fatal: concurrently
 * already stops the session if a required service exits. Resolves false if the session stops first.
 */
async function waitForPublicWebServer(
    origin: string,
    isWorkerEnabled: boolean,
    signal: AbortSignal,
    {interval = 250, slowAfter = 180_000, onSlow = () => {}}: WaitForPublicWebServerOptions = {},
): Promise<boolean> {
    const slowAt = Date.now() + slowAfter;
    let hasReportedSlow = false;
    while (!signal.aborted) {
        if (await checkWebServer(origin, isWorkerEnabled, signal)) {
            return !signal.aborted;
        }
        if (!hasReportedSlow && Date.now() > slowAt) {
            hasReportedSlow = true;
            onSlow();
        }
        await Bun.sleep(interval);
    }
    return false;
}

export default waitForPublicWebServer;

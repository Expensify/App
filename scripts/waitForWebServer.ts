type WaitForWebServerOptions = {
    interval?: number;

    /** How long startup can take before `onSlow` reports it. */
    slowAfter?: number;
    onSlow?: () => void;
};

/**
 * Gate dev processes on a usable HTTP response, not a listening socket or a compiler log message. Resolves false if the
 * session stops first. There is no deadline: concurrently already stops the session if a required service exits, so a
 * slow first compile is only reported.
 */
async function waitForWebServer(
    probe: (signal: AbortSignal) => Promise<boolean>,
    signal: AbortSignal,
    {interval = 250, slowAfter = Infinity, onSlow = () => {}}: WaitForWebServerOptions = {},
): Promise<boolean> {
    const slowAt = Date.now() + slowAfter;
    let hasReportedSlow = false;
    while (!signal.aborted) {
        try {
            if (await probe(signal)) {
                return !signal.aborted;
            }
        } catch {
            // The server may not have a listener yet, or may still be compiling its first response.
        }
        if (!hasReportedSlow && Date.now() > slowAt) {
            hasReportedSlow = true;
            onSlow();
        }
        if (!signal.aborted) {
            await Bun.sleep(interval);
        }
    }
    return false;
}

/** Whether the private Rsbuild listener can serve the Worker yet. */
async function isRsbuildReady(origin: string, signal: AbortSignal): Promise<boolean> {
    const response = await fetch(origin, {signal: AbortSignal.any([signal, AbortSignal.timeout(2000)]), redirect: 'manual'});
    await response.body?.cancel();
    return response.status === 200;
}

if (import.meta.main) {
    const controller = new AbortController();
    const stop = () => controller.abort();
    process.once('SIGINT', stop);
    process.once('SIGTERM', stop);
    try {
        const origin = Bun.argv.at(2);
        if (!origin) {
            throw new Error('Missing Rsbuild readiness URL');
        }
        // A non-zero exit keeps the shell from starting the Worker.
        if (!(await waitForWebServer((signal) => isRsbuildReady(origin, signal), controller.signal))) {
            process.exitCode = 1;
        }
    } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    } finally {
        process.removeListener('SIGINT', stop);
        process.removeListener('SIGTERM', stop);
    }
}

export default waitForWebServer;
export {isRsbuildReady};

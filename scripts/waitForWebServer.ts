/**
 * Gate dependent dev processes on an HTTP response, not a listening socket or a compiler log message. There is no default
 * deadline, because a failure here stops the session, and concurrently already stops this gate if Rsbuild exits.
 */
async function waitForWebServer(origin: string, signal: AbortSignal, {timeout = Infinity, interval = 250} = {}): Promise<void> {
    const deadline = Date.now() + timeout;
    while (!signal.aborted && Date.now() < deadline) {
        try {
            const response = await fetch(origin, {signal: AbortSignal.any([signal, AbortSignal.timeout(Math.min(2000, Math.max(1, deadline - Date.now())))]), redirect: 'manual'});
            await response.body?.cancel();
            if (response.status === 200) {
                signal.throwIfAborted();
                return;
            }
        } catch {
            // The upstream may not have a listener yet, or may still be compiling its first response.
        }
        if (!signal.aborted) {
            await Bun.sleep(Math.min(interval, Math.max(0, deadline - Date.now())));
        }
    }
    signal.throwIfAborted();
    throw new Error(`Timed out waiting for Rsbuild at ${origin}. Check its output above.`);
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
        await waitForWebServer(origin, controller.signal);
    } catch (error) {
        if (!controller.signal.aborted) {
            console.error(error instanceof Error ? error.message : error);
        }
        process.exitCode = 1;
    } finally {
        process.removeListener('SIGINT', stop);
        process.removeListener('SIGTERM', stop);
    }
}

export default waitForWebServer;

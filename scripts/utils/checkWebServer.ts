/** Probe the public HTTPS listener without disabling certificate verification. */
async function checkWebServer(origin: string, ca: string, useWorker: boolean, signal: AbortSignal): Promise<boolean> {
    try {
        const response = await fetch(origin, {
            tls: {ca},
            signal: AbortSignal.any([signal, AbortSignal.timeout(2000)]),
        });
        await response.body?.cancel();
        return response.status === 200 && (!useWorker || response.headers.has('Content-Security-Policy'));
    } catch {
        return false;
    }
}

export default checkWebServer;

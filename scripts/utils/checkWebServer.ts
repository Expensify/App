import {getCACertificates} from 'node:tls';

/**
 * Probe the public HTTPS listener without disabling certificate verification. `npm run setup-https` trusts the mkcert CA
 * in the OS store, so reading that store avoids requiring mkcert on PATH whenever the server starts.
 */
async function checkWebServer(origin: string, isWorkerEnabled: boolean, signal: AbortSignal): Promise<boolean> {
    try {
        const response = await fetch(origin, {
            tls: {ca: getCACertificates('system')},
            signal: AbortSignal.any([signal, AbortSignal.timeout(2000)]),
        });
        await response.body?.cancel();
        return response.status === 200 && (!isWorkerEnabled || response.headers.has('Content-Security-Policy'));
    } catch {
        return false;
    }
}

export default checkWebServer;

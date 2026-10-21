/** Probe the public HTTPS listener without disabling certificate verification. */
import https from 'node:https';

function checkWebServer(origin: string, ca: Buffer, useWorker: boolean, signal: AbortSignal): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const request = https.get(origin, {ca, timeout: 2000, signal}, (response) => {
            response.resume();
            resolve(response.statusCode === 200 && (!useWorker || !!response.headers['content-security-policy']));
        });
        request.on('timeout', () => {
            // Bun's ClientRequest.destroy() need not emit an error after a timeout.
            resolve(false);
            request.destroy();
        });
        request.on('error', () => resolve(false));
    });
}

export default checkWebServer;

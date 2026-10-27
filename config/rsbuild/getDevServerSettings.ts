type DevServerSettings = {
    isWorkerEnabled: boolean;

    /** The browser-facing port, which links built by the app use. */
    publicPort: number;

    /** The port Rsbuild binds: private behind the Worker, otherwise the public port. */
    port: number;
    strictPort: boolean;
    open: string | false;
};

/**
 * `npm run web` owns the ports and opening the browser, and says so with WEB_LAUNCHER. Without it, Rsbuild runs on its
 * own, so launcher settings that `.env` may contain do not apply.
 */
async function getDevServerSettings(env: Record<string, string | undefined>, findPort: () => Promise<number>): Promise<DevServerSettings> {
    if (env.WEB_LAUNCHER !== 'true') {
        const port = await findPort();
        // Rsbuild's --open flag defaults to the first entry's route, e.g. "/main" for our "main" entry key, which 404s
        // since the app has no route by that name. Open the actual app root instead.
        return {isWorkerEnabled: false, publicPort: port, port, strictPort: false, open: '/'};
    }
    const isWorkerEnabled = env.USE_CLOUDFLARE_WORKER === 'true';
    const publicPort = Number(env.WEB_PORT);
    return {isWorkerEnabled, publicPort, port: isWorkerEnabled ? Number(env.WEB_INTERNAL_PORT) : publicPort, strictPort: true, open: false};
}

export default getDevServerSettings;

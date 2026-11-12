import {$} from 'bun';

type WebCommandSettings = {
    root: string;
    isWorkerEnabled: boolean;
    isProxyEnabled: boolean;

    /** False when another session already runs the API proxy, which this session's Rsbuild then shares. */
    shouldStartProxy: boolean;
    publicPort: number;
    internalPort: number;
    connectOrigins: string[];
};

/** Each child gets the settings it needs in its own env, so the launcher's environment stays as the user set it. */
function getWebCommands({root, isWorkerEnabled, isProxyEnabled, shouldStartProxy, publicPort, internalPort, connectOrigins}: WebCommandSettings) {
    const workerDir = `${root}/web/cloudflare-worker`;
    // concurrently accepts command strings, so escape its dynamic paths and JSON bindings.
    return [
        ...(isProxyEnabled && shouldStartProxy ? [{name: 'api', command: 'npm run web-proxy', env: {USE_WEB_PROXY: 'true'}}] : []),
        {
            name: 'rsbuild',
            command: 'npx rsbuild dev --config config/rsbuild/rsbuild.config.ts',
            // WEB_LAUNCHER tells Rsbuild these settings came from this launcher, not from a user's .env.
            env: {
                WEB_LAUNCHER: 'true',
                WEB_PORT: String(publicPort),
                WEB_INTERNAL_PORT: String(internalPort),
                USE_CLOUDFLARE_WORKER: String(isWorkerEnabled),
                USE_WEB_PROXY: String(isProxyEnabled),
            },
        },
        ...(isWorkerEnabled
            ? [
                  {
                      name: 'worker',
                      cwd: workerDir,
                      command: [
                          `bun ../../scripts/waitForWebServer.ts http://127.0.0.1:${internalPort}/ &&`,
                          'npx wrangler dev',
                          '--local',
                          '--config wrangler.dev.jsonc',
                          '--ip 127.0.0.1',
                          `--port ${publicPort}`,
                          '--inspector-port 0',
                          '--local-protocol https',
                          `--https-key-path ${$.escape(`${root}/config/rsbuild/key.pem`)}`,
                          `--https-cert-path ${$.escape(`${root}/config/rsbuild/certificate.pem`)}`,
                          `--var ${$.escape(`DEV_UPSTREAM:http://127.0.0.1:${internalPort}`)}`,
                          `--var ${$.escape(`DEV_CONNECT_ORIGINS:${JSON.stringify(connectOrigins)}`)}`,
                      ].join(' '),
                  },
              ]
            : []),
    ];
}

export default getWebCommands;

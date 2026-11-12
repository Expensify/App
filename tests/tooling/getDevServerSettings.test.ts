/** Rsbuild should only adopt launcher-owned settings when the launcher says it started Rsbuild. */
import {describe, expect, mock, test} from 'bun:test';

import getDevServerSettings from '../../config/rsbuild/getDevServerSettings';

describe('Rsbuild dev server settings', () => {
    test('uses the launcher ports exactly when the launcher started it', async () => {
        // Given the launcher's explicit settings
        const findPort = mock(async () => 8090);
        // When Rsbuild resolves its server settings
        const settings = await getDevServerSettings({WEB_LAUNCHER: 'true', WEB_PORT: '8102', WEB_INTERNAL_PORT: '8103', USE_CLOUDFLARE_WORKER: 'true'}, findPort);
        // Then it binds the private port behind the Worker, never another port, and leaves opening the browser to the launcher
        expect(settings).toEqual({isWorkerEnabled: true, publicPort: 8102, port: 8103, strictPort: true, open: false});
        expect(findPort).not.toHaveBeenCalled();
    });

    test('serves the public port directly when the launcher runs without the Worker', async () => {
        // Given a launcher session with the Worker off
        // When Rsbuild resolves its server settings
        // Then it binds the public port itself
        expect(await getDevServerSettings({WEB_LAUNCHER: 'true', WEB_PORT: '8102', WEB_INTERNAL_PORT: '8103', USE_CLOUDFLARE_WORKER: 'false'}, async () => 8090)).toEqual({
            isWorkerEnabled: false,
            publicPort: 8102,
            port: 8102,
            strictPort: true,
            open: false,
        });
    });

    test('ignores launcher settings from .env when Rsbuild runs on its own', async () => {
        // Given WEB_PORT and the Worker flag set in .env, which docs allow for the launcher
        // When Rsbuild runs directly
        const settings = await getDevServerSettings({WEB_PORT: '8102', USE_CLOUDFLARE_WORKER: 'true'}, async () => 8090);
        // Then it keeps its standalone behavior: a free port, direct HTTPS, and opening the app itself
        expect(settings).toEqual({isWorkerEnabled: false, publicPort: 8090, port: 8090, strictPort: false, open: '/'});
    });
});

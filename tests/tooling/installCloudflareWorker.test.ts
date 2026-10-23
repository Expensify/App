/** Root installs should set up the Worker tooling locally, but only when its lockfile changes, and never in CI. */
import {afterEach, beforeEach, describe, expect, mock, test} from 'bun:test';

import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import installCloudflareWorker from '../../scripts/installCloudflareWorker';

describe('Cloudflare Worker install during App setup', () => {
    let workerDir: string;
    const install = mock(async () => {
        await Bun.write(path.join(workerDir, 'node_modules/wrangler/package.json'), '{}');
    });

    beforeEach(async () => {
        workerDir = mkdtempSync(path.join(tmpdir(), 'worker-install-'));
        await Bun.write(path.join(workerDir, 'package-lock.json'), '{"lockfileVersion": 3}');
        install.mockClear();
    });

    afterEach(() => rmSync(workerDir, {recursive: true, force: true}));

    test('installs once, then skips root installs until the Worker lockfile changes', async () => {
        // Given a fresh checkout
        // When the root install runs twice
        expect(await installCloudflareWorker(workerDir, {}, install)).toBe(true);
        expect(await installCloudflareWorker(workerDir, {}, install)).toBe(false);
        // Then the Worker tooling is installed only once
        expect(install).toHaveBeenCalledTimes(1);

        // When the Worker lockfile changes
        await Bun.write(path.join(workerDir, 'package-lock.json'), '{"lockfileVersion": 3, "packages": {}}');
        // Then the next root install updates the Worker tooling
        expect(await installCloudflareWorker(workerDir, {}, install)).toBe(true);
        expect(install).toHaveBeenCalledTimes(2);
    });

    test('reinstalls when the Worker node_modules was removed', async () => {
        // Given an installed Worker whose dependencies were then deleted
        await installCloudflareWorker(workerDir, {}, install);
        rmSync(path.join(workerDir, 'node_modules'), {recursive: true, force: true});
        // When the root install runs
        // Then the tooling is restored
        expect(await installCloudflareWorker(workerDir, {}, install)).toBe(true);
        expect(install).toHaveBeenCalledTimes(2);
    });

    test('retries an install that failed', async () => {
        // Given an install that fails partway
        const failingInstall = mock(async () => {
            throw new Error('network error');
        });
        // When the root install runs
        // Then it fails, and the next root install tries again
        await expect(installCloudflareWorker(workerDir, {}, failingInstall)).rejects.toThrow('network error');
        expect(await installCloudflareWorker(workerDir, {}, install)).toBe(true);
    });

    test('skips CI, where only the Worker jobs need the tooling and install it themselves', async () => {
        // Given a CI root install
        // When postinstall runs
        // Then wrangler and workerd are not downloaded
        expect(await installCloudflareWorker(workerDir, {CI: 'true'}, install)).toBe(false);
        expect(install).not.toHaveBeenCalled();
    });
});

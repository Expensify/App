/**
 * Install the independently locked Worker tooling during local App setup, so `npm run web` can run it. CI jobs that need
 * the Worker install it themselves, and local installs skip it until its lockfile changes.
 */
import {$} from 'bun';
import path from 'node:path';

/** Kept inside node_modules, so deleting the Worker dependencies also invalidates it. */
const INSTALLED_LOCKFILE_HASH_PATH = 'node_modules/.app-installed-lockfile-hash';

async function runNpmCI(workerDir: string): Promise<void> {
    await $`npm ci --include=dev`.cwd(workerDir);
}

async function installCloudflareWorker(workerDir: string, env: Record<string, string | undefined> = Bun.env, install = runNpmCI): Promise<boolean> {
    if (env.CI) {
        return false;
    }
    const lockfileHash = new Bun.CryptoHasher('sha256').update(await Bun.file(path.join(workerDir, 'package-lock.json')).text()).digest('hex');
    const installedLockfileHash = Bun.file(path.join(workerDir, INSTALLED_LOCKFILE_HASH_PATH));
    if ((await installedLockfileHash.exists()) && (await installedLockfileHash.text()) === lockfileHash) {
        return false;
    }
    console.log('Installing local Cloudflare Worker tooling');
    try {
        await install(workerDir);
    } catch (error) {
        // Only `npm run web` uses the Worker, and it serves Rsbuild directly without it, so this must not fail the App install.
        console.warn('Could not install the Cloudflare Worker tooling. npm run web will serve Rsbuild directly until the next npm install installs it.', error);
        return false;
    }
    await Bun.write(installedLockfileHash, lockfileHash);
    return true;
}

if (import.meta.main) {
    await installCloudflareWorker(path.resolve(import.meta.dir, '../web/cloudflare-worker'));
}

export default installCloudflareWorker;

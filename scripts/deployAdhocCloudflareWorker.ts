#!/usr/bin/env bun

/** Publish branch Worker code and Static Assets as one Preview, then verify the requested build is served. */
import type {BuildIdentity} from '@expensify/new-expensify-cloudflare-worker/adhoc-config';

import {createConfig, getIdentity, getPreviewCommand, getTarget, prepareDirectory, STATUS_PATH} from '@expensify/new-expensify-cloudflare-worker/adhoc-config';
import CLI from 'expensify-common/CLI';
import {lstat} from 'node:fs/promises';
import path from 'node:path';

import extractAdhocAssets from './extractAdhocAssets';

const VERIFY_ATTEMPTS = 12;
const VERIFY_REQUEST_TIMEOUT_MS = 10000;
const VERIFY_RETRY_DELAY_MS = 5000;

async function verifyPreview(hostname: string, identity: BuildIdentity, fetchImpl: typeof fetch = fetch, maxAttempts = VERIFY_ATTEMPTS): Promise<void> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const responses = await Promise.all(
            [STATUS_PATH, '/preview-build.json'].map((pathname) =>
                fetchImpl(`https://${hostname}${pathname}?run=${identity.runID}-${identity.runAttempt}`, {
                    redirect: 'error',
                    signal: AbortSignal.timeout(VERIFY_REQUEST_TIMEOUT_MS),
                }).catch(() => null),
            ),
        );
        const data: unknown[] = await Promise.all(responses.map(async (response) => (response?.ok ? response.json().catch(() => null) : null)));
        const matches = data.every((item) => {
            if (typeof item !== 'object' || item === null) {
                return false;
            }
            return 'sha' in item && item.sha === identity.sha && 'runID' in item && item.runID === identity.runID && 'runAttempt' in item && item.runAttempt === identity.runAttempt;
        });
        if (matches) {
            return;
        }
        if (attempt < maxAttempts - 1) {
            await Bun.sleep(VERIFY_RETRY_DELAY_MS);
        }
    }
    throw new Error('The preview hostname does not serve this Worker and asset build');
}

async function deployAdhocCloudflareWorker(prNumber: number, identity: BuildIdentity, artifactDirectory: string): Promise<void> {
    const target = getTarget(prNumber);
    const runtimePath = path.join(artifactDirectory, 'worker/runtime.json');
    if (!(await lstat(runtimePath)).isFile()) {
        throw new Error('Worker runtime settings must be a regular JSON file');
    }
    const runtime: unknown = await Bun.file(runtimePath).json();
    const root = await prepareDirectory(path.join(artifactDirectory, 'worker'), path.join(artifactDirectory, 'assets/webBuild.tar.gz'), createConfig(runtime), identity, extractAdhocAssets);
    // Resolve from the workspace so both hoisted and package-local tool installs work.
    const wranglerPackage = Bun.resolveSync('wrangler/package.json', path.resolve('web/cloudflare-worker'));
    const wrangler = path.join(path.dirname(wranglerPackage), 'bin/wrangler.js');
    const command = getPreviewCommand(prNumber, path.join(root, 'wrangler.json'), process.env);
    const result = Bun.spawn(['node', wrangler, ...command.args], {cwd: root, env: command.env, stdin: 'inherit', stdout: 'inherit', stderr: 'inherit'});
    if ((await result.exited) !== 0) {
        throw new Error('Cloudflare preview deployment failed');
    }
    await verifyPreview(target.hostname, identity);
}

async function main(): Promise<void> {
    // The shared CLI uses kebab-case option names.
    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        namedArgs: {
            'pr-number': {description: 'Expensify/App PR number', parse: (value: string) => Number(getTarget(value).name)},
            sha: {description: 'Immutable App SHA used for the Worker and web build'},
            'artifact-directory': {description: 'Downloaded Worker and web artifacts directory'},
        },
    } as const);
    /* eslint-enable @typescript-eslint/naming-convention */
    const identity = getIdentity(cli.namedArgs.sha, process.env.GITHUB_RUN_ID, process.env.GITHUB_RUN_ATTEMPT);
    await deployAdhocCloudflareWorker(cli.namedArgs['pr-number'], identity, path.resolve(cli.namedArgs['artifact-directory']));
}

if (import.meta.main) {
    await main();
}

export default deployAdhocCloudflareWorker;
export {verifyPreview};

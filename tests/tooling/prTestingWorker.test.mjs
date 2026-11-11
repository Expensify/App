/** Preview identity verification and artifact security without live deployments. */
import {afterEach, describe, expect, test} from 'bun:test';

import {createConfig, getIdentity, getPreviewCommand, getTarget, prepareDirectory, STATUS_PATH} from '@expensify/new-expensify-cloudflare-worker/pr-testing-config';
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {verifyPreview} from '../../scripts/deployAdhocCloudflareWorker.ts';
import extractPRTestingAssets from '../../scripts/extractPRTestingAssets.ts';

describe('PR-testing Worker deployment', () => {
    const {Bun} = globalThis;
    const SHA = 'a'.repeat(40);
    const IDENTITY = getIdentity(SHA, '100', '1');
    const RUNTIME = {compatibility_date: '2026-09-26', compatibility_flags: []};
    const ROOT = path.resolve(import.meta.dirname, '../..');
    const temporaryDirectories = [];

    afterEach(() => {
        for (const directory of temporaryDirectories.splice(0)) {
            rmSync(directory, {recursive: true, force: true});
        }
    });

    function tempDirectory() {
        const directory = mkdtempSync(path.join(tmpdir(), 'pr-testing-test-'));
        temporaryDirectories.push(directory);
        return directory;
    }

    test('verification requires both Worker code and assets to identify the requested build', async () => {
        // Given responses from another SHA, run or retry, plus unavailable or malformed endpoints
        const invalidResponses = [
            () => Response.json({...IDENTITY, sha: 'b'.repeat(40)}),
            () => Response.json({...IDENTITY, runID: '101'}),
            () => Response.json({...IDENTITY, runAttempt: '2'}),
            () => Response.json(null),
            () => new Response('not JSON'),
            () => new Response('unavailable', {status: 503}),
            () => Promise.reject(new Error('offline')),
        ];
        for (const invalidResponse of invalidResponses) {
            for (const invalidPath of [STATUS_PATH, '/preview-build.json']) {
                // When either endpoint fails to identify this build
                const fetchImpl = async (url) => (new URL(url).pathname === invalidPath ? invalidResponse() : Response.json(IDENTITY));
                // Then an older healthy response from the other endpoint cannot make verification succeed
                await expect(verifyPreview('123.adhoc.expensify.com', IDENTITY, fetchImpl, 1)).rejects.toThrow();
            }
        }
        // When both endpoints return the requested identity
        // Then matching code and asset identities pass verification
        await expect(verifyPreview('123.adhoc.expensify.com', IDENTITY, async () => Response.json(IDENTITY), 1)).resolves.toBeUndefined();
    });

    test('the CLI provides usage and rejects invalid publishing requests without GitHub credentials', () => {
        // Given a user invoking the CLI outside CI
        const script = path.join(ROOT, 'scripts/deployAdhocCloudflareWorker.ts');
        // When they ask for help or supply invalid or incomplete options
        expect(spawnSync(process.execPath, [script, '--help']).status).toBe(0);
        for (const args of [
            ['--pr-number', 'not-a-number', '--sha', SHA, '--artifact-directory', ROOT],
            ['--pr-number', '123', '--sha', SHA],
        ]) {
            const result = spawnSync(process.execPath, [script, ...args]);
            // Then invalid requests fail before publishing anything
            expect(result.status).not.toBe(0);
        }
        // When a branch workflow supplies valid options but no run ID
        const branchWorkflow = spawnSync(process.execPath, [script, '--pr-number', '123', '--sha', SHA, '--artifact-directory', ROOT], {
            encoding: 'utf8',
            env: {
                ...process.env,
                GITHUB_TOKEN: '',
                GITHUB_WORKFLOW_REF: 'Expensify/App/.github/workflows/testBuild.yml@refs/heads/preview-experiment',
                GITHUB_RUN_ID: '',
            },
        });
        // Then it accepts the branch and needs only build identity, not GitHub authentication
        expect(branchWorkflow.status).not.toBe(0);
        expect(branchWorkflow.stderr).toContain('An immutable SHA, run ID and run attempt are required');
    });

    describe('artifact security and compatibility', () => {
        test('packages only safe PR runtime settings and public assets without changing binary files', async () => {
            // Given a branch artifact attempting to supply production targets, hooks and privileged bindings
            const directory = tempDirectory();
            const bundle = path.join(directory, 'bundle');
            mkdirSync(bundle);
            writeFileSync(path.join(bundle, 'index.js'), 'export default {};');
            const archive = path.join(directory, 'build.tar.gz');
            await Bun.write(archive, new Bun.Archive({'dist/index.html': 'shell', 'dist/app.js.map': 'map', 'dist/app.js.br': new Uint8Array([1, 2, 3])}, {compress: 'gzip'}));
            const unsafe = {
                ...RUNTIME,
                name: 'production',
                routes: ['expensify.com/*'],
                build: {command: 'steal-token'},
                vars: {SECRET: 'bad'},
                r2_buckets: [{binding: 'PREVIOUS_BUILDS'}],
                services: [{binding: 'PRODUCTION'}],
                previews: {vars: {ENVIRONMENT: 'production'}, r2_buckets: [{binding: 'PRODUCTION'}]},
            };
            // When the trusted deployment package is produced
            const packaged = await prepareDirectory(bundle, archive, createConfig(unsafe), IDENTITY, extractPRTestingAssets);
            temporaryDirectories.push(packaged);
            const config = await Bun.file(path.join(packaged, 'wrangler.json')).json();
            // Then branch-selected hooks and privileged bindings cannot enter the deployment, and source maps stay private
            expect(config.name).toBe('adhoc');
            expect(config.previews).toEqual({vars: {ENVIRONMENT: 'staging'}});
            expect([config.routes, config.vars]).toEqual([undefined, undefined]);
            const environment = {WRANGLER_CI_OVERRIDE_NAME: 'production', CLOUDFLARE_API_TOKEN: 'fixture-token'};
            const command = getPreviewCommand(123, 'preview.json', environment);
            expect(command.args).toEqual(['preview', '--worker-name', 'adhoc', '--name', '123', '--ignore-base-config', '--config', 'preview.json']);
            expect(command.env).toEqual({CLOUDFLARE_API_TOKEN: 'fixture-token'});
            expect(environment.WRANGLER_CI_OVERRIDE_NAME).toBe('production');
            expect(getTarget(456)).toEqual({name: '456', hostname: '456.adhoc.expensify.com'});
            expect(config.assets.binding).toBe('ASSETS');
            expect([config.build, config.r2_buckets, config.services]).toEqual([undefined, undefined, undefined]);
            expect(await Bun.file(path.join(packaged, 'dist/app.js.br')).bytes()).toEqual(new Uint8Array([1, 2, 3]));
            expect(existsSync(path.join(packaged, 'dist/app.js.map'))).toBe(false);
        });

        test('asset archives cannot escape their destination or create filesystem links', async () => {
            // Given malicious archive paths and an archive containing a symlink
            for (const name of ['../escape', 'dist/../escape', '/absolute', 'outside.txt']) {
                const directory = tempDirectory();
                const archive = path.join(directory, 'build.tar.gz');
                await Bun.write(archive, new Bun.Archive({'dist/index.html': 'shell', [name]: 'bad'}, {compress: 'gzip'}));
                // When the archive is processed
                await expect(extractPRTestingAssets(archive, path.join(directory, 'output'))).rejects.toThrow();
                // Then even the valid file is not written before rejecting the unsafe archive
                expect(existsSync(path.join(directory, 'output/index.html'))).toBe(false);
            }
            const directory = tempDirectory();
            mkdirSync(path.join(directory, 'dist'));
            writeFileSync(path.join(directory, 'dist/index.html'), 'shell');
            symlinkSync('/etc/passwd', path.join(directory, 'dist/link'));
            const archive = path.join(directory, 'build.tar.gz');
            expect(spawnSync('tar', ['-czf', archive, '-C', directory, 'dist'], {env: {...process.env, COPYFILE_DISABLE: '1'}}).status).toBe(0);
            await extractPRTestingAssets(archive, path.join(directory, 'output'));
            expect(await Bun.file(path.join(directory, 'output/index.html')).text()).toBe('shell');
            expect(existsSync(path.join(directory, 'output/link'))).toBe(false);
        });

        test('refuses branch bundles containing executable configuration, links or a replacement preview wrapper', async () => {
            // Given otherwise valid Worker and web artifacts with a malicious extra bundle entry
            const directory = tempDirectory();
            const archive = path.join(directory, 'build.tar.gz');
            await Bun.write(archive, new Bun.Archive({'dist/index.html': 'shell'}, {compress: 'gzip'}));
            for (const name of ['wrangler.json', 'postinstall.sh', 'link.js', '__preview_entry.mjs']) {
                const bundle = path.join(tempDirectory(), 'bundle');
                mkdirSync(bundle);
                writeFileSync(path.join(bundle, 'index.js'), 'export default {};');
                if (name === 'link.js') {
                    symlinkSync('/etc/passwd', path.join(bundle, name));
                } else {
                    writeFileSync(path.join(bundle, name), 'bad');
                }
                // When a deployable package is requested
                // Then it refuses the bundle instead of accepting untrusted deployment behavior
                await expect(prepareDirectory(bundle, archive, createConfig(RUNTIME), IDENTITY, extractPRTestingAssets)).rejects.toThrow();
            }
        });
    });
});

/** Preview deployment behavior and artifact security, using a stateful fake service rather than SDK call-order assertions. */
import {afterEach, describe, expect, test} from 'bun:test';

import {createConfig, getIdentity, getTarget, prepareDirectory} from '@expensify/new-expensify-cloudflare-worker/pr-testing-config';
import {spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';

import {AdhocCloudflareWorkerDeployer} from '../../scripts/adhocCloudflareWorkerDeployer.ts';
import extractPRTestingAssets from '../../scripts/extractPRTestingAssets.ts';

describe('PR-testing Worker deployment', () => {
    const {Bun} = globalThis;
    const SHA = 'a'.repeat(40);
    const OTHER_SHA = 'b'.repeat(40);
    const IDENTITY = getIdentity(SHA, '100', '1');
    const RUNTIME = {compatibility_date: '2026-09-26', compatibility_flags: []};
    const ZONE = 'c'.repeat(32);
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

    function previewService(prState = 'open') {
        const state = {
            refs: new Map([
                ['feature/worker', SHA],
                ['main', OTHER_SHA],
            ]),
            deployments: [],
            statuses: new Map(),
            worker: null,
            assets: null,
        };
        const github = {
            pulls: {get: async () => ({data: {state: prState}})},
            repos: {
                getCommit: async ({ref}) => {
                    if (!state.refs.has(ref)) {
                        throw new Error('Unknown source ref');
                    }
                    return {data: {sha: state.refs.get(ref)}};
                },
                listDeployments: async ({environment, per_page: limit = 30}) => ({
                    data: state.deployments
                        .filter((item) => item.environment === environment)
                        .toReversed()
                        .slice(0, limit),
                }),
                getDeployment: async ({deployment_id: id}) => {
                    const item = state.deployments.find((deployment) => deployment.id === id);
                    if (!item) {
                        throw new Error('Unknown deployment');
                    }
                    return {data: structuredClone(item)};
                },
                createDeployment: async (input) => {
                    const deployment = {id: state.deployments.length + 1, ...structuredClone(input)};
                    state.deployments.push(deployment);
                    return {data: deployment};
                },
                createDeploymentStatus: async ({deployment_id: id, ...status}) => {
                    state.statuses.set(id, status);
                    return {data: status};
                },
            },
        };
        const controller = new AdhocCloudflareWorkerDeployer({
            github,
            fetchImpl: async (url) => {
                const pathname = new URL(url).pathname;
                if (pathname === '/__expensify_preview') {
                    return Response.json(state.worker);
                }
                if (pathname === '/preview-build.json') {
                    return Response.json(state.assets);
                }
                throw new Error('Unknown preview endpoint');
            },
        });
        const publish = (identity) => {
            state.worker = identity;
            state.assets = identity;
        };
        return {controller, state, publish};
    }

    describe('preview deployment behavior', () => {
        test('pins the requested revision and publishes a verified preview even after the PR closes', async () => {
            // Given a closed PR whose branch can move while a requested build is running
            const {controller, state, publish} = previewService('closed');
            const request = await controller.register(123, 'feature/worker', '100', '1');
            state.refs.set('feature/worker', OTHER_SHA);
            const identity = getIdentity(request.sha, '100', '1');
            // When that build publishes its original snapshot
            await controller.deploy(123, Number(request.deploymentID), identity, () => publish(identity));
            // Then the preview and its reported URL refer to the pinned build, not the newer branch or main
            expect(state.worker).toEqual(IDENTITY);
            expect(state.assets).toEqual(IDENTITY);
            expect(state.statuses.get(Number(request.deploymentID))).toMatchObject({state: 'success', environment_url: 'https://123.pr-testing.expensify.com'});
        });

        test('only the newest requested build can publish, regardless of completion order or reruns', async () => {
            // Given overlapping builds, including reruns and workflow IDs beyond safe integer precision
            for (const [oldRun, oldAttempt, newRun, newAttempt] of [
                ['100', '1', '101', '1'],
                ['100', '1', '100', '2'],
                ['9007199254740992', '1', '9007199254740993', '1'],
            ]) {
                const {controller, state, publish} = previewService();
                const older = await controller.register(123, 'feature/worker', oldRun, oldAttempt);
                const newer = await controller.register(123, 'feature/worker', newRun, newAttempt);
                let oldPublished = false;
                // When the older build finishes late or tries to register again
                await expect(
                    controller.deploy(123, Number(older.deploymentID), getIdentity(SHA, oldRun, oldAttempt), () => {
                        oldPublished = true;
                    }),
                ).rejects.toThrow();
                await expect(controller.register(123, 'feature/worker', oldRun, oldAttempt)).rejects.toThrow();
                const identity = getIdentity(SHA, newRun, newAttempt);
                await controller.deploy(123, Number(newer.deploymentID), identity, () => publish(identity));
                // Then the newest build remains served and the old build never publishes or registers again
                expect(oldPublished).toBe(false);
                expect(state.deployments).toHaveLength(2);
                expect(state.worker).toEqual(identity);
                expect(state.statuses.get(Number(newer.deploymentID)).state).toBe('success');
            }
        });

        test('cannot publish using another PR deployment record', async () => {
            // Given a legitimate build record belonging to PR 123
            const {controller, state} = previewService();
            const request = await controller.register(123, 'feature/worker', '100', '1');
            let published = false;
            // When that record is supplied for PR 456
            await expect(
                controller.deploy(456, Number(request.deploymentID), IDENTITY, () => {
                    published = true;
                }),
            ).rejects.toThrow();
            // Then no preview changes and no success is reported
            expect(published).toBe(false);
            expect(state.worker).toBeNull();
            expect(state.statuses.size).toBe(0);
        });

        test('a failed upload preserves the previous preview without reporting the new build as successful', async () => {
            // Given a working older preview and a newly requested build
            const {controller, state, publish} = previewService();
            const previous = getIdentity(OTHER_SHA, '99', '1');
            publish(previous);
            const request = await controller.register(123, 'feature/worker', '100', '1');
            // When uploading fails before the new version is activated
            await expect(
                controller.deploy(123, Number(request.deploymentID), IDENTITY, () => {
                    throw new Error('Upload failed');
                }),
            ).rejects.toThrow('Upload failed');
            // Then the old URL still works, but the new build has a failure status rather than a false success
            expect(state.worker).toEqual(previous);
            expect(state.assets).toEqual(previous);
            expect(state.statuses.get(Number(request.deploymentID)).state).toBe('failure');
        });

        test('verification requires both Worker code and assets to belong to the requested build', async () => {
            // Given new Worker code paired with assets from an older build
            const {controller, state} = previewService();
            state.worker = IDENTITY;
            state.assets = getIdentity(OTHER_SHA, '99', '1');
            // When the deployment is checked and then the matching assets become available
            await expect(controller.verify('123.pr-testing.expensify.com', IDENTITY, 1)).rejects.toThrow();
            state.assets = IDENTITY;
            // Then only the matching pair passes verification
            await expect(controller.verify('123.pr-testing.expensify.com', IDENTITY, 1)).resolves.toBeUndefined();
        });
    });

    test('the CLI provides usage and rejects invalid publishing requests without credentials', () => {
        // Given a user invoking the CLI outside CI
        const script = path.join(ROOT, 'scripts/adhocCloudflareWorkerDeployer.ts');
        // When they ask for help or supply unsupported/incomplete commands
        expect(spawnSync(process.execPath, [script, '--help']).status).toBe(0);
        for (const args of [
            ['delete', '--pr-number', '123'],
            ['deploy', '--pr-number', '123', '--sha', SHA, '--deployment-id', '42', '--request-attempt', '1'],
        ]) {
            const result = spawnSync(process.execPath, [script, ...args]);
            // Then invalid requests fail before publishing anything
            expect(result.status).not.toBe(0);
        }
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
            };
            // When the trusted deployment package is produced
            const packaged = await prepareDirectory(bundle, archive, createConfig(getTarget(123), unsafe, ZONE), IDENTITY, extractPRTestingAssets);
            temporaryDirectories.push(packaged);
            const config = await Bun.file(path.join(packaged, 'wrangler.json')).json();
            // Then branch-selected hooks and privileged bindings cannot enter the deployment, and source maps stay private
            expect(config.name).toBe('pr-testing-expensify-123');
            expect(config.routes).toEqual([{pattern: '123.pr-testing.expensify.com/*', zone_id: ZONE}]);
            expect(config.vars).toEqual({ENVIRONMENT: 'staging'});
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
                await expect(prepareDirectory(bundle, archive, createConfig(getTarget(123), RUNTIME, ZONE), IDENTITY, extractPRTestingAssets)).rejects.toThrow();
            }
        });
    });
});

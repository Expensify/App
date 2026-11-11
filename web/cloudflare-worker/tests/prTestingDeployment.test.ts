/** Simulate isolated Worker Previews in workerd with trusted packaging, real branch code and Static Assets. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {after, before, describe, test} from 'node:test';
import {createTestHarness, experimental_readRawConfig} from 'wrangler';

import {createConfig, createWrapper, getIdentity, getTarget, prepareDirectory} from '../scripts/prTestingConfig.ts';

const WORKER_DIR = path.resolve(import.meta.dirname, '..');
const EXTRACT_SCRIPT = path.resolve(WORKER_DIR, '../../scripts/extractPRTestingAssets.ts');
const FIXTURE_HTML = '<html><script nonce="nonce-random-value">window.preview = true;</script></html>';

describe('Worker Preview runtime packaging', () => {
    const temp = mkdtempSync(path.join(tmpdir(), 'pr-preview-integration-'));
    const directories = new Map<string, string>();
    const identity = getIdentity('a'.repeat(40), '100', '1');
    let server: ReturnType<typeof createTestHarness>;

    before(async () => {
        for (const prNumber of ['123', '456']) {
            const branch = path.join(temp, prNumber);
            cpSync(path.join(WORKER_DIR, 'src'), path.join(branch, 'src'), {recursive: true});
            mkdirSync(path.join(branch, 'dist'), {recursive: true});
            writeFileSync(path.join(branch, 'dist/index.html'), FIXTURE_HTML);
            const entryPath = path.join(branch, 'src/index.ts');
            const entry = readFileSync(entryPath, 'utf8');
            const target = "headers.set('Cache-Control', 'no-cache');";
            assert.ok(entry.includes(target), 'The real Worker entry point must contain the fixture edit target');
            writeFileSync(entryPath, entry.replace(target, `${target} headers.set('X-Preview-Branch', 'branch-${prNumber}');`));
            const {rawConfig} = experimental_readRawConfig({config: path.join(WORKER_DIR, 'wrangler.jsonc')});
            const runtime = {compatibility_date: rawConfig.compatibility_date ?? '', compatibility_flags: rawConfig.compatibility_flags ?? []};
            const branchConfig = path.join(branch, 'branch.json');
            writeFileSync(branchConfig, JSON.stringify({name: `fixture-${prNumber}`, main: 'src/index.ts', ...runtime}));
            execFileSync(
                process.execPath,
                [path.join(WORKER_DIR, 'node_modules/wrangler/bin/wrangler.js'), 'deploy', '--dry-run', '--config', branchConfig, '--outdir', path.join(branch, 'bundle')],
                {
                    env: {...process.env, WRANGLER_SEND_METRICS: 'false'},
                },
            );
            const archive = path.join(branch, 'webBuild.tar.gz');
            execFileSync('tar', ['-czf', archive, '-C', branch, 'dist'], {env: {...process.env, COPYFILE_DISABLE: '1'}});
            const config = createConfig(runtime);
            // Run the same Bun-native extractor directly; this standalone package does not install the App CLI dependencies.
            const directory = await prepareDirectory(path.join(branch, 'bundle'), archive, config, identity, (archivePath: string, destination: string) => {
                execFileSync('bun', [
                    '--eval',
                    `const {default: extract} = await import(${JSON.stringify(EXTRACT_SCRIPT)}); await extract(Bun.argv[1], Bun.argv[2]);`,
                    archivePath,
                    destination,
                ]);
            });
            directories.set(prNumber, directory);
            // workerd has no native Preview API, so each Preview uses a separate local Worker and test-only route.
            const localConfigPath = path.join(directory, 'wrangler.local.json');
            writeFileSync(localConfigPath, JSON.stringify({...config, name: `preview-${prNumber}`, vars: config.previews.vars, routes: [`${getTarget(prNumber).hostname}/*`]}));
            const {rawConfig: deploymentConfig} = experimental_readRawConfig({config: path.join(directory, 'wrangler.json')});
            assert.equal(deploymentConfig.name, 'adhoc');
            assert.equal(deploymentConfig.routes, undefined);
            const dryRun = execFileSync(process.execPath, [path.join(WORKER_DIR, 'node_modules/wrangler/bin/wrangler.js'), 'deploy', '--dry-run', '--config', localConfigPath], {
                encoding: 'utf8',
                env: {...process.env, WRANGLER_SEND_METRICS: 'false'},
            });
            assert.doesNotMatch(dryRun, /dist\/index\.html/, 'Static Assets must not also be uploaded as Worker modules');
        }
        server = createTestHarness({workers: [...directories.values()].map((directory) => ({configPath: path.join(directory, 'wrangler.local.json')}))});
        await server.listen();
    });

    after(async () => {
        await server?.close();
        for (const directory of directories.values()) {
            rmSync(directory, {recursive: true, force: true});
        }
        rmSync(temp, {recursive: true, force: true});
    });

    test('serves isolated branch previews with matching assets, SPA navigation and missing-chunk recovery', async () => {
        // Given two separately compiled versions of the actual Worker entry point
        for (const prNumber of ['123', '456']) {
            // When each PR hostname is loaded
            const response = await server.fetch(`https://${prNumber}.adhoc.expensify.com/`);
            const html = await response.text();
            const nonce = /nonce="([^"]+)"/.exec(html)?.[1];
            // Then the branch-specific code runs with Static Assets and the real staging nonce/CSP policy
            assert.equal(response.headers.get('X-Preview-Branch'), `branch-${prNumber}`);
            assert.ok(nonce);
            assert.ok(response.headers.get('Content-Security-Policy')?.includes(`nonce-${nonce}`));
            assert.deepEqual(await (await server.fetch(`https://${prNumber}.adhoc.expensify.com/__expensify_preview`)).json(), identity);
            assert.deepEqual(await (await server.fetch(`https://${prNumber}.adhoc.expensify.com/preview-build.json`)).json(), identity);
            const navigation = await server.fetch(`https://${prNumber}.adhoc.expensify.com/r/123`, {headers: {'MF-Sec-Fetch-Mode': 'navigate'}});
            const chunk = await server.fetch(`https://${prNumber}.adhoc.expensify.com/main-ffffffffffffffff.bundle.js`);
            assert.match(await navigation.text(), /window.preview/);
            assert.equal(chunk.status, 404);
        }
    });

    test('updating one PR changes its code and asset identity without changing the other PR', async () => {
        // Given a second ad-hoc deployment for PR 123 at another source SHA
        const directory = directories.get('123');
        assert.ok(directory);
        const entryPath = path.join(directory, 'worker/index.js');
        const entry = readFileSync(entryPath, 'utf8');
        assert.ok(entry.includes('branch-123'));
        const nextIdentity = getIdentity('c'.repeat(40), '101', '1');
        writeFileSync(entryPath, entry.replace('branch-123', 'branch-123-v2'));
        writeFileSync(path.join(directory, 'worker/__preview_entry.mjs'), createWrapper(nextIdentity));
        writeFileSync(path.join(directory, 'dist/preview-build.json'), JSON.stringify(nextIdentity));
        // When workerd loads the updated version
        await server.update({workers: [...directories.values()].map((root) => ({configPath: path.join(root, 'wrangler.local.json')}))});
        // Then PR 123 serves the new code/assets while PR 456 remains unchanged
        assert.equal((await server.fetch('https://123.adhoc.expensify.com/')).headers.get('X-Preview-Branch'), 'branch-123-v2');
        assert.deepEqual(await (await server.fetch('https://123.adhoc.expensify.com/preview-build.json')).json(), nextIdentity);
        assert.deepEqual(await (await server.fetch('https://123.adhoc.expensify.com/__expensify_preview')).json(), nextIdentity);
        assert.equal((await server.fetch('https://456.adhoc.expensify.com/')).headers.get('X-Preview-Branch'), 'branch-456');
        assert.deepEqual(await (await server.fetch('https://456.adhoc.expensify.com/__expensify_preview')).json(), identity);
        assert.deepEqual(await (await server.fetch('https://456.adhoc.expensify.com/preview-build.json')).json(), identity);
    });
});

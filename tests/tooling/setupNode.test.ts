/** Keep CI's workspace selections consistent with its installed-dependency caches and consumers. */
/* eslint-disable no-template-curly-in-string -- These strings assert GitHub Actions expressions, not JavaScript interpolation. */
// cspell:ignore stickydisk pipefail
import {afterEach, beforeEach, describe, expect, it} from 'bun:test';

import {existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';

type Step = {
    id?: string;
    name?: string;
    uses?: string;
    run?: string;
    env?: Record<string, string>;
    with?: Record<string, string>;
};

type Action = {
    inputs: Record<string, {default: string}>;
    runs: {steps: Step[]};
};

type Workflow = {
    jobs: Record<string, {steps: Step[]; strategy?: {matrix: Record<string, string[]>}}>;
};

const SETUP_NODE = './.github/actions/composite/setupNode';
const WORKER = 'web/cloudflare-worker';
const RENDERER = 'server/victory-chart-renderer';
const WORKSPACE_SELECTIONS = [[], ['worker'], ['renderer'], ['worker', 'renderer']];

// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- This fixture is the action YAML checked into this repo.
const action = Bun.YAML.parse(readFileSync('.github/actions/composite/setupNode/action.yml', 'utf8')) as Action;

function findActionStep(idOrName: string): Step {
    const step = action.runs.steps.find((item) => item.id === idOrName || item.name === idOrName);
    if (!step) {
        throw new Error(`Missing setupNode step: ${idOrName}`);
    }
    return step;
}

function readWorkflow(name: string): Workflow {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- These fixtures are the workflow YAML checked into this repo.
    return Bun.YAML.parse(readFileSync(`.github/workflows/${name}.yml`, 'utf8')) as Workflow;
}

describe('setupNode workspace installs', () => {
    let directory: string;

    beforeEach(() => {
        directory = mkdtempSync(path.join(os.tmpdir(), 'setup-node-workspaces-'));
    });

    afterEach(() => {
        rmSync(directory, {recursive: true, force: true});
    });

    function configureWorkspaces(input: string) {
        const output = path.join(directory, 'github-output');
        writeFileSync(output, '');
        const result = Bun.spawnSync(['/bin/bash', '-e', '-o', 'pipefail', '-c', findActionStep('workspace-config').run ?? ''], {
            cwd: directory,
            env: {...process.env, WORKSPACES: input, GITHUB_OUTPUT: output},
        });
        const outputs = Object.fromEntries(
            readFileSync(output, 'utf8')
                .trim()
                .split('\n')
                .map((line) => {
                    const separator = line.indexOf('=');
                    return [line.slice(0, separator), line.slice(separator + 1)];
                }),
        );
        return {result, outputs};
    }

    it('defaults to root dependencies without workspace packages', () => {
        // Given that most CI jobs do not consume either workspace
        // When a caller omits the selection
        // Then it must install only the root project's dependencies.
        expect(action.inputs.WORKSPACES.default).toBe('[]');
        expect(findActionStep('workspace-config').env?.WORKSPACES).toBe('${{ inputs.WORKSPACES }}');
        expect(findActionStep('Install root project node packages').env?.WORKSPACES).toBe('${{ steps.workspace-config.outputs.workspaces }}');
    });

    it('normalizes workspace order and duplicates before computing cache keys', () => {
        // Given equivalent workspace selections written in different orders
        const first = configureWorkspaces('["worker", "renderer", "worker"]');

        // When the action normalizes them before restoring installed dependencies
        const second = configureWorkspaces('["renderer", "worker"]');

        // Then both must select the same packages and use the same cache.
        expect(first.result.exitCode).toBe(0);
        expect(second.result.exitCode).toBe(0);
        expect(first.outputs.workspaces).toBe('["renderer","worker"]');
        expect(first.outputs['cache-key']).toBe(second.outputs['cache-key']);
    });

    it('uses a distinct cache key for each workspace selection', () => {
        // Given root-only, Worker-only, renderer-only and combined installs
        // When the action computes their keys
        const keys = WORKSPACE_SELECTIONS.map((selection) => {
            const {result, outputs} = configureWorkspaces(JSON.stringify(selection));
            expect(result.exitCode).toBe(0);
            expect(outputs['cache-key']).toMatch(/^[a-f0-9]{64}$/);
            return outputs['cache-key'];
        });

        // Then no selection can restore another selection's incomplete install.
        expect(new Set(keys).size).toBe(WORKSPACE_SELECTIONS.length);
    });

    it.each(['not json', 'false', '{}', '[false]', '[""]'])('rejects invalid workspace selections: %s', (input) => {
        // Given a malformed selection that must not silently drop required packages
        // When the configuration step runs before any cache is restored
        const {result} = configureWorkspaces(input);

        // Then the action must fail rather than guess an install mode.
        expect(result.exitCode).not.toBe(0);
    });

    it.each(['stickydisk-node-modules', 'cache-node-modules'])('keys %s by the normalized workspace selection', (id) => {
        // Given that both cache strategies must distinguish subsets even for hybrid jobs
        // When their installed-dependency caches are restored
        const step = findActionStep(id);

        // Then the selection hash must be in each key, without a fallback to another selection.
        expect(step.with?.key).toContain('steps.workspace-config.outputs.cache-key');
        expect(step.with?.key).toContain('inputs.IS_HYBRID_BUILD');
        expect(step.with?.['restore-keys']).toBeUndefined();
    });

    it.each(WORKSPACE_SELECTIONS.map((selection) => [selection]))('installs root dependencies and only the selected workspaces: %j', (selection) => {
        // Given an offline root project and two workspaces with dependencies that the root does not own
        const writePackage = (relativePath: string, contents: Record<string, unknown>) => {
            const target = path.join(directory, relativePath);
            mkdirSync(target, {recursive: true});
            writeFileSync(path.join(target, 'package.json'), JSON.stringify(contents));
        };
        writePackage('.', {name: 'setup-node-fixture', private: true, workspaces: ['worker', 'renderer'], devDependencies: {root: 'file:./root-dependency'}});
        writePackage('root-dependency', {name: 'root', version: '1.0.0'});
        writePackage('worker', {name: 'fixture-worker', version: '1.0.0', devDependencies: {tool: 'file:../worker-dependency'}});
        writePackage('worker-dependency', {name: 'tool', version: '1.0.0'});
        writePackage('renderer', {name: 'fixture-renderer', version: '1.0.0', devDependencies: {chart: 'file:../renderer-dependency'}});
        writePackage('renderer-dependency', {name: 'chart', version: '1.0.0'});
        const env = {...process.env, NPM_CONFIG_OFFLINE: 'true', NPM_CONFIG_CACHE: path.join(directory, '.npm')};
        const lockfile = Bun.spawnSync(['npm', 'install', '--package-lock-only', '--ignore-scripts'], {cwd: directory, env});
        expect(lockfile.exitCode).toBe(0);

        // When the actual action scripts configure and install the requested subset
        const {result: config, outputs} = configureWorkspaces(JSON.stringify(selection));
        expect(config.exitCode).toBe(0);
        const command = findActionStep('Install root project node packages').with?.command;
        expect(command).toBeDefined();
        const install = Bun.spawnSync(['/bin/bash', '-e', '-o', 'pipefail', '-c', command ?? ''], {cwd: directory, env: {...env, WORKSPACES: outputs.workspaces}});
        expect(install.stderr.toString()).not.toContain('npm error');
        expect(install.exitCode).toBe(0);

        // Then root tooling must always remain available, without dependencies from unselected workspaces.
        expect(existsSync(path.join(directory, 'node_modules/root'))).toBe(true);
        expect(existsSync(path.join(directory, 'node_modules/fixture-worker'))).toBe(selection.includes('worker'));
        expect(existsSync(path.join(directory, 'node_modules/tool'))).toBe(selection.includes('worker'));
        expect(existsSync(path.join(directory, 'node_modules/fixture-renderer'))).toBe(selection.includes('renderer'));
        expect(existsSync(path.join(directory, 'node_modules/chart'))).toBe(selection.includes('renderer'));
    });

    it.each([
        ['buildAdHoc', 'deployWebAdHoc', [WORKER]],
        ['buildVictoryChartRenderer', 'build', [RENDERER]],
        ['deployExpensifyHelp', 'build', [WORKER]],
        ['bunTests', 'test', [RENDERER, WORKER]],
        ['typecheck', 'typecheck', [RENDERER, WORKER]],
        ['knip', 'knip-compare', [RENDERER, WORKER]],
        ['lint', 'lint', [RENDERER, WORKER]],
        ['claude-review', 'review', [RENDERER, WORKER]],
    ])('selects the required workspaces for %s / %s', (workflowName, job, selection) => {
        // Given a job that imports, builds, tests or analyzes workspace code
        // When its setupNode call is read from the actual workflow
        const step = readWorkflow(workflowName).jobs[job].steps.find((item) => item.uses === SETUP_NODE);

        // Then it must explicitly select the packages needed for that work.
        expect(step).toBeDefined();
        expect(JSON.parse(step?.with?.WORKSPACES ?? action.inputs.WORKSPACES.default)).toEqual(selection);
    });

    it('selects the Worker only when the web build also bundles a Preview Worker', () => {
        // Given that ordinary web bundling does not use Wrangler, but Preview Worker bundling does
        // When the reusable web workflow selects dependencies
        const step = readWorkflow('buildWeb').jobs.build.steps.find((item) => item.uses === SETUP_NODE);

        // Then it must request only the Worker workspace when that bundling is enabled.
        expect(step?.with?.WORKSPACES).toBe("${{ inputs.build-preview-worker && '[\"web/cloudflare-worker\"]' || '[]' }}");
    });

    it('seeds every standalone selection and the root-only hybrid cache', () => {
        // Given that ordinary CI jobs read sticky disks without persisting their installs
        // When the cache-seeding workflow runs
        const {jobs} = readWorkflow('seedCache');

        // Then each subset needs a matching seed on both runner architectures, while native hybrid builds need no workspace packages.
        expect(jobs.seedStandalone.strategy?.matrix.workspaces.map((value) => JSON.parse(value) as unknown)).toEqual([[], [WORKER], [RENDERER], [RENDERER, WORKER]]);
        expect(jobs.seedStandalone.strategy?.matrix.runner).toEqual(['blacksmith-2vcpu-ubuntu-2404', 'blacksmith-2vcpu-ubuntu-2404-arm']);
        expect(jobs.seedStandalone.steps.find((item) => item.uses === SETUP_NODE)?.with?.WORKSPACES).toBe('${{ matrix.workspaces }}');
        expect(jobs.seedHybrid.strategy?.matrix.runner).toEqual(['blacksmith-2vcpu-ubuntu-2404', 'blacksmith-2vcpu-ubuntu-2404-arm']);
        expect(jobs.seedHybrid.steps.find((item) => item.uses === SETUP_NODE)?.with?.WORKSPACES ?? action.inputs.WORKSPACES.default).toBe('[]');
    });
});

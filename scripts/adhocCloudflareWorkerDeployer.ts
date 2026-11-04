#!/usr/bin/env bun

/**
 * Deploy ad-hoc Cloudflare previews from the same App revision as their web assets.
 * This CLI records the requested revision in GitHub, publishes the compiled Worker and assets, and verifies the result.
 * Application requests use the same Worker entry point as staging and production.
 */

import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

import type {BuildIdentity} from '@expensify/new-expensify-cloudflare-worker/pr-testing-config';

import {createConfig, getIdentity, getPreviewCommand, getTarget, isNewerRequest, prepareDirectory, STATUS_PATH} from '@expensify/new-expensify-cloudflare-worker/pr-testing-config';
import CLI from 'expensify-common/CLI';
import {appendFile, lstat} from 'node:fs/promises';
import path from 'node:path';

import extractPRTestingAssets from './extractPRTestingAssets';

type GitHubClient = {
    pulls: Pick<typeof GithubUtils.octokit.pulls, 'get'>;
    repos: Pick<typeof GithubUtils.octokit.repos, 'getCommit' | 'listDeployments' | 'getDeployment' | 'createDeployment' | 'createDeploymentStatus'>;
};
type PreviewCommand = 'register' | 'deploy';
type DeploymentState = 'in_progress' | 'success' | 'failure';
type BuiltPreviewOptions = {prNumber: number; sha: string; deploymentID: number; requestAttempt: string};
type PreviewOptions = {command: 'register'; prNumber: number; ref: string} | ({command: 'deploy'; artifactDirectory: string} & BuiltPreviewOptions);

const REPOSITORY = {owner: CONST.GITHUB_OWNER, repo: CONST.APP_REPO};
const VERIFY_ATTEMPTS = 12;
const VERIFY_REQUEST_TIMEOUT_MS = 10000;
const VERIFY_RETRY_DELAY_MS = 5000;

function getPayloadIdentity(value: unknown): BuildIdentity {
    if (typeof value !== 'object' || value === null || !('sha' in value) || !('runID' in value) || !('runAttempt' in value)) {
        throw new Error('Deployment identity does not match this build');
    }
    return getIdentity(value.sha, value.runID, value.runAttempt);
}

/**
 * Workflow cancellation stops superseded builds. These identity checks also reject artifacts from a retried older job,
 * and prevent a working response from another deployment from being reported as this build's success.
 */
class AdhocCloudflareWorkerDeployer {
    private readonly github: GitHubClient;

    private readonly fetch: typeof fetch;

    constructor({github, fetchImpl = fetch}: {github: GitHubClient; fetchImpl?: typeof fetch}) {
        this.github = github;
        this.fetch = fetchImpl;
    }

    // GitHub REST request properties use their API's snake_case spelling.
    /* eslint-disable @typescript-eslint/naming-convention */
    async register(prNumber: number, ref: string, runID: string, runAttempt: string, isPushBuild = false) {
        const target = getTarget(prNumber);
        // Closed PRs can retain and rebuild their previews, but the PR must belong to App.
        await this.github.pulls.get({...REPOSITORY, pull_number: prNumber});
        const {data: commit} = await this.github.repos.getCommit({...REPOSITORY, ref});
        const identity = getIdentity(commit.sha, runID, runAttempt);
        // A late registration must not replace a request with a newer workflow run or attempt.
        const {data: latest} = await this.github.repos.listDeployments({...REPOSITORY, environment: target.environment, per_page: 1});
        const previousDeployment = latest.at(0);
        if (previousDeployment && isNewerRequest(getPayloadIdentity(previousDeployment.payload), identity)) {
            // Queued main builds still need artifacts for bisection, even if a newer manual preview already exists.
            if (isPushBuild) {
                return {sha: identity.sha, deploymentID: ''};
            }
            throw new Error('A newer ad-hoc build was already requested');
        }
        const {data: deployment} = await this.github.repos.createDeployment({
            ...REPOSITORY,
            ref: identity.sha,
            environment: target.environment,
            auto_merge: false,
            required_contexts: [],
            transient_environment: true,
            production_environment: false,
            payload: identity,
            description: `PR ${prNumber} ad-hoc web build`,
        });
        if (!('id' in deployment)) {
            throw new Error('GitHub did not create a deployment record');
        }
        return {sha: identity.sha, deploymentID: String(deployment.id)};
    }

    async assertCurrent(prNumber: number, deploymentID: number, identity: BuildIdentity): Promise<void> {
        const target = getTarget(prNumber);
        const {data: deployment} = await this.github.repos.getDeployment({...REPOSITORY, deployment_id: deploymentID});
        const payload = getPayloadIdentity(deployment.payload);
        if (
            deployment.environment !== target.environment ||
            deployment.ref !== identity.sha ||
            payload.sha !== identity.sha ||
            payload.runID !== identity.runID ||
            payload.runAttempt !== identity.runAttempt
        ) {
            throw new Error('Deployment identity does not match this build');
        }
        const {data: recent} = await this.github.repos.listDeployments({...REPOSITORY, environment: target.environment, per_page: 1});
        if (String(recent.at(0)?.id) !== String(deploymentID)) {
            throw new Error('A newer ad-hoc build was requested; refusing to overwrite it');
        }
    }

    async status(deploymentID: number, state: DeploymentState, hostname: string): Promise<void> {
        await this.github.repos.createDeploymentStatus({...REPOSITORY, deployment_id: deploymentID, state, environment_url: `https://${hostname}`, auto_inactive: state === 'success'});
    }
    /* eslint-enable @typescript-eslint/naming-convention */

    async verify(hostname: string, identity: BuildIdentity, maxAttempts = VERIFY_ATTEMPTS): Promise<void> {
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const responses = await Promise.all(
                [STATUS_PATH, '/preview-build.json'].map((pathname) =>
                    this.fetch(`https://${hostname}${pathname}?run=${identity.runID}-${identity.runAttempt}`, {
                        redirect: 'error',
                        signal: AbortSignal.timeout(VERIFY_REQUEST_TIMEOUT_MS),
                    }).catch(() => null),
                ),
            );
            const data: unknown[] = await Promise.all(responses.map(async (response) => (response?.ok ? response.json().catch(() => null) : null)));
            const matches = data.every((item) => {
                try {
                    const payload = getPayloadIdentity(item);
                    return payload.sha === identity.sha && payload.runID === identity.runID && payload.runAttempt === identity.runAttempt;
                } catch {
                    return false;
                }
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

    async deploy(prNumber: number, deploymentID: number, identity: BuildIdentity, publish: () => void | Promise<void>): Promise<void> {
        const target = getTarget(prNumber);
        await this.assertCurrent(prNumber, deploymentID, identity);
        await this.status(deploymentID, 'in_progress', target.hostname);
        try {
            await publish();
            await this.verify(target.hostname, identity);
            await this.assertCurrent(prNumber, deploymentID, identity);
            await this.status(deploymentID, 'success', target.hostname);
        } catch (error) {
            await this.status(deploymentID, 'failure', target.hostname);
            throw error;
        }
    }
}

function parseCommand(value: string): PreviewCommand {
    if (value === 'register' || value === 'deploy') {
        return value;
    }
    throw new Error('Expected register or deploy');
}

function parseNumericID(value: string): number {
    if (!/^[1-9]\d*$/.test(value) || !Number.isSafeInteger(Number(value))) {
        throw new Error('Expected a positive numeric ID');
    }
    return Number(value);
}

function requireString(value: string | undefined, name: string): string {
    if (!value) {
        throw new Error(`${name} is required`);
    }
    return value;
}

function parseCLI(): PreviewOptions {
    // The shared CLI uses kebab-case option names.
    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        positionalArgs: [{name: 'command', description: 'register a request or deploy and verify a preview', parse: parseCommand}],
        namedArgs: {
            'pr-number': {description: 'Expensify/App PR number', parse: parseNumericID},
            ref: {description: 'App source ref (required for register)', required: false},
            sha: {description: 'Immutable built App SHA (required for deploy)', required: false},
            'deployment-id': {description: 'Registered GitHub deployment ID (required for deploy)', required: false, parse: parseNumericID},
            'request-attempt': {description: 'Original request attempt, including on failed-job retries (required for deploy)', required: false},
            'artifact-directory': {description: 'Downloaded Worker and web artifacts directory (required for deploy)', required: false},
        },
    } as const);
    /* eslint-enable @typescript-eslint/naming-convention */
    const command = cli.positionalArgs.command;
    const prNumber = cli.namedArgs['pr-number'];
    if (command === 'register') {
        return {command, prNumber, ref: requireString(cli.namedArgs.ref, '--ref')};
    }
    const deploymentID = cli.namedArgs['deployment-id'];
    if (deploymentID === undefined) {
        throw new Error('--deployment-id is required');
    }
    const built = {
        prNumber,
        deploymentID,
        sha: requireString(cli.namedArgs.sha, '--sha'),
        requestAttempt: requireString(cli.namedArgs['request-attempt'], '--request-attempt'),
    };
    return {command, ...built, artifactDirectory: requireString(cli.namedArgs['artifact-directory'], '--artifact-directory')};
}

async function main(): Promise<void> {
    // Parse first so --help and invalid arguments work without CI credentials.
    const options = parseCLI();
    const deployer = new AdhocCloudflareWorkerDeployer({github: GithubUtils.octokit});
    const prNumber = options.prNumber;
    const runID = requireString(process.env.GITHUB_RUN_ID, 'GITHUB_RUN_ID');
    if (options.command === 'register') {
        const runAttempt = requireString(process.env.GITHUB_RUN_ATTEMPT, 'GITHUB_RUN_ATTEMPT');
        const result = await deployer.register(prNumber, options.ref, runID, runAttempt, process.env.GITHUB_EVENT_NAME === 'push');
        await appendFile(
            requireString(process.env.GITHUB_OUTPUT, 'GITHUB_OUTPUT'),
            `PR_NUMBER=${prNumber}\nSHA=${result.sha}\nDEPLOYMENT_ID=${result.deploymentID}\nREQUEST_ATTEMPT=${runAttempt}\n`,
        );
        return;
    }
    const identity = getIdentity(options.sha, runID, options.requestAttempt);
    const deploymentID = options.deploymentID;
    const artifactDirectory = path.resolve(options.artifactDirectory);
    await deployer.deploy(prNumber, deploymentID, identity, async () => {
        const runtimePath = path.join(artifactDirectory, 'worker/runtime.json');
        if (!(await lstat(runtimePath)).isFile()) {
            throw new Error('Worker runtime settings must be a regular JSON file');
        }
        const runtime: unknown = await Bun.file(runtimePath).json();
        const config = createConfig(runtime);
        const root = await prepareDirectory(path.join(artifactDirectory, 'worker'), path.join(artifactDirectory, 'assets/webBuild.tar.gz'), config, identity, extractPRTestingAssets);
        // Resolve from the workspace so both hoisted and package-local tool installs work.
        const wranglerPackage = Bun.resolveSync('wrangler/package.json', path.resolve('web/cloudflare-worker'));
        const wrangler = path.join(path.dirname(wranglerPackage), 'bin/wrangler.js');
        const command = getPreviewCommand(prNumber, path.join(root, 'wrangler.json'), process.env);
        const result = Bun.spawn(['node', wrangler, ...command.args], {cwd: root, env: command.env, stdin: 'inherit', stdout: 'inherit', stderr: 'inherit'});
        if ((await result.exited) !== 0) {
            throw new Error('Cloudflare preview deployment failed');
        }
    });
}

if (import.meta.main) {
    await main();
}

export {AdhocCloudflareWorkerDeployer};
export type {GitHubClient};

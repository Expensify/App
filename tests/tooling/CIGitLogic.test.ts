import {afterAll, beforeAll, describe, expect, jest, setDefaultTimeout, test} from 'bun:test';

import getPreviousVersion from '@github/actions/javascript/getPreviousVersion/getPreviousVersion';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import GitUtils from '@github/libs/GitUtils';
import * as VersionUpdater from '@github/libs/versionUpdater';
import type {SemverLevel} from '@github/libs/versionUpdater';

import * as core from '@actions/core';
import {$} from 'bun';
import fs from 'fs';
import os from 'os';
import path from 'path';

import * as Log from '../../scripts/utils/Logger';
import createMock from '../utils/createMock';

// Every run gets its own throw-away sandbox, so nothing on the machine is shared: this suite can run
// alongside other test files in sibling worker processes, a second copy of itself, or a developer's own
// checkout, without any of them fighting over the same directory.
// os.tmpdir() is resolved because on macOS it is a symlink (/var -> /private/var) and git reports the
// real path, which would make path comparisons against process.cwd() disagree.
const SANDBOX_DIR = fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()), 'ci-git-logic-'));
const GIT_REMOTE = path.join(SANDBOX_DIR, 'remote');
const DUMMY_DIR = path.join(SANDBOX_DIR, 'checkout');

// Used to mock the Octokit GithubAPI
const mockGetInput = jest.fn<(name: string) => string | undefined>();
type CompareCommitsCommit = NonNullable<Awaited<ReturnType<typeof GithubUtils.octokit.repos.compareCommits>>['data']['commits']>[number];

const isVerbose = process.env.TEST_VERBOSE === 'true';

/**
 * Runs a command through the Bun shell, logging it first and echoing its output only when TEST_VERBOSE is set.
 *
 * This is a tagged template that forwards to `$`, so interpolated values are escaped by Bun and need no quoting
 * at the call site: `` exec`git commit -m ${message}` `` is correct even when the message contains spaces.
 * Commands run in `process.cwd()`, which the suite moves between the remote and the checkout.
 */
async function exec(strings: TemplateStringsArray, ...values: Array<string | number>) {
    Log.info(String.raw({raw: strings}, ...values));
    try {
        return await $(strings, ...values).quiet(!isVerbose);
    } catch (error) {
        if (error instanceof $.ShellError) {
            Log.error(error.stderr.toString());
        } else {
            Log.error('Error:', error);
        }
        throw error;
    }
}

/** Whether a ref resolves in the repo at `process.cwd()`. `nothrow` because a missing ref is an expected answer here, not a failure. */
async function refExists(ref: string) {
    return (await $`git rev-parse --verify ${ref}`.quiet().nothrow()).exitCode === 0;
}

async function setupGitAsHuman() {
    Log.info('Switching to human git user');
    await exec`git config --local user.name test`;
    await exec`git config --local user.email test@test.com`;
}

async function setupGitAsOSBotify() {
    Log.info('Switching to OSBotify git user');
    await exec`git config --local user.name ${CONST.OS_BOTIFY}`;
    await exec`git config --local user.email infra+osbotify@expensify.com`;
}

function getVersion(): string {
    const packageJson: unknown = JSON.parse(fs.readFileSync('package.json', {encoding: 'utf-8'}));

    if (typeof packageJson !== 'object' || packageJson === null || !('version' in packageJson) || typeof packageJson.version !== 'string' || !packageJson.version) {
        throw new Error('package.json does not contain a version field');
    }

    return packageJson.version;
}

function initGithubAPIMocking() {
    jest.spyOn(core, 'getInput').mockImplementation((name): string => {
        if (name === 'GITHUB_TOKEN') {
            return 'mock-token';
        }
        return mockGetInput(name) ?? '';
    });

    // Mock various compareCommits responses with a single mocked function. Assigned directly rather than via
    // jest.spyOn/spyOn: Octokit's REST endpoint methods are lazily memoized (each is replaced with a plain value
    // the first time it's accessed), and under bun:test, spyOn silently fails to override that already-memoized
    // property on this particular object shape, so the mock is never installed. A direct assignment works fine.
    const mockCompareCommits = jest.fn().mockImplementation((params: Parameters<typeof GithubUtils.octokit.repos.compareCommits>[0]) => {
        const base = params?.base;
        const head = params?.head;
        const tagPairKey = `${base}...${head}`;

        const mockCommits = (() => {
            switch (tagPairKey) {
                case '2.0.0-0...2.0.0-1-staging':
                    return [{sha: 'sha_pr1_merge', commit: {message: 'Merge pull request #1 from Expensify/pr-1', author: {name: 'Test Author'}}, author: {login: 'email'}}];
                case '2.0.0-0...2.0.0-2-staging':
                    return [
                        {sha: 'sha_pr1_merge', commit: {message: 'Merge pull request #1 from Expensify/pr-1', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr3_merge', commit: {message: 'Merge pull request #3 from Expensify/pr-3', author: {name: 'Test Author'}}, author: {login: 'email'}},
                    ];
                case '2.0.0-1-staging...2.0.0-2-staging':
                    return [{sha: 'sha_pr3_merge', commit: {message: 'Merge pull request #3 from Expensify/pr-3', author: {name: 'Test Author'}}, author: {login: 'email'}}];
                case '2.0.0-0...2.0.1-1-staging':
                    return [
                        {sha: 'sha_pr1_merge_alt', commit: {message: 'Merge pull request #1 from Expensify/pr-1', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr3_merge_alt', commit: {message: 'Merge pull request #3 from Expensify/pr-3', author: {name: 'Test Author'}}, author: {login: 'email'}},
                    ];
                case '2.0.0-0...2.0.1-0':
                    return [{sha: 'sha_pr5_merge', commit: {message: 'Merge pull request #5 from Expensify/pr-5', author: {name: 'Test Author'}}, author: {login: 'email'}}];
                case '2.0.0-0...2.0.1-1':
                    return [
                        {sha: 'sha_pr1_merge_v2', commit: {message: 'Merge pull request #1 from Expensify/pr-1', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr3_merge_v2', commit: {message: 'Merge pull request #3 from Expensify/pr-3', author: {name: 'Test Author'}}, author: {login: 'email'}},
                    ];
                case '2.0.0-2-staging...2.0.2-0-staging':
                    return [
                        {sha: 'sha_pr2_merge', commit: {message: 'Merge pull request #2 from Expensify/pr-2', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr5_merge', commit: {message: 'Merge pull request #5 from Expensify/pr-5', author: {name: 'Test Author'}}, author: {login: 'email'}},
                    ];
                case '2.0.0-2-staging...2.0.2-1-staging':
                    return [
                        {sha: 'sha_pr2_merge', commit: {message: 'Merge pull request #2 from Expensify/pr-2', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr5_merge', commit: {message: 'Merge pull request #5 from Expensify/pr-5', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr6_merge', commit: {message: 'Merge pull request #6 from Expensify/pr-6', author: {name: 'Test Author'}}, author: {login: 'email'}},
                    ];
                case '2.0.2-0-staging...2.0.2-1-staging':
                    return [{sha: 'sha_pr6_merge', commit: {message: 'Merge pull request #6 from Expensify/pr-6', author: {name: 'Test Author'}}, author: {login: 'email'}}];
                case '2.0.0-2-staging...2.0.2-2-staging':
                    return [
                        {sha: 'sha_pr2_merge', commit: {message: 'Merge pull request #2 from Expensify/pr-2', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr5_merge', commit: {message: 'Merge pull request #5 from Expensify/pr-5', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr6_merge', commit: {message: 'Merge pull request #6 from Expensify/pr-6', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr7_merge', commit: {message: 'Merge pull request #7 from Expensify/pr-7', author: {name: 'Test Author'}}, author: {login: 'email'}},
                    ];
                case '2.0.2-1-staging...2.0.2-2-staging':
                    return [{sha: 'sha_pr7_merge', commit: {message: 'Merge pull request #7 from Expensify/pr-7', author: {name: 'Test Author'}}, author: {login: 'email'}}];
                case '2.0.0-2-staging...2.0.2-3-staging':
                    return [
                        {sha: 'sha_pr2_merge', commit: {message: 'Merge pull request #2 from Expensify/pr-2', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr5_merge', commit: {message: 'Merge pull request #5 from Expensify/pr-5', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr6_merge', commit: {message: 'Merge pull request #6 from Expensify/pr-6', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr7_merge', commit: {message: 'Merge pull request #7 from Expensify/pr-7', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr8_merge', commit: {message: 'Merge pull request #8 from Expensify/pr-8', author: {name: 'Test Author'}}, author: {login: 'email'}},
                    ];
                case '2.0.2-2-staging...2.0.2-3-staging':
                    return [{sha: 'sha_pr8_merge', commit: {message: 'Merge pull request #8 from Expensify/pr-8', author: {name: 'Test Author'}}, author: {login: 'email'}}];
                case '2.0.1-1...2.0.2-4':
                    return [
                        {sha: 'sha_pr2_merge', commit: {message: 'Merge pull request #2 from Expensify/pr-2', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr5_merge', commit: {message: 'Merge pull request #5 from Expensify/pr-5', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr6_merge', commit: {message: 'Merge pull request #6 from Expensify/pr-6', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr7_merge', commit: {message: 'Merge pull request #7 from Expensify/pr-7', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr8_merge', commit: {message: 'Merge pull request #8 from Expensify/pr-8', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr10_merge', commit: {message: 'Merge pull request #10 from Expensify/pr-10', author: {name: 'Test Author'}}, author: {login: 'email'}},
                    ];
                case '2.0.2-4-staging...2.0.3-0-staging':
                    return [
                        {sha: 'sha_pr9_merge', commit: {message: 'Merge pull request #9 from Expensify/pr-9', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr11_merge', commit: {message: 'Merge pull request #11 from Expensify/pr-11', author: {name: 'Test Author'}}, author: {login: 'email'}},
                    ];
                case '2.0.2-4-staging...2.0.3-1-staging':
                    return [
                        {sha: 'sha_pr9_merge', commit: {message: 'Merge pull request #9 from Expensify/pr-9', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr11_merge', commit: {message: 'Merge pull request #11 from Expensify/pr-11', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr13_merge', commit: {message: 'Merge pull request #13 from Expensify/pr-13', author: {name: 'Test Author'}}, author: {login: 'email'}},
                    ];
                case '2.0.3-0-staging...2.0.3-1-staging':
                    return [{sha: 'sha_pr13_merge', commit: {message: 'Merge pull request #13 from Expensify/pr-13', author: {name: 'Test Author'}}, author: {login: 'email'}}];
                case '2.0.3-1-staging...2.0.4-0-staging':
                    return [{sha: 'sha_pr12_merge', commit: {message: 'Merge pull request #12 from Expensify/pr-12', author: {name: 'Test Author'}}, author: {login: 'email'}}];
                case '2.0.4-0-staging...5.0.0-0-staging':
                    return [{sha: 'sha_pr14_merge', commit: {message: 'Merge pull request #14 from Expensify/pr-14', author: {name: 'Test Author'}}, author: {login: 'email'}}];
                case '5.0.0-0-staging...8.0.0-0-staging':
                    return [{sha: 'sha_pr15_merge', commit: {message: 'Merge pull request #15 from Expensify/pr-15', author: {name: 'Test Author'}}, author: {login: 'email'}}];
                case '2.0.4-0-staging...8.0.0-0-staging':
                    return [
                        {sha: 'sha_pr14_merge', commit: {message: 'Merge pull request #14 from Expensify/pr-14', author: {name: 'Test Author'}}, author: {login: 'email'}},
                        {sha: 'sha_pr15_merge', commit: {message: 'Merge pull request #15 from Expensify/pr-15', author: {name: 'Test Author'}}, author: {login: 'email'}},
                    ];
                default:
                    console.warn(`Unhandled tag pair in compareCommits mock: ${tagPairKey}`);
                    return [];
            }
        })();

        return Promise.resolve(
            createMock<Awaited<ReturnType<typeof GithubUtils.octokit.repos.compareCommits>>>({
                data: {
                    commits: mockCommits.map((commit) => createMock<CompareCommitsCommit>(commit)),
                },
                status: 200,
                headers: {},
                url: '',
            }),
        );
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- the stub omits octokit's `defaults`/`endpoint` statics, which this action never touches
    GithubUtils.octokit.repos.compareCommits = mockCompareCommits as unknown as typeof GithubUtils.octokit.repos.compareCommits;
}

async function initGitServer() {
    Log.info('Initializing git server...');
    fs.mkdirSync(GIT_REMOTE, {recursive: true});
    process.chdir(GIT_REMOTE);
    await exec`git init -b main`;
    await setupGitAsHuman();
    await exec`npm init -y`;
    await exec`npm version --no-git-tag-version 1.0.0-0`;
    fs.appendFileSync('.gitignore', 'node_modules/\n');
    await exec`git add -A`;
    await exec`git commit -m "Initial commit"`;
    await exec`git switch -c staging`;
    await exec`git switch -c production`;

    // Tag the production branch with 1.0.0.0
    await exec`git tag ${getVersion()}`;

    // Bump version to 2.0.0.0
    await bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR, true);
    await exec`git branch -D staging production`;
    await exec`git switch -c staging`;
    await exec`git switch -c production`;
    await exec`git tag ${getVersion()}`;
    await exec`git switch staging`;
    await exec`git config --local receive.denyCurrentBranch ignore`;
    Log.success(`Initialized git server in ${GIT_REMOTE}`);
}

async function checkoutRepo() {
    if (fs.existsSync(DUMMY_DIR)) {
        Log.warn(`Found existing directory at ${DUMMY_DIR}, deleting it to simulate a fresh checkout...`);
        fs.rmSync(DUMMY_DIR, {recursive: true});
    }
    fs.mkdirSync(DUMMY_DIR);
    process.chdir(DUMMY_DIR);
    await exec`git init`;
    await exec`git remote add origin ${GIT_REMOTE}`;
    await exec`git fetch --no-tags --prune --progress --no-recurse-submodules --depth=1 origin +refs/heads/main:refs/remotes/origin/main`;
    await exec`git checkout --progress --force -B main refs/remotes/origin/main`;
    Log.success('Checked out repo at $DUMMY_DIR!');
}

async function bumpVersion(level: SemverLevel, isRemote = false) {
    Log.info('Bumping version...');
    await setupGitAsOSBotify();
    await exec`git switch main`;
    const nextVersion = VersionUpdater.incrementVersion(getVersion(), level);
    await exec`npm --no-git-tag-version version ${nextVersion}`;
    await exec`git add package.json`;
    await exec`git commit -m "Update version to ${nextVersion}"`;
    if (!isRemote) {
        await exec`git push origin main`;
    }
    Log.success(`Version bumped to ${nextVersion} on main`);
}

async function updateStagingFromMain() {
    Log.info('Recreating staging from main...');
    await exec`git switch main`;
    if (await refExists('staging')) {
        await exec`git branch -D staging`;
    }
    await exec`git switch -c staging`;
    await exec`git push --force origin staging`;
    Log.success('Recreated staging from main!');
}

async function updateProductionFromStaging() {
    Log.info('Recreating production from staging...');

    if (!(await refExists('staging'))) {
        await exec`git fetch origin staging --depth=1`;
    }

    await exec`git switch staging`;

    if (await refExists('production')) {
        await exec`git branch -D production`;
    }

    await exec`git switch -c production`;
    await exec`git tag ${getVersion()}`;
    await exec`git push --force --tags origin production`;
    Log.success('Recreated production from staging!');
}

async function createBasicPR(num: number) {
    const branchName = `pr-${num}`;
    const content = `Changes from PR #${num}`;
    const filePath = path.resolve(process.cwd(), `PR${num}.txt`);

    Log.info(`Creating PR #${num}`);
    await checkoutRepo();
    await setupGitAsHuman();
    await exec`git pull`;
    await exec`git switch -c ${branchName}`;
    fs.appendFileSync(filePath, content);
    await exec`git add ${filePath}`;
    await exec`git commit -m ${content}`;
    Log.success(`Created PR #${num} in branch ${branchName}`);
}

async function mergePR(num: number) {
    const branchName = `pr-${num}`;

    Log.info(`Merging PR #${num} to main`);
    await exec`git switch main`;
    await exec`git merge ${branchName} --no-ff -m "Merge pull request #${num} from Expensify/${branchName}"`;
    await exec`git push origin main`;
    await exec`git branch -d ${branchName}`;
    Log.success(`Merged PR #${num} to main`);
}

async function cherryPickPRToStaging(num: number, resolveVersionBumpConflicts: () => Promise<void> = async () => {}, resolveMergeCommitConflicts: () => Promise<void> = async () => {}) {
    Log.info(`Cherry-picking PR ${num} to staging...`);
    const prMergeCommit = (await $`git rev-parse HEAD`.text()).trim();
    await bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.BUILD);
    const versionBumpCommit = (await $`git rev-parse HEAD`.text()).trim();
    await checkoutRepo();
    await setupGitAsOSBotify();

    mockGetInput.mockReturnValue(VersionUpdater.SEMANTIC_VERSION_LEVELS.PATCH);
    const previousPatchVersion = getPreviousVersion();

    // --shallow-exclude is used to speed up the fetch
    await exec`git fetch origin main staging --no-tags --shallow-exclude=${previousPatchVersion}`;

    await exec`git switch staging`;
    await exec`git switch -c cherry-pick-staging`;

    try {
        await exec`git cherry-pick -x --mainline 1 ${versionBumpCommit}`;
    } catch (e) {
        await resolveVersionBumpConflicts();
    }

    await setupGitAsHuman();

    try {
        await exec`git cherry-pick -x --mainline 1 --strategy=recursive -Xtheirs ${prMergeCommit}`;
    } catch (e) {
        await resolveMergeCommitConflicts();
    }

    await setupGitAsOSBotify();
    await exec`git switch staging`;
    await exec`git merge cherry-pick-staging --no-ff -m "Merge pull request #${num + 1} from Expensify/cherry-pick-staging"`;
    await exec`git branch -d cherry-pick-staging`;
    await exec`git push origin staging`;
    Log.info(`Merged PR #${num + 1} into staging`);
    await tagStaging();
    Log.success(`Successfully cherry-picked PR #${num} to staging!`);
}

async function cherryPickPRToProduction(num: number, resolveVersionBumpConflicts: () => Promise<void> = async () => {}, resolveMergeCommitConflicts: () => Promise<void> = async () => {}) {
    Log.info(`Cherry-picking PR ${num} to production...`);
    const prMergeCommit = (await $`git rev-parse HEAD`.text()).trim();
    await bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.PATCH);
    let versionBumpCommit = (await $`git rev-parse HEAD`.text()).trim();
    await checkoutRepo();
    await setupGitAsOSBotify();

    mockGetInput.mockReturnValue(VersionUpdater.SEMANTIC_VERSION_LEVELS.MINOR);
    const previousPatchVersion = getPreviousVersion();
    await exec`git fetch origin main production --no-tags --shallow-exclude=${previousPatchVersion}`;

    await exec`git switch production`;
    await exec`git switch -c cherry-pick-production`;

    try {
        await exec`git cherry-pick -x --mainline 1 -Xtheirs ${versionBumpCommit}`;
    } catch (e) {
        await resolveVersionBumpConflicts();
    }

    await setupGitAsHuman();

    try {
        await exec`git cherry-pick -x --mainline 1 --strategy=recursive -Xtheirs ${prMergeCommit}`;
    } catch (e) {
        await resolveMergeCommitConflicts();
    }

    await setupGitAsOSBotify();
    await exec`git switch production`;
    await exec`git merge cherry-pick-production --no-ff -m "Merge pull request #${num + 1} from Expensify/cherry-pick-production"`;
    await exec`git branch -d cherry-pick-production`;
    await exec`git push origin production`;
    Log.info(`Merged PR #${num + 1} into production`);
    await tagProduction();

    await checkoutRepo();
    await bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.BUILD);
    versionBumpCommit = (await $`git rev-parse HEAD`.text()).trim();
    await exec`git fetch origin staging --depth=1`;
    await exec`git switch staging`;
    await exec`git cherry-pick -x --mainline 1 -Xtheirs ${versionBumpCommit}`;
    await exec`git push origin staging`;
    await tagStaging();
    Log.success(`Pushed to staging after CP to production`);

    Log.success(`Successfully cherry-picked PR #${num} to production!`);
}

async function tagStaging() {
    Log.info('Tagging new version from the staging branch...');
    await checkoutRepo();
    await setupGitAsOSBotify();
    if (!(await refExists('staging'))) {
        await exec`git fetch origin staging --depth=1`;
    }
    await exec`git switch staging`;
    await exec`git tag ${getVersion()}-staging`;
    await exec`git push --tags`;
    Log.success(`Created new tag ${getVersion()}`);
}

async function tagProduction() {
    Log.info('Tagging new version from the production branch...');
    Log.info(`Version is: ${getVersion()}`);
    await checkoutRepo();
    await setupGitAsOSBotify();
    if (!(await refExists('production'))) {
        await exec`git fetch origin production --depth=1`;
    }
    await exec`git switch production`;
    await exec`git tag ${getVersion()}`;
    await exec`git push --tags`;
    Log.success(`Created new tag ${getVersion()}`);
}

async function deployStaging() {
    Log.info('Deploying staging...');
    await checkoutRepo();
    await bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.BUILD);
    await updateStagingFromMain();
    await tagStaging();
    Log.success(`Deployed ${getVersion()} to staging!`);
}

async function deployProduction() {
    Log.info('Checklist closed, deploying production and staging...');

    Log.info('Deploying production...');
    await updateProductionFromStaging();
    Log.success(`Deployed v${getVersion()} to production!`);

    Log.info('Deploying staging...');
    await bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.PATCH);
    await updateStagingFromMain();
    await tagStaging();
    Log.success(`Deployed v${getVersion()} to staging!`);
}

async function assertPRsMergedBetween(from: string, to: string, expected: number[]) {
    await checkoutRepo();
    const PRs = await GitUtils.getPullRequestsDeployedBetween(from, to, CONST.APP_REPO);
    expect(PRs).toStrictEqual(expected);
    Log.success(`Verified PRs merged between ${from} and ${to} are [${expected.join(',')}]`);
}

/*
 * These tests are different from most of the suite. They create a dummy git repo and simulate the GitHub Actions CI environment
 * and ensure that deploy checklists, comments, and releases are created correctly and completely,
 * including a number of real-world edge cases we have encountered and fixed.
 *
 * However, because they are different, there are a few additional "rules" with these tests:
 *   - The whole suite should be run. Running individual tests from the suite may not work as expected.
 *   - Each test builds on the repo state the previous one left behind, so the first failure cascades into the rest.
 *     That chain is why the suite is `describe.serial`, which pins the order no matter what flags Bun is given.
 *     Re-run with `--bail` to see only the first failure; Bun has no per-file equivalent.
 *   - The suite changes the process-wide cwd, because the git helpers it exercises resolve `git` against
 *     `process.cwd()` exactly as they do in a real GitHub Actions checkout. It is restored in `afterAll`,
 *     but it does mean this file needs its own process to run truly in parallel with other files (`--parallel`,
 *     which Bun implements with worker processes, gives it one).
 */

// These tests shell out to real `git`/`npm` subprocesses many times per test and can exceed the default 5000ms
// per-test timeout, especially on a cold cache.
setDefaultTimeout(30000);

let startingDir: string;
describe.serial('CIGitLogic', () => {
    beforeAll(async () => {
        Log.info('Starting setup');
        startingDir = process.cwd();
        await initGitServer();
        initGithubAPIMocking();
        await checkoutRepo();
        Log.success('Setup complete!');
    });

    afterAll(() => {
        jest.restoreAllMocks();
        // Restore the cwd before removing the sandbox, so the process is never left sitting in a deleted directory.
        process.chdir(startingDir);
        fs.rmSync(SANDBOX_DIR, {recursive: true, force: true});
    });

    test('Merge a pull request while the checklist is unlocked', async () => {
        await createBasicPR(1);
        await mergePR(1);
        await deployStaging();

        // Verify output for checklist and deploy comment
        await assertPRsMergedBetween('2.0.0-0', '2.0.0-1-staging', [1]);
    });

    test("Merge a pull request with the checklist locked, but don't CP it", async () => {
        await createBasicPR(2);
        await mergePR(2);

        // Verify output for checklist and deploy comment, and make sure PR #2 is not on staging
        await assertPRsMergedBetween('2.0.0-0', '2.0.0-1-staging', [1]);
    });

    test('Merge a pull request with the checklist locked and CP it to staging', async () => {
        await createBasicPR(3);
        await mergePR(3);
        await cherryPickPRToStaging(3);

        // Verify output for checklist
        await assertPRsMergedBetween('2.0.0-0', '2.0.0-2-staging', [1, 3]);

        // Verify output for deploy comment, and make sure PR #2 is not on staging
        await assertPRsMergedBetween('2.0.0-1-staging', '2.0.0-2-staging', [3]);
    });

    test('Merge a pull request with the checklist locked and CP it to production', async () => {
        await createBasicPR(5);
        await mergePR(5);
        await cherryPickPRToProduction(5);

        // Verify output for checklist
        await assertPRsMergedBetween('2.0.0-0', '2.0.1-1-staging', [1, 3]);

        // Verify output for deploy comment
        await assertPRsMergedBetween('2.0.0-0', '2.0.1-0', [5]);
    });

    test('Close the checklist, deploy production and staging', async () => {
        await deployProduction();

        // Verify output for release body and production deploy comments
        await assertPRsMergedBetween('2.0.0-0', '2.0.1-1', [1, 3]);

        // Verify output for new checklist and staging deploy comments
        await assertPRsMergedBetween('2.0.0-2-staging', '2.0.2-0-staging', [2, 5]);
    });

    test('Merging another pull request when the checklist is unlocked', async () => {
        await createBasicPR(6);
        await mergePR(6);
        await deployStaging();

        // Verify output for checklist
        await assertPRsMergedBetween('2.0.0-2-staging', '2.0.2-1-staging', [2, 5, 6]);

        // Verify output for deploy comment
        await assertPRsMergedBetween('2.0.2-0-staging', '2.0.2-1-staging', [6]);
    });

    test('Deploying a PR, then CPing a revert, then adding the same code back again before the next production deploy results in the correct code on staging and production', async () => {
        Log.info('Creating myFile.txt in PR #7');
        await setupGitAsHuman();
        await exec`git switch main`;
        await exec`git switch -c pr-7`;
        const initialFileContent = 'Changes from PR #7';
        fs.appendFileSync('myFile.txt', 'Changes from PR #7');
        await exec`git add myFile.txt`;
        await exec`git commit -m "Add myFile.txt in PR #7"`;

        await mergePR(7);
        await deployStaging();

        // Verify output for checklist
        await assertPRsMergedBetween('2.0.0-2-staging', '2.0.2-2-staging', [2, 5, 6, 7]);

        // Verify output for deploy comment
        await assertPRsMergedBetween('2.0.2-1-staging', '2.0.2-2-staging', [7]);

        Log.info('Appending and prepending content to myFile.txt in PR #8');
        await setupGitAsHuman();
        await exec`git switch main`;
        await exec`git switch -c pr-8`;
        const newFileContent = `
Prepended content
${initialFileContent}
Appended content
`;
        fs.writeFileSync('myFile.txt', newFileContent, {encoding: 'utf-8'});
        await exec`git add myFile.txt`;
        await exec`git commit -m "Append and prepend content in myFile.txt"`;
        await mergePR(8);
        await deployStaging();

        // Verify output for checklist
        await assertPRsMergedBetween('2.0.0-2-staging', '2.0.2-3-staging', [2, 5, 6, 7, 8]);

        // Verify output for deploy comment
        await assertPRsMergedBetween('2.0.2-2-staging', '2.0.2-3-staging', [8]);

        Log.info('Making an unrelated change in PR #9');
        await setupGitAsHuman();
        await exec`git switch main`;
        await exec`git switch -c pr-9`;
        fs.appendFileSync('anotherFile.txt', 'some content');
        await exec`git add anotherFile.txt`;
        await exec`git commit -m "Create another file"`;
        await mergePR(9);

        Log.info('Reverting the append + prepend on main in PR #10');
        await setupGitAsHuman();
        await exec`git switch main`;
        await exec`git switch -c pr-10`;
        fs.writeFileSync('myFile.txt', initialFileContent);
        await exec`git add myFile.txt`;
        await exec`git commit -m "Revert append and prepend"`;
        await mergePR(10);
        await cherryPickPRToStaging(10);

        Log.info('Verifying that the revert is present on staging, but the unrelated change is not');
        expect(fs.readFileSync('myFile.txt', {encoding: 'utf8'})).toBe(initialFileContent);
        expect(fs.existsSync('anotherFile.txt')).toBe(false);

        Log.info('Repeating previously reverted append + prepend on main in PR #10');
        await setupGitAsHuman();
        await exec`git switch main`;
        await exec`git switch -c pr-11`;
        fs.writeFileSync('myFile.txt', newFileContent, {encoding: 'utf-8'});
        await exec`git add myFile.txt`;
        await exec`git commit -m "Append and prepend content in myFile.txt"`;

        await mergePR(11);
        await deployProduction();

        // Verify production release list
        await assertPRsMergedBetween('2.0.1-1', '2.0.2-4', [2, 5, 6, 7, 8, 10]);

        // Verify PR list for the new checklist
        await assertPRsMergedBetween('2.0.2-4-staging', '2.0.3-0-staging', [9, 11]);
    });

    test('Force-pushing to a branch after rebasing older commits', async () => {
        await createBasicPR(12);
        await exec`git push origin pr-12`;
        await createBasicPR(13);
        await mergePR(13);
        await deployStaging();

        // Verify PRs for checklist
        await assertPRsMergedBetween('2.0.2-4-staging', '2.0.3-1-staging', [9, 11, 13]);

        // Verify PRs for deploy comments
        await assertPRsMergedBetween('2.0.3-0-staging', '2.0.3-1-staging', [13]);

        await checkoutRepo();
        await setupGitAsHuman();
        await exec`git fetch origin pr-12`;
        await exec`git switch pr-12`;
        await exec`git rebase main -Xours`;
        await exec`git push --force origin pr-12`;
        await mergePR(12);

        await deployProduction();

        // Verify PRs for deploy comments / release
        await assertPRsMergedBetween('2.0.2-4-staging', '2.0.3-1-staging', [9, 11, 13]);

        // Verify PRs for new checklist
        await assertPRsMergedBetween('2.0.3-1-staging', '2.0.4-0-staging', [12]);
    });

    test('Manual version bump', async () => {
        Log.info('Creating manual version bump in PR #14');
        await checkoutRepo();
        await setupGitAsHuman();
        await exec`git pull`;
        await exec`git switch -c pr-14`;
        for (let i = 0; i < 3; i++) {
            await exec`npm --no-git-tag-version version ${VersionUpdater.incrementVersion(getVersion(), VersionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR)}`;
        }
        await exec`git add package.json`;
        await exec`git commit -m "Manually bump version to ${getVersion()} in PR #14"`;
        Log.success('Created manual version bump in PR #13 in branch pr-14');

        await mergePR(14);
        Log.info('Deploying staging...');
        await checkoutRepo();
        await updateStagingFromMain();
        await tagStaging();
        Log.success(`Deployed v${getVersion()} to staging!`);

        // Verify PRs for deploy comments / release and new checklist
        await assertPRsMergedBetween('2.0.4-0-staging', '5.0.0-0-staging', [14]);

        Log.info('Creating manual version bump in PR #15');
        await checkoutRepo();
        await setupGitAsHuman();
        await exec`git pull`;
        await exec`git switch -c pr-15`;
        for (let i = 0; i < 3; i++) {
            await exec`npm --no-git-tag-version version ${VersionUpdater.incrementVersion(getVersion(), VersionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR)}`;
        }
        await exec`git add package.json`;
        await exec`git commit -m "Manually bump version to ${getVersion()} in PR #15"`;
        Log.success('Created manual version bump in PR #15 in branch pr-15');

        const packageJSONBefore = fs.readFileSync('package.json', {encoding: 'utf-8'});
        await mergePR(15);
        await cherryPickPRToStaging(
            15,
            async () => {
                fs.writeFileSync('package.json', packageJSONBefore);
                await exec`git add package.json`;
                await exec`git cherry-pick --no-edit --continue`;
            },
            async () => {
                await exec`git commit --no-edit --allow-empty`;
            },
        );

        // Verify PRs for deploy comments
        await assertPRsMergedBetween('5.0.0-0-staging', '8.0.0-0-staging', [15]);

        // Verify PRs for the deploy checklist
        await assertPRsMergedBetween('2.0.4-0-staging', '8.0.0-0-staging', [14, 15]);
    });
});

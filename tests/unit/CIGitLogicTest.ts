/**
 * @jest-environment node
 * @jest-config bail=true
 */
/* eslint-disable no-console */
import * as core from '@actions/core';
import {execSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import type {PackageJson} from 'type-fest';
import getPreviousVersion from '@github/actions/javascript/getPreviousVersion/getPreviousVersion';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import GitUtils from '@github/libs/GitUtils';
import * as VersionUpdater from '@github/libs/versionUpdater';
import type {SemverLevel} from '@github/libs/versionUpdater';
import * as Log from '../../scripts/utils/Logger';

const DUMMY_DIR = path.resolve(os.homedir(), 'DumDumRepo');
const GIT_REMOTE = path.resolve(os.homedir(), 'dummyGitRemotes/DumDumRepo');

// Used to mock the Octokit GithubAPI
const mockGetInput = jest.fn<string | undefined, [string]>();

const isVerbose = process.env.JEST_VERBOSE === 'true';

type ExecSyncError = {stderr: Buffer};

function exec(command: string) {
    try {
        Log.info(command);
        execSync(command, {stdio: isVerbose ? 'inherit' : 'pipe'});
    } catch (error) {
        if ((error as ExecSyncError).stderr) {
            Log.error((error as ExecSyncError).stderr.toString());
        } else {
            Log.error('Error:', error);
        }
        throw new Error(error as string);
    }
}

function setupGitAsHuman() {
    Log.info('Switching to human git user');
    exec('git config --local user.name test');
    exec('git config --local user.email test@test.com');
}

function setupGitAsOSBotify() {
    Log.info('Switching to OSBotify git user');
    exec(`git config --local user.name ${CONST.OS_BOTIFY}`);
    exec('git config --local user.email infra+osbotify@expensify.com');
}

function getVersion(): string {
    const packageJson = JSON.parse(fs.readFileSync('package.json', {encoding: 'utf-8'})) as PackageJson;

    if (!packageJson.version) {
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

    // Mock various compareCommits responses with single mocked function
    jest.spyOn(GithubUtils.octokit.repos, 'compareCommits').mockImplementation((params) => {
        const base = params?.base;
        const head = params?.head;
        const tagPairKey = `${base}...${head}`;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mockCommits: any[] = (() => {
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

        return Promise.resolve({
            data: {
                commits: mockCommits,
            },
            status: 200,
            headers: {},
            url: '',
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
    });
}

function initGitServer() {
    Log.info('Initializing git server...');
    if (fs.existsSync(GIT_REMOTE)) {
        Log.info(`${GIT_REMOTE} exists, removing it now...`);
        fs.rmSync(GIT_REMOTE, {recursive: true});
    }
    fs.mkdirSync(GIT_REMOTE, {recursive: true});
    process.chdir(GIT_REMOTE);
    exec('git init -b main');
    setupGitAsHuman();
    exec('npm init -y');
    exec('npm version --no-git-tag-version 1.0.0-0');
    fs.appendFileSync('.gitignore', 'node_modules/\n');
    exec('git add -A');
    exec('git commit -m "Initial commit"');
    exec('git switch -c staging');
    exec('git switch -c production');

    // Tag the production branch with 1.0.0.0
    exec(`git tag ${getVersion()}`);

    // Bump version to 2.0.0.0
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR, true);
    exec('git branch -D staging production');
    exec('git switch -c staging');
    exec('git switch -c production');
    exec(`git tag ${getVersion()}`);
    exec(`git switch staging`);
    exec('git config --local receive.denyCurrentBranch ignore');
    Log.success(`Initialized git server in ${GIT_REMOTE}`);
}

function checkoutRepo() {
    if (fs.existsSync(DUMMY_DIR)) {
        Log.warn(`Found existing directory at ${DUMMY_DIR}, deleting it to simulate a fresh checkout...`);
        fs.rmSync(DUMMY_DIR, {recursive: true});
    }
    fs.mkdirSync(DUMMY_DIR);
    process.chdir(DUMMY_DIR);
    exec('git init');
    exec(`git remote add origin ${GIT_REMOTE}`);
    exec('git fetch --no-tags --prune --progress --no-recurse-submodules --depth=1 origin +refs/heads/main:refs/remotes/origin/main');
    exec('git checkout --progress --force -B main refs/remotes/origin/main');
    Log.success('Checked out repo at $DUMMY_DIR!');
}

function bumpVersion(level: SemverLevel, isRemote = false) {
    Log.info('Bumping version...');
    setupGitAsOSBotify();
    exec('git switch main');
    const nextVersion = VersionUpdater.incrementVersion(getVersion(), level);
    exec(`npm --no-git-tag-version version ${nextVersion}`);
    exec('git add package.json');
    exec(`git commit -m "Update version to ${nextVersion}"`);
    if (!isRemote) {
        exec('git push origin main');
    }
    Log.success(`Version bumped to ${nextVersion} on main`);
}

function updateStagingFromMain() {
    Log.info('Recreating staging from main...');
    exec('git switch main');
    try {
        execSync('git rev-parse --verify staging', {stdio: 'ignore'});
        exec('git branch -D staging');
        // eslint-disable-next-line no-empty
    } catch (e) {}
    exec('git switch -c staging');
    exec('git push --force origin staging');
    Log.success('Recreated staging from main!');
}

function updateProductionFromStaging() {
    Log.info('Recreating production from staging...');

    try {
        execSync('git rev-parse --verify staging', {stdio: 'ignore'});
    } catch (e) {
        exec('git fetch origin staging --depth=1');
    }

    exec('git switch staging');

    try {
        execSync('git rev-parse --verify production', {stdio: 'ignore'});
        exec('git branch -D production');
        // eslint-disable-next-line no-empty
    } catch (e) {}

    exec('git switch -c production');
    exec(`git tag ${getVersion()}`);
    exec('git push --force --tags origin production');
    Log.success('Recreated production from staging!');
}

function createBasicPR(num: number) {
    const branchName = `pr-${num}`;
    const content = `Changes from PR #${num}`;
    const filePath = path.resolve(process.cwd(), `PR${num}.txt`);

    Log.info(`Creating PR #${num}`);
    checkoutRepo();
    setupGitAsHuman();
    exec('git pull');
    exec(`git switch -c ${branchName}`);
    fs.appendFileSync(filePath, content);
    exec(`git add ${filePath}`);
    exec(`git commit -m "${content}"`);
    Log.success(`Created PR #${num} in branch ${branchName}`);
}

function mergePR(num: number) {
    const branchName = `pr-${num}`;

    Log.info(`Merging PR #${num} to main`);
    exec('git switch main');
    exec(`git merge ${branchName} --no-ff -m "Merge pull request #${num} from Expensify/${branchName}"`);
    exec('git push origin main');
    exec(`git branch -d ${branchName}`);
    Log.success(`Merged PR #${num} to main`);
}

function cherryPickPRToStaging(num: number, resolveVersionBumpConflicts: () => void = () => {}, resolveMergeCommitConflicts: () => void = () => {}) {
    Log.info(`Cherry-picking PR ${num} to staging...`);
    const prMergeCommit = execSync('git rev-parse HEAD', {encoding: 'utf-8'}).trim();
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.BUILD);
    const versionBumpCommit = execSync('git rev-parse HEAD', {encoding: 'utf-8'}).trim();
    checkoutRepo();
    setupGitAsOSBotify();

    mockGetInput.mockReturnValue(VersionUpdater.SEMANTIC_VERSION_LEVELS.PATCH);
    const previousPatchVersion = getPreviousVersion();

    // --shallow-exclude is used to speed up the fetch
    exec(`git fetch origin main staging --no-tags --shallow-exclude="${previousPatchVersion}"`);

    exec('git switch staging');
    exec('git switch -c cherry-pick-staging');

    try {
        exec(`git cherry-pick -x --mainline 1 ${versionBumpCommit}`);
    } catch (e) {
        resolveVersionBumpConflicts();
    }

    setupGitAsHuman();

    try {
        exec(`git cherry-pick -x --mainline 1 --strategy=recursive -Xtheirs ${prMergeCommit}`);
    } catch (e) {
        resolveMergeCommitConflicts();
    }

    setupGitAsOSBotify();
    exec('git switch staging');
    exec(`git merge cherry-pick-staging --no-ff -m "Merge pull request #${num + 1} from Expensify/cherry-pick-staging"`);
    exec('git branch -d cherry-pick-staging');
    exec('git push origin staging');
    Log.info(`Merged PR #${num + 1} into staging`);
    tagStaging();
    Log.success(`Successfully cherry-picked PR #${num} to staging!`);
}

function cherryPickPRToProduction(num: number, resolveVersionBumpConflicts: () => void = () => {}, resolveMergeCommitConflicts: () => void = () => {}) {
    Log.info(`Cherry-picking PR ${num} to production...`);
    const prMergeCommit = execSync('git rev-parse HEAD', {encoding: 'utf-8'}).trim();
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.PATCH);
    let versionBumpCommit = execSync('git rev-parse HEAD', {encoding: 'utf-8'}).trim();
    checkoutRepo();
    setupGitAsOSBotify();

    mockGetInput.mockReturnValue(VersionUpdater.SEMANTIC_VERSION_LEVELS.MINOR);
    const previousPatchVersion = getPreviousVersion();
    exec(`git fetch origin main production --no-tags --shallow-exclude="${previousPatchVersion}"`);

    exec('git switch production');
    exec('git switch -c cherry-pick-production');

    try {
        exec(`git cherry-pick -x --mainline 1 -Xtheirs ${versionBumpCommit}`);
    } catch (e) {
        resolveVersionBumpConflicts();
    }

    setupGitAsHuman();

    try {
        exec(`git cherry-pick -x --mainline 1 --strategy=recursive -Xtheirs ${prMergeCommit}`);
    } catch (e) {
        resolveMergeCommitConflicts();
    }

    setupGitAsOSBotify();
    exec('git switch production');
    exec(`git merge cherry-pick-production --no-ff -m "Merge pull request #${num + 1} from Expensify/cherry-pick-production"`);
    exec('git branch -d cherry-pick-production');
    exec('git push origin production');
    Log.info(`Merged PR #${num + 1} into production`);
    tagProduction();

    checkoutRepo();
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.BUILD);
    versionBumpCommit = execSync('git rev-parse HEAD', {encoding: 'utf-8'}).trim();
    exec(`git fetch origin staging --depth=1`);
    exec(`git switch staging`);
    exec(`git cherry-pick -x --mainline 1 -Xtheirs ${versionBumpCommit}`);
    exec('git push origin staging');
    tagStaging();
    Log.success(`Pushed to staging after CP to production`);

    Log.success(`Successfully cherry-picked PR #${num} to production!`);
}

function tagStaging() {
    Log.info('Tagging new version from the staging branch...');
    checkoutRepo();
    setupGitAsOSBotify();
    try {
        execSync('git rev-parse --verify staging', {stdio: 'ignore'});
    } catch (e) {
        exec('git fetch origin staging --depth=1');
    }
    exec('git switch staging');
    exec(`git tag ${getVersion()}-staging`);
    exec('git push --tags');
    Log.success(`Created new tag ${getVersion()}`);
}

function tagProduction() {
    Log.info('Tagging new version from the production branch...');
    Log.info(`Version is: ${getVersion()}`);
    checkoutRepo();
    setupGitAsOSBotify();
    try {
        execSync('git rev-parse --verify production', {stdio: 'ignore'});
    } catch (e) {
        exec('git fetch origin production --depth=1');
    }
    exec('git switch production');
    exec(`git tag ${getVersion()}`);
    exec('git push --tags');
    Log.success(`Created new tag ${getVersion()}`);
}

function deployStaging() {
    Log.info('Deploying staging...');
    checkoutRepo();
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.BUILD);
    updateStagingFromMain();
    tagStaging();
    Log.success(`Deployed ${getVersion()} to staging!`);
}

function deployProduction() {
    Log.info('Checklist closed, deploying production and staging...');

    Log.info('Deploying production...');
    updateProductionFromStaging();
    Log.success(`Deployed v${getVersion()} to production!`);

    Log.info('Deploying staging...');
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.PATCH);
    updateStagingFromMain();
    tagStaging();
    Log.success(`Deployed v${getVersion()} to staging!`);
}

async function assertPRsMergedBetween(from: string, to: string, expected: number[]) {
    checkoutRepo();
    const PRs = await GitUtils.getPullRequestsDeployedBetween(from, to, CONST.APP_REPO);
    expect(PRs).toStrictEqual(expected);
    Log.success(`Verified PRs merged between ${from} and ${to} are [${expected.join(',')}]`);
}

/*
 * These tests are different from most jest tests. They create a dummy git repo and simulate the GitHub Actions CI environment
 * and ensure that deploy checklists, comments, and releases are created correctly and completely,
 * including a number of real-world edge cases we have encountered and fixed.
 *
 * However, because they are different, there are a few additional "rules" with these tests:
 *   - They should not be run in parallel with other tests on the same machine. They will not play nicely with other tests.
 *   - The whole suite should be run. Running individual tests from the suite may not work as expected.
 */

let startingDir: string;
describe('CIGitLogic', () => {
    beforeAll(() => {
        Log.info('Starting setup');
        startingDir = process.cwd();
        initGitServer();
        initGithubAPIMocking();
        checkoutRepo();
        Log.success('Setup complete!');
    });

    afterAll(() => {
        jest.restoreAllMocks();
        fs.rmSync(DUMMY_DIR, {recursive: true, force: true});
        fs.rmSync(path.resolve(GIT_REMOTE, '..'), {recursive: true, force: true});
        process.chdir(startingDir);
    });

    test('Merge a pull request while the checklist is unlocked', async () => {
        createBasicPR(1);
        mergePR(1);
        deployStaging();

        // Verify output for checklist and deploy comment
        await assertPRsMergedBetween('2.0.0-0', '2.0.0-1-staging', [1]);
    });

    test("Merge a pull request with the checklist locked, but don't CP it", async () => {
        createBasicPR(2);
        mergePR(2);

        // Verify output for checklist and deploy comment, and make sure PR #2 is not on staging
        await assertPRsMergedBetween('2.0.0-0', '2.0.0-1-staging', [1]);
    });

    test('Merge a pull request with the checklist locked and CP it to staging', async () => {
        createBasicPR(3);
        mergePR(3);
        cherryPickPRToStaging(3);

        // Verify output for checklist
        await assertPRsMergedBetween('2.0.0-0', '2.0.0-2-staging', [1, 3]);

        // Verify output for deploy comment, and make sure PR #2 is not on staging
        await assertPRsMergedBetween('2.0.0-1-staging', '2.0.0-2-staging', [3]);
    });

    test('Merge a pull request with the checklist locked and CP it to production', async () => {
        createBasicPR(5);
        mergePR(5);
        cherryPickPRToProduction(5);

        // Verify output for checklist
        await assertPRsMergedBetween('2.0.0-0', '2.0.1-1-staging', [1, 3]);

        // Verify output for deploy comment
        await assertPRsMergedBetween('2.0.0-0', '2.0.1-0', [5]);
    });

    test('Close the checklist, deploy production and staging', async () => {
        deployProduction();

        // Verify output for release body and production deploy comments
        await assertPRsMergedBetween('2.0.0-0', '2.0.1-1', [1, 3]);

        // Verify output for new checklist and staging deploy comments
        await assertPRsMergedBetween('2.0.0-2-staging', '2.0.2-0-staging', [2, 5]);
    });

    test('Merging another pull request when the checklist is unlocked', async () => {
        createBasicPR(6);
        mergePR(6);
        deployStaging();

        // Verify output for checklist
        await assertPRsMergedBetween('2.0.0-2-staging', '2.0.2-1-staging', [2, 5, 6]);

        // Verify output for deploy comment
        await assertPRsMergedBetween('2.0.2-0-staging', '2.0.2-1-staging', [6]);
    });

    test('Deploying a PR, then CPing a revert, then adding the same code back again before the next production deploy results in the correct code on staging and production', async () => {
        Log.info('Creating myFile.txt in PR #7');
        setupGitAsHuman();
        exec('git switch main');
        exec('git switch -c pr-7');
        const initialFileContent = 'Changes from PR #7';
        fs.appendFileSync('myFile.txt', 'Changes from PR #7');
        exec('git add myFile.txt');
        exec('git commit -m "Add myFile.txt in PR #7"');

        mergePR(7);
        deployStaging();

        // Verify output for checklist
        await assertPRsMergedBetween('2.0.0-2-staging', '2.0.2-2-staging', [2, 5, 6, 7]);

        // Verify output for deploy comment
        await assertPRsMergedBetween('2.0.2-1-staging', '2.0.2-2-staging', [7]);

        Log.info('Appending and prepending content to myFile.txt in PR #8');
        setupGitAsHuman();
        exec('git switch main');
        exec('git switch -c pr-8');
        const newFileContent = `
Prepended content
${initialFileContent}
Appended content
`;
        fs.writeFileSync('myFile.txt', newFileContent, {encoding: 'utf-8'});
        exec('git add myFile.txt');
        exec('git commit -m "Append and prepend content in myFile.txt"');
        mergePR(8);
        deployStaging();

        // Verify output for checklist
        await assertPRsMergedBetween('2.0.0-2-staging', '2.0.2-3-staging', [2, 5, 6, 7, 8]);

        // Verify output for deploy comment
        await assertPRsMergedBetween('2.0.2-2-staging', '2.0.2-3-staging', [8]);

        Log.info('Making an unrelated change in PR #9');
        setupGitAsHuman();
        exec('git switch main');
        exec('git switch -c pr-9');
        fs.appendFileSync('anotherFile.txt', 'some content');
        exec('git add anotherFile.txt');
        exec('git commit -m "Create another file"');
        mergePR(9);

        Log.info('Reverting the append + prepend on main in PR #10');
        setupGitAsHuman();
        exec('git switch main');
        exec('git switch -c pr-10');
        fs.writeFileSync('myFile.txt', initialFileContent);
        exec('git add myFile.txt');
        exec('git commit -m "Revert append and prepend"');
        mergePR(10);
        cherryPickPRToStaging(10);

        Log.info('Verifying that the revert is present on staging, but the unrelated change is not');
        expect(fs.readFileSync('myFile.txt', {encoding: 'utf8'})).toBe(initialFileContent);
        expect(fs.existsSync('anotherFile.txt')).toBe(false);

        Log.info('Repeating previously reverted append + prepend on main in PR #10');
        setupGitAsHuman();
        exec('git switch main');
        exec('git switch -c pr-11');
        fs.writeFileSync('myFile.txt', newFileContent, {encoding: 'utf-8'});
        exec('git add myFile.txt');
        exec('git commit -m "Append and prepend content in myFile.txt"');

        mergePR(11);
        deployProduction();

        // Verify production release list
        await assertPRsMergedBetween('2.0.1-1', '2.0.2-4', [2, 5, 6, 7, 8, 10]);

        // Verify PR list for the new checklist
        await assertPRsMergedBetween('2.0.2-4-staging', '2.0.3-0-staging', [9, 11]);
    });

    test('Force-pushing to a branch after rebasing older commits', async () => {
        createBasicPR(12);
        exec('git push origin pr-12');
        createBasicPR(13);
        mergePR(13);
        deployStaging();

        // Verify PRs for checklist
        await assertPRsMergedBetween('2.0.2-4-staging', '2.0.3-1-staging', [9, 11, 13]);

        // Verify PRs for deploy comments
        await assertPRsMergedBetween('2.0.3-0-staging', '2.0.3-1-staging', [13]);

        checkoutRepo();
        setupGitAsHuman();
        exec('git fetch origin pr-12');
        exec('git switch pr-12');
        exec('git rebase main -Xours');
        exec('git push --force origin pr-12');
        mergePR(12);

        deployProduction();

        // Verify PRs for deploy comments / release
        await assertPRsMergedBetween('2.0.2-4-staging', '2.0.3-1-staging', [9, 11, 13]);

        // Verify PRs for new checklist
        await assertPRsMergedBetween('2.0.3-1-staging', '2.0.4-0-staging', [12]);
    });

    test('Manual version bump', async () => {
        Log.info('Creating manual version bump in PR #14');
        checkoutRepo();
        setupGitAsHuman();
        exec('git pull');
        exec('git switch -c "pr-14"');
        for (let i = 0; i < 3; i++) {
            exec(`npm --no-git-tag-version version ${VersionUpdater.incrementVersion(getVersion(), VersionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR)}`);
        }
        exec('git add package.json');
        exec(`git commit -m "Manually bump version to ${getVersion()} in PR #14"`);
        Log.success('Created manual version bump in PR #13 in branch pr-14');

        mergePR(14);
        Log.info('Deploying staging...');
        checkoutRepo();
        updateStagingFromMain();
        tagStaging();
        Log.success(`Deployed v${getVersion()} to staging!`);

        // Verify PRs for deploy comments / release and new checklist
        await assertPRsMergedBetween('2.0.4-0-staging', '5.0.0-0-staging', [14]);

        Log.info('Creating manual version bump in PR #15');
        checkoutRepo();
        setupGitAsHuman();
        exec('git pull');
        exec('git switch -c "pr-15"');
        for (let i = 0; i < 3; i++) {
            exec(`npm --no-git-tag-version version ${VersionUpdater.incrementVersion(getVersion(), VersionUpdater.SEMANTIC_VERSION_LEVELS.MAJOR)}`);
        }
        exec('git add package.json');
        exec(`git commit -m "Manually bump version to ${getVersion()} in PR #15"`);
        Log.success('Created manual version bump in PR #15 in branch pr-15');

        const packageJSONBefore = fs.readFileSync('package.json', {encoding: 'utf-8'});
        mergePR(15);
        cherryPickPRToStaging(
            15,
            () => {
                fs.writeFileSync('package.json', packageJSONBefore);
                exec('git add package.json');
                exec('git cherry-pick --no-edit --continue');
            },
            () => {
                exec('git commit --no-edit --allow-empty');
            },
        );

        // Verify PRs for deploy comments
        await assertPRsMergedBetween('5.0.0-0-staging', '8.0.0-0-staging', [15]);

        // Verify PRs for the deploy checklist
        await assertPRsMergedBetween('2.0.4-0-staging', '8.0.0-0-staging', [14, 15]);
    });
});

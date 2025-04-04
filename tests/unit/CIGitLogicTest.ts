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
import GitUtils from '@github/libs/GitUtils';
import * as VersionUpdater from '@github/libs/versionUpdater';
import type {SemverLevel} from '@github/libs/versionUpdater';
import asMutable from '@src/types/utils/asMutable';
import * as Log from '../../scripts/utils/Logger';

const DUMMY_DIR = path.resolve(os.homedir(), 'DumDumRepo');
const GIT_REMOTE = path.resolve(os.homedir(), 'dummyGitRemotes/DumDumRepo');

const mockGetInput = jest.fn();

type ExecSyncError = {stderr: Buffer};

function exec(command: string) {
    try {
        Log.info(command);
        execSync(command, {stdio: 'inherit'});
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

function initGitServer() {
    Log.info('Initializing git server...');
    if (fs.existsSync(GIT_REMOTE)) {
        Log.info(`${GIT_REMOTE} exists, remove it now...`);
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
    exec(`git tag ${getVersion()}`);
    exec('git branch production');
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

function bumpVersion(level: SemverLevel) {
    Log.info('Bumping version...');
    setupGitAsOSBotify();
    exec('git switch main');
    const nextVersion = VersionUpdater.incrementVersion(getVersion(), level);
    exec(`npm --no-git-tag-version version ${nextVersion}`);
    exec('git add package.json');
    exec(`git commit -m "Update version to ${nextVersion}"`);
    exec('git push origin main');
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
    exec('git push --force origin production');
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
    mergePR(num);
    const prMergeCommit = execSync('git rev-parse HEAD', {encoding: 'utf-8'}).trim();
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.BUILD);
    const versionBumpCommit = execSync('git rev-parse HEAD', {encoding: 'utf-8'}).trim();
    checkoutRepo();
    setupGitAsOSBotify();

    mockGetInput.mockReturnValue(VersionUpdater.SEMANTIC_VERSION_LEVELS.PATCH);
    const previousPatchVersion = getPreviousVersion();
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
    mergePR(num);
    const prMergeCommit = execSync('git rev-parse HEAD', {encoding: 'utf-8'}).trim();
    bumpVersion(VersionUpdater.SEMANTIC_VERSION_LEVELS.BUILD);
    const versionBumpCommit = execSync('git rev-parse HEAD', {encoding: 'utf-8'}).trim();
    checkoutRepo();
    setupGitAsOSBotify();

    mockGetInput.mockReturnValue(VersionUpdater.SEMANTIC_VERSION_LEVELS.PATCH);
    const previousPatchVersion = getPreviousVersion();
    exec(`git fetch origin main production --no-tags --shallow-exclude="${previousPatchVersion}"`);

    exec('git switch production');
    exec('git switch -c cherry-pick-production');

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
    exec('git switch production');
    exec(`git merge cherry-pick-production --no-ff -m "Merge pull request #${num + 1} from Expensify/cherry-pick-production"`);
    exec('git branch -d cherry-pick-production');
    exec('git push origin production');
    Log.info(`Merged PR #${num + 1} into production`);
    tagProduction();
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
    exec(`git tag ${getVersion()}`);
    exec('git push --tags');
    Log.success(`Created new tag ${getVersion()}`);
}

function tagProduction() {
    Log.info('Tagging new version from the production branch...');
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
    const PRs = await GitUtils.getPullRequestsMergedBetween(from, to);
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
        checkoutRepo();
        Log.success('Setup complete!');

        // Mock core module
        asMutable(core).getInput = mockGetInput;
    });

    afterAll(() => {
        fs.rmSync(DUMMY_DIR, {recursive: true, force: true});
        fs.rmSync(path.resolve(GIT_REMOTE, '..'), {recursive: true, force: true});
        process.chdir(startingDir);
    });

    test('Merge a pull request while the checklist is unlocked', async () => {
        createBasicPR(1);
        mergePR(1);
        deployStaging();

        // Verify output for checklist and deploy comment
        await assertPRsMergedBetween('1.0.0-0', '1.0.0-1', [1]);
    });

    test("Merge a pull request with the checklist locked, but don't CP it", () => {
        createBasicPR(2);
        mergePR(2);
    });

    test('Merge a pull request with the checklist locked and CP it', async () => {
        updateProductionFromStaging();
        createBasicPR(3);
        cherryPickPRToProduction(3);

        // Verify output for checklist
        await assertPRsMergedBetween('1.0.0-0', '1.0.0-2', [1, 3]);

        // Verify output for deploy comment
        await assertPRsMergedBetween('1.0.0-1', '1.0.0-2', [3]);
    });
});

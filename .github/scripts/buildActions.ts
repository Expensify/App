#!/usr/bin/env bun

/**
 * Precompiles all GitHub Action TypeScript sources with esbuild, bundling them with their
 * dependencies into a single executable node.js script per action.
 */
import {build} from 'esbuild';
import {readFile, writeFile} from 'fs/promises';
import path from 'path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const ACTIONS_DIR = path.join(REPO_ROOT, '.github', 'actions', 'javascript');
const TSCONFIG = path.join(REPO_ROOT, '.github', 'tsconfig.json');

// List of paths to all JS files that implement our GH Actions
const GITHUB_ACTIONS = [
    'authorChecklist/authorChecklist.ts',
    'awaitStagingDeploys/awaitStagingDeploys.ts',
    'bumpVersion/bumpVersion.ts',
    'checkAndroidStatus/checkAndroidStatus.ts',
    'checkDeployBlockers/checkDeployBlockers.ts',
    'checkSVGCompression/checkSVGCompression.ts',
    'failureNotifier/failureNotifier.ts',
    'formatCodeCovComment/formatCodeCovComment.ts',
    'getAndroidRolloutPercentage/getAndroidRolloutPercentage.ts',
    'getArtifactInfo/getArtifactInfo.ts',
    'getDeployPullRequestList/getDeployPullRequestList.ts',
    'getPreviousVersion/getPreviousVersion.ts',
    'getPullRequestDetails/getPullRequestDetails.ts',
    'getPullRequestIncrementalChanges/getPullRequestIncrementalChanges.ts',
    'isAuthorizedContributor/isAuthorizedContributor.ts',
    'isDeployChecklistLocked/isDeployChecklistLocked.ts',
    'markPullRequestsAsDeployed/markPullRequestsAsDeployed.ts',
    'postOrReplaceComment/postOrReplaceComment.ts',
    'proposalPoliceComment/proposalPoliceComment.ts',
    'reopenIssueWithComment/reopenIssueWithComment.ts',
    'reviewerChecklist/reviewerChecklist.ts',
    'validateReassureOutput/validateReassureOutput.ts',
    'verifySignedCommits/verifySignedCommits.ts',
    'waitForPreviousRuns/waitForPreviousRuns.ts',
].map((relativePath) => path.join(ACTIONS_DIR, relativePath));

// This will be prepended to the top of all compiled files as a warning to devs.
const COMPILED_FILE_BANNER = `/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
`;

async function buildAction(actionPath: string): Promise<boolean> {
    const actionDir = path.dirname(actionPath);
    const outfile = path.join(actionDir, 'index.js');

    try {
        await build({
            entryPoints: [actionPath],
            outfile,
            bundle: true,
            platform: 'node',
            target: 'node24',
            format: 'cjs',
            splitting: false,
            sourcemap: false,
            external: ['encoding'],
            tsconfig: TSCONFIG,
            logLevel: 'silent',
        });

        const bundled = await readFile(outfile, 'utf8');
        await writeFile(outfile, COMPILED_FILE_BANNER + bundled);
        return true;
    } catch (error) {
        console.error(`❌ ${actionPath} failed to build:`, error);
        return false;
    }
}

async function main() {
    const results = await Promise.all(GITHUB_ACTIONS.map(buildAction));

    if (results.includes(false)) {
        process.exit(1);
    }
}

main();

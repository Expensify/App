#!/usr/bin/env bun
/**
 * Precompiles all GitHub Action TypeScript sources with esbuild, bundling them with their
 * dependencies into a single executable node.js script per action.
 */
import {build} from 'esbuild';
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
const NOTE_DONT_EDIT = `/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
`;

async function buildAction(actionPath: string): Promise<void> {
    const actionDir = path.dirname(actionPath);
    const outfile = path.join(actionDir, 'index.js');

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

    const bundled = await Bun.file(outfile).text();
    await Bun.write(outfile, NOTE_DONT_EDIT + bundled);
}

async function main() {
    const results = await Promise.allSettled(GITHUB_ACTIONS.map(buildAction));

    let hasFailure = false;
    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'rejected') {
            hasFailure = true;
            console.error(`❌ ${GITHUB_ACTIONS[i]} failed to build:`, result.reason);
        }
    }

    if (hasFailure) {
        process.exit(1);
    }
}

main();

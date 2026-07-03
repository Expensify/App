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
    'generateHelpPreviewComment/generateHelpPreviewComment.ts',
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

// Our bundles are real ESM (see .github/actions/javascript/package.json's "type": "module"), but several
// dependencies (e.g. @actions/core, googleapis, lodash, semver, @babel/parser) are still CJS and call
// require() on Node builtins internally. esbuild can't provide a `require` in ESM output on its own, so we
// shim one in via createRequire, scoped to each bundle's own import.meta.url.
const REQUIRE_SHIM_BANNER = "import {createRequire as __createRequire} from 'module'; const require = __createRequire(import.meta.url);";

// Some dependencies must be left external (i.e. resolved from node_modules at runtime) instead of bundled.
// Keyed by the action's entry point path (relative to ACTIONS_DIR, matching GITHUB_ACTIONS below). A Map (rather
// than an object literal) sidesteps the naming-convention lint rule, since these keys are file paths, not identifiers.
const EXTRA_EXTERNALS = new Map<string, string[]>([['checkSVGCompression/checkSVGCompression.ts', ['svgo']]]);

async function buildAction(actionPath: string): Promise<boolean> {
    const actionDir = path.dirname(actionPath);
    const outfile = path.join(actionDir, 'index.js');
    const relativeActionPath = path.relative(ACTIONS_DIR, actionPath);

    try {
        await build({
            entryPoints: [actionPath],
            outfile,
            bundle: true,
            platform: 'node',
            target: 'node24',
            format: 'esm',
            splitting: false,
            sourcemap: false,
            external: ['encoding', ...(EXTRA_EXTERNALS.get(relativeActionPath) ?? [])],
            banner: {js: REQUIRE_SHIM_BANNER},
            // .mts is used by scripts/compressSvg.mts and scripts/bumpVersion.mts, which need unambiguous ESM (so
            // they can statically import ESM-only deps like svgo) when run directly under ts-node.
            resolveExtensions: ['.mts', '.tsx', '.ts', '.mjs', '.jsx', '.js', '.css', '.json'],
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

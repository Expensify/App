import * as core from '@actions/core';
import {context} from '@actions/github';
import type {PullRequestEvent, PullRequestSynchronizeEvent} from '@octokit/webhooks-types';
import {getJSONInput} from '@github/libs/ActionUtils';
import CONST from '@github/libs/CONST';
import GitHubUtils from '@github/libs/GithubUtils';
import Git from '@scripts/utils/Git';
import type {FileDiff} from '@scripts/utils/Git';

/**
 * Main function to check all specified files
 */
async function run(): Promise<void> {
    const filePathsInput = getJSONInput('FILE_PATHS', {required: false}) as string[] | undefined;
    const pullRequestNumberInput = getJSONInput('PULL_REQUEST_NUMBER', {required: false}) as number | undefined;

    let prNumber: number;
    let isOpenedAction = false;

    if (pullRequestNumberInput) {
        // PULL_REQUEST_NUMBER provided - treat as opened action regardless of event type
        prNumber = pullRequestNumberInput;
        isOpenedAction = true;
        console.log(`🔢 Using provided PR number ${prNumber} - treating as opened action`);
    } else {
        // No PULL_REQUEST_NUMBER - must be a pull_request event
        if (context.eventName !== 'pull_request') {
            throw new Error(`This action can only be run on pull_request events, but was run on: ${context.eventName}. Provide PULL_REQUEST_NUMBER input to use with other event types.`);
        }

        const eventPayload = context.payload as PullRequestEvent;
        prNumber = eventPayload.pull_request.number;
        isOpenedAction = eventPayload.action === 'opened';

        // Validate that it's an opened or synchronize action
        if (eventPayload.action !== 'opened' && eventPayload.action !== 'synchronize') {
            throw new Error(`This action can only be run on pull_request opened or synchronize events, but was run on: ${eventPayload.action}`);
        }
    }

    let changedFiles: string[] = [];
    if (isOpenedAction) {
        console.log('🆕 PR treated as opened, including all files in the PR');
        changedFiles = (
            await GitHubUtils.paginate(GitHubUtils.octokit.pulls.listFiles, {
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                pull_number: prNumber,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                per_page: 100,
            })
        ).map((file) => file.filename);

        if (filePathsInput) {
            changedFiles = changedFiles.filter((file) => filePathsInput.includes(file));
        }
    } else {
        console.log('🔄 PR was updated, checking only the new commits');

        // For synchronize events, we need before/after SHAs from the payload
        if (context.eventName !== 'pull_request' || context.payload.action !== 'synchronize') {
            throw new Error('Synchronize logic requires pull_request event context');
        }

        const eventPayload = context.payload as PullRequestSynchronizeEvent;
        const beforeSha = eventPayload.before;
        const afterSha = eventPayload.after;

        // Ensure we have valid git refs, fetching them if needed
        console.log(`🔍 Checking for local changes with push range ${beforeSha}..${afterSha}${filePathsInput ? `, looking for files ${JSON.stringify(filePathsInput)}` : ''}`);
        await Promise.all([Git.ensureRef(beforeSha), Git.ensureRef(afterSha)]);

        // Do local git diff to see what files actually changed in the push
        const localDiff = Git.diff(beforeSha, afterSha, filePathsInput);
        const localChangedFiles = new Map<string, FileDiff>();
        for (const file of localDiff.files) {
            localChangedFiles.set(file.filePath, file);
        }

        console.log(`📝 Found ${localChangedFiles.size} files with local changes in push`);

        // If no files changed locally, we can skip all API calls
        if (localChangedFiles.size === 0) {
            console.log(`⏭️ No files changed in push - skipping API validation`);
            core.setOutput('CHANGED_FILES', JSON.stringify([]));
            return;
        }

        // Now we know there are local changes - get PR diff from the GitHub API to compare
        console.log(`🌐 Using GitHub API to validate ${localChangedFiles.size} files with local changes`);
        const prDiff = Git.parseDiff(await GitHubUtils.getPullRequestDiff(prNumber));

        // Compare the local push diff with the PR diff and collect changed files, checking for overlapping content changes at the line level
        for (const prFileDiff of prDiff.files) {
            const filePath = prFileDiff.filePath;

            const localFileDiff = localChangedFiles.get(filePath);
            if (!localFileDiff) {
                continue; // File not in local changes
            }

            // Extract all modified content from both diffs (regardless of add/remove)
            const localModifiedContent = new Set<string>();
            const prModifiedContent = new Set<string>();

            // Get local diff content
            for (const hunk of localFileDiff.hunks) {
                for (const line of hunk.lines) {
                    localModifiedContent.add(line.content);
                }
            }

            // Get PR diff content
            for (const hunk of prFileDiff.hunks) {
                for (const line of hunk.lines) {
                    prModifiedContent.add(line.content);
                }
            }

            // Check if any content overlaps between push and PR
            const hasOverlappingContent = Array.from(localModifiedContent).some((content) => prModifiedContent.has(content));

            if (hasOverlappingContent) {
                console.log(`✅ ${filePath} has overlapping content changes in both push and PR`);
                changedFiles.push(filePath);
            } else {
                console.log(`⏭️ ${filePath} has changes in both push and PR but no overlapping content - likely from merged commits`);
            }
        }
    }

    console.log(`📈 Total files changed: ${changedFiles.length}`);
    core.startGroup('📊 Changed files:');
    console.log(changedFiles);
    core.endGroup();

    // Set output
    core.setOutput('CHANGED_FILES', JSON.stringify(changedFiles));
    core.setOutput('HAS_CHANGES', changedFiles.length > 0);
}

if (require.main === module) {
    run().catch((error) => {
        console.error('Action failed:', error);
        core.setFailed(error instanceof Error ? error.message : String(error));
    });
}

export default run;

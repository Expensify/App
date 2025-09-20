import * as core from '@actions/core';
import {context} from '@actions/github';
import {getJSONInput} from '@github/libs/ActionUtils';
import GitHubUtils from '@github/libs/GithubUtils';
import Git from '@scripts/utils/Git';
import type {FileDiff} from '@scripts/utils/Git';

/**
 * Main function to check all specified files
 */
async function run(): Promise<void> {
    // Ensure this is a pull_request event
    if (context.eventName !== 'pull_request') {
        throw new Error(`This action can only be run on pull_request events, but was run on: ${context.eventName}`);
    }

    // Get PR information from GitHub context
    const pullRequestNumber = context.payload.pull_request?.number;
    const beforeSha = context.payload.before as string;
    const afterSha = context.payload.after as string;

    // Ensure we have valid git refs, fetching them if needed
    const filePathsInput = getJSONInput('FILE_PATHS', {required: false}) as string[] | undefined;
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
    const prDiff = Git.parseDiff(await GitHubUtils.getPullRequestDiff(pullRequestNumber));

    // Compare the local push diff with the PR diff and collect changed files
    const changedFiles: string[] = [];

    // Cross-check files that have overlapping content changes
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

    // Set output
    core.setOutput('CHANGED_FILES', JSON.stringify(changedFiles));

    console.log(`📈 Total files changed: ${changedFiles.length}`);
    core.startGroup('📊 Changed files:');
    console.log(changedFiles);
    core.endGroup();
}

if (require.main === module) {
    run().catch((error) => {
        console.error('Action failed:', error);
        core.setFailed(error instanceof Error ? error.message : String(error));
    });
}

export default run;

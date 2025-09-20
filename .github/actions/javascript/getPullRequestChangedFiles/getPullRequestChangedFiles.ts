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
        core.setOutput('FILES_CHANGED', JSON.stringify(Object.fromEntries((filePathsInput ?? []).map((f) => [f, false]))));
        core.setOutput('ANY_CHANGED', 'false');
        return;
    }

    // Now we know there are local changes - get PR diff from the GitHub API to compare
    console.log(`🌐 Using GitHub API to validate ${localChangedFiles.size} files with local changes`);
    const prDiff = Git.parseDiff(await GitHubUtils.getPullRequestDiff(pullRequestNumber));

    // Compare the local push diff with the PR diff
    const results: Record<string, boolean> = {};
    let anyChanged = false;

    // Cross-check the files changed in the PR diff with the local changed files at the line level
    for (const prFileDiff of prDiff.files) {
        const filePath = prFileDiff.filePath;

        const localFile = localChangedFiles.get(filePath);
        if (!localFile) {
            results[filePath] = false;
            continue;
        }

        // File exists in both diffs - now check if any lines overlap
        // Extract added and removed content from both diffs
        const localAddedLines = new Set<number>();
        const localRemovedLines = new Set<number>();
        const prAddedLines = new Set<number>();
        const prRemovedLines = new Set<number>();

        // Get local diff content
        for (const hunk of localFile.hunks) {
            for (const line of hunk.lines) {
                if (line.type === 'added') {
                    localAddedLines.add(line.number);
                } else if (line.type === 'removed') {
                    localRemovedLines.add(line.number);
                }
            }
        }

        // Get PR diff content
        for (const hunk of prFileDiff.hunks) {
            for (const line of hunk.lines) {
                if (line.type === 'added') {
                    prAddedLines.add(line.number);
                } else if (line.type === 'removed') {
                    prRemovedLines.add(line.number);
                }
            }
        }

        // Check if any lines overlap between push and PR
        const hasOverlappingAddedLines = Array.from(localAddedLines).some((line) => prAddedLines.has(line));
        const hasOverlappingRemovedLines = Array.from(localRemovedLines).some((line) => prRemovedLines.has(line));

        const isChanged = hasOverlappingAddedLines || hasOverlappingRemovedLines;

        if (isChanged) {
            console.log(`✅ ${filePath} has overlapping line changes in both push and PR`);
        } else {
            console.log(`⏭️ ${filePath} has changes in both push and PR but no overlapping lines - likely from merged commits`);
        }

        results[filePath] = isChanged;
        if (isChanged) {
            anyChanged = true;
        }
    }

    // Set outputs
    core.setOutput('FILES_CHANGED', JSON.stringify(results));
    core.setOutput('ANY_CHANGED', anyChanged.toString());

    console.log(`📊 Results: ${JSON.stringify(results)}`);
    console.log(`📈 Any files changed: ${anyChanged}`);
}

if (require.main === module) {
    run().catch((error) => {
        console.error('Action failed:', error);
        core.setFailed(error instanceof Error ? error.message : String(error));
    });
}

export default run;

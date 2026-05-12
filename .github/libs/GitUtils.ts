import * as core from '@actions/core';
import {execSync} from 'child_process';
import CONST from './CONST';
import GithubUtils from './GithubUtils';
import type {CommitType} from './GithubUtils';
import {getPreviousVersion} from './versionUpdater';
import type {SemverLevel} from './versionUpdater';

type MergedPR = {
    prNumber: number;
    date: string;
};

type SubmoduleUpdate = {
    version: string;
    date: string;
    commit: string;
};

/**
 * Check if a tag exists locally or in the remote.
 */
function tagExists(tag: string) {
    try {
        // Check if the tag exists locally
        execSync(`git show-ref --tags ${tag}`, {stdio: 'ignore'});
        return true; // Tag exists locally
    } catch (error) {
        // Tag does not exist locally, check in remote
        let shouldRetry = true;
        let needsRepack = false;
        let doesTagExist = false;
        while (shouldRetry) {
            try {
                if (needsRepack) {
                    // We have seen some scenarios where this fixes the git fetch.
                    // Why? Who knows... https://github.com/Expensify/App/pull/31459
                    execSync('git repack -d', {stdio: 'inherit'});
                }
                execSync(`git ls-remote --exit-code --tags origin ${tag}`, {stdio: 'ignore'});
                doesTagExist = true;
                shouldRetry = false;
            } catch (e) {
                if (!needsRepack) {
                    console.log('Attempting to repack and retry...');
                    needsRepack = true;
                } else {
                    console.error("Repack didn't help, giving up...");
                    shouldRetry = false;
                }
            }
        }
        return doesTagExist;
    }
}

/**
 * This essentially just calls getPreviousVersion in a loop, until it finds a version for which a tag exists.
 * It's useful if we manually perform a version bump, because in that case a tag may not exist for the previous version.
 *
 * @param tag the current tag
 * @param level the Semver level to step backward by
 */
function getPreviousExistingTag(tag: string, level: SemverLevel) {
    let previousVersion = getPreviousVersion(tag.replace('-staging', ''), level);
    let tagExistsForPreviousVersion = false;
    while (!tagExistsForPreviousVersion) {
        if (tagExists(previousVersion)) {
            tagExistsForPreviousVersion = true;
            break;
        }
        if (tagExists(`${previousVersion}-staging`)) {
            tagExistsForPreviousVersion = true;
            previousVersion = `${previousVersion}-staging`;
            break;
        }
        console.log(`Tag for previous version ${previousVersion} does not exist. Checking for an older version...`);
        previousVersion = getPreviousVersion(previousVersion, level);
    }
    return previousVersion;
}

/**
 * Extract Mobile-Expensify submodule update commits from the commit history.
 * Matches both version-based ("Update Mobile-Expensify submodule version to 9.3.21-0")
 * and hash-based ("Update Mobile-Expensify submodule to 9f18fca") patterns.
 */
function getSubmoduleUpdates(commits: CommitType[]): SubmoduleUpdate[] {
    const updates: SubmoduleUpdate[] = [];
    for (const commit of commits) {
        const match = commit.subject.match(/^Update Mobile-Expensify submodule (?:version )?to (.+)$/);
        if (match) {
            updates.push({
                version: match[1],
                date: commit.date,
                commit: commit.commit,
            });
        }
    }
    return updates;
}

/**
 * Parse merged PRs, excluding those from irrelevant branches.
 */
function getValidMergedPRs(commits: CommitType[]): MergedPR[] {
    const mergedPRs = new Map<number, string>();
    for (const commit of commits) {
        const author = commit.authorName;
        if (author === CONST.OS_BOTIFY) {
            continue;
        }

        // Retrieve the PR number from the commit subject,
        const match = commit.subject.match(/Merge pull request #(\d+) from (?!Expensify\/.*-cherry-pick-(staging|production))/);
        if (!Array.isArray(match) || match.length < 2) {
            continue;
        }

        const pr = Number.parseInt(match[1], 10);
        if (mergedPRs.has(pr)) {
            // If a PR shows up in the log twice, that means that the PR was deployed in the previous checklist.
            // That also means that we don't want to include it in the current checklist, so we remove it now.
            mergedPRs.delete(pr);
            continue;
        }

        mergedPRs.set(pr, commit.date);
    }

    return Array.from(mergedPRs.entries()).map(([prNumber, date]) => ({prNumber, date}));
}

type MergedPRsResult = {
    mergedPRs: MergedPR[];
    submoduleUpdates: SubmoduleUpdate[];
};

/**
 * Takes in two git tags and returns a list of merged PRs entries between those two tags,
 * along with any Mobile-Expensify submodule version updates found in the commit history.
 * Returns PRs in the order they appear in the commit history from the GitHub API.
 */
async function getMergedPRsDeployedBetween(fromTag: string, toTag: string, repositoryName: string): Promise<MergedPRsResult> {
    console.log(`Looking for commits made between ${fromTag} and ${toTag}...`);
    const apiCommitList = await GithubUtils.getCommitHistoryBetweenTags(fromTag, toTag, repositoryName);
    const mergedPRs = getValidMergedPRs(apiCommitList);
    const submoduleUpdates = getSubmoduleUpdates(apiCommitList);

    console.log(`Found ${apiCommitList.length} commits.`);
    core.startGroup('Parsed PRs:');
    core.info(mergedPRs.map((pr) => pr.prNumber).join(', '));
    core.endGroup();

    if (submoduleUpdates.length > 0) {
        core.startGroup('Submodule updates:');
        core.info(submoduleUpdates.map((u) => u.version).join(', '));
        core.endGroup();
    }

    return {mergedPRs, submoduleUpdates};
}

/**
 * Takes in two git tags and returns a list of PR numbers of all PRs merged between those two tags.
 */
async function getPullRequestsDeployedBetween(fromTag: string, toTag: string, repositoryName: string): Promise<number[]> {
    const {mergedPRs} = await getMergedPRsDeployedBetween(fromTag, toTag, repositoryName);
    return mergedPRs.map((pr) => pr.prNumber).sort((a, b) => a - b);
}

export default {
    getPreviousExistingTag,
    getValidMergedPRs,
    getSubmoduleUpdates,
    getPullRequestsDeployedBetween,
    getMergedPRsDeployedBetween,
};
export type {CommitType, MergedPR, SubmoduleUpdate};

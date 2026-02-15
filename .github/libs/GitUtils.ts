import * as core from '@actions/core';
import {execSync} from 'child_process';
import CONST from './CONST';
import GithubUtils from './GithubUtils';
import {getPreviousVersion} from './versionUpdater';
import type {SemverLevel} from './versionUpdater';

type CommitType = {
    commit: string;
    subject: string;
    authorName: string;
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
 * Parse merged PRs, excluding those from irrelevant branches.
 */
function getValidMergedPRs(commits: CommitType[]): number[] {
    const mergedPRs = new Set<number>();
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

        mergedPRs.add(pr);
    }

    return Array.from(mergedPRs);
}

/**
 * Takes in two git tags and returns a list of PR numbers of all PRs merged between those two tags
 */
async function getPullRequestsDeployedBetween(fromTag: string, toTag: string, repositoryName: string) {
    console.log(`Looking for commits made between ${fromTag} and ${toTag}...`);
    const apiCommitList = await GithubUtils.getCommitHistoryBetweenTags(fromTag, toTag, repositoryName);
    const apiPullRequestNumbers = getValidMergedPRs(apiCommitList).sort((a, b) => a - b);

    console.log(`Found ${apiCommitList.length} commits.`);
    core.startGroup('Parsed PRs:');
    core.info(apiPullRequestNumbers.join(', '));
    core.endGroup();

    return apiPullRequestNumbers;
}

export default {
    getPreviousExistingTag,
    getValidMergedPRs,
    getPullRequestsDeployedBetween,
};
export type {CommitType};

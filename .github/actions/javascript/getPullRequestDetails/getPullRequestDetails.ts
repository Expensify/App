import * as core from '@actions/core';
import {getJSONInput} from '@github/libs/ActionUtils';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type PullRequest = Awaited<ReturnType<typeof GithubUtils.octokit.pulls.get>>['data'];

const DEFAULT_PAYLOAD = {
    owner: CONST.GITHUB_OWNER,
    repo: CONST.APP_REPO,
};

const pullRequestNumber = getJSONInput('PULL_REQUEST_NUMBER', {required: false}, null);
const user = core.getInput('USER', {required: true});

if (pullRequestNumber) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
    console.log(`Looking for pull request w/ number: ${pullRequestNumber}`);
}

if (user) {
    console.log(`Looking for pull request w/ user: ${user}`);
}

/**
 * Output pull request merge actor.
 */
function outputMergeActor(PR: PullRequest) {
    if (user === CONST.OS_BOTIFY) {
        core.setOutput('MERGE_ACTOR', PR.merged_by?.login);
    } else {
        core.setOutput('MERGE_ACTOR', user);
    }
}

/**
 * Output forked repo URL if PR includes changes from a fork.
 */
function outputForkedRepoUrl(PR: PullRequest) {
    if (PR.head?.repo?.html_url === CONST.APP_REPO_URL) {
        core.setOutput('FORKED_REPO_URL', '');
    } else {
        core.setOutput('FORKED_REPO_URL', `${PR.head?.repo?.html_url}.git`);
    }
}

GithubUtils.octokit.pulls
    .get({
        ...DEFAULT_PAYLOAD,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        pull_number: pullRequestNumber as number,
    })
    .then(({data: PR}) => {
        if (!isEmptyObject(PR)) {
            console.log(`Found matching pull request: ${PR.html_url}`);
            core.setOutput('MERGE_COMMIT_SHA', PR.merge_commit_sha);
            core.setOutput('HEAD_COMMIT_SHA', PR.head?.sha);
            core.setOutput('IS_MERGED', PR.merged);
            outputMergeActor(PR);
            outputForkedRepoUrl(PR);
        } else {
            const err = new Error('Could not find matching pull request');
            console.error(err);
            core.setFailed(err);
        }
    })
    .catch((err: string) => {
        console.log(`An unknown error occurred with the GitHub API: ${err}`);
        core.setFailed(err);
    });

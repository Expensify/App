const _ = require('underscore');
const core = require('@actions/core');
const CONST = require('../../../libs/CONST');
const ActionUtils = require('../../../libs/ActionUtils');
const GithubUtils = require('../../../libs/GithubUtils');

const DEFAULT_PAYLOAD = {
    owner: CONST.GITHUB_OWNER,
    repo: CONST.APP_REPO,
};

const pullRequestNumber = ActionUtils.getJSONInput('PULL_REQUEST_NUMBER', {required: false}, null);
const user = core.getInput('USER', {required: true});

if (pullRequestNumber) {
    console.log(`Looking for pull request w/ number: ${pullRequestNumber}`);
}

if (user) {
    console.log(`Looking for pull request w/ user: ${user}`);
}

/**
 * Output pull request merge actor.
 *
 * @param {Object} PR
 */
function outputMergeActor(PR) {
    if (user === CONST.OS_BOTIFY) {
        core.setOutput('MERGE_ACTOR', PR.merged_by.login);
    } else {
        core.setOutput('MERGE_ACTOR', user);
    }
}

/**
 * Output forked repo URL if PR includes changes from a fork.
 *
 * @param {Object} PR
 */
function outputForkedRepoUrl(PR) {
    if (PR.head.repo.html_url === CONST.APP_REPO_URL) {
        core.setOutput('FORKED_REPO_URL', '');
    } else {
        core.setOutput('FORKED_REPO_URL', `${PR.head.repo.html_url}.git`);
    }
}

GithubUtils.octokit.pulls
    .get({
        ...DEFAULT_PAYLOAD,
        pull_number: pullRequestNumber,
    })
    .then(({data: PR}) => {
        if (!_.isEmpty(PR)) {
            console.log(`Found matching pull request: ${PR.html_url}`);
            core.setOutput('MERGE_COMMIT_SHA', PR.merge_commit_sha);
            core.setOutput('HEAD_COMMIT_SHA', PR.head.sha);
            core.setOutput('IS_MERGED', PR.merged);
            outputMergeActor(PR);
            outputForkedRepoUrl(PR);
        } else {
            const err = new Error('Could not find matching pull request');
            console.error(err);
            core.setFailed(err);
        }
    })
    .catch((err) => {
        console.log(`An unknown error occurred with the GitHub API: ${err}`);
        core.setFailed(err);
    });

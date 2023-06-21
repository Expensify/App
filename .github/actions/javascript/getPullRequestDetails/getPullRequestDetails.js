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
let titleRegex = core.getInput('TITLE_REGEX', {required: false});

if (pullRequestNumber) {
    console.log(`Looking for pull request w/ number: ${pullRequestNumber}`);
}

if (user) {
    console.log(`Looking for pull request w/ user: ${user}`);
}

if (titleRegex) {
    titleRegex = new RegExp(titleRegex);
    console.log(`Looking for pull request w/ title matching: ${titleRegex.toString()}`);
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

/**
 * Output pull request data.
 *
 * @param {Object} PR
 */
function outputPullRequestData(PR) {
    core.setOutput('MERGE_COMMIT_SHA', PR.merge_commit_sha);
    core.setOutput('HEAD_COMMIT_SHA', PR.head.sha);
    core.setOutput('IS_MERGED', PR.merged);
    outputMergeActor(PR);
    outputForkedRepoUrl(PR);
}

/**
 * Process a pull request and output its data.
 *
 * @param {Object} PR
 */
function processPullRequest(PR) {
    if (!_.isEmpty(PR)) {
        console.log(`Found matching pull request: ${PR.html_url}`);
        outputPullRequestData(PR);
    } else {
        const err = new Error('Could not find matching pull request');
        console.error(err);
        core.setFailed(err);
    }
}

/**
 * Handle an unknown API error.
 *
 * @param {Error} err
 */
function handleUnknownError(err) {
    console.log(`An unknown error occurred with the GitHub API: ${err}`);
    core.setFailed(err);
}

if (pullRequestNumber) {
    GithubUtils.octokit.pulls
        .get({
            ...DEFAULT_PAYLOAD,
            pull_number: pullRequestNumber,
        })
        .then(({data}) => {
            processPullRequest(data);
        })
        .catch(handleUnknownError);
} else {
    GithubUtils.octokit.pulls
        .list({
            ...DEFAULT_PAYLOAD,
            state: 'all',
        })
        .then(({data}) => _.find(data, (PR) => PR.user.login === user && titleRegex.test(PR.title)).number)
        .then((matchingPRNum) =>
            GithubUtils.octokit.pulls.get({
                ...DEFAULT_PAYLOAD,
                pull_number: matchingPRNum,
            }),
        )
        .then(({data}) => {
            processPullRequest(data);
        });
}

const _ = require('underscore');
const core = require('@actions/core');
const ActionUtils = require('../../libs/ActionUtils');
const GithubUtils = require('../../libs/GithubUtils');

const DEFAULT_PAYLOAD = {
    owner: GithubUtils.GITHUB_OWNER,
    repo: GithubUtils.EXPENSIFY_CASH_REPO,
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
 * Process a pull request and outputs it's merge commit hash.
 *
 * @param {Object} PR
 */
function outputMergeCommitHash(PR) {
    if (!_.isEmpty(PR)) {
        console.log(`Found matching pull request: ${PR.html_url}`);
        core.setOutput('MERGE_COMMIT_SHA', PR.merge_commit_sha);
    } else {
        const err = new Error('Could not find matching pull request');
        console.error(err);
        core.setFailed(err);
    }
}

/**
 * Process a pull request and outputs it's merge actor
 *
 * @param {Object} PR
 */
function outputMergeActor(PR) {
    if (!_.isEmpty(PR)) {
        console.log(`Found matching pull request: ${PR.html_url}`);

        if (user === 'OSBotify') {
            core.setOutput('MERGE_ACTOR', PR.merged_by.login);
        } else {
            core.setOutput('MERGE_ACTOR', user);
        }
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
    GithubUtils.octokit.pulls.get({
        ...DEFAULT_PAYLOAD,
        pull_number: pullRequestNumber,
    })
        .then(({data}) => {
            outputMergeCommitHash(data);
            outputMergeActor(data);
        })
        .catch(handleUnknownError);
} else {
    GithubUtils.octokit.pulls.list({
        ...DEFAULT_PAYLOAD,
        state: 'all',
    })
        .then(({data}) => {
            const matchingPR = _.find(data, PR => PR.user.login === user && titleRegex.test(PR.title));
            outputMergeCommitHash(matchingPR);
            outputMergeActor(matchingPR);
        });
}

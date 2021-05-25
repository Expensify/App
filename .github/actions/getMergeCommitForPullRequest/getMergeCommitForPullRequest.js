const core = require('@actions/core');
const ActionUtils = require('../../libs/ActionUtils');
const GithubUtils = require('../../libs/GithubUtils');

const pullRequestNumber = ActionUtils.getJSONInput('PULL_REQUEST_NUMBER', {required: true});
console.log(`Getting merge_commit_sha for PR #${pullRequestNumber}`);
GithubUtils.octokit.pulls.get({
    owner: GithubUtils.GITHUB_OWNER,
    repo: GithubUtils.EXPENSIFY_CASH_REPO,
    pull_number: pullRequestNumber,
})
    .then(({data}) => {
        const mergeCommitHash = data.merge_commit_sha;
        if (mergeCommitHash) {
            console.log(`PR #${pullRequestNumber} has merge_commit_sha ${mergeCommitHash}`);
            core.setOutput('MERGE_COMMIT_SHA', mergeCommitHash);
        } else {
            const err = new Error(`Could not find merge_commit_sha for pull request ${pullRequestNumber}`);
            console.error(err);
            core.setFailed(err);
        }
    })
    .catch((err) => {
        console.log(`An unknown error occurred with the GitHub API: ${err}`);
        core.setFailed(err);
    });

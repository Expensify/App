const core = require('@actions/core');
const github = require('@actions/github');
const {GITHUB_OWNER, EXPENSIFY_CASH_REPO} = require('../../libs/GithubUtils');

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
const issueNumber = core.getInput('ISSUE_NUMBER', {required: true});

function reopenIssueWithComment() {
    return octokit.rest.issues.update({
        owner: GITHUB_OWNER,
        repo: EXPENSIFY_CASH_REPO,
        issue_number: issueNumber,
        state: 'open',
    })
        .then(() => octokit.rest.issues.createComment({
            owner: GITHUB_OWNER,
            repo: EXPENSIFY_CASH_REPO,
            issue_number: issueNumber,
            body: core.getInput('COMMENT', {required: true}),
        }));
}

reopenIssueWithComment()
    .then(() => {
        console.log('Issue successfully reopened and commented.');
        process.exit(0);
    })
    .catch((err) => {
        console.error('Something went wrong. The issue was not successfully reopened', err);
        core.setFailed(err);
    });

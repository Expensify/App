const core = require('@actions/core');
const github = require('@actions/github');
const {GITHUB_OWNER, EXPENSIFY_CASH_REPO} = require('../../libs/GithubUtils');

const octokit = github.getOctokit(core.getInput('GITHUB_TOKEN', {required: true}));
const issueNumber = core.getInput('ISSUE_NUMBER', {required: true});
const comment = core.getInput('COMMENT', {required: true});

function reopenIssueWithComment() {
    console.log(`Reopening issue # ${issueNumber}`);
    octokit.issues.update({
        owner: GITHUB_OWNER,
        repo: EXPENSIFY_CASH_REPO,
        issue_number: issueNumber,
        state: 'open',
    })
        .then(() => {
            console.log(`Commenting on issue # ${issueNumber}`);
            octokit.issues.createComment({
                owner: GITHUB_OWNER,
                repo: EXPENSIFY_CASH_REPO,
                issue_number: issueNumber,
                body: comment,
            });
        });
}

reopenIssueWithComment()
    .then(() => {
        console.log(`Issue # ${issueNumber} successfully reopened and commented: "${comment}"`);
        process.exit(0);
    })
    .catch((err) => {
        console.error(`Something went wrong. The issue # ${issueNumber} was not successfully reopened`, err);
        core.setFailed(err);
    });

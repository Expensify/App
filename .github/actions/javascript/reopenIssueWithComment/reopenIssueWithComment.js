const core = require('@actions/core');
const GithubUtils = require('../../../libs/GithubUtils');

const issueNumber = core.getInput('ISSUE_NUMBER', {required: true});
const comment = core.getInput('COMMENT', {required: true});

function reopenIssueWithComment() {
    console.log(`Reopening issue #${issueNumber}`);
    return GithubUtils.octokit.issues.update({
        owner: GithubUtils.GITHUB_OWNER,
        repo: GithubUtils.APP_REPO,
        issue_number: issueNumber,
        state: 'open',
    })
        .then(() => {
            console.log(`Commenting on issue #${issueNumber}`);
            return GithubUtils.octokit.issues.createComment({
                owner: GithubUtils.GITHUB_OWNER,
                repo: GithubUtils.APP_REPO,
                issue_number: issueNumber,
                body: comment,
            });
        });
}

reopenIssueWithComment()
    .then(() => {
        console.log(`Issue #${issueNumber} successfully reopened and commented: "${comment}"`);
        process.exit(0);
    })
    .catch((err) => {
        console.error(`Something went wrong. The issue #${issueNumber} was not successfully reopened`, err);
        core.setFailed(err);
    });

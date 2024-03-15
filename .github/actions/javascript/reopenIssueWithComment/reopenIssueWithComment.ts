import * as core from '@actions/core';
import CONST from '../../../libs/CONST';
import GithubUtils from '../../../libs/GithubUtils';

const issueNumber = core.getInput('ISSUE_NUMBER', {required: true});
const comment = core.getInput('COMMENT', {required: true});

function reopenIssueWithComment() {
    console.log(`Reopening issue #${issueNumber}`);
    // TODO: Remove this once GithubUtils (https://github.com/Expensify/App/issues/25382) is migrated to TypeScript.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return GithubUtils.octokit.issues
        .update({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            issue_number: issueNumber,
            state: 'open',
        })
        .then(() => {
            console.log(`Commenting on issue #${issueNumber}`);
            // TODO: Remove this once GithubUtils (https://github.com/Expensify/App/issues/25382) is migrated to TypeScript.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return GithubUtils.octokit.issues.createComment({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
                // eslint-disable-next-line @typescript-eslint/naming-convention
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
    .catch((err: Error) => {
        console.error(`Something went wrong. The issue #${issueNumber} was not successfully reopened`, err);
        core.setFailed(err);
    });

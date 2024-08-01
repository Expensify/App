import * as core from '@actions/core';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import type {CreateCommentResponse} from '@github/libs/GithubUtils';

const issueNumber = Number(core.getInput('ISSUE_NUMBER', {required: true}));
const comment = core.getInput('COMMENT', {required: true});

function reopenIssueWithComment(): Promise<CreateCommentResponse> {
    console.log(`Reopening issue #${issueNumber}`);
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

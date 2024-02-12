/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
/******/ /* webpack/runtime/compat */
/******/ 
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
const core = require('@actions/core');
const CONST = require('../../../libs/CONST');
const GithubUtils = require('../../../libs/GithubUtils');

const issueNumber = core.getInput('ISSUE_NUMBER', {required: true});
const comment = core.getInput('COMMENT', {required: true});

function reopenIssueWithComment() {
    console.log(`Reopening issue #${issueNumber}`);
    return GithubUtils.octokit.issues
        .update({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            issue_number: issueNumber,
            state: 'open',
        })
        .then(() => {
            console.log(`Commenting on issue #${issueNumber}`);
            return GithubUtils.octokit.issues.createComment({
                owner: CONST.GITHUB_OWNER,
                repo: CONST.APP_REPO,
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

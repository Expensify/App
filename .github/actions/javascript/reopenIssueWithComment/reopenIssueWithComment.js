"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var issueNumber = Number(core.getInput('ISSUE_NUMBER', { required: true }));
var comment = core.getInput('COMMENT', { required: true });
function reopenIssueWithComment() {
    console.log("Reopening issue #".concat(issueNumber));
    return GithubUtils_1.default.octokit.issues
        .update({
        owner: CONST_1.default.GITHUB_OWNER,
        repo: CONST_1.default.APP_REPO,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        issue_number: issueNumber,
        state: 'open',
    })
        .then(function () {
        console.log("Commenting on issue #".concat(issueNumber));
        return GithubUtils_1.default.octokit.issues.createComment({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            issue_number: issueNumber,
            body: comment,
        });
    });
}
reopenIssueWithComment()
    .then(function () {
    console.log("Issue #".concat(issueNumber, " successfully reopened and commented: \"").concat(comment, "\""));
    process.exit(0);
})
    .catch(function (err) {
    console.error("Something went wrong. The issue #".concat(issueNumber, " was not successfully reopened"), err);
    core.setFailed(err);
});

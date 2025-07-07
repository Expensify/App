"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var core = require("@actions/core");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var run = function () {
    var issueNumber = Number(core.getInput('ISSUE_NUMBER', { required: true }));
    console.log("Fetching issue number ".concat(issueNumber));
    return GithubUtils_1.default.octokit.issues
        .get({
        owner: CONST_1.default.GITHUB_OWNER,
        repo: CONST_1.default.APP_REPO,
        issue_number: issueNumber,
    })
        .then(function (_a) {
        var _b;
        var data = _a.data;
        console.log('Checking for unverified PRs or unresolved deploy blockers', data);
        // Check the issue description to see if there are any unfinished/un-QAed items in the checklist.
        var uncheckedBoxRegex = /-\s\[\s]\s/;
        if (uncheckedBoxRegex.test((_b = data.body) !== null && _b !== void 0 ? _b : '')) {
            console.log('An unverified PR or unresolved deploy blocker was found.');
            core.setOutput('HAS_DEPLOY_BLOCKERS', true);
            return;
        }
        return GithubUtils_1.default.octokit.issues.listComments({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            issue_number: issueNumber,
            per_page: 100,
        });
    })
        .then(function (comments) {
        var _a;
        console.log('Checking the last comment for the :shipit: seal of approval', comments);
        // If comments is undefined that means we found an unchecked QA item in the
        // issue description, so there's nothing more to do but return early.
        if (comments === undefined) {
            return;
        }
        // If there are no comments, then we have not yet gotten the :shipit: seal of approval.
        if ((0, EmptyObject_1.isEmptyObject)(comments.data)) {
            console.log('No comments found on issue');
            core.setOutput('HAS_DEPLOY_BLOCKERS', true);
            return;
        }
        console.log('Verifying that the last comment is the :shipit: seal of approval');
        var lastComment = comments.data.pop();
        var shipItRegex = /^:shipit:/g;
        if (!shipItRegex.exec((_a = lastComment === null || lastComment === void 0 ? void 0 : lastComment.body) !== null && _a !== void 0 ? _a : '')) {
            console.log('The last comment on the issue was not :shipit');
            core.setOutput('HAS_DEPLOY_BLOCKERS', true);
        }
        else {
            console.log('Everything looks good, there are no deploy blockers!');
            core.setOutput('HAS_DEPLOY_BLOCKERS', false);
        }
    })
        .catch(function (error) {
        console.error('A problem occurred while trying to communicate with the GitHub API', error);
        core.setFailed(error);
    });
};
if (require.main === module) {
    run();
}
exports.default = run;

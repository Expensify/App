"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var github = require("@actions/github");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var PR_NUMBER = Number.parseInt(core.getInput('PR_NUMBER'), 10) || ((_a = github.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number);
GithubUtils_1.default.octokit.pulls
    .listCommits({
    owner: CONST_1.default.GITHUB_OWNER,
    repo: CONST_1.default.APP_REPO,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    pull_number: PR_NUMBER !== null && PR_NUMBER !== void 0 ? PR_NUMBER : 0,
})
    .then(function (_a) {
    var data = _a.data;
    var unsignedCommits = data.filter(function (datum) { var _a; return !((_a = datum.commit.verification) === null || _a === void 0 ? void 0 : _a.verified); });
    if (unsignedCommits.length > 0) {
        var errorMessage = "Error: the following commits are unsigned: ".concat(JSON.stringify(unsignedCommits.map(function (commitObj) { return commitObj.sha; })));
        console.error(errorMessage);
        core.setFailed(errorMessage);
    }
    else {
        console.log('All commits signed! 🎉');
    }
});

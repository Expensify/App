"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core = require("@actions/core");
var ActionUtils_1 = require("@github/libs/ActionUtils");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var DEFAULT_PAYLOAD = {
    owner: CONST_1.default.GITHUB_OWNER,
    repo: CONST_1.default.APP_REPO,
};
var pullRequestNumber = (0, ActionUtils_1.getJSONInput)('PULL_REQUEST_NUMBER', { required: false }, null);
var user = core.getInput('USER', { required: true });
if (pullRequestNumber) {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string, @typescript-eslint/restrict-template-expressions
    console.log("Looking for pull request w/ number: ".concat(pullRequestNumber));
}
if (user) {
    console.log("Looking for pull request w/ user: ".concat(user));
}
/**
 * Output pull request merge actor.
 */
function outputMergeActor(PR) {
    var _a;
    if (user === CONST_1.default.OS_BOTIFY) {
        core.setOutput('MERGE_ACTOR', (_a = PR.merged_by) === null || _a === void 0 ? void 0 : _a.login);
    }
    else {
        core.setOutput('MERGE_ACTOR', user);
    }
}
/**
 * Output forked repo URL if PR includes changes from a fork.
 */
function outputForkedRepoUrl(PR) {
    var _a, _b, _c, _d;
    if (((_b = (_a = PR.head) === null || _a === void 0 ? void 0 : _a.repo) === null || _b === void 0 ? void 0 : _b.html_url) === CONST_1.default.APP_REPO_URL) {
        core.setOutput('FORKED_REPO_URL', '');
    }
    else {
        core.setOutput('FORKED_REPO_URL', "".concat((_d = (_c = PR.head) === null || _c === void 0 ? void 0 : _c.repo) === null || _d === void 0 ? void 0 : _d.html_url, ".git"));
    }
}
GithubUtils_1.default.octokit.pulls
    .get(__assign(__assign({}, DEFAULT_PAYLOAD), { 
    // eslint-disable-next-line @typescript-eslint/naming-convention
    pull_number: pullRequestNumber }))
    .then(function (_a) {
    var _b;
    var PR = _a.data;
    if (!(0, EmptyObject_1.isEmptyObject)(PR)) {
        console.log("Found matching pull request: ".concat(PR.html_url));
        console.log("Pull request details: ".concat(JSON.stringify(PR), "}"));
        core.setOutput('MERGE_COMMIT_SHA', PR.merge_commit_sha);
        core.setOutput('HEAD_COMMIT_SHA', (_b = PR.head) === null || _b === void 0 ? void 0 : _b.sha);
        core.setOutput('IS_MERGED', PR.merged);
        outputMergeActor(PR);
        outputForkedRepoUrl(PR);
    }
    else {
        var err = new Error('Could not find matching pull request');
        console.error(err);
        core.setFailed(err);
    }
})
    .catch(function (err) {
    console.log("An unknown error occurred with the GitHub API: ".concat(err));
    core.setFailed(err);
});

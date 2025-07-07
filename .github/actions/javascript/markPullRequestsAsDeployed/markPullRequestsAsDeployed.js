"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention, import/no-import-module-exports */
var core = require("@actions/core");
var github_1 = require("@actions/github");
var memoize_1 = require("lodash/memoize");
var ActionUtils = require("@github/libs/ActionUtils");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
/**
 * Return a nicely formatted message for the table based on the result of the GitHub action job
 */
function getDeployTableMessage(platformResult) {
    switch (platformResult) {
        case 'success':
            return "".concat(platformResult, " \u2705");
        case 'cancelled':
            return "".concat(platformResult, " \uD83D\uDD2A");
        case 'skipped':
            return "".concat(platformResult, " \uD83D\uDEAB");
        case 'failure':
        default:
            return "".concat(platformResult, " \u274C");
    }
}
/**
 * Comment Single PR
 */
function commentPR(PR, message) {
    return __awaiter(this, void 0, void 0, function () {
        var err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, GithubUtils_1.default.createComment(github_1.context.repo.repo, PR, message)];
                case 1:
                    _a.sent();
                    console.log("Comment created on #".concat(PR, " successfully \uD83C\uDF89"));
                    return [3 /*break*/, 3];
                case 2:
                    err_1 = _a.sent();
                    console.log("Unable to write comment on #".concat(PR, " \uD83D\uDE1E"));
                    if (err_1 instanceof Error) {
                        core.setFailed(err_1.message);
                    }
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
var workflowURL = "".concat(process.env.GITHUB_SERVER_URL, "/").concat(process.env.GITHUB_REPOSITORY, "/actions/runs/").concat(process.env.GITHUB_RUN_ID);
var getCommit = (0, memoize_1.default)(GithubUtils_1.default.octokit.git.getCommit);
function run() {
    return __awaiter(this, void 0, void 0, function () {
        function getDeployMessage(deployer, deployVerb, prTitle) {
            var message = "\uD83D\uDE80 [".concat(deployVerb, "](").concat(workflowURL, ") to ").concat(isProd ? 'production' : 'staging');
            message += " by https://github.com/".concat(deployer, " in version: ").concat(version, " ");
            if (date) {
                message += "on ".concat(date);
            }
            message += "\uD83D\uDE80";
            message += "\n\nplatform | result\n---|---\n\uD83D\uDDA5 desktop \uD83D\uDDA5|".concat(desktopResult);
            message += "\n\uD83D\uDD78 web \uD83D\uDD78|".concat(webResult);
            message += "\n\uD83E\uDD16 android \uD83E\uDD16|".concat(androidResult, "\n\uD83C\uDF4E iOS \uD83C\uDF4E|").concat(iOSResult);
            if (deployVerb === 'Cherry-picked' && !/no ?qa/gi.test(prTitle !== null && prTitle !== void 0 ? prTitle : '')) {
                // eslint-disable-next-line max-len
                message +=
                    '\n\n@Expensify/applauseleads please QA this PR and check it off on the [deploy checklist](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3AStagingDeployCash) if it passes.';
            }
            if (note) {
                message += "\n\n_Note:_ ".concat(note);
            }
            return message;
        }
        var prList, isProd, version, androidResult, desktopResult, iOSResult, webResult, date, note, deployChecklists, previousChecklistID, deployer, deployMessage, _i, prList_1, pr, recentTags, _a, prList_2, prNumber, pr, isCP, deployer, _b, recentTags_1, tag, commit, prNumForCPMergeCommit, cpActor, title, deployMessage, error_1;
        var _c, _d, _e;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    prList = ActionUtils.getJSONInput('PR_LIST', { required: true }).map(function (num) { return Number.parseInt(num, 10); });
                    isProd = ActionUtils.getJSONInput('IS_PRODUCTION_DEPLOY', { required: true });
                    version = core.getInput('DEPLOY_VERSION', { required: true });
                    androidResult = getDeployTableMessage(core.getInput('ANDROID', { required: true }));
                    desktopResult = getDeployTableMessage(core.getInput('DESKTOP', { required: true }));
                    iOSResult = getDeployTableMessage(core.getInput('IOS', { required: true }));
                    webResult = getDeployTableMessage(core.getInput('WEB', { required: true }));
                    date = core.getInput('DATE');
                    note = core.getInput('NOTE');
                    if (!isProd) return [3 /*break*/, 7];
                    return [4 /*yield*/, GithubUtils_1.default.octokit.issues.listForRepo({
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                            labels: CONST_1.default.LABELS.STAGING_DEPLOY,
                            state: 'closed',
                        })];
                case 1:
                    deployChecklists = (_f.sent()).data;
                    previousChecklistID = (_c = deployChecklists.at(0)) === null || _c === void 0 ? void 0 : _c.number;
                    if (!previousChecklistID) {
                        throw new Error('Could not find the previous checklist ID');
                    }
                    return [4 /*yield*/, GithubUtils_1.default.getActorWhoClosedIssue(previousChecklistID)];
                case 2:
                    deployer = _f.sent();
                    deployMessage = getDeployMessage(deployer, 'Deployed');
                    _i = 0, prList_1 = prList;
                    _f.label = 3;
                case 3:
                    if (!(_i < prList_1.length)) return [3 /*break*/, 6];
                    pr = prList_1[_i];
                    return [4 /*yield*/, commentPR(pr, deployMessage)];
                case 4:
                    _f.sent();
                    _f.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
                case 7: return [4 /*yield*/, GithubUtils_1.default.octokit.repos.listTags({
                        owner: CONST_1.default.GITHUB_OWNER,
                        repo: CONST_1.default.APP_REPO,
                        per_page: 100,
                    })];
                case 8:
                    recentTags = (_f.sent()).data;
                    _a = 0, prList_2 = prList;
                    _f.label = 9;
                case 9:
                    if (!(_a < prList_2.length)) return [3 /*break*/, 19];
                    prNumber = prList_2[_a];
                    _f.label = 10;
                case 10:
                    _f.trys.push([10, 17, , 18]);
                    return [4 /*yield*/, GithubUtils_1.default.octokit.pulls.get({
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                            pull_number: prNumber,
                        })];
                case 11:
                    pr = (_f.sent()).data;
                    isCP = pr.labels.some(function (_a) {
                        var labelName = _a.name;
                        return labelName === CONST_1.default.LABELS.CP_STAGING;
                    });
                    deployer = (_d = pr.merged_by) === null || _d === void 0 ? void 0 : _d.login;
                    if (!isCP) return [3 /*break*/, 15];
                    _b = 0, recentTags_1 = recentTags;
                    _f.label = 12;
                case 12:
                    if (!(_b < recentTags_1.length)) return [3 /*break*/, 15];
                    tag = recentTags_1[_b];
                    return [4 /*yield*/, getCommit({
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                            commit_sha: tag.commit.sha,
                        })];
                case 13:
                    commit = (_f.sent()).data;
                    prNumForCPMergeCommit = commit.message.match(/Merge pull request #(\d+)[\S\s]*\(cherry picked from commit .*\)/);
                    if ((prNumForCPMergeCommit === null || prNumForCPMergeCommit === void 0 ? void 0 : prNumForCPMergeCommit.at(1)) === String(prNumber)) {
                        cpActor = (_e = commit.message.match(/.*\(cherry-picked to .* by (.*)\)/)) === null || _e === void 0 ? void 0 : _e.at(1);
                        if (cpActor) {
                            deployer = cpActor;
                        }
                        return [3 /*break*/, 15];
                    }
                    _f.label = 14;
                case 14:
                    _b++;
                    return [3 /*break*/, 12];
                case 15:
                    title = pr.title;
                    deployMessage = deployer ? getDeployMessage(deployer, isCP ? 'Cherry-picked' : 'Deployed', title) : '';
                    return [4 /*yield*/, commentPR(prNumber, deployMessage)];
                case 16:
                    _f.sent();
                    return [3 /*break*/, 18];
                case 17:
                    error_1 = _f.sent();
                    if (error_1.status === 404) {
                        console.log("Unable to comment on PR #".concat(prNumber, ". GitHub responded with 404."));
                    }
                    else {
                        throw error_1;
                    }
                    return [3 /*break*/, 18];
                case 18:
                    _a++;
                    return [3 /*break*/, 9];
                case 19: return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    run();
}
module.exports = run;

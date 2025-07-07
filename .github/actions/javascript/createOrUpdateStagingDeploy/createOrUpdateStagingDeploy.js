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
var core = require("@actions/core");
var format_1 = require("date-fns/format");
var fs_1 = require("fs");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var GitUtils_1 = require("@github/libs/GitUtils");
function run() {
    return __awaiter(this, void 0, void 0, function () {
        var packageJson, newVersion, newStagingTag, recentDeployChecklists, mostRecentChecklist, shouldCreateNewDeployChecklist, previousChecklist, previousChecklistData, currentChecklistData_1, mergedPRs, checklistBody, checklistAssignees, stagingDeployCashBodyAndAssignees, PRList, openDeployBlockers, deployBlockers_1, didVersionChange, stagingDeployCashBodyAndAssignees, defaultPayload, newChecklist, updatedChecklist, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    packageJson = JSON.parse(fs_1.default.readFileSync('package.json', 'utf8'));
                    newVersion = packageJson.version;
                    newStagingTag = "".concat(packageJson.version, "-staging");
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 12, , 13]);
                    return [4 /*yield*/, GithubUtils_1.default.octokit.issues.listForRepo({
                            log: console,
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                            labels: CONST_1.default.LABELS.STAGING_DEPLOY,
                            state: 'all',
                        })];
                case 2:
                    recentDeployChecklists = (_b.sent()).data;
                    mostRecentChecklist = recentDeployChecklists.at(0);
                    if (!mostRecentChecklist) {
                        throw new Error('Could not find the most recent checklist');
                    }
                    shouldCreateNewDeployChecklist = mostRecentChecklist.state !== 'open';
                    previousChecklist = shouldCreateNewDeployChecklist ? mostRecentChecklist : recentDeployChecklists.at(1);
                    if (shouldCreateNewDeployChecklist) {
                        console.log('Latest StagingDeployCash is closed, creating a new one.', mostRecentChecklist);
                    }
                    else {
                        console.log('Latest StagingDeployCash is open, updating it instead of creating a new one.', 'Current:', mostRecentChecklist, 'Previous:', previousChecklist);
                    }
                    if (!previousChecklist) {
                        throw new Error('Could not find the previous checklist');
                    }
                    previousChecklistData = GithubUtils_1.default.getStagingDeployCashData(previousChecklist);
                    currentChecklistData_1 = shouldCreateNewDeployChecklist ? undefined : GithubUtils_1.default.getStagingDeployCashData(mostRecentChecklist);
                    return [4 /*yield*/, GitUtils_1.default.getPullRequestsDeployedBetween(previousChecklistData.tag, newStagingTag)];
                case 3:
                    mergedPRs = _b.sent();
                    checklistBody = '';
                    checklistAssignees = [];
                    if (!shouldCreateNewDeployChecklist) return [3 /*break*/, 5];
                    return [4 /*yield*/, GithubUtils_1.default.generateStagingDeployCashBodyAndAssignees(newVersion, mergedPRs.map(function (value) { return GithubUtils_1.default.getPullRequestURLFromNumber(value); }))];
                case 4:
                    stagingDeployCashBodyAndAssignees = _b.sent();
                    if (stagingDeployCashBodyAndAssignees) {
                        checklistBody = stagingDeployCashBodyAndAssignees.issueBody;
                        checklistAssignees = stagingDeployCashBodyAndAssignees.issueAssignees.filter(Boolean);
                    }
                    return [3 /*break*/, 8];
                case 5:
                    PRList = mergedPRs.map(function (prNum) {
                        var _a;
                        var indexOfPRInCurrentChecklist = (_a = currentChecklistData_1 === null || currentChecklistData_1 === void 0 ? void 0 : currentChecklistData_1.PRList.findIndex(function (pr) { return pr.number === prNum; })) !== null && _a !== void 0 ? _a : -1;
                        var isVerified = indexOfPRInCurrentChecklist >= 0 ? currentChecklistData_1 === null || currentChecklistData_1 === void 0 ? void 0 : currentChecklistData_1.PRList[indexOfPRInCurrentChecklist].isVerified : false;
                        return {
                            number: prNum,
                            url: GithubUtils_1.default.getPullRequestURLFromNumber(prNum),
                            isVerified: isVerified,
                        };
                    });
                    return [4 /*yield*/, GithubUtils_1.default.paginate(GithubUtils_1.default.octokit.issues.listForRepo, {
                            log: console,
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                            labels: CONST_1.default.LABELS.DEPLOY_BLOCKER,
                        })];
                case 6:
                    openDeployBlockers = _b.sent();
                    deployBlockers_1 = openDeployBlockers.map(function (deployBlocker) {
                        var _a;
                        var indexInCurrentChecklist = (_a = currentChecklistData_1 === null || currentChecklistData_1 === void 0 ? void 0 : currentChecklistData_1.deployBlockers.findIndex(function (item) { return item.number === deployBlocker.number; })) !== null && _a !== void 0 ? _a : -1;
                        var isResolved = indexInCurrentChecklist >= 0 ? currentChecklistData_1 === null || currentChecklistData_1 === void 0 ? void 0 : currentChecklistData_1.deployBlockers[indexInCurrentChecklist].isResolved : false;
                        return {
                            number: deployBlocker.number,
                            url: deployBlocker.html_url,
                            isResolved: isResolved,
                        };
                    });
                    // Then make sure we include any demoted or closed blockers as well, and just check them off automatically
                    currentChecklistData_1 === null || currentChecklistData_1 === void 0 ? void 0 : currentChecklistData_1.deployBlockers.forEach(function (deployBlocker) {
                        var isResolved = deployBlockers_1.findIndex(function (openBlocker) { return openBlocker.number === deployBlocker.number; }) < 0;
                        deployBlockers_1.push(__assign(__assign({}, deployBlocker), { isResolved: isResolved }));
                    });
                    didVersionChange = newVersion !== (currentChecklistData_1 === null || currentChecklistData_1 === void 0 ? void 0 : currentChecklistData_1.version);
                    return [4 /*yield*/, GithubUtils_1.default.generateStagingDeployCashBodyAndAssignees(newVersion, PRList.map(function (pr) { return pr.url; }), PRList.filter(function (pr) { return pr.isVerified; }).map(function (pr) { return pr.url; }), deployBlockers_1.map(function (blocker) { return blocker.url; }), deployBlockers_1.filter(function (blocker) { return blocker.isResolved; }).map(function (blocker) { return blocker.url; }), currentChecklistData_1 === null || currentChecklistData_1 === void 0 ? void 0 : currentChecklistData_1.internalQAPRList.filter(function (pr) { return pr.isResolved; }).map(function (pr) { return pr.url; }), didVersionChange ? false : currentChecklistData_1.isFirebaseChecked, didVersionChange ? false : currentChecklistData_1.isGHStatusChecked)];
                case 7:
                    stagingDeployCashBodyAndAssignees = _b.sent();
                    if (stagingDeployCashBodyAndAssignees) {
                        checklistBody = stagingDeployCashBodyAndAssignees.issueBody;
                        checklistAssignees = stagingDeployCashBodyAndAssignees.issueAssignees.filter(Boolean);
                    }
                    _b.label = 8;
                case 8:
                    defaultPayload = {
                        owner: CONST_1.default.GITHUB_OWNER,
                        repo: CONST_1.default.APP_REPO,
                        body: checklistBody,
                    };
                    if (!shouldCreateNewDeployChecklist) return [3 /*break*/, 10];
                    return [4 /*yield*/, GithubUtils_1.default.octokit.issues.create(__assign(__assign({}, defaultPayload), { title: "Deploy Checklist: New Expensify ".concat((0, format_1.format)(new Date(), CONST_1.default.DATE_FORMAT_STRING)), labels: [CONST_1.default.LABELS.STAGING_DEPLOY], assignees: [CONST_1.default.APPLAUSE_BOT].concat(checklistAssignees) }))];
                case 9:
                    newChecklist = (_b.sent()).data;
                    console.log("Successfully created new StagingDeployCash! \uD83C\uDF89 ".concat(newChecklist.html_url));
                    return [2 /*return*/, newChecklist];
                case 10: return [4 /*yield*/, GithubUtils_1.default.octokit.issues.update(__assign(__assign({}, defaultPayload), { 
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        issue_number: (_a = currentChecklistData_1 === null || currentChecklistData_1 === void 0 ? void 0 : currentChecklistData_1.number) !== null && _a !== void 0 ? _a : 0 }))];
                case 11:
                    updatedChecklist = (_b.sent()).data;
                    console.log("Successfully updated StagingDeployCash! \uD83C\uDF89 ".concat(updatedChecklist.html_url));
                    return [2 /*return*/, updatedChecklist];
                case 12:
                    err_1 = _b.sent();
                    console.error('An unknown error occurred!', err_1);
                    core.setFailed(err_1);
                    return [3 /*break*/, 13];
                case 13: return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    run();
}
exports.default = run;

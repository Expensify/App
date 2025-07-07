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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var core = require("@actions/core");
var github = require("@actions/github");
var escapeRegExp_1 = require("lodash/escapeRegExp");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var newComponentCategory_1 = require("./categories/newComponentCategory");
var pathToAuthorChecklist = "https://raw.githubusercontent.com/".concat(CONST_1.default.GITHUB_OWNER, "/").concat(CONST_1.default.APP_REPO, "/main/.github/PULL_REQUEST_TEMPLATE.md");
var checklistStartsWith = '### PR Author Checklist';
var checklistEndsWith = '\r\n### Screenshots/Videos';
var prNumber = (_a = github.context.payload.pull_request) === null || _a === void 0 ? void 0 : _a.number;
var CHECKLIST_CATEGORIES = {
    NEW_COMPONENT: newComponentCategory_1.default,
};
/**
 * Look at the contents of the pull request, and determine which checklist categories apply.
 */
function getChecklistCategoriesForPullRequest() {
    return __awaiter(this, void 0, void 0, function () {
        var checks, changedFiles_1, possibleCategories, _i, possibleCategories_1, category, _a, _b, item;
        var _this = this;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    checks = new Set();
                    if (!(prNumber !== undefined)) return [3 /*break*/, 3];
                    return [4 /*yield*/, GithubUtils_1.default.paginate(GithubUtils_1.default.octokit.pulls.listFiles, {
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                            pull_number: prNumber,
                            per_page: 100,
                        })];
                case 1:
                    changedFiles_1 = _c.sent();
                    return [4 /*yield*/, Promise.all(Object.values(CHECKLIST_CATEGORIES).map(function (category) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = {
                                            items: category.items
                                        };
                                        return [4 /*yield*/, category.detect(changedFiles_1)];
                                    case 1: return [2 /*return*/, (_a.doesCategoryApply = _b.sent(),
                                            _a)];
                                }
                            });
                        }); }))];
                case 2:
                    possibleCategories = _c.sent();
                    for (_i = 0, possibleCategories_1 = possibleCategories; _i < possibleCategories_1.length; _i++) {
                        category = possibleCategories_1[_i];
                        if (category.doesCategoryApply) {
                            for (_a = 0, _b = category.items; _a < _b.length; _a++) {
                                item = _b[_a];
                                checks.add(item);
                            }
                        }
                    }
                    _c.label = 3;
                case 3: return [2 /*return*/, checks];
            }
        });
    });
}
function partitionWithChecklist(body) {
    var _a = body.split(checklistStartsWith), contentBeforeChecklist = _a[0], contentAfterStartOfChecklist = _a[1];
    var _b = contentAfterStartOfChecklist.split(checklistEndsWith), checklistContent = _b[0], contentAfterChecklist = _b[1];
    return [contentBeforeChecklist, checklistContent, contentAfterChecklist];
}
function getNumberOfItemsFromAuthorChecklist() {
    return __awaiter(this, void 0, void 0, function () {
        var response, fileContents, checklist, numberOfChecklistItems;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, fetch(pathToAuthorChecklist)];
                case 1:
                    response = _c.sent();
                    return [4 /*yield*/, response.text()];
                case 2:
                    fileContents = _c.sent();
                    checklist = partitionWithChecklist(fileContents).at(1);
                    numberOfChecklistItems = (_b = ((_a = checklist === null || checklist === void 0 ? void 0 : checklist.match(/\[ \]/g)) !== null && _a !== void 0 ? _a : []).length) !== null && _b !== void 0 ? _b : 0;
                    return [2 /*return*/, numberOfChecklistItems];
            }
        });
    });
}
function checkPRForCompletedChecklist(expectedNumberOfChecklistItems, checklist) {
    var _a, _b;
    var numberOfFinishedChecklistItems = ((_a = checklist.match(/- \[x\]/gi)) !== null && _a !== void 0 ? _a : []).length;
    var numberOfUnfinishedChecklistItems = ((_b = checklist.match(/- \[ \]/g)) !== null && _b !== void 0 ? _b : []).length;
    var minCompletedItems = expectedNumberOfChecklistItems - 2;
    console.log("You completed ".concat(numberOfFinishedChecklistItems, " out of ").concat(expectedNumberOfChecklistItems, " checklist items with ").concat(numberOfUnfinishedChecklistItems, " unfinished items"));
    if (numberOfFinishedChecklistItems >= minCompletedItems && numberOfUnfinishedChecklistItems === 0) {
        console.log('PR Author checklist is complete 🎉');
        return;
    }
    console.log("Make sure you are using the most up to date checklist found here: ".concat(pathToAuthorChecklist));
    core.setFailed("PR Author Checklist is not completely filled out. Please check every box to verify you've thought about the item.");
}
function generateDynamicChecksAndCheckForCompletion() {
    return __awaiter(this, void 0, void 0, function () {
        var dynamicChecks, isPassing, didChecklistChange, body, _a, contentBeforeChecklist, checklist, contentAfterChecklist, _i, dynamicChecks_1, check, regex, match, isChecked, allChecks, _b, allChecks_1, check, regex, match, newBody, err, numberOfItems, error_1;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    // Generate dynamic checks
                    console.log('Generating dynamic checks...');
                    return [4 /*yield*/, getChecklistCategoriesForPullRequest()];
                case 1:
                    dynamicChecks = _e.sent();
                    isPassing = true;
                    didChecklistChange = false;
                    body = (_d = (_c = github.context.payload.pull_request) === null || _c === void 0 ? void 0 : _c.body) !== null && _d !== void 0 ? _d : '';
                    _a = partitionWithChecklist(body), contentBeforeChecklist = _a[0], checklist = _a[1], contentAfterChecklist = _a[2];
                    for (_i = 0, dynamicChecks_1 = dynamicChecks; _i < dynamicChecks_1.length; _i++) {
                        check = dynamicChecks_1[_i];
                        regex = new RegExp("- \\[([ x])] ".concat((0, escapeRegExp_1.default)(check)));
                        match = regex.exec(checklist);
                        if (!match) {
                            console.log('Adding check to the checklist:', check);
                            // Add it to the PR body
                            isPassing = false;
                            checklist += "- [ ] ".concat(check, "\r\n");
                            didChecklistChange = true;
                        }
                        else {
                            isChecked = match[1] === 'x';
                            if (!isChecked) {
                                console.log('Found unchecked checklist item:', check);
                                isPassing = false;
                            }
                        }
                    }
                    allChecks = Object.values(CHECKLIST_CATEGORIES).reduce(function (acc, category) { return acc.concat(category.items); }, []);
                    for (_b = 0, allChecks_1 = allChecks; _b < allChecks_1.length; _b++) {
                        check = allChecks_1[_b];
                        if (!dynamicChecks.has(check)) {
                            regex = new RegExp("- \\[([ x])] ".concat((0, escapeRegExp_1.default)(check), "\r\n"));
                            match = regex.exec(checklist);
                            if (match) {
                                // Remove it from the PR body
                                console.log('Check has been removed from the checklist:', check);
                                checklist = checklist.replace(match[0], '');
                                didChecklistChange = true;
                            }
                        }
                    }
                    newBody = contentBeforeChecklist + checklistStartsWith + checklist + checklistEndsWith + contentAfterChecklist;
                    if (!(didChecklistChange && prNumber !== undefined)) return [3 /*break*/, 3];
                    console.log('Checklist changed, updating PR...');
                    return [4 /*yield*/, GithubUtils_1.default.octokit.pulls.update({
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                            pull_number: prNumber,
                            body: newBody,
                        })];
                case 2:
                    _e.sent();
                    console.log('Updated PR checklist');
                    _e.label = 3;
                case 3:
                    if (!isPassing) {
                        err = new Error("New checks were added into checklist. Please check every box to verify you've thought about the item.");
                        console.error(err);
                        core.setFailed(err);
                    }
                    _e.label = 4;
                case 4:
                    _e.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, getNumberOfItemsFromAuthorChecklist()];
                case 5:
                    numberOfItems = _e.sent();
                    checkPRForCompletedChecklist(numberOfItems, checklist);
                    return [3 /*break*/, 7];
                case 6:
                    error_1 = _e.sent();
                    console.error(error_1);
                    if (error_1 instanceof Error) {
                        core.setFailed(error_1.message);
                    }
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
if (require.main === module) {
    generateDynamicChecksAndCheckForCompletion();
}
exports.default = generateDynamicChecksAndCheckForCompletion;

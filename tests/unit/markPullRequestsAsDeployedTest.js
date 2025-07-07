"use strict";
/**
 * @jest-environment node
 */
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/naming-convention */
var CONST_1 = require("../../.github/libs/CONST");
var GithubUtils_1 = require("../../.github/libs/GithubUtils");
var GitUtils_1 = require("../../.github/libs/GitUtils");
var run;
var mockGetInput = jest.fn();
var mockGetPullRequest = jest.fn();
var mockCreateComment = jest.fn();
var mockListTags = jest.fn();
var mockGetCommit = jest.fn();
var workflowRunURL;
var PRList = {
    1: {
        issue_number: 1,
        title: 'Test PR 1',
        merged_by: {
            login: 'odin',
        },
        labels: [],
    },
    2: {
        issue_number: 2,
        title: 'Test PR 2',
        merged_by: {
            login: 'loki',
        },
        labels: [],
    },
};
var version = '42.42.42-42';
var defaultTags = [
    { name: '42.42.42-42', commit: { sha: 'abcd' } },
    { name: '42.42.42-41', commit: { sha: 'hash' } },
];
function mockGetInputDefaultImplementation(key) {
    switch (key) {
        case 'PR_LIST':
            return JSON.stringify(Object.keys(PRList));
        case 'IS_PRODUCTION_DEPLOY':
            return false;
        case 'DEPLOY_VERSION':
            return version;
        case 'IOS':
        case 'ANDROID':
        case 'DESKTOP':
        case 'WEB':
            return 'success';
        case 'DATE':
        case 'NOTE':
            return '';
        default:
            throw new Error("Trying to access invalid input: ".concat(key));
    }
}
function mockGetCommitDefaultImplementation(_a) {
    var commit_sha = _a.commit_sha;
    if (commit_sha === 'abcd') {
        return { data: { message: 'Test commit 1' } };
    }
    return { data: { message: 'Test commit 2' } };
}
beforeAll(function () {
    // Mock core module
    jest.mock('@actions/core', function () { return ({
        getInput: mockGetInput,
    }); });
    mockGetInput.mockImplementation(mockGetInputDefaultImplementation);
    // Mock octokit module
    var mockOctokit = {
        rest: {
            issues: {
                // eslint-disable-next-line @typescript-eslint/require-await
                listForRepo: jest.fn().mockImplementation(function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, ({
                                data: [
                                    {
                                        number: 5,
                                    },
                                ],
                            })];
                    });
                }); }),
                // eslint-disable-next-line @typescript-eslint/require-await
                listEvents: jest.fn().mockImplementation(function () { return __awaiter(void 0, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, ({
                                data: [{ event: 'closed', actor: { login: 'thor' } }],
                            })];
                    });
                }); }),
                createComment: mockCreateComment,
            },
            pulls: {
                get: mockGetPullRequest,
            },
            repos: {
                listTags: mockListTags,
            },
            git: {
                getCommit: mockGetCommit,
            },
        },
        paginate: jest.fn().mockImplementation(function (objectMethod) { return objectMethod().then(function (_a) {
            var data = _a.data;
            return data;
        }); }),
    };
    GithubUtils_1.default.internalOctokit = mockOctokit;
    // Mock GitUtils
    GitUtils_1.default.getPullRequestsDeployedBetween = jest.fn();
    jest.mock('../../.github/libs/ActionUtils', function () { return ({
        getJSONInput: jest.fn().mockImplementation(function (name, defaultValue) {
            try {
                var input = mockGetInput(name);
                return JSON.parse(input);
            }
            catch (err) {
                return defaultValue;
            }
        }),
    }); });
    // Set GH runner environment variables
    process.env.GITHUB_SERVER_URL = 'https://github.com';
    process.env.GITHUB_RUN_ID = '1234';
    workflowRunURL = "".concat(process.env.GITHUB_SERVER_URL, "/").concat(process.env.GITHUB_REPOSITORY, "/actions/runs/").concat(process.env.GITHUB_RUN_ID);
});
beforeEach(function () {
    mockGetPullRequest.mockImplementation(function (_a) {
        var pull_number = _a.pull_number;
        return (pull_number in PRList ? { data: PRList[pull_number] } : {});
    });
    mockListTags.mockResolvedValue({
        data: defaultTags,
    });
    mockGetCommit.mockImplementation(mockGetCommitDefaultImplementation);
});
afterEach(function () {
    mockGetInput.mockClear();
    mockCreateComment.mockClear();
    mockGetPullRequest.mockClear();
});
afterAll(function () {
    jest.clearAllMocks();
});
describe('markPullRequestsAsDeployed', function () {
    it('comments on pull requests correctly for a standard staging deploy', function () { return __awaiter(void 0, void 0, void 0, function () {
        var i, PR;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Note: we import this in here so that it executes after all the mocks are set up
                    run = require('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');
                    return [4 /*yield*/, run()];
                case 1:
                    _a.sent();
                    expect(mockCreateComment).toHaveBeenCalledTimes(Object.keys(PRList).length);
                    for (i = 0; i < Object.keys(PRList).length; i++) {
                        PR = PRList[i + 1];
                        expect(mockCreateComment).toHaveBeenNthCalledWith(i + 1, {
                            body: "\uD83D\uDE80 [Deployed](".concat(workflowRunURL, ") to staging by https://github.com/").concat(PR.merged_by.login, " in version: ").concat(version, " \uD83D\uDE80\n\nplatform | result\n---|---\n\uD83D\uDDA5 desktop \uD83D\uDDA5|success \u2705\n\uD83D\uDD78 web \uD83D\uDD78|success \u2705\n\uD83E\uDD16 android \uD83E\uDD16|success \u2705\n\uD83C\uDF4E iOS \uD83C\uDF4E|success \u2705"),
                            issue_number: PR.issue_number,
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                        });
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('comments on pull requests correctly for a standard production deploy', function () { return __awaiter(void 0, void 0, void 0, function () {
        var i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockGetInput.mockImplementation(function (key) {
                        if (key === 'IS_PRODUCTION_DEPLOY') {
                            return true;
                        }
                        return mockGetInputDefaultImplementation(key);
                    });
                    // Note: we import this in here so that it executes after all the mocks are set up
                    run = require('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');
                    return [4 /*yield*/, run()];
                case 1:
                    _a.sent();
                    expect(mockCreateComment).toHaveBeenCalledTimes(Object.keys(PRList).length);
                    for (i = 0; i < Object.keys(PRList).length; i++) {
                        expect(mockCreateComment).toHaveBeenNthCalledWith(i + 1, {
                            body: "\uD83D\uDE80 [Deployed](".concat(workflowRunURL, ") to production by https://github.com/thor in version: ").concat(version, " \uD83D\uDE80\n\nplatform | result\n---|---\n\uD83D\uDDA5 desktop \uD83D\uDDA5|success \u2705\n\uD83D\uDD78 web \uD83D\uDD78|success \u2705\n\uD83E\uDD16 android \uD83E\uDD16|success \u2705\n\uD83C\uDF4E iOS \uD83C\uDF4E|success \u2705"),
                            issue_number: PRList[i + 1].issue_number,
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                        });
                    }
                    return [2 /*return*/];
            }
        });
    }); });
    it('comments on pull requests correctly for a cherry pick', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockGetInput.mockImplementation(function (key) {
                        if (key === 'PR_LIST') {
                            return JSON.stringify([3]);
                        }
                        if (key === 'DEPLOY_VERSION') {
                            return '42.42.42-43';
                        }
                        return mockGetInputDefaultImplementation(key);
                    });
                    mockGetPullRequest.mockImplementation(function (_a) {
                        var pull_number = _a.pull_number;
                        if (pull_number === 3) {
                            return {
                                data: {
                                    issue_number: 3,
                                    title: 'Test PR 3',
                                    merged_by: {
                                        login: 'thor',
                                    },
                                    labels: [{ name: CONST_1.default.LABELS.CP_STAGING }],
                                },
                            };
                        }
                        return {};
                    });
                    mockListTags.mockResolvedValue({
                        data: __spreadArray([{ name: '42.42.42-43', commit: { sha: 'xyz' } }], defaultTags, true),
                    });
                    mockGetCommit.mockImplementation(function (_a) {
                        var commit_sha = _a.commit_sha;
                        if (commit_sha === 'xyz') {
                            return {
                                data: {
                                    message: "Merge pull request #3 blahblahblah\\n(cherry picked from commit dag_dag)\\n(cherry-picked to staging by freyja)",
                                },
                            };
                        }
                        return mockGetCommitDefaultImplementation({ commit_sha: commit_sha });
                    });
                    // Note: we import this in here so that it executes after all the mocks are set up
                    run = require('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');
                    return [4 /*yield*/, run()];
                case 1:
                    _a.sent();
                    expect(mockCreateComment).toHaveBeenCalledTimes(1);
                    expect(mockCreateComment).toHaveBeenCalledWith({
                        body: "\uD83D\uDE80 [Cherry-picked](".concat(workflowRunURL, ") to staging by https://github.com/freyja in version: 42.42.42-43 \uD83D\uDE80\n\nplatform | result\n---|---\n\uD83D\uDDA5 desktop \uD83D\uDDA5|success \u2705\n\uD83D\uDD78 web \uD83D\uDD78|success \u2705\n\uD83E\uDD16 android \uD83E\uDD16|success \u2705\n\uD83C\uDF4E iOS \uD83C\uDF4E|success \u2705\n\n@Expensify/applauseleads please QA this PR and check it off on the [deploy checklist](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3AStagingDeployCash) if it passes."),
                        issue_number: 3,
                        owner: CONST_1.default.GITHUB_OWNER,
                        repo: CONST_1.default.APP_REPO,
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    it('comments on pull requests correctly when one platform fails', function () { return __awaiter(void 0, void 0, void 0, function () {
        var i, PR;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockGetInput.mockImplementation(function (key) {
                        if (key === 'ANDROID') {
                            return 'skipped';
                        }
                        if (key === 'IOS') {
                            return 'failed';
                        }
                        if (key === 'DESKTOP') {
                            return 'cancelled';
                        }
                        return mockGetInputDefaultImplementation(key);
                    });
                    // Note: we import this in here so that it executes after all the mocks are set up
                    run = require('../../.github/actions/javascript/markPullRequestsAsDeployed/markPullRequestsAsDeployed');
                    return [4 /*yield*/, run()];
                case 1:
                    _a.sent();
                    expect(mockCreateComment).toHaveBeenCalledTimes(Object.keys(PRList).length);
                    for (i = 0; i < Object.keys(PRList).length; i++) {
                        PR = PRList[i + 1];
                        expect(mockCreateComment).toHaveBeenNthCalledWith(i + 1, {
                            body: "\uD83D\uDE80 [Deployed](".concat(workflowRunURL, ") to staging by https://github.com/").concat(PR.merged_by.login, " in version: ").concat(version, " \uD83D\uDE80\n\nplatform | result\n---|---\n\uD83D\uDDA5 desktop \uD83D\uDDA5|cancelled \uD83D\uDD2A\n\uD83D\uDD78 web \uD83D\uDD78|success \u2705\n\uD83E\uDD16 android \uD83E\uDD16|skipped \uD83D\uDEAB\n\uD83C\uDF4E iOS \uD83C\uDF4E|failed \u274C"),
                            issue_number: PR.issue_number,
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                        });
                    }
                    return [2 /*return*/];
            }
        });
    }); });
});

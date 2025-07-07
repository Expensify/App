"use strict";
/**
 * @jest-environment node
 */
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
var fns = require("date-fns");
var memfs_1 = require("memfs");
var path_1 = require("path");
var createOrUpdateStagingDeploy_1 = require("@github/actions/javascript/createOrUpdateStagingDeploy/createOrUpdateStagingDeploy");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var GitUtils_1 = require("@github/libs/GitUtils");
var PATH_TO_PACKAGE_JSON = path_1.default.resolve(__dirname, '../../package.json');
jest.mock('fs');
var mockGetInput = jest.fn();
var mockListIssues = jest.fn();
var mockGetPullRequestsDeployedBetween = jest.fn();
beforeAll(function () {
    var _a;
    // Mock core module
    jest.mock('@actions/core', function () { return ({
        getInput: mockGetInput,
    }); });
    // Mock octokit module
    var mockOctokit = {
        rest: {
            issues: {
                create: jest.fn().mockImplementation(function (arg) {
                    return Promise.resolve({
                        data: __assign(__assign({}, arg), { html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/29") }),
                    });
                }),
                update: jest.fn().mockImplementation(function (arg) {
                    return Promise.resolve({
                        data: __assign(__assign({}, arg), { html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/").concat(arg.issue_number) }),
                    });
                }),
                listForRepo: mockListIssues,
            },
            pulls: {
                // Static mock for pulls.list (only used to filter out automated PRs, and that functionality is covered
                // in the test for GithubUtils.generateStagingDeployCashBody
                list: jest.fn().mockResolvedValue([]),
            },
        },
        paginate: jest
            .fn()
            .mockImplementation(function (objectMethod, args) { return objectMethod(args).then(function (_a) {
            var data = _a.data;
            return data;
        }); }),
    };
    GithubUtils_1.default.internalOctokit = mockOctokit;
    // Mock GitUtils
    GitUtils_1.default.getPullRequestsDeployedBetween = mockGetPullRequestsDeployedBetween;
    memfs_1.vol.reset();
    memfs_1.vol.fromJSON((_a = {},
        _a[PATH_TO_PACKAGE_JSON] = JSON.stringify({ version: '1.0.2-1' }),
        _a));
});
afterEach(function () {
    mockGetInput.mockClear();
    mockListIssues.mockClear();
    mockGetPullRequestsDeployedBetween.mockClear();
});
afterAll(function () {
    jest.clearAllMocks();
});
var LABELS = {
    STAGING_DEPLOY_CASH: {
        id: 2783847782,
        // cspell:disable-next-line
        node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
        url: "https://api.github.com/repos/".concat(process.env.GITHUB_REPOSITORY, "/labels/StagingDeployCash"),
        name: CONST_1.default.LABELS.STAGING_DEPLOY,
        color: '6FC269',
        default: false,
        description: '',
    },
    DEPLOY_BLOCKER_CASH: {
        id: 2810597462,
        // cspell:disable-next-line
        node_id: 'MDU6TGFiZWwyODEwNTk3NDYy',
        url: "https://api.github.com/repos/".concat(process.env.GITHUB_REPOSITORY, "/labels/DeployBlockerCash"),
        name: CONST_1.default.LABELS.DEPLOY_BLOCKER,
        color: '000000',
        default: false,
        description: 'This issue or pull request should block deployment',
    },
};
var basePRList = [
    "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/1"),
    "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/2"),
    "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/3"),
    "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/4"),
    "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/5"),
    "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/6"),
    "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/7"),
    "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/8"),
    "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/9"),
    "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/10"),
];
var baseIssueList = ["https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/11"), "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/12")];
// eslint-disable-next-line max-len
var baseExpectedOutput = function (version) {
    if (version === void 0) { version = '1.0.2-1'; }
    return "**Release Version:** `".concat(version, "`\r\n**Compare Changes:** https://github.com/").concat(process.env.GITHUB_REPOSITORY, "/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n");
};
var openCheckbox = '- [ ] ';
var closedCheckbox = '- [x] ';
var deployerVerificationsHeader = '**Deployer verifications:**';
// eslint-disable-next-line max-len
var firebaseVerificationCurrentRelease = 'I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-mobile-app/crashlytics/app/ios:com.expensify.expensifylite/issues?state=open&time=last-seven-days&types=crash&tag=all&sort=eventCount) for **this release version** and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).';
// eslint-disable-next-line max-len
var firebaseVerificationPreviousRelease = 'I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-mobile-app/crashlytics/app/android:org.me.mobiexpensifyg/issues?state=open&time=last-seven-days&types=crash&tag=all&sort=eventCount) for **the previous release version** and verified that the release did not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).';
// eslint-disable-next-line max-len
var ghVerification = 'I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.';
var ccApplauseLeads = "cc @Expensify/applauseleads\r\n";
var deployBlockerHeader = '**Deploy Blockers:**';
var lineBreak = '\r\n';
var lineBreakDouble = '\r\n\r\n';
describe('createOrUpdateStagingDeployCash', function () {
    var closedStagingDeployCash = {
        url: "https://api.github.com/repos/".concat(process.env.GITHUB_REPOSITORY, "/issues/28"),
        title: 'Test StagingDeployCash',
        number: 28,
        labels: [LABELS.STAGING_DEPLOY_CASH],
        html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/29"),
        // eslint-disable-next-line max-len
        body: "".concat(baseExpectedOutput('1.0.1-0')) +
            "".concat(closedCheckbox).concat(basePRList.at(0)) +
            "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(1)) +
            "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(2)).concat(lineBreak) +
            "".concat(lineBreakDouble).concat(deployBlockerHeader) +
            "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(0)) +
            "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(3)) +
            "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(4)) +
            "".concat(lineBreakDouble).concat(ccApplauseLeads),
    };
    var baseNewPullRequests = [6, 7, 8];
    test('creates new issue when there is none open', function () { return __awaiter(void 0, void 0, void 0, function () {
        var result;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    memfs_1.vol.reset();
                    memfs_1.vol.fromJSON((_a = {},
                        _a[PATH_TO_PACKAGE_JSON] = JSON.stringify({ version: '1.0.2-1' }),
                        _a));
                    mockGetInput.mockImplementation(function (arg) {
                        if (arg !== 'GITHUB_TOKEN') {
                            return;
                        }
                        return 'fake_token';
                    });
                    mockGetPullRequestsDeployedBetween.mockImplementation(function (fromRef, toRef) {
                        if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                            return __spreadArray([], baseNewPullRequests, true);
                        }
                        return [];
                    });
                    mockListIssues.mockImplementation(function (args) {
                        if (args.labels === CONST_1.default.LABELS.STAGING_DEPLOY) {
                            return Promise.resolve({ data: [closedStagingDeployCash] });
                        }
                        return Promise.resolve({ data: [] });
                    });
                    return [4 /*yield*/, (0, createOrUpdateStagingDeploy_1.default)()];
                case 1:
                    result = _b.sent();
                    expect(result).toStrictEqual({
                        owner: CONST_1.default.GITHUB_OWNER,
                        repo: CONST_1.default.APP_REPO,
                        title: "Deploy Checklist: New Expensify ".concat(fns.format(new Date(), 'yyyy-MM-dd')),
                        labels: [CONST_1.default.LABELS.STAGING_DEPLOY],
                        html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/29"),
                        assignees: [CONST_1.default.APPLAUSE_BOT],
                        body: "".concat(baseExpectedOutput()) +
                            "".concat(openCheckbox).concat(basePRList.at(5)) +
                            "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(6)) +
                            "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(7)).concat(lineBreak) +
                            "".concat(lineBreakDouble).concat(deployerVerificationsHeader) +
                            "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationCurrentRelease) +
                            "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationPreviousRelease) +
                            "".concat(lineBreak).concat(openCheckbox).concat(ghVerification) +
                            "".concat(lineBreakDouble).concat(ccApplauseLeads),
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    describe('updates existing issue when there is one open', function () {
        var openStagingDeployCashBefore = {
            url: "https://api.github.com/repos/".concat(process.env.GITHUB_REPOSITORY, "/issues/29"),
            title: 'Test StagingDeployCash',
            number: 29,
            labels: [LABELS.STAGING_DEPLOY_CASH],
            // eslint-disable-next-line max-len
            body: "".concat(baseExpectedOutput()) +
                "".concat(openCheckbox).concat(basePRList.at(5)) +
                "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(6)) +
                "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(7)).concat(lineBreak) +
                "".concat(lineBreakDouble).concat(deployBlockerHeader) +
                "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(5)) +
                "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(8)) +
                "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(9)).concat(lineBreak) +
                "".concat(lineBreakDouble).concat(deployerVerificationsHeader) +
                "".concat(lineBreak).concat(closedCheckbox).concat(firebaseVerificationCurrentRelease) +
                "".concat(lineBreak).concat(closedCheckbox).concat(firebaseVerificationPreviousRelease) +
                "".concat(lineBreak).concat(closedCheckbox).concat(ghVerification) +
                "".concat(lineBreakDouble).concat(ccApplauseLeads),
            state: 'open',
        };
        var currentDeployBlockers = [
            {
                html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/6"),
                number: 6,
                state: 'open',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
            {
                html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/9"),
                number: 9,
                state: 'open',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
            {
                html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/10"),
                number: 10,
                state: 'closed',
                labels: [LABELS.DEPLOY_BLOCKER_CASH],
            },
        ];
        test('with NPM_VERSION input, pull requests, and deploy blockers', function () { return __awaiter(void 0, void 0, void 0, function () {
            var newPullRequests, result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        memfs_1.vol.reset();
                        memfs_1.vol.fromJSON((_a = {},
                            _a[PATH_TO_PACKAGE_JSON] = JSON.stringify({ version: '1.0.2-2' }),
                            _a));
                        mockGetInput.mockImplementation(function (arg) {
                            if (arg !== 'GITHUB_TOKEN') {
                                return;
                            }
                            return 'fake_token';
                        });
                        newPullRequests = [9, 10];
                        mockGetPullRequestsDeployedBetween.mockImplementation(function (fromRef, toRef) {
                            if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-2-staging') {
                                return __spreadArray(__spreadArray([], baseNewPullRequests, true), newPullRequests, true);
                            }
                            return [];
                        });
                        mockListIssues.mockImplementation(function (args) {
                            if (args.labels === CONST_1.default.LABELS.STAGING_DEPLOY) {
                                return Promise.resolve({ data: [openStagingDeployCashBefore, closedStagingDeployCash] });
                            }
                            if (args.labels === CONST_1.default.LABELS.DEPLOY_BLOCKER) {
                                return Promise.resolve({
                                    data: __spreadArray(__spreadArray([], currentDeployBlockers, true), [
                                        {
                                            html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/11"), // New
                                            number: 11,
                                            state: 'open',
                                            labels: [LABELS.DEPLOY_BLOCKER_CASH],
                                        },
                                        {
                                            html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/12"), // New
                                            number: 12,
                                            state: 'open',
                                            labels: [LABELS.DEPLOY_BLOCKER_CASH],
                                        },
                                    ], false),
                                });
                            }
                            return Promise.resolve({ data: [] });
                        });
                        return [4 /*yield*/, (0, createOrUpdateStagingDeploy_1.default)()];
                    case 1:
                        result = _b.sent();
                        expect(result).toStrictEqual({
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                            issue_number: openStagingDeployCashBefore.number,
                            // eslint-disable-next-line max-len, @typescript-eslint/naming-convention
                            html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/").concat(openStagingDeployCashBefore.number),
                            // eslint-disable-next-line max-len
                            body: "".concat(baseExpectedOutput('1.0.2-2')) +
                                "".concat(openCheckbox).concat(basePRList.at(5)) +
                                "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(6)) +
                                "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(7)) +
                                "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(8)) +
                                "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(9)).concat(lineBreak) +
                                "".concat(lineBreakDouble).concat(deployBlockerHeader) +
                                "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(5)) +
                                "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(8)) +
                                "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(9)) +
                                "".concat(lineBreak).concat(openCheckbox).concat(baseIssueList.at(0)) +
                                "".concat(lineBreak).concat(openCheckbox).concat(baseIssueList.at(1)).concat(lineBreak) +
                                "".concat(lineBreakDouble).concat(deployerVerificationsHeader) +
                                // Note: these will be unchecked with a new app version, and that's intentional
                                "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationCurrentRelease) +
                                "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationPreviousRelease) +
                                "".concat(lineBreak).concat(openCheckbox).concat(ghVerification) +
                                "".concat(lineBreakDouble).concat(ccApplauseLeads),
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        test('without NPM_VERSION input, just a new deploy blocker', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        memfs_1.vol.reset();
                        memfs_1.vol.fromJSON((_a = {},
                            _a[PATH_TO_PACKAGE_JSON] = JSON.stringify({ version: '1.0.2-1' }),
                            _a));
                        mockGetInput.mockImplementation(function (arg) {
                            if (arg !== 'GITHUB_TOKEN') {
                                return;
                            }
                            return 'fake_token';
                        });
                        mockGetPullRequestsDeployedBetween.mockImplementation(function (fromRef, toRef) {
                            if (fromRef === '1.0.1-0-staging' && toRef === '1.0.2-1-staging') {
                                return __spreadArray([], baseNewPullRequests, true);
                            }
                            return [];
                        });
                        mockListIssues.mockImplementation(function (args) {
                            if (args.labels === CONST_1.default.LABELS.STAGING_DEPLOY) {
                                return Promise.resolve({ data: [openStagingDeployCashBefore, closedStagingDeployCash] });
                            }
                            if (args.labels === CONST_1.default.LABELS.DEPLOY_BLOCKER) {
                                return Promise.resolve({
                                    data: __spreadArray(__spreadArray([], currentDeployBlockers.slice(1), true), [
                                        {
                                            html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/11"), // New
                                            number: 11,
                                            state: 'open',
                                            labels: [LABELS.DEPLOY_BLOCKER_CASH],
                                        },
                                        {
                                            html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/12"), // New
                                            number: 12,
                                            state: 'open',
                                            labels: [LABELS.DEPLOY_BLOCKER_CASH],
                                        },
                                    ], false),
                                });
                            }
                            return Promise.resolve({ data: [] });
                        });
                        return [4 /*yield*/, (0, createOrUpdateStagingDeploy_1.default)()];
                    case 1:
                        result = _b.sent();
                        expect(result).toStrictEqual({
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                            issue_number: openStagingDeployCashBefore.number,
                            // eslint-disable-next-line max-len, @typescript-eslint/naming-convention
                            html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/").concat(openStagingDeployCashBefore.number),
                            // eslint-disable-next-line max-len
                            body: "".concat(baseExpectedOutput('1.0.2-1')) +
                                "".concat(openCheckbox).concat(basePRList.at(5)) +
                                "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(6)) +
                                "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(7)).concat(lineBreak) +
                                "".concat(lineBreakDouble).concat(deployBlockerHeader) +
                                "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(5)) +
                                "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(8)) +
                                "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(9)) +
                                "".concat(lineBreak).concat(openCheckbox).concat(baseIssueList.at(0)) +
                                "".concat(lineBreak).concat(openCheckbox).concat(baseIssueList.at(1)).concat(lineBreak) +
                                "".concat(lineBreakDouble).concat(deployerVerificationsHeader) +
                                "".concat(lineBreak).concat(closedCheckbox).concat(firebaseVerificationCurrentRelease) +
                                "".concat(lineBreak).concat(closedCheckbox).concat(firebaseVerificationPreviousRelease) +
                                "".concat(lineBreak).concat(closedCheckbox).concat(ghVerification) +
                                "".concat(lineBreakDouble).concat(ccApplauseLeads),
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    });
});

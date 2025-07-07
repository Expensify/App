"use strict";
/**
 * @jest-environment node
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var core = require("@actions/core");
var request_error_1 = require("@octokit/request-error");
var CONST_1 = require("@github/libs/CONST");
var GithubUtils_1 = require("@github/libs/GithubUtils");
var mockGetInput = jest.fn();
var mockListIssues = jest.fn();
var asMutable = function (value) { return value; };
beforeAll(function () {
    // Mock core module
    asMutable(core).getInput = mockGetInput;
    // Mock octokit module
    var mockOctokit = {
        rest: {
            issues: {
                create: jest.fn().mockImplementation(function (arg) {
                    return Promise.resolve({
                        data: __assign(__assign({}, arg), { html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/29") }),
                    });
                }),
                listForRepo: mockListIssues,
            },
        },
        paginate: jest.fn().mockImplementation(function (objectMethod) { return objectMethod().then(function (_a) {
            var data = _a.data;
            return data;
        }); }),
    };
    GithubUtils_1.default.internalOctokit = mockOctokit;
});
afterEach(function () {
    mockGetInput.mockClear();
    mockListIssues.mockClear();
});
describe('GithubUtils', function () {
    describe('getStagingDeployCash', function () {
        var baseIssue = {
            url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/issues/29',
            title: 'Andrew Test Issue',
            labels: [
                {
                    id: 2783847782,
                    // cspell:disable-next-line
                    node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
                    url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/labels/StagingDeployCash',
                    name: 'StagingDeployCash',
                    color: '6FC269',
                    default: false,
                    description: '',
                },
            ],
            // eslint-disable-next-line max-len
            body: "**Release Version:** `1.0.1-47`\r\n**Compare Changes:** https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n- [ ] https://github.com/").concat(process.env.GITHUB_REPOSITORY, "/pull/21\r\n- [x] https://github.com/").concat(process.env.GITHUB_REPOSITORY, "/pull/22\r\n- [ ] https://github.com/").concat(process.env.GITHUB_REPOSITORY, "/pull/23\r\n\r\n"),
        };
        var issueWithDeployBlockers = __assign({}, baseIssue);
        // eslint-disable-next-line max-len
        issueWithDeployBlockers.body += "\r\n**Deploy Blockers:**\r\n- [ ] https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/1\r\n- [x] https://github.com/").concat(process.env.GITHUB_REPOSITORY, "/issues/2\r\n- [ ] https://github.com/").concat(process.env.GITHUB_REPOSITORY, "/pull/1234\r\n");
        var baseExpectedResponse = {
            PRList: [
                {
                    url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/21"),
                    number: 21,
                    isVerified: false,
                },
                {
                    url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/22"),
                    number: 22,
                    isVerified: true,
                },
                {
                    url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/23"),
                    number: 23,
                    isVerified: false,
                },
            ],
            labels: [
                {
                    color: '6FC269',
                    default: false,
                    description: '',
                    id: 2783847782,
                    name: 'StagingDeployCash',
                    // cspell:disable-next-line
                    node_id: 'MDU6TGFiZWwyNzgzODQ3Nzgy',
                    url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/labels/StagingDeployCash',
                },
            ],
            version: '1.0.1-47',
            tag: '1.0.1-47-staging',
            title: 'Andrew Test Issue',
            url: 'https://api.github.com/repos/Andrew-Test-Org/Public-Test-Repo/issues/29',
            number: 29,
            deployBlockers: [],
            internalQAPRList: [],
            isFirebaseChecked: false,
            isGHStatusChecked: false,
        };
        var expectedResponseWithDeployBlockers = __assign({}, baseExpectedResponse);
        expectedResponseWithDeployBlockers.deployBlockers = [
            {
                url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/1"),
                number: 1,
                isResolved: false,
            },
            {
                url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/2"),
                number: 2,
                isResolved: true,
            },
            {
                url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/1234"),
                number: 1234,
                isResolved: false,
            },
        ];
        test('Test finding an open issue with no PRs successfully', function () {
            var bareIssue = __assign(__assign({}, baseIssue), { 
                // eslint-disable-next-line max-len
                body: "**Release Version:** `1.0.1-47`\r\n**Compare Changes:** https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/compare/production...staging\r\n\r\ncc @Expensify/applauseleads\n") });
            var bareExpectedResponse = __assign(__assign({}, baseExpectedResponse), { PRList: [] });
            GithubUtils_1.default.octokit.issues.listForRepo = jest.fn().mockResolvedValue({ data: [bareIssue] });
            return GithubUtils_1.default.getStagingDeployCash().then(function (data) { return expect(data).toStrictEqual(bareExpectedResponse); });
        });
        test('Test finding an open issue successfully', function () {
            GithubUtils_1.default.octokit.issues.listForRepo = jest.fn().mockResolvedValue({ data: [baseIssue] });
            return GithubUtils_1.default.getStagingDeployCash().then(function (data) { return expect(data).toStrictEqual(baseExpectedResponse); });
        });
        test('Test finding an open issue successfully and parsing with deploy blockers', function () {
            GithubUtils_1.default.octokit.issues.listForRepo = jest.fn().mockResolvedValue({ data: [issueWithDeployBlockers] });
            return GithubUtils_1.default.getStagingDeployCash().then(function (data) { return expect(data).toStrictEqual(expectedResponseWithDeployBlockers); });
        });
        test('Test finding an open issue successfully and parsing with blockers w/o carriage returns', function () {
            var modifiedIssueWithDeployBlockers = __assign({}, issueWithDeployBlockers);
            modifiedIssueWithDeployBlockers.body = modifiedIssueWithDeployBlockers.body.replace(/\r/g, '');
            GithubUtils_1.default.octokit.issues.listForRepo = jest.fn().mockResolvedValue({
                data: [modifiedIssueWithDeployBlockers],
            });
            return GithubUtils_1.default.getStagingDeployCash().then(function (data) { return expect(data).toStrictEqual(expectedResponseWithDeployBlockers); });
        });
        test('Test finding an open issue without a body', function () {
            var noBodyIssue = baseIssue;
            noBodyIssue.body = '';
            GithubUtils_1.default.octokit.issues.listForRepo = jest.fn().mockResolvedValue({ data: [noBodyIssue] });
            return GithubUtils_1.default.getStagingDeployCash().catch(function (e) { return expect(e).toEqual(new Error('Unable to find StagingDeployCash issue with correct data.')); });
        });
        test('Test finding more than one issue', function () {
            GithubUtils_1.default.octokit.issues.listForRepo = jest.fn().mockResolvedValue({ data: [{ a: 1 }, { b: 2 }] });
            return GithubUtils_1.default.getStagingDeployCash().catch(function (e) { return expect(e).toEqual(new Error('Found more than one StagingDeployCash issue.')); });
        });
        test('Test finding no issues', function () {
            GithubUtils_1.default.octokit.issues.listForRepo = jest.fn().mockResolvedValue({ data: [] });
            return GithubUtils_1.default.getStagingDeployCash().catch(function (e) { return expect(e).toEqual(new Error('Unable to find StagingDeployCash issue.')); });
        });
    });
    describe('getPullRequestNumberFromURL', function () {
        describe('valid pull requests', function () {
            test.each([
                ['https://github.com/Expensify/Expensify/pull/156369', 156369],
                ["https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/1644"), 1644],
                ['https://github.com/Expensify/expensify-common/pull/346', 346],
                ['https://api.github.com/repos/Expensify/Expensify/pull/156369', 156369],
                ["https://api.github.com/repos/".concat(process.env.GITHUB_REPOSITORY, "/pull/1644"), 1644],
                ['https://api.github.com/repos/Expensify/expensify-common/pull/346', 346],
            ])('getPullRequestNumberFromURL("%s")', function (input, expected) {
                expect(GithubUtils_1.default.getPullRequestNumberFromURL(input)).toBe(expected);
            });
        });
        describe('invalid pull requests', function () {
            test.each([
                ['https://www.google.com/'],
                ['https://github.com/Expensify/Expensify/issues/156481'],
                ['https://docs.google.com/document/d/1mMFh-m1seOES48r3zNqcvfuTvr3qOAsY6n5rP4ejdXE/edit?ts=602420d2#'],
            ])('getPullRequestNumberFromURL("%s")', function (input) {
                expect(function () {
                    GithubUtils_1.default.getPullRequestNumberFromURL(input);
                }).toThrow(new Error("Provided URL ".concat(input, " is not a Github Pull Request!")));
            });
        });
    });
    describe('getIssueNumberFromURL', function () {
        describe('valid issues', function () {
            test.each([
                ['https://github.com/Expensify/Expensify/issues/156369', 156369],
                ["https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/1644"), 1644],
                ['https://github.com/Expensify/expensify-common/issues/346', 346],
                ['https://api.github.com/repos/Expensify/Expensify/issues/156369', 156369],
                ["https://api.github.com/repos/".concat(process.env.GITHUB_REPOSITORY, "/issues/1644"), 1644],
                ['https://api.github.com/repos/Expensify/expensify-common/issues/346', 346],
            ])('getIssueNumberFromURL("%s")', function (input, expected) {
                expect(GithubUtils_1.default.getIssueNumberFromURL(input)).toBe(expected);
            });
        });
        describe('invalid issues', function () {
            test.each([
                ['https://www.google.com/'],
                ['https://github.com/Expensify/Expensify/pull/156481'],
                ['https://docs.google.com/document/d/1mMFh-m1seOES48r3zNqcvfuTvr3qOAsY6n5rP4ejdXE/edit?ts=602420d2#'],
            ])('getIssueNumberFromURL("%s")', function (input) {
                expect(function () {
                    GithubUtils_1.default.getIssueNumberFromURL(input);
                }).toThrow(new Error("Provided URL ".concat(input, " is not a Github Issue!")));
            });
        });
    });
    describe('getIssueOrPullRequestNumberFromURL', function () {
        describe('valid issues and pull requests', function () {
            test.each([
                ['https://github.com/Expensify/Expensify/issues/156369', 156369],
                ["https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/1644"), 1644],
                ['https://github.com/Expensify/expensify-common/issues/346', 346],
                ['https://github.com/Expensify/Expensify/pull/156369', 156369],
                ["https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/1644"), 1644],
                ['https://github.com/Expensify/expensify-common/pull/346', 346],
                ['https://api.github.com/repos/Expensify/Expensify/issues/156369', 156369],
                ["https://api.github.com/repos/".concat(process.env.GITHUB_REPOSITORY, "/issues/1644"), 1644],
                ['https://api.github.com/repos/Expensify/expensify-common/issues/346', 346],
                ['https://api.github.com/repos/Expensify/Expensify/pull/156369', 156369],
                ["https://api.github.com/repos/".concat(process.env.GITHUB_REPOSITORY, "/pull/1644"), 1644],
                ['https://api.github.com/repos/Expensify/expensify-common/pull/346', 346],
            ])('getIssueOrPullRequestNumberFromURL("%s")', function (input, expected) {
                expect(GithubUtils_1.default.getIssueOrPullRequestNumberFromURL(input)).toBe(expected);
            });
        });
        describe('invalid issues/pull requests', function () {
            test.each([['https://www.google.com/'], ['https://docs.google.com/document/d/1mMFh-m1seOES48r3zNqcvfuTvr3qOAsY6n5rP4ejdXE/edit?ts=602420d2#']])('getIssueOrPullRequestNumberFromURL("%s")', function (input) {
                expect(function () {
                    GithubUtils_1.default.getIssueOrPullRequestNumberFromURL(input);
                }).toThrow(new Error("Provided URL ".concat(input, " is not a valid Github Issue or Pull Request!")));
            });
        });
    });
    describe('generateStagingDeployCashBody', function () {
        var mockTags = [{ name: '1.0.2-0' }, { name: '1.0.2-12' }];
        var mockPRs = [
            {
                number: 1,
                title: 'Test PR 1',
                html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/1"),
                user: { login: 'username' },
                labels: [],
            },
            {
                number: 2,
                title: 'Test PR 2',
                html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/2"),
                user: { login: 'username' },
                labels: [],
            },
            {
                number: 3,
                title: 'Test PR 3',
                html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/3"),
                user: { login: 'username' },
                labels: [],
            },
            {
                number: 4,
                title: '[NO QA] Test No QA PR uppercase',
                html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/4"),
                user: { login: 'username' },
                labels: [],
            },
            {
                number: 5,
                title: '[NoQa] Test No QA PR Title Case',
                html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/5"),
                user: { login: 'username' },
                labels: [],
            },
            {
                number: 6,
                title: '[Internal QA] Another Test Internal QA PR',
                html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/6"),
                user: { login: 'username' },
                labels: [
                    {
                        id: 1234,
                        node_id: 'MDU6TGFiZWwyMDgwNDU5NDY=',
                        url: "https://api.github.com/".concat(process.env.GITHUB_REPOSITORY, "/labels/InternalQA"),
                        name: 'InternalQA',
                        description: 'An Expensifier needs to test this.',
                        color: 'f29513',
                    },
                ],
                assignees: [],
            },
            {
                number: 7,
                title: '[Internal QA] Another Test Internal QA PR',
                html_url: "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/7"),
                user: { login: 'username' },
                labels: [
                    {
                        id: 1234,
                        node_id: 'MDU6TGFiZWwyMDgwNDU5NDY=',
                        url: "https://api.github.com/".concat(process.env.GITHUB_REPOSITORY, "/labels/InternalQA"),
                        name: 'InternalQA',
                        description: 'An Expensifier needs to test this.',
                        color: 'f29513',
                    },
                ],
                assignees: [],
            },
        ];
        var mockInternalQaPR = {
            merged_by: { login: 'octocat' },
        };
        var mockGithub = jest.fn(function () { return ({
            getOctokit: function () { return ({
                rest: {
                    repos: {
                        listTags: jest.fn().mockResolvedValue({ data: mockTags }),
                    },
                    pulls: {
                        list: jest.fn().mockResolvedValue({ data: mockPRs }),
                        get: jest.fn().mockResolvedValue({ data: mockInternalQaPR }),
                    },
                },
                paginate: jest.fn().mockImplementation(function (objectMethod) { return objectMethod().then(function (_a) {
                    var data = _a.data;
                    return data;
                }); }),
            }); },
        }); });
        var octokit = mockGithub().getOctokit();
        var githubUtils = /** @class */ (function (_super) {
            __extends(githubUtils, _super);
            function githubUtils() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return githubUtils;
        }(GithubUtils_1.default));
        githubUtils.internalOctokit = octokit;
        var tag = '1.0.2-12';
        var basePRList = [
            "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/2"),
            "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/3"),
            "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/1"),
            "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/3"), // This is an intentional duplicate for testing duplicates
            "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/4"), // No QA
            "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/5"),
        ];
        var internalQAPRList = [
            "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/6"), // Internal QA
            "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/7"),
        ];
        var baseDeployBlockerList = ["https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/3"), "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/issues/4")];
        // eslint-disable-next-line max-len
        var baseExpectedOutput = "**Release Version:** `".concat(tag, "`\r\n**Compare Changes:** https://github.com/").concat(process.env.GITHUB_REPOSITORY, "/compare/production...staging\r\n\r\n**This release contains changes from the following pull requests:**\r\n");
        var openCheckbox = '- [ ] ';
        var closedCheckbox = '- [x] ';
        var ccApplauseLeads = 'cc @Expensify/applauseleads\r\n';
        var deployBlockerHeader = '\r\n**Deploy Blockers:**';
        var internalQAHeader = '\r\n\r\n**Internal QA:**';
        var lineBreak = '\r\n';
        var lineBreakDouble = '\r\n\r\n';
        var assignOctocat = ' - @octocat';
        var deployerVerificationsHeader = '\r\n**Deployer verifications:**';
        // eslint-disable-next-line max-len
        var firebaseVerificationCurrentRelease = 'I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-mobile-app/crashlytics/app/ios:com.expensify.expensifylite/issues?state=open&time=last-seven-days&types=crash&tag=all&sort=eventCount) for **this release version** and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).';
        // eslint-disable-next-line max-len
        var firebaseVerificationPreviousRelease = 'I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-mobile-app/crashlytics/app/android:org.me.mobiexpensifyg/issues?state=open&time=last-seven-days&types=crash&tag=all&sort=eventCount) for **the previous release version** and verified that the release did not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).';
        // eslint-disable-next-line max-len
        var ghVerification = 'I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.';
        // Valid output which will be reused in the deploy blocker tests
        var allVerifiedExpectedOutput = "".concat(baseExpectedOutput) +
            "".concat(closedCheckbox).concat(basePRList.at(2)) +
            "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(0)) +
            "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(1)) +
            "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(4)) +
            "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(5)) +
            "".concat(lineBreak);
        test('Test no verified PRs', function () {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList).then(function (issue) {
                if (typeof issue !== 'object') {
                    return;
                }
                expect(issue.issueBody).toBe("".concat(baseExpectedOutput) +
                    "".concat(openCheckbox).concat(basePRList.at(2)) +
                    "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(0)) +
                    "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(1)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(4)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(5)) +
                    "".concat(lineBreakDouble).concat(deployerVerificationsHeader) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationCurrentRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationPreviousRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(ghVerification) +
                    "".concat(lineBreakDouble).concat(ccApplauseLeads));
                expect(issue.issueAssignees).toEqual([]);
            });
        });
        test('Test some verified PRs', function () {
            var _a;
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, [(_a = basePRList.at(0)) !== null && _a !== void 0 ? _a : '']).then(function (issue) {
                if (typeof issue !== 'object') {
                    return;
                }
                expect(issue.issueBody).toBe("".concat(baseExpectedOutput) +
                    "".concat(openCheckbox).concat(basePRList.at(2)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(0)) +
                    "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(1)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(4)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(5)) +
                    "".concat(lineBreakDouble).concat(deployerVerificationsHeader) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationCurrentRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationPreviousRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(ghVerification) +
                    "".concat(lineBreakDouble).concat(ccApplauseLeads));
                expect(issue.issueAssignees).toEqual([]);
            });
        });
        test('Test all verified PRs', function () {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, basePRList).then(function (issue) {
                if (typeof issue !== 'object') {
                    return;
                }
                expect(issue.issueBody).toBe("".concat(allVerifiedExpectedOutput) +
                    "".concat(lineBreak).concat(deployerVerificationsHeader) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationCurrentRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationPreviousRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(ghVerification) +
                    "".concat(lineBreakDouble).concat(ccApplauseLeads));
                expect(issue.issueAssignees).toEqual([]);
            });
        });
        test('Test no resolved deploy blockers', function () {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, basePRList, baseDeployBlockerList).then(function (issue) {
                if (typeof issue !== 'object') {
                    return;
                }
                expect(issue.issueBody).toBe("".concat(allVerifiedExpectedOutput) +
                    "".concat(lineBreak).concat(deployBlockerHeader) +
                    "".concat(lineBreak).concat(openCheckbox).concat(baseDeployBlockerList.at(0)) +
                    "".concat(lineBreak).concat(openCheckbox).concat(baseDeployBlockerList.at(1)) +
                    "".concat(lineBreakDouble).concat(deployerVerificationsHeader) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationCurrentRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationPreviousRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(ghVerification).concat(lineBreak) +
                    "".concat(lineBreak).concat(ccApplauseLeads));
                expect(issue.issueAssignees).toEqual([]);
            });
        });
        test('Test some resolved deploy blockers', function () {
            var _a;
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, basePRList, baseDeployBlockerList, [(_a = baseDeployBlockerList.at(0)) !== null && _a !== void 0 ? _a : '']).then(function (issue) {
                if (typeof issue !== 'object') {
                    return;
                }
                expect(issue.issueBody).toBe("".concat(allVerifiedExpectedOutput) +
                    "".concat(lineBreak).concat(deployBlockerHeader) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(baseDeployBlockerList.at(0)) +
                    "".concat(lineBreak).concat(openCheckbox).concat(baseDeployBlockerList.at(1)) +
                    "".concat(lineBreakDouble).concat(deployerVerificationsHeader) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationCurrentRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationPreviousRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(ghVerification) +
                    "".concat(lineBreakDouble).concat(ccApplauseLeads));
                expect(issue.issueAssignees).toEqual([]);
            });
        });
        test('Test all resolved deploy blockers', function () {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, basePRList, basePRList, baseDeployBlockerList, baseDeployBlockerList).then(function (issue) {
                if (typeof issue !== 'object') {
                    return;
                }
                expect(issue.issueBody).toBe("".concat(baseExpectedOutput) +
                    "".concat(closedCheckbox).concat(basePRList.at(2)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(0)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(1)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(4)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(5)) +
                    "".concat(lineBreakDouble).concat(deployBlockerHeader) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(baseDeployBlockerList.at(0)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(baseDeployBlockerList.at(1)) +
                    "".concat(lineBreakDouble).concat(deployerVerificationsHeader) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationCurrentRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationPreviousRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(ghVerification) +
                    "".concat(lineBreakDouble).concat(ccApplauseLeads));
                expect(issue.issueAssignees).toEqual([]);
            });
        });
        test('Test internalQA PRs', function () {
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, __spreadArray(__spreadArray([], basePRList, true), internalQAPRList, true)).then(function (issue) {
                if (typeof issue !== 'object') {
                    return;
                }
                expect(issue.issueBody).toBe("".concat(baseExpectedOutput) +
                    "".concat(openCheckbox).concat(basePRList.at(2)) +
                    "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(0)) +
                    "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(1)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(4)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(5)) +
                    "".concat(lineBreak).concat(internalQAHeader) +
                    "".concat(lineBreak).concat(openCheckbox).concat(internalQAPRList.at(0)).concat(assignOctocat) +
                    "".concat(lineBreak).concat(openCheckbox).concat(internalQAPRList.at(1)).concat(assignOctocat) +
                    "".concat(lineBreakDouble).concat(deployerVerificationsHeader) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationCurrentRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationPreviousRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(ghVerification) +
                    "".concat(lineBreakDouble).concat(ccApplauseLeads));
                expect(issue.issueAssignees).toEqual(['octocat']);
            });
        });
        test('Test some verified internalQA PRs', function () {
            var _a;
            githubUtils.generateStagingDeployCashBodyAndAssignees(tag, __spreadArray(__spreadArray([], basePRList, true), internalQAPRList, true), [], [], [], [(_a = internalQAPRList.at(0)) !== null && _a !== void 0 ? _a : '']).then(function (issue) {
                if (typeof issue !== 'object') {
                    return;
                }
                expect(issue.issueBody).toBe("".concat(baseExpectedOutput) +
                    "".concat(openCheckbox).concat(basePRList.at(2)) +
                    "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(0)) +
                    "".concat(lineBreak).concat(openCheckbox).concat(basePRList.at(1)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(4)) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(basePRList.at(5)) +
                    "".concat(lineBreak).concat(internalQAHeader) +
                    "".concat(lineBreak).concat(closedCheckbox).concat(internalQAPRList.at(0)).concat(assignOctocat) +
                    "".concat(lineBreak).concat(openCheckbox).concat(internalQAPRList.at(1)).concat(assignOctocat) +
                    "".concat(lineBreakDouble).concat(deployerVerificationsHeader) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationCurrentRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(firebaseVerificationPreviousRelease) +
                    "".concat(lineBreak).concat(openCheckbox).concat(ghVerification) +
                    "".concat(lineBreakDouble).concat(ccApplauseLeads));
                expect(issue.issueAssignees).toEqual(['octocat']);
            });
        });
    });
    var commitHistoryData = {
        emptyResponse: {
            data: {
                commits: [],
            },
        },
        singleCommit: {
            data: {
                commits: [
                    {
                        sha: 'abc123',
                        commit: {
                            message: 'Test commit message',
                            author: {
                                name: 'Test Author',
                            },
                        },
                        author: {
                            login: 'username',
                        },
                    },
                ],
            },
        },
        expectedFormattedCommit: [
            {
                commit: 'abc123',
                subject: 'Test commit message',
                authorName: 'Test Author',
            },
        ],
        multipleCommitsResponse: {
            data: {
                commits: [
                    {
                        sha: 'abc123',
                        commit: {
                            message: 'First commit',
                            author: { name: 'Author One' },
                        },
                    },
                    {
                        sha: 'def456',
                        commit: {
                            message: 'Second commit',
                            author: { name: 'Author Two' },
                        },
                    },
                ],
            },
        },
    };
    describe('getCommitHistoryBetweenTags', function () {
        var mockCompareCommits;
        beforeEach(function () {
            jest.spyOn(core, 'getInput').mockImplementation(function (name) {
                if (name === 'GITHUB_TOKEN') {
                    return 'mock-token';
                }
                return '';
            });
            // Prepare the mocked GitHub API
            mockCompareCommits = jest.fn();
            var mockOctokitInstance = {
                rest: {
                    repos: {
                        compareCommits: mockCompareCommits,
                    },
                },
                paginate: jest.fn(),
            };
            // Replace the real initOctokit with our mocked one
            jest.spyOn(GithubUtils_1.default, 'initOctokit').mockImplementation(function () { });
            GithubUtils_1.default.internalOctokit = mockOctokitInstance;
        });
        afterEach(function () {
            jest.restoreAllMocks();
        });
        test('should call GitHub API with correct parameters', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCompareCommits.mockResolvedValue(commitHistoryData.emptyResponse);
                        return [4 /*yield*/, GithubUtils_1.default.getCommitHistoryBetweenTags('v1.0.0', 'v1.0.1')];
                    case 1:
                        _a.sent();
                        expect(mockCompareCommits).toHaveBeenCalledWith({
                            owner: CONST_1.default.GITHUB_OWNER,
                            repo: CONST_1.default.APP_REPO,
                            base: 'v1.0.0',
                            head: 'v1.0.1',
                            page: 1,
                            per_page: 250,
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        test('should return empty array when no commits found', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCompareCommits.mockResolvedValue(commitHistoryData.emptyResponse);
                        return [4 /*yield*/, GithubUtils_1.default.getCommitHistoryBetweenTags('1.0.0', '1.0.1')];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual([]);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should return formatted commit history when commits exist', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCompareCommits.mockResolvedValue(commitHistoryData.singleCommit);
                        return [4 /*yield*/, GithubUtils_1.default.getCommitHistoryBetweenTags('1.0.0', '1.0.1')];
                    case 1:
                        result = _a.sent();
                        expect(result).toEqual(commitHistoryData.expectedFormattedCommit);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle multiple commits correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCompareCommits.mockResolvedValue(commitHistoryData.multipleCommitsResponse);
                        return [4 /*yield*/, GithubUtils_1.default.getCommitHistoryBetweenTags('1.0.0', '1.0.1')];
                    case 1:
                        result = _a.sent();
                        expect(result).toHaveLength(2);
                        expect(result.at(0)).toEqual({
                            commit: 'abc123',
                            subject: 'First commit',
                            authorName: 'Author One',
                        });
                        expect(result.at(1)).toEqual({
                            commit: 'def456',
                            subject: 'Second commit',
                            authorName: 'Author Two',
                        });
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle 404 RequestError with specific error message', function () { return __awaiter(void 0, void 0, void 0, function () {
            var consoleErrorSpy, requestError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
                        requestError = new request_error_1.RequestError('Not Found', 404, {
                            request: {
                                method: 'GET',
                                url: '/repos/compare',
                                headers: {},
                            },
                        });
                        mockCompareCommits.mockRejectedValue(requestError);
                        return [4 /*yield*/, expect(GithubUtils_1.default.getCommitHistoryBetweenTags('1.0.0', '1.0.1')).rejects.toThrow(requestError)];
                    case 1:
                        _a.sent();
                        expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining("❓❓ Failed to get commits with the GitHub API. The base tag ('1.0.0') or head tag ('1.0.1') likely doesn't exist on the remote repository. If this is the case, create or push them."));
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle generic API errors gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockCompareCommits.mockRejectedValue(new Error('API Error'));
                        return [4 /*yield*/, expect(GithubUtils_1.default.getCommitHistoryBetweenTags('1.0.0', '1.0.1')).rejects.toThrow('API Error')];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('getPullRequestURLFromNumber', function () {
        test.each([
            [1234, "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/1234")],
            [54321, "https://github.com/".concat(process.env.GITHUB_REPOSITORY, "/pull/54321")],
        ])('getPullRequestNumberFromURL("%s")', function (input, expectedOutput) { return expect(GithubUtils_1.default.getPullRequestURLFromNumber(input)).toBe(expectedOutput); });
    });
});

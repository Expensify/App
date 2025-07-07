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
/* eslint-disable @typescript-eslint/naming-convention, import/no-import-module-exports */
var core = require("@actions/core");
var utils_1 = require("@actions/github/lib/utils");
var plugin_paginate_rest_1 = require("@octokit/plugin-paginate-rest");
var plugin_throttling_1 = require("@octokit/plugin-throttling");
var request_error_1 = require("@octokit/request-error");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var arrayDifference_1 = require("@src/utils/arrayDifference");
var CONST_1 = require("./CONST");
var GithubUtils = /** @class */ (function () {
    function GithubUtils() {
    }
    /**
     * Initialize internal octokit.
     * NOTE: When using GithubUtils in CI, you don't need to call this manually.
     */
    GithubUtils.initOctokitWithToken = function (token) {
        var Octokit = utils_1.GitHub.plugin(plugin_throttling_1.throttling, plugin_paginate_rest_1.paginateRest);
        // Save a copy of octokit used in this class
        this.internalOctokit = new Octokit((0, utils_1.getOctokitOptions)(token, {
            throttle: {
                retryAfterBaseValue: 2000,
                onRateLimit: function (retryAfter, options) {
                    console.warn("Request quota exhausted for request ".concat(options.method, " ").concat(options.url));
                    // Retry five times when hitting a rate limit error, then give up
                    if (options.request.retryCount <= 5) {
                        console.log("Retrying after ".concat(retryAfter, " seconds!"));
                        return true;
                    }
                },
                onAbuseLimit: function (retryAfter, options) {
                    // does not retry, only logs a warning
                    console.warn("Abuse detected for request ".concat(options.method, " ").concat(options.url));
                },
            },
        }));
    };
    /**
     * Default initialize method assuming running in CI, getting the token from an input.
     *
     * @private
     */
    GithubUtils.initOctokit = function () {
        var _a;
        var token = (_a = process.env.GITHUB_TOKEN) !== null && _a !== void 0 ? _a : core.getInput('GITHUB_TOKEN', { required: true });
        if (!token) {
            console.error('GitHubUtils could not find GITHUB_TOKEN');
            process.exit(1);
        }
        this.initOctokitWithToken(token);
    };
    Object.defineProperty(GithubUtils, "octokit", {
        /**
         * Either give an existing instance of Octokit rest or create a new one
         *
         * @readonly
         * @static
         */
        get: function () {
            if (!this.internalOctokit) {
                this.initOctokit();
            }
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            return this.internalOctokit.rest;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GithubUtils, "graphql", {
        /**
         * Get the graphql instance from internal octokit.
         * @readonly
         * @static
         */
        get: function () {
            if (!this.internalOctokit) {
                this.initOctokit();
            }
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            return this.internalOctokit.graphql;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GithubUtils, "paginate", {
        /**
         * Either give an existing instance of Octokit paginate or create a new one
         *
         * @readonly
         * @static
         */
        get: function () {
            if (!this.internalOctokit) {
                this.initOctokit();
            }
            // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
            return this.internalOctokit.paginate;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Finds one open `StagingDeployCash` issue via GitHub octokit library.
     */
    GithubUtils.getStagingDeployCash = function () {
        var _this = this;
        return this.octokit.issues
            .listForRepo({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            labels: CONST_1.default.LABELS.STAGING_DEPLOY,
            state: 'open',
        })
            .then(function (_a) {
            var data = _a.data;
            if (!data.length) {
                throw new Error("Unable to find ".concat(CONST_1.default.LABELS.STAGING_DEPLOY, " issue."));
            }
            if (data.length > 1) {
                throw new Error("Found more than one ".concat(CONST_1.default.LABELS.STAGING_DEPLOY, " issue."));
            }
            var issue = data.at(0);
            if (!issue) {
                throw new Error("Found an undefined ".concat(CONST_1.default.LABELS.STAGING_DEPLOY, " issue."));
            }
            return _this.getStagingDeployCashData(issue);
        });
    };
    /**
     * Takes in a GitHub issue object and returns the data we want.
     */
    GithubUtils.getStagingDeployCashData = function (issue) {
        var _a, _b, _c;
        try {
            var versionRegex = new RegExp('([0-9]+)\\.([0-9]+)\\.([0-9]+)(?:-([0-9]+))?', 'g');
            var version = ((_c = (_b = (_a = issue.body) === null || _a === void 0 ? void 0 : _a.match(versionRegex)) === null || _b === void 0 ? void 0 : _b[0]) !== null && _c !== void 0 ? _c : '').replace(/`/g, '');
            return {
                title: issue.title,
                url: issue.url,
                number: this.getIssueOrPullRequestNumberFromURL(issue.url),
                labels: issue.labels,
                PRList: this.getStagingDeployCashPRList(issue),
                deployBlockers: this.getStagingDeployCashDeployBlockers(issue),
                internalQAPRList: this.getStagingDeployCashInternalQA(issue),
                isFirebaseChecked: issue.body ? /-\s\[x]\sI checked \[Firebase Crashlytics]/.test(issue.body) : false,
                isGHStatusChecked: issue.body ? /-\s\[x]\sI checked \[GitHub Status]/.test(issue.body) : false,
                version: version,
                tag: "".concat(version, "-staging"),
            };
        }
        catch (exception) {
            throw new Error("Unable to find ".concat(CONST_1.default.LABELS.STAGING_DEPLOY, " issue with correct data."));
        }
    };
    /**
     * Parse the PRList and Internal QA section of the StagingDeployCash issue body.
     *
     * @private
     */
    GithubUtils.getStagingDeployCashPRList = function (issue) {
        var _a, _b;
        var PRListSection = (_b = (_a = issue.body) === null || _a === void 0 ? void 0 : _a.match(/pull requests:\*\*\r?\n((?:-.*\r?\n)+)\r?\n\r?\n?/)) !== null && _b !== void 0 ? _b : null;
        if ((PRListSection === null || PRListSection === void 0 ? void 0 : PRListSection.length) !== 2) {
            // No PRs, return an empty array
            console.log('Hmmm...The open StagingDeployCash does not list any pull requests, continuing...');
            return [];
        }
        PRListSection = PRListSection[1];
        var PRList = __spreadArray([], PRListSection.matchAll(new RegExp("- \\[([ x])] (".concat(CONST_1.default.PULL_REQUEST_REGEX.source, ")"), 'g')), true).map(function (match) { return ({
            url: match[2],
            number: Number.parseInt(match[3], 10),
            isVerified: match[1] === 'x',
        }); });
        return PRList.sort(function (a, b) { return a.number - b.number; });
    };
    /**
     * Parse DeployBlocker section of the StagingDeployCash issue body.
     *
     * @private
     */
    GithubUtils.getStagingDeployCashDeployBlockers = function (issue) {
        var _a, _b;
        var deployBlockerSection = (_b = (_a = issue.body) === null || _a === void 0 ? void 0 : _a.match(/Deploy Blockers:\*\*\r?\n((?:-.*\r?\n)+)/)) !== null && _b !== void 0 ? _b : null;
        if ((deployBlockerSection === null || deployBlockerSection === void 0 ? void 0 : deployBlockerSection.length) !== 2) {
            return [];
        }
        deployBlockerSection = deployBlockerSection[1];
        var deployBlockers = __spreadArray([], deployBlockerSection.matchAll(new RegExp("- \\[([ x])]\\s(".concat(CONST_1.default.ISSUE_OR_PULL_REQUEST_REGEX.source, ")"), 'g')), true).map(function (match) { return ({
            url: match[2],
            number: Number.parseInt(match[3], 10),
            isResolved: match[1] === 'x',
        }); });
        return deployBlockers.sort(function (a, b) { return a.number - b.number; });
    };
    /**
     * Parse InternalQA section of the StagingDeployCash issue body.
     *
     * @private
     */
    GithubUtils.getStagingDeployCashInternalQA = function (issue) {
        var _a, _b;
        var internalQASection = (_b = (_a = issue.body) === null || _a === void 0 ? void 0 : _a.match(/Internal QA:\*\*\r?\n((?:- \[[ x]].*\r?\n)+)/)) !== null && _b !== void 0 ? _b : null;
        if ((internalQASection === null || internalQASection === void 0 ? void 0 : internalQASection.length) !== 2) {
            return [];
        }
        internalQASection = internalQASection[1];
        var internalQAPRs = __spreadArray([], internalQASection.matchAll(new RegExp("- \\[([ x])]\\s(".concat(CONST_1.default.PULL_REQUEST_REGEX.source, ")"), 'g')), true).map(function (match) {
            var _a, _b;
            return ({
                url: (_b = (_a = match[2].split('-').at(0)) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '',
                number: Number.parseInt(match[3], 10),
                isResolved: match[1] === 'x',
            });
        });
        return internalQAPRs.sort(function (a, b) { return a.number - b.number; });
    };
    /**
     * Generate the issue body and assignees for a StagingDeployCash.
     */
    GithubUtils.generateStagingDeployCashBodyAndAssignees = function (tag, PRList, verifiedPRList, deployBlockers, resolvedDeployBlockers, resolvedInternalQAPRs, isFirebaseChecked, isGHStatusChecked) {
        var _this = this;
        if (verifiedPRList === void 0) { verifiedPRList = []; }
        if (deployBlockers === void 0) { deployBlockers = []; }
        if (resolvedDeployBlockers === void 0) { resolvedDeployBlockers = []; }
        if (resolvedInternalQAPRs === void 0) { resolvedInternalQAPRs = []; }
        if (isFirebaseChecked === void 0) { isFirebaseChecked = false; }
        if (isGHStatusChecked === void 0) { isGHStatusChecked = false; }
        return this.fetchAllPullRequests(PRList.map(function (pr) { return _this.getPullRequestNumberFromURL(pr); }))
            .then(function (data) {
            var internalQAPRs = Array.isArray(data) ? data.filter(function (pr) { return !(0, EmptyObject_1.isEmptyObject)(pr.labels.find(function (item) { return item.name === CONST_1.default.LABELS.INTERNAL_QA; })); }) : [];
            return Promise.all(internalQAPRs.map(function (pr) { return _this.getPullRequestMergerLogin(pr.number).then(function (mergerLogin) { return ({ url: pr.html_url, mergerLogin: mergerLogin }); }); })).then(function (results) {
                // The format of this map is following:
                // {
                //    'https://github.com/Expensify/App/pull/9641': 'PauloGasparSv',
                //    'https://github.com/Expensify/App/pull/9642': 'mountiny'
                // }
                var internalQAPRMap = results.reduce(function (acc, _a) {
                    var url = _a.url, mergerLogin = _a.mergerLogin;
                    acc[url] = mergerLogin;
                    return acc;
                }, {});
                console.log('Found the following Internal QA PRs:', internalQAPRMap);
                var noQAPRs = Array.isArray(data) ? data.filter(function (PR) { return /\[No\s?QA]/i.test(PR.title); }).map(function (item) { return item.html_url; }) : [];
                console.log('Found the following NO QA PRs:', noQAPRs);
                var verifiedOrNoQAPRs = __spreadArray([], new Set(__spreadArray(__spreadArray([], verifiedPRList, true), noQAPRs, true)), true);
                var sortedPRList = __spreadArray([], new Set((0, arrayDifference_1.default)(PRList, Object.keys(internalQAPRMap))), true).sort(function (a, b) { return GithubUtils.getPullRequestNumberFromURL(a) - GithubUtils.getPullRequestNumberFromURL(b); });
                var sortedDeployBlockers = __spreadArray([], new Set(deployBlockers), true).sort(function (a, b) { return GithubUtils.getIssueOrPullRequestNumberFromURL(a) - GithubUtils.getIssueOrPullRequestNumberFromURL(b); });
                // Tag version and comparison URL
                // eslint-disable-next-line max-len
                var issueBody = "**Release Version:** `".concat(tag, "`\r\n**Compare Changes:** https://github.com/").concat(process.env.GITHUB_REPOSITORY, "/compare/production...staging\r\n");
                // PR list
                if (sortedPRList.length > 0) {
                    issueBody += '\r\n**This release contains changes from the following pull requests:**\r\n';
                    sortedPRList.forEach(function (URL) {
                        issueBody += verifiedOrNoQAPRs.includes(URL) ? '- [x]' : '- [ ]';
                        issueBody += " ".concat(URL, "\r\n");
                    });
                    issueBody += '\r\n\r\n';
                }
                // Internal QA PR list
                if (!(0, EmptyObject_1.isEmptyObject)(internalQAPRMap)) {
                    console.log('Found the following verified Internal QA PRs:', resolvedInternalQAPRs);
                    issueBody += '**Internal QA:**\r\n';
                    Object.keys(internalQAPRMap).forEach(function (URL) {
                        var merger = internalQAPRMap[URL];
                        var mergerMention = "@".concat(merger);
                        issueBody += "".concat(resolvedInternalQAPRs.includes(URL) ? '- [x]' : '- [ ]', " ");
                        issueBody += "".concat(URL);
                        issueBody += " - ".concat(mergerMention);
                        issueBody += '\r\n';
                    });
                    issueBody += '\r\n\r\n';
                }
                // Deploy blockers
                if (deployBlockers.length > 0) {
                    issueBody += '**Deploy Blockers:**\r\n';
                    sortedDeployBlockers.forEach(function (URL) {
                        issueBody += resolvedDeployBlockers.includes(URL) ? '- [x] ' : '- [ ] ';
                        issueBody += URL;
                        issueBody += '\r\n';
                    });
                    issueBody += '\r\n\r\n';
                }
                issueBody += '**Deployer verifications:**';
                // eslint-disable-next-line max-len
                issueBody += "\r\n- [".concat(isFirebaseChecked ? 'x' : ' ', "] I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-mobile-app/crashlytics/app/ios:com.expensify.expensifylite/issues?state=open&time=last-seven-days&types=crash&tag=all&sort=eventCount) for **this release version** and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).");
                // eslint-disable-next-line max-len
                issueBody += "\r\n- [".concat(isFirebaseChecked ? 'x' : ' ', "] I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-mobile-app/crashlytics/app/android:org.me.mobiexpensifyg/issues?state=open&time=last-seven-days&types=crash&tag=all&sort=eventCount) for **the previous release version** and verified that the release did not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).");
                // eslint-disable-next-line max-len
                issueBody += "\r\n- [".concat(isGHStatusChecked ? 'x' : ' ', "] I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.");
                issueBody += '\r\n\r\ncc @Expensify/applauseleads\r\n';
                var issueAssignees = __spreadArray([], new Set(Object.values(internalQAPRMap)), true);
                var issue = { issueBody: issueBody, issueAssignees: issueAssignees };
                return issue;
            });
        })
            .catch(function (err) { return console.warn('Error generating StagingDeployCash issue body! Continuing...', err); });
    };
    /**
     * Fetch all pull requests given a list of PR numbers.
     */
    GithubUtils.fetchAllPullRequests = function (pullRequestNumbers) {
        var oldestPR = pullRequestNumbers.sort(function (a, b) { return a - b; }).at(0);
        return this.paginate(this.octokit.pulls.list, {
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            state: 'all',
            sort: 'created',
            direction: 'desc',
            per_page: 100,
        }, function (_a, done) {
            var data = _a.data;
            if (data.find(function (pr) { return pr.number === oldestPR; })) {
                done();
            }
            return data;
        })
            .then(function (prList) { return prList.filter(function (pr) { return pullRequestNumbers.includes(pr.number); }); })
            .catch(function (err) { return console.error('Failed to get PR list', err); });
    };
    GithubUtils.getPullRequestMergerLogin = function (pullRequestNumber) {
        return this.octokit.pulls
            .get({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            pull_number: pullRequestNumber,
        })
            .then(function (_a) {
            var _b;
            var pullRequest = _a.data;
            return (_b = pullRequest.merged_by) === null || _b === void 0 ? void 0 : _b.login;
        });
    };
    GithubUtils.getPullRequestBody = function (pullRequestNumber) {
        return this.octokit.pulls
            .get({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            pull_number: pullRequestNumber,
        })
            .then(function (_a) {
            var pullRequestComment = _a.data;
            return pullRequestComment.body;
        });
    };
    GithubUtils.getAllReviewComments = function (pullRequestNumber) {
        return this.paginate(this.octokit.pulls.listReviews, {
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            pull_number: pullRequestNumber,
            per_page: 100,
        }, function (response) { return response.data.map(function (review) { return review.body; }); });
    };
    GithubUtils.getAllComments = function (issueNumber) {
        return this.paginate(this.octokit.issues.listComments, {
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            issue_number: issueNumber,
            per_page: 100,
        }, function (response) { return response.data.map(function (comment) { return comment.body; }); });
    };
    /**
     * Create comment on pull request
     */
    GithubUtils.createComment = function (repo, number, messageBody) {
        console.log("Writing comment on #".concat(number));
        return this.octokit.issues.createComment({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: repo,
            issue_number: number,
            body: messageBody,
        });
    };
    /**
     * Get the most recent workflow run for the given New Expensify workflow.
     */
    /* eslint-disable rulesdir/no-default-id-values */
    GithubUtils.getLatestWorkflowRunID = function (workflow) {
        console.log("Fetching New Expensify workflow runs for ".concat(workflow, "..."));
        return this.octokit.actions
            .listWorkflowRuns({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            workflow_id: workflow,
        })
            .then(function (response) { var _a, _b; return (_b = (_a = response.data.workflow_runs.at(0)) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : -1; });
    };
    /**
     * Generate the URL of an New Expensify pull request given the PR number.
     */
    GithubUtils.getPullRequestURLFromNumber = function (value) {
        return "".concat(CONST_1.default.APP_REPO_URL, "/pull/").concat(value);
    };
    /**
     * Parse the pull request number from a URL.
     *
     * @throws {Error} If the URL is not a valid Github Pull Request.
     */
    GithubUtils.getPullRequestNumberFromURL = function (URL) {
        var matches = URL.match(CONST_1.default.PULL_REQUEST_REGEX);
        if (!Array.isArray(matches) || matches.length !== 2) {
            throw new Error("Provided URL ".concat(URL, " is not a Github Pull Request!"));
        }
        return Number.parseInt(matches[1], 10);
    };
    /**
     * Parse the issue number from a URL.
     *
     * @throws {Error} If the URL is not a valid Github Issue.
     */
    GithubUtils.getIssueNumberFromURL = function (URL) {
        var matches = URL.match(CONST_1.default.ISSUE_REGEX);
        if (!Array.isArray(matches) || matches.length !== 2) {
            throw new Error("Provided URL ".concat(URL, " is not a Github Issue!"));
        }
        return Number.parseInt(matches[1], 10);
    };
    /**
     * Parse the issue or pull request number from a URL.
     *
     * @throws {Error} If the URL is not a valid Github Issue or Pull Request.
     */
    GithubUtils.getIssueOrPullRequestNumberFromURL = function (URL) {
        var matches = URL.match(CONST_1.default.ISSUE_OR_PULL_REQUEST_REGEX);
        if (!Array.isArray(matches) || matches.length !== 2) {
            throw new Error("Provided URL ".concat(URL, " is not a valid Github Issue or Pull Request!"));
        }
        return Number.parseInt(matches[1], 10);
    };
    /**
     * Return the login of the actor who closed an issue or PR. If the issue is not closed, return an empty string.
     */
    GithubUtils.getActorWhoClosedIssue = function (issueNumber) {
        return this.paginate(this.octokit.issues.listEvents, {
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            issue_number: issueNumber,
            per_page: 100,
        })
            .then(function (events) { return events.filter(function (event) { return event.event === 'closed'; }); })
            .then(function (closedEvents) { var _a, _b, _c; return (_c = (_b = (_a = closedEvents.at(-1)) === null || _a === void 0 ? void 0 : _a.actor) === null || _b === void 0 ? void 0 : _b.login) !== null && _c !== void 0 ? _c : ''; });
    };
    /**
     * Returns a single artifact by name. If none is found, it returns undefined.
     */
    GithubUtils.getArtifactByName = function (artifactName) {
        return this.octokit.actions
            .listArtifactsForRepo({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            per_page: 1,
            name: artifactName,
        })
            .then(function (response) { return response.data.artifacts.at(0); });
    };
    /**
     * Given an artifact ID, returns the download URL to a zip file containing the artifact.
     */
    GithubUtils.getArtifactDownloadURL = function (artifactId) {
        return this.octokit.actions
            .downloadArtifact({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            artifact_id: artifactId,
            archive_format: 'zip',
        })
            .then(function (response) { return response.url; });
    };
    /**
     * Get commits between two tags via the GitHub API
     */
    GithubUtils.getCommitHistoryBetweenTags = function (fromTag, toTag) {
        return __awaiter(this, void 0, void 0, function () {
            var allCommits, page, perPage, hasMorePages, response, totalCommits, error_1;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('Getting pull requests merged between the following tags:', fromTag, toTag);
                        core.startGroup('Fetching paginated commits:');
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, , 6]);
                        allCommits = [];
                        page = 1;
                        perPage = 250;
                        hasMorePages = true;
                        _c.label = 2;
                    case 2:
                        if (!hasMorePages) return [3 /*break*/, 4];
                        core.info("\uD83D\uDCC4 Fetching page ".concat(page, " of commits..."));
                        return [4 /*yield*/, this.octokit.repos.compareCommits({
                                owner: CONST_1.default.GITHUB_OWNER,
                                repo: CONST_1.default.APP_REPO,
                                base: fromTag,
                                head: toTag,
                                per_page: perPage,
                                page: page,
                            })];
                    case 3:
                        response = _c.sent();
                        // Check if we got a proper response with commits
                        if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.commits) && Array.isArray(response.data.commits)) {
                            if (page === 1) {
                                core.info("\uD83D\uDCCA Total commits: ".concat((_b = response.data.total_commits) !== null && _b !== void 0 ? _b : 'unknown'));
                            }
                            core.info("\u2705 compareCommits API returned ".concat(response.data.commits.length, " commits for page ").concat(page));
                            allCommits = allCommits.concat(response.data.commits);
                            totalCommits = response.data.total_commits;
                            if (response.data.commits.length < perPage || (totalCommits && allCommits.length >= totalCommits)) {
                                hasMorePages = false;
                            }
                            else {
                                page++;
                            }
                        }
                        else {
                            core.warning('⚠️ GitHub API returned unexpected response format');
                            hasMorePages = false;
                        }
                        return [3 /*break*/, 2];
                    case 4:
                        core.info("\uD83C\uDF89 Successfully fetched ".concat(allCommits.length, " total commits"));
                        core.endGroup();
                        return [2 /*return*/, allCommits.map(function (commit) {
                                var _a, _b;
                                return ({
                                    commit: commit.sha,
                                    subject: commit.commit.message,
                                    authorName: (_b = (_a = commit.commit.author) === null || _a === void 0 ? void 0 : _a.name) !== null && _b !== void 0 ? _b : 'Unknown',
                                });
                            })];
                    case 5:
                        error_1 = _c.sent();
                        if (error_1 instanceof request_error_1.RequestError && error_1.status === 404) {
                            console.error("\u2753\u2753 Failed to get commits with the GitHub API. The base tag ('".concat(fromTag, "') or head tag ('").concat(toTag, "') likely doesn't exist on the remote repository. If this is the case, create or push them."));
                        }
                        core.endGroup();
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return GithubUtils;
}());
exports.default = GithubUtils;

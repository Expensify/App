/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 144:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__nccwpck_require__(305));
const DeployChecklistUtils_1 = __nccwpck_require__(628);
const GithubUtils_1 = __importDefault(__nccwpck_require__(39));
const CONST_1 = __importDefault(__nccwpck_require__(405));
const run = async function () {
    let version;
    try {
        const checklist = await (0, DeployChecklistUtils_1.getLastClosedDeployChecklist)();
        version = checklist.version;
        console.log(`Last closed deploy checklist references version: ${version}`);
    }
    catch (err) {
        console.warn('No closed deploy checklist found, continuing with deploy:', err);
        core.setOutput('HAS_PRODUCTION_RELEASE', true);
        return;
    }
    if (!version) {
        console.warn('Could not extract version from closed deploy checklist, continuing with deploy');
        core.setOutput('HAS_PRODUCTION_RELEASE', true);
        return;
    }
    // Production releases use the bare version as the tag (staging releases append "-staging"
    // and are flagged as pre-releases). A non-prerelease release for this tag confirms the
    // previous deploy cycle completed before we start a new staging cycle.
    try {
        const { data: release } = await GithubUtils_1.default.octokit.repos.getReleaseByTag({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            tag: version,
        });
        if (release.prerelease) {
            console.log(`Release for version ${version} is a pre-release, blocking deploy`);
            core.setOutput('HAS_PRODUCTION_RELEASE', false);
        }
        else {
            console.log(`Found production release for version ${version}`);
            core.setOutput('HAS_PRODUCTION_RELEASE', true);
        }
    }
    catch (err) {
        console.log(`No release found for version ${version}, blocking deploy`);
        core.setOutput('HAS_PRODUCTION_RELEASE', false);
    }
};
if (require.main === require.cache[eval('__filename')]) {
    run();
}
exports["default"] = run;


/***/ }),

/***/ 405:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const GITHUB_BASE_URL_REGEX = new RegExp('https?://(?:github\.com|api\.github\.com)');
const GIT_CONST = {
    GITHUB_OWNER: process.env.GITHUB_REPOSITORY_OWNER ?? 'Expensify',
    APP_REPO: (process.env.GITHUB_REPOSITORY ?? 'Expensify/App').split('/').at(1) ?? '',
    MOBILE_EXPENSIFY_REPO: 'Mobile-Expensify',
    DEFAULT_BASE_REF: 'main',
};
const CONST = {
    ...GIT_CONST,
    APPLAUSE_BOT: 'applausebot',
    OS_BOTIFY: 'OSBotify',
    LABELS: {
        STAGING_DEPLOY: 'StagingDeployCash',
        DEPLOY_BLOCKER: 'DeployBlockerCash',
        LOCK_DEPLOY: '🔐 LockCashDeploys 🔐',
        INTERNAL_QA: 'InternalQA',
        HELP_WANTED: 'Help Wanted',
        CP_STAGING: 'CP Staging',
        DAILY: 'Daily',
    },
    STATE: {
        OPEN: 'open',
    },
    COMMENT: {
        TYPE_BOT: 'Bot',
        NAME_MELVIN_BOT: 'melvin-bot[bot]',
        NAME_MELVIN_USER: 'MelvinBot',
        NAME_CODEX: 'chatgpt-codex-connector',
        NAME_GITHUB_ACTIONS: 'github-actions',
    },
    ACTIONS: {
        CREATED: 'created',
        EDITED: 'edited',
    },
    EVENTS: {
        ISSUE_COMMENT: 'issue_comment',
    },
    RUN_EVENT: {
        PULL_REQUEST: 'pull_request',
        PULL_REQUEST_TARGET: 'pull_request_target',
        PUSH: 'push',
    },
    RUN_STATUS: {
        COMPLETED: 'completed',
        IN_PROGRESS: 'in_progress',
        QUEUED: 'queued',
    },
    RUN_STATUS_CONCLUSION: {
        SUCCESS: 'success',
    },
    TEST_WORKFLOW_NAME: 'Jest Unit Tests',
    TEST_WORKFLOW_PATH: '.github/workflows/test.yml',
    PROPOSAL_KEYWORD: 'Proposal',
    PROPOSAL_HEADER_A: 'what is the root cause of that problem?',
    PROPOSAL_HEADER_B: 'what changes do you think we should make in order to solve the problem?',
    DATE_FORMAT_STRING: 'yyyy-MM-dd',
    PULL_REQUEST_REGEX: new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/pull/([0-9]+).*`),
    ISSUE_REGEX: new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/issues/([0-9]+).*`),
    ISSUE_OR_PULL_REQUEST_REGEX: new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/(?:pull|issues)/([0-9]+).*`),
    POLL_RATE: 10000,
    APP_REPO_URL: `https://github.com/${GIT_CONST.GITHUB_OWNER}/${GIT_CONST.APP_REPO}`,
    APP_REPO_GIT_URL: `git@github.com:${GIT_CONST.GITHUB_OWNER}/${GIT_CONST.APP_REPO}.git`,
    MOBILE_EXPENSIFY_URL: `https://github.com/${GIT_CONST.GITHUB_OWNER}/${GIT_CONST.MOBILE_EXPENSIFY_REPO}`,
    NO_ACTION: 'NO_ACTION',
    ACTION_EDIT: 'ACTION_EDIT',
    ACTION_REQUIRED: 'ACTION_REQUIRED',
    ACTION_HIDE_DUPLICATE: 'ACTION_HIDE_DUPLICATE',
};
exports["default"] = CONST;


/***/ }),

/***/ 628:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getDeployChecklist = getDeployChecklist;
exports.getLastClosedDeployChecklist = getLastClosedDeployChecklist;
exports.getDeployChecklistData = getDeployChecklistData;
exports.generateDeployChecklistBodyAndAssignees = generateDeployChecklistBodyAndAssignees;
exports.parseChecklistSection = parseChecklistSection;
const dedent_1 = __importDefault(__nccwpck_require__(864));
const CONST_1 = __importDefault(__nccwpck_require__(405));
const GithubUtils_1 = __importDefault(__nccwpck_require__(39));
/**
 * Generic checklist section parser. Extracts a section from the issue body,
 * parses checkbox items within it, and returns ChecklistItems sorted by number.
 */
function parseChecklistSection(issueBody, sectionRegex, itemRegex, urlTransform) {
    const sectionMatch = issueBody?.match(sectionRegex) ?? null;
    if (sectionMatch?.length !== 2) {
        return [];
    }
    const items = [...sectionMatch[1].matchAll(itemRegex)].map((match) => {
        const rawUrl = match[2];
        return {
            url: urlTransform ? urlTransform(rawUrl) : rawUrl,
            number: Number.parseInt(match[3], 10),
            isChecked: match[1] === 'x',
        };
    });
    return items.sort((a, b) => a.number - b.number);
}
function getDeployChecklistPRList(issue) {
    const result = parseChecklistSection(issue.body, /pull requests:\*\*?
((?:-.*?
)+)?
?
?/, new RegExp(`- \[([ x])] (${CONST_1.default.PULL_REQUEST_REGEX.source})`, 'g'));
    if (result.length === 0) {
        console.log('Hmmm...The open deploy checklist does not list any pull requests, continuing...');
    }
    return result;
}
function getDeployChecklistPRListMobileExpensify(issue) {
    return parseChecklistSection(issue.body, /Mobile-Expensify PRs:\*\*?
((?:-.*?
)+)/, new RegExp(`- \[([ x])]\s(${CONST_1.default.ISSUE_OR_PULL_REQUEST_REGEX.source})`, 'g'));
}
function getDeployChecklistDeployBlockers(issue) {
    return parseChecklistSection(issue.body, /Deploy Blockers:\*\*?
((?:-.*?
)+)/, new RegExp(`- \[([ x])]\s(${CONST_1.default.ISSUE_OR_PULL_REQUEST_REGEX.source})`, 'g'));
}
function getDeployChecklistInternalQA(issue) {
    return parseChecklistSection(issue.body, /Internal QA:\*\*?
((?:- \[[ x]].*?
)+)/, new RegExp(`- \[([ x])]\s(${CONST_1.default.PULL_REQUEST_REGEX.source})`, 'g'), (url) => url.split('-').at(0)?.trim() ?? '');
}
async function getLastClosedDeployChecklist() {
    const { data } = await GithubUtils_1.default.octokit.issues.listForRepo({
        owner: CONST_1.default.GITHUB_OWNER,
        repo: CONST_1.default.APP_REPO,
        labels: CONST_1.default.LABELS.STAGING_DEPLOY,
        state: 'closed',
        sort: 'created',
        direction: 'desc',
        per_page: 10,
    });
    if (!data.length) {
        throw new Error(`Unable to find any closed ${CONST_1.default.LABELS.STAGING_DEPLOY} issues.`);
    }
    // Sort by closed_at descending to find the most recently closed checklist.
    // We cannot rely on the API's sort=updated because a comment or edit on an older
    // closed issue would cause it to appear first, returning a stale version.
    const sorted = [...data].sort((a, b) => (b.closed_at ?? '').localeCompare(a.closed_at ?? ''));
    const issue = sorted.at(0);
    if (!issue) {
        throw new Error(`Unable to find any closed ${CONST_1.default.LABELS.STAGING_DEPLOY} issues.`);
    }
    return getDeployChecklistData(issue);
}
async function getDeployChecklist() {
    const { data } = await GithubUtils_1.default.octokit.issues.listForRepo({
        owner: CONST_1.default.GITHUB_OWNER,
        repo: CONST_1.default.APP_REPO,
        labels: CONST_1.default.LABELS.STAGING_DEPLOY,
        state: 'open',
    });
    if (!data.length) {
        throw new Error(`Unable to find ${CONST_1.default.LABELS.STAGING_DEPLOY} issue.`);
    }
    if (data.length > 1) {
        throw new Error(`Found more than one ${CONST_1.default.LABELS.STAGING_DEPLOY} issue.`);
    }
    const issue = data.at(0);
    if (!issue) {
        throw new Error(`Found an undefined ${CONST_1.default.LABELS.STAGING_DEPLOY} issue.`);
    }
    return getDeployChecklistData(issue);
}
function getDeployChecklistData(issue) {
    try {
        const versionRegex = new RegExp('([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9]+))?', 'g');
        const version = (issue.body?.match(versionRegex)?.[0] ?? '').replaceAll('`', '');
        return {
            title: issue.title,
            url: issue.url,
            number: GithubUtils_1.default.getIssueOrPullRequestNumberFromURL(issue.url),
            labels: issue.labels,
            PRList: getDeployChecklistPRList(issue),
            PRListMobileExpensify: getDeployChecklistPRListMobileExpensify(issue),
            deployBlockers: getDeployChecklistDeployBlockers(issue),
            internalQAPRList: getDeployChecklistInternalQA(issue),
            isSentryChecked: issue.body ? /-\s\[x]\sI checked \[Sentry]/.test(issue.body) : false,
            isGHStatusChecked: issue.body ? /-\s\[x]\sI checked \[GitHub Status]/.test(issue.body) : false,
            version,
            tag: `${version}-staging`,
        };
    }
    catch (exception) {
        throw new Error(`Unable to find ${CONST_1.default.LABELS.STAGING_DEPLOY} issue with correct data.`);
    }
}
/**
 * Generate the issue body and assignees for a deploy checklist.
 * Accepts PR numbers directly (not URLs) to avoid unnecessary roundtripping.
 */
async function generateDeployChecklistBodyAndAssignees({ tag, PRList, PRListMobileExpensify = [], verifiedPRList = [], verifiedPRListMobileExpensify = [], deployBlockers = [], resolvedDeployBlockers = [], resolvedInternalQAPRs = [], isSentryChecked = false, isGHStatusChecked = false, previousTag = '', chronologicalSection = '', }) {
    const data = await GithubUtils_1.default.fetchAllPullRequests(PRList);
    const internalQAPRs = Array.isArray(data) ? data.filter((pr) => pr.labels.some((item) => item.name === CONST_1.default.LABELS.INTERNAL_QA)) : [];
    const mergerResults = await Promise.all(internalQAPRs.map((pr) => GithubUtils_1.default.getPullRequestMergerLogin(pr.number).then((mergerLogin) => ({ number: pr.number, mergerLogin }))));
    const internalQAPRMap = new Map();
    for (const { number, mergerLogin } of mergerResults) {
        internalQAPRMap.set(number, mergerLogin);
    }
    console.log('Found the following Internal QA PRs:', Object.fromEntries(internalQAPRMap));
    const noQAPRNumbers = Array.isArray(data) ? data.filter((PR) => /\[No\s?QA]/i.test(PR.title)).map((item) => item.number) : [];
    console.log('Found the following NO QA PRs:', noQAPRNumbers);
    const mobileExpensifyData = PRListMobileExpensify.length > 0 ? await GithubUtils_1.default.fetchAllPullRequests(PRListMobileExpensify, CONST_1.default.MOBILE_EXPENSIFY_REPO) : [];
    const noQAMobileExpensifyPRNumbers = Array.isArray(mobileExpensifyData) ? mobileExpensifyData.filter((PR) => /\[No\s?QA]/i.test(PR.title)).map((item) => item.number) : [];
    console.log('Found the following NO QA Mobile-Expensify PRs:', noQAMobileExpensifyPRNumbers);
    const verifiedAppPRs = new Set([...verifiedPRList, ...noQAPRNumbers]);
    const verifiedMobileExpensifyPRs = new Set([...verifiedPRListMobileExpensify, ...noQAMobileExpensifyPRNumbers]);
    const resolvedInternalQAPRSet = new Set(resolvedInternalQAPRs);
    const resolvedDeployBlockerSet = new Set(resolvedDeployBlockers);
    const internalQAPRNumbers = new Set(internalQAPRMap.keys());
    const sortedPRList = [...new Set(PRList.filter((n) => !internalQAPRNumbers.has(n)))].sort((a, b) => a - b);
    const sortedPRListMobileExpensify = [...new Set(PRListMobileExpensify)].sort((a, b) => a - b);
    const sortedDeployBlockers = [...new Set(deployBlockers)].sort((a, b) => a - b);
    const sections = [];
    // Header
    let header = `**Release Version:** \`${tag}\`
**Compare Changes:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/production...staging
`;
    if (sortedPRListMobileExpensify.length > 0) {
        header += `**Mobile-Expensify Changes:** https://github.com/${CONST_1.default.GITHUB_OWNER}/${CONST_1.default.MOBILE_EXPENSIFY_REPO}/compare/production...staging
`;
    }
    sections.push(header);
    // PR list
    if (sortedPRList.length > 0) {
        const items = sortedPRList
            .map((prNumber) => {
            const url = GithubUtils_1.default.getPullRequestURLFromNumber(prNumber, CONST_1.default.APP_REPO_URL);
            return `${verifiedAppPRs.has(prNumber) ? '- [x]' : '- [ ]'} ${url}`;
        })
            .join('
');
        sections.push(`**This release contains changes from the following pull requests:**
${items}
`);
    }
    // Mobile-Expensify PR list
    if (sortedPRListMobileExpensify.length > 0) {
        const items = sortedPRListMobileExpensify
            .map((prNumber) => {
            const url = GithubUtils_1.default.getPullRequestURLFromNumber(prNumber, CONST_1.default.MOBILE_EXPENSIFY_URL);
            return `${verifiedMobileExpensifyPRs.has(prNumber) ? '- [x]' : '- [ ]'} ${url}`;
        })
            .join('
');
        sections.push(`**Mobile-Expensify PRs:**
${items}
`);
    }
    // Internal QA PR list
    if (internalQAPRMap.size > 0) {
        console.log('Found the following verified Internal QA PRs:', resolvedInternalQAPRs);
        const items = [...internalQAPRMap.entries()]
            .map(([prNumber, merger]) => {
            const url = GithubUtils_1.default.getPullRequestURLFromNumber(prNumber, CONST_1.default.APP_REPO_URL);
            return `${resolvedInternalQAPRSet.has(prNumber) ? '- [x]' : '- [ ]'} ${url} - @${merger}`;
        })
            .join('
');
        sections.push(`**Internal QA:**
${items}
`);
    }
    // Deploy blockers
    if (sortedDeployBlockers.length > 0) {
        const items = sortedDeployBlockers
            .map((number) => {
            const url = `${CONST_1.default.APP_REPO_URL}/issues/${number}`;
            return `${resolvedDeployBlockerSet.has(number) ? '- [x] ' : '- [ ] '}${url}`;
        })
            .join('
');
        sections.push(`**Deploy Blockers:**
${items}
`);
    }
    // Chronological section
    if (chronologicalSection) {
        sections.push(chronologicalSection);
    }
    // Deployer verifications
    const check = (checked) => (checked ? 'x' : ' ');
    sections.push((0, dedent_1.default)(`
            **Deployer verifications:**
            - [${check(isSentryChecked)}] I checked [Sentry](https://expensify.sentry.io/releases/new.expensify%40${tag}/?project=4510228107427840&environment=staging) for **this release version** and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).
            - [${check(isSentryChecked)}] I checked [Sentry](https://expensify.sentry.io/releases/new.expensify%40${previousTag}/?project=4510228107427840&environment=production) for **the previous release version** and verified that the release did not introduce any new crashes. Because mobile deploys use a phased rollout, completing this checklist will deploy the previous release version to 100% of users. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).
            - [${check(isGHStatusChecked)}] I checked [GitHub Status](https://www.githubstatus.com/) and verified there is no reported incident with Actions.
        `).trimEnd());
    // Footer
    sections.push('cc @Expensify/applauseleads
');
    const issueBody = sections.join('
');
    const issueAssignees = [...new Set(internalQAPRMap.values())].filter((login) => login !== undefined);
    return { issueBody, issueAssignees };
}


/***/ }),

/***/ 39:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
/* eslint-disable @typescript-eslint/naming-convention */
const core = __importStar(__nccwpck_require__(305));
const utils_1 = __nccwpck_require__(112);
const plugin_paginate_rest_1 = __nccwpck_require__(800);
const plugin_throttling_1 = __nccwpck_require__(489);
const request_error_1 = __nccwpck_require__(107);
const CONST_1 = __importDefault(__nccwpck_require__(405));
class GithubUtils {
    static internalOctokit;
    /**
     * Initialize internal octokit.
     * NOTE: When using GithubUtils in CI, you don't need to call this manually.
     */
    static initOctokitWithToken(token) {
        const Octokit = utils_1.GitHub.plugin(plugin_throttling_1.throttling, plugin_paginate_rest_1.paginateRest);
        // Save a copy of octokit used in this class
        this.internalOctokit = new Octokit((0, utils_1.getOctokitOptions)(token, {
            throttle: {
                retryAfterBaseValue: 2000,
                onRateLimit: (retryAfter, options) => {
                    console.warn(`Request quota exhausted for request ${options.method} ${options.url}`);
                    // Retry five times when hitting a rate limit error, then give up
                    if (options.request.retryCount <= 5) {
                        console.log(`Retrying after ${retryAfter} seconds!`);
                        return true;
                    }
                },
                onAbuseLimit: (retryAfter, options) => {
                    // does not retry, only logs a warning
                    console.warn(`Abuse detected for request ${options.method} ${options.url}`);
                },
            },
        }));
    }
    /**
     * Default initialize method assuming running in CI, getting the token from an input.
     *
     * @private
     */
    static initOctokit() {
        const token = process.env.GITHUB_TOKEN ?? core.getInput('GITHUB_TOKEN', { required: true });
        if (!token) {
            console.error('GitHubUtils could not find GITHUB_TOKEN');
            process.exit(1);
        }
        this.initOctokitWithToken(token);
    }
    /**
     * Either give an existing instance of Octokit rest or create a new one
     *
     * @readonly
     * @static
     */
    static get octokit() {
        if (!this.internalOctokit) {
            this.initOctokit();
        }
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        return this.internalOctokit.rest;
    }
    /**
     * Get the graphql instance from internal octokit.
     * @readonly
     * @static
     */
    static get graphql() {
        if (!this.internalOctokit) {
            this.initOctokit();
        }
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        return this.internalOctokit.graphql;
    }
    /**
     * Either give an existing instance of Octokit paginate or create a new one
     *
     * @readonly
     * @static
     */
    static get paginate() {
        if (!this.internalOctokit) {
            this.initOctokit();
        }
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        return this.internalOctokit.paginate;
    }
    /**
     * Fetch all pull requests given a list of PR numbers.
     */
    static fetchAllPullRequests(pullRequestNumbers, repo = CONST_1.default.APP_REPO) {
        const oldestPR = pullRequestNumbers.sort((a, b) => a - b).at(0);
        return this.paginate(this.octokit.pulls.list, {
            owner: CONST_1.default.GITHUB_OWNER,
            repo,
            state: 'all',
            sort: 'created',
            direction: 'desc',
            per_page: 100,
        }, ({ data }, done) => {
            if (data.find((pr) => pr.number === oldestPR)) {
                done();
            }
            return data;
        })
            .then((prList) => prList?.filter((pr) => pullRequestNumbers.includes(pr.number)) ?? [])
            .catch((err) => console.error('Failed to get PR list', err));
    }
    static getPullRequestMergerLogin(pullRequestNumber) {
        return this.octokit.pulls
            .get({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            pull_number: pullRequestNumber,
        })
            .then(({ data: pullRequest }) => pullRequest.merged_by?.login);
    }
    static getPullRequestBody(pullRequestNumber) {
        return this.octokit.pulls
            .get({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            pull_number: pullRequestNumber,
        })
            .then(({ data: pullRequestComment }) => pullRequestComment.body);
    }
    static async getPullRequestMergeBaseSHA(pullRequestNumber) {
        const { data: pullRequest } = await this.octokit.pulls.get({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            pull_number: pullRequestNumber,
        });
        const { data: comparison } = await this.octokit.repos.compareCommits({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            base: pullRequest.base.ref,
            head: pullRequest.head.sha,
        });
        return comparison.merge_base_commit.sha;
    }
    static getAllReviewComments(pullRequestNumber) {
        return this.paginate(this.octokit.pulls.listReviews, {
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            pull_number: pullRequestNumber,
            per_page: 100,
        }, (response) => response.data.map((review) => review.body));
    }
    static getAllComments(issueNumber) {
        return this.paginate(this.octokit.issues.listComments, {
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            issue_number: issueNumber,
            per_page: 100,
        }, (response) => response.data.map((comment) => comment.body));
    }
    static getAllCommentDetails(issueNumber) {
        return this.paginate(this.octokit.issues.listComments, {
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            issue_number: issueNumber,
            per_page: 100,
        }, (response) => response.data);
    }
    /**
     * Create comment on pull request
     */
    static createComment(repo, number, messageBody) {
        console.log(`Writing comment on #${number}`);
        return this.octokit.issues.createComment({
            owner: CONST_1.default.GITHUB_OWNER,
            repo,
            issue_number: number,
            body: messageBody,
        });
    }
    /**
     * Get the most recent workflow run for the given New Expensify workflow.
     */
    /* eslint-disable rulesdir/no-default-id-values */
    static getLatestWorkflowRunID(workflow) {
        console.log(`Fetching New Expensify workflow runs for ${workflow}...`);
        return this.octokit.actions
            .listWorkflowRuns({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            workflow_id: workflow,
        })
            .then((response) => response.data.workflow_runs.at(0)?.id ?? -1);
    }
    /**
     * List workflow runs for the repository.
     */
    static async listWorkflowRunsForRepo(options = {}) {
        return this.octokit.actions.listWorkflowRunsForRepo({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            per_page: options.per_page ?? 50,
            ...(options.status && { status: options.status }),
        });
    }
    /**
     * Get the workflow run URL for a specific commit SHA and workflow file.
     * Returns the HTML URL of the matching run, or undefined if not found.
     */
    static async getWorkflowRunURLForCommit(commitSha, workflowFile) {
        try {
            const response = await this.octokit.actions.listWorkflowRuns({
                owner: CONST_1.default.GITHUB_OWNER,
                repo: CONST_1.default.APP_REPO,
                workflow_id: workflowFile,
                head_sha: commitSha,
                per_page: 1,
            });
            return response.data.workflow_runs.at(0)?.html_url;
        }
        catch (error) {
            console.warn(`Failed to find workflow run for commit ${commitSha}:`, error);
            return undefined;
        }
    }
    /**
     * Generate the URL of an New Expensify pull request given the PR number.
     */
    static getPullRequestURLFromNumber(value, repositoryURL) {
        return `${repositoryURL}/pull/${value}`;
    }
    /**
     * Parse the pull request number from a URL.
     *
     * @throws {Error} If the URL is not a valid Github Pull Request.
     */
    static getPullRequestNumberFromURL(URL) {
        const matches = URL.match(CONST_1.default.PULL_REQUEST_REGEX);
        if (!Array.isArray(matches) || matches.length !== 2) {
            throw new Error(`Provided URL ${URL} is not a Github Pull Request!`);
        }
        return Number.parseInt(matches[1], 10);
    }
    /**
     * Parse the issue number from a URL.
     *
     * @throws {Error} If the URL is not a valid Github Issue.
     */
    static getIssueNumberFromURL(URL) {
        const matches = URL.match(CONST_1.default.ISSUE_REGEX);
        if (!Array.isArray(matches) || matches.length !== 2) {
            throw new Error(`Provided URL ${URL} is not a Github Issue!`);
        }
        return Number.parseInt(matches[1], 10);
    }
    /**
     * Parse the issue or pull request number from a URL.
     *
     * @throws {Error} If the URL is not a valid Github Issue or Pull Request.
     */
    static getIssueOrPullRequestNumberFromURL(URL) {
        const matches = URL.match(CONST_1.default.ISSUE_OR_PULL_REQUEST_REGEX);
        if (!Array.isArray(matches) || matches.length !== 2) {
            throw new Error(`Provided URL ${URL} is not a valid Github Issue or Pull Request!`);
        }
        return Number.parseInt(matches[1], 10);
    }
    /**
     * Return the login of the actor who closed an issue or PR. If the issue is not closed, return an empty string.
     */
    static getActorWhoClosedIssue(issueNumber) {
        return this.paginate(this.octokit.issues.listEvents, {
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            issue_number: issueNumber,
            per_page: 100,
        })
            .then((events) => events.filter((event) => event.event === 'closed'))
            .then((closedEvents) => closedEvents.at(-1)?.actor?.login ?? '');
    }
    /**
     * Returns a single artifact by name. If none is found, it returns undefined.
     */
    static getArtifactByName(artifactName) {
        return this.octokit.actions
            .listArtifactsForRepo({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            per_page: 1,
            name: artifactName,
        })
            .then((response) => response.data.artifacts.at(0));
    }
    /**
     * Given an artifact ID, returns the download URL to a zip file containing the artifact.
     */
    static getArtifactDownloadURL(artifactId) {
        return this.octokit.actions
            .downloadArtifact({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            artifact_id: artifactId,
            archive_format: 'zip',
        })
            .then((response) => response.url);
    }
    /**
     * Get the contents of a file from the API at a given ref as a string.
     */
    static async getFileContents(path, ref = CONST_1.default.DEFAULT_BASE_REF) {
        const { data } = await this.octokit.repos.getContent({
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            path,
            ref,
        });
        if (Array.isArray(data)) {
            throw new Error(`Provided path ${path} refers to a directory, not a file`);
        }
        if (!('content' in data)) {
            throw new Error(`Provided path ${path} is invalid`);
        }
        return Buffer.from(data.content, 'base64').toString('utf8');
    }
    static async getPullRequestChangedSVGFileNames(pullRequestNumber) {
        const files = this.paginate(this.octokit.pulls.listFiles, {
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            pull_number: pullRequestNumber,
            per_page: 100,
        }, (response) => response.data.filter((file) => file.filename.endsWith('.svg') && (file.status === 'added' || file.status === 'modified')).map((file) => file.filename));
        return files;
    }
    /**
     * Get commits between two tags via the GitHub API
     */
    static async getCommitHistoryBetweenTags(fromTag, toTag, repositoryName) {
        console.log('Getting pull requests merged between the following tags:', fromTag, toTag);
        core.startGroup('Fetching paginated commits:');
        try {
            let allCommits = [];
            let page = 1;
            const perPage = 250;
            let hasMorePages = true;
            while (hasMorePages) {
                core.info(`📄 Fetching page ${page} of commits...`);
                const response = await this.octokit.repos.compareCommits({
                    owner: CONST_1.default.GITHUB_OWNER,
                    repo: repositoryName,
                    base: fromTag,
                    head: toTag,
                    per_page: perPage,
                    page,
                });
                // Check if we got a proper response with commits
                if (response.data?.commits && Array.isArray(response.data.commits)) {
                    if (page === 1) {
                        core.info(`📊 Total commits: ${response.data.total_commits ?? 'unknown'}`);
                    }
                    core.info(`✅ compareCommits API returned ${response.data.commits.length} commits for page ${page}`);
                    allCommits = allCommits.concat(response.data.commits);
                    // Check if we got fewer commits than requested or if we've reached the total
                    const totalCommits = response.data.total_commits;
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
            }
            core.info(`🎉 Successfully fetched ${allCommits.length} total commits`);
            core.endGroup();
            console.log('');
            return allCommits.map((commit) => ({
                commit: commit.sha,
                subject: commit.commit.message,
                authorName: commit.commit.author?.name ?? 'Unknown',
                date: commit.commit.committer?.date ?? '',
            }));
        }
        catch (error) {
            if (error instanceof request_error_1.RequestError && error.status === 404) {
                core.error(`❓❓ Failed to get commits with the GitHub API. The base tag ('${fromTag}') or head tag ('${toTag}') likely doesn't exist on the remote repository. If this is the case, create or push them.`);
            }
            core.endGroup();
            console.log('');
            throw error;
        }
    }
    static async getPullRequestDiff(pullRequestNumber) {
        if (!this.internalOctokit) {
            this.initOctokit();
        }
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        const response = await this.internalOctokit.request('GET /repos/{owner}/{repo}/pulls/{pull_number}', {
            owner: CONST_1.default.GITHUB_OWNER,
            repo: CONST_1.default.APP_REPO,
            pull_number: pullRequestNumber,
            mediaType: {
                format: 'diff',
            },
        });
        return response.data;
    }
}
exports["default"] = GithubUtils;


/***/ }),

/***/ 864:
/***/ ((__unused_webpack_module, exports) => {

"use strict";

/*
 * Note: This file is separated from StringUtils because it is imported by a ts-node script.
 *       ts-node scripts can't import react-native (because it is written in flow),
 *       and StringUtils indirectly imports react-native.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports["default"] = dedent;
/**
 * Find the minimum indentation of any line in the string,
 * and remove that number of leading spaces from every line in the string.
 *
 * It also removes at most one leading newline, to reflect a common usage:
 *
 * ```
 * StringUtils.dedent(`
 *    const myIndentedStr = 'Hello, world!';
 *    console.log(myIndentedStr);
 * `)
 * ```
 *
 * This implementation assumes you'd want that to be:
 *
 * ```
 * const myIndentedStr = 'Hello, world!';
 * console.log(myIndentedStr);
 *
 * ```
 *
 * Rather than:
 *
 * ```
 *
 * const myIndentedStr = 'Hello, world!';
 * console.log(myIndentedStr);
 *
 * ```
 */
function dedent(str) {
    // Remove at most one leading newline
    const stringWithoutLeadingNewlines = str.replaceAll(/^?
/g, '');
    // Split string by remaining newlines
    const lines = stringWithoutLeadingNewlines.replaceAll('
', '
').split('
');
    // Find the minimum indentation of non-empty lines
    let minIndent = Number.MAX_SAFE_INTEGER;
    for (const line of lines) {
        if (line.trim().length === 0) {
            continue;
        }
        const indentation = line.match(/^ */)?.[0].length ?? 0;
        if (indentation < minIndent) {
            minIndent = indentation;
        }
    }
    // Remove the common indentation
    return lines.map((line) => line.slice(minIndent)).join('
');
}


/***/ }),

/***/ 305:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 112:
/***/ ((module) => {

module.exports = eval("require")("@actions/github/lib/utils");


/***/ }),

/***/ 800:
/***/ ((module) => {

module.exports = eval("require")("@octokit/plugin-paginate-rest");


/***/ }),

/***/ 489:
/***/ ((module) => {

module.exports = eval("require")("@octokit/plugin-throttling");


/***/ }),

/***/ 107:
/***/ ((module) => {

module.exports = eval("require")("@octokit/request-error");


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(144);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;

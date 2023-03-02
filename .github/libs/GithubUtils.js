const _ = require('underscore');
const lodashGet = require('lodash/get');
const core = require('@actions/core');
const {GitHub, getOctokitOptions} = require('@actions/github/lib/utils');
const {throttling} = require('@octokit/plugin-throttling');
const {paginateRest} = require('@octokit/plugin-paginate-rest');

const GITHUB_OWNER = 'Expensify';
const APP_REPO = 'App';
const APP_REPO_URL = 'https://github.com/Expensify/App';

const GITHUB_BASE_URL_REGEX = new RegExp('https?://(?:github\\.com|api\\.github\\.com)');
const PULL_REQUEST_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/pull/([0-9]+).*`);
const ISSUE_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/issues/([0-9]+).*`);
const ISSUE_OR_PULL_REQUEST_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/(?:pull|issues)/([0-9]+).*`);

const APPLAUSE_BOT = 'applausebot';
const STAGING_DEPLOY_CASH_LABEL = 'StagingDeployCash';
const DEPLOY_BLOCKER_CASH_LABEL = 'DeployBlockerCash';
const INTERNAL_QA_LABEL = 'InternalQA';

/**
 * The standard rate in ms at which we'll poll the GitHub API to check for status changes.
 * It's 10 seconds :)
 * @type {number}
 */
const POLL_RATE = 10000;

class GithubUtils {
    /**
     * Initialize internal octokit
     *
     * @private
     */
    static initOctokit() {
        const Octokit = GitHub.plugin(throttling, paginateRest);
        const token = core.getInput('GITHUB_TOKEN', {required: true});

        // Save a copy of octokit used in this class
        this.internalOctokit = new Octokit(getOctokitOptions(token, {
            throttle: {
                onRateLimit: (retryAfter, options) => {
                    console.warn(
                        `Request quota exhausted for request ${options.method} ${options.url}`,
                    );

                    // Retry once after hitting a rate limit error, then give up
                    if (options.request.retryCount <= 1) {
                        console.log(`Retrying after ${retryAfter} seconds!`);
                        return true;
                    }
                },
                onAbuseLimit: (retryAfter, options) => {
                    // does not retry, only logs a warning
                    console.warn(
                        `Abuse detected for request ${options.method} ${options.url}`,
                    );
                },
            },
        }));
    }

    /**
     * Either give an existing instance of Octokit rest or create a new one
     *
     * @readonly
     * @static
     * @memberof GithubUtils
     */
    static get octokit() {
        if (this.internalOctokit) {
            return this.internalOctokit.rest;
        }
        this.initOctokit();
        return this.internalOctokit.rest;
    }

    /**
     * Either give an existing instance of Octokit paginate or create a new one
     *
     * @readonly
     * @static
     * @memberof GithubUtils
     */
    static get paginate() {
        if (this.internalOctokit) {
            return this.internalOctokit.paginate;
        }
        this.initOctokit();
        return this.internalOctokit.paginate;
    }

    /**
     * Finds one open `StagingDeployCash` issue via GitHub octokit library.
     *
     * @returns {Promise}
     */
    static getStagingDeployCash() {
        return this.octokit.issues.listForRepo({
            owner: GITHUB_OWNER,
            repo: APP_REPO,
            labels: STAGING_DEPLOY_CASH_LABEL,
            state: 'open',
        })
            .then(({data}) => {
                if (!data.length) {
                    const error = new Error(`Unable to find ${STAGING_DEPLOY_CASH_LABEL} issue.`);
                    error.code = 404;
                    throw error;
                }

                if (data.length > 1) {
                    const error = new Error(`Found more than one ${STAGING_DEPLOY_CASH_LABEL} issue.`);
                    error.code = 500;
                    throw error;
                }

                return this.getStagingDeployCashData(data[0]);
            });
    }

    /**
     * Takes in a GitHub issue object and returns the data we want.
     *
     * @param {Object} issue
     * @returns {Object}
     */
    static getStagingDeployCashData(issue) {
        try {
            const versionRegex = new RegExp('([0-9]+)\\.([0-9]+)\\.([0-9]+)(?:-([0-9]+))?', 'g');
            const tag = issue.body.match(versionRegex)[0].replace(/`/g, '');
            return {
                title: issue.title,
                url: issue.url,
                number: this.getIssueOrPullRequestNumberFromURL(issue.url),
                labels: issue.labels,
                PRList: this.getStagingDeployCashPRList(issue),
                deployBlockers: this.getStagingDeployCashDeployBlockers(issue),
                internalQAPRList: this.getStagingDeployCashInternalQA(issue),
                isTimingDashboardChecked: /-\s\[x]\sI checked the \[App Timing Dashboard]/.test(issue.body),
                isFirebaseChecked: /-\s\[x]\sI checked \[Firebase Crashlytics]/.test(issue.body),
                tag,
            };
        } catch (exception) {
            throw new Error(`Unable to find ${STAGING_DEPLOY_CASH_LABEL} issue with correct data.`);
        }
    }

    /**
     * Parse the PRList and Internal QA section of the StagingDeployCash issue body.
     *
     * @private
     *
     * @param {Object} issue
     * @returns {Array<Object>} - [{url: String, number: Number, isVerified: Boolean}]
     */
    static getStagingDeployCashPRList(issue) {
        let PRListSection = issue.body.match(/pull requests:\*\*\r?\n((?:-.*\r?\n)+)\r?\n\r?\n?/) || [];
        if (PRListSection.length !== 2) {
            // No PRs, return an empty array
            console.log('Hmmm...The open StagingDeployCash does not list any pull requests, continuing...');
            return [];
        }
        PRListSection = PRListSection[1];
        const PRList = _.map(
            [...PRListSection.matchAll(new RegExp(`- \\[([ x])] (${PULL_REQUEST_REGEX.source})`, 'g'))],
            match => ({
                url: match[2],
                number: Number.parseInt(match[3], 10),
                isVerified: match[1] === 'x',
            }),
        );
        return _.sortBy(PRList, 'number');
    }

    /**
     * Parse DeployBlocker section of the StagingDeployCash issue body.
     *
     * @private
     *
     * @param {Object} issue
     * @returns {Array<Object>} - [{URL: String, number: Number, isResolved: Boolean}]
     */
    static getStagingDeployCashDeployBlockers(issue) {
        let deployBlockerSection = issue.body.match(/Deploy Blockers:\*\*\r?\n((?:-.*\r?\n)+)/) || [];
        if (deployBlockerSection.length !== 2) {
            return [];
        }
        deployBlockerSection = deployBlockerSection[1];
        const deployBlockers = _.map(
            [...deployBlockerSection.matchAll(new RegExp(`- \\[([ x])]\\s(${ISSUE_OR_PULL_REQUEST_REGEX.source})`, 'g'))],
            match => ({
                url: match[2],
                number: Number.parseInt(match[3], 10),
                isResolved: match[1] === 'x',
            }),
        );
        return _.sortBy(deployBlockers, 'number');
    }

    /**
     * Parse InternalQA section of the StagingDeployCash issue body.
     *
     * @private
     *
     * @param {Object} issue
     * @returns {Array<Object>} - [{URL: String, number: Number, isResolved: Boolean}]
     */
    static getStagingDeployCashInternalQA(issue) {
        let internalQASection = issue.body.match(/Internal QA:\*\*\r?\n((?:- \[[ x]].*\r?\n)+)/) || [];
        if (internalQASection.length !== 2) {
            return [];
        }
        internalQASection = internalQASection[1];
        const internalQAPRs = _.map(
            [...internalQASection.matchAll(new RegExp(`- \\[([ x])]\\s(${PULL_REQUEST_REGEX.source})`, 'g'))],
            match => ({
                url: match[2].split('-')[0].trim(),
                number: Number.parseInt(match[3], 10),
                isResolved: match[1] === 'x',
            }),
        );
        return _.sortBy(internalQAPRs, 'number');
    }

    /**
     * Generate the issue body for a StagingDeployCash.
     *
     * @param {String} tag
     * @param {Array} PRList - The list of PR URLs which are included in this StagingDeployCash
     * @param {Array} [verifiedPRList] - The list of PR URLs which have passed QA.
     * @param {Array} [deployBlockers] - The list of DeployBlocker URLs.
     * @param {Array} [resolvedDeployBlockers] - The list of DeployBlockers URLs which have been resolved.
     * @param {Array} [resolvedInternalQAPRs] - The list of Internal QA PR URLs which have been resolved.
     * @param {Boolean} [isTimingDashboardChecked]
     * @param {Boolean} [isFirebaseChecked]
     * @returns {Promise}
     */
    static generateStagingDeployCashBody(
        tag,
        PRList,
        verifiedPRList = [],
        deployBlockers = [],
        resolvedDeployBlockers = [],
        resolvedInternalQAPRs = [],
        isTimingDashboardChecked = false,
        isFirebaseChecked = false,
    ) {
        return this.fetchAllPullRequests(_.map(PRList, this.getPullRequestNumberFromURL))
            .then((data) => {
                const automatedPRs = _.pluck(
                    _.filter(data, GithubUtils.isAutomatedPullRequest),
                    'html_url',
                );
                console.log('Filtering out the following automated pull requests:', automatedPRs);

                // The format of this map is following:
                // {
                //    'https://github.com/Expensify/App/pull/9641': [ 'PauloGasparSv', 'kidroca' ],
                //    'https://github.com/Expensify/App/pull/9642': [ 'mountiny', 'kidroca' ]
                // }
                const internalQAPRMap = _.reduce(
                    _.filter(data, pr => !_.isEmpty(_.findWhere(pr.labels, {name: INTERNAL_QA_LABEL}))),
                    (map, pr) => {
                        // eslint-disable-next-line no-param-reassign
                        map[pr.html_url] = _.compact(_.pluck(pr.assignees, 'login'));
                        return map;
                    },
                    {},
                );
                console.log('Found the following Internal QA PRs:', internalQAPRMap);

                const noQAPRs = _.pluck(
                    _.filter(data, PR => /\[No\s?QA]/i.test(PR.title)),
                    'html_url',
                );
                console.log('Found the following NO QA PRs:', noQAPRs);
                const verifiedOrNoQAPRs = _.union(verifiedPRList, noQAPRs);

                const sortedPRList = _.chain(PRList)
                    .difference(automatedPRs)
                    .difference(_.keys(internalQAPRMap))
                    .unique()
                    .sortBy(GithubUtils.getPullRequestNumberFromURL)
                    .value();
                const sortedDeployBlockers = _.sortBy(
                    _.unique(deployBlockers),
                    GithubUtils.getIssueOrPullRequestNumberFromURL,
                );

                // Tag version and comparison URL
                // eslint-disable-next-line max-len
                let issueBody = `**Release Version:** \`${tag}\`\r\n**Compare Changes:** https://github.com/Expensify/App/compare/production...staging\r\n`;

                // PR list
                if (!_.isEmpty(sortedPRList)) {
                    issueBody += '\r\n**This release contains changes from the following pull requests:**\r\n';
                    _.each(sortedPRList, (URL) => {
                        issueBody += _.contains(verifiedOrNoQAPRs, URL) ? '- [x]' : '- [ ]';
                        issueBody += ` ${URL}\r\n`;
                    });
                    issueBody += '\r\n\r\n';
                }

                // Internal QA PR list
                if (!_.isEmpty(internalQAPRMap)) {
                    console.log('Found the following verified Internal QA PRs:', resolvedInternalQAPRs);
                    issueBody += '**Internal QA:**\r\n';
                    _.each(internalQAPRMap, (assignees, URL) => {
                        const assigneeMentions = _.reduce(assignees, (memo, assignee) => `${memo} @${assignee}`, '');
                        issueBody += `${_.contains(resolvedInternalQAPRs, URL) ? '- [x]' : '- [ ]'} `;
                        issueBody += `${URL}`;
                        issueBody += ` -${assigneeMentions}`;
                        issueBody += '\r\n';
                    });
                    issueBody += '\r\n\r\n';
                }

                // Deploy blockers
                if (!_.isEmpty(deployBlockers)) {
                    issueBody += '**Deploy Blockers:**\r\n';
                    _.each(sortedDeployBlockers, (URL) => {
                        issueBody += _.contains(resolvedDeployBlockers, URL) ? '- [x] ' : '- [ ] ';
                        issueBody += URL;
                        issueBody += '\r\n';
                    });
                    issueBody += '\r\n\r\n';
                }

                issueBody += '**Deployer verifications:**';
                // eslint-disable-next-line max-len
                issueBody += `\r\n- [${isTimingDashboardChecked ? 'x' : ' '}] I checked the [App Timing Dashboard](https://graphs.expensify.com/grafana/d/yj2EobAGz/app-timing?orgId=1) and verified this release does not cause a noticeable performance regression.`;
                // eslint-disable-next-line max-len
                issueBody += `\r\n- [${isFirebaseChecked ? 'x' : ' '}] I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-chat/crashlytics/app/android:com.expensify.chat/issues?state=open&time=last-seven-days&tag=all) and verified that this release does not introduce any new crashes. More detailed instructions on this verification can be found [here](https://stackoverflowteams.com/c/expensify/questions/15095/15096).`;

                issueBody += '\r\n\r\ncc @Expensify/applauseleads\r\n';
                return issueBody;
            })
            .catch(err => console.warn(
                'Error generating StagingDeployCash issue body!',
                'Automated PRs may not be properly filtered out. Continuing...',
                err,
            ));
    }

    /**
     * Fetch all pull requests given a list of PR numbers.
     *
     * @param {Array<Number>} pullRequestNumbers
     * @returns {Promise}
     */
    static fetchAllPullRequests(pullRequestNumbers) {
        const oldestPR = _.first(_.sortBy(pullRequestNumbers));
        return this.paginate(this.octokit.pulls.list, {
            owner: GITHUB_OWNER,
            repo: APP_REPO,
            state: 'all',
            sort: 'created',
            direction: 'desc',
            per_page: 100,
        }, ({data}, done) => {
            if (_.find(data, pr => pr.number === oldestPR)) {
                done();
            }
            return data;
        })
            .then(prList => _.filter(prList, pr => _.contains(pullRequestNumbers, pr.number)))
            .catch(err => console.error('Failed to get PR list', err));
    }

    /**
     * @param {Number} pullRequestNumber
     * @returns {Promise}
     */
    static getPullRequestBody(pullRequestNumber) {
        return this.octokit.pulls.get({
            owner: GITHUB_OWNER,
            repo: APP_REPO,
            pull_number: pullRequestNumber,
        }).then(({data: pullRequestComment}) => pullRequestComment.body);
    }

    /**
     * @param {Number} pullRequestNumber
     * @returns {Promise}
     */
    static getAllReviewComments(pullRequestNumber) {
        return this.paginate(this.octokit.pulls.listReviews, {
            owner: GITHUB_OWNER,
            repo: APP_REPO,
            pull_number: pullRequestNumber,
            per_page: 100,
        }, response => _.map(response.data, review => review.body));
    }

    /**
     * @param {Number} issueNumber
     * @returns {Promise}
     */
    static getAllComments(issueNumber) {
        return this.paginate(this.octokit.issues.listComments, {
            owner: GITHUB_OWNER,
            repo: APP_REPO,
            issue_number: issueNumber,
            per_page: 100,
        }, response => _.map(response.data, comment => comment.body));
    }

    /**
     * Create comment on pull request
     *
     * @param {String} repo - The repo to search for a matching pull request or issue number
     * @param {Number} number - The pull request or issue number
     * @param {String} messageBody - The comment message
     * @returns {Promise}
     */
    static createComment(repo, number, messageBody) {
        console.log(`Writing comment on #${number}`);
        return this.octokit.issues.createComment({
            owner: GITHUB_OWNER,
            repo,
            issue_number: number,
            body: messageBody,
        });
    }

    /**
     * Get the most recent workflow run for the given New Expensify workflow.
     *
     * @param {String} workflow
     * @returns {Promise}
     */
    static getLatestWorkflowRunID(workflow) {
        console.log(`Fetching New Expensify workflow runs for ${workflow}...`);
        return this.octokit.actions.listWorkflowRuns({
            owner: GITHUB_OWNER,
            repo: APP_REPO,
            workflow_id: workflow,
        })
            .then(response => lodashGet(response, 'data.workflow_runs[0].id'));
    }

    /**
     * Generate the well-formatted body of a production release.
     *
     * @param {Array} pullRequests
     * @returns {String}
     */
    static getReleaseBody(pullRequests) {
        return _.map(
            pullRequests,
            number => `- ${this.getPullRequestURLFromNumber(number)}`,
        ).join('\r\n');
    }

    /**
     * Generate the URL of an New Expensify pull request given the PR number.
     *
     * @param {Number} number
     * @returns {String}
     */
    static getPullRequestURLFromNumber(number) {
        return `${APP_REPO_URL}/pull/${number}`;
    }

    /**
     * Parse the pull request number from a URL.
     *
     * @param {String} URL
     * @returns {Number}
     * @throws {Error} If the URL is not a valid Github Pull Request.
     */
    static getPullRequestNumberFromURL(URL) {
        const matches = URL.match(PULL_REQUEST_REGEX);
        if (!_.isArray(matches) || matches.length !== 2) {
            throw new Error(`Provided URL ${URL} is not a Github Pull Request!`);
        }
        return Number.parseInt(matches[1], 10);
    }

    /**
     * Parse the issue number from a URL.
     *
     * @param {String} URL
     * @returns {Number}
     * @throws {Error} If the URL is not a valid Github Issue.
     */
    static getIssueNumberFromURL(URL) {
        const matches = URL.match(ISSUE_REGEX);
        if (!_.isArray(matches) || matches.length !== 2) {
            throw new Error(`Provided URL ${URL} is not a Github Issue!`);
        }
        return Number.parseInt(matches[1], 10);
    }

    /**
     * Parse the issue or pull request number from a URL.
     *
     * @param {String} URL
     * @returns {Number}
     * @throws {Error} If the URL is not a valid Github Issue or Pull Request.
     */
    static getIssueOrPullRequestNumberFromURL(URL) {
        const matches = URL.match(ISSUE_OR_PULL_REQUEST_REGEX);
        if (!_.isArray(matches) || matches.length !== 2) {
            throw new Error(`Provided URL ${URL} is not a valid Github Issue or Pull Request!`);
        }
        return Number.parseInt(matches[1], 10);
    }

    /**
     * Determine if a given pull request is an automated PR.
     *
     * @param {Object} pullRequest
     * @returns {Boolean}
     */
    static isAutomatedPullRequest(pullRequest) {
        return _.isEqual(lodashGet(pullRequest, 'user.login', ''), 'OSBotify');
    }

    /**
     * Return the login of the actor who closed an issue or PR. If the issue is not closed, return an empty string.
     *
     * @param {Number} issueNumber
     * @returns {Promise<String>}
     */
    static getActorWhoClosedIssue(issueNumber) {
        return this.paginate(this.octokit.issues.listEvents, {
            owner: GITHUB_OWNER,
            repo: APP_REPO,
            issue_number: issueNumber,
            per_page: 100,
        })
            .then(events => _.filter(events, event => event.event === 'closed'))
            .then(closedEvents => lodashGet(_.last(closedEvents), 'actor.login', ''));
    }
}

module.exports = GithubUtils;
module.exports.GITHUB_OWNER = GITHUB_OWNER;
module.exports.APP_REPO = APP_REPO;
module.exports.STAGING_DEPLOY_CASH_LABEL = STAGING_DEPLOY_CASH_LABEL;
module.exports.DEPLOY_BLOCKER_CASH_LABEL = DEPLOY_BLOCKER_CASH_LABEL;
module.exports.APPLAUSE_BOT = APPLAUSE_BOT;
module.exports.ISSUE_OR_PULL_REQUEST_REGEX = ISSUE_OR_PULL_REQUEST_REGEX;
module.exports.POLL_RATE = POLL_RATE;

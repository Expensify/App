const _ = require('underscore');
const lodashGet = require('lodash/get');
const core = require('@actions/core');
const {GitHub, getOctokitOptions} = require('@actions/github/lib/utils');
const {throttling} = require('@octokit/plugin-throttling');

const GITHUB_OWNER = 'Expensify';
const EXPENSIFY_CASH_REPO = 'App';
const EXPENSIFY_CASH_URL = 'https://github.com/Expensify/App';

const GITHUB_BASE_URL_REGEX = new RegExp('https?://(?:github\\.com|api\\.github\\.com)');
const PULL_REQUEST_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/pull/([0-9]+).*`);
const ISSUE_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/issues/([0-9]+).*`);
const ISSUE_OR_PULL_REQUEST_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/(?:pull|issues)/([0-9]+).*`);

const APPLAUSE_BOT = 'applausebot';
const STAGING_DEPLOY_CASH_LABEL = 'StagingDeployCash';
const DEPLOY_BLOCKER_CASH_LABEL = 'DeployBlockerCash';
const INTERNAL_QA_LABEL = 'InternalQA';

class GithubUtils {
    /**
     * Either give an existing instance of Octokit or create a new one
     *
     * @readonly
     * @static
     * @memberof GithubUtils
     */
    static get octokit() {
        if (this.octokitInternal) {
            return this.octokitInternal;
        }
        const OctokitThrottled = GitHub.plugin(throttling);
        const token = core.getInput('GITHUB_TOKEN', {required: true});
        this.octokitInternal = new OctokitThrottled(getOctokitOptions(token, {
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
        return this.octokitInternal;
    }


    /**
     * Finds one open `StagingDeployCash` issue via GitHub octokit library.
     *
     * @returns {Promise}
     */
    static getStagingDeployCash() {
        return this.octokit.issues.listForRepo({
            owner: GITHUB_OWNER,
            repo: EXPENSIFY_CASH_REPO,
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
                tag,
            };
        } catch (exception) {
            throw new Error(`Unable to find ${STAGING_DEPLOY_CASH_LABEL} issue with correct data.`);
        }
    }

    /**
     * Parse the PRList section of the StagingDeployCash issue body.
     *
     * @private
     *
     * @param {Object} issue
     * @returns {Array<Object>} - [{url: String, number: Number, isVerified: Boolean}]
     */
    static getStagingDeployCashPRList(issue) {
        let PRListSection = issue.body.match(/pull requests:\*\*(?:\r?\n)*((?:.*\r?\n(?:\s+-\s.*\r?\n)+\r?\n)+)/) || [];
        if (PRListSection.length !== 2) {
            // No PRs, return an empty array
            console.log('Hmmm...The open StagingDeployCash does not list any pull requests, continuing...');
            return [];
        }
        PRListSection = PRListSection[1];
        const PRList = _.map(
            [...PRListSection.matchAll(new RegExp(`- (${PULL_REQUEST_REGEX.source})\\s+- \\[([ x])] QA\\s+- \\[([ x])] Accessibility`, 'g'))],
            match => ({
                url: match[1],
                number: Number.parseInt(match[2], 10),
                isVerified: match[3] === 'x',
                isAccessible: match[4] === 'x',
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
        let deployBlockerSection = issue.body.match(/Deploy Blockers:\*\*\r?\n((?:.*\r?\n)+)/) || [];
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
     * Generate the issue body for a StagingDeployCash.
     *
     * @param {String} tag
     * @param {Array} PRList - The list of PR URLs which are included in this StagingDeployCash
     * @param {Array} [verifiedPRList] - The list of PR URLs which have passed QA.
     * @param {Array} [accessiblePRList] - The list of PR URLs which have passed the accessability check.
     * @param {Array} [deployBlockers] - The list of DeployBlocker URLs.
     * @param {Array} [resolvedDeployBlockers] - The list of DeployBlockers URLs which have been resolved.
     * @returns {Promise}
     */
    static generateStagingDeployCashBody(
        tag,
        PRList,
        verifiedPRList = [],
        accessiblePRList = [],
        deployBlockers = [],
        resolvedDeployBlockers = [],
    ) {
        return this.fetchAllPullRequests(_.map(PRList, this.getPullRequestNumberFromURL))
            .then((data) => {
                const automatedPRs = _.pluck(
                    _.filter(data, GithubUtils.isAutomatedPullRequest),
                    'html_url',
                );
                console.log('Filtering out the following automated pull requests:', automatedPRs);

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
                    _.filter(data, PR => (PR.title || '').toUpperCase().startsWith('[NO QA]')),
                    'html_url',
                );
                console.log('Found the following NO QA PRs:', noQAPRs);
                const verifiedOrNoQAPRs = _.union(verifiedPRList, noQAPRs);
                const accessibleOrNoQAPRs = _.union(accessiblePRList, noQAPRs);

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
                    issueBody += '\r\n**This release contains changes from the following pull requests:**';
                    _.each(sortedPRList, (URL) => {
                        issueBody += `\r\n\r\n- ${URL}`;
                        issueBody += _.contains(verifiedOrNoQAPRs, URL) ? '\r\n  - [x] QA' : '\r\n  - [ ] QA';
                        issueBody += _.contains(accessibleOrNoQAPRs, URL) ? '\r\n  - [x] Accessibility' : '\r\n  - [ ] Accessibility';
                    });
                }

                if (!_.isEmpty(internalQAPRMap)) {
                    issueBody += '\r\n\r\n\r\n**Internal QA:**';
                    _.each(internalQAPRMap, (assignees, URL) => {
                        const assigneeMentions = _.reduce(assignees, (memo, assignee) => `${memo} @${assignee}`, '');
                        issueBody += `\r\n${_.contains(verifiedOrNoQAPRs, URL) ? '- [x]' : '- [ ]'} `;
                        issueBody += `${URL}`;
                        issueBody += ` -${assigneeMentions}`;
                    });
                }

                // Deploy blockers
                if (!_.isEmpty(deployBlockers)) {
                    issueBody += '\r\n\r\n\r\n**Deploy Blockers:**';
                    _.each(sortedDeployBlockers, (URL) => {
                        issueBody += _.contains(resolvedDeployBlockers, URL) ? '\r\n- [x] ' : '\r\n- [ ] ';
                        issueBody += URL;
                    });
                }

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
        return this.octokit.paginate(this.octokit.pulls.list, {
            owner: GITHUB_OWNER,
            repo: EXPENSIFY_CASH_REPO,
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
            repo: EXPENSIFY_CASH_REPO,
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
        return `${EXPENSIFY_CASH_URL}/pull/${number}`;
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
        return this.octokit.paginate(this.octokit.issues.listEvents, {
            owner: GITHUB_OWNER,
            repo: EXPENSIFY_CASH_REPO,
            issue_number: issueNumber,
            per_page: 100,
        })
            .then(events => _.filter(events, event => event.event === 'closed'))
            .then(closedEvents => lodashGet(_.last(closedEvents), 'actor.login', ''));
    }
}

module.exports = GithubUtils;
module.exports.GITHUB_OWNER = GITHUB_OWNER;
module.exports.EXPENSIFY_CASH_REPO = EXPENSIFY_CASH_REPO;
module.exports.STAGING_DEPLOY_CASH_LABEL = STAGING_DEPLOY_CASH_LABEL;
module.exports.DEPLOY_BLOCKER_CASH_LABEL = DEPLOY_BLOCKER_CASH_LABEL;
module.exports.APPLAUSE_BOT = APPLAUSE_BOT;
module.exports.ISSUE_OR_PULL_REQUEST_REGEX = ISSUE_OR_PULL_REQUEST_REGEX;

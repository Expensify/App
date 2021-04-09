const _ = require('underscore');
const lodashGet = require('lodash/get');

const GITHUB_OWNER = 'Expensify';
const EXPENSIFY_CASH_REPO = 'Expensify.cash';
const EXPENSIFY_CASH_URL = 'https://github.com/Expensify/Expensify.cash';

const GITHUB_BASE_URL_REGEX = new RegExp('https?://(?:github\\.com|api\\.github\\.com)');
const PULL_REQUEST_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/pull/([0-9]+).*`);
const ISSUE_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/issues/([0-9]+).*`);
const ISSUE_OR_PULL_REQUEST_REGEX = new RegExp(`${GITHUB_BASE_URL_REGEX.source}/.*/.*/(?:pull|issues)/([0-9]+).*`);

const APPLAUSE_BOT = 'applausebot';
const STAGING_DEPLOY_CASH_LABEL = 'StagingDeployCash';

class GithubUtils {
    /**
     * @param {Octokit} octokit - Authenticated Octokit object https://octokit.github.io/rest.js
     */
    constructor(octokit) {
        this.octokit = octokit;
    }

    /**
     * Finds one open `StagingDeployCash` issue via GitHub octokit library.
     *
     * @returns {Promise}
     */
    getStagingDeployCash() {
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
    getStagingDeployCashData(issue) {
        try {
            const versionRegex = new RegExp('([0-9]+)\\.([0-9]+)\\.([0-9]+)(?:-([0-9]+))?', 'g');
            const tag = issue.body.match(versionRegex)[0].replace(/`/g, '');
            return {
                title: issue.title,
                url: issue.url,
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
    getStagingDeployCashPRList(issue) {
        const PRListSection = issue.body.match(/pull requests:\*\*\r\n((?:.*\r\n)+)\r\n/)[1];
        const unverifiedPRs = _.map(
            [...PRListSection.matchAll(new RegExp(`- \\[ ] (${PULL_REQUEST_REGEX.source})`, 'g'))],
            match => ({
                url: match[1],
                number: GithubUtils.getPullRequestNumberFromURL(match[1]),
                isVerified: false,
            }),
        );
        const verifiedPRs = _.map(
            [...PRListSection.matchAll(new RegExp(`- \\[x] (${PULL_REQUEST_REGEX.source})`, 'g'))],
            match => ({
                url: match[1],
                number: GithubUtils.getPullRequestNumberFromURL(match[1]),
                isVerified: true,
            }),
        );
        return _.sortBy(
            _.union(unverifiedPRs, verifiedPRs),
            'number',
        );
    }

    /**
     * Parse DeployBlocker section of the StagingDeployCash issue body.
     *
     * @private
     *
     * @param {Object} issue
     * @returns {Array<Object>} - [{URL: String, number: Number, isResolved: Boolean}]
     */
    getStagingDeployCashDeployBlockers(issue) {
        let deployBlockerSection = issue.body.match(/Deploy Blockers:\*\*\r\n((?:.*\r\n)+)/) || [];
        if (deployBlockerSection.length !== 2) {
            return [];
        }
        deployBlockerSection = deployBlockerSection[1];
        const unresolvedDeployBlockers = _.map(
            [...deployBlockerSection.matchAll(new RegExp(`- \\[ ] (${ISSUE_OR_PULL_REQUEST_REGEX.source})`, 'g'))],
            match => ({
                url: match[1],
                number: GithubUtils.getIssueOrPullRequestNumberFromURL(match[1]),
                isResolved: false,
            }),
        );
        const resolvedDeployBlockers = _.map(
            [...deployBlockerSection.matchAll(new RegExp(`- \\[x] (${ISSUE_OR_PULL_REQUEST_REGEX.source})`, 'g'))],
            match => ({
                url: match[1],
                number: GithubUtils.getIssueOrPullRequestNumberFromURL(match[1]),
                isResolved: true,
            }),
        );
        return _.sortBy(
            _.union(unresolvedDeployBlockers, resolvedDeployBlockers),
            'number',
        );
    }

    /**
     * Creates a new StagingDeployCash issue.
     *
     * @param {String} title
     * @param {String} tag
     * @param {Array} PRList
     * @returns {Promise}
     */
    createNewStagingDeployCash(title, tag, PRList) {
        return this.generateStagingDeployCashBody(tag, PRList)
            .then(body => this.octokit.issues.create({
                owner: GITHUB_OWNER,
                repo: EXPENSIFY_CASH_REPO,
                labels: [STAGING_DEPLOY_CASH_LABEL],
                assignees: [APPLAUSE_BOT],
                title,
                body,
            }));
    }

    /**
     * Updates the existing open StagingDeployCash issue.
     *
     * @param {String} [newTag]
     * @param {Array} newPRs
     * @param {Array} newDeployBlockers
     * @returns {Promise}
     * @throws {Error} If the StagingDeployCash could not be found or updated.
     */
    updateStagingDeployCash(newTag = '', newPRs, newDeployBlockers) {
        let issueNumber;
        return this.getStagingDeployCash()
            .then(({
                url,
                tag: oldTag,
                PRList: oldPRs,
                deployBlockers: oldDeployBlockers,
            }) => {
                issueNumber = GithubUtils.getIssueNumberFromURL(url);

                // If we aren't sent a tag, then use the existing tag
                const tag = _.isEmpty(newTag) ? oldTag : newTag;

                const PRList = _.sortBy(
                    _.union(oldPRs, _.map(newPRs, URL => ({
                        url: URL,
                        number: GithubUtils.getPullRequestNumberFromURL(URL),
                        isVerified: false,
                    }))),
                    'number',
                );
                const deployBlockers = _.sortBy(
                    _.union(oldDeployBlockers, _.map(newDeployBlockers, URL => ({
                        url: URL,
                        number: GithubUtils.getIssueOrPullRequestNumberFromURL(URL),
                        isResolved: false,
                    }))),
                    'number',
                );

                return this.generateStagingDeployCashBody(
                    tag,
                    _.pluck(PRList, 'url'),
                    _.pluck(_.where(PRList, {isVerified: true}), 'url'),
                    _.pluck(deployBlockers, 'url'),
                    _.pluck(_.where(deployBlockers, {isResolved: true}), 'url'),
                );
            })
            .then(updatedBody => this.octokit.issues.update({
                owner: GITHUB_OWNER,
                repo: EXPENSIFY_CASH_REPO,
                issue_number: issueNumber,
                body: updatedBody,
            }));
    }

    /**
     * Generate the issue body for a StagingDeployCash.
     *
     * @private
     *
     * @param {String} tag
     * @param {Array} PRList - The list of PR URLs which are included in this StagingDeployCash
     * @param {Array} [verifiedPRList] - The list of PR URLs which have passed QA.
     * @param {Array} [deployBlockers] - The list of DeployBlocker URLs.
     * @param {Array} [resolvedDeployBlockers] - The list of DeployBlockers URLs which have been resolved.
     * @returns {Promise}
     */
    generateStagingDeployCashBody(
        tag,
        PRList,
        verifiedPRList = [],
        deployBlockers = [],
        resolvedDeployBlockers = [],
    ) {
        return this.octokit.pulls.list({
            owner: GITHUB_OWNER,
            repo: EXPENSIFY_CASH_REPO,
            per_page: 100,
        })
            .then(({data}) => {
                const automergePRs = _.pluck(
                    _.filter(data, GithubUtils.isAutomergePullRequest),
                    'html_url',
                );
                const sortedPRList = _.chain(PRList)
                    .difference(automergePRs)
                    .unique()
                    .sortBy(GithubUtils.getPullRequestNumberFromURL)
                    .value();
                const sortedDeployBlockers = _.sortBy(
                    _.unique(deployBlockers),
                    GithubUtils.getIssueOrPullRequestNumberFromURL,
                );

                // Tag version and comparison URL
                // eslint-disable-next-line max-len
                let issueBody = `**Release Version:** \`${tag}\`\r\n**Compare Changes:** https://github.com/Expensify/Expensify.cash/compare/production...staging\r\n`;

                // PR list
                if (!_.isEmpty(PRList)) {
                    issueBody += '\r\n**This release contains changes from the following pull requests:**\r\n';
                    _.each(sortedPRList, (URL) => {
                        issueBody += _.contains(verifiedPRList, URL) ? '- [x]' : '- [ ]';
                        issueBody += ` ${URL}\r\n`;
                    });
                }

                // Deploy blockers
                if (!_.isEmpty(deployBlockers)) {
                    issueBody += '\r\n**Deploy Blockers:**\r\n';
                    _.each(sortedDeployBlockers, (URL) => {
                        issueBody += _.contains(resolvedDeployBlockers, URL) ? '- [x]' : '- [ ]';
                        issueBody += ` ${URL}\r\n`;
                    });
                }

                issueBody += '\r\ncc @Expensify/applauseleads\r\n';
                return issueBody;
            })
            .catch(err => console.warn(
                'Error generating StagingDeployCash issue body!',
                'Automerge PRs may not be properly filtered out. Continuing...',
                err,
            ));
    }

    /**
     * Create comment on pull request
     *
     * @param {String} repo - The repo to search for a matching pull request or issue number
     * @param {Number} number - The pull request or issue number
     * @param {String} messageBody - The comment message
     * @returns {Promise}
     */
    createComment(repo, number, messageBody) {
        console.log(`Writing comment on #${number}`);
        return this.octokit.issues.createComment({
            owner: GITHUB_OWNER,
            repo,
            issue_number: number,
            body: messageBody,
        });
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
     * Generate the URL of an Expensify.cash pull request given the PR number.
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
     * Determine if a given pull request is an automerge PR.
     *
     * @param {Object} pullRequest
     * @returns {Boolean}
     */
    static isAutomergePullRequest(pullRequest) {
        return _.isEqual(lodashGet(pullRequest, 'user.login', ''), 'OSBotify')
            && _.contains(_.pluck(pullRequest.labels, 'name'), 'automerge');
    }
}

module.exports = GithubUtils;
module.exports.GITHUB_OWNER = GITHUB_OWNER;
module.exports.EXPENSIFY_CASH_REPO = EXPENSIFY_CASH_REPO;
module.exports.STAGING_DEPLOY_CASH_LABEL = STAGING_DEPLOY_CASH_LABEL;

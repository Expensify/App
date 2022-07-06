/**
 * NOTE: This is a compiled file. DO NOT directly edit this file.
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 507:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const _ = __nccwpck_require__(31);
const core = __nccwpck_require__(320);
const moment = __nccwpck_require__(171);
const GithubUtils = __nccwpck_require__(269);
const GitUtils = __nccwpck_require__(597);

const run = function () {
    const newVersion = core.getInput('NPM_VERSION');
    console.log('New version found from action input:', newVersion);

    let shouldCreateNewStagingDeployCash = false;
    let currentStagingDeployCashIssueNumber = null;

    // Start by fetching the list of recent StagingDeployCash issues, along with the list of open deploy blockers
    return Promise.all([
        GithubUtils.octokit.issues.listForRepo({
            log: console,
            owner: GithubUtils.GITHUB_OWNER,
            repo: GithubUtils.APP_REPO,
            labels: GithubUtils.STAGING_DEPLOY_CASH_LABEL,
            state: 'all',
        }),
        GithubUtils.octokit.issues.listForRepo({
            log: console,
            owner: GithubUtils.GITHUB_OWNER,
            repo: GithubUtils.APP_REPO,
            labels: GithubUtils.DEPLOY_BLOCKER_CASH_LABEL,
        }),
    ])
        .then(([stagingDeployResponse, deployBlockerResponse]) => {
            if (!stagingDeployResponse || !stagingDeployResponse.data || _.isEmpty(stagingDeployResponse.data)) {
                console.error('Failed fetching StagingDeployCash issues from Github!', stagingDeployResponse);
                throw new Error('Failed fetching StagingDeployCash issues from Github');
            }

            if (!deployBlockerResponse || !deployBlockerResponse.data) {
                console.log('Failed fetching DeployBlockerCash issues from Github, continuing...');
            }

            // Look at the state of the most recent StagingDeployCash,
            // if it is open then we'll update the existing one, otherwise, we'll create a new one.
            shouldCreateNewStagingDeployCash = Boolean(stagingDeployResponse.data[0].state !== 'open');
            if (shouldCreateNewStagingDeployCash) {
                console.log('Latest StagingDeployCash is closed, creating a new one.', stagingDeployResponse.data[0]);
            } else {
                console.log(
                    'Latest StagingDeployCash is open, updating it instead of creating a new one.',
                    'Current:', stagingDeployResponse.data[0],
                    'Previous:', stagingDeployResponse.data[1],
                );
            }

            // Parse the data from the previous StagingDeployCash
            // (newest if there are none open, otherwise second-newest)
            const previousStagingDeployCashData = shouldCreateNewStagingDeployCash
                ? GithubUtils.getStagingDeployCashData(stagingDeployResponse.data[0])
                : GithubUtils.getStagingDeployCashData(stagingDeployResponse.data[1]);

            console.log('Found tag of previous StagingDeployCash:', previousStagingDeployCashData.tag);

            if (shouldCreateNewStagingDeployCash) {
                // Find the list of PRs merged between the last StagingDeployCash and the new version
                const mergedPRs = GitUtils.getPullRequestsMergedBetween(previousStagingDeployCashData.tag, newVersion);
                // eslint-disable-next-line max-len
                console.log(`The following PRs have been merged between the previous StagingDeployCash (${previousStagingDeployCashData.tag}) and new version (${newVersion}):`, mergedPRs);

                // TODO: if there are open DeployBlockers and we are opening a new checklist,
                //  then we should close / remove the DeployBlockerCash label from those
                return GithubUtils.generateStagingDeployCashBody(
                    newVersion,
                    _.map(mergedPRs, GithubUtils.getPullRequestURLFromNumber),
                );
            }

            // There is an open StagingDeployCash, so we'll be updating it, not creating a new one
            const currentStagingDeployCashData = GithubUtils.getStagingDeployCashData(stagingDeployResponse.data[0]);
            console.log('Parsed the following data from the current StagingDeployCash:', currentStagingDeployCashData);
            currentStagingDeployCashIssueNumber = currentStagingDeployCashData.number;

            const newDeployBlockers = _.map(deployBlockerResponse.data, ({html_url}) => ({
                url: html_url,
                number: GithubUtils.getIssueOrPullRequestNumberFromURL(html_url),
                isResolved: false,
            }));

            // If we aren't sent a tag, then use the existing tag
            const tag = newVersion || currentStagingDeployCashData.tag;
            const didVersionChange = newVersion ? newVersion !== currentStagingDeployCashData.tag : false;

            // Find the list of PRs merged between the last StagingDeployCash and the new version
            const mergedPRs = GitUtils.getPullRequestsMergedBetween(previousStagingDeployCashData.tag, tag);
            // eslint-disable-next-line max-len
            console.log(`The following PRs have been merged between the previous StagingDeployCash (${previousStagingDeployCashData.tag}) and new version (${tag}):`, mergedPRs);

            // Generate the PR list, preserving the previous state of `isVerified` for existing PRs
            const PRList = _.sortBy(
                _.unique(
                    _.union(currentStagingDeployCashData.PRList, _.map(mergedPRs, number => ({
                        number: Number.parseInt(number, 10),
                        url: GithubUtils.getPullRequestURLFromNumber(number),

                        // Since this is the second argument to _.union,
                        // it will appear later in the array than any duplicate.
                        // Since it is later in the array, it will be truncated by _.unique,
                        // and the original value of isVerified and isAccessible will be preserved.
                        isVerified: false,
                        isAccessible: false,
                    }))),
                    false,
                    item => item.number,
                ),
                'number',
            );

            // Generate the deploy blocker list, preserving the previous state of `isResolved`
            const deployBlockers = _.sortBy(
                _.unique(
                    _.union(currentStagingDeployCashData.deployBlockers, newDeployBlockers),
                    false,
                    item => item.number,
                ),
                'number',
            );

            return GithubUtils.generateStagingDeployCashBody(
                tag,
                _.pluck(PRList, 'url'),
                _.pluck(_.where(PRList, {isVerified: true}), 'url'),
                _.pluck(_.where(PRList, {isAccessible: true}), 'url'),
                _.pluck(deployBlockers, 'url'),
                _.pluck(_.where(deployBlockers, {isResolved: true}), 'url'),
                didVersionChange ? false : currentStagingDeployCashData.isTimingDashboardChecked,
                didVersionChange ? false : currentStagingDeployCashData.isFirebaseChecked,
            );
        })
        .then((body) => {
            const defaultPayload = {
                owner: GithubUtils.GITHUB_OWNER,
                repo: GithubUtils.APP_REPO,
                body,
            };

            if (shouldCreateNewStagingDeployCash) {
                return GithubUtils.octokit.issues.create({
                    ...defaultPayload,
                    title: `Deploy Checklist: New Expensify ${moment().format('YYYY-MM-DD')}`,
                    labels: [GithubUtils.STAGING_DEPLOY_CASH_LABEL],
                    assignees: [GithubUtils.APPLAUSE_BOT],
                });
            }

            return GithubUtils.octokit.issues.update({
                ...defaultPayload,
                issue_number: currentStagingDeployCashIssueNumber,
            });
        })
        .then(({data}) => {
            // eslint-disable-next-line max-len
            console.log(`Successfully ${shouldCreateNewStagingDeployCash ? 'created new' : 'updated'} StagingDeployCash! 🎉 ${data.html_url}`);
            return data;
        })
        .catch((err) => {
            console.error('An unknown error occurred!', err);
            core.setFailed(err);
        });
};

if (require.main === require.cache[eval('__filename')]) {
    run();
}

module.exports = run;


/***/ }),

/***/ 597:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const _ = __nccwpck_require__(31);
const {execSync} = __nccwpck_require__(81);

/**
 * Get merge logs between two refs (inclusive) as a JavaScript object.
 *
 * @param {String} fromRef
 * @param {String} toRef
 * @returns {Object<{commit: String, subject: String}>}
 */
function getMergeLogsAsJSON(fromRef, toRef) {
    const command = `git log --format='{"commit": "%H", "subject": "%s"},' ${fromRef}...${toRef}`;
    console.log('Getting pull requests merged between the following refs:', fromRef, toRef);
    console.log('Running command: ', command);
    const result = execSync(command).toString().trim();

    // Remove any double-quotes from commit subjects
    const sanitizedOutput = result
        .replace(/(?<="subject": ").*(?="})/g, subject => subject.replace(/"/g, "'"));

    // Then format as JSON and convert to a proper JS object
    const json = `[${sanitizedOutput}]`.replace('},]', '}]');
    return JSON.parse(json);
}

/**
 * Parse merged PRs, excluding those from irrelevant branches.
 *
 * @param {Array<String>} commitMessages
 * @returns {Array<String>}
 */
function getValidMergedPRs(commitMessages) {
    return _.reduce(commitMessages, (mergedPRs, commitMessage) => {
        if (!_.isString(commitMessage)) {
            return mergedPRs;
        }

        const match = commitMessage.match(/Merge pull request #(\d+) from (?!Expensify\/(?:main|version-|update-staging-from-main|update-production-from-staging))/);
        if (!_.isNull(match) && match[1]) {
            mergedPRs.push(match[1]);
        }

        return mergedPRs;
    }, []);
}

/**
 * Takes in two git refs and returns a list of PR numbers of all PRs merged between those two refs
 *
 * @param {String} fromRef
 * @param {String} toRef
 * @returns {Array<String>} – Pull request numbers
 */
function getPullRequestsMergedBetween(fromRef, toRef) {
    const targetMergeList = getMergeLogsAsJSON(fromRef, toRef);
    console.log(`Commits made between ${fromRef} and ${toRef}:`, targetMergeList);

    // Get the full history on this branch, inclusive of the oldest commit from our target comparison
    const oldestCommit = _.last(targetMergeList).commit;
    const fullMergeList = getMergeLogsAsJSON(oldestCommit, 'HEAD');

    // Remove from the final merge list any commits whose message appears in the full merge list more than once.
    // This indicates that the PR should not be included in our list because it is a duplicate, and thus has already been processed by our CI
    // See https://github.com/Expensify/App/issues/4977 for details
    const duplicateMergeList = _.chain(fullMergeList)
        .groupBy('subject')
        .values()
        .filter(i => i.length > 1)
        .flatten()
        .pluck('commit')
        .value();
    const finalMergeList = _.filter(targetMergeList, i => !_.contains(duplicateMergeList, i.commit));
    console.log('Filtered out the following commits which were duplicated in the full git log:', _.difference(targetMergeList, finalMergeList));

    // Find which commit messages correspond to merged PR's
    const pullRequestNumbers = getValidMergedPRs(_.pluck(finalMergeList, 'subject'));
    console.log(`List of pull requests merged between ${fromRef} and ${toRef}`, pullRequestNumbers);
    return pullRequestNumbers;
}

module.exports = {
    getValidMergedPRs,
    getPullRequestsMergedBetween,
};


/***/ }),

/***/ 269:
/***/ ((module, __unused_webpack_exports, __nccwpck_require__) => {

const _ = __nccwpck_require__(31);
const lodashGet = __nccwpck_require__(969);
const core = __nccwpck_require__(320);
const {GitHub, getOctokitOptions} = __nccwpck_require__(775);
const {throttling} = __nccwpck_require__(684);

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
        const internalQAPRList = this.getStagingDeployCashInternalQA(issue);
        return _.sortBy(_.union(PRList, internalQAPRList), 'number');
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
     * Parse InternalQA section of the StagingDeployCash issue body.
     *
     * @private
     *
     * @param {Object} issue
     * @returns {Array<Object>} - [{URL: String, number: Number, isResolved: Boolean, isAccessible: Boolean}]
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
                url: match[2],
                number: Number.parseInt(match[3], 10),
                isResolved: match[1] === 'x',
                isAccessible: false,
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
     * @param {Array} [accessiblePRList] - The list of PR URLs which have passed the accessability check.
     * @param {Array} [deployBlockers] - The list of DeployBlocker URLs.
     * @param {Array} [resolvedDeployBlockers] - The list of DeployBlockers URLs which have been resolved.
     * @param {Boolean} [isTimingDashboardChecked]
     * @param {Boolean} [isFirebaseChecked]
     * @returns {Promise}
     */
    static generateStagingDeployCashBody(
        tag,
        PRList,
        verifiedPRList = [],
        accessiblePRList = [],
        deployBlockers = [],
        resolvedDeployBlockers = [],
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

                issueBody += '\r\n\r\n**Deployer verifications:**';
                // eslint-disable-next-line max-len
                issueBody += `\r\n- [${isTimingDashboardChecked ? 'x' : ' '}] I checked the [App Timing Dashboard](https://graphs.expensify.com/grafana/d/yj2EobAGz/app-timing?orgId=1) and verified this release does not cause a noticeable performance regression.`;
                // eslint-disable-next-line max-len
                issueBody += `\r\n- [${isFirebaseChecked ? 'x' : ' '}] I checked [Firebase Crashlytics](https://console.firebase.google.com/u/0/project/expensify-chat/crashlytics/app/android:com.expensify.chat/issues?state=open&time=last-seven-days&tag=all) and verified that this release does not introduce any new crashes.`;

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
        return this.octokit.paginate(this.octokit.issues.listEvents, {
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


/***/ }),

/***/ 320:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 775:
/***/ ((module) => {

module.exports = eval("require")("@actions/github/lib/utils");


/***/ }),

/***/ 684:
/***/ ((module) => {

module.exports = eval("require")("@octokit/plugin-throttling");


/***/ }),

/***/ 969:
/***/ ((module) => {

module.exports = eval("require")("lodash/get");


/***/ }),

/***/ 171:
/***/ ((module) => {

module.exports = eval("require")("moment");


/***/ }),

/***/ 31:
/***/ ((module) => {

module.exports = eval("require")("underscore");


/***/ }),

/***/ 81:
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

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
/******/ 			__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
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
/******/ 	var __webpack_exports__ = __nccwpck_require__(507);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;

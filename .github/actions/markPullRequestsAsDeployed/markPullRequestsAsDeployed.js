const _ = require('underscore');
const core = require('@actions/core');
const {context} = require('@actions/github');
const moment = require('moment');
const ActionUtils = require('../../libs/ActionUtils');
const GithubUtils = require('../../libs/GithubUtils');


const prList = ActionUtils.getJSONInput('PR_LIST', {required: true});
const isProd = ActionUtils.getJSONInput('IS_PRODUCTION_DEPLOY', {required: true});
const version = core.getInput('DEPLOY_VERSION', {required: true});
const PRMap = {};
const stagingDeployIssueMap = {};
let stagingDeployIssuesList = [];


/**
 * Return a nicely formatted message for the table based on the result of the GitHub action job
 *
 * @param {string} platformResult
 * @returns {string}
 */
function getDeployTableMessage(platformResult) {
    switch (platformResult) {
        case 'success':
            return `${platformResult} ✅`;
        case 'cancelled':
            return `${platformResult} 🔪`;
        case 'skipped':
            return `${platformResult} 🚫`;
        case 'failure':
        default:
            return `${platformResult} ❌`;
    }
}

const androidResult = getDeployTableMessage(core.getInput('ANDROID', {required: true}));
const desktopResult = getDeployTableMessage(core.getInput('DESKTOP', {required: true}));
const iOSResult = getDeployTableMessage(core.getInput('IOS', {required: true}));
const webResult = getDeployTableMessage(core.getInput('WEB', {required: true}));

const workflowURL = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`
    + `/actions/runs/${process.env.GITHUB_RUN_ID}`;

/**
 * Fetch all the StagingDeploy issues that were created after the passed fromTimestamp and
 * including one before the fromTimestamp.
 *
 * @param {String} fromTimestamp
 * @returns {Promise}
 */
function fetchAllStagingDeployCash(fromTimestamp) {
    return GithubUtils.octokit.paginate(GithubUtils.octokit.issues.listForRepo, {
        owner: GithubUtils.GITHUB_OWNER,
        repo: GithubUtils.EXPENSIFY_CASH_REPO,
        state: 'all',
        sort: 'created',
        direction: 'desc',
        labels: GithubUtils.STAGING_DEPLOY_CASH_LABEL,
        per_page: 30,
    }, ({data}, done) => {
        const lastIssueIndex = _.findIndex(data, issue => moment(issue.created_at).isBefore(moment(fromTimestamp)));
        if (lastIssueIndex !== -1) {
            done();
        }
        return data;
    })
        .catch(err => console.error(`Failed to get ${GithubUtils.STAGING_DEPLOY_CASH_LABEL} issues list`, err));
}

/**
 * Get the [added, removed] pairs for the `🔐 LockCashDeploys 🔐` label on StagingDeployCash
 * @param {Number|String} stagingDeployIssueNumber
 * @return {Promise<Array<[string, string]>>}
 */
function fetchLockCashDeploysTimeline(stagingDeployIssueNumber) {
    return GithubUtils.octokit.paginate(GithubUtils.octokit.issues.listEvents, {
        owner: GithubUtils.GITHUB_OWNER,
        repo: GithubUtils.EXPENSIFY_CASH_REPO,
        issue_number: stagingDeployIssueNumber,
        per_page: 100,
    }).then((events) => {
        let pair = [];
        const startEndPairs = _.compact(_.map(events, ({event, created_at, label}, index) => {
            if (event === 'labeled' && label.name === '🔐 LockCashDeploys 🔐') {
                if (pair.length) {
                    // flush the pair
                    pair = [];
                }
                pair.push(created_at);
            } else if (event === 'unlabeled' && label.name === '🔐 LockCashDeploys 🔐') {
                pair.push(created_at);
            }
            if (index === events.length - 1 && pair.length === 1) {
                pair.push(moment().toISOString());
                return pair;
            }
            return pair.length > 1 ? pair : undefined;
        }));
        return startEndPairs;
    }).catch(err => console.error('Failed to get the 🔐 LockCashDeploys 🔐 label\'s timeline', err));
}

/**
 * Get StagingDeployIssue timeline for the PR
 *
 * @param {Number} pr
 * @return {Promise<[string, string][]>}
 */
function getPRLockCashDeploysTimeline(pr) {
    const prData = PRMap[pr];
    const stagingDeployIssue = _.find(
        stagingDeployIssuesList, issue => moment(issue.created_at).isBefore(moment(prData.mergedAt)),
    );
    const stagingDeployIssueMapRef = stagingDeployIssueMap[stagingDeployIssue.number];
    if (stagingDeployIssueMapRef.timeline) {
        return Promise.resolve(stagingDeployIssueMapRef.timeline);
    }
    return fetchLockCashDeploysTimeline(stagingDeployIssue.number).then((lockCashDeployLabelTimeSet) => {
        stagingDeployIssueMap[stagingDeployIssue.number].timeline = lockCashDeployLabelTimeSet;
        return lockCashDeployLabelTimeSet;
    });
}

/**
 * Get Deploy Verb for the PR
 *
 * @param {Number} pr
 * @return {Promise<'Cherry-picked' | 'Deployed'>}
 */
function getPRDeployVerb(pr) {
    const PR = PRMap[pr];
    const hasCPStagingLabel = _.contains(_.pluck(PR.labels, 'name'), 'CP Staging');

    if (!hasCPStagingLabel) {
        return Promise.resolve('Deployed');
    }
    return getPRLockCashDeploysTimeline(pr).then((lockCashDeployLabelTimeline) => {
        const liesBetweenTimeline = _.some(
            lockCashDeployLabelTimeline,
            ([startAt, endAt]) => moment(PR.mergedAt).isBetween(startAt, endAt, undefined, '[]'),
        );
        return liesBetweenTimeline ? 'Cherry-picked' : 'Deployed';
    });
}

function getPRMessage(PR) {
    return getPRDeployVerb(PR).then((deployVerb) => {
        let message = `🚀 [${deployVerb}](${workflowURL}) to ${isProd ? 'production' : 'staging'}\
         in version: ${version}🚀`;
        message += `\n\n platform | result \n ---|--- \n🤖 android 🤖|${androidResult} \n🖥 desktop 🖥|${desktopResult}`;
        message += `\n🍎 iOS 🍎|${iOSResult} \n🕸 web 🕸|${webResult}`;
        return message;
    });
}

/**
 * Comment Single PR
 *
 * @param {Number} pr
 * @returns {Promise<void>}
 */
function commentPR(pr) {
    return getPRMessage(pr).then(message => GithubUtils.createComment(context.repo.repo, pr, message))
        .then(() => {
            console.log(`Comment created on #${pr} successfully 🎉`);
        })
        .catch((err) => {
            console.log(`Unable to write comment on #${pr} 😞`);
            core.setFailed(err.message);
        });
}

const run = function () {
    return GithubUtils.fetchAllPullRequests(_.compact(_.map(prList, pr => parseInt(pr, 10))))
        .then((PRListWithDetails) => {
            _.each(PRListWithDetails, (PR) => {
                PRMap[PR.number] = PR;
            });
            const oldestPR = _.first(_.sortBy(prList));
            return fetchAllStagingDeployCash(PRMap[oldestPR].mergedAt);
        })
        .then((issueList) => {
            _.each(issueList, (issueData) => {
                stagingDeployIssueMap[issueData.number] = {
                    data: issueData,
                };
            });
            stagingDeployIssuesList = issueList;

            /**
             * Create comment on each pull request
             */
            return prList.reduce((promise, pr) => promise.then(() => commentPR(pr)), Promise.resolve());
        })
        .catch(err => console.error('Failed to get neccesary data to comment deployed PRs', err));
};

if (require.main === module) {
    run();
}

module.exports = run;

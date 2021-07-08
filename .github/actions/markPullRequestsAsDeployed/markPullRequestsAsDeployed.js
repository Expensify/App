const _ = require('underscore');
const core = require('@actions/core');
const {context} = require('@actions/github');
const moment = require('moment');
const ActionUtils = require('../../libs/ActionUtils');
const GithubUtils = require('../../libs/GithubUtils');


const prList = ActionUtils.getJSONInput('PR_LIST', {required: true});
const isProd = ActionUtils.getJSONInput('IS_PRODUCTION_DEPLOY', {required: true});
const stagingDeployIssueNumber = ActionUtils.getJSONInput('STAGING_DEPLOY_NUMBER', {required: true});
const version = core.getInput('DEPLOY_VERSION', {required: true});
let lockCashDeployLabelTimeline = [];
const PRMap = {};


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

/**
 * Get the [added, removed] pairs for the `🔐 LockCashDeploys 🔐` label on StagingDeployCash
 *
 * @return {Promise<Array<[string, string]>>}
 */
function getLockCashDeploysTimeline() {
    return GithubUtils.octokit.paginate(GithubUtils.octokit.issues.listEvents, {
        owner: GithubUtils.GITHUB_OWNER,
        repo: GithubUtils.GITHUB_REPOSITORY,
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

const androidResult = getDeployTableMessage(core.getInput('ANDROID', {required: true}));
const desktopResult = getDeployTableMessage(core.getInput('DESKTOP', {required: true}));
const iOSResult = getDeployTableMessage(core.getInput('IOS', {required: true}));
const webResult = getDeployTableMessage(core.getInput('WEB', {required: true}));

const workflowURL = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`
    + `/actions/runs/${process.env.GITHUB_RUN_ID}`;

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
        return 'Deployed';
    }
    const liesBetweenTimeline = _.some(
        lockCashDeployLabelTimeline,
        ([startAt, endAt]) => moment(PR.mergedAt).isBetween(startAt, endAt, undefined, '[]'),
    );
    return liesBetweenTimeline ? 'Cherry-picked' : 'Deployed';
}

function getPRMessage(PR) {
    const deployVerb = getPRDeployVerb(PR);
    let message = `🚀 [${deployVerb}](${workflowURL}) to ${isProd ? 'production' : 'staging'}\
         in version: ${version}🚀`;
    message += `\n\n platform | result \n ---|--- \n🤖 android 🤖|${androidResult} \n🖥 desktop 🖥|${desktopResult}`;
    message += `\n🍎 iOS 🍎|${iOSResult} \n🕸 web 🕸|${webResult}`;
    return message;
}

/**
 * Comment Single PR
 *
 * @param {Number} pr
 * @returns {Promise<void>}
 */
function commentPR(pr) {
    return GithubUtils.createComment(context.repo.repo, pr, getPRMessage(pr))
        .then(() => {
            console.log(`Comment created on #${pr} successfully 🎉`);
        })
        .catch((err) => {
            console.log(`Unable to write comment on #${pr} 😞`);
            core.setFailed(err.message);
        });
}

const run = function () {
    return Promise.all([
        getLockCashDeploysTimeline(),
        GithubUtils.fetchAllPullRequests(prList.map(pr => parseInt(pr, 10))),
    ])
        .then(([lockCashDeployLabelTimeSet, PRListWithDetails]) => {
            lockCashDeployLabelTimeline = lockCashDeployLabelTimeSet;
            _.each(PRListWithDetails, (PR) => {
                PRMap[PR.number] = PR;
            });

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

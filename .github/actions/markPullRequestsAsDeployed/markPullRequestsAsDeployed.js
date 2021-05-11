const core = require('@actions/core');
const {GitHub, getOctokitOptions} = require('@actions/github/lib/utils');
const {throttling} = require('@octokit/plugin-throttling');
const GithubUtils = require('../../libs/GithubUtils');

const OctokitThrottled = GitHub.plugin(throttling);

const prList = JSON.parse(core.getInput('PR_LIST', {required: true}));
const isProd = JSON.parse(
    core.getInput('IS_PRODUCTION_DEPLOY', {required: true}),
);
const version = core.getInput('DEPLOY_VERSION', {required: true});
const token = core.getInput('GITHUB_TOKEN', {required: true});
const octokit = new OctokitThrottled(getOctokitOptions(token, {
    throttle: {
        onRateLimit: (retryAfter, options) => {
            console.warn(
                `Request quota exhausted for request ${options.method} ${options.url}`,
            );

            // Retry twice after hitting a rate limit error, then give up
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
const githubUtils = new GithubUtils(octokit);

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

let message = `🚀 [Deployed](${workflowURL}) to ${isProd ? 'production' : 'staging'} in version: ${version}🚀`;
message += `\n\n platform | result \n ---|--- \n🤖 android 🤖|${androidResult} \n🖥 desktop 🖥|${desktopResult}`;
message += `\n🍎 iOS 🍎|${iOSResult} \n🕸 web 🕸|${webResult}`;

/**
 * Comment Single PR
 *
 * @param {Object} pr
 * @returns {Promise<void>}
 */
function commentPR(pr) {
    return githubUtils.createComment(GitHub.context.repo.repo, pr, message, octokit)
        .then(() => {
            console.log(`Comment created on #${pr} successfully 🎉`);
        })
        .catch((err) => {
            console.log(`Unable to write comment on #${pr} 😞`);
            core.setFailed(err.message);
        });
}

/**
 * Create comment on each pull request
 */
prList.reduce((promise, pr) => promise.then(() => commentPR(pr)), Promise.resolve());

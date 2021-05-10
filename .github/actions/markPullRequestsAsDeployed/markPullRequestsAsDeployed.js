const core = require('@actions/core');
const github = require('@actions/github');
const GithubUtils = require('../../libs/GithubUtils');

const prList = JSON.parse(core.getInput('PR_LIST', {required: true}));
const isProd = JSON.parse(
    core.getInput('IS_PRODUCTION_DEPLOY', {required: true}),
);
const version = core.getInput('DEPLOY_VERSION', {required: true});
const token = core.getInput('GITHUB_TOKEN', {required: true});
const octokit = github.getOctokit(token);
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
    return githubUtils.createComment(github.context.repo.repo, pr, message, octokit)
        .then(() => {
            console.log(`Comment created on #${pr} successfully 🎉`);

            // Sleep for 1 sec before making another request
            return new Promise(res => setTimeout(res, 1000));
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

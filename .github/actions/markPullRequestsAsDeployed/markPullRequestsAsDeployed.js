const _ = require('underscore');
const lodashGet = require('lodash/get');
const core = require('@actions/core');
const {context} = require('@actions/github');
const ActionUtils = require('../../libs/ActionUtils');
const GithubUtils = require('../../libs/GithubUtils');

const prList = ActionUtils.getJSONInput('PR_LIST', {required: true});
const isProd = ActionUtils.getJSONInput('IS_PRODUCTION_DEPLOY', {required: true});
const version = core.getInput('DEPLOY_VERSION', {required: true});

/**
 * Return a nicely formatted message for the table based on the result of the GitHub action job
 *
 * @param {String} platformResult
 * @returns {String}
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
 * @param {String} deployer
 * @param {String} deployVerb
 * @param {String} prTitle
 * @returns {String}
 */
function getDeployMessage(deployer, deployVerb, prTitle) {
    let message = `🚀 [${deployVerb}](${workflowURL}) to ${isProd ? 'production' : 'staging'}`;
    message += ` by @${deployer} in version: ${version} 🚀`;
    message += `\n\n platform | result \n ---|--- \n🤖 android 🤖|${androidResult} \n🖥 desktop 🖥|${desktopResult}`;
    message += `\n🍎 iOS 🍎|${iOSResult} \n🕸 web 🕸|${webResult}`;

    if (deployVerb === 'Cherry-picked' && !(/no qa/gi).test(prTitle)) {
        // eslint-disable-next-line max-len
        message += '\n\n@Expensify/applauseleads please QA this PR and check it off on the [deploy checklist](https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3AStagingDeployCash) if it passes.';
    }

    return message;
}

/**
 * Comment Single PR
 *
 * @param {Number} PR
 * @param {String} message
 * @returns {Promise<void>}
 */
function commentPR(PR, message) {
    return GithubUtils.createComment(context.repo.repo, PR, message)
        .then(() => console.log(`Comment created on #${PR} successfully 🎉`))
        .catch((err) => {
            console.log(`Unable to write comment on #${PR} 😞`);
            core.setFailed(err.message);
        });
}

const run = function () {
    if (isProd) {
        // First find the deployer (who closed the last deploy checklist)?
        return GithubUtils.octokit.issues.listForRepo({
            owner: GithubUtils.GITHUB_OWNER,
            repo: GithubUtils.EXPENSIFY_CASH_REPO,
            labels: GithubUtils.STAGING_DEPLOY_CASH_LABEL,
            state: 'closed',
        })
            .then(({data}) => _.first(data).number)
            .then(lastDeployChecklistNumber => GithubUtils.getActorWhoClosedIssue(lastDeployChecklistNumber))
            .then((actor) => {
                // Create comment on each pull request (one after another to avoid throttling issues)
                const deployMessage = getDeployMessage(actor, 'Deployed');
                prList.reduce((promise, pr) => promise.then(() => commentPR(pr, deployMessage)), Promise.resolve());
            });
    }

    // First find out if this is a normal staging deploy or a CP by looking at the commit message on the tag
    return GithubUtils.octokit.repos.listTags({
        owner: GithubUtils.GITHUB_OWNER,
        repo: GithubUtils.EXPENSIFY_CASH_REPO,
        per_page: 100,
    })
        .then(({data}) => {
            const tagSHA = _.find(data, tag => tag.name === version).commit.sha;
            return GithubUtils.octokit.git.getCommit({
                owner: GithubUtils.GITHUB_OWNER,
                repo: GithubUtils.EXPENSIFY_CASH_REPO,
                commit_sha: tagSHA,
            });
        })
        .then(({data}) => {
            const isCP = /Merge pull request #\d+ from Expensify\/.*-?cherry-pick-staging-\d+/.test(data.message);
            prList.reduce((promise, PR) => promise

                // Then, for each PR, find out who merged it and determine the deployer
                .then(() => GithubUtils.octokit.pulls.get({
                    owner: GithubUtils.GITHUB_OWNER,
                    repo: GithubUtils.EXPENSIFY_CASH_REPO,
                    pull_number: PR,
                }))
                .then((response) => {
                    /*
                     * The deployer for staging deploys is:
                     *   1. For regular staging deploys, the person who merged the PR.
                     *   2. For automatic CPs (using the label), the person who merged the PR.
                     *   3. For manual CPs (using the GH UI), the person who triggered the workflow
                     *      (reflected in the branch name).
                     */
                    let deployer = lodashGet(response, 'data.merged_by.login', '');
                    const issueTitle = lodashGet(response, 'data.title', '');
                    const CPActorMatches = data.message
                        .match(/Merge pull request #\d+ from Expensify\/(.+)-cherry-pick-staging-\d+/);
                    if (_.isArray(CPActorMatches) && CPActorMatches.length === 2 && CPActorMatches[1] !== 'OSBotify') {
                        deployer = CPActorMatches[1];
                    }

                    // Finally, comment on the PR
                    const deployMessage = getDeployMessage(deployer, isCP ? 'Cherry-picked' : 'Deployed', issueTitle);
                    return commentPR(PR, deployMessage);
                }),
            Promise.resolve());
        });
};

if (require.main === module) {
    run();
}

module.exports = run;

const _ = require('underscore');
const core = require('@actions/core');
const moment = require('moment');
const GithubUtils = require('../../libs/GithubUtils');
const GitUtils = require('../../libs/GitUtils');

const run = function () {
    const newVersion = core.getInput('NPM_VERSION');

    let shouldCreateNewStagingDeployCash = false;
    let currentStagingDeployCashIssueNumber = null;

    // Start by fetching the list of recent StagingDeployCash issues, along with the list of open deploy blockers
    return Promise.all([
        GithubUtils.octokit.issues.listForRepo({
            log: console,
            owner: GithubUtils.GITHUB_OWNER,
            repo: GithubUtils.EXPENSIFY_CASH_REPO,
            labels: GithubUtils.STAGING_DEPLOY_CASH_LABEL,
            state: 'all',
        }),
        GithubUtils.octokit.issues.listForRepo({
            log: console,
            owner: GithubUtils.GITHUB_OWNER,
            repo: GithubUtils.EXPENSIFY_CASH_REPO,
            labels: GithubUtils.DEPLOY_BLOCKER_CASH_LABEL,
        }),
    ])
        .then((results) => {
            const [stagingDeployResponse, deployBlockerResponse] = results;
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

            // Find the list of PRs merged between the last StagingDeployCash and the new version
            const mergedPRs = GitUtils.getPullRequestsMergedBetween(previousStagingDeployCashData.tag, newVersion);
            console.log(
                'The following PRs have been merged between the previous StagingDeployCash and new version:',
                mergedPRs,
            );

            if (shouldCreateNewStagingDeployCash) {
                // We're in the create flow, not update
                // TODO: if there are open DeployBlockers and we are opening a new checklist,
                //  then we should close / remove the DeployBlockerCash label from those
                return GithubUtils.generateStagingDeployCashBody(newVersion, mergedPRs);
            }

            // There is an open StagingDeployCash, so we'll be updating it, not creating a new one
            const currentStagingDeployCashData = GithubUtils.getStagingDeployCashData(stagingDeployResponse.data[0]);
            currentStagingDeployCashIssueNumber = currentStagingDeployCashData.number;

            const newDeployBlockers = _.map(deployBlockerResponse.data, ({url}) => ({
                url,
                number: GithubUtils.getIssueOrPullRequestNumberFromURL(url),
                isResolved: false,
            }));

            // If we aren't sent a tag, then use the existing tag
            const tag = newVersion || currentStagingDeployCashData.tag;

            // Generate the PR list, preserving the previous state of `isVerified` for existing PRs
            const PRList = _.sortBy(
                _.unique(
                    _.union(currentStagingDeployCashData.PRList, _.map(mergedPRs, url => ({
                        url,
                        number: GithubUtils.getPullRequestNumberFromURL(url),

                        // Since this is the second argument to _.union,
                        // it will appear later in the array than any duplicate.
                        // Since it is later in the array, it will be truncated by _.unique,
                        // and the original value of isVerified will be preserved.
                        isVerified: false,
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
                _.pluck(deployBlockers, 'url'),
                _.pluck(_.where(deployBlockers, {isResolved: true}), 'url'),
            );
        })
        .then((body) => {
            const defaultPayload = {
                owner: GithubUtils.GITHUB_OWNER,
                repo: GithubUtils.EXPENSIFY_CASH_REPO,
                body,
            };

            if (shouldCreateNewStagingDeployCash) {
                return GithubUtils.octokit.issues.create({
                    ...defaultPayload,
                    title: `Deploy Checklist: Expensify.cash ${moment().format('YYYY-MM-DD')}`,
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

if (require.main === module) {
    run();
}

module.exports = run;

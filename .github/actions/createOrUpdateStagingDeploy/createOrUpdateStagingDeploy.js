const _ = require('underscore');
const core = require('@actions/core');
const moment = require('moment');
const GithubUtils = require('../../libs/GithubUtils');
const GitUtils = require('../../libs/GitUtils');

const newVersion = core.getInput('NPM_VERSION');


GithubUtils.getStagingDeployCash()
    .then(() => GithubUtils.updateStagingDeployCash(
        newVersion,
        _.filter(
            _.map(core.getInput('NEW_PULL_REQUESTS').split(','), PR => PR.trim()),
            PR => !_.isEmpty(PR),
        ),
        _.filter(
            _.map(core.getInput('NEW_DEPLOY_BLOCKERS').split(','), deployBlocker => deployBlocker.trim()),
            PR => !_.isEmpty(PR),
        ),
    ))
    .then(({data}) => {
        console.log('Successfully updated StagingDeployCash! 🎉', data.html_url);
        process.exit(0);
    })
    .catch((err) => {
        // Unable to find the open StagingDeployCash
        if (err && err.code === 404) {
            console.log('No open StagingDeployCash found, creating a new one.');

            // Fetch all the StagingDeployCash issues
            return GithubUtils.octokit.issues.listForRepo({
                log: console,
                owner: GithubUtils.GITHUB_OWNER,
                repo: GithubUtils.EXPENSIFY_CASH_REPO,
                labels: GithubUtils.STAGING_DEPLOY_CASH_LABEL,
                state: 'closed',
            });
        }

        // Unexpected error!
        console.error('Unexpected error occurred finding the StagingDeployCash!'
                + ' There may have been more than one open StagingDeployCash found,'
                + ' or there was some other problem with the Github API request.', err);
        core.setFailed(err);
    })
    .then((githubResponse) => {
        if (!githubResponse || !githubResponse.data || _.isEmpty(githubResponse.data)) {
            console.error('Failed fetching data from Github!', githubResponse);
            throw new Error('Failed fetching data from Github');
        }

        // Parse the tag from the most recent StagingDeployCash
        const lastTag = GithubUtils.getStagingDeployCashData(githubResponse.data[0]).tag;
        console.log('Found tag of previous StagingDeployCash:', lastTag);

        // Find the list of PRs merged between the last StagingDeployCash and the new version
        const mergedPRs = GitUtils.getPullRequestsMergedBetween(lastTag, newVersion);

        // Create new StagingDeployCash
        return GithubUtils.createNewStagingDeployCash(
            `Deploy Checklist: Expensify.cash ${moment().format('YYYY-MM-DD')}`,
            newVersion,
            _.map(mergedPRs, GithubUtils.getPullRequestURLFromNumber),
        );
    })
    .then(({data}) => console.log('Successfully created new StagingDeployCash! 🎉', data.html_url))
    .catch((err) => {
        console.error('An error occurred!', err);
        core.setFailed(err);
    });

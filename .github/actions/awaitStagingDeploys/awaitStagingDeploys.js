const _ = require('underscore');
const GitHubUtils = require('../../libs/GithubUtils');
const {promiseDoWhile} = require('../../libs/promiseWhile');

function run() {
    let currentStagingDeploys = [];
    return promiseDoWhile(
        () => !_.isEmpty(currentStagingDeploys),
        _.throttle(
            () => Promise.all([
                // These are active deploys
                GitHubUtils.octokit.actions.listWorkflowRuns({
                    owner: GitHubUtils.GITHUB_OWNER,
                    repo: GitHubUtils.APP_REPO,
                    workflow_id: 'platformDeploy.yml',
                    event: 'push',
                }),

                // These have the potential to become active deploys, so we need to wait for them to finish as well
                // In this context, we'll refer to unresolved preDeploy workflow runs as staging deploys as well
                GitHubUtils.octokit.actions.listWorkflowRuns({
                    owner: GitHubUtils.GITHUB_OWNER,
                    repo: GitHubUtils.APP_REPO,
                    workflow_id: 'preDeploy.yml',
                }),
            ])
                .then(responses => [
                    ...responses[0].data.workflow_runs,
                    ...responses[1].data.workflow_runs,
                ])
                .then(workflowRuns => currentStagingDeploys = _.filter(workflowRuns, workflowRun => workflowRun.status !== 'completed'))
                .then(() => console.log(
                    _.isEmpty(currentStagingDeploys)
                        ? 'No current staging deploys found'
                        : `Found ${currentStagingDeploys.length} staging deploy${currentStagingDeploys.length > 1 ? 's' : ''} still running...`,
                )),

            // Poll every 60 seconds instead of every 10 seconds
            GitHubUtils.POLL_RATE * 6,
        ),
    );
}

if (require.main === module) {
    run();
}

module.exports = run;

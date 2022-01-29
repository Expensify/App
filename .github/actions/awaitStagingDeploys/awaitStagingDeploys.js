const _ = require('underscore');
const GitHubUtils = require('../../libs/GithubUtils');
const {promiseDoWhile} = require('../../libs/promiseWhile');

function run() {
    let currentStagingDeploys = [];
    return promiseDoWhile(
        () => !_.isEmpty(currentStagingDeploys),
        _.throttle(
            () => GitHubUtils.octokit.actions.listWorkflowRuns({
                owner: GitHubUtils.GITHUB_OWNER,
                repo: GitHubUtils.APP_REPO,
                workflow_id: 'platformDeploy.yml',
                event: 'push',
            })
                .then(response => currentStagingDeploys = _.filter(response.data.workflow_runs, workflowRun => workflowRun.status !== 'completed'))
                .then(() => console.log(
                    _.isEmpty(currentStagingDeploys)
                        ? 'No current staging deploys found'
                        : `Found ${currentStagingDeploys.length} staging deploy${currentStagingDeploys.length > 1 ? 's' : ''} still running...`,
                )),

            // Poll every 90 seconds instead of every 10 seconds
            GitHubUtils.POLL_RATE * 9,
        ),
    );
}

if (require.main === module) {
    run();
}

module.exports = run;

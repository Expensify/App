const _ = require('underscore');
const GitHubUtils = require('../../libs/GithubUtils');
const {promiseDoWhile} = require('../../libs/promiseWhile');

let currentStagingDeploys = [];
promiseDoWhile(
    () => !_.isEmpty(currentStagingDeploys),
    _.throttle(
        () => GitHubUtils.octokit.actions.listWorkflowRuns({
            owner: GitHubUtils.GITHUB_OWNER,
            repo: GitHubUtils.APP_REPO,
            workflow_id: 'platformDeploy.yml',
            event: 'push',
        })
            .then(response => currentStagingDeploys = _.filter(response.data.workflow_runs, workflowRun => workflowRun.status !== 'completed')),
        GitHubUtils.POLL_RATE,
    ),
);

const _ = require('underscore');
const core = require('@actions/core');
const github = require('@actions/github');
const ActionUtils = require('../../../libs/ActionUtils');
const GitUtils = require('../../../libs/GitUtils');
const GithubUtils = require('../../../libs/GithubUtils');

async function run() {
    try {
        const inputTag = core.getInput('TAG', {required: true});
        const isProductionDeploy = ActionUtils.getJSONInput('IS_PRODUCTION_DEPLOY', {required: false}, false);
        const deployEnv = isProductionDeploy ? 'production' : 'staging';

        console.log(`Looking for PRs deployed to ${deployEnv} in ${inputTag}...`);

        const completedDeploys = (
            await GithubUtils.octokit.actions.listWorkflowRuns({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                workflow_id: 'platformDeploy.yml',
                status: 'completed',
                event: isProductionDeploy ? 'release' : 'push',
            })
        ).data.workflow_runs;

        const priorTag = _.first(completedDeploys).head_branch;
        console.log(`Looking for PRs deployed to ${deployEnv} between ${priorTag} and ${inputTag}`);
        const prList = await GitUtils.getPullRequestsMergedBetween(priorTag, inputTag);
        console.log(`Found the pull request list: ${prList}`);
        core.setOutput('PR_LIST', prList);
    } catch (err) {
        console.error(err.message);
        core.setFailed(err);
    }
}

if (require.main === module) {
    run();
}

module.exports = run;

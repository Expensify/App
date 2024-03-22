import core from '@actions/core';
import github from '@actions/github';
import ActionUtils from '../../../libs/ActionUtils';
import GithubUtils from '../../../libs/GithubUtils';
import GitUtils from '../../../libs/GitUtils';

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

        const priorTag = completedDeploys[0].head_branch;
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

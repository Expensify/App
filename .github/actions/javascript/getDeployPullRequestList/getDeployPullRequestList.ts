import * as core from '@actions/core';
import * as github from '@actions/github';
import {getJSONInput} from '@github/libs/ActionUtils';
import GithubUtils from '@github/libs/GithubUtils';
import GitUtils from '@github/libs/GitUtils';

async function run() {
    try {
        const inputTag = core.getInput('TAG', {required: true});
        const isProductionDeploy = getJSONInput('IS_PRODUCTION_DEPLOY', {required: false}, false);
        const deployEnv = isProductionDeploy ? 'production' : 'staging';

        console.log(`Looking for PRs deployed to ${deployEnv} in ${inputTag}...`);

        const completedDeploys = (
            await GithubUtils.octokit.actions.listWorkflowRuns({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                workflow_id: 'platformDeploy.yml',
                status: 'completed',
                event: isProductionDeploy ? 'release' : 'push',
            })
        ).data.workflow_runs;

        const priorTag = completedDeploys[0].head_branch;
        console.log(`Looking for PRs deployed to ${deployEnv} between ${priorTag} and ${inputTag}`);
        const prList = await GitUtils.getPullRequestsMergedBetween(priorTag ?? '', inputTag);
        console.log('Found the pull request list: ', prList);
        core.setOutput('PR_LIST', prList);
    } catch (error) {
        console.error((error as Error).message);
        core.setFailed(error as Error);
    }
}

if (require.main === module) {
    run();
}

export default run;

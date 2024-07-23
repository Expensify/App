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
        ).data.workflow_runs
            // Note: we filter out cancelled runs instead of looking only for success runs
            // because if a build fails on even one platform, then it will have the status 'failure'
            .filter((workflowRun) => workflowRun.conclusion !== 'cancelled');

        // Find the most recent deploy workflow for which at least one of the build jobs finished successfully.
        let lastSuccessfulDeploy = completedDeploys.shift();
        while (
            lastSuccessfulDeploy &&
            !(
                await GithubUtils.octokit.actions.listJobsForWorkflowRun({
                    owner: github.context.repo.owner,
                    repo: github.context.repo.repo,
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    run_id: lastSuccessfulDeploy.id,
                    filter: 'latest',
                })
            ).data.jobs.some((job) => job.name.startsWith('Build and deploy') && job.conclusion === 'success')
        ) {
            lastSuccessfulDeploy = completedDeploys.shift();
        }

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

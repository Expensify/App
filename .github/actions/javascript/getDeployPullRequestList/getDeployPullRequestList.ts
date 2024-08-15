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
            })
        ).data.workflow_runs
            // Note: we filter out cancelled runs instead of looking only for success runs
            // because if a build fails on even one platform, then it will have the status 'failure'
            .filter((workflowRun) => workflowRun.conclusion !== 'cancelled');

        // 9.0.20-6 -> data.prerelease is false and isProductionDeploy is true
        // 9.0.20-5 -> data.prerelease is false and isProductionDeploy is false

        // Find the most recent deploy workflow targeting the correct environment, for which at least one of the build jobs finished successfully
        let lastSuccessfulDeploy = completedDeploys.shift();
        let invalidReleaseBranch = false;
        let sameAsInputTag = false;
        let wrongEnvironment = false;
        let unsuccessfulDeploy = false;
        while (
            (invalidReleaseBranch = !!lastSuccessfulDeploy?.head_branch) &&
            ((sameAsInputTag = lastSuccessfulDeploy?.head_branch === inputTag) ||
                (wrongEnvironment =
                    (
                        await GithubUtils.octokit.repos.getReleaseByTag({
                            owner: github.context.repo.owner,
                            repo: github.context.repo.repo,
                            tag: lastSuccessfulDeploy.head_branch,
                        })
                    ).data.prerelease === isProductionDeploy) ||
                (unsuccessfulDeploy = !(
                    await GithubUtils.octokit.actions.listJobsForWorkflowRun({
                        owner: github.context.repo.owner,
                        repo: github.context.repo.repo,
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        run_id: lastSuccessfulDeploy.id,
                        filter: 'latest',
                    })
                ).data.jobs.some((job) => job.name.startsWith('Build and deploy') && job.conclusion === 'success')))
        ) {
            let reason;
            if (invalidReleaseBranch) {
                reason = 'Invalid release branch';
            } else if (sameAsInputTag) {
                reason = `Same as input tag ${inputTag}`;
            } else if (wrongEnvironment) {
                reason = `Was a ${isProductionDeploy ? 'staging' : 'production'} deploy, we only want to compare with ${isProductionDeploy ? 'production' : 'staging'} deploys`;
            } else if (unsuccessfulDeploy) {
                reason = 'Was an unsuccessful deploy';
            } else {
                reason = 'WTF?!';
            }
            console.log(
                `Deploy of tag ${lastSuccessfulDeploy?.head_branch} was not valid as a base for comparison, looking at the next one. Reason: ${reason}`,
                lastSuccessfulDeploy.html_url,
            );
            lastSuccessfulDeploy = completedDeploys.shift();
        }

        if (!lastSuccessfulDeploy) {
            throw new Error('Could not find a prior successful deploy');
        }

        const priorTag = lastSuccessfulDeploy.head_branch;
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

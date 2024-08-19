import * as core from '@actions/core';
import * as github from '@actions/github';
import type {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods/dist-types/generated/parameters-and-response-types';
import {getJSONInput} from '@github/libs/ActionUtils';
import GithubUtils from '@github/libs/GithubUtils';
import GitUtils from '@github/libs/GitUtils';

type WorkflowRun = RestEndpointMethodTypes['actions']['listWorkflowRuns']['response']['data']['workflow_runs'][number];

const BUILD_AND_DEPLOY_JOB_NAME_PREFIX = 'Build and deploy';

/**
 * This function checks if a given release is a valid baseTag to get the PR list with `git log baseTag...endTag`.
 *
 * The rules are:
 *     - production deploys can only be compared with other production deploys
 *     - staging deploys can be compared with other staging deploys or production deploys.
 *       The reason is that the final staging release in each deploy cycle will BECOME a production release.
 *       For example, imagine a checklist is closed with version 9.0.20-6; that's the most recent staging deploy, but the release for 9.0.20-6 is now finalized, so it looks like a prod deploy.
 *       When 9.0.21-0 finishes deploying to staging, the most recent prerelease is 9.0.20-5. However, we want 9.0.20-6...9.0.21-0,
 *       NOT 9.0.20-5...9.0.21-0 (so that the PR CP'd in 9.0.20-6 is not included in the next checklist)
 */
async function isReleaseValidBaseForEnvironment(releaseTag: string, isProductionDeploy: boolean) {
    if (!isProductionDeploy) {
        return true;
    }
    const isPrerelease = (
        await GithubUtils.octokit.repos.getReleaseByTag({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            tag: releaseTag,
        })
    ).data.prerelease;
    return !isPrerelease;
}

/**
 * Was a given platformDeploy workflow run successful on at least one platform?
 */
async function wasDeploySuccessful(runID: number) {
    const jobsForWorkflowRun = (
        await GithubUtils.octokit.actions.listJobsForWorkflowRun({
            owner: github.context.repo.owner,
            repo: github.context.repo.repo,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            run_id: runID,
            filter: 'latest',
        })
    ).data.jobs;
    return jobsForWorkflowRun.some((job) => job.name.startsWith(BUILD_AND_DEPLOY_JOB_NAME_PREFIX) && job.conclusion === 'success');
}

/**
 * This function checks if a given deploy workflow is a valid basis for comparison when listing PRs merged between two versions.
 * It returns the reason a version should be skipped, or an empty string if the version should not be skipped.
 */
async function shouldSkipVersion(lastSuccessfulDeploy: WorkflowRun, inputTag: string, isProductionDeploy: boolean): Promise<string> {
    if (!lastSuccessfulDeploy?.head_branch) {
        // This should never happen. Just doing this to appease TS.
        return '';
    }

    // we never want to compare a tag with itself. This check is necessary because prod deploys almost always have the same version as the last staging deploy.
    // In this case, the next for wrong environment fails because the release that triggered that staging deploy is now finalized, so it looks like a prod deploy.
    if (lastSuccessfulDeploy?.head_branch === inputTag) {
        return `Same as input tag ${inputTag}`;
    }
    if (!(await isReleaseValidBaseForEnvironment(lastSuccessfulDeploy?.head_branch, isProductionDeploy))) {
        return 'Was a staging deploy, we only want to compare with other production deploys';
    }
    if (!(await wasDeploySuccessful(lastSuccessfulDeploy.id))) {
        return 'Was an unsuccessful deploy, nothing was deployed in that version';
    }
    return '';
}

async function run() {
    try {
        const inputTag = core.getInput('TAG', {required: true});
        const isProductionDeploy = !!getJSONInput('IS_PRODUCTION_DEPLOY', {required: false}, false);
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

        // Find the most recent deploy workflow targeting the correct environment, for which at least one of the build jobs finished successfully
        let lastSuccessfulDeploy = completedDeploys.shift();

        if (!lastSuccessfulDeploy) {
            throw new Error('Could not find a prior successful deploy');
        }

        let reason = await shouldSkipVersion(lastSuccessfulDeploy, inputTag, isProductionDeploy);
        while (lastSuccessfulDeploy && reason) {
            console.log(
                `Deploy of tag ${lastSuccessfulDeploy.head_branch} was not valid as a base for comparison, looking at the next one. Reason: ${reason}`,
                lastSuccessfulDeploy.html_url,
            );
            lastSuccessfulDeploy = completedDeploys.shift();

            if (!lastSuccessfulDeploy) {
                throw new Error('Could not find a prior successful deploy');
            }

            reason = await shouldSkipVersion(lastSuccessfulDeploy, inputTag, isProductionDeploy);
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

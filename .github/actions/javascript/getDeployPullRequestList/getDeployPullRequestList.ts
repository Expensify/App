import * as core from '@actions/core';
import * as github from '@actions/github';
import {getJSONInput} from '@github/libs/ActionUtils';
import GithubUtils from '@github/libs/GithubUtils';
import GitUtils from '@github/libs/GitUtils';

/**
 * This function checks if a given release is a valid base to get the PR list with `git log startTag...endTag`.
 * The rules are:
 *     - production deploys can only be compared with other production deploys
 *     - staging deploys can be compared with other staging deploys or production deploys.
 *       The reason this is necessary is that the final staging release in each deploy cycle will BECOME a production release.
 *       For example, imagine a checklist is closed with version 9.0.20-6. That's the most recent staging deploy, but the release for 9.0.20-6 is now finalized.
 *       So the most recent prerelease will be 9.0.20-5.
 *       When 9.0.21-0 finishes deploying, we want to list PRs between 9.0.20-6...9.0.21-0, NOT 9.0.20-5...9.0.21-0 (so that the PR CP'd in 9.0.20-6 is not included in the next checklist)
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
        let invalidReleaseBranch = false;
        let sameAsInputTag = false;
        let wrongEnvironment = false;
        let unsuccessfulDeploy = false;

        // note: this while statement looks a bit weird because uses assignment as a condition: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while#using_an_assignment_as_a_condition
        // while ugly, it's beneficial in this case because it prevents extra network requests from happening unnecessarily (i.e: we only check wrongEnvironment if sameAsInputTag is false, etc...)
        while (
            (invalidReleaseBranch = !!lastSuccessfulDeploy?.head_branch) &&
            // we never want to compare a tag with itself. This check is necessary because prod deploys almost always have the same version as the last staging deploy.
            // In this case, the check for wrongEnvironment fails because the release that triggered that staging deploy is now finalized, so it looks like a prod deploy.
            ((sameAsInputTag = lastSuccessfulDeploy?.head_branch === inputTag) ||
                (wrongEnvironment = await isReleaseValidBaseForEnvironment(lastSuccessfulDeploy?.head_branch, isProductionDeploy)) ||
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

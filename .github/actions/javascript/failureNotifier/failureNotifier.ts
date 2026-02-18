/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';
import * as github from '@actions/github';
import type {RestEndpointMethodTypes} from '@octokit/plugin-rest-endpoint-methods';
import dedent from '@libs/StringUtils/dedent';

type WorkflowRun = RestEndpointMethodTypes['actions']['listWorkflowRuns']['response']['data']['workflow_runs'][number];

type PullRequest = RestEndpointMethodTypes['repos']['listPullRequestsAssociatedWithCommit']['response']['data'][number];

/**
 * Given the list of PRs associated with a commit on the target branch,
 * find the PR that was actually merged into that branch.
 *
 * The GitHub API `listPullRequestsAssociatedWithCommit` returns ALL PRs
 * that contain the commit — including open PRs that have merged the target
 * branch into their feature branch. We must filter to only merged PRs
 * targeting the correct base branch to avoid blaming the wrong PR.
 */
function getMergedPR(associatedPRs: PullRequest[], targetBranch = 'main'): PullRequest | undefined {
    return associatedPRs.find((pr) => pr.merged_at !== null && pr.base.ref === targetBranch) ?? associatedPRs.at(0);
}

async function run() {
    const token = core.getInput('GITHUB_TOKEN', {required: true});
    const octokit = github.getOctokit(token);

    const {owner, repo} = github.context.repo;
    const workflowRun = github.context.payload.workflow_run as WorkflowRun;

    const jobsData = await octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: workflowRun.id,
    });
    const jobs = jobsData.data;

    const allRuns = await octokit.rest.actions.listWorkflowRuns({
        owner,
        repo,
        workflow_id: workflowRun.workflow_id,
    });
    const filteredRuns = allRuns.data.workflow_runs.filter((r) => r.actor?.login !== 'OSBotify' && r.status !== 'cancelled');
    const currentIndex = filteredRuns.findIndex((r) => r.id === workflowRun.id);
    const previousRun = filteredRuns.at(currentIndex + 1);

    if (!previousRun) {
        console.log('No previous workflow run found for comparison, skipping.');
        return;
    }

    const previousRunJobsData = await octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: previousRun.id,
    });
    const previousRunJobs = previousRunJobsData.data;

    const headCommit = workflowRun.head_commit?.id;
    if (!headCommit) {
        console.log('No head commit found, skipping PR lookup.');
        return;
    }

    const prData = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
        owner,
        repo,
        commit_sha: headCommit,
    });

    const targetBranch = workflowRun.head_branch ?? 'main';
    const pr = getMergedPR(prData.data, targetBranch);
    const prLink = pr?.html_url ?? 'N/A';
    const prAuthor = pr?.user?.login ?? 'unknown';
    const prMerger = workflowRun.actor?.login ?? 'unknown';

    const failureLabel = 'Workflow Failure';

    for (const job of jobs.jobs) {
        if (job.conclusion !== 'failure') {
            continue;
        }

        if (job.name === 'confirmPassingBuild') {
            continue;
        }

        const previousJob = previousRunJobs.jobs.find((j) => j.name === job.name);
        if (previousJob?.conclusion !== 'success') {
            continue;
        }

        const checkResults = await octokit.rest.checks.listAnnotations({
            owner,
            repo,
            check_run_id: job.id,
        });

        let errorMessage = '';
        for (const checkResult of checkResults.data) {
            errorMessage += `${checkResult.annotation_level}: ${checkResult.message}\n`;
        }

        const issueTitle = `Investigate workflow job failing on main: ${job.name}`;
        const issueBody = dedent(`
            🚨 **Failure Summary** 🚨:

            - **📋 Job Name**: [${job.name}](${job.html_url})
            - **🔧 Failure in Workflow**: Process new code merged to main
            - **🔗 Triggered by PR**: [PR Link](${prLink})
            - **👤 PR Author**: @${prAuthor}
            - **🤝 Merged by**: @${prMerger}
            - **🐛 Error Message**: \n ${errorMessage}

            ⚠️ **Action Required** ⚠️:

            🛠️ A recent merge appears to have caused a failure in the job named [${job.name}](${job.html_url}).
            🔍 This issue has been automatically created and labeled with \`${failureLabel}\` for investigation.

            **👀 Please look into the following:**
            1. **Why the PR caused the job to fail?**
            2. **Address any underlying issues.**

            **🐛 We appreciate your help in squashing this bug!**
        `);

        await octokit.rest.issues.create({
            owner,
            repo,
            title: issueTitle,
            body: issueBody,
            labels: [failureLabel, 'Hourly'],
            assignees: [prMerger],
        });

        console.log(`Created issue for failed job: ${job.name}`);
    }
}

if (require.main === module) {
    run().catch((error: Error) => {
        console.error('Failed to process workflow failure:', error);
        core.setFailed(error.message);
    });
}

export default run;
export {getMergedPR};
export type {PullRequest};

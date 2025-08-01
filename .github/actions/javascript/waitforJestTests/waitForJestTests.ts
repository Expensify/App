/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';
import {context} from '@actions/github';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

async function waitForJestTests(): Promise<void> {
    const maxWaitTime = 30 * 60 * 1000; // 30 minutes
    const pollInterval = 10 * 1000; // 10 seconds
    const startTime = Date.now();

    // Get PR number and SHA (backwards compatible with manual dispatch)
    let prNumber: number;
    let headSha: string;

    if (context.payload.pull_request?.number) {
        prNumber = context.payload.pull_request.number;
        headSha = context.sha;
        console.log(`Using PR context - PR #${prNumber}, SHA: ${headSha}`);
    } else {
        prNumber = Number((context.payload.inputs as Record<string, {pr_number: number}>)?.pr_number ?? '0');

        if (!prNumber) {
            core.setFailed('PR number is required when pull_request context is not available.');
            return;
        }

        // Get PR details to find the head SHA
        console.log(`Using workflow inputs - Getting details for PR #${prNumber}`);
        const prResponse = await GithubUtils.octokit.pulls.get({
            owner: context.repo.owner,
            repo: context.repo.repo,
            pull_number: prNumber,
        });

        headSha = prResponse.data.head.sha;
        console.log(`PR #${prNumber} head SHA: ${headSha}`);
    }

    console.log(`Looking for test workflow runs for PR #${context.payload.pull_request?.number}`);
    console.log(`Head SHA: ${context.sha}`);

    while (Date.now() - startTime < maxWaitTime) {
        // Get all recent workflow runs for this repo
        const workflows = await GithubUtils.listWorkflowRunsForRepo({
            per_page: 50, // Increased to handle many concurrent workflows
            status: CONST.RUN_STATUS.COMPLETED, // Only look at completed runs
        });

        console.log(`Found ${workflows.data.workflow_runs.length} recent workflow runs.`);

        // Look for test workflow runs that match our criteria
        const testRuns = workflows.data.workflow_runs.filter((run) => {
            // Check if it's the Jest Unit Tests workflow specifically
            const isTestWorkflow = run.name === CONST.TEST_WORKFLOW_NAME || run.path === CONST.TEST_WORKFLOW_PATH;
            // Check if it's for our PR's head SHA
            const matchesSHA = run.head_sha === context.sha;
            // For manual dispatch or when no PR context, be more flexible with event types
            // For regular PR events, maintain existing strict logic
            const isValidEvent = context.payload.pull_request
                ? run.event === CONST.RUN_EVENT.PULL_REQUEST || run.event === CONST.RUN_EVENT.PULL_REQUEST_TARGET
                : run.event === CONST.RUN_EVENT.PULL_REQUEST || run.event === CONST.RUN_EVENT.PULL_REQUEST_TARGET || run.event === CONST.RUN_EVENT.PUSH;

            return isTestWorkflow && matchesSHA && isValidEvent;
        });

        console.log(`Found ${testRuns.length} matching test runs.`);

        if (testRuns.length > 0) {
            const testRun = testRuns.at(0);
            console.log(`Test workflow status: ${testRun?.status}, conclusion: ${testRun?.conclusion}`);
            console.log(`Test workflow name: ${testRun?.name}, path: ${testRun?.path}`);

            if (testRun?.status === CONST.RUN_STATUS.COMPLETED) {
                if (testRun?.conclusion === CONST.RUN_STATUS_CONCLUSION.SUCCESS) {
                    console.log('Test workflow completed successfully!');
                    return;
                }
                core.setFailed(`Test workflow failed with conclusion: ${testRun?.conclusion}`);
                return;
            }
        } else {
            // If no completed runs found, check for in-progress runs
            const inProgressWorkflows = await GithubUtils.listWorkflowRunsForRepo({
                per_page: 50, // Same increased scope for in-progress runs
            });

            const inProgressTestRuns = inProgressWorkflows.data.workflow_runs.filter((run) => {
                const isTestWorkflow = run.name === CONST.TEST_WORKFLOW_NAME || run.path === CONST.TEST_WORKFLOW_PATH;
                const matchesSHA = run.head_sha === context.sha;
                const isValidEvent = context.payload.pull_request
                    ? run.event === CONST.RUN_EVENT.PULL_REQUEST || run.event === CONST.RUN_EVENT.PULL_REQUEST_TARGET
                    : run.event === CONST.RUN_EVENT.PULL_REQUEST || run.event === CONST.RUN_EVENT.PULL_REQUEST_TARGET || run.event === CONST.RUN_EVENT.PUSH;
                const inProgress = run.status === CONST.RUN_STATUS.IN_PROGRESS || run.status === CONST.RUN_STATUS.QUEUED;

                return isTestWorkflow && matchesSHA && isValidEvent && inProgress;
            });

            if (inProgressTestRuns.length > 0) {
                console.log(`Found ${inProgressTestRuns.length} in-progress test runs, awaiting completion...`);
            } else {
                console.log('No matching test workflow runs found, checking if tests are required...');
                // Check if there might be no test workflow triggered
                // This could happen if the PR doesn't have testable changes
                const allRecentRuns = workflows.data.workflow_runs.filter((run) => run.head_sha === context.sha);
                console.log(`Found ${allRecentRuns.length} workflow runs for this SHA.`);

                // Assume tests passed if no workflow runs exist
                if (allRecentRuns.length === 0) {
                    console.log('No workflow runs found for this SHA, tests might not be required.');
                    return;
                }
            }
        }

        await new Promise((resolve) => {
            setTimeout(resolve, pollInterval);
        });
    }

    core.setFailed('Test workflow did not complete within timeout.');
}

// Run the action
waitForJestTests().catch((error) => {
    console.error('Error waiting for Jest tests:', error);
    if (error instanceof Error) {
        core.setFailed(error.message);
    }
});

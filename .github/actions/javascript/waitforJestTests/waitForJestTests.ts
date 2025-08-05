/* eslint-disable @typescript-eslint/naming-convention */
import * as core from '@actions/core';
import {context} from '@actions/github';
import GithubUtils from '@github/libs/GithubUtils';

async function waitForJestTests(): Promise<void> {
    const maxWaitTime = 30 * 60 * 1000; // 30 minutes
    const pollInterval = 10 * 1000; // 10 seconds
    const startTime = Date.now();

    console.log(`Looking for test workflow runs for PR #${context.payload.pull_request?.number}`);
    console.log(`Head SHA: ${context.sha}`);

    while (Date.now() - startTime < maxWaitTime) {
        // Get all recent workflow runs for this repo
        const workflows = await GithubUtils.listWorkflowRunsForRepo({
            per_page: 50, // Increased to handle many concurrent workflows
            status: 'completed', // Only look at completed runs
        });

        console.log(`Found ${workflows.data.workflow_runs.length} recent workflow runs`);

        // Look for test workflow runs that match our criteria
        const testRuns = workflows.data.workflow_runs.filter((run) => {
            // Check if it's the Jest Unit Tests workflow specifically
            const isTestWorkflow = run.name === 'Jest Unit Tests' || run.path === '.github/workflows/test.yml';
            // Check if it's for our PR
            const matchesPR = run.head_sha === context.sha;
            // Check if it's a pull request event
            const isPREvent = run.event === 'pull_request' || run.event === 'pull_request_target';

            return isTestWorkflow && matchesPR && isPREvent;
        });

        console.log(`Found ${testRuns.length} matching test runs`);

        if (testRuns.length > 0) {
            // Get the most recent matching run
            const testRun = testRuns.at(0);
            console.log(`Test workflow status: ${testRun?.status}, conclusion: ${testRun?.conclusion}`);
            console.log(`Test workflow name: ${testRun?.name}, path: ${testRun?.path}`);

            if (testRun?.status === 'completed') {
                if (testRun?.conclusion === 'success') {
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
                const isTestWorkflow = run.name === 'Jest Unit Tests' || run.path === '.github/workflows/test.yml';
                const matchesPR = run.head_sha === context.sha;
                const isPREvent = run.event === 'pull_request' || run.event === 'pull_request_target';

                return isTestWorkflow && matchesPR && isPREvent && (run.status === 'in_progress' || run.status === 'queued');
            });

            if (inProgressTestRuns.length > 0) {
                console.log(`Found ${inProgressTestRuns.length} in-progress test runs, continuing to wait...`);
            } else {
                console.log('No matching test workflow runs found, checking if tests are required...');
                // Check if there might be no test workflow triggered
                // This could happen if the PR doesn't have testable changes
                const allRecentRuns = workflows.data.workflow_runs.filter((run) => run.head_sha === context.sha);
                console.log(`Found ${allRecentRuns.length} workflow runs for this SHA`);

                if (allRecentRuns.length === 0) {
                    console.log('No workflow runs found for this SHA, tests might not be required');
                    return; // Assume tests passed if no workflow runs exist
                }
            }
        }

        await new Promise((resolve) => {
            setTimeout(resolve, pollInterval);
        });
    }

    core.setFailed('Test workflow did not complete within timeout');
}

// Run the action
waitForJestTests().catch((error) => {
    console.error('Error waiting for Jest tests:', error);
    if (error instanceof Error) {
        core.setFailed(error.message);
    }
});

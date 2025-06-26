import * as core from '@actions/core';
import * as github from '@actions/github';
import GithubUtils from '@github/libs/GithubUtils';
import CONST from '@github/libs/CONST';

async function run() {
    try {
        const token = core.getInput('GITHUB_TOKEN', {required: true});
        const octokit = github.getOctokit(token);
        const pr = github.context.payload.pull_request;
        if (!pr) {
            core.setFailed('No pull request found in context.');
            return;
        }
        const prNumber = pr.number;
        const owner = github.context.repo.owner;
        const repo = github.context.repo.repo;

        // Find the jest-coverage artifact from the workflow run
        const {data: artifacts} = await octokit.rest.actions.listWorkflowRunArtifacts({
            owner,
            repo,
            run_id: github.context.runId,
        });
        const coverageArtifact = artifacts.artifacts.find((a: any) => a.name === 'jest-coverage');
        let coverageLink = '';
        if (coverageArtifact) {
            coverageLink = `https://github.com/${owner}/${repo}/suites/${github.context.runId}/artifacts/${coverageArtifact.id}`;
        }

        // Download and parse the coverage summary (if possible)
        // For now, just show a placeholder summary
        let summary = 'Coverage summary not available.';
        // TODO: Optionally, download and parse coverage-summary.json for real stats

        // Prepare the Test Coverage section
        let coverageSection = `\n### Test Coverage\n`;
        coverageSection += `- [Jest Coverage Report](${coverageLink})\n`;
        coverageSection += `- ${summary}\n`;

        // Append to the PR body
        let newBody = pr.body || '';
        newBody += coverageSection;

        await octokit.rest.pulls.update({
            owner,
            repo,
            pull_number: prNumber,
            body: newBody,
        });
        console.log('PR description updated with Test Coverage section.');
    } catch (error) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}

if (require.main === module) {
    run();
}

export default run; 
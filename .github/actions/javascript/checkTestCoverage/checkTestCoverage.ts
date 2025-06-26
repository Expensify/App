import * as core from '@actions/core';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';

async function run(): Promise<void> {
    try {
        // Get the GitHub URL input
        const githubUrl = core.getInput('GITHUB_URL');
        core.info(`GitHub URL: ${githubUrl}`);

        // Extract issue/PR number from GitHub URL
        // Expected format: https://github.com/owner/repo/pull/123 or https://github.com/owner/repo/issues/123
        const urlMatch = githubUrl.match(/\/(?:pull|issues)\/(\d+)/);
        const issueNumber = urlMatch ? parseInt(urlMatch[1], 10) : null;
        
        if (!issueNumber) {
            throw new Error(`Could not extract issue/PR number from URL: ${githubUrl}`);
        }
        
        core.info(`Extracted issue number: ${issueNumber}`);

        await GithubUtils.createComment(CONST.APP_REPO, issueNumber, 'NOT ENOUGH TESTS');
        
    } catch (error) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}

run();

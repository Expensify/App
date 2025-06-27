import * as core from '@actions/core';
import {getInput} from '@actions/core';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import OpenAIUtils from '../../../../scripts/utils/OpenAIUtils';

// Duplicated from proposalPoliceComment.ts for now!
// type AssistantResponse = {
//     action: typeof CONST.NO_ACTION | typeof CONST.ACTION_REQUIRED;
//     message: string;
// };

async function run(): Promise<void> {
    try {
        // Get the GitHub URL input
        const githubUrl = core.getInput('GITHUB_URL');
        core.info(`GitHub URL: ${githubUrl}`);

        // Extract issue/PR number from GitHub URL
        // Expected format: https://github.com/owner/repo/pull/123 or https://github.com/owner/repo/issues/123
        const urlMatch = githubUrl.match(/\/(?:pull|issues)\/(\d+)/);
        const issueNumber = urlMatch ? parseInt(urlMatch[1], 10) : null;
        core.info(`Extracted issue number: ${issueNumber}`);
        
        if (!issueNumber) {
            throw new Error(`Could not extract issue/PR number from URL: ${githubUrl}`);
        }

        // Make chatGPT request
        await promptAssistant(issueNumber);

    } catch (error) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}

async function promptAssistant(issueNumber: number): Promise<void> {
    const apiKey = getInput('TESTRAIL_TRYHARD_OPENAI_API_KEY', {required: true});
    const assistantID = 'asst_7ZKVOjvodqEzb1wkzWlLYpVf';
    const openAI = new OpenAIUtils(apiKey);

    // Fetch the comprehensive PR data
    const prData = await getPullRequestData(issueNumber);
    const prDataString = JSON.stringify(prData, null, 2);
    core.info(`Processing PR: ${prData.title}`);
    core.info(`Diff size: ${prData.diff.length} characters`);

    try {
        const assistantResponse = await openAI.promptAssistant(assistantID, prDataString);
        
        if (!assistantResponse || assistantResponse.trim().length === 0) {
            throw new Error('Received empty response from OpenAI assistant');
        }
        
        core.info('Successfully received test coverage recommendations');
        
        // TODO: Later on we will comment response on the PR
        await commentOnGithubPR(issueNumber, assistantResponse);
        core.info(`Posted comment on PR #${issueNumber}`);
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        core.error(`Failed to get test coverage recommendations: ${errorMessage}`);
        throw error;
    }
}

async function getPullRequestData(pullRequestNumber: number): Promise<{
    title: string;
    description: string | null;
    diff: string;
}> {
    try {
        // Fetch the PR details (title and description)
        const prResponse = await GithubUtils.octokit.pulls.get({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            pull_number: pullRequestNumber,
        });

        // Fetch the list of files changed in the PR with their diffs
        const filesResponse = await GithubUtils.octokit.pulls.listFiles({
            owner: CONST.GITHUB_OWNER,
            repo: CONST.APP_REPO,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            pull_number: pullRequestNumber,
        });

        // Combine all file patches into a single diff string
        let combinedDiff = '';
        
        for (const file of filesResponse.data) {
            if (file.patch) {
                combinedDiff += `--- a/${file.filename}\n`;
                combinedDiff += `+++ b/${file.filename}\n`;
                combinedDiff += file.patch;
                combinedDiff += '\n\n';
            }
        }

        return {
            title: prResponse.data.title,
            description: prResponse.data.body,
            diff: combinedDiff,
        };
    } catch (error) {
        core.warning(`Failed to fetch PR data: ${error instanceof Error ? error.message : String(error)}`);
        return {
            title: '',
            description: null,
            diff: '',
        };
    }
}

async function commentOnGithubPR(issueNumber: number, comment: string): Promise<void> {
    await GithubUtils.createComment(CONST.APP_REPO, issueNumber, comment);
}

run();

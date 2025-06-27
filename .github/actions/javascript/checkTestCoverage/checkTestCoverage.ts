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

    // Fetch the PR diff data
    const ghDiff = await getPullRequestDiff(issueNumber);
    core.info(`Prompt: ${ghDiff}`);

    const assistantResponse = await openAI.promptAssistant(assistantID, ghDiff);
    console.log(' ...parsing ');
    console.log('assistantResponse: ', assistantResponse);

    // TODO: Later on we will comment response on the PR
    await commentOnGithubPR(issueNumber, assistantResponse);
}

async function getPullRequestDiff(pullRequestNumber: number): Promise<string> {
    try {
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

        return combinedDiff;
    } catch (error) {
        core.warning(`Failed to fetch PR diff: ${error instanceof Error ? error.message : String(error)}`);
        return '';
    }
}

async function commentOnGithubPR(issueNumber: number, comment: string): Promise<void> {
    await GithubUtils.createComment(CONST.APP_REPO, issueNumber, comment);
}

run();

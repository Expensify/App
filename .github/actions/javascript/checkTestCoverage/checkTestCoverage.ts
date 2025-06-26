import * as core from '@actions/core';
import {getInput} from '@actions/core';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import OpenAIUtils from '../../../../scripts/utils/OpenAIUtils';
import sanitizeJSONStringValues from '@github/libs/sanitizeJSONStringValues';

// Duplicated from proposalPoliceComment.ts for now!
type AssistantResponse = {
    action: typeof CONST.NO_ACTION | typeof CONST.ACTION_REQUIRED;
    message: string;
};

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
        promptAssistant(issueNumber);

        // Then comment on the PR
        await commentOnGithubPR(issueNumber);

    } catch (error) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}

async function promptAssistant(issueNumber: number): Promise<void> {
    const apiKey = getInput('PROPOSAL_POLICE_API_KEY', {required: true});
    const assistantID = ''; // TODO @BEN
    const openAI = new OpenAIUtils(apiKey);

    const prompt = `I NEED HELP WITH SOMETHING`; // TODO @BEN
    core.info(`Prompt: ${prompt}`);

    const assistantResponse = await openAI.promptAssistant(assistantID, prompt);
    const parsedAssistantResponse = JSON.parse(sanitizeJSONStringValues(assistantResponse)) as AssistantResponse;
    console.log('parsedAssistantResponse: ', parsedAssistantResponse);
}

async function commentOnGithubPR(issueNumber: number): Promise<void> {
    await GithubUtils.createComment(CONST.APP_REPO, issueNumber, 'NOT ENOUGH TESTS');
}

run();

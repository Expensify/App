import * as core from '@actions/core';
import * as fs from 'fs';
import path from 'path';
import GithubUtils from '@github/libs/GithubUtils';
import OpenAIUtils from '../../../../scripts/utils/OpenAIUtils';

type PRData = {
    title: string;
    body: string;
    diff: string;
    number: number;
    repo: {
        owner: string;
        name: string;
    };
};

async function run(): Promise<void> {
    try {
        // Get inputs
        const prUrl = core.getInput('PR_URL', {required: true});
        const openaiApiKey = core.getInput('TESTRAIL_TRYHARD_OPENAI_API_KEY', {required: true});
        
        core.info(`Analyzing PR: ${prUrl}`);

        // Parse PR URL to extract owner, repo, and PR number
        const prData = parsePRUrl(prUrl);
        
        // Fetch PR information from GitHub API
        const prInfo = await fetchPRInformation(prData);
        
        // Get the prompt template
        const promptTemplate = getPromptTemplate();
        
        // Create the full prompt by substituting PR information
        const fullPrompt = createPromptWithPRData(promptTemplate, prInfo);
        
        // Query OpenAI assistant
        const assistantResponse = await queryOpenAIAssistant(fullPrompt, openaiApiKey);
        
        // Comment on the PR with the response
        await commentOnPR(prInfo, assistantResponse);
        
        core.info('Successfully analyzed PR and posted comment');
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        core.error(`Error: ${errorMessage}`);
        core.setFailed(errorMessage);
    }
}

function parsePRUrl(prUrl: string): {owner: string; repo: string; number: number} {
    // Expected format: https://github.com/owner/repo/pull/123
    const urlMatch = prUrl.match(/github\.com\/([^/]+)\/([^/]+)\/pull\/(\d+)/);
    
    if (!urlMatch) {
        throw new Error(`Invalid PR URL format. Expected: https://github.com/owner/repo/pull/123, got: ${prUrl}`);
    }
    
    const [, owner, repo, prNumberStr] = urlMatch;
    const number = parseInt(prNumberStr, 10);
    
    if (Number.isNaN(number)) {
        throw new Error(`Invalid PR number: ${prNumberStr}`);
    }
    
    return { owner, repo, number };
}

async function fetchPRInformation(prData: {owner: string; repo: string; number: number}): Promise<PRData> {
    try {
        // Fetch PR details
        /* eslint-disable @typescript-eslint/naming-convention */
        const prResponse = await GithubUtils.octokit.pulls.get({
            owner: prData.owner,
            repo: prData.repo,
            pull_number: prData.number,
        });
        
        // Fetch PR diff
        const diffResponse = await GithubUtils.octokit.pulls.get({
            owner: prData.owner,
            repo: prData.repo,
            pull_number: prData.number,
            mediaType: {
                format: 'diff',
            },
        });
        /* eslint-enable @typescript-eslint/naming-convention */
        
        return {
            title: prResponse.data.title,
            body: prResponse.data.body ?? '',
            diff: String(diffResponse.data),
            number: prData.number,
            repo: {
                owner: prData.owner,
                name: prData.repo,
            },
        };
        
    } catch (error) {
        throw new Error(`Failed to fetch PR information: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function getPromptTemplate(): string {
    try {
        const promptPath = path.join(__dirname, 'prompt.md');
        const promptContent = fs.readFileSync(promptPath, 'utf8');
        return promptContent;
    } catch (error) {
        throw new Error(`Failed to read prompt template: ${error instanceof Error ? error.message : String(error)}`);
    }
}

function createPromptWithPRData(promptTemplate: string, prInfo: PRData): string {
    // Create the PR context object that will be substituted into the prompt
    const prContext = {
        title: prInfo.title,
        description: prInfo.body,
        diff: prInfo.diff,
    };
    
    // Replace the {PULL_REQUEST_CONTEXT} placeholder with actual PR data
    const fullPrompt = promptTemplate.replace(
        '{PULL_REQUEST_CONTEXT}',
        JSON.stringify(prContext, null, 2)
    );
    
    return fullPrompt;
}

async function queryOpenAIAssistant(prompt: string, apiKey: string): Promise<string> {
    try {
        const openAI = new OpenAIUtils(apiKey);
        const assistantID = 'asst_7ZKVOjvodqEzb1wkzWlLYpVf';
        
        core.info('Querying OpenAI assistant...');
        
        const assistantResponse = await openAI.promptAssistant(assistantID, prompt);
        
        if (!assistantResponse) {
            throw new Error('Received empty response from OpenAI assistant');
        }
        
        return assistantResponse;
        
    } catch (error) {
        throw new Error(`Failed to query OpenAI assistant: ${error instanceof Error ? error.message : String(error)}`);
    }
}

async function commentOnPR(prInfo: PRData, response: string): Promise<void> {
    try {
        // Format the response as a nice comment
        const commentBody = `## 🔍 Test Coverage Analysis\n\n${response}`;
        
        // Create comment on the PR
        await GithubUtils.createComment(
            `${prInfo.repo.owner}/${prInfo.repo.name}`,
            prInfo.number,
            commentBody
        );
        
        core.info(`Successfully posted comment on PR #${prInfo.number}`);
        
    } catch (error) {
        throw new Error(`Failed to comment on PR: ${error instanceof Error ? error.message : String(error)}`);
    }
}

run();

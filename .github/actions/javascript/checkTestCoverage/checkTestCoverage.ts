import * as core from '@actions/core';
import {getInput} from '@actions/core';
import CONST from '@github/libs/CONST';
import GithubUtils from '@github/libs/GithubUtils';
import OpenAIUtils from '../../../../scripts/utils/OpenAIUtils';
import sanitizeJSONStringValues from '@github/libs/sanitizeJSONStringValues';
import OpenAI from 'openai';

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

    } catch (error) {
        core.setFailed(error instanceof Error ? error.message : String(error));
    }
}

async function promptAssistant(issueNumber: number): Promise<void> {
    const apiKey = getInput('TESTRAIL_TRYHARD_OPENAI_API_KEY', {required: true});
    const assistantID = 'asst_7ZKVOjvodqEzb1wkzWlLYpVf';
    const openAI = new OpenAIUtils(apiKey);

    const prompt = `aslkdjfalksdjfalksdjfaldj`; // TODO @BEN
    core.info(`Prompt: ${prompt}`);

    const assistantResponse = await openAI.promptAssistant(assistantID, prompt);
    const parsedAssistantResponse = JSON.parse(sanitizeJSONStringValues(assistantResponse)) as AssistantResponse;
    console.log('parsedAssistantResponse: ', parsedAssistantResponse);

    // TODO: Later on we will comment response on the PR
    await commentOnGithubPR(issueNumber, 'NOT ENOUGH TESTS');
}

async function commentOnGithubPR(issueNumber: number, comment: string): Promise<void> {
    await GithubUtils.createComment(CONST.APP_REPO, issueNumber, comment);
}

async function runSomething(): Promise<void> {
    const client = new OpenAI({apiKey: getInput('TESTRAIL_TRYHARD_OPENAI_API_KEY', {required: true})});
    const thread = await client.beta.threads.create();
    
    // 2. Add user message
  await client.beta.threads.messages.create(thread.id, {
        role: "user",
        content: "Can you help me find the right QA test cases for this PR?",
    });

    // 3. Start a run with your Assistant
    const run = await client.beta.threads.runs.create(thread.id, {
        assistant_id: "asst_7ZKVOjvodqEzb1wkzWlLYpVf",
    });

    // 4. Poll until the run completes
    let runStatus;
    while (true) {
        runStatus = await client.beta.threads.runs.retrieve(thread.id, run.id);
        if (runStatus.status === "completed") break;
        await new Promise((res) => setTimeout(res, 1000));
    }

    // 5. Read assistant's reply
    const messages = await client.beta.threads.messages.list(thread.id);
    const lastMessage = messages.data[0];

    console.log(`Assistant: ${lastMessage.content[0].text.value}`);
}

// run();
runSomething();

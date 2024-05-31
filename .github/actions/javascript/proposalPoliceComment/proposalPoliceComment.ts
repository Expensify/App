import {context, getOctokit} from '@actions/github';
import InitOpenAI from 'openai';
import CONST from '@github/libs/CONST';
import type {GitHubType} from '@github/libs/GithubUtils';
import * as OpenAIUtils from '@github/libs/OpenAIUtils';

const OpenAI = new InitOpenAI({apiKey: process.env.OPENAI_API_KEY});

async function processIssueComment(octokit: InstanceType<typeof GitHubType>) {
    const payload = context.payload;
    const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

    // check if the issue is open and the has labels
    if (payload.issue?.state !== 'open' && !payload.issue?.labels.some((issueLabel: {name: string}) => issueLabel.name === CONST.LABELS.HELP_WANTED)) {
        return;
    }

    if (!OPENAI_ASSISTANT_ID) {
        console.error('OPENAI_ASSISTANT_ID missing from the environment variables');
        return;
    }

    if (!payload.comment?.body.trim()) {
        return;
    }
    console.log('Action triggered for comment:', payload.comment?.body);

    let content = '';

    console.log('-> GitHub Action Type: ', payload.action?.toUpperCase());

    if (payload.action === CONST.ACTIONS.CREATED) {
        content = `I NEED HELP WITH CASE (1.), CHECK IF COMMENT IS PROPOSAL AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. Comment content: ${payload.comment?.body}`;
    } else if (payload.action === CONST.ACTIONS.EDIT) {
        content = `I NEED HELP WITH CASE (2.) WHEN A USER THAT POSTED AN INITIAL PROPOSAL OR COMMENT (UNEDITED) THEN EDITS THE COMMENT - WE NEED TO CLASSIFY THE COMMENT BASED IN THE GIVEN INSTRUCTIONS AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "${CONST.NO_ACTION}" IN CASE THE COMMENT IS NOT A PROPOSAL. \n\nPrevious comment content: ${payload.changes.body?.from}.\n\nEdited comment content: ${payload.comment?.body}`;
    }

    if (content === '') {
        console.log('Early return - Comment body content is empty.');
        return;
    }
    console.log('Comment body content for assistant:', content);

    // create thread with first user message and run it
    const createAndRunResponse = await OpenAI.beta.threads.createAndRun({
        /* eslint-disable @typescript-eslint/naming-convention */
        assistant_id: OPENAI_ASSISTANT_ID ?? '',
        thread: {messages: [{role: 'user', content}]},
    });

    if (payload.action === CONST.ACTIONS.CREATED) {
        await OpenAIUtils.prompt({createAndRunResponse, payload, octokit});
    } else if (payload.action === CONST.ACTIONS.EDIT) {
        await OpenAIUtils.promptEdit({createAndRunResponse, payload, octokit});
    }
}

// Main function to process the workflow event
async function run() {
    // @ts-expect-error - process is not imported
    const octokit: InstanceType<typeof GitHubType> = getOctokit(process.env.GITHUB_TOKEN);
    await processIssueComment(octokit);
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});

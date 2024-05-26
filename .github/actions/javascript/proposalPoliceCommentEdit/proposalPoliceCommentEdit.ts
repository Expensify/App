import {context, getOctokit} from '@actions/github';
import InitOpenAI from 'openai';
import CONST from '@github/libs/CONST';
import type {GitHubType} from '@github/libs/GithubUtils';

const OpenAI = new InitOpenAI({apiKey: process.env.OPENAI_API_KEY});

async function processIssueCommentEdit(octokit: InstanceType<typeof GitHubType>) {
    const payload = context.payload;
    const OPENAI_ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

    // check if the issue is open and the has labels
    if (payload.issue?.state !== 'open' && !payload.issue?.labels.some((issueLabel: {name: string}) => issueLabel.name === CONST.LABELS.HELP_WANTED)) {
        return;
    }

    if (!OPENAI_ASSISTANT_ID) {
        console.log('OPENAI_ASSISTANT_ID missing from the environment variables');
        return;
    }

    // You need to adapt this part to fit the Edit Use Case as in the original function
    const content = `I NEED HELP WITH CASE (2.) WHEN A USER THAT POSTED AN INITIAL PROPOSAL OR COMMENT (UNEDITED) THEN EDITS THE COMMENT - WE NEED TO CLASSIFY THE COMMENT BASED IN THE GIVEN INSTRUCTIONS AND IF TEMPLATE IS FOLLOWED AS PER INSTRUCTIONS. IT IS MANDATORY THAT YOU RESPOND ONLY WITH "NO_ACTION" IN CASE THE COMMENT IS NOT A PROPOSAL. \n\nPrevious comment content: ${payload.changes.body?.from}.\n\nEdited comment content: ${payload.comment?.body}`;

    // create thread with first user message and run it
    const createAndRunResponse = await OpenAI.beta.threads.createAndRun({
        /* eslint-disable @typescript-eslint/naming-convention */
        assistant_id: OPENAI_ASSISTANT_ID ?? '',
        thread: {messages: [{role: 'user', content}]},
    });

    // count calls for debug purposes
    let count = 0;
    // poll for run completion
    const intervalID = setInterval(() => {
        OpenAI.beta.threads.runs
            .retrieve(createAndRunResponse.thread_id, createAndRunResponse.id)
            .then((threadRun) => {
                // return if run is not completed yet
                if (threadRun.status !== 'completed') {
                    console.log('issue_comment.edited - run pending completion');
                    return;
                }

                // get assistant response
                OpenAI.beta.threads.messages
                    .list(createAndRunResponse.thread_id)
                    .then((threadMessages) => {
                        // list thread messages content
                        threadMessages.data.forEach((message, index) => {
                            // @ts-expect-error - we do have `text` in content[0] but typescript doesn't know that this is a 'openai' package type issue
                            const assistantResponse = message.content?.[index]?.text?.value;
                            console.log('issue_comment.edited - assistantResponse', assistantResponse);

                            if (!assistantResponse) {
                                return console.log('issue_comment.edited - assistantResponse is empty');
                            }

                            // check if assistant response is either NO_ACTION or "NO_ACTION" strings
                            // as sometimes the assistant response varies
                            const isNoAction = assistantResponse === 'NO_ACTION' || assistantResponse === '"NO_ACTION"';
                            // if assistant response is NO_ACTION or message role is 'user', do nothing
                            if (isNoAction || threadMessages.data?.[index]?.role === 'user') {
                                if (threadMessages.data?.[index]?.role === 'user') {
                                    return;
                                }
                                return console.log('issue_comment.edited - NO_ACTION');
                            }

                            // edit comment if assistant detected substantial changes and if the comment was not edited already by the bot
                            if (assistantResponse.includes('[EDIT_COMMENT]') && !payload.comment?.body.includes('Edited by **proposal-police**')) {
                                // extract the text after [EDIT_COMMENT] from assistantResponse since this is a
                                // bot related action keyword
                                let extractedNotice = assistantResponse.split('[EDIT_COMMENT] ')?.[1]?.replace('"', '');
                                // format the github's updated_at like: 2024-01-24 13:15:24 UTC not 2024-01-28 18:18:28.000 UTC
                                const date = new Date((payload.comment?.updated_at as string) ?? '');
                                const formattedDate = `${date.toISOString()?.split('.')?.[0]?.replace('T', ' ')} UTC`;
                                extractedNotice = extractedNotice.replace('{updated_timestamp}', formattedDate);

                                console.log(`issue_comment.edited - proposal-police edits comment: ${payload.comment?.id}`);
                                octokit.issues.updateComment({
                                    ...context.repo,
                                    /* eslint-disable @typescript-eslint/naming-convention */
                                    comment_id: payload.comment?.id ?? -1,
                                    body: `${extractedNotice}\n\n${payload.comment?.body}`,
                                });
                            }

                            return false;
                        });
                    })
                    .catch((error) => console.log('threads.messages.list - error', error));

                // stop polling
                clearInterval(intervalID);
            })
            .catch((error) => console.log('threads.runs.retrieve - error', error));

        // increment count for every threads.runs.retrieve call
        count++;
        console.log('threads.runs.retrieve - called:', count);
    }, 1500);
}

async function run() {
    // @ts-expect-error - process is not imported
    const octokit: InstanceType<typeof GitHubType> = getOctokit(process.env.GITHUB_TOKEN);
    await processIssueCommentEdit(octokit);
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
